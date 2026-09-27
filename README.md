# OmniRoute documentation

Standalone Astro/Starlight documentation for OmniRoute. The canonical URL is
`https://omniroute.hagicode.com`; publishing a build does not itself activate
that hostname or configure DNS.

## Local development

Use Node.js 22 and npm from this repository:

```sh
git submodule update --init vendor/OmniRoute
npm ci
npm run dev
```

Before opening a pull request, run `npm run check`, `npm run build`, and
`npm test`. `npm run preview` serves a completed production build locally.
The check and build scripts verify the pinned upstream translations and import
content before running Astro. CI initializes the submodule in both workflows.

## Content and translations

The only article source is the pinned `vendor/OmniRoute/` checkout at the
`release/v3.8.51` revision. The importer recursively publishes every English
Markdown file under upstream `docs/` (excluding translated-language
subdirectories under `docs/i18n/`), plus the root `README.md` as the home page. Existing canonical slugs
are preserved by `scripts/upstream-topics.mjs`; see `docs/upstream-route-map.md`
for the complete route rule. `npm run import:upstream` reads these files and their available translations,
validates local references and markup, rewrites selected links to site routes,
and copies local assets. It produces locale homes and topics under
`src/content/docs/`, with a visible English fallback where no translation
exists. Generated pages and assets are ignored by Git. An absent checkout,
broken reference, or changed generated page fails instead of publishing
unreviewed content.

To update upstream content, update the submodule pin, read the selected English
documents and their supported-language translations, then run
`npm run update:translation-reviews` to refresh
`src/content/upstream-translation-reviews.json` with the new revision, SHA-256
hashes of English files **with real translations**, and the list of actual
translated `<site-locale>/<English-source-path>` pairs. Do not list English
fallbacks. `npm run check:translation-reviews` rejects changed or missing
review relationships. Commit the new submodule pin and review metadata
together; do not edit generated pages.

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