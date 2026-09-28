# OmniRoute Docs — Agent Guide

Standalone Astro/Starlight documentation site for OmniRoute. English content is imported at build time from a pinned upstream submodule; reviewed translations and site-owned pages are managed locally. Read this before editing or building.

## Scope and ownership

- Package `@hagicode/omniroute-docs` (private). Built with Astro + Starlight; shared shell from `@hagicode/hagilight` / `@hagicode/hagilight-starlight` pinned to `0.2.3` (the compatibility boundary — do not bump casually).
- This repository is **documentation-maintenance scope only** for agent edits: modify `AGENTS.md` as instructed. Treat source, generated, and cache files as read-only unless the user expands scope.

## Commands

```sh
git submodule update --init vendor/OmniRoute   # required before first build
npm ci
npm run dev                  # import:upstream + astro dev
npm run build                # import:upstream + astro build
npm run preview              # serve the production build
npm run check                # import:upstream + astro check
npm run check:translation-reviews        # verify review metadata
npm run update:translation-reviews --reviewed  # refresh review metadata
npm test                    # node --test test/*.test.mjs
```

Before a pull request: `npm run check`, `npm run build`, `npm test`.

## Architecture

- `vendor/OmniRoute/` — git submodule pinned at revision `release/v3.8.51`. The only article source. The importer publishes every English Markdown under upstream `docs/` (excluding `docs/i18n/` translated subdirs) plus the root `README.md` as the home page; canonical slugs preserved by `scripts/upstream-topics.mjs` (see `docs/upstream-route-map.md`).
- `scripts/import-english.mjs` → `english-source.mjs` (import/validate/rewrite/copy), `upstream-topics.mjs` (route map), `check-translation-baselines.mjs` / `update-translation-reviews.mjs` (review metadata in `src/content/upstream-translation-reviews.json`).
- `src/` — site-owned Starlight config (`content.config.ts`, `hagilight.d.ts`), `components/`, `content/`, `i18n/`, `lib/`, `pages/`, `styles/`. Generated pages and assets land under `src/content/docs/` and are Git-ignored.
- `test/` — `built-pages.test.mjs`, `english-source.test.mjs`, `locale-navigation.test.mjs`, `workflows.test.mjs`.
- `.github/gh-pages/` — `esa.jsonc`, `wrangler.jsonc` deployment configs.

## Conventions

- Do **not** edit generated `src/content/docs/` pages; import upstream instead. An absent checkout, broken reference, or changed generated page fails the build rather than publishing unreviewed content.
- To update content: bump the submodule pin, read the selected English docs and their translations, then `npm run update:translation-reviews` to refresh `src/content/upstream-translation-reviews.json` (new revision, SHA-256 of English files **with real translations**, and actual `<site-locale>/<English-source-path>` pairs — never English fallbacks). Commit the pin and review metadata together.
- `npm run check:translation-reviews` rejects changed or missing review relationships.
- Canonical URL `https://omniroute.hagicode.com` (publishing a build does not activate DNS). English feed at `/rss.xml`, all-language feed at `/rss.all.xml`, and per-language feeds at `/rss.<locale>.xml`.
- Hagilight owns header, locale chooser, footer links, content-width control, article introduction, and the optional campaign banner; OmniRoute Docs keeps fallback-aware title/content wrappers and English-source links. Analytics: GA `G-EN03FMT2Q4`, 51LA `L6b88a5yK4h2Xnci` (51LA screen recording enabled) — review privacy/consent before publishing.

## Testing

- `npm test` runs `node --test test/*.test.mjs`, exercising built pages, the English importer, locale navigation, and CI workflows.
- Run tests against a completed build (`npm run build` first) since some suites assert on built output.

## Deployment / Publishing

- CI (`.github/workflows/docs-ci.yml`) runs the same check/build/test gate on pull requests and `main`.
- `docs-deploy-gh-pages.yml` publishes a successful `main` build, assembling `dist/`, `esa.jsonc`, and `wrangler.jsonc` at the `gh-pages` branch root. The `gh-pages` branch is a publication artifact only; hosting and custom-domain activation are separate operations.
