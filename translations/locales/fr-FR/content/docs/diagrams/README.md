---
title: "Diagrammes"
version: 3.8.49
lastUpdated: 2026-07-17
---

# Diagrammes

Sources Mermaid (`.mmd`) et SVG exportés pour les flux d'architecture d'OmniRoute v3.8.0.

## Diagrammes de référence

| Source                                             | Exporté                                  | Utilisé dans                                                                   |
| -------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| [request-pipeline.mmd](./request-pipeline.mmd)     | [SVG](./exported/request-pipeline.svg)   | docs/architecture/ARCHITECTURE.md, docs/architecture/CODEBASE_DOCUMENTATION.md |
| [auto-combo-scoring.mmd](./auto-combo-scoring.mmd) | [SVG](./exported/auto-combo-scoring.svg) | docs/routing/AUTO-COMBO.md                                                     |
| [resilience-3layers.mmd](./resilience-3layers.mmd) | [SVG](./exported/resilience-3layers.svg) | docs/architecture/RESILIENCE_GUIDE.md, CLAUDE.md                               |
| [i18n-flow.mmd](./i18n-flow.mmd)                   | [SVG](./exported/i18n-flow.svg)          | docs/guides/I18N.md                                                            |
| [mcp-tools.mmd](./mcp-tools.mmd)                   | [SVG](./exported/mcp-tools.svg)          | docs/frameworks/MCP-SERVER.md                                                  |
| [cloud-agent-flow.mmd](./cloud-agent-flow.mmd)     | [SVG](./exported/cloud-agent-flow.svg)   | docs/frameworks/CLOUD_AGENT.md                                                 |
| [authz-pipeline.mmd](./authz-pipeline.mmd)         | [SVG](./exported/authz-pipeline.svg)     | docs/architecture/AUTHZ_GUIDE.md                                               |
| [db-schema-overview.mmd](./db-schema-overview.mmd) | [SVG](./exported/db-schema-overview.svg) | docs/architecture/CODEBASE_DOCUMENTATION.md                                    |

## Diagrammes animés réalisés à la main

Tous les diagrammes ne proviennent pas d'une source `.mmd`. Les SVG réalisés à la main se
trouvent à la racine de ce répertoire et s'animent uniquement avec SMIL (sans JS, sans polices
externes), de sorte qu'ils s'exécutent dans le sandbox `<img>` de GitHub :

| Fichier                                                | Utilisé dans     | Notes                                                                                                                                                                                                                                                              |
| ------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [tier-cascade.svg](./tier-cascade.svg)                 | README.md (racine) | Cascade animée d'auto-fallback à 4 niveaux (boucle de 16 s, 4 actes). Modifiez directement le SVG : il n'existe pas de source `.mmd`.                                                                                                                              |
| [pool-fair-share.svg](./pool-fair-share.svg)           | — (inutilisé)    | Quota animé de répartition équitable d'un pool de clés (généreux → strict, boucle de 16 s). Modifiez directement le SVG : il n'existe pas de source `.mmd`.                                                                                                        |
| [combo-always-on.svg](./combo-always-on.svg)           | référence de style | Fallback animé d'un combo prioritaire (4 couches, boucle de 16 s). Modifiez directement le SVG : il n'existe pas de source `.mmd`.                                                                                                                                |
| [cli-terminal.svg](./cli-terminal.svg)                 | README.md (racine) | Terminal animé compact de demi-hauteur (1200×350) : 3 vraies commandes CLI en alternance avec effet machine à écrire et bandeau défilant de sous-commandes ; la première image correspond à l'écran des fournisseurs terminé. Modifiez directement le SVG : il n'existe pas de source `.mmd`. |
| [compression-pipeline.svg](./compression-pipeline.svg) | README.md (racine) | Entonnoir de compression animé à 12 moteurs (boucle de 8 s). Modifiez directement le SVG : il n'existe pas de source `.mmd`.                                                                                                                                       |
| [free-tier-budget.svg](./free-tier-budget.svg)         | README.md (racine) | Carte animée du budget du niveau gratuit (titre chiffré ~1.62B/mo, barre de budget de 17 pools + plafonds Groq, grille par pool, crédits d'inscription, boucle de 10 s). Modifiez directement le SVG : il n'existe pas de source `.mmd`.                             |
| [readme-hero.svg](./readme-hero.svg)                   | README.md (racine) | Carte hero animée (slogan, titre en direct sur les fournisseurs et l'accès gratuit, démo de barre de compression pleine largeur, 6 pastilles de statistiques). Modifiez directement le SVG : il n'existe pas de source `.mmd`.                                      |
| [promise-pillars.svg](./promise-pillars.svg)           | README.md (racine) | Carte animée "The Promise" à 6 piliers (balayage de mise en évidence des bordures sur 12 s). Modifiez directement le SVG : il n'existe pas de source `.mmd`.                                                                                                      |
| [why-pain-fix.svg](./why-pain-fix.svg)                 | README.md (racine) | Registre animé "Why OmniRoute" de 10 lignes problème/solution (balayage vert des lignes sur 15 s). Modifiez directement le SVG : il n'existe pas de source `.mmd`.                                                                                                |
| [strategies-grid.svg](./strategies-grid.svg)           | README.md (racine) | Grille animée illustrant 18 des 19 stratégies de routage ; `cache-optimized` reste documentée dans le tableau adjacent. Modifiez directement le SVG : il n'existe pas de source `.mmd`.                                                                             |
| [privacy-local.svg](./privacy-local.svg)               | README.md (racine) | Registre animé "Private & Local-First" de 11 lignes de garanties avec pastilles de receipt (balayage vert des lignes sur 16 s). Modifiez directement le SVG : il n'existe pas de source `.mmd`.                                                                   |
| [resilience-layers.svg](./resilience-layers.svg)       | README.md (racine) | Carte animée de résilience à 3 couches (états du breaker CLOSED→OPEN→HALF-OPEN, cooldown de clé avec backoff ×2, verrouillage de modèle — boucles de 18 s). Modifiez directement le SVG : il n'existe pas de source `.mmd`.                                         |

## Comment mettre à jour

1. Modifiez `*.mmd`.
2. Régénérez le rendu : `npm run docs:render-diagrams` (utilise `@mermaid-js/mermaid-cli`).
3. Validez ensemble `.mmd` et `.svg`.

Si `@mermaid-js/mermaid-cli` n'est pas disponible en local, installez-le une seule fois :

```bash
npm install -g @mermaid-js/mermaid-cli
```

Le script génère chaque `.mmd` de `docs/diagrams/` dans `docs/diagrams/exported/*.svg`
avec un fond blanc, adapté aux thèmes sombre et clair.

## Lier depuis un document

Depuis un document situé dans `docs/<subfolder>/`, le chemin relatif devient `../diagrams/...` :

```markdown
![Request pipeline](../diagrams/exported/request-pipeline.svg)

> Source: [../diagrams/request-pipeline.mmd](../diagrams/request-pipeline.mmd)
```

Depuis la racine du dépôt (par exemple `CLAUDE.md`) :

```markdown
![Resilience layers](./exported/resilience-3layers.svg)
```

## Conventions

- Un concept par diagramme. N'essayez pas de faire tenir toute la plateforme dans un seul schéma.
- Gardez des libellés de nœuds courts (3 à 6 mots). Utilisez `<br/>` pour les sauts de ligne à l'intérieur des nœuds.
- Préférez `flowchart LR` pour les pipelines et `flowchart TB` pour les modèles en couches.
- Utilisez `sequenceDiagram` pour les flux interactifs (requête/réponse).
- Utilisez `erDiagram` pour les vues d'ensemble du schéma de base de données.
- Mettez à jour `.mmd` et `.svg` dans le même commit. Gardez-les synchronisés.
