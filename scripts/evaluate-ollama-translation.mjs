import { createHash } from "node:crypto";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { GLOSSARY_URL, OLLAMA_OPTIONS, protectMarkdown, translateWithOllama } from "./ollama-translation.mjs";
import { createImportPlan } from "./english-source.mjs";

const root = new URL("../", import.meta.url);
const startedAt = new Date().toISOString();
const logUrl = new URL(`docs/translation-evaluations/ollama-improved-${startedAt.replace(/[:.]/gu, "-")}.jsonl`, root);
await writeFile(logUrl, "", { flag: "wx" });
async function emit(event) {
  await appendFile(logUrl, `${JSON.stringify(event)}\n`);
  console.log(event.type === "run"
    ? `${event.sample_id} ${event.variant}: ${event.accepted_structure ? "structure OK" : "REVIEW"}`
    : JSON.stringify({ type: event.type, log: fileURLToPath(logUrl), counts: event.counts }));
}
const baseline = JSON.parse(await readFile(new URL("docs/translation-evaluations/ollama-en-zh-cn-2026-10-25.json", root), "utf8"));
const glossary = JSON.parse(await readFile(GLOSSARY_URL, "utf8"));
const revision = execFileSync("git", ["-C", fileURLToPath(new URL("vendor/OmniRoute", root)), "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (revision !== baseline.source_revision) throw new Error("Upstream revision changed; review evaluation sources first");
const samples = baseline.samples.map(({ id, source_path, source_lines, source_sha256, source }) => ({
  id, source_path, source_lines, source_sha256, source, split: "development",
}));
for (const [id, relative] of [
  ["holdout_quota", "docs/OMNIROUTE_QUOTA_TELEMETRY.md"],
  ["holdout_self_hosted", "docs/routing/SELF_HOSTED_OPENAI_ENTRY.md"],
]) {
  const source_path = `vendor/OmniRoute/${relative}`;
  const source = await readFile(new URL(source_path, root), "utf8");
  samples.push({ id, source_path, source_lines: [1, source.trimEnd().split("\n").length], source,
    source_sha256: createHash("sha256").update(source).digest("hex"), split: "holdout" });
}
for (const sample of samples.filter((sample) => sample.split === "development")) {
  const file = await readFile(new URL(sample.source_path, root), "utf8");
  const [start, end] = sample.source_lines;
  const current = file.split(/\r?\n/u).slice(start - 1, end).join("\n");
  if (current !== sample.source || createHash("sha256").update(current).digest("hex") !== sample.source_sha256) {
    throw new Error(`Evaluation source changed: ${sample.id}`);
  }
}
const endpoint = (process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434").replace(/\/$/u, "");
const base = endpoint.includes("://") ? endpoint : `http://${endpoint}`;
const metadata = await Promise.all(["version", "tags"].map(async (route) => {
  const response = await fetch(`${base}/api/${route}`, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Cannot read Ollama ${route}: ${response.status}`);
  return response.json();
}));
const variants = {
  official_default_zh: { terminology: false, protect: false, background: false },
  official_terminology_zh: { terminology: true, protect: false, background: false },
  protected_contextual_zh: { terminology: true, protect: true, background: true },
};
const plan = await createImportPlan({ locales: ["en-US"] });
const corpus = [];
for (const [output_path, document] of plan.documents) {
  const visible = protectMarkdown(document.rendered).visibleText;
  const title = document.rendered.match(/^title: (.+)$/mu)?.[1] ?? "";
  const words = (`${title}\n${visible}`).match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/gu) ?? [];
  corpus.push({ source_path: document.source, output_path, english_prose_words: words.length,
    markdown_characters: document.rendered.length });
}
await emit({ type: "metadata", started_at: startedAt, source_revision: revision,
  model: "hy-mt2:1.8b", endpoint: base, ollama: metadata, options: OLLAMA_OPTIONS, glossary, variants, samples,
  corpus: { page_count: corpus.length, english_prose_words: corpus.reduce((n, p) => n + p.english_prose_words, 0),
    markdown_characters: corpus.reduce((n, p) => n + p.markdown_characters, 0), pages: corpus } });
const counts = {};
for (const sample of samples) {
  for (const [variant, settings] of Object.entries(variants)) {
    let result;
    try {
      result = await translateWithOllama(sample.source, { ...settings, glossary, endpoint: base });
    } catch (error) {
      result = { output: null, accepted_structure: false, error: error.message };
    }
    counts[variant] ??= { completed: 0, accepted_structure: 0, errors: 0 };
    counts[variant].completed++;
    counts[variant].accepted_structure += Number(result.accepted_structure);
    counts[variant].errors += Number(Boolean(result.error));
    await emit({ type: "run", sample_id: sample.id, variant, ...result });
  }
}
await emit({ type: "summary", completed_at: new Date().toISOString(), counts });
if (Object.values(counts).some(({ errors }) => errors)) process.exitCode = 1;
