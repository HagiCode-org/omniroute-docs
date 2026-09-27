import { writeFile } from "node:fs/promises";
import { createImportPlan } from "./english-source.mjs";

if (process.argv[2] !== "--reviewed") {
  throw new Error("Review the English docs and translated counterparts first, then pass --reviewed");
}

const plan = await createImportPlan();
const sources = {};
for (const { source, sha256 } of plan.translations.values()) sources[source] = sha256;
const metadata = {
  revision: plan.revision,
  sources: Object.fromEntries(Object.entries(sources).sort(([a], [b]) => a.localeCompare(b))),
  translations: [...plan.translations.keys()].sort(),
};
await writeFile(new URL("../src/content/upstream-translation-reviews.json", import.meta.url),
  `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Recorded ${Object.keys(sources).length} translated English sources and ${metadata.translations.length} translations at ${plan.revision}`);
