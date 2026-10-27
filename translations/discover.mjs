// Read-only source discovery for the doc-translation skill (contract: references/profile-spec.md in the skill).
// Prints one NDJSON line per English document that the site publishes:
//   {"doc":"docs/guides/X.md","bytes":123,"sha256":"…","external":false}
// `external` is true when the pinned upstream already ships a translation for --locale.
// Run from the repository root: node translations/discover.mjs --locale zh-CN
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { discoverTopics, translatedSource } from "../scripts/upstream-topics.mjs";

const flag = process.argv.indexOf("--locale");
const locale = flag > -1 ? process.argv[flag + 1] : undefined;
if (!locale) {
  console.error("usage: node translations/discover.mjs --locale <site-locale>");
  process.exit(2);
}
const root = path.resolve(import.meta.dirname, "../vendor/OmniRoute");
if (!existsSync(path.join(root, "README.md"))) {
  console.error(`OmniRoute checkout missing at ${root}; run git submodule update --init vendor/OmniRoute`);
  process.exit(1);
}
for (const doc of Object.keys(await discoverTopics(root)).sort()) {
  const text = readFileSync(path.join(root, doc), "utf8");
  console.log(JSON.stringify({
    doc,
    bytes: Buffer.byteLength(text),
    sha256: createHash("sha256").update(text).digest("hex"),
    external: existsSync(path.join(root, translatedSource(doc, locale))),
  }));
}
