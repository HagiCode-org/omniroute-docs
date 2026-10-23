import { locales as HAGILIGHT_LOCALES } from "@hagicode/hagilight-starlight/locales";

export const LANGUAGE_OPTIONS = /** @type {const} */ ([
  ...Object.values(HAGILIGHT_LOCALES).map(({ lang, label }) => ({ code: lang, label, lang })),
]);

export const SITE_COPY = {
  "zh-CN": {
    englishFallbackNotice: "该主题尚无简体中文译文，目前显示英文原文。",
    englishFallbackLinkLabel: "阅读英文原文",
    sourceLabel: "GitHub 源码",
  },
  "en-US": {
    englishFallbackNotice: "This topic has not been translated yet; the English original is shown.",
    englishFallbackLinkLabel: "Read the English original",
    sourceLabel: "GitHub source",
  },
  "zh-Hant": {
    englishFallbackNotice: "此主題尚無繁體中文譯文，目前顯示英文原文。",
    englishFallbackLinkLabel: "閱讀英文原文",
    sourceLabel: "GitHub 原始碼",
  },
  "ja-JP": {
    englishFallbackNotice: "このトピックはまだ日本語に翻訳されていないため、英語の原文を表示しています。",
    englishFallbackLinkLabel: "英語の原文を読む",
    sourceLabel: "GitHub ソース",
  },
  "ko-KR": {
    englishFallbackNotice: "이 항목은 아직 한국어로 번역되지 않아 영어 원문을 표시합니다.",
    englishFallbackLinkLabel: "영어 원문 읽기",
    sourceLabel: "GitHub 소스",
  },
  "de-DE": {
    englishFallbackNotice: "Dieses Thema ist noch nicht ins Deutsche übersetzt; angezeigt wird das englische Original.",
    englishFallbackLinkLabel: "Englisches Original lesen",
    sourceLabel: "GitHub-Quellcode",
  },
  "fr-FR": {
    englishFallbackNotice: "Ce sujet n’est pas encore traduit en français ; la version anglaise est affichée.",
    englishFallbackLinkLabel: "Lire l’original anglais",
    sourceLabel: "Code source GitHub",
  },
  "es-ES": {
    englishFallbackNotice: "Este tema aún no está traducido al español; se muestra el original en inglés.",
    englishFallbackLinkLabel: "Leer el original en inglés",
    sourceLabel: "Código fuente en GitHub",
  },
  "pt-BR": {
    englishFallbackNotice: "Este tópico ainda não foi traduzido para português; o original em inglês está sendo exibido.",
    englishFallbackLinkLabel: "Ler o original em inglês",
    sourceLabel: "Código-fonte no GitHub",
  },
  "ru-RU": {
    englishFallbackNotice: "Эта тема ещё не переведена на русский; отображается английский оригинал.",
    englishFallbackLinkLabel: "Читать оригинал на английском",
    sourceLabel: "Исходный код на GitHub",
  },
};

/**
 * @param {string | undefined} locale
 * @returns {locale is keyof typeof SITE_COPY}
 */
export function isSiteLocale(locale) {
  return typeof locale === "string" && LANGUAGE_OPTIONS.some(({ code }) => code === locale);
}
