import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { GLOSSARY_URL, protectMarkdown, translateWithOllama } from "./ollama-translation.mjs";

const MAX_WORDS = 300;
const MAX_CHARS = 2400;
const SEEDS = [42, 43, 44];
const wordCount = (text) => (protectMarkdown(text).visibleText.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/gu) ?? []).length;
const badgeLine = /^\s*(?:\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)|!\[[^\]]*\]\([^)]*\)|<img\b[^>]*>)\s*$/u;

// Split into top-level blocks (frontmatter, fenced code, blank-line separated text),
// keeping each block's trailing blank lines so joining restores the original layout.
export function splitBlocks(source) {
  const blocks = [];
  const lines = source.split("\n");
  let current = [];
  let fence = null;
  let blanks = [];
  const flush = (gap) => { if (current.length) blocks.push({ text: current.join("\n"), gap }); current = []; };
  if (lines[0] === "---") {
    const end = lines.indexOf("---", 1);
    if (end > 0) { current = lines.splice(0, end + 1); flush(""); }
  }
  for (const line of lines) {
    const open = /^ {0,3}(`{3,}|~{3,})/u.exec(line);
    if (fence) {
      current.push(line);
      if (open && open[1][0] === fence[0] && open[1].length >= fence.length && /^\s*$/u.test(line.replace(open[0], ""))) fence = null;
      continue;
    }
    if (/^\s*$/u.test(line)) { if (current.length) { flush(""); } blanks.push(line); continue; }
    if (blanks.length && blocks.length) blocks.at(-1).gap = `\n${blanks.join("\n")}\n`;
    else if (blocks.length && !blanks.length && !current.length) blocks.at(-1).gap = "\n";
    blanks = [];
    if (open) fence = open[1];
    current.push(line);
  }
  flush("");
  for (let i = 0; i < blocks.length - 1; i++) blocks[i].gap ||= "\n\n";
  blocks.at(-1).gap = blanks.length ? `\n${blanks.join("\n")}` : "\n";
  return blocks.map((block, index) => ({ ...block, index, kind: kindOf(block.text, index) }));
}

function kindOf(text, index) {
  if (index === 0 && text.startsWith("---\n")) return "frontmatter";
  if (/^ {0,3}(`{3,}|~{3,})/u.test(text)) return "code";
  const lines = text.split("\n");
  if (lines.every((line) => badgeLine.test(line))) return "badges";
  const protectedText = protectMarkdown(text);
  if (!/[A-Za-z]{2,}/u.test(protectedText.visibleText)) return "literal";
  // Mostly markup (flag icons, contributor link lists): nothing worth sending to the model.
  if (protectedText.markers.length > 2 * wordCount(text)) return "mostly_markup";
  return "prose";
}

// A block that is too large is split by rows (tables repeat their header) or lines.
function splitLarge(block) {
  const lines = block.text.split("\n");
  const isTable = lines.length > 2 && lines.every((l) => /^\s*\|/u.test(l));
  const head = isTable ? lines.slice(0, 2) : [];
  const body = isTable ? lines.slice(2) : lines;
  const parts = [];
  let current = [];
  const size = () => [...head, ...current].join("\n");
  for (const line of body) {
    if (current.length && (wordCount(size() + "\n" + line) > MAX_WORDS || size().length + line.length > MAX_CHARS)) {
      parts.push(current); current = [];
    }
    current.push(line);
  }
  if (current.length) parts.push(current);
  return parts.map((rows, i) => ({ text: [...head, ...rows].join("\n"), dropLines: i === 0 ? 0 : head.length, joiner: "\n" }));
}

// Chunks group adjacent prose blocks; every chunk records the blocks it covers.
export function buildChunks(blocks) {
  const chunks = [];
  let open = null;
  const close = () => { if (open) chunks.push(open); open = null; };
  for (const block of blocks) {
    if (block.kind !== "prose") { close(); continue; }
    const words = wordCount(block.text);
    if (words > MAX_WORDS || block.text.length > MAX_CHARS) { close(); chunks.push({ blocks: [block], parts: splitLarge(block) }); continue; }
    if (open && (open.words + words > MAX_WORDS || open.chars + block.text.length > MAX_CHARS)) close();
    open ??= { blocks: [], words: 0, chars: 0 };
    open.blocks.push(block); open.words += words; open.chars += block.text.length;
  }
  close();
  return chunks.map((chunk, id) => ({
    id, blocks: chunk.blocks,
    parts: chunk.parts ?? [{ text: chunk.blocks.map((b) => b.text + b.gap).join("").replace(/\s+$/u, ""), dropLines: 0, joiner: "" }],
  }));
}

// Glossary violations are advisory: a missing target may be a legitimate paraphrase.
export function glossaryViolations(output, terms) {
  const visible = protectMarkdown(output).visibleText;
  const violations = [];
  for (const term of terms) {
    for (const bad of term.avoid ?? []) if (visible.includes(bad)) violations.push({ type: "avoid", source: term.source, found: bad });
    if (!visible.includes(term.target)) violations.push({ type: "missing", source: term.source, expected: term.target });
  }
  return violations;
}

async function translatePart(part, glossary, options, log, label) {
  const attempts = [];
  let best = null;
  for (const seed of SEEDS) {
    let result;
    try {
      result = await translateWithOllama(part.text, { ...options, glossary, seed });
    } catch (error) {
      attempts.push({ seed, error: error.message });
      continue;
    }
    const violations = result.output ? glossaryViolations(result.output, result.terms) : [];
    const record = { seed, accepted_structure: result.accepted_structure, validation_error: result.validation_error ?? null,
      violations, wall_seconds: result.wall_seconds, eval_count: result.response.eval_count };
    attempts.push(record);
    if (result.accepted_structure && (!best || violations.length < best.violations.length)) best = { output: result.output, violations, seed };
    if (result.accepted_structure && !violations.some((v) => v.type === "avoid")) break;
  }
  await log({ type: "part", label, words: wordCount(part.text), source: part.text, attempts, used_seed: best?.seed ?? null, output: best?.output ?? null });
  return best;
}

export async function translateDocument(source, { glossary, options = {}, log = async () => {} } = {}) {
  glossary ??= JSON.parse(await readFile(GLOSSARY_URL, "utf8"));
  const blocks = splitBlocks(source);
  const chunks = buildChunks(blocks);
  const replaced = new Map();
  const stats = { chunks: chunks.length, translated: 0, kept_english: 0, split_fallback: 0, source_words: 0 };
  for (const chunk of chunks) {
    const label = `chunk ${chunk.id + 1}/${chunks.length} (blocks ${chunk.blocks[0].index}-${chunk.blocks.at(-1).index})`;
    let pieces = [];
    for (const part of chunk.parts) {
      let best = await translatePart(part, glossary, options, log, label);
      if (best) { pieces.push({ ...part, text: best.output }); continue; }
      // Fallback: translate the chunk's blocks one by one; keep English if that fails too.
      stats.split_fallback++;
      const singles = part.dropLines || chunk.blocks.length === 1 ? [part] : chunk.blocks.map((b) => ({ text: b.text, dropLines: 0, joiner: "", gap: b.gap }));
      if (singles.length === 1 && singles[0] === part) { stats.kept_english++; pieces.push(part); continue; }
      const out = [];
      for (const single of singles) {
        const result = await translatePart(single, glossary, options, log, `${label} single`);
        if (!result) stats.kept_english++;
        out.push((result?.output ?? single.text) + single.gap);
      }
      pieces = [{ text: out.join("").replace(/\s+$/u, ""), dropLines: 0, joiner: "" }];
    }
    stats.source_words += chunk.parts.reduce((n, p) => n + wordCount(p.text), 0);
    const merged = pieces.map((p, i) => (i === 0 ? p.text : p.text.split("\n").slice(p.dropLines).join("\n"))).join("\n");
    replaced.set(chunk.blocks[0].index, { merged, last: chunk.blocks.at(-1) });
    stats.translated++;
  }
  let skip = new Set();
  let output = "";
  for (const block of blocks) {
    if (skip.has(block.index)) continue;
    const swap = replaced.get(block.index);
    if (swap) { for (let i = block.index; i <= swap.last.index; i++) skip.add(i); output += swap.merged + swap.last.gap; }
    else output += block.text + block.gap;
  }
  return { output, stats, blocks: blocks.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [sourcePath, outDir] = process.argv.slice(2);
  if (!sourcePath || !outDir) throw new Error("Usage: node scripts/translate-document-ollama.mjs <source.md> <out-dir>");
  await mkdir(outDir, { recursive: true });
  const logPath = `${outDir}/translation-log.jsonl`;
  await writeFile(logPath, "", { flag: "wx" });
  const { appendFile } = await import("node:fs/promises");
  const source = await readFile(sourcePath, "utf8");
  const started = performance.now();
  let done = 0;
  const log = async (event) => {
    await appendFile(logPath, `${JSON.stringify(event)}\n`);
    const ok = event.used_seed !== null;
    console.log(`${++done} ${event.label} ${event.words}w ${ok ? `seed ${event.used_seed}` : "KEPT ENGLISH"} attempts=${event.attempts.length}`);
  };
  const result = await translateDocument(source, { log });
  const seconds = Number(((performance.now() - started) / 1000).toFixed(1));
  await writeFile(`${outDir}/README.zh-CN.md`, result.output);
  await writeFile(`${outDir}/summary.json`, JSON.stringify({ source: sourcePath, seconds, ...result.stats, blocks: result.blocks }, null, 2));
  console.log(JSON.stringify({ seconds, ...result.stats }));
}
