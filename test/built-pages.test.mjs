import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { LANGUAGE_OPTIONS, SITE_COPY } from "../src/i18n/site-copy.mjs";
import { discoverTopics } from "../scripts/upstream-topics.mjs";

const page = (route) => readFile(new URL(`../dist/${route}index.html`, import.meta.url), "utf8");
const googleAnalyticsScript = /<script[^>]+src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-EN03FMT2Q4"/u;
const fiftyOneLaScript = /<script[^>]+src="https:\/\/sdk\.51\.la\/js-sdk-pro\.min\.js"/u;
const sourceTopic = "getting-started/self-hosting/";

test("localized RSS feeds are published without an all-language feed", async () => {
  const [home, englishFeed] = await Promise.all([
    page("en-US/"),
    readFile(new URL("../dist/rss.xml", import.meta.url), "utf8"),
  ]);
  const topics = await discoverTopics(new URL("../vendor/OmniRoute", import.meta.url).pathname);
  assert.match(home, /rel="alternate"[^>]*type="application\/rss\+xml"[^>]*href="https:\/\/omniroute\.hagicode\.com\/rss\.xml"/u);
  assert.match(englishFeed, /<language>en-US<\/language>/u);
  const englishItems = [...englishFeed.matchAll(/<item>([\s\S]*?)<\/item>/gu)].map(([, item]) => item);
  assert.ok(englishItems.length >= Object.keys(topics).length - 1);
  assert.ok(englishItems.every((item) => item.includes("https://omniroute.hagicode.com/en-US/")));

  await assert.rejects(stat(new URL("../dist/rss.all.xml", import.meta.url)), { code: "ENOENT" });

  for (const { code } of LANGUAGE_OPTIONS) {
    const filename = code === "en-US" ? "en" : code;
    const localeFeed = await readFile(new URL(`../dist/rss.${filename}.xml`, import.meta.url), "utf8");
    assert.match(localeFeed, new RegExp(`<language>${code}</language>`, "u"));
    const localeItems = [...localeFeed.matchAll(/<item>([\s\S]*?)<\/item>/gu)].map(([, item]) => item);
    assert.ok(localeItems.length > 0);
    assert.ok(localeItems.every((item) => item.includes(`https://omniroute.hagicode.com/${code}/`)));
    if (code !== "en-US") {
      assert.ok(localeItems.every((item) => !item.includes(`/${code}/${sourceTopic}`)));
    }
  }
});

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
      const banner = topic.match(/<hagilight-promoto-banner[^>]*>/u)?.[0];
      assert.ok(banner, `${code}/${slug} includes the shared campaign component`);
      assert.match(banner, /\bhidden/u);
      assert.equal(topic.split('class="hagilight-article-promotion ').length - 1, 1, `${code}/${slug} has one article introduction`);
      assert.equal(topic.split("<hagilight-promoto-banner").length - 1, 1, `${code}/${slug} has one remote campaign component`);
      assert.ok(topic.includes(`<link rel="canonical" href="https://omniroute.hagicode.com/${code}/${slug}/"`));
      assert.doesNotMatch(topic, /data-fallback=|data-hagicode-promotion|data-hagicode-end-card|\/img\/hagicode\/light-main\.png/u);
      assert.match(topic, googleAnalyticsScript);
      assert.match(topic, fiftyOneLaScript);
      assert.match(topic, /const siteId = "L6b88a5yK4h2Xnci"/u);
      assert.match(topic, /screenRecord:\s*true/u);
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
  assert.match(english, /"@type":"BreadcrumbList"/u);
  assert.match(english, /<meta property="og:description"/u);
  assert.match(await page("en-US/"), /"@type":"Organization","name":"HagiCode"/u);
  assert.ok(english.includes('<link rel="alternate" hreflang="zh-CN"'));

  for (const { code } of LANGUAGE_OPTIONS.filter(({ code }) => code !== "en-US")) {
    const fallback = await page(`${code}/${sourceTopic}`);
    const canonical = `https://omniroute.hagicode.com/${code}/${sourceTopic}`;
    assert.ok(fallback.includes(SITE_COPY[code].englishFallbackNotice), `${code} shows a localized fallback notice`);
    assert.ok(fallback.includes(`href="/en-US/${sourceTopic}"`), `${code} links to the English source`);
    assert.ok(fallback.includes('lang="en-US"'), `${code} marks fallback text as English`);
    assert.ok(fallback.includes(`<link rel="canonical" href="${canonical}"`), `${code} retains Starlight's locale canonical`);
    assert.ok(fallback.includes(`<meta property="og:url" content="${canonical}"`), `${code} retains Starlight's locale social URL`);
    assert.ok(fallback.includes(`<link rel="alternate" hreflang="en-US" href="https://omniroute.hagicode.com/en-US/${sourceTopic}"`));
    assert.ok(fallback.includes(`<meta property="og:locale" content="${code}"`));
  }

  const chineseHome = await page("zh-CN/");
  assert.match(chineseHome, /免费|免費/u);
  assert.doesNotMatch(chineseHome, /english-fallback-notice/u);
});

test("localized homes receive scoped styling and retain imported documentation links", async () => {
  const [englishHome, topic, css, config] = await Promise.all([
    page("en-US/"),
    page(`en-US/${sourceTopic}`),
    readFile(new URL("../src/styles/site.css", import.meta.url), "utf8"),
    readFile(new URL("../astro.config.mjs", import.meta.url), "utf8"),
  ]);

  for (const { code } of LANGUAGE_OPTIONS) {
    const home = await page(`${code}/`);
    assert.match(home, /class="[^"]*\bdocumentation-home-marker\b[^"]*"/u, `${code} home has the style marker`);
  }

  assert.match(englishHome, /href="\/en-US\/getting-started\/quick-start\/"/u);
  assert.doesNotMatch(topic, /documentation-home-marker/u);
  assert.match(config, /customCss:\s*\["\.\/src\/styles\/site\.css"\]/u);
  assert.match(css, /\.sl-markdown-content:has\(> \.documentation-home-marker\)/u);
  assert.match(css, /:focus-visible/u);
  assert.match(css, /@media \(max-width: 30rem\)/u);
});

test("localized shared shell retains links, language switching, and reading controls", async () => {
  const root = await page("");
  const config = await readFile(new URL("../astro.config.mjs", import.meta.url), "utf8");
  const entrySource = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
  const sharedFavicon = "https://cdn.jsdelivr.net/npm/@hagicode/hagilight-core@0.4.0/favicon.ico";
  assert.ok(root.includes('href="/en-US/"'));
  assert.doesNotMatch(root, /http-equiv="refresh"/u);
  assert.match(entrySource, /readBrowserLocalePreference\(\)\s*\?\?\s*"en-US"/u);
  assert.match(entrySource, /preserveUrlContext/u);
  assert.match(entrySource, /window\.location\.replace/u);
  assert.ok(config.includes(`favicon: "${sharedFavicon}"`));
  assert.doesNotMatch(config, /G-EN03FMT2Q4|L6b88a5yK4h2Xnci/u);
  assert.doesNotMatch(config, /analytics:/u);
  assert.doesNotMatch(config, /StarlightHead/u);
  assert.doesNotMatch(config, /PUBLIC_OMNIROUTE_(?:GA|51LA)_ID/u);
  assert.doesNotMatch(config, /\b(?:overrides|extraLinks):/u);

  for (const { code } of LANGUAGE_OPTIONS) {
    const html = await page(`${code}/${sourceTopic}`);
    const faviconLinks = [...html.matchAll(/<link\b([^>]*)>/gu)]
      .filter(([, attrs]) => /\brel="(?:icon|shortcut icon)"/u.test(attrs))
      .map(([, attrs]) => attrs.match(/\bhref="([^"]+)"/u)?.[1]);
    assert.ok(faviconLinks.length > 0);
    assert.deepEqual(new Set(faviconLinks), new Set([sharedFavicon]));
    assert.match(html, /hagilight-site-links/u);
    if (code !== "en-US") {
      assert.ok(html.includes(`/rss.${code}.xml`), `${code} links its current-language feed`);
    }
    assert.ok(html.includes("https://newbe.hagicode.com/"), `${code} renders Hagilight's built-in ecosystem links`);
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
    assert.ok(html.includes("https://openspec.hagicode.com/"), `${code} retains built-in ecosystem destinations`);
  }
});

test("upstream links resolve for every locale with both analytics providers enabled", async () => {
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
      assert.match(html, googleAnalyticsScript, `${code}/${file} loads Google Analytics`);
      assert.match(html, fiftyOneLaScript, `${code}/${file} loads 51LA`);
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
