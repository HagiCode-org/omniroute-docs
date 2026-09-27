import { LANGUAGE_OPTIONS } from "../src/i18n/site-copy.mjs";
import { readdir } from "node:fs/promises";
import path from "node:path";

// Preserve existing published routes while exposing the full English docs tree.
const ROUTE_OVERRIDES = {
  "README.md": "",
  "docs/getting-started/QUICK-START.md": "getting-started/quick-start",
  "docs/getting-started/SELF_HOST_GUIDE.md": "getting-started/self-hosting",
  "docs/guides/USER_GUIDE.md": "guides/user-guide",
};

export async function discoverTopics(sourceDir) {
  const topics = { "README.md": "" };
  async function walk(directory) {
    for (const entry of await readdir(path.join(sourceDir, directory), { withFileTypes: true })) {
      if (directory === "docs" && entry.name === "i18n") {
        if ((await readdir(path.join(sourceDir, "docs/i18n"))).includes("README.md")) {
          topics["docs/i18n/README.md"] = "i18n";
        }
        continue;
      }
      const relative = path.posix.join(directory, entry.name);
      if (entry.isDirectory()) await walk(relative);
      else if (entry.isFile() && entry.name.endsWith(".md")) {
        const stem = relative.slice("docs/".length, -".md".length).toLowerCase().replaceAll("_", "-");
        const slug = stem === "readme" ? "docs" : stem.replace(/\/readme$/u, "");
        topics[relative] = ROUTE_OVERRIDES[relative] ?? slug;
      }
    }
  }
  await walk("docs");
  return topics;
}

export const UPSTREAM_LOCALES = {
  "zh-CN": "zh-CN",
  "en-US": null,
  "zh-Hant": "zh-TW",
  "ja-JP": "ja",
  "ko-KR": "ko",
  "de-DE": "de",
  "fr-FR": "fr",
  "es-ES": "es",
  "pt-BR": "pt-BR",
  "ru-RU": "ru",
};

if (LANGUAGE_OPTIONS.some(({ code }) => !(code in UPSTREAM_LOCALES))
  || Object.keys(UPSTREAM_LOCALES).length !== LANGUAGE_OPTIONS.length) {
  throw new Error("Upstream locale mapping must match configured site locales");
}

export function translatedSource(source, locale) {
  const upstream = UPSTREAM_LOCALES[locale];
  if (upstream === undefined) throw new RangeError(`Unsupported locale: ${locale}`);
  return upstream === null ? source : `docs/i18n/${upstream}/${source}`;
}
