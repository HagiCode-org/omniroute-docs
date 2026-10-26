import { readFile, writeFile } from "node:fs/promises";
import { GLOSSARY_URL, checkStructure, protectMarkdown } from "./ollama-translation.mjs";
import { splitBlocks } from "./translate-document-ollama.mjs";

const [sourcePath, translatedPath, upstreamPath, reportPath] = process.argv.slice(2);
if (!sourcePath || !translatedPath) throw new Error("Usage: node scripts/evaluate-translated-document.mjs <source> <translated> [upstream-translation] [report.json]");
const glossary = JSON.parse(await readFile(GLOSSARY_URL, "utf8"));
const source = await readFile(sourcePath, "utf8");
const count = (text, needle) => text.split(needle).length - 1;
const english = (text) => (protectMarkdown(text).visibleText.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/gu) ?? []).length;
const cjk = (text) => (protectMarkdown(text).visibleText.match(/\p{Script=Han}/gu) ?? []).length;

function evaluate(label, text) {
  const visible = protectMarkdown(text).visibleText;
  const sourceVisible = protectMarkdown(source).visibleText;
  const structure = checkStructure(source, text);
  const terms = glossary.terms.map((term) => {
    const spellings = [term.source, ...(term.aliases ?? [])];
    const inSource = spellings.reduce((n, s) => n + (sourceVisible.match(new RegExp(`(?<![\\p{L}\\p{N}_-])${s.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}(?![\\p{L}\\p{N}_-])`, "giu")) ?? []).length, 0);
    return { source: term.source, target: term.target, in_source: inSource, target_in_output: count(visible, term.target),
      avoid_hits: (term.avoid ?? []).reduce((n, bad) => n + count(visible, bad), 0) };
  }).filter((t) => t.in_source > 0);
  // Prose blocks whose translation still carries most English words were effectively not translated.
  const blocks = splitBlocks(text).filter((b) => b.kind === "prose");
  const englishBlocks = blocks.filter((b) => english(b.text) >= 8 && cjk(b.text) < 4).length;
  return { label, structure, structure_ok: Object.values(structure).every(Boolean),
    cjk_characters: cjk(text), english_words_left: english(text), prose_blocks: blocks.length, prose_blocks_still_english: englishBlocks,
    terms, identity_names_kept: terms.filter((t) => t.source === t.target).map((t) => `${t.source}:${t.target_in_output}/${t.in_source}`),
    avoid_hits: terms.filter((t) => t.avoid_hits).map((t) => `${t.target}:${t.avoid_hits}`) };
}
const report = { source_english_words: english(source), results: [evaluate("ours", await readFile(translatedPath, "utf8"))] };
if (upstreamPath) report.results.push(evaluate("upstream", await readFile(upstreamPath, "utf8")));
if (reportPath) await writeFile(reportPath, JSON.stringify(report, null, 2));
for (const r of report.results) {
  console.log(`\n== ${r.label}: structure ${r.structure_ok ? "OK" : "FAIL"} ${JSON.stringify(r.structure)}`);
  console.log(`cjk=${r.cjk_characters} english_left=${r.english_words_left} prose_blocks=${r.prose_blocks} still_english=${r.prose_blocks_still_english}`);
  console.log(`identity kept: ${r.identity_names_kept.join(" ")}`);
  console.log(`avoid hits: ${r.avoid_hits.join(" ") || "none"}`);
  console.log(r.terms.filter((t) => t.source !== t.target).map((t) => `${t.source}->${t.target}: ${t.target_in_output}/${t.in_source}`).join("\n"));
}
