import assert from "node:assert/strict";
import test from "node:test";
import { getAnalyticsIdentifiers } from "../src/lib/analytics-config.mjs";
import { initializeAnalytics } from "../src/lib/analytics-client.mjs";

function browser() {
  const scripts = [];
  return {
    scripts,
    instance: {
      document: { createElement: () => ({}), head: { appendChild: (script) => scripts.push(script) } },
      dataLayer: [],
    },
  };
}

test("analytics is opt-in and production-only", () => {
  assert.equal(getAnalyticsIdentifiers(false, "G-123", "la"), undefined);
  assert.equal(getAnalyticsIdentifiers(true), undefined);
  assert.deepEqual(getAnalyticsIdentifiers(true, " G-123 ", " "), { googleId: "G-123", fiftyOneLaId: "" });
});

test("only OmniRoute production host loads configured providers, once", () => {
  for (const hostname of ["localhost", "127.0.0.1", "openspec.hagicode.com"]) {
    const { scripts, instance } = browser();
    initializeAnalytics({ hostname, googleId: "G-123", fiftyOneLaId: "la" }, instance);
    assert.equal(scripts.length, 0);
  }
  const { scripts, instance } = browser();
  for (let i = 0; i < 2; i++) initializeAnalytics({ hostname: "omniroute.hagicode.com", googleId: "G-123", fiftyOneLaId: "la" }, instance);
  assert.equal(scripts.length, 2);
  assert.match(scripts[0].src, /googletagmanager\.com/u);
  assert.equal(scripts[1].src, "https://sdk.51.la/js-sdk-pro.min.js");
  assert.equal(instance.dataLayer.at(-1)[1], "G-123");
});
