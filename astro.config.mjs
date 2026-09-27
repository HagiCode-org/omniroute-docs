import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";

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
        Head: "./src/components/StarlightHead.astro",
        Header: "./src/components/StarlightHeader.astro",
        Footer: "./src/components/StarlightFooter.astro",
        LanguageSelect: "./src/components/StarlightLanguageSelect.astro",
        MarkdownContent: "./src/components/EnglishFallbackMarkdownContent.astro",
        PageTitle: "./src/components/EnglishFallbackPageTitle.astro",
      },
      customCss: ["./src/styles/site.css"],
      social: [
        { icon: "github", label: "OmniRoute source", href: "https://github.com/diegosouzapw/OmniRoute" },
      ],
    }),
    sitemap(),
  ],
});
