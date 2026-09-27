import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import hagilight from "@hagicode/hagilight-starlight";
import { SITE_COPY } from "./src/i18n/site-copy.mjs";

const localizedCopy = (key) => Object.fromEntries(
  Object.entries(SITE_COPY).map(([locale, copy]) => [locale, copy[key]]),
);
const productDocsUrls = Object.fromEntries(
  Object.keys(SITE_COPY).map((locale) => [
    locale,
    `https://docs.hagicode.com/${locale === "zh-CN" ? "" : `${locale}/`}`,
  ]),
);
const docsRepo = "https://github.com/HagiCode-org/omniroute-docs";
const fiftyOneLaSiteId = "L6b88a5yK4h2Xnci";

export default defineConfig({
  site: "https://omniroute.hagicode.com",
  base: "/",
  integrations: [
    starlight({
      title: "OmniRoute Docs",
      description: "OmniRoute provider and model routing documentation",
      defaultLocale: "en-US",
      locales: {
        "zh-CN": { label: "简体中文", lang: "zh-CN" },
        "en-US": { label: "English", lang: "en-US" },
        "zh-Hant": { label: "繁體中文", lang: "zh-Hant" },
        "ja-JP": { label: "日本語", lang: "ja-JP" },
        "ko-KR": { label: "한국어", lang: "ko-KR" },
        "de-DE": { label: "Deutsch", lang: "de-DE" },
        "fr-FR": { label: "Français", lang: "fr-FR" },
        "es-ES": { label: "Español", lang: "es-ES" },
        "pt-BR": { label: "Português (Brasil)", lang: "pt-BR" },
        "ru-RU": { label: "Русский", lang: "ru-RU" },
      },
      components: {
        MarkdownContent: "./src/components/EnglishFallbackMarkdownContent.astro",
        PageTitle: "./src/components/EnglishFallbackPageTitle.astro",
      },
      social: [
        { icon: "github", label: "OmniRoute source", href: "https://github.com/diegosouzapw/OmniRoute" },
      ],
      plugins: [
        hagilight({
          links: {
            siteId: "omniroute-docs",
            siteUrl: "https://omniroute.hagicode.com/",
            relatedSites: [],
            overrides: {
              home: {
                label: localizedCopy("websiteLabel"),
                href: "https://www.hagicode.com/",
                external: true,
              },
              productDocs: {
                label: localizedCopy("productDocsLabel"),
                href: productDocsUrls,
                external: true,
              },
              github: {
                label: localizedCopy("sourceLabel"),
                href: docsRepo,
                external: true,
              },
              issueFeedback: {
                label: localizedCopy("issuesLabel"),
                href: `${docsRepo}/issues`,
                external: true,
              },
            },
            extraLinks: {
              header: [{
                label: localizedCopy("productDocsLabel"),
                href: productDocsUrls,
                external: true,
              }],
              quick: [{
                label: localizedCopy("hagiTaskLabel"),
                href: "https://tasks.hagicode.com/",
                external: true,
              }],
            },
          },
          promoto: { enabled: true },
          analytics: {
            googleAnalytics: { enabled: true, measurementId: "G-EN03FMT2Q4" },
            fiftyOneLa: { enabled: true, siteId: fiftyOneLaSiteId },
          },
          aiDisclosures: {
            isAITranslation: false,
            isAIAuthor: false,
            sourceLocale: "en-US",
          },
          contentComponents: {
            pageTitle: false,
            markdownContent: false,
          },
        }),
      ],
    }),
    sitemap(),
  ],
});
