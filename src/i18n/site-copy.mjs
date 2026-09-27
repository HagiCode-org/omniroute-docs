export const LANGUAGE_OPTIONS = /** @type {const} */ ([
  { code: "zh-CN", label: "简体中文", lang: "zh-CN" },
  { code: "en-US", label: "English", lang: "en-US" },
  { code: "zh-Hant", label: "繁體中文", lang: "zh-Hant" },
  { code: "ja-JP", label: "日本語", lang: "ja-JP" },
  { code: "ko-KR", label: "한국어", lang: "ko-KR" },
  { code: "de-DE", label: "Deutsch", lang: "de-DE" },
  { code: "fr-FR", label: "Français", lang: "fr-FR" },
  { code: "es-ES", label: "Español", lang: "es-ES" },
  { code: "pt-BR", label: "Português (Brasil)", lang: "pt-BR" },
  { code: "ru-RU", label: "Русский", lang: "ru-RU" },
]);

export const SITE_COPY = {
  "zh-CN": {
    englishFallbackNotice: "该主题尚无简体中文译文，目前显示英文原文。",
    englishFallbackLinkLabel: "阅读英文原文",
    websiteLabel: "HagiCode 官网",
    productDocsLabel: "产品文档",
    hagiTaskLabel: "HagiTask",
    sourceLabel: "GitHub 源码",
    issuesLabel: "反馈问题",
  },
  "en-US": {
    englishFallbackNotice: "This topic has not been translated yet; the English original is shown.",
    englishFallbackLinkLabel: "Read the English original",
    websiteLabel: "HagiCode website",
    productDocsLabel: "Product docs",
    hagiTaskLabel: "HagiTask",
    sourceLabel: "GitHub source",
    issuesLabel: "Report an issue",
  },
  "zh-Hant": {
    englishFallbackNotice: "此主題尚無繁體中文譯文，目前顯示英文原文。",
    englishFallbackLinkLabel: "閱讀英文原文",
    websiteLabel: "HagiCode 官網",
    productDocsLabel: "產品文件",
    hagiTaskLabel: "HagiTask",
    sourceLabel: "GitHub 原始碼",
    issuesLabel: "回報問題",
  },
  "ja-JP": {
    englishFallbackNotice: "このトピックはまだ日本語に翻訳されていないため、英語の原文を表示しています。",
    englishFallbackLinkLabel: "英語の原文を読む",
    websiteLabel: "HagiCode 公式サイト",
    productDocsLabel: "製品ドキュメント",
    hagiTaskLabel: "HagiTask",
    sourceLabel: "GitHub ソース",
    issuesLabel: "問題を報告",
  },
  "ko-KR": {
    englishFallbackNotice: "이 항목은 아직 한국어로 번역되지 않아 영어 원문을 표시합니다.",
    englishFallbackLinkLabel: "영어 원문 읽기",
    websiteLabel: "HagiCode 웹사이트",
    productDocsLabel: "제품 문서",
    hagiTaskLabel: "HagiTask",
    sourceLabel: "GitHub 소스",
    issuesLabel: "문제 신고",
  },
  "de-DE": {
    englishFallbackNotice: "Dieses Thema ist noch nicht ins Deutsche übersetzt; angezeigt wird das englische Original.",
    englishFallbackLinkLabel: "Englisches Original lesen",
    websiteLabel: "HagiCode-Website",
    productDocsLabel: "Produktdokumentation",
    hagiTaskLabel: "HagiTask",
    sourceLabel: "GitHub-Quellcode",
    issuesLabel: "Problem melden",
  },
  "fr-FR": {
    englishFallbackNotice: "Ce sujet n’est pas encore traduit en français ; la version anglaise est affichée.",
    englishFallbackLinkLabel: "Lire l’original anglais",
    websiteLabel: "Site HagiCode",
    productDocsLabel: "Documentation produit",
    hagiTaskLabel: "HagiTask",
    sourceLabel: "Code source GitHub",
    issuesLabel: "Signaler un problème",
  },
  "es-ES": {
    englishFallbackNotice: "Este tema aún no está traducido al español; se muestra el original en inglés.",
    englishFallbackLinkLabel: "Leer el original en inglés",
    websiteLabel: "Sitio web de HagiCode",
    productDocsLabel: "Documentación del producto",
    hagiTaskLabel: "HagiTask",
    sourceLabel: "Código fuente en GitHub",
    issuesLabel: "Informar de un problema",
  },
  "pt-BR": {
    englishFallbackNotice: "Este tópico ainda não foi traduzido para português; o original em inglês está sendo exibido.",
    englishFallbackLinkLabel: "Ler o original em inglês",
    websiteLabel: "Site do HagiCode",
    productDocsLabel: "Documentação do produto",
    hagiTaskLabel: "HagiTask",
    sourceLabel: "Código-fonte no GitHub",
    issuesLabel: "Relatar um problema",
  },
  "ru-RU": {
    englishFallbackNotice: "Эта тема ещё не переведена на русский; отображается английский оригинал.",
    englishFallbackLinkLabel: "Читать оригинал на английском",
    websiteLabel: "Сайт HagiCode",
    productDocsLabel: "Документация продукта",
    hagiTaskLabel: "HagiTask",
    sourceLabel: "Исходный код на GitHub",
    issuesLabel: "Сообщить о проблеме",
  },
};

/**
 * @param {string | undefined} locale
 * @returns {locale is keyof typeof SITE_COPY}
 */
export function isSiteLocale(locale) {
  return typeof locale === "string" && LANGUAGE_OPTIONS.some(({ code }) => code === locale);
}
