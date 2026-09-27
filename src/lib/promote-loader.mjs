const ORIGIN = "https://index.hagicode.com";
const CATALOG = `${ORIGIN}/index-catalog.json`;
const FLAGS = `${ORIGIN}/promote.json`;
const CONTENT = `${ORIGIN}/promote_content.json`;

function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function readJson(fetchImpl, url) {
  const response = await fetchImpl(url, { headers: { accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error(`Promotion request failed (${response.status}): ${url}`);
  return response.json();
}

function catalogUrl(value) {
  if (!text(value)) return null;
  try {
    const url = new URL(value, ORIGIN);
    return url.origin === ORIGIN && url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export async function resolvePromotionEndpoints(fetchImpl = globalThis.fetch) {
  try {
    const catalog = await readJson(fetchImpl, CATALOG);
    const entries = record(catalog) && Array.isArray(catalog.entries) ? catalog.entries : [];
    const flags = entries.find((entry) => record(entry) && entry.id === "promotion-flags");
    const content = entries.find((entry) => record(entry) && entry.id === "promotion-content");
    const flagsUrl = catalogUrl(flags?.path);
    const contentUrl = catalogUrl(content?.path);
    if (flagsUrl && contentUrl) return { flagsUrl, contentUrl, source: "catalog" };
  } catch {
    // The catalog is optional; stable endpoints remain available.
  }
  return { flagsUrl: FLAGS, contentUrl: CONTENT, source: "fallback" };
}

function localized(value, locale) {
  if (!record(value)) return null;
  for (const key of [locale, "en-US", "en"]) {
    if (text(value[key])) return text(value[key]);
  }
  return null;
}

function safeUrl(value, image = false) {
  if (!text(value)) return null;
  try {
    const url = new URL(value, ORIGIN);
    return url.protocol === "https:" || (!image && url.protocol === "http:") ? url.href : null;
  } catch {
    return null;
  }
}

function eligible(flag, now) {
  if (!record(flag) || flag.on !== true || !text(flag.id)) return false;
  const start = flag.startTime ? Date.parse(flag.startTime) : null;
  const end = flag.endTime ? Date.parse(flag.endTime) : null;
  return (start === null || (Number.isFinite(start) && now >= start))
    && (end === null || (Number.isFinite(end) && now < end))
    && (start === null || end === null || start < end);
}

function parsePromotion(flag, contents, locale) {
  const content = contents.find((entry) => record(entry) && entry.id === flag.id);
  if (!content) return null;
  const title = localized(content.title, locale);
  const description = localized(content.description, locale);
  const href = safeUrl(content.link);
  if (!title || !description || !href) return null;
  const imageValue = content.image ?? content.imageUrl ?? content.imageURL;
  const imageSource = record(imageValue) ? imageValue.src ?? imageValue.url ?? imageValue.imageUrl : imageValue;
  const src = safeUrl(imageSource, true);
  return {
    id: flag.id,
    title,
    description,
    href,
    ctaLabel: localized(content.cta, locale) ?? "Visit",
    image: src ? {
      src,
      alt: text(imageValue?.alt) ?? text(content.imageAlt) ?? title,
      width: Number.isFinite(imageValue?.width) && imageValue.width > 0 ? Math.round(imageValue.width) : undefined,
      height: Number.isFinite(imageValue?.height) && imageValue.height > 0 ? Math.round(imageValue.height) : undefined,
    } : null,
  };
}

export async function loadFirstPromotion({ locale = "en-US", fetchImpl = globalThis.fetch, now = Date.now() } = {}) {
  try {
    const { flagsUrl, contentUrl } = await resolvePromotionEndpoints(fetchImpl);
    const [flags, content] = await Promise.all([readJson(fetchImpl, flagsUrl), readJson(fetchImpl, contentUrl)]);
    if (!record(flags) || !Array.isArray(flags.promotes) || !record(content) || !Array.isArray(content.contents)) return null;
    for (const flag of flags.promotes) {
      if (!eligible(flag, now)) continue;
      const campaign = parsePromotion(flag, content.contents, locale);
      if (campaign) return campaign;
    }
    return null;
  } catch {
    // Network and invalid remote responses must not replace the local promotion.
    return null;
  }
}
