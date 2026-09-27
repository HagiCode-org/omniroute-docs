import { LANGUAGE_OPTIONS } from "../i18n/site-copy.mjs";

export const SUPPORTED_LOCALES = LANGUAGE_OPTIONS.map(({ code }) => code);
export const LANGUAGE_PREFERENCE_KEY = "starlight-route";

function topicParts(value) {
  const segments = value.replace(/\.(md|mdx)$/u, "").split("/").filter(Boolean);
  if (SUPPORTED_LOCALES.includes(segments[0])) segments.shift();
  if (segments.at(-1) === "index") segments.pop();
  return segments.join("/");
}

export function getLocaleHref(pathname, locale, publishedIds) {
  if (!SUPPORTED_LOCALES.includes(locale)) throw new RangeError(`Unsupported locale: ${locale}`);
  const topic = topicParts(pathname);
  if (!topic || !publishedIds.some((id) => topicParts(id) === topic && id.startsWith(`${locale}/`))) {
    return `/${locale}/`;
  }
  return `/${locale}/${topic}/`;
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

export function getPreferredLocale(value) {
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

export function serializeLocalePreference(value, locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) throw new RangeError(`Unsupported locale: ${locale}`);
  let previous = {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) previous = parsed;
  } catch {
    // An invalid preference is replaced with the selected locale.
  }
  return JSON.stringify({ ...previous, lang: locale });
}

export function readLocalePreference(storage) {
  try {
    return getPreferredLocale(storage.getItem(LANGUAGE_PREFERENCE_KEY));
  } catch {
    return null;
  }
}

export function writeLocalePreference(storage, locale) {
  try {
    storage.setItem(
      LANGUAGE_PREFERENCE_KEY,
      serializeLocalePreference(storage.getItem(LANGUAGE_PREFERENCE_KEY), locale),
    );
    return true;
  } catch {
    return false;
  }
}

export function readBrowserLocalePreference() {
  try {
    return readLocalePreference(globalThis.localStorage);
  } catch {
    return null;
  }
}

export function writeBrowserLocalePreference(locale) {
  try {
    return writeLocalePreference(globalThis.localStorage, locale);
  } catch {
    return false;
  }
}
