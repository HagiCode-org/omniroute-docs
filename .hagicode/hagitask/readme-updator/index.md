---
public: true
multilingual: false
style: product
---

# README requirements

## Product focus

- Introduce OmniRoute Docs as the standalone documentation site for OmniRoute, the AI gateway that routes models and providers, at https://omniroute.hagicode.com.
- Describe what readers get: upstream OmniRoute guides, reference and architecture documents in ten site languages with clearly marked English fallback pages, and RSS feeds for new documentation.
- Address people evaluating or using OmniRoute who want to read its documentation. Lead with the reader value and a prominent site link, not how the site is built.

## Required content

- Open with a short introduction and the link to https://omniroute.hagicode.com.
- Describe the reading areas that exist, such as getting started, guides and architecture, and the language selection with English fallback.
- Give the English feed `https://omniroute.hagicode.com/rss.xml` and the per-language feed pattern `https://omniroute.hagicode.com/rss.<locale>.xml`.
- Link to the OmniRoute project for the product itself.

## Exclusions

- Exclude tokens, secret values, internal hosts, machine-specific paths and private links.
- Keep repository maintenance instructions out of the README: repository layout, internal architecture, CI, build internals, content import, translation review and publication workflow.
- Do not list documentation topics the site does not show.
