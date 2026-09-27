# Upstream selection and retired routes

Pinned source: `vendor/OmniRoute/` (`https://github.com/diegosouzapw/OmniRoute`).
The reviewed English selection and canonical route slugs live in
`scripts/upstream-topics.mjs`. Every slug is served under each of the site's ten
locale prefixes. The root `README.md` becomes each locale home; translations
are read from `docs/i18n/<upstream-locale>/README.md`. Other selected documents
use the same relative source path under `docs/i18n/<upstream-locale>/`.

| Former topic | Replacement |
| --- | --- |
| `overview`, `concepts` | locale home |
| `getting-started`, `installation` | `getting-started/quick-start` |
| `deployment` | `getting-started/self-hosting` |
| `provider-setup`, `client-integration`, `configuration` | `guides/user-guide` |
| `api-keys`, `fallback-routing`, `faq`, `glossary`, `health-checks`, `load-balancing`, `model-routing`, `monitoring`, `openai-compatible-api`, `rate-limits`, `request-format`, `response-format`, `routing-rules`, `security`, `stores-beta/user-guide`, `streaming`, `troubleshooting`, `usage-and-costs` | retired; no equivalent in the selected corpus |

This is a selected reader-facing subset, not a mirror of the upstream
repository. Unselected source links go to the pinned upstream revision.
