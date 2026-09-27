import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkTranslationBaselines, importEnglishDocs } from "../scripts/english-source.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "omniroute-content-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const sourceDir = path.join(root, "source");
  const contentRoot = path.join(root, "docs");
  const outputDir = path.join(contentRoot, "en-US");
  const assetsDir = path.join(root, "assets");
  await mkdir(sourceDir);
  await mkdir(contentRoot);
  await writeFile(path.join(sourceDir, "README.md"), "# OmniRoute Documentation\n\n[Guide](./guide.md)\n");
  const options = { sourceDir, outputDir, assetsDir, locales: ["en-US", "fr-FR"] };
  return { root, sourceDir, contentRoot, outputDir, assetsDir, options };
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

test("import resolves nested links/assets and leaves authored translations intact", async (t) => {
  const { sourceDir, contentRoot, outputDir, assetsDir, options } = await fixture(t);
  await mkdir(path.join(sourceDir, "nested"));
  await mkdir(path.join(sourceDir, "img"));
  await writeFile(path.join(sourceDir, "img", "icon.svg"), "<svg xmlns=\"http://www.w3.org/2000/svg\"/>");
  await writeFile(path.join(sourceDir, "guide.md"), '# Guide\n\n[Next](./nested/user-guide.md#example) ![Icon](./img/icon.svg)\n');
  await writeFile(path.join(sourceDir, "nested/user-guide.md"), '# User guide\n\n[Home](../README.md)\n');
  await mkdir(path.join(contentRoot, "fr-FR"));
  await writeFile(path.join(contentRoot, "fr-FR", "guide.md"), "---\ntitle: Guide traduit\n---\n\nTexte local.\n");

  await importEnglishDocs(options);
  const guide = await readFile(path.join(outputDir, "guide.md"), "utf8");
  assert.ok(guide.includes("/en-US/nested/user-guide/#example"));
  assert.ok(guide.includes("/en-US/assets/img/icon.svg"));
  assert.ok((await readFile(path.join(outputDir, "nested/user-guide.md"), "utf8")).includes("/en-US/"));
  assert.ok(await exists(path.join(assetsDir, "img/icon.svg")));
  assert.ok((await readFile(path.join(contentRoot, "fr-FR/guide.md"), "utf8")).includes("Texte local."));
  assert.ok((await readFile(path.join(contentRoot, "fr-FR/nested/user-guide.md"), "utf8")).includes("isEnglishFallback: true"));

  await rm(path.join(sourceDir, "nested/user-guide.md"));
  await writeFile(path.join(sourceDir, "guide.md"), "# Guide\n\n![Icon](./img/icon.svg)\n");
  await importEnglishDocs(options);
  assert.equal(await exists(path.join(outputDir, "nested/user-guide.md")), false);
  assert.equal(await exists(path.join(contentRoot, "fr-FR/nested/user-guide.md")), false);
  assert.ok((await readFile(path.join(contentRoot, "fr-FR/guide.md"), "utf8")).includes("Texte local."));
});

test("edited generated fallback is preserved when source topic is removed", async (t) => {
  const { sourceDir, contentRoot, options } = await fixture(t);
  await writeFile(path.join(sourceDir, "guide.md"), "# Guide\n\nExample\n");
  await importEnglishDocs(options);
  const fallback = path.join(contentRoot, "fr-FR/guide.md");
  await writeFile(fallback, "---\ntitle: Guide traduit\n---\n\nContenu local.\n");
  await writeFile(path.join(sourceDir, "README.md"), "# OmniRoute Documentation\n");
  await rm(path.join(sourceDir, "guide.md"));
  await importEnglishDocs(options);
  assert.ok((await readFile(fallback, "utf8")).includes("Contenu local."));
});

test("missing source, unsupported syntax, broken links, and missing assets fail without stale output", async (t) => {
  const { sourceDir, outputDir, contentRoot, options } = await fixture(t);
  await writeFile(path.join(sourceDir, "guide.md"), "# Guide\n\nOkay\n");
  await importEnglishDocs(options);
  for (const [body, pattern] of [
    ["# Guide\n\n[Missing](./missing.md)\n", /Broken or unsupported Markdown link/u],
    ["# Guide\n\n![Missing](./absent.svg)\n", /Missing local asset/u],
    ["# Guide\n\nimport Widget from './Widget.astro'\n", /MDX imports\/exports/u],
    ["# Guide\n\n<Widget />\n", /MDX components/u],
  ]) {
    await writeFile(path.join(sourceDir, "guide.md"), body);
    await assert.rejects(importEnglishDocs(options), pattern);
    assert.equal(await exists(path.join(outputDir, "guide.md")), false);
    assert.equal(await exists(path.join(contentRoot, "fr-FR/guide.md")), false);
  }
  await rm(sourceDir, { recursive: true, force: true });
  await assert.rejects(importEnglishDocs(options), /English source is missing/u);
  assert.equal(await exists(path.join(outputDir, "index.md")), false);
});

test("baseline audit catches missing and changed sources but excludes generated fallbacks and homes", async (t) => {
  const { root, sourceDir, contentRoot, options } = await fixture(t);
  const english = "# Guide\n\nExample\n";
  await writeFile(path.join(sourceDir, "guide.md"), english);
  await importEnglishDocs(options);
  await mkdir(path.join(contentRoot, "zh-CN"));
  await writeFile(path.join(contentRoot, "zh-CN/index.mdx"), "---\ntitle: 首页\n---\n\n首页\n");
  await writeFile(path.join(contentRoot, "zh-CN/guide.md"), "---\ntitle: 指南\n---\n\n指南\n");
  const manifestPath = path.join(root, "baselines.json");
  const audit = () => checkTranslationBaselines({ sourceDir, contentRoot, manifestPath });
  await writeFile(manifestPath, "{}");
  await assert.rejects(audit(), /zh-CN\/guide: translation has no reviewed/u);
  await writeFile(manifestPath, JSON.stringify({
    "zh-CN": { guide: { source: "guide.md", sha256: createHash("sha256").update(english).digest("hex"), revision: "site-owned" } },
  }));
  assert.equal((await audit()).checkedTranslations, 1);
  await writeFile(path.join(sourceDir, "guide.md"), `${english}Updated\n`);
  await assert.rejects(audit(), /zh-CN\/guide: English source changed/u);
  await rm(path.join(sourceDir, "guide.md"));
  await assert.rejects(audit(), /zh-CN\/guide: English source/u);
});
