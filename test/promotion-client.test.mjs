import assert from "node:assert/strict";
import test from "node:test";
import { enhancePromotionCard } from "../src/lib/promotion-client.mjs";

function fixture(storage) {
  const elements = new Map();
  function element() {
    return { textContent: "", dataset: {}, handlers: {}, addEventListener(event, handler) { this.handlers[event] = handler; } };
  }
  for (const selector of ["[data-promotion-title]", "[data-promotion-description]", "[data-promotion-link]", "[data-promotion-dismiss]", "[data-promotion-image]"]) elements.set(selector, element());
  const attrs = new Map([["data-promotion-signature", "fallback:hagicode"]]);
  const footer = {};
  const root = {
    hidden: false, inert: false,
    querySelector: (selector) => elements.get(selector),
    getAttribute: (key) => attrs.get(key),
    setAttribute: (key, value) => attrs.set(key, value),
    ownerDocument: { querySelector: () => footer },
  };
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(target) { assert.equal(target, footer); }
    disconnect() {}
  }
  return { root, elements, attrs, observers, Observer, windowObject: { localStorage: storage } };
}

test("dismissals are campaign-scoped and work when storage is blocked", async () => {
  const blocked = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  const fixtureData = fixture(blocked);
  const { root, elements, attrs } = fixtureData;
  enhancePromotionCard(root, { ...fixtureData, loadPromotion: async () => null });
  elements.get("[data-promotion-dismiss]").handlers.click();
  assert.equal(root.hidden, true);
  attrs.set("data-promotion-signature", "campaign:other");
  assert.equal(root.getAttribute("data-promotion-signature"), "campaign:other");
  const second = fixture(blocked);
  enhancePromotionCard(second.root, { ...second, loadPromotion: async () => ({ id: "new", title: "New", description: "New details", ctaLabel: "Visit", href: "https://www.hagicode.com/" }) });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(second.root.hidden, false);
  assert.equal(second.elements.get("[data-promotion-title]").textContent, "New");
});

test("footer intersection hides the floating banner but not the article card", () => {
  const data = fixture({ getItem: () => null, setItem: () => {} });
  enhancePromotionCard(data.root, data);
  data.observers[0].callback([{ isIntersecting: true }]);
  assert.equal(data.root.hidden, true);
  data.observers[0].callback([{ isIntersecting: false }]);
  assert.equal(data.root.hidden, false);
});

test("stored dismissal applies only to its promotion signature", async () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  };
  const first = fixture(storage);
  enhancePromotionCard(first.root, first);
  first.elements.get("[data-promotion-dismiss]").handlers.click();
  assert.equal(first.root.hidden, true);
  assert.equal(values.size, 1);

  const same = fixture(storage);
  enhancePromotionCard(same.root, same);
  assert.equal(same.root.hidden, true);
  const newCampaign = fixture(storage);
  enhancePromotionCard(newCampaign.root, {
    ...newCampaign,
    loadPromotion: async () => ({
      id: "different", title: "Different", description: "Details",
      ctaLabel: "Learn more", href: "https://www.hagicode.com/",
    }),
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(newCampaign.root.hidden, false);
  newCampaign.elements.get("[data-promotion-dismiss]").handlers.click();
  assert.equal(values.size, 2);
});

test("dismissing while a campaign loads never reopens the card in this view", async () => {
  let deliver;
  const campaignPromise = new Promise((resolve) => { deliver = resolve; });
  const data = fixture({ getItem: () => null, setItem: () => {} });
  enhancePromotionCard(data.root, { ...data, loadPromotion: () => campaignPromise });
  data.elements.get("[data-promotion-dismiss]").handlers.click();
  assert.equal(data.root.hidden, true);
  deliver({ id: "delayed", title: "Delayed", description: "Details", ctaLabel: "Visit", href: "https://www.hagicode.com/" });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(data.root.hidden, true);
});
