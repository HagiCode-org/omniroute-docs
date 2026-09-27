import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { LANGUAGE_OPTIONS, SITE_COPY } from "../src/i18n/site-copy.mjs";
import { discoverTopics } from "../scripts/upstream-topics.mjs";

const page = (route) => readFile(new URL(`../dist/${route}index.html`, import.meta.url), "utf8");
const trackingScripts = /<script[^>]+src="[^"]*(?:googletagmanager\.com\/gtag\/js|sdk\.51\.la\/js-sdk)/u;
const sourceTopic = "getting-started/self-hosting/";

test("all upstream topics retain one article promotion and no empty campaign fallback", async () => {
  const topics = await discoverTopics(new URL("../vendor/OmniRoute", import.meta.url).pathname);
  const english = await readdir(new URL("../dist/en-US/", import.meta.url), { recursive: true });
  assert.ok(Object.keys(topics).length >= 164);
  assert.equal(english.filter((file) => file.endsWith("index.html")).length, Object.keys(topics).length);

  for (const { code } of LANGUAGE_OPTIONS) {
    const home = await page(`${code}/`);
    assert.ok(home.includes(`<html lang="${code}"`));
    assert.ok(home.includes(`https://omniroute.hagicode.com/${code}/`));
    assert.match(home, /OmniRoute/u);
    const sidebar = home.match(/<nav class="sidebar [\s\S]*?<\/nav>/u)?.[0];
    assert.ok(sidebar, `${code} has a sidebar`);

    for (const slug of Object.values(topics).filter(Boolean)) {
      assert.ok(sidebar.includes(`href="/${code}/${slug}/"`), `${code} sidebar links ${slug}`);
      const topic = await page(`${code}/${slug}/`);
      const isFallback = topic.includes("english-fallback-notice");
      const canonicalLocale = isFallback ? "en-US" : code;
      const banner = topic.match(/<hagilight-promoto-banner[^>]*>/u)?.[0];
      assert.ok(banner, `${code}/${slug} includes the shared campaign component`);
      assert.match(banner, /\bhidden/u);
      assert.equal(topic.split('class="hagilight-article-promotion ').length - 1, 1, `${code}/${slug} has one article introduction`);
      assert.equal(topic.split("<hagilight-promoto-banner").length - 1, 1, `${code}/${slug} has one remote campaign component`);
      assert.ok(topic.includes(`<link rel="canonical" href="https://omniroute.hagicode.com/${canonicalLocale}/${slug}/"`));
      assert.doesNotMatch(topic, /data-fallback=|data-hagicode-promotion|data-hagicode-end-card|\/img\/hagicode\/light-main\.png/u);
      assert.doesNotMatch(topic, trackingScripts);
    }

    await assert.rejects(stat(new URL(`../dist/${code}/stores-beta/user-guide/index.html`, import.meta.url)), { code: "ENOENT" });
    await assert.rejects(stat(new URL(`../dist/${code}/installation/index.html`, import.meta.url)), { code: "ENOENT" });
  }
});

test("translated pages and English fallbacks expose consistent locale metadata", async () => {
  const zh = await page("zh-CN/getting-started/quick-start/");
  const traditional = await page("zh-Hant/getting-started/quick-start/");
  const english = await page("en-US/getting-started/quick-start/");
  assert.match(zh, /安装|安装 OmniRoute/u);
  assert.doesNotMatch(zh, /english-fallback-notice/u);
  assert.doesNotMatch(traditional, /english-fallback-notice/u);
  assert.match(traditional, /zh-Hant\/getting-started\/quick-start/u);
  assert.match(english, /Quick Start/u);
  assert.ok(english.includes('<link rel="canonical" href="https://omniroute.hagicode.com/en-US/getting-started/quick-start/"'));
  assert.ok(english.includes('<link rel="alternate" hreflang="zh-CN"'));

  for (const { code } of LANGUAGE_OPTIONS.filter(({ code }) => code !== "en-US")) {
    const fallback = await page(`${code}/${sourceTopic}`);
    const canonical = `https://omniroute.hagicode.com/en-US/${sourceTopic}`;
    assert.ok(fallback.includes(SITE_COPY[code].englishFallbackNotice), `${code} shows a localized fallback notice`);
    assert.ok(fallback.includes(`href="/en-US/${sourceTopic}"`), `${code} links to the English source`);
    assert.ok(fallback.includes('lang="en-US"'), `${code} marks fallback text as English`);
    assert.ok(fallback.includes(`<link rel="canonical" href="${canonical}"`), `${code} canonicalizes to its English source`);
    assert.ok(fallback.includes(`<meta property="og:url" content="${canonical}"`), `${code} uses the English canonical for social sharing`);
    assert.deepEqual(fallback.match(/<link rel="alternate"/gu), null);
    assert.equal(fallback.match(/<meta property="og:locale"[^>]*>/gu)?.length, 1);
    assert.match(fallback, /<meta property="og:locale" content="en_US"/u);
  }

  const chineseHome = await page("zh-CN/");
  assert.match(chineseHome, /免费|免費/u);
  assert.doesNotMatch(chineseHome, /english-fallback-notice/u);
});

test("localized shared shell retains links, language switching, and reading controls", async () => {
  const root = await page("");
  const config = await readFile(new URL("../astro.config.mjs", import.meta.url), "utf8");
  assert.ok(root.includes('href="/en-US/"'));
  assert.match(config, /googleAnalytics:\s*\{\s*enabled:\s*false\s*\}/u);
  assert.match(config, /fiftyOneLa:\s*\{\s*enabled:\s*false\s*\}/u);
  assert.doesNotMatch(config, /PUBLIC_OMNIROUTE_(?:GA|51LA)_ID/u);

  for (const { code } of LANGUAGE_OPTIONS) {
    const html = await page(`${code}/${sourceTopic}`);
    const productDocsUrl = `https://docs.hagicode.com/${code === "zh-CN" ? "" : `${code}/`}`;
    for (const [url, label] of [
      ["https://www.hagicode.com/", SITE_COPY[code].websiteLabel],
      [productDocsUrl, SITE_COPY[code].productDocsLabel],
      ["https://tasks.hagicode.com/", SITE_COPY[code].hagiTaskLabel],
      ["https://github.com/HagiCode-org/omniroute-docs", SITE_COPY[code].sourceLabel],
      ["https://github.com/HagiCode-org/omniroute-docs/issues", SITE_COPY[code].issuesLabel],
    ]) {
      assert.ok(html.includes(url), `${code} has ${url}`);
      assert.ok(html.includes(label), `${code} has localized label ${label}`);
    }
    assert.match(html, /<site-search/u);
    assert.match(html, /<starlight-theme-select/u);
    assert.equal(html.split('data-hagilight-content-width-choice="wide"').length - 1, 1);
    assert.equal(html.split('data-hagilight-content-width-choice="narrow"').length - 1, 1);
    assert.match(html, /<hagilight-language-chooser/u);
    for (const { code: target } of LANGUAGE_OPTIONS) {
      assert.ok(
        html.includes(`data-locale="${target}" data-href="/${target}/${sourceTopic}"`),
        `${code} can switch to ${target} while preserving this topic`,
      );
    }
    assert.ok(!html.includes("openspec.hagicode.com"));
  }
});

test("upstream links resolve for every locale and tracking scripts stay absent", async () => {
  const revision = JSON.parse(await readFile(new URL("../src/content/upstream-translation-reviews.json", import.meta.url), "utf8")).revision;
  const home = await page("en-US/");
  assert.match(home, /\/en-US\/getting-started\/quick-start\//u);
  assert.match(home, /\/upstream-assets\/en-US\//u);
  assert.ok(home.includes(`https://github.com/diegosouzapw/OmniRoute/blob/${revision}/`));
  const missing = [];

  for (const { code } of LANGUAGE_OPTIONS) {
    const pages = await readdir(new URL(`../dist/${code}/`, import.meta.url), { recursive: true });
    for (const file of pages.filter((name) => name.endsWith("index.html"))) {
      const html = await readFile(new URL(`../dist/${code}/${file}`, import.meta.url), "utf8");
      assert.ok(html.includes(`https://github.com/diegosouzapw/OmniRoute/blob/${revision}/`));
      assert.doesNotMatch(html, trackingScripts, `${code}/${file} has no analytics script`);
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
