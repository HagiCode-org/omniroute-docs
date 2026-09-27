import assert from "node:assert/strict";
import test from "node:test";
import {
  getEnglishTopicHref, getLocaleHref, getPreferredLocale, preserveUrlContext,
  readLocalePreference, serializeLocalePreference, writeLocalePreference,
} from "../src/lib/locale-navigation.mjs";

test("root preference defaults to English and recognizes supported locales", () => {
  assert.equal(getPreferredLocale(null), null);
  assert.equal(getPreferredLocale("{bad"), null);
  assert.equal(getPreferredLocale('{"lang":"root"}'), "en-US");
  assert.equal(getPreferredLocale('{"lang":"ja-JP"}'), "ja-JP");
  assert.equal(getPreferredLocale('{"lang":"not-a-locale"}'), null);
});

test("topic switching preserves counterparts, including nested routes", () => {
  const ids = ["en-US/index", "ja-JP/index", "en-US/guides/providers/setup", "ja-JP/guides/providers/setup"];
  assert.equal(getLocaleHref("/en-US/guides/providers/setup/", "ja-JP", ids), "/ja-JP/guides/providers/setup/");
  assert.equal(getLocaleHref("/ja-JP/untranslated/", "en-US", ids), "/en-US/");
  assert.equal(getLocaleHref("/en-US/guides/providers/setup/", "zh-CN", ids), "/zh-CN/");
  assert.equal(getEnglishTopicHref("/fr-FR/guides/providers/setup/"), "/en-US/guides/providers/setup/");
  assert.equal(getLocaleHref("/en-US/", "ja-JP", ids), "/ja-JP/");
  assert.throws(() => getLocaleHref("/", "invalid", ids), RangeError);
});

test("explicit URLs are unchanged; root and selector preserve query and fragment", () => {
  const source = new URL("https://omniroute.hagicode.com/?mode=compact#setup");
  assert.equal(preserveUrlContext("/zh-CN/", source), "https://omniroute.hagicode.com/zh-CN/?mode=compact#setup");
  assert.equal(serializeLocalePreference('{"theme":"dark"}', "zh-CN"), '{"theme":"dark","lang":"zh-CN"}');
  const blocked = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  assert.equal(readLocalePreference(blocked), null);
  assert.equal(writeLocalePreference(blocked, "de-DE"), false);
});
