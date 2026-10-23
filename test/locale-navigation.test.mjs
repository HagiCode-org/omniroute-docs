import assert from "node:assert/strict";
import test from "node:test";
import { getEnglishTopicHref } from "../src/lib/locale-navigation.mjs";

test("English-source links retain the topic path from every locale shape", () => {
  assert.equal(getEnglishTopicHref("/fr-FR/guides/providers/setup/"), "/en-US/guides/providers/setup/");
  assert.equal(getEnglishTopicHref("/fr-FR/index.md"), "/en-US/");
});
