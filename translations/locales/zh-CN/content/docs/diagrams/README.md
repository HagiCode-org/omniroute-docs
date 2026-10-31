---
title: "图表"
version: 3.8.49
lastUpdated: 2026-07-17
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

并非每张图表都来自 `.mmd` 源文件。手工编写的 SVG 位于本目录根部，仅使用 SMIL 实现动画（不使用 JS，也不加载外部字体），因此可以在 GitHub 的 `<img>` 沙箱中播放：

| 文件                                                   | 使用位置         | 说明                                                                                                                                                              |
| ------------------------------------------------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [tier-cascade.svg](./tier-cascade.svg)                 | README.md（根目录） | 动画化的 4 层自动回退级联（16 秒循环，共 4 个阶段）。直接编辑 SVG，没有 `.mmd` 源文件。                                                                          |
| [pool-fair-share.svg](./pool-fair-share.svg)           | —（未使用）      | 动画展示密钥池公平份额配额（由宽松到严格，16 秒循环）。直接编辑 SVG，没有 `.mmd` 源文件。                                                                        |
| [combo-always-on.svg](./combo-always-on.svg)           | 样式参考         | 动画展示优先级组合回退（4 层，16 秒循环）。直接编辑 SVG，没有 `.mmd` 源文件。                                                                                     |
| [cli-terminal.svg](./cli-terminal.svg)                 | README.md（根目录） | 紧凑的半高动画终端（1200×350）：3 条真实 CLI 命令循环播放，带打字机效果与滚动的子命令提示条；第一帧为已完成的提供者界面。直接编辑 SVG，没有 `.mmd` 源文件。           |
| [compression-pipeline.svg](./compression-pipeline.svg) | README.md（根目录） | 动画化的 12 引擎压缩漏斗（8 秒循环）。直接编辑 SVG，没有 `.mmd` 源文件。                                                                                          |
| [free-tier-budget.svg](./free-tier-budget.svg)         | README.md（根目录） | 动画化的免费层预算卡片（醒目标题约 1.62B/月，含 17 个池与 Groq 上限的预算条、按池划分的网格、注册赠送额度，10 秒循环）。直接编辑 SVG，没有 `.mmd` 源文件。           |
| [readme-hero.svg](./readme-hero.svg)                   | README.md（根目录） | 动画化的首屏卡片（标语、实时的提供者与免费访问标题、全宽压缩条演示、6 个统计标签）。直接编辑 SVG，没有 `.mmd` 源文件。                                              |
| [promise-pillars.svg](./promise-pillars.svg)           | README.md（根目录） | 动画化的“The Promise”6 支柱卡片（12 秒边框高亮扫过）。直接编辑 SVG，没有 `.mmd` 源文件。                                                                          |
| [why-pain-fix.svg](./why-pain-fix.svg)                 | README.md（根目录） | 动画化的“Why OmniRoute”10 行痛点与解决方案对照表（15 秒绿色行高亮扫过）。直接编辑 SVG，没有 `.mmd` 源文件。                                                          |
| [strategies-grid.svg](./strategies-grid.svg)           | README.md（根目录） | 动画网格，展示 19 种路由策略中的 18 种；`cache-optimized` 仍记录在相邻表格中。直接编辑 SVG，没有 `.mmd` 源文件。                                                  |
| [privacy-local.svg](./privacy-local.svg)               | README.md（根目录） | 动画化的“Private & Local-First”11 行保障台账，附带回执标签（16 秒绿色行高亮扫过）。直接编辑 SVG，没有 `.mmd` 源文件。                                            |
| [resilience-layers.svg](./resilience-layers.svg)       | README.md（根目录） | 动画化的 3 层弹性卡片（熔断器状态 CLOSED→OPEN→HALF-OPEN、密钥冷却加 ×2 退避、模型锁定——18 秒循环）。直接编辑 SVG，没有 `.mmd` 源文件。                          |

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
