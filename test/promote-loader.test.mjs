import assert from "node:assert/strict";
import test from "node:test";
import { loadFirstPromotion, resolvePromotionEndpoints } from "../src/lib/promote-loader.mjs";

const flags = { promotes: [{ id: "inactive", on: false }, { id: "active", on: true, startTime: "2026-01-01", endTime: "2027-01-01" }] };
const content = { contents: [{ id: "active", title: { "en-US": "Hello", "fr-FR": "Bonjour" }, description: { "en-US": "Details" }, cta: { "en-US": "Visit" }, link: "https://www.hagicode.com/" }] };
function request(payload) {
  return async (url) => ({ ok: true, json: async () => url.includes("catalog") ? { entries: [] } : url.endsWith("/promote.json") ? payload.flags : payload.content });
}

test("catalog discovery stays on the trusted origin", async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => ({ entries: [
    { id: "promotion-flags", path: "https://evil.example/flags" },
    { id: "promotion-content", path: "/content.json" },
  ] }) });
  assert.equal((await resolvePromotionEndpoints(fetchImpl)).source, "fallback");
});

test("eligible localized campaign enhances fallback; failure or malformed data does not", async () => {
  const campaign = await loadFirstPromotion({ locale: "fr-FR", fetchImpl: request({ flags, content }), now: Date.parse("2026-09-26") });
  assert.equal(campaign.title, "Bonjour");
  assert.equal(campaign.description, "Details");
  assert.equal(await loadFirstPromotion({ fetchImpl: async () => { throw new Error("offline"); } }), null);
  assert.equal(await loadFirstPromotion({ fetchImpl: request({ flags, content: { contents: [] } }) }), null);
  assert.equal(await loadFirstPromotion({ fetchImpl: request({ flags, content }), now: Date.parse("2028-01-01") }), null);
});
