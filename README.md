# OmniRoute documentation

Standalone Astro/Starlight documentation for OmniRoute. The canonical URL is
`https://omniroute.hagicode.com`; publishing a build does not itself activate
that hostname or configure DNS.
The all-languages documentation feed is available at
`https://omniroute.hagicode.com/rss.xml` and is linked from each page's metadata.
Per-language feeds use `https://omniroute.hagicode.com/rss.<locale>.xml` (for
example, `rss.en-US.xml`).

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

The shared Starlight integration is pinned to `@hagicode/hagilight` and
`@hagicode/hagilight-starlight` 0.2.2; this published version is the
compatibility boundary for the site. Hagilight owns the header, locale chooser,
footer links, content-width control, script-independent HagiCode article
introduction, and optional browser-loaded campaign banner. OmniRoute Docs keeps
its fallback-aware title and content wrappers and English-source links.
Hagilight injects both analytics providers; Starlight owns canonical,
alternate-language, and social metadata, including on English-fallback routes.

The article introduction remains available without JavaScript. The article
promotion and floating campaign banner are enabled by default. The banner has no
local fallback and stays hidden unless eligible remote campaign data is
available. Google Analytics (`G-EN03FMT2Q4`) and 51LA (`L6b88a5yK4h2Xnci`) run
on production pages. Hagilight 0.2.2 enables 51LA screen recording. Review
applicable privacy, consent, and hosting requirements before publishing.

CI runs the same check/build/test gate on pull requests and main. A successful
main-branch publication assembles `dist/`, `esa.jsonc`, and `wrangler.jsonc`
at the `gh-pages` branch root. That branch is a publication artifact only;
hosting and custom-domain activation are separate operations.