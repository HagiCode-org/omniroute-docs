import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Hagilight publishes robots discovery beside the localized Starlight feeds and sitemap", async () => {
  const [robots, sitemap, englishFeed, chineseFeed] = await Promise.all([
    readFile(new URL("dist/robots.txt", root), "utf8"),
    readFile(new URL("dist/sitemap-index.xml", root), "utf8"),
    readFile(new URL("dist/rss.xml", root), "utf8"),
    readFile(new URL("dist/rss.zh-CN.xml", root), "utf8"),
  ]);

  assert.match(robots, /Sitemap: https:\/\/omniroute\.hagicode\.com\/sitemap-index\.xml/u);
  assert.match(sitemap, /https:\/\/omniroute\.hagicode\.com\/sitemap-\d+\.xml/u);
  assert.equal((englishFeed.match(/<item>/gu) ?? []).length, 164);
  assert.equal((chineseFeed.match(/<item>/gu) ?? []).length, 148);
});
