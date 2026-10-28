# OmniRoute Docs — Agent Guide

Standalone Astro/Starlight documentation site for OmniRoute. English content is imported at build time from a pinned upstream submodule; reviewed translations and site-owned pages are managed locally. Read this before editing or building.

## Scope and ownership

- Package `@hagicode/omniroute-docs` (private). Built with Astro + Starlight; shared shell from `@hagicode/hagilight` / `@hagicode/hagilight-starlight` pinned to an exact published version in `package.json` (the current compatibility boundary).

## Commands

```sh
git submodule update --init vendor/OmniRoute   # required before first build
pnpm install
pnpm run dev                  # import:upstream + astro dev
pnpm run build                # import:upstream + astro build
pnpm run preview              # serve the production build
pnpm run check                # import:upstream + astro check
pnpm run test:fast             # no-build first pass; delegates to pnpm run check
pnpm run check:translation-reviews        # verify review metadata
pnpm run update:translation-reviews --reviewed  # refresh review metadata
pnpm test                    # node --test test/*.test.mjs
```

Before a pull request: `pnpm run check`, `pnpm run build`, `pnpm test`.

## Architecture

- `vendor/OmniRoute/` — git submodule pinned at revision `release/v3.8.51`. The only article source. The importer publishes every English Markdown under upstream `docs/` (excluding `docs/i18n/` translated subdirs) plus the root `README.md` as the home page; canonical slugs preserved by `scripts/upstream-topics.mjs` (see `docs/upstream-route-map.md`).
- `scripts/import-english.mjs` → `english-source.mjs` (import/validate/rewrite/copy), `upstream-topics.mjs` (route map), `check-translation-baselines.mjs` / `update-translation-reviews.mjs` (review metadata in `src/content/upstream-translation-reviews.json`).
- `src/` — site-owned Starlight config (`content.config.ts`), `components/`, `content/`, `i18n/`, `lib/`, `pages/`, `styles/`. Generated pages and assets land under `src/content/docs/` and are Git-ignored.
- `test/` — `built-pages.test.mjs`, `english-source.test.mjs`, `hagilight-discovery.test.mjs` (robots, sitemap and RSS in `dist/`), `locale-navigation.test.mjs`, `workflows.test.mjs`.
- `.github/gh-pages/` — `esa.jsonc`, `wrangler.jsonc` deployment configs.

## Conventions

- Do **not** edit generated `src/content/docs/` pages; import upstream instead. An absent checkout, broken reference, or changed generated page fails the build rather than publishing unreviewed content.
- To update content: bump the submodule pin, read the selected English docs and their translations, then `pnpm run update:translation-reviews` to refresh `src/content/upstream-translation-reviews.json` (new revision, SHA-256 of English files **with real translations**, and actual `<site-locale>/<English-source-path>` pairs — never English fallbacks). Commit the pin and review metadata together.
- `pnpm run check:translation-reviews` rejects changed or missing review relationships.
- Canonical URL `https://omniroute.hagicode.com` (publishing a build does not activate DNS). English feed at `/rss.xml` and per-language feeds at `/rss.<locale>.xml`.
- Hagilight owns header, locale chooser, footer links, content-width control, article introduction, and the optional campaign banner; OmniRoute Docs keeps fallback-aware title/content wrappers and English-source links. Analytics: GA `G-EN03FMT2Q4`, 51LA `L6b88a5yK4h2Xnci` (51LA screen recording enabled) — review privacy/consent before publishing.

## Testing

- `pnpm run test:fast` does not validate built pages or production output; run `pnpm test` against a completed build (`pnpm run build` first) since some suites assert on built output.

## Deployment / Publishing

- CI (`.github/workflows/docs-ci.yml`) runs the same check/build/test gate on pull requests, pushes to `main` and a weekly schedule, on Node.js 22 (the deploy workflow also uses 22).
- `docs-deploy-gh-pages.yml` publishes a successful `main` build, assembling `dist/`, `esa.jsonc`, and `wrangler.jsonc` at the `gh-pages` branch root. The branch is force-pushed as a fresh orphan commit each time with Jekyll disabled (`force_orphan`, `enable_jekyll: false`), so it keeps no history; the payload is built in `.deploy/gh-pages` and uploaded with hidden files included. The `gh-pages` branch is a publication artifact only; hosting and custom-domain activation are separate operations.

## Package management

- The repository uses pnpm, pinned in `package.json` `packageManager`. Run `corepack enable` once, then `pnpm install`. `pnpm-lock.yaml` is the only lockfile; do not commit `package-lock.json`.
- Settings live in `pnpm-workspace.yaml`. `allowBuilds` lists the dependencies whose install scripts may run (reviewed individually, `false` means reviewed and denied); review any new dependency that has an install script and add it there.
- A local registry mirror belongs in `~/.npmrc` only. Never commit a `registry=` line or a mirror URL; `pnpm run check:registry` (also run in CI) fails on any non-`registry.npmjs.org` `tarball` in the lockfile and on mirror hosts in tracked files.
- Undeclared imports fail under pnpm's strict layout: declare the package instead of hoisting it.
