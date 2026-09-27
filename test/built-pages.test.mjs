import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { SITE_COPY, LANGUAGE_OPTIONS } from "../src/i18n/site-copy.mjs";

async function page(route) {
  return readFile(new URL(`../dist/${route}index.html`, import.meta.url), "utf8");
}

test("all ten locale homes and 26 topic routes per locale are built under OmniRoute canonicals", async () => {
  const english = await readdir(new URL("../dist/en-US/", import.meta.url), { recursive: true });
  assert.equal(english.filter((file) => file.endsWith("index.html")).length, 27);
  for (const { code } of LANGUAGE_OPTIONS) {
    const home = await page(`${code}/`);
    assert.ok(home.includes(`<html lang="${code}"`));
    assert.ok(home.includes(`https://omniroute.hagicode.com/${code}/`));
    assert.ok(home.includes(SITE_COPY[code].languageLabel));
    const topic = await page(`${code}/getting-started/`);
    assert.ok(topic.includes('data-hagicode-end-card'));
    assert.ok(topic.includes('data-hagicode-promotion'));
    assert.ok(topic.includes(`/${code}/stores-beta/user-guide/`), `nested topic is navigable from ${code}`);
    await stat(new URL(`../dist/${code}/stores-beta/user-guide/index.html`, import.meta.url));
  }
});

test("authored Chinese topics and marked English fallback differ", async () => {
  const zh = await page("zh-CN/getting-started/");
  const ja = await page("ja-JP/getting-started/");
  const en = await page("en-US/getting-started/");
  assert.ok(zh.includes('https://omniroute.hagicode.com/zh-CN/getting-started/'));
  assert.ok(en.includes('https://omniroute.hagicode.com/en-US/getting-started/'));
  assert.doesNotMatch(zh, /english-fallback-notice/u);
  assert.ok(ja.includes(SITE_COPY["ja-JP"].englishFallbackNotice));
  assert.ok(ja.includes('href="/en-US/getting-started/"'));
  assert.ok(ja.includes('lang="en-US"'));
  assert.ok(ja.includes('https://omniroute.hagicode.com/en-US/getting-started/'));
});

test("root entry and responsive site shell preserve required interactions and links", async () => {
  const root = await page("");
  const html = await page("en-US/getting-started/");
  assert.ok(root.includes('href="/en-US/"'));
  assert.ok(root.includes("OmniRoute"));
  for (const url of [
    "https://www.hagicode.com/", "https://docs.hagicode.com/en-US/",
    "https://tasks.hagicode.com/", "https://github.com/HagiCode-org/omniroute-docs",
    "https://github.com/HagiCode-org/omniroute-docs/issues",
  ]) assert.ok(html.includes(url), `${url} link exists`);
  for (const { code } of LANGUAGE_OPTIONS) assert.ok(html.includes(`href="/${code}/"`));
  assert.match(html, /<site-search/u);
  assert.match(html, /<starlight-theme-select/u);
  assert.match(html, /data-language-chooser/u);
  assert.match(html, /data-promotion-dismiss/u);
  assert.match(html, /data-hagicode-feature/u);
  assert.ok(!html.includes("openspec.hagicode.com"));
  assert.ok(!html.includes("data-openspec-analytics"));
  const image = await readFile(new URL("../dist/img/hagicode/light-main.png", import.meta.url));
  assert.ok(image.length > 0);
});

test("local article links resolve to built pages", async () => {
  const english = await readdir(new URL("../dist/en-US/", import.meta.url), { recursive: true });
  const missing = [];
  for (const file of english.filter((name) => name.endsWith("index.html"))) {
    const html = await readFile(new URL(`../dist/en-US/${file}`, import.meta.url), "utf8");
    const article = html.match(/<main[\s\S]*?<\/main>/u)?.[0] ?? "";
    for (const [, href] of article.matchAll(/href="([^"]+)"/gu)) {
      const target = new URL(href.replaceAll("&amp;", "&"), `https://omniroute.hagicode.com/en-US/${file.replace(/index\.html$/u, "")}`);
      if (target.origin !== "https://omniroute.hagicode.com") continue;
      const pathname = decodeURIComponent(target.pathname).replace(/^\/+/u, "");
      const relative = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
      try {
        await stat(new URL(`../dist/${path.posix.normalize(relative)}`, import.meta.url));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        missing.push(`${file}: ${href}`);
      }
    }
  }
  assert.deepEqual(missing, []);
});
