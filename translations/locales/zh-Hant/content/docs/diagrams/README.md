---
title: "圖表"
version: 3.8.49
lastUpdated: 2026-07-17
---

# 圖表

OmniRoute v3.8.0 架構流程的 Mermaid 原始檔（`.mmd`）及匯出的 SVG。

## 正式圖表

| 原始檔                                             | 匯出檔                                   | 使用位置                                                                       |
| -------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| [request-pipeline.mmd](./request-pipeline.mmd)     | [SVG](./exported/request-pipeline.svg)   | docs/architecture/ARCHITECTURE.md, docs/architecture/CODEBASE_DOCUMENTATION.md |
| [auto-combo-scoring.mmd](./auto-combo-scoring.mmd) | [SVG](./exported/auto-combo-scoring.svg) | docs/routing/AUTO-COMBO.md                                                     |
| [resilience-3layers.mmd](./resilience-3layers.mmd) | [SVG](./exported/resilience-3layers.svg) | docs/architecture/RESILIENCE_GUIDE.md, CLAUDE.md                               |
| [i18n-flow.mmd](./i18n-flow.mmd)                   | [SVG](./exported/i18n-flow.svg)          | docs/guides/I18N.md                                                            |
| [mcp-tools.mmd](./mcp-tools.mmd)                   | [SVG](./exported/mcp-tools.svg)          | docs/frameworks/MCP-SERVER.md                                                  |
| [cloud-agent-flow.mmd](./cloud-agent-flow.mmd)     | [SVG](./exported/cloud-agent-flow.svg)   | docs/frameworks/CLOUD_AGENT.md                                                 |
| [authz-pipeline.mmd](./authz-pipeline.mmd)         | [SVG](./exported/authz-pipeline.svg)     | docs/architecture/AUTHZ_GUIDE.md                                               |
| [db-schema-overview.mmd](./db-schema-overview.mmd) | [SVG](./exported/db-schema-overview.svg) | docs/architecture/CODEBASE_DOCUMENTATION.md                                    |

## 手工繪製的動畫圖表

並非每張圖表都來自 `.mmd` 原始檔。手工撰寫的 SVG 位於本目錄根部，僅使用 SMIL 實現動畫（不使用 JS，也不載入外部字型），因此可以在 GitHub 的 `<img>` 沙箱中播放：

| 檔案                                                   | 使用位置            | 說明                                                                                                                                                  |
| ------------------------------------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [tier-cascade.svg](./tier-cascade.svg)                 | README.md（根目錄） | 動畫化的 4 層自動 fallback 串接（16 秒循環，共 4 個階段）。直接編輯 SVG，沒有 `.mmd` 原始檔。                                                         |
| [pool-fair-share.svg](./pool-fair-share.svg)           | —（未使用）         | 動畫展示金鑰池公平份額配額（由寬鬆到嚴格，16 秒循環）。直接編輯 SVG，沒有 `.mmd` 原始檔。                                                             |
| [combo-always-on.svg](./combo-always-on.svg)           | 樣式參考            | 動畫展示優先順序組合 fallback（4 層，16 秒循環）。直接編輯 SVG，沒有 `.mmd` 原始檔。                                                                  |
| [cli-terminal.svg](./cli-terminal.svg)                 | README.md（根目錄） | 精簡的半高動畫終端機（1200×350）：3 條真實 CLI 指令循環播放，帶打字機效果與捲動的子指令提示列；第一個畫面為已完成的提供者畫面。直接編輯 SVG，沒有 `.mmd` 原始檔。 |
| [compression-pipeline.svg](./compression-pipeline.svg) | README.md（根目錄） | 動畫化的 12 引擎壓縮漏斗（8 秒循環）。直接編輯 SVG，沒有 `.mmd` 原始檔。                                                                              |
| [free-tier-budget.svg](./free-tier-budget.svg)         | README.md（根目錄） | 動畫化的免費層預算卡片（醒目標題約 1.62B/月，含 17 個池與 Groq 上限的預算列、依池劃分的格狀檢視、註冊贈送額度，10 秒循環）。直接編輯 SVG，沒有 `.mmd` 原始檔。 |
| [readme-hero.svg](./readme-hero.svg)                   | README.md（根目錄） | 動畫化的首屏卡片（標語、即時的提供者與免費存取標題、全寬壓縮列示範、6 個統計標籤）。直接編輯 SVG，沒有 `.mmd` 原始檔。                                 |
| [promise-pillars.svg](./promise-pillars.svg)           | README.md（根目錄） | 動畫化的「The Promise」6 支柱卡片（12 秒邊框高亮掃過）。直接編輯 SVG，沒有 `.mmd` 原始檔。                                                            |
| [why-pain-fix.svg](./why-pain-fix.svg)                 | README.md（根目錄） | 動畫化的「Why OmniRoute」10 列痛點與解決方案對照表（15 秒綠色列高亮掃過）。直接編輯 SVG，沒有 `.mmd` 原始檔。                                         |
| [strategies-grid.svg](./strategies-grid.svg)           | README.md（根目錄） | 動畫格狀圖，展示 19 種路由策略中的 18 種；`cache-optimized` 仍記錄在相鄰表格中。直接編輯 SVG，沒有 `.mmd` 原始檔。                                     |
| [privacy-local.svg](./privacy-local.svg)               | README.md（根目錄） | 動畫化的「Private & Local-First」11 列保障清單，附帶 receipt 標籤（16 秒綠色列高亮掃過）。直接編輯 SVG，沒有 `.mmd` 原始檔。                           |
| [resilience-layers.svg](./resilience-layers.svg)       | README.md（根目錄） | 動畫化的 3 層韌性卡片（breaker 狀態 CLOSED→OPEN→HALF-OPEN、金鑰 cooldown 加 ×2 退避、模型鎖定——18 秒循環）。直接編輯 SVG，沒有 `.mmd` 原始檔。          |

## 如何更新

1. 編輯 `*.mmd`。
2. 重新轉譯：`npm run docs:render-diagrams`（使用 `@mermaid-js/mermaid-cli`）。
3. 同時提交 `.mmd` 和 `.svg`。

如果本機沒有 `@mermaid-js/mermaid-cli`，請先安裝一次：

```bash
npm install -g @mermaid-js/mermaid-cli
```

該指令碼會把 `docs/diagrams/` 下的每個 `.mmd` 轉譯為 `docs/diagrams/exported/*.svg`，背景為白色，適用於深色和淺色主題。

## 在文件中引用

從 `docs/<subfolder>/` 下的文件引用時，相對路徑為 `../diagrams/...`：

```markdown
![Request pipeline](../diagrams/exported/request-pipeline.svg)

> Source: [../diagrams/request-pipeline.mmd](../diagrams/request-pipeline.mmd)
```

從儲存庫根目錄（例如 `CLAUDE.md`）引用時：

```markdown
![Resilience layers](./exported/resilience-3layers.svg)
```

## 慣例

- 每張圖表只表達一個概念。不要試圖把整個平台放進一張圖裡。
- 節點標籤保持簡短（3-6 個詞）。節點內換行請使用 `<br/>`。
- 管線優先使用 `flowchart LR`，分層模型優先使用 `flowchart TB`。
- 互動式（請求/回應）流程使用 `sequenceDiagram`。
- 資料庫結構概覽使用 `erDiagram`。
- 在同一次提交中同時更新 `.mmd` 與 `.svg`，保持兩者嚴格同步。
