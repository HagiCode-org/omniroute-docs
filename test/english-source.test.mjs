import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkTranslationBaselines, createImportPlan, importEnglishDocs } from "../scripts/english-source.mjs";
import { translatedSource, UPSTREAM_LOCALES } from "../scripts/upstream-topics.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "omniroute-import-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const sourceDir = path.join(root, "vendor");
  const contentRoot = path.join(root, "content");
  const assetsDir = path.join(root, "assets");
  await mkdir(path.join(sourceDir, "docs/guides"), { recursive: true });
  await mkdir(contentRoot);
  await writeFile(path.join(sourceDir, "README.md"), "# OmniRoute\n\n[Guide](docs/guides/GUIDE.md#setup)\n");
  await writeFile(path.join(sourceDir, "docs/guides/GUIDE.md"), "# Guide\n\n[Home](../../README.md) ![Icon](../../icon.svg)\n");
  await writeFile(path.join(sourceDir, "icon.svg"), "<svg/>");
  const topics = { "README.md": "", "docs/guides/GUIDE.md": "guides/guide" };
  const options = { sourceDir, contentRoot, assetsDir, topics, locales: ["en-US", "zh-Hant", "fr-FR"], revision: "pinned" };
  return { root, sourceDir, contentRoot, assetsDir, options };
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

test("ten-site-locale mapping and translated home paths are exact", () => {
  assert.deepEqual(Object.keys(UPSTREAM_LOCALES), [
    "zh-CN", "en-US", "zh-Hant", "ja-JP", "ko-KR", "de-DE", "fr-FR", "es-ES", "pt-BR", "ru-RU",
  ]);
  assert.equal(translatedSource("README.md", "en-US"), "README.md");
  assert.equal(translatedSource("README.md", "zh-Hant"), "docs/i18n/zh-TW/README.md");
  assert.equal(translatedSource("docs/guides/GUIDE.md", "zh-Hant"), "docs/i18n/zh-TW/docs/guides/GUIDE.md");
  assert.throws(() => translatedSource("README.md", "it-IT"), RangeError);
});

test("discovers English docs recursively without publishing other-language trees", async (t) => {
  const { sourceDir, options } = await fixture(t);
  await writeFile(path.join(sourceDir, "docs/README.md"), "# Docs index\n");
  await writeFile(path.join(sourceDir, "docs/guides/ANOTHER_GUIDE.md"), "# More docs\n");
  await mkdir(path.join(sourceDir, "docs/i18n/zh-CN"), { recursive: true });
  await writeFile(path.join(sourceDir, "docs/i18n/README.md"), "# Translation index\n");
  await writeFile(path.join(sourceDir, "docs/i18n/zh-CN/README.md"), "# 翻译\n");
  const plan = await createImportPlan({ ...options, topics: undefined });
  assert.ok(plan.documents.has("en-US/guides/another-guide/index.md"));
  assert.ok(plan.documents.has("en-US/i18n/index.md"));
  assert.ok(plan.documents.has("en-US/index.md"));
  assert.ok(!plan.documents.has("en-US/i18n/zh-cn/index.md"));
});

test("translated pages and homes link to selected routes; missing pages are marked fallbacks", async (t) => {
  const { sourceDir, contentRoot, assetsDir, options } = await fixture(t);
  const translatedHome = path.join(sourceDir, "docs/i18n/zh-TW/README.md");
  const translatedGuide = path.join(sourceDir, "docs/i18n/zh-TW/docs/guides/GUIDE.md");
  await mkdir(path.dirname(translatedGuide), { recursive: true });
  await writeFile(translatedHome, "# 繁體首頁\n\n[指南](docs/guides/GUIDE.md)\n");
  await writeFile(translatedGuide, "# 繁體指南\n\n![圖示](../../../../../icon.svg)\n");
  await importEnglishDocs(options);
  const home = await readFile(path.join(contentRoot, "zh-Hant/index.md"), "utf8");
  const guide = await readFile(path.join(contentRoot, "zh-Hant/guides/guide/index.md"), "utf8");
  const fallback = await readFile(path.join(contentRoot, "fr-FR/guides/guide/index.md"), "utf8");
  assert.match(home, /繁體首頁/u);
  assert.match(home, /\/zh-Hant\/guides\/guide\//u);
  assert.match(guide, /繁體指南/u);
  assert.match(guide, /\/upstream-assets\/zh-Hant\/icon\.svg/u);
  assert.doesNotMatch(guide, /isEnglishFallback/u);
  assert.match(fallback, /isEnglishFallback: true/u);
  assert.match(fallback, /\[Home\]\(\/fr-FR\/\)/u);
  assert.ok(await exists(path.join(assetsDir, "zh-Hant/icon.svg")));
  assert.ok((await createImportPlan(options)).translations.has("zh-Hant/docs/guides/GUIDE.md"));

  const manifestPath = path.join(options.contentRoot, "reviews.json");
  const sourceHash = (file) => createHash("sha256").update(file).digest("hex");
  await writeFile(manifestPath, JSON.stringify({
    revision: "pinned",
    sources: {
      "README.md": sourceHash(await readFile(path.join(sourceDir, "README.md"))),
      "docs/guides/GUIDE.md": sourceHash(await readFile(path.join(sourceDir, "docs/guides/GUIDE.md"))),
    },
    translations: ["zh-Hant/README.md", "zh-Hant/docs/guides/GUIDE.md"],
  }));
  const audit = () => checkTranslationBaselines({ ...options, manifestPath });
  assert.equal((await audit()).checkedTranslations, 2);
  await writeFile(path.join(sourceDir, "docs/guides/GUIDE.md"), "# Changed\n");
  await assert.rejects(audit(), /English source changed/u);
  await rm(path.join(sourceDir, "docs/guides/GUIDE.md"));
  await assert.rejects(audit(), /Selected English source is missing/u);
});

test("re-import removes stale pages, preserves user edits and rejects overlapping content", async (t) => {
  const { sourceDir, contentRoot, options } = await fixture(t);
  await importEnglishDocs(options);
  const oldPage = path.join(contentRoot, "fr-FR/guides/guide/index.md");
  await importEnglishDocs({ ...options, topics: { "README.md": "" } });
  assert.equal(await exists(oldPage), false);
  await writeFile(path.join(contentRoot, "fr-FR/index.md"), "A reviewed local page");
  await assert.rejects(importEnglishDocs(options), /Preserving non-generated or edited content/u);
  assert.equal(await readFile(path.join(contentRoot, "fr-FR/index.md"), "utf8"), "A reviewed local page");
  await rm(path.join(contentRoot, "fr-FR/index.md"));
  await writeFile(path.join(contentRoot, "fr-FR/guides/guide/index.md"), "Authored topic");
  await assert.rejects(importEnglishDocs(options), /Preserving non-generated or edited content/u);
  await rm(sourceDir, { recursive: true });
  await assert.rejects(importEnglishDocs(options), /git submodule update --init vendor\/OmniRoute/u);
  assert.equal(await exists(path.join(contentRoot, "en-US/index.md")), false);
});

test("broken links, missing assets, unsupported markup and missing selected sources fail", async (t) => {
  const { sourceDir, contentRoot, options } = await fixture(t);
  const guide = path.join(sourceDir, "docs/guides/GUIDE.md");
  await importEnglishDocs(options);
  for (const [body, error] of [
    ["# Guide\n[Broken](missing.md)\n", /Missing local reference/u],
    ["# Guide\n![Broken](absent.svg)\n", /Missing local reference/u],
    ["# Guide\n<Widget />\n", /Unsupported HTML or MDX element/u],
    ["# Guide\n<a href=\"javascript:alert(1)\">Bad</a>\n", /Unsupported URL scheme/u],
    ["# Guide\n<img src=\"icon.svg\" onload=\"alert(1)\" />\n", /HTML event handlers are not supported/u],
    ["# Guide\n<img src=icon.svg />\n", /Unquoted HTML links are not supported/u],
    ["# Guide\nimport Widget from './Widget.astro'\n", /MDX imports\/exports/u],
    ['---\ntitle: "broken\n---\n# Guide\n', /Malformed title in docs\/guides\/GUIDE\.md/u],
  ]) {
    await writeFile(guide, body);
    await assert.rejects(importEnglishDocs(options), error);
    assert.equal(await exists(path.join(contentRoot, "en-US/index.md")), false);
  }
  await rm(guide);
  await assert.rejects(importEnglishDocs(options), /Selected English source is missing/u);
});

test("linked source files stay upstream; only media files are copied into public", async (t) => {
  const { sourceDir, assetsDir, options } = await fixture(t);
  await writeFile(path.join(sourceDir, "secrets.env"), "NOT_FOR_PUBLICATION=1");
  await writeFile(path.join(sourceDir, "docs/guides/GUIDE.md"),
    "# Guide\n\n[Config](../../secrets.env) ![Icon](../../icon.svg)\n");
  const plan = await importEnglishDocs(options);
  const page = plan.documents.get("en-US/guides/guide/index.md").rendered;
  assert.match(page, /github.com\/diegosouzapw\/OmniRoute\/blob\/pinned\/secrets.env/u);
  assert.ok(!await exists(path.join(assetsDir, "en-US/secrets.env")));
  assert.ok(await exists(path.join(assetsDir, "en-US/icon.svg")));
});
