---
title: "Диаграммы"
version: 3.8.49
lastUpdated: 2026-07-17
---

# Диаграммы

Исходники Mermaid (`.mmd`) и экспортированные SVG для архитектурных потоков OmniRoute v3.8.0.

## Канонические диаграммы

| Источник                                           | Экспорт                                  | Где используется                                                               |
| -------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| [request-pipeline.mmd](./request-pipeline.mmd)     | [SVG](./exported/request-pipeline.svg)   | docs/architecture/ARCHITECTURE.md, docs/architecture/CODEBASE_DOCUMENTATION.md |
| [auto-combo-scoring.mmd](./auto-combo-scoring.mmd) | [SVG](./exported/auto-combo-scoring.svg) | docs/routing/AUTO-COMBO.md                                                     |
| [resilience-3layers.mmd](./resilience-3layers.mmd) | [SVG](./exported/resilience-3layers.svg) | docs/architecture/RESILIENCE_GUIDE.md, CLAUDE.md                               |
| [i18n-flow.mmd](./i18n-flow.mmd)                   | [SVG](./exported/i18n-flow.svg)          | docs/guides/I18N.md                                                            |
| [mcp-tools.mmd](./mcp-tools.mmd)                   | [SVG](./exported/mcp-tools.svg)          | docs/frameworks/MCP-SERVER.md                                                  |
| [cloud-agent-flow.mmd](./cloud-agent-flow.mmd)     | [SVG](./exported/cloud-agent-flow.svg)   | docs/frameworks/CLOUD_AGENT.md                                                 |
| [authz-pipeline.mmd](./authz-pipeline.mmd)         | [SVG](./exported/authz-pipeline.svg)     | docs/architecture/AUTHZ_GUIDE.md                                               |
| [db-schema-overview.mmd](./db-schema-overview.mmd) | [SVG](./exported/db-schema-overview.svg) | docs/architecture/CODEBASE_DOCUMENTATION.md                                    |

## Анимированные диаграммы, созданные вручную

Не каждая диаграмма создаётся из источника `.mmd`. Созданные вручную SVG лежат в корне
этого каталога и анимируются только средствами SMIL (без JS и внешних шрифтов), поэтому
воспроизводятся внутри песочницы `<img>` на GitHub:

| Файл                                                   | Где используется  | Примечания                                                                                                                                                                                                                                                         |
| ------------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [tier-cascade.svg](./tier-cascade.svg)                 | README.md (корень) | Анимированный каскад автоматического fallback по 4 уровням (цикл 16 с, 4 акта). Редактируйте SVG напрямую — источника `.mmd` нет.                                                                                                                         |
| [pool-fair-share.svg](./pool-fair-share.svg)           | — (не используется) | Анимированная справедливая квота пула ключей (от щедрой к строгой, цикл 16 с). Редактируйте SVG напрямую — источника `.mmd` нет.                                                                                                                         |
| [combo-always-on.svg](./combo-always-on.svg)           | эталон стиля      | Анимированный fallback приоритетного combo (4 слоя, цикл 16 с). Редактируйте SVG напрямую — источника `.mmd` нет.                                                                                                                                         |
| [cli-terminal.svg](./cli-terminal.svg)                 | README.md (корень) | Компактный анимированный терминал половинной высоты (1200×350): 3 реальные команды CLI сменяют друг друга с эффектом печатной машинки и прокручиваемой лентой подкоманд; первый кадр — готовый экран провайдеров. Редактируйте SVG напрямую — источника `.mmd` нет. |
| [compression-pipeline.svg](./compression-pipeline.svg) | README.md (корень) | Анимированная воронка сжатия из 12 движков (цикл 8 с). Редактируйте SVG напрямую — источника `.mmd` нет.                                                                                                                                                  |
| [free-tier-budget.svg](./free-tier-budget.svg)         | README.md (корень) | Анимированная карточка бюджета бесплатного уровня (количественный заголовок ~1.62B/мес, шкала бюджета из 17 пулов и лимитов Groq, сетка по пулам, стартовые кредиты, цикл 10 с). Редактируйте SVG напрямую — источника `.mmd` нет.                          |
| [readme-hero.svg](./readme-hero.svg)                   | README.md (корень) | Анимированная hero-карточка (слоган, актуальный заголовок о провайдерах и бесплатном доступе, демонстрация сжатия на всю ширину, 6 чипов статистики). Редактируйте SVG напрямую — источника `.mmd` нет.                                                  |
| [promise-pillars.svg](./promise-pillars.svg)           | README.md (корень) | Анимированная карточка «The Promise» с 6 опорами (проход подсветки границы, цикл 12 с). Редактируйте SVG напрямую — источника `.mmd` нет.                                                                                                                 |
| [why-pain-fix.svg](./why-pain-fix.svg)                 | README.md (корень) | Анимированный реестр «Why OmniRoute» из 10 строк «проблема — решение» (проход зелёной подсветки строк, цикл 15 с). Редактируйте SVG напрямую — источника `.mmd` нет.                                                                                       |
| [strategies-grid.svg](./strategies-grid.svg)           | README.md (корень) | Анимированная сетка, иллюстрирующая 18 из 19 стратегий маршрутизации; `cache-optimized` по-прежнему описана в соседней таблице. Редактируйте SVG напрямую — источника `.mmd` нет.                                                                          |
| [privacy-local.svg](./privacy-local.svg)               | README.md (корень) | Анимированный реестр гарантий «Private & Local-First» из 11 строк с чипами receipt (проход зелёной подсветки строк, цикл 16 с). Редактируйте SVG напрямую — источника `.mmd` нет.                                                                         |
| [resilience-layers.svg](./resilience-layers.svg)       | README.md (корень) | Анимированная карточка трёх слоёв отказоустойчивости (состояния breaker CLOSED→OPEN→HALF-OPEN, key cooldown с ×2 backoff, блокировка модели — циклы 18 с). Редактируйте SVG напрямую — источника `.mmd` нет.                                              |

## Как обновлять

1. Отредактируйте `*.mmd`.
2. Выполните повторный рендеринг: `npm run docs:render-diagrams` (использует `@mermaid-js/mermaid-cli`).
3. Закоммитьте и `.mmd`, и `.svg`.

Если `@mermaid-js/mermaid-cli` локально недоступен, установите его один раз:

```bash
npm install -g @mermaid-js/mermaid-cli
```

Скрипт рендерит каждый `.mmd` из `docs/diagrams/` в `docs/diagrams/exported/*.svg`
на белом фоне, подходящем и для тёмной, и для светлой темы.

## Ссылки на диаграммы из документа

Из документа в `docs/<subfolder>/` относительный путь выглядит как `../diagrams/...`:

```markdown
![Request pipeline](../diagrams/exported/request-pipeline.svg)

> Source: [../diagrams/request-pipeline.mmd](../diagrams/request-pipeline.mmd)
```

Из корня репозитория (например, `CLAUDE.md`):

```markdown
![Resilience layers](./exported/resilience-3layers.svg)
```

## Соглашения

- Одна концепция на диаграмму. Не пытайтесь уместить всю платформу на одной схеме.
- Делайте подписи узлов короткими (3–6 слов). Для переводов строки внутри узлов используйте `<br/>`.
- Для конвейеров предпочитайте `flowchart LR`, для многослойных моделей — `flowchart TB`.
- Для интерактивных потоков (запрос/ответ) используйте `sequenceDiagram`.
- Для обзоров схемы базы данных используйте `erDiagram`.
- Обновляйте `.mmd` и `.svg` в одном коммите. Держите их синхронными.
