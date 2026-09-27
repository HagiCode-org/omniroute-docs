import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { SITE_COPY, LANGUAGE_OPTIONS } from "../src/i18n/site-copy.mjs";
import { discoverTopics } from "../scripts/upstream-topics.mjs";

const page = (route) => readFile(new URL(`../dist/${route}index.html`, import.meta.url), "utf8");

test("every English upstream docs page and locale counterpart is built", async () => {
  const topics = await discoverTopics(new URL("../vendor/OmniRoute", import.meta.url).pathname);
  const english = await readdir(new URL("../dist/en-US/", import.meta.url), { recursive: true });
  assert.ok(Object.keys(topics).length >= 164);
  assert.equal(english.filter((file) => file.endsWith("index.html")).length, Object.keys(topics).length);
  for (const { code } of LANGUAGE_OPTIONS) {
    const home = await page(`${code}/`);
    assert.ok(home.includes(`<html lang="${code}"`));
    assert.ok(home.includes(`https://omniroute.hagicode.com/${code}/`));
    assert.ok(home.includes(SITE_COPY[code].languageLabel));
    assert.match(home, /OmniRoute/u);
    const sidebar = home.match(/<nav class="sidebar [\s\S]*?<\/nav>/u)?.[0];
    assert.ok(sidebar, `${code} has a sidebar`);
    for (const slug of Object.values(topics).filter(Boolean)) {
      assert.ok(sidebar.includes(`href="/${code}/${slug}/"`), `${code} sidebar links ${slug}`);
      const topic = await page(`${code}/${slug}/`);
      assert.ok(topic.includes('data-hagicode-end-card'));
      assert.ok(topic.includes('data-hagicode-promotion'));
      assert.ok(topic.includes(`https://omniroute.hagicode.com/${code}/${slug}/`));
    }
    await assert.rejects(stat(new URL(`../dist/${code}/stores-beta/user-guide/index.html`, import.meta.url)), { code: "ENOENT" });
    await assert.rejects(stat(new URL(`../dist/${code}/installation/index.html`, import.meta.url)), { code: "ENOENT" });
  }
});

test("real translations and locale homes contrast with honest English fallbacks", async () => {
  const zh = await page("zh-CN/getting-started/quick-start/");
  const traditional = await page("zh-Hant/getting-started/quick-start/");
  const en = await page("en-US/getting-started/quick-start/");
  const fallback = await page("ja-JP/getting-started/self-hosting/");
  assert.match(zh, /安装|安装 OmniRoute|安装 OmniRoute/u);
  assert.doesNotMatch(zh, /english-fallback-notice/u);
  assert.doesNotMatch(traditional, /english-fallback-notice/u);
  assert.match(traditional, /zh-Hant\/getting-started\/quick-start/u);
  assert.match(en, /Quick Start/u);
  assert.ok(fallback.includes(SITE_COPY["ja-JP"].englishFallbackNotice));
  assert.ok(fallback.includes('href="/en-US/getting-started/self-hosting/"'));
  assert.ok(fallback.includes('lang="en-US"'));
  assert.match(await page("zh-CN/"), /免费|免費/u);
  assert.doesNotMatch(await page("zh-CN/"), /english-fallback-notice/u);
});

test("root entry and site shell retain navigation, search, and theme controls", async () => {
  const root = await page("");
  const html = await page("en-US/getting-started/quick-start/");
  assert.ok(root.includes('href="/en-US/"'));
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
  assert.ok(!html.includes("openspec.hagicode.com"));
  const image = await readFile(new URL("../dist/img/hagicode/light-main.png", import.meta.url));
  assert.ok(image.length > 0);
});

test("selected topic links and copied assets resolve in every locale; source links cite the pinned revision", async () => {
  const revision = (await readFile(new URL("../src/content/upstream-translation-reviews.json", import.meta.url), "utf8"));
  const home = await page("en-US/");
  assert.match(home, /\/en-US\/getting-started\/quick-start\//u);
  assert.match(home, /\/upstream-assets\/en-US\//u);
  assert.ok(home.includes(`https://github.com/diegosouzapw/OmniRoute/blob/${JSON.parse(revision).revision}/`));
  const missing = [];
  for (const { code } of LANGUAGE_OPTIONS) {
    const pages = await readdir(new URL(`../dist/${code}/`, import.meta.url), { recursive: true });
    for (const file of pages.filter((name) => name.endsWith("index.html"))) {
      const html = await readFile(new URL(`../dist/${code}/${file}`, import.meta.url), "utf8");
      assert.ok(html.includes(`https://github.com/diegosouzapw/OmniRoute/blob/${JSON.parse(revision).revision}/`));
      const article = html.match(/<main[\s\S]*?<\/main>/u)?.[0] ?? "";
      for (const [, href] of article.matchAll(/(?:href|src)="([^"]+)"/gu)) {
        if (/^https?:/iu.test(href) && !href.startsWith("https://omniroute.hagicode.com/")) continue;
        const target = new URL(href.replaceAll("&amp;", "&"), `https://omniroute.hagicode.com/${code}/${file.replace(/index\.html$/u, "")}`);
        if (target.origin !== "https://omniroute.hagicode.com") continue;
        const pathname = decodeURIComponent(target.pathname).replace(/^\/+/u, "");
        const relative = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
        try {
          await stat(new URL(`../dist/${path.posix.normalize(relative)}`, import.meta.url));
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
          missing.push(`${code}/${file}: ${href}`);
        }
      }
    }
  }
  assert.deepEqual(missing, []);
});
