# Upstream documentation routes

The pinned `vendor/OmniRoute/` checkout tracks the commit from
[`release/v3.8.51`](https://github.com/diegosouzapw/OmniRoute/tree/release/v3.8.51).
The root `README.md` becomes the site home. Every English `.md` file recursively
under `docs/` (except locale subdirectories of `docs/i18n/`, which supply translations) is published
under the same directory hierarchy: `docs/guides/DOCKER_GUIDE.md` becomes
`/<site-locale>/guides/docker-guide/`. A nested `README.md` becomes
`/<site-locale>/<directory>/`. The existing quick-start, self-hosting,
and user-guide slugs are retained by `scripts/upstream-topics.mjs`.

Matching upstream translations are resolved from
`docs/i18n/<upstream-locale>/<English-source-path>`. Missing translations
publish clearly marked English fallback pages. Links to English documents
within the corpus resolve to the site; links to files outside it point to
the pinned upstream revision.

Old site-authored article routes are retired; new routes follow the upstream
directory structure rather than an individually curated four-topic menu.
