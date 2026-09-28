import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import hagilight from "@hagicode/hagilight-starlight";
import { locales as hagilightLocales } from "@hagicode/hagilight-starlight/locales";

export default defineConfig({
  site: "https://omniroute.hagicode.com",
  base: "/",
  integrations: [
    starlight({
      title: "OmniRoute Docs",
      description: "OmniRoute provider and model routing documentation",
      defaultLocale: "en-US",
      locales: Object.fromEntries(
        Object.values(hagilightLocales).map((locale) => [locale.lang, locale]),
      ),
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
          },
          rss: { includeDocs: true, includeBlog: true },
          seo: {
            title: "OmniRoute Docs",
            description: "OmniRoute provider and model routing documentation",
            organization: { name: "HagiCode", url: "https://www.hagicode.com/" },
          },
          aiDisclosures: {
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
