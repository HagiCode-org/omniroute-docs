---
title: "Diagramme"
version: 3.8.49
lastUpdated: 2026-07-17
---

# Diagramme

Mermaid-Quellen (`.mmd`) und exportierte SVGs für die Architekturabläufe von OmniRoute v3.8.0.

## Kanonische Diagramme

| Quelle                                             | Exportiert                               | Verwendet in                                                                   |
| -------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| [request-pipeline.mmd](./request-pipeline.mmd)     | [SVG](./exported/request-pipeline.svg)   | docs/architecture/ARCHITECTURE.md, docs/architecture/CODEBASE_DOCUMENTATION.md |
| [auto-combo-scoring.mmd](./auto-combo-scoring.mmd) | [SVG](./exported/auto-combo-scoring.svg) | docs/routing/AUTO-COMBO.md                                                     |
| [resilience-3layers.mmd](./resilience-3layers.mmd) | [SVG](./exported/resilience-3layers.svg) | docs/architecture/RESILIENCE_GUIDE.md, CLAUDE.md                               |
| [i18n-flow.mmd](./i18n-flow.mmd)                   | [SVG](./exported/i18n-flow.svg)          | docs/guides/I18N.md                                                            |
| [mcp-tools.mmd](./mcp-tools.mmd)                   | [SVG](./exported/mcp-tools.svg)          | docs/frameworks/MCP-SERVER.md                                                  |
| [cloud-agent-flow.mmd](./cloud-agent-flow.mmd)     | [SVG](./exported/cloud-agent-flow.svg)   | docs/frameworks/CLOUD_AGENT.md                                                 |
| [authz-pipeline.mmd](./authz-pipeline.mmd)         | [SVG](./exported/authz-pipeline.svg)     | docs/architecture/AUTHZ_GUIDE.md                                               |
| [db-schema-overview.mmd](./db-schema-overview.mmd) | [SVG](./exported/db-schema-overview.svg) | docs/architecture/CODEBASE_DOCUMENTATION.md                                    |

## Von Hand erstellte animierte Diagramme

Nicht jedes Diagramm stammt aus einer `.mmd`-Quelle. Von Hand erstellte SVGs liegen im
Stammverzeichnis dieses Verzeichnisses und werden ausschließlich mit SMIL animiert (kein JS, keine externen Schriftarten), sodass sie
in der `<img>`-Sandbox von GitHub abgespielt werden:

| Datei                                                  | Verwendet in               | Hinweise                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [tier-cascade.svg](./tier-cascade.svg)                 | README.md (Stammverzeichnis) | Animierte 4-Stufen-Kaskade mit automatischem fallback (16-s-Schleife, 4 Akte). Bearbeiten Sie die SVG direkt — es gibt keine `.mmd`-Quelle.                                                                                                                                         |
| [pool-fair-share.svg](./pool-fair-share.svg)           | — (ungenutzt)              | Animiertes Fair-Share-Kontingent eines Schlüsselpools (großzügig → streng, 16-s-Schleife). Bearbeiten Sie die SVG direkt — es gibt keine `.mmd`-Quelle.                                                                                                                              |
| [combo-always-on.svg](./combo-always-on.svg)           | Stilreferenz               | Animierter fallback eines Priority-Combos (4 Ebenen, 16-s-Schleife). Bearbeiten Sie die SVG direkt — es gibt keine `.mmd`-Quelle.                                                                                                                                                    |
| [cli-terminal.svg](./cli-terminal.svg)                 | README.md (Stammverzeichnis) | Kompaktes, halbhohes animiertes Terminal (1200×350): 3 echte CLI-Befehle im Wechsel mit Schreibmaschineneffekt + scrollendem Unterbefehls-Ticker; erstes Bild = fertiger Providers-Bildschirm. Bearbeiten Sie die SVG direkt — es gibt keine `.mmd`-Quelle.                          |
| [compression-pipeline.svg](./compression-pipeline.svg) | README.md (Stammverzeichnis) | Animierter Kompressionstrichter mit 12 Engines (8-s-Schleife). Bearbeiten Sie die SVG direkt — es gibt keine `.mmd`-Quelle.                                                                                                                                                         |
| [free-tier-budget.svg](./free-tier-budget.svg)         | README.md (Stammverzeichnis) | Animierte Budgetkarte für die kostenlose Stufe (quantifizierte Schlagzeile ~1.62B/Monat, Budgetbalken mit 17 Pools + Groq-Obergrenzen, Raster pro Pool, Anmeldeguthaben, 10-s-Schleife). Bearbeiten Sie die SVG direkt — es gibt keine `.mmd`-Quelle.                                |
| [readme-hero.svg](./readme-hero.svg)                   | README.md (Stammverzeichnis) | Animierte Hero-Karte (Tagline, Live-Schlagzeile zu Providern/kostenlosem Zugang, Kompressionsbalken-Demo in voller Breite, 6 Kennzahl-Chips). Bearbeiten Sie die SVG direkt — es gibt keine `.mmd`-Quelle.                                                                           |
| [promise-pillars.svg](./promise-pillars.svg)           | README.md (Stammverzeichnis) | Animierte Karte "The Promise" mit 6 Säulen (12-s-Durchlauf der Rahmenhervorhebung). Bearbeiten Sie die SVG direkt — es gibt keine `.mmd`-Quelle.                                                                                                                                     |
| [why-pain-fix.svg](./why-pain-fix.svg)                 | README.md (Stammverzeichnis) | Animierte "Why OmniRoute"-Gegenüberstellung von 10 Zeilen Problem und Lösung (15-s-Durchlauf grüner Zeilenmarkierung). Bearbeiten Sie die SVG direkt — es gibt keine `.mmd`-Quelle.                                                                                                  |
| [strategies-grid.svg](./strategies-grid.svg)           | README.md (Stammverzeichnis) | Animiertes Raster, das 18 der 19 Routing-Strategien veranschaulicht; `cache-optimized` bleibt in der angrenzenden Tabelle dokumentiert. Bearbeiten Sie die SVG direkt — es gibt keine `.mmd`-Quelle.                                                                                 |
| [privacy-local.svg](./privacy-local.svg)               | README.md (Stammverzeichnis) | Animierte "Private & Local-First"-Übersicht der Zusagen mit 11 Zeilen und receipt-Chips (16-s-Durchlauf grüner Zeilenmarkierung). Bearbeiten Sie die SVG direkt — es gibt keine `.mmd`-Quelle.                                                                                       |
| [resilience-layers.svg](./resilience-layers.svg)       | README.md (Stammverzeichnis) | Animierte Resilienzkarte mit 3 Ebenen (breaker-Zustände CLOSED→OPEN→HALF-OPEN, Schlüssel-cooldown mit ×2-Backoff, Modellsperre — 18-s-Schleifen). Bearbeiten Sie die SVG direkt — es gibt keine `.mmd`-Quelle.                                                                       |

## So aktualisieren Sie ein Diagramm

1. Bearbeiten Sie `*.mmd`.
2. Rendern Sie neu: `npm run docs:render-diagrams` (verwendet `@mermaid-js/mermaid-cli`).
3. Committen Sie sowohl `.mmd` als auch `.svg`.

Falls `@mermaid-js/mermaid-cli` lokal nicht verfügbar ist, installieren Sie es einmalig:

```bash
npm install -g @mermaid-js/mermaid-cli
```

Das Skript rendert jede `.mmd` in `docs/diagrams/` nach `docs/diagrams/exported/*.svg`
mit weißem Hintergrund, geeignet für dunkle und helle Themes.

## Aus einem Dokument verlinken

Aus einem Dokument in `docs/<subfolder>/` lautet der relative Pfad `../diagrams/...`:

```markdown
![Request pipeline](../diagrams/exported/request-pipeline.svg)

> Source: [../diagrams/request-pipeline.mmd](../diagrams/request-pipeline.mmd)
```

Aus dem Stammverzeichnis des Repositorys (z. B. `CLAUDE.md`):

```markdown
![Resilience layers](./exported/resilience-3layers.svg)
```

## Konventionen

- Ein Konzept pro Diagramm. Versuchen Sie nicht, die gesamte Plattform in ein Diagramm zu packen.
- Halten Sie Knotenbeschriftungen kurz (3-6 Wörter). Verwenden Sie `<br/>` für Zeilenumbrüche innerhalb von Knoten.
- Bevorzugen Sie `flowchart LR` für Pipelines und `flowchart TB` für geschichtete Modelle.
- Verwenden Sie `sequenceDiagram` für interaktive Abläufe (Anfrage/Antwort).
- Verwenden Sie `erDiagram` für Übersichten des Datenbankschemas.
- Aktualisieren Sie `.mmd` und `.svg` im selben Commit. Halten Sie beide im Gleichschritt.
