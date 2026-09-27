import { LANGUAGE_OPTIONS } from "../src/i18n/site-copy.mjs";

// Reviewed reader-facing subset. Paths are relative to the OmniRoute checkout.
export const TOPICS = {
  "README.md": "",
  "docs/getting-started/QUICK-START.md": "getting-started/quick-start",
  "docs/getting-started/SELF_HOST_GUIDE.md": "getting-started/self-hosting",
  "docs/guides/USER_GUIDE.md": "guides/user-guide",
};

export const UPSTREAM_LOCALES = {
  "zh-CN": "zh-CN",
  "en-US": null,
  "zh-Hant": "zh-TW",
  "ja-JP": "ja",
  "ko-KR": "ko",
  "de-DE": "de",
  "fr-FR": "fr",
  "es-ES": "es",
  "pt-BR": "pt-BR",
  "ru-RU": "ru",
};

if (LANGUAGE_OPTIONS.some(({ code }) => !(code in UPSTREAM_LOCALES))
  || Object.keys(UPSTREAM_LOCALES).length !== LANGUAGE_OPTIONS.length) {
  throw new Error("Upstream locale mapping must match configured site locales");
}

export function translatedSource(source, locale) {
  const upstream = UPSTREAM_LOCALES[locale];
  if (upstream === undefined) throw new RangeError(`Unsupported locale: ${locale}`);
  return upstream === null ? source : `docs/i18n/${upstream}/${source}`;
}
