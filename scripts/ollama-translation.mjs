import { readFile } from "node:fs/promises";

export const GLOSSARY_URL = new URL("../docs/translation-evaluations/terminology.en-zh-CN.json", import.meta.url);
export const OLLAMA_OPTIONS = Object.freeze({
  temperature: 0.7, top_p: 0.6, top_k: 20, repeat_penalty: 1.05,
  num_predict: 4096, num_ctx: 8192, seed: 42,
});

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
const wordPattern = (value) => new RegExp(
  `(?<![\\p{L}\\p{N}_-])${escapeRegExp(value).replace(/\s+/gu, "\\s+")}(?![\\p{L}\\p{N}_-])`, "iu",
);

// Protect the documentation constructs used by this corpus. Restoration rejects
// missing, duplicated or invented markers instead of guessing repairs. Inline
// spans may move with Chinese word order; block and HTML order remains locked.
export function protectMarkdown(source) {
  let prefix = "P";
  while (source.includes(`⟦${prefix}`)) prefix += "P";
  const values = [];
  const hold = (value, kind) => {
    const marker = `⟦${prefix}${String(values.length).padStart(4, "0")}⟧`;
    values.push({ marker, value, kind });
    return marker;
  };
  const keep = (kind) => (value) => hold(value, kind);
  let text = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/u, keep("frontmatter"));

  const opening = /^ {0,3}(`{3,}|~{3,})[^\n]*(?:\n|$)/gmu;
  let match;
  let offset = 0;
  let fenced = "";
  while ((match = opening.exec(text))) {
    const fence = match[1];
    const closing = new RegExp(`^ {0,3}${fence[0]}{${fence.length},}[ \\t]*\\r?$`, "gmu");
    closing.lastIndex = opening.lastIndex;
    const endMatch = closing.exec(text);
    const end = endMatch ? endMatch.index + endMatch[0].length : text.length;
    fenced += text.slice(offset, match.index) + hold(text.slice(match.index, end), "code_block");
    offset = end;
    opening.lastIndex = end;
  }
  text = fenced + text.slice(offset);

  // Inline code permits variable-length backtick delimiters and line breaks.
  let inline = "";
  offset = 0;
  const ticks = /`+/gu;
  while ((match = ticks.exec(text))) {
    const closing = new RegExp(`(?<!\u0060)\u0060{${match[0].length}}(?!\u0060)`, "gu");
    closing.lastIndex = ticks.lastIndex;
    const endMatch = closing.exec(text);
    if (!endMatch) continue;
    const end = endMatch.index + endMatch[0].length;
    inline += text.slice(offset, match.index) + hold(text.slice(match.index, end), "inline_code");
    offset = end;
    ticks.lastIndex = end;
  }
  text = inline + text.slice(offset);
  text = text.replace(/^ {0,3}\[[^\]\n]+\]:[^\n]*$/gmu, keep("reference_definition"));

  // Keep link destinations/titles together, including balanced parentheses.
  let links = "";
  offset = 0;
  for (let start = 0; start < text.length - 1; start++) {
    if (text[start] !== "]" || text[start + 1] !== "(") continue;
    let depth = 1;
    let quote = "";
    let end = start + 2;
    for (; end < text.length; end++) {
      const char = text[end];
      if (char === "\\") { end++; continue; }
      if (quote) { if (char === quote) quote = ""; continue; }
      if ((char === '"' || char === "'") && /\s/u.test(text[end - 1])) { quote = char; continue; }
      if (char === "(") depth++;
      if (char === ")" && --depth === 0) break;
    }
    if (depth !== 0) continue;
    links += text.slice(offset, start + 2) + hold(text.slice(start + 2, end), "link_target");
    offset = end;
    start = end;
  }
  text = links + text.slice(offset);
  text = text.replace(/\]\[[^\]\n]*\]/gu, keep("reference_suffix"));
  text = text.replace(/<!--[\s\S]*?-->|<\/?[A-Za-z][\w:-]*(?:\s+(?:[^<>"']|"[^"]*"|'[^']*')*)?\s*\/?>|<https?:\/\/[^<>\n]+>/gu, keep("html"));
  text = text.replace(/\{\{[^{}\n]+\}\}|\$\{[^{}\n]+\}|%(?:\d+\$)?[sd]|https?:\/\/[^\s<>"'`]+/gu, keep("template_or_url"));

  const markerPattern = new RegExp(`⟦${prefix}\\d+⟧`, "gu");
  // Earlier protection passes may have created markers later in the document.
  const expected = [...text.matchAll(markerPattern)].map(([marker]) => marker);
  const replacements = new Map(values.map(({ marker, value }) => [marker, value]));
  const fixedMarkers = new Set(values.filter(({ kind }) => ["code_block", "frontmatter", "html", "reference_definition"].includes(kind)).map(({ marker }) => marker));
  return {
    text,
    markers: values,
    visibleText: text.replace(markerPattern, " "),
    restore(output) {
      const actual = [...output.matchAll(markerPattern)].map(([marker]) => marker);
      if (JSON.stringify([...actual].sort()) !== JSON.stringify([...expected].sort())
        || JSON.stringify(actual.filter((m) => fixedMarkers.has(m))) !== JSON.stringify(expected.filter((m) => fixedMarkers.has(m)))) {
        throw new Error("Protected markers missing, duplicated, unknown or block order changed");
      }
      return output.replace(markerPattern, (marker) => replacements.get(marker));
    },
  };
}

export function selectTerms(source, glossary) {
  const visible = protectMarkdown(source).visibleText;
  const selected = [];
  for (const term of glossary.terms) {
    if (term.contextAny && !term.contextAny.some((context) => wordPattern(context).test(visible))) continue;
    for (const spelling of [term.source, ...(term.aliases ?? [])]) {
      if (wordPattern(spelling).test(visible)) selected.push({ source: spelling, target: term.target, ...(term.background ? { background: term.background } : {}) });
    }
  }
  return selected.sort((a, b) => b.source.length - a.source.length || a.source.localeCompare(b.source));
}

export function buildPrompt(source, { glossary, terminology = true, protect = true, background = true, language = "zh" } = {}) {
  const protectedText = protect ? protectMarkdown(source) : null;
  const terms = terminology ? selectTerms(source, glossary) : [];
  const english = language === "en";
  const parts = [];
  const contexts = background ? [...new Set(terms.map((t) => t.background).filter(Boolean))] : [];
  if (contexts.length) parts.push(`${english ? "[Background Information]" : "【背景信息】"}\n${contexts.join("\n")}`);
  if (terms.length) parts.push(english
    ? `Reference the following translations:\n${terms.map((t) => `${t.source} translates to ${t.target}`).join("\n")}`
    : `参考下面的翻译：\n${terms.map((t) => `${t.source} 翻译成 ${t.target}`).join("\n")}`);
  if (protect) parts.push(english
    ? "Preserve the Markdown structure. Retain each delimiter like ⟦P0000⟧ exactly once; do not omit, duplicate, escape or translate it. Inline delimiters may follow translated word order. Keep standalone blocks and HTML tags in their original order."
    : "保留原有 Markdown 结构。形如 ⟦P0000⟧ 的分隔符必须逐字出现一次，不得遗漏、复制、转义或翻译。行内分隔符可以按译文语序调整位置，独立代码块和 HTML 标签保持原顺序。");
  parts.push(english
    ? `Translate the following text into Simplified Chinese. Note that you ${terms.length ? "must ONLY" : "should only"} output the translated result without any additional explanation:`
    : "将以下文本翻译为 简体中文，注意只需要输出翻译后的结果，不要额外解释：");
  parts.push(protectedText?.text ?? source);
  return { prompt: parts.join("\n\n"), terms, protectedText };
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const valuesOf = (text, kinds) => protectMarkdown(text).markers
  .filter(({ kind }) => kinds.includes(kind)).map(({ value }) => value);
const headings = (text) => [...protectMarkdown(text).text.matchAll(/^ {0,3}(#{1,6})\s/gmu)].map((m) => m[1].length);
const tables = (text) => protectMarkdown(text).text.split("\n").filter((l) => /^\s*\|/u.test(l)).map((l) => (l.match(/(?<!\\)\|/gu) ?? []).length);
const frontmatter = (text) => text.match(/^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/u)?.[0] ?? "";
export function checkStructure(source, output) {
  return {
    fenced_code_exact: same(valuesOf(source, ["code_block"]), valuesOf(output, ["code_block"])),
    inline_code_exact: same(valuesOf(source, ["inline_code"]).sort(), valuesOf(output, ["inline_code"]).sort()),
    link_and_placeholder_targets_exact: same(valuesOf(source, ["link_target", "reference_definition", "reference_suffix", "template_or_url"]), valuesOf(output, ["link_target", "reference_definition", "reference_suffix", "template_or_url"])),
    html_tags_exact: same(valuesOf(source, ["html"]), valuesOf(output, ["html"])),
    heading_levels_exact: same(headings(source), headings(output)),
    table_shape_exact: same(tables(source), tables(output)),
    frontmatter_exact: frontmatter(source) === frontmatter(output),
  };
}

export async function translateWithOllama(source, {
  glossary, terminology = true, protect = true, background = true, language = "zh",
  endpoint = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434",
  model = "hy-mt2:1.8b", fetchImpl = fetch,
} = {}) {
  glossary ??= JSON.parse(await readFile(GLOSSARY_URL, "utf8"));
  endpoint = (endpoint.includes("://") ? endpoint : `http://${endpoint}`).replace(/\/$/u, "");
  const prepared = buildPrompt(source, { glossary, terminology, protect, background, language });
  const request = { model, messages: [{ role: "user", content: prepared.prompt }], stream: false, options: { ...OLLAMA_OPTIONS } };
  const start = performance.now();
  const response = await fetchImpl(`${endpoint}/api/chat`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request), signal: AbortSignal.timeout(180_000),
  });
  if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
  const raw = await response.json();
  if (!raw.done || raw.done_reason !== "stop" || typeof raw.message?.content !== "string" || !raw.message.content.trim()) {
    throw new Error(`Incomplete Ollama translation: ${raw.done_reason ?? "invalid response"}`);
  }
  const result = {
    request, response: raw, terms: prepared.terms,
    protected_markers: prepared.protectedText?.markers ?? [],
    wall_seconds: Number(((performance.now() - start) / 1000).toFixed(3)),
  };
  try {
    result.output = prepared.protectedText ? prepared.protectedText.restore(raw.message.content) : raw.message.content;
    result.checks = checkStructure(source, result.output);
    result.accepted_structure = Object.values(result.checks).every(Boolean);
    if (protect && !result.accepted_structure) result.validation_error = "Markdown structure changed";
  } catch (error) {
    result.output = null;
    result.accepted_structure = false;
    result.validation_error = error.message;
  }
  // accepted_structure is a formatting gate, never a semantic quality verdict.
  return result;
}
