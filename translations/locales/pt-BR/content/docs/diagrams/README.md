---
title: "Diagramas"
version: 3.8.49
lastUpdated: 2026-07-17
---

# Diagramas

Fontes Mermaid (`.mmd`) e SVGs exportados dos fluxos de arquitetura do OmniRoute v3.8.0.

## Diagramas canônicos

| Fonte                                              | Exportado                                | Usado em                                                                       |
| -------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| [request-pipeline.mmd](./request-pipeline.mmd)     | [SVG](./exported/request-pipeline.svg)   | docs/architecture/ARCHITECTURE.md, docs/architecture/CODEBASE_DOCUMENTATION.md |
| [auto-combo-scoring.mmd](./auto-combo-scoring.mmd) | [SVG](./exported/auto-combo-scoring.svg) | docs/routing/AUTO-COMBO.md                                                     |
| [resilience-3layers.mmd](./resilience-3layers.mmd) | [SVG](./exported/resilience-3layers.svg) | docs/architecture/RESILIENCE_GUIDE.md, CLAUDE.md                               |
| [i18n-flow.mmd](./i18n-flow.mmd)                   | [SVG](./exported/i18n-flow.svg)          | docs/guides/I18N.md                                                            |
| [mcp-tools.mmd](./mcp-tools.mmd)                   | [SVG](./exported/mcp-tools.svg)          | docs/frameworks/MCP-SERVER.md                                                  |
| [cloud-agent-flow.mmd](./cloud-agent-flow.mmd)     | [SVG](./exported/cloud-agent-flow.svg)   | docs/frameworks/CLOUD_AGENT.md                                                 |
| [authz-pipeline.mmd](./authz-pipeline.mmd)         | [SVG](./exported/authz-pipeline.svg)     | docs/architecture/AUTHZ_GUIDE.md                                               |
| [db-schema-overview.mmd](./db-schema-overview.mmd) | [SVG](./exported/db-schema-overview.svg) | docs/architecture/CODEBASE_DOCUMENTATION.md                                    |

## Diagramas animados criados à mão

Nem todo diagrama vem de uma fonte `.mmd`. Os SVGs criados à mão ficam na raiz deste
diretório e são animados apenas com SMIL (sem JS, sem fontes externas), de modo que são
reproduzidos dentro do sandbox de `<img>` do GitHub:

| Arquivo                                                | Usado em         | Observações                                                                                                                                                                                                                                                  |
| ------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [tier-cascade.svg](./tier-cascade.svg)                 | README.md (raiz) | Cascata animada de fallback automático em 4 níveis (loop de 16s, 4 atos). Edite o SVG diretamente — não há fonte `.mmd`.                                                                                                                                       |
| [pool-fair-share.svg](./pool-fair-share.svg)           | — (não usado)    | Cota animada de divisão justa do pool de chaves (generosa → estrita, loop de 16s). Edite o SVG diretamente — não há fonte `.mmd`.                                                                                                                              |
| [combo-always-on.svg](./combo-always-on.svg)           | referência de estilo | Fallback animado de combo por prioridade (4 camadas, loop de 16s). Edite o SVG diretamente — não há fonte `.mmd`.                                                                                                                                              |
| [cli-terminal.svg](./cli-terminal.svg)                 | README.md (raiz) | Terminal animado compacto de meia altura (1200×350): 3 comandos reais da CLI em ciclo com efeito de máquina de escrever + ticker rolante de subcomandos; primeiro quadro = tela de provedores concluída. Edite o SVG diretamente — não há fonte `.mmd`.         |
| [compression-pipeline.svg](./compression-pipeline.svg) | README.md (raiz) | Funil animado de compressão com 12 engines (loop de 8s). Edite o SVG diretamente — não há fonte `.mmd`.                                                                                                                                                        |
| [free-tier-budget.svg](./free-tier-budget.svg)         | README.md (raiz) | Cartão animado do orçamento do nível gratuito (manchete quantificada de ~1.62B/mês, barra de orçamento com 17 pools + limites do Groq, grade por pool, créditos de cadastro, loop de 10s). Edite o SVG diretamente — não há fonte `.mmd`.                        |
| [readme-hero.svg](./readme-hero.svg)                   | README.md (raiz) | Cartão hero animado (slogan, manchete ao vivo de provedores/acesso gratuito, demonstração de barra de compressão em largura total, 6 chips de estatísticas). Edite o SVG diretamente — não há fonte `.mmd`.                                                    |
| [promise-pillars.svg](./promise-pillars.svg)           | README.md (raiz) | Cartão animado "The Promise" com 6 pilares (varredura de destaque de borda de 12s). Edite o SVG diretamente — não há fonte `.mmd`.                                                                                                                             |
| [why-pain-fix.svg](./why-pain-fix.svg)                 | README.md (raiz) | Registro animado "Why OmniRoute" com 10 linhas de problema versus solução (varredura de linha verde de 15s). Edite o SVG diretamente — não há fonte `.mmd`.                                                                                                    |
| [strategies-grid.svg](./strategies-grid.svg)           | README.md (raiz) | Grade animada que ilustra 18 das 19 estratégias de roteamento; `cache-optimized` continua documentada na tabela adjacente. Edite o SVG diretamente — não há fonte `.mmd`.                                                                                       |
| [privacy-local.svg](./privacy-local.svg)               | README.md (raiz) | Registro animado "Private & Local-First" com 11 linhas de garantias e chips de receipt (varredura de linha verde de 16s). Edite o SVG diretamente — não há fonte `.mmd`.                                                                                        |
| [resilience-layers.svg](./resilience-layers.svg)       | README.md (raiz) | Cartão animado de resiliência em 3 camadas (estados do breaker CLOSED→OPEN→HALF-OPEN, cooldown de chave com backoff ×2, bloqueio de modelo — loops de 18s). Edite o SVG diretamente — não há fonte `.mmd`.                                                      |

## Como atualizar

1. Edite `*.mmd`.
2. Renderize novamente: `npm run docs:render-diagrams` (usa `@mermaid-js/mermaid-cli`).
3. Faça o commit de `.mmd` e `.svg`.

Se `@mermaid-js/mermaid-cli` não estiver disponível localmente, instale-o uma vez:

```bash
npm install -g @mermaid-js/mermaid-cli
```

O script renderiza cada `.mmd` de `docs/diagrams/` em `docs/diagrams/exported/*.svg`
com fundo branco, adequado tanto para temas escuros quanto claros.

## Como criar links a partir de um documento

A partir de um documento em `docs/<subfolder>/`, o caminho relativo passa a ser `../diagrams/...`:

```markdown
![Request pipeline](../diagrams/exported/request-pipeline.svg)

> Source: [../diagrams/request-pipeline.mmd](../diagrams/request-pipeline.mmd)
```

A partir da raiz do repositório (por exemplo, `CLAUDE.md`):

```markdown
![Resilience layers](./exported/resilience-3layers.svg)
```

## Convenções

- Um conceito por diagrama. Não tente encaixar a plataforma inteira em um único gráfico.
- Mantenha os rótulos dos nós curtos (3 a 6 palavras). Use `<br/>` para quebras de linha dentro dos nós.
- Prefira `flowchart LR` para pipelines e `flowchart TB` para modelos em camadas.
- Use `sequenceDiagram` para fluxos interativos (requisição/resposta).
- Use `erDiagram` para visões gerais do esquema do banco de dados.
- Atualize `.mmd` e `.svg` no mesmo commit. Mantenha os dois em sincronia.
