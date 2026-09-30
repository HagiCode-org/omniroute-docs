import assert from "node:assert/strict";
import test from "node:test";
import {
  getEnglishTopicHref,
  preserveUrlContext,
  readBrowserLocalePreference,
} from "../src/lib/locale-navigation.mjs";

test("English-source links retain the topic path from every locale shape", () => {
  assert.equal(getEnglishTopicHref("/fr-FR/guides/providers/setup/"), "/en-US/guides/providers/setup/");
  assert.equal(getEnglishTopicHref("/fr-FR/index.md"), "/en-US/");
});

test("root redirect locale preference accepts known locales and defaults invalid values", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  try {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: { getItem: () => '{"lang":"ja-JP"}' },
    });
    assert.equal(readBrowserLocalePreference(), "ja-JP");
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: { getItem: () => '{"lang":"unsupported"}' },
    });
    assert.equal(readBrowserLocalePreference(), null);
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  }
});

test("root redirect keeps query and fragment context", () => {
  const source = new URL("https://omniroute.hagicode.com/?mode=compact#setup");
  assert.equal(
    preserveUrlContext("/zh-CN/", source),
    "https://omniroute.hagicode.com/zh-CN/?mode=compact#setup",
  );
});

test("root redirect defaults to English when browser storage is blocked", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  try {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new Error("storage blocked");
      },
    });
    assert.equal(readBrowserLocalePreference(), null);
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  }
});
