---
title: "图表"
version: 3.8.53
lastUpdated: 2026-10-27
---

# 图表

OmniRoute v3.8.0 架构流程的 Mermaid 源文件（`.mmd`）及导出的 SVG。

## 规范图表

| 源文件                                             | 导出文件                                 | 使用位置                                                                       |
| -------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| [request-pipeline.mmd](./request-pipeline.mmd)     | [SVG](./exported/request-pipeline.svg)   | docs/architecture/ARCHITECTURE.md, docs/architecture/CODEBASE_DOCUMENTATION.md |
| [auto-combo-scoring.mmd](./auto-combo-scoring.mmd) | [SVG](./exported/auto-combo-scoring.svg) | docs/routing/AUTO-COMBO.md                                                     |
| [resilience-3layers.mmd](./resilience-3layers.mmd) | [SVG](./exported/resilience-3layers.svg) | docs/architecture/RESILIENCE_GUIDE.md, CLAUDE.md                               |
| [i18n-flow.mmd](./i18n-flow.mmd)                   | [SVG](./exported/i18n-flow.svg)          | docs/guides/I18N.md                                                            |
| [mcp-tools.mmd](./mcp-tools.mmd)                   | [SVG](./exported/mcp-tools.svg)          | docs/frameworks/MCP-SERVER.md                                                  |
| [cloud-agent-flow.mmd](./cloud-agent-flow.mmd)     | [SVG](./exported/cloud-agent-flow.svg)   | docs/frameworks/CLOUD_AGENT.md                                                 |
| [authz-pipeline.mmd](./authz-pipeline.mmd)         | [SVG](./exported/authz-pipeline.svg)     | docs/architecture/AUTHZ_GUIDE.md                                               |
| [db-schema-overview.mmd](./db-schema-overview.mmd) | [SVG](./exported/db-schema-overview.svg) | docs/architecture/CODEBASE_DOCUMENTATION.md                                    |

## 手工绘制的动画图表

并非每张图表都来自 `.mmd` 源文件。位于本目录根部的 SVG 仅使用 SMIL 实现动画（不使用 JS，也不发起外部请求），因此可以在 GitHub 的 `<img>` 沙箱中播放。README 中的十二张图表由 `scripts/docs/gen-readme-<name>.mjs` 生成（见下一节）；`pool-fair-share.svg` 与 `combo-always-on.svg` 仍是手工绘制的两张：

| 文件                                                   | 使用位置         | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [readme-hero.svg](./readme-hero.svg)                   | README.md（根目录） | 首屏卡片（1200×548）：衬线体标题、安装命令、六项统计数字（提供者数、免费层数、每月免费令牌数、令牌节省、路由策略数、起步成本），位于套件卡片之上，并带有一个脉动的强调色圆点。由 `scripts/docs/gen-readme-hero.mjs` 生成；使用 `npm run docs:readme-diagrams` 重新生成；提交的文件过期时，单元测试 `tests/unit/docs/readme-hero-svg.test.ts` 会失败。                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| [free-tier-budget.svg](./free-tier-budget.svg)         | README.md（根目录） | 免费层预算卡片（1200×842）：按池去重的预算条（统计可量化的周期性池，Groq 的各模型上限合并为一段）、按池划分的网格，注册赠送额度与无上限的提供者分开展示（10 秒循环）。所有数字均来自实时目录加载器（`open-sse/config/freeModelCatalog.ts` 中的 `computeFreeModelTotals()`）；目录变更对 CI 的影响记录在 `docs/architecture/QUALITY_GATES.md` → `docs-sync-strict` 中。由 `scripts/docs/gen-readme-free-tier-budget.mjs` 生成；使用 `npm run docs:readme-diagrams` 重新生成；提交的文件过期时，单元测试 `tests/unit/docs/readme-free-tier-budget-svg.test.ts` 会失败。                                                                                                                                                                                                                                                                                                                                                                        |
| [works-zero-config.svg](./works-zero-config.svg)       | README.md（根目录） | 零配置流程（1200×430）：三个步骤方块（安装并启动 → 连接提供者 → 使用你的工具）从左到右淡入，圆点沿连接线移动，最后的检查标记脉动。由 `scripts/docs/gen-readme-works-zero-config.mjs` 生成；使用 `npm run docs:readme-diagrams` 重新生成；提交的文件过期时，单元测试 `tests/unit/docs/readme-works-zero-config-svg.test.ts` 会失败。                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| [promise-pillars.svg](./promise-pillars.svg)           | README.md（根目录） | “The Promise”的六支柱卡片（1200×540），柔和的高亮在方块之间依次扫过（12 秒循环）。由 `scripts/docs/gen-readme-promise-pillars.mjs` 生成；使用 `npm run docs:readme-diagrams` 重新生成；提交的文件过期时，单元测试 `tests/unit/docs/readme-promise-pillars-svg.test.ts` 会失败。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| [why-pain-fix.svg](./why-pain-fix.svg)                 | README.md（根目录） | “Why OmniRoute”的十行痛点与解决方案对照表（1200×664），首帧即可阅读，高亮沿各行向下扫过（15 秒循环）。由 `scripts/docs/gen-readme-why-pain-fix.mjs` 生成；使用 `npm run docs:readme-diagrams` 重新生成；提交的文件过期时，单元测试 `tests/unit/docs/readme-why-pain-fix-svg.test.ts` 会失败。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| [tier-cascade.svg](./tier-cascade.svg)                 | README.md（根目录） | 4 层自动回退级联（1200×650）：动画请求路径依次尝试订阅、API 密钥、低成本与免费四个层级。由 `scripts/docs/gen-readme-tier-cascade.mjs` 生成；使用 `npm run docs:readme-diagrams` 重新生成；提交的文件过期时，单元测试 `tests/unit/docs/readme-tier-cascade-svg.test.ts` 会失败。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| [strategies-grid.svg](./strategies-grid.svg)           | README.md（根目录） | 网格（1200×644）展示 20 种路由策略中的 18 种，每条路径上都有一个圆点移动；`cache-optimized` 与 `quota-weighted` 仍记录在相邻表格中。由 `scripts/docs/gen-readme-strategies-grid.mjs` 生成；使用 `npm run docs:readme-diagrams` 重新生成；提交的文件过期时，单元测试 `tests/unit/docs/readme-strategies-grid-svg.test.ts` 会失败。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| [resilience-layers.svg](./resilience-layers.svg)       | README.md（根目录） | 三个堆叠的弹性面板（1200×726）：熔断器状态 CLOSED → OPEN → HALF-OPEN、冷却中的密钥（带退避）时其他密钥照常服务、模型被锁定时同级模型照常服务。由 `scripts/docs/gen-readme-resilience-layers.mjs` 生成；使用 `npm run docs:readme-diagrams` 重新生成；提交的文件过期时，单元测试 `tests/unit/docs/readme-resilience-layers-svg.test.ts` 会失败。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| [comparison-table.svg](./comparison-table.svg)         | README.md（根目录） | OmniRoute 与 9router、OpenRouter、CLIProxyAPI 和 LiteLLM 的对比（1200×780）：能力行自上而下淡入，OmniRoute 列高亮。由 `scripts/docs/gen-readme-comparison-table.mjs` 生成；使用 `npm run docs:readme-diagrams` 重新生成；提交的文件过期时，单元测试 `tests/unit/docs/readme-comparison-table-svg.test.ts` 会失败。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| [privacy-local.svg](./privacy-local.svg)               | README.md（根目录） | “Private & Local-First”的十一行保障对照表（1200×650），绿色高亮沿各行向下扫过（16 秒循环）。由 `scripts/docs/gen-readme-privacy-local.mjs` 生成；使用 `npm run docs:readme-diagrams` 重新生成；提交的文件过期时，单元测试 `tests/unit/docs/readme-privacy-local-svg.test.ts` 会失败。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| [cli-terminal.svg](./cli-terminal.svg)                 | README.md（根目录） | 紧凑的动画终端（1200×350）：三条真实的 CLI 命令以打字机效果依次出现，并配有滚动的子命令提示条；第一帧为已完成的提供者界面（18 秒循环）。由 `scripts/docs/gen-readme-cli-terminal.mjs` 生成；使用 `npm run docs:readme-diagrams` 重新生成；提交的文件过期时，单元测试 `tests/unit/docs/readme-cli-terminal-svg.test.ts` 会失败。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| [compression-pipeline.svg](./compression-pipeline.svg) | README.md（根目录） | 12 引擎的令牌漏斗（1200×460）：令牌点从客户端出发，在途经的引擎中逐个消散，幸存者抵达提供者，同时引擎格子依次亮起（8 秒循环）。由 `scripts/docs/gen-readme-compression-pipeline.mjs` 生成；使用 `npm run docs:readme-diagrams` 重新生成；提交的文件过期时，单元测试 `tests/unit/docs/readme-compression-pipeline-svg.test.ts` 会失败。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| [pool-fair-share.svg](./pool-fair-share.svg)           | —（未使用）      | 动画展示密钥池公平份额配额（由宽松到严格，16 秒循环）。直接编辑 SVG，没有 `.mmd` 源文件。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| [combo-always-on.svg](./combo-always-on.svg)           | 样式参考         | 动画展示优先级组合回退（4 层，16 秒循环）。直接编辑 SVG，没有 `.mmd` 源文件。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

## 生成的 README 图表

上表中的十二张 README 图表并非手工编辑：每张都是其 `scripts/docs/gen-readme-<name>.mjs` 的输出。`npm run docs:readme-diagrams`（`scripts/docs/gen-readme-diagrams.mjs`）会按 README 中的顺序重新生成全部图表，并为每个文件输出一行（含其大小）。三个共用模块负责公共工作：

- `scripts/docs/readme-fonts.mjs`：将套件的 `@fontsource` woff2 字体文件（Instrument Serif、Inter、IBM Plex Mono）子集化为图表实际绘制的字形，并以 `data:` URI 的形式返回 `@font-face` 规则。GitHub Markdown 不携带 CSS 和字体，camo 代理会拦截所有外部请求（包括字体），而内联数据可以保留。字体子集仅包含拉丁字符，因此箭头和几何符号会有意回退到系统字体栈，每个符号都须在 `SYMBOL_FALLBACKS` 中按名称允许；其他未覆盖的字形会在子集化之前抛出错误。
- `scripts/docs/readme-diagram-theme.mjs`：套件调色板（从 `packages/ui-kit/src/ci-tokens.css` 复制）以及文本角色。每个文件都自带主题：浅色值位于 `:root`，深色值位于 `prefers-color-scheme: dark` 之下，由查看者的浏览器计算，即使经过 camo 代理也是如此。
- `scripts/docs/readme-svg-shots.mjs <file.svg> <outdir>`：camo 兼容性测试工具。它通过带有 camo 所观察到的 `Content-Security-Policy` 与 `image/svg+xml` 内容类型的 `<img>` 标签提供 SVG，分别截取浅色和深色两帧，并报告页面发出的外部字体请求数（必须为 0）。

规则：数字保留在 `<text>` 节点中，不转换为路径，因为 `check:docs-counts` 会从原始文件中读取它们；图表绘制的每个字符串同时也是字体子集的输入，因此任何字形都必须先嵌入才能绘制；每个文件须控制在 200 KB 的目标之内（其过期检测测试会断言这一点），500 KB 是任何 README 图片的硬上限（SVG studio 校验器的规则）。工作流程：修改生成器（或其读取的数据），运行 `npm run docs:readme-diagrams`，然后将生成器与 SVG 一同提交；过期的 SVG 会使 `test-unit` 任务失败。

## 如何更新

1. 编辑 `*.mmd`。
2. 重新渲染：`npm run docs:render-diagrams`（使用 `@mermaid-js/mermaid-cli`）。
3. 同时提交 `.mmd` 和 `.svg`。

如果本地没有 `@mermaid-js/mermaid-cli`，请先安装一次：

```bash
npm install -g @mermaid-js/mermaid-cli
```

该脚本会把 `docs/diagrams/` 下的每个 `.mmd` 渲染为 `docs/diagrams/exported/*.svg`，背景为白色，适用于深色和浅色主题。

## 在文档中引用

从 `docs/<subfolder>/` 下的文档引用时，相对路径为 `../diagrams/...`：

```markdown
![Request pipeline](../diagrams/exported/request-pipeline.svg)

> Source: [../diagrams/request-pipeline.mmd](../diagrams/request-pipeline.mmd)
```

从仓库根目录（例如 `CLAUDE.md`）引用时：

```markdown
![Resilience layers](./exported/resilience-3layers.svg)
```

## 约定

- 每张图表只表达一个概念。不要试图把整个平台放进一张图里。
- 节点标签保持简短（3-6 个词）。节点内换行请使用 `<br/>`。
- 流水线优先使用 `flowchart LR`，分层模型优先使用 `flowchart TB`。
- 交互式（请求/响应）流程使用 `sequenceDiagram`。
- 数据库结构概览使用 `erDiagram`。
- 在同一次提交中同时更新 `.mmd` 与 `.svg`，保持二者严格同步。
