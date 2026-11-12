---
title: "Diagramas"
version: 3.8.49
lastUpdated: 2026-07-17
---

# Diagramas

Fuentes Mermaid (`.mmd`) y SVG exportados de los flujos de arquitectura de OmniRoute v3.8.0.

## Diagramas canónicos

| Fuente                                             | Exportado                                | Usado en                                                                       |
| -------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| [request-pipeline.mmd](./request-pipeline.mmd)     | [SVG](./exported/request-pipeline.svg)   | docs/architecture/ARCHITECTURE.md, docs/architecture/CODEBASE_DOCUMENTATION.md |
| [auto-combo-scoring.mmd](./auto-combo-scoring.mmd) | [SVG](./exported/auto-combo-scoring.svg) | docs/routing/AUTO-COMBO.md                                                     |
| [resilience-3layers.mmd](./resilience-3layers.mmd) | [SVG](./exported/resilience-3layers.svg) | docs/architecture/RESILIENCE_GUIDE.md, CLAUDE.md                               |
| [i18n-flow.mmd](./i18n-flow.mmd)                   | [SVG](./exported/i18n-flow.svg)          | docs/guides/I18N.md                                                            |
| [mcp-tools.mmd](./mcp-tools.mmd)                   | [SVG](./exported/mcp-tools.svg)          | docs/frameworks/MCP-SERVER.md                                                  |
| [cloud-agent-flow.mmd](./cloud-agent-flow.mmd)     | [SVG](./exported/cloud-agent-flow.svg)   | docs/frameworks/CLOUD_AGENT.md                                                 |
| [authz-pipeline.mmd](./authz-pipeline.mmd)         | [SVG](./exported/authz-pipeline.svg)     | docs/architecture/AUTHZ_GUIDE.md                                               |
| [db-schema-overview.mmd](./db-schema-overview.mmd) | [SVG](./exported/db-schema-overview.svg) | docs/architecture/CODEBASE_DOCUMENTATION.md                                    |

## Diagramas animados creados a mano

No todos los diagramas proceden de una fuente `.mmd`. Los SVG creados a mano se encuentran en
la raíz de este directorio y se animan únicamente con SMIL (sin JS, sin fuentes externas), de
modo que se reproducen dentro del sandbox de `<img>` de GitHub:

| Archivo                                                | Usado en            | Notas                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [tier-cascade.svg](./tier-cascade.svg)                 | README.md (raíz)    | Cascada animada de auto-fallback de 4 niveles (bucle de 16 s, 4 actos). Edite el SVG directamente: no existe fuente `.mmd`.                                                                                                                                                   |
| [pool-fair-share.svg](./pool-fair-share.svg)           | — (sin uso)         | Cuota animada de reparto equitativo de un pool de claves (de generoso a estricto, bucle de 16 s). Edite el SVG directamente: no existe fuente `.mmd`.                                                                                                                         |
| [combo-always-on.svg](./combo-always-on.svg)           | referencia de estilo | Fallback animado de combo por prioridad (4 capas, bucle de 16 s). Edite el SVG directamente: no existe fuente `.mmd`.                                                                                                                                                         |
| [cli-terminal.svg](./cli-terminal.svg)                 | README.md (raíz)    | Terminal animada compacta de media altura (1200×350): 3 comandos reales de la CLI que se alternan con efecto de máquina de escribir y un ticker desplazable de subcomandos; el primer fotograma es la pantalla de proveedores completada. Edite el SVG directamente: no existe fuente `.mmd`. |
| [compression-pipeline.svg](./compression-pipeline.svg) | README.md (raíz)    | Embudo animado de compresión de 12 motores (bucle de 8 s). Edite el SVG directamente: no existe fuente `.mmd`.                                                                                                                                                                |
| [free-tier-budget.svg](./free-tier-budget.svg)         | README.md (raíz)    | Tarjeta animada del presupuesto del nivel gratuito (titular cuantificado de ~1.62B/mes, barra de presupuesto de 17 pools y límites de Groq, cuadrícula por pool, créditos de registro, bucle de 10 s). Edite el SVG directamente: no existe fuente `.mmd`.                      |
| [readme-hero.svg](./readme-hero.svg)                   | README.md (raíz)    | Tarjeta hero animada (eslogan, titular en vivo de proveedores y acceso gratuito, demostración de barra de compresión a todo el ancho, 6 chips de estadísticas). Edite el SVG directamente: no existe fuente `.mmd`.                                                            |
| [promise-pillars.svg](./promise-pillars.svg)           | README.md (raíz)    | Tarjeta animada "The Promise" de 6 pilares (barrido de resaltado de borde de 12 s). Edite el SVG directamente: no existe fuente `.mmd`.                                                                                                                                       |
| [why-pain-fix.svg](./why-pain-fix.svg)                 | README.md (raíz)    | Registro animado "Why OmniRoute" de 10 filas de problema frente a solución (barrido de fila verde de 15 s). Edite el SVG directamente: no existe fuente `.mmd`.                                                                                                                |
| [strategies-grid.svg](./strategies-grid.svg)           | README.md (raíz)    | Cuadrícula animada que ilustra 18 de las 19 estrategias de enrutamiento; `cache-optimized` sigue documentada en la tabla adyacente. Edite el SVG directamente: no existe fuente `.mmd`.                                                                                        |
| [privacy-local.svg](./privacy-local.svg)               | README.md (raíz)    | Registro animado "Private & Local-First" de 11 filas de garantías con chips de receipt (barrido de fila verde de 16 s). Edite el SVG directamente: no existe fuente `.mmd`.                                                                                                    |
| [resilience-layers.svg](./resilience-layers.svg)       | README.md (raíz)    | Tarjeta animada de resiliencia de 3 capas (estados del breaker CLOSED→OPEN→HALF-OPEN, cooldown de clave con backoff ×2, bloqueo de modelo; bucles de 18 s). Edite el SVG directamente: no existe fuente `.mmd`.                                                               |

## Cómo actualizar

1. Edite `*.mmd`.
2. Vuelva a renderizar: `npm run docs:render-diagrams` (usa `@mermaid-js/mermaid-cli`).
3. Confirme en el commit tanto `.mmd` como `.svg`.

Si `@mermaid-js/mermaid-cli` no está disponible en local, instálelo una sola vez:

```bash
npm install -g @mermaid-js/mermaid-cli
```

El script renderiza cada `.mmd` de `docs/diagrams/` en `docs/diagrams/exported/*.svg`
con fondo blanco, adecuado tanto para el tema oscuro como para el claro.

## Enlazar desde un documento

Desde un documento en `docs/<subfolder>/`, la ruta relativa pasa a ser `../diagrams/...`:

```markdown
![Request pipeline](../diagrams/exported/request-pipeline.svg)

> Source: [../diagrams/request-pipeline.mmd](../diagrams/request-pipeline.mmd)
```

Desde la raíz del repositorio (por ejemplo, `CLAUDE.md`):

```markdown
![Resilience layers](./exported/resilience-3layers.svg)
```

## Convenciones

- Un concepto por diagrama. No intente reunir toda la plataforma en un solo gráfico.
- Mantenga cortas las etiquetas de los nodos (3-6 palabras). Use `<br/>` para los saltos de línea dentro de los nodos.
- Prefiera `flowchart LR` para pipelines y `flowchart TB` para modelos por capas.
- Use `sequenceDiagram` para flujos interactivos (solicitud/respuesta).
- Use `erDiagram` para las vistas generales del esquema de base de datos.
- Actualice `.mmd` y `.svg` en el mismo commit. Manténgalos sincronizados.
