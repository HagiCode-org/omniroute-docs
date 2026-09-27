# OmniRoute documentation

Standalone Astro/Starlight documentation for OmniRoute. The canonical URL is
`https://omniroute.hagicode.com`; publishing a build does not itself activate
that hostname or configure DNS.

## Local development

Use Node.js 22 and npm from this repository:

```sh
npm ci
npm run dev
```

Before opening a pull request, run `npm run check`, `npm run build`, and
`npm test`. `npm run preview` serves a completed production build locally.
The check and build scripts import English content before running Astro.

## Content and translations

Edit the revision-controlled OmniRoute Markdown in `content-source/en-US/`,
not the generated English files under `src/content/docs/en-US/`. The importer
(`npm run import:english`) validates sources, copies local assets, rewrites
relative topic links, and generates English pages and non-English fallbacks.
Generated pages are ignored by Git; locale homes and authored translations
under `src/content/docs/` are committed and must never be overwritten by
the importer. A missing source or referenced asset fails import.

All ten locale homes are authored. The 26 Simplified Chinese topic shells are
authored pages; the other locale topics show marked English content until
translated. To add or revise an authored topic translation, compare it to
the current English source, update the translated Markdown, then update its
reviewed source hash in `src/content/translation-baselines.json`.
`npm run check:translation-baselines` rejects missing or stale baselines.
Homes and generated fallbacks do not require review baselines.

## Integrations and publication

The article-end HagiCode introduction is rendered without JavaScript.
The floating promotion also starts with local content; optional browser-only
campaign data may replace it when valid. Analytics is disabled by default:
`.env.example` leaves `PUBLIC_OMNIROUTE_GA_ID` and
`PUBLIC_OMNIROUTE_51LA_ID` blank. Only enable site-owned IDs after confirming
hosting and privacy requirements. Even when configured, provider requests
run only on `omniroute.hagicode.com`, never in local previews.

CI runs the same check/build/test gate on pull requests and main. A successful
main-branch publication assembles `dist/`, `esa.jsonc`, and `wrangler.jsonc`
at the `gh-pages` branch root. That branch is a publication artifact only;
hosting and custom-domain activation are separate operations.