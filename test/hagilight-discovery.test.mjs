import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

function assertFeed(xml, language) {
  assert.match(xml, /^<\?xml/u);
  const channel = xml.match(/<channel>([\s\S]*?)<\/channel>/u)?.[1];
  assert.ok(channel, "RSS feed has a channel");
  assert.match(channel, /<title>[^<]+<\/title>/u);
  assert.match(channel, /<description>[^<]+<\/description>/u);
  assert.match(channel, new RegExp(`<language>${language}</language>`, "u"));
  assert.match(channel, /<link>https:\/\/omniroute\.hagicode\.com\/<\/link>/u);
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gu)].map(([, item]) => {
    const link = item.match(/<link>([^<]+)<\/link>/u)?.[1];
    assert.ok(link && /^https:\/\/omniroute\.hagicode\.com\//u.test(link), "RSS item links are absolute site URLs");
    return link;
  });
}

test("Hagilight publishes robots discovery beside the localized Starlight feeds and sitemap", async () => {
  const [robots, sitemap, config, englishFeed, englishAlias, chineseFeed] = await Promise.all([
    readFile(new URL("dist/robots.txt", root), "utf8"),
    readFile(new URL("dist/sitemap-index.xml", root), "utf8"),
    readFile(new URL("astro.config.mjs", root), "utf8"),
    readFile(new URL("dist/rss.xml", root), "utf8"),
    readFile(new URL("dist/rss.en.xml", root), "utf8"),
    readFile(new URL("dist/rss.zh-CN.xml", root), "utf8"),
  ]);

  assert.equal((config.match(/hagilight\(\s*\{/gu) ?? []).length, 1);
  assert.equal((config.match(/hagilightDiscovery\(\)/gu) ?? []).length, 1);
  assert.match(robots, /Sitemap: https:\/\/omniroute\.hagicode\.com\/sitemap-index\.xml/u);
  assert.match(sitemap, /https:\/\/omniroute\.hagicode\.com\/sitemap-\d+\.xml/u);
  const englishLinks = assertFeed(englishFeed, "en-US");
  assert.deepEqual(assertFeed(englishAlias, "en-US"), englishLinks);
  const chineseLinks = assertFeed(chineseFeed, "zh-CN");
  assert.equal(englishLinks.length, 164);
  assert.equal(chineseLinks.length, 148);
  assert.ok(englishLinks.every((link) => link.includes("/en-US/")));
  assert.ok(chineseLinks.every((link) => link.includes("/zh-CN/")));

  for (const locale of ["zh-Hant", "ja-JP", "ko-KR", "de-DE", "fr-FR", "es-ES", "pt-BR", "ru-RU"]) {
    const xml = await readFile(new URL(`dist/rss.${locale}.xml`, root), "utf8");
    const links = assertFeed(xml, locale);
    assert.ok(links.length > 0);
    assert.ok(links.every((link) => link.includes(`/${locale}/`)));
  }
});
