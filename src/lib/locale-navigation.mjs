import { LANGUAGE_OPTIONS } from "../i18n/site-copy.mjs";

const SUPPORTED_LOCALES = LANGUAGE_OPTIONS.map(({ code }) => code);

function topicParts(value) {
  const segments = value.replace(/\.(md|mdx)$/u, "").split("/").filter(Boolean);
  if (SUPPORTED_LOCALES.includes(segments[0])) segments.shift();
  if (segments.at(-1) === "index") segments.pop();
  return segments.join("/");
}

export function getEnglishTopicHref(pathname) {
  const topic = topicParts(pathname);
  return topic ? `/en-US/${topic}/` : "/en-US/";
}

export function preserveUrlContext(href, currentUrl) {
  const target = new URL(href, currentUrl);
  target.search = currentUrl.search;
  target.hash = currentUrl.hash;
  return target.toString();
}

function getPreferredLocale(value) {
  if (typeof value !== "string") return null;
  let preference;
  try {
    preference = JSON.parse(value);
  } catch {
    return null;
  }
  if (!preference || typeof preference !== "object" || Array.isArray(preference)) return null;
  if (preference.lang === "root") return "en-US";
  return SUPPORTED_LOCALES.includes(preference.lang) ? preference.lang : null;
}

export function readBrowserLocalePreference() {
  try {
    return getPreferredLocale(globalThis.localStorage.getItem("starlight-route"));
  } catch {
    return null;
  }
}
