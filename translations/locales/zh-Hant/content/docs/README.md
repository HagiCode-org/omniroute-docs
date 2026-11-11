---
title: "OmniRoute 文件"
version: 3.8.40
lastUpdated: 2026-06-28
---

# OmniRoute 文件

OmniRoute 文件集的導覽索引。主題按用途分組，方便你快速找到所需內容。

> 想了解專案概覽、安裝步驟或發行說明？請參閱根目錄下的 [README.md](../README.md)、[ROADMAP.md](../ROADMAP.md)、[CHANGELOG.md](../CHANGELOG.md) 和 [CONTRIBUTING.md](../CONTRIBUTING.md)。

---

## 面向非技術使用者

使用 OmniRoute 的簡明指南，無需技術背景。

### getting-started/

- [QUICK-START.md](getting-started/QUICK-START.md) — 3 分鐘內安裝並執行 OmniRoute。
- [AUTO-COMBO-GUIDE.md](getting-started/AUTO-COMBO-GUIDE.md) — 讓 OmniRoute 為你挑選最合適的 AI。
- [PROVIDERS-GUIDE.md](getting-started/PROVIDERS-GUIDE.md) — 如何連接 AI 提供者。
- [FREE-TIERS-GUIDE.md](getting-started/FREE-TIERS-GUIDE.md) — 無需信用卡即可免費使用 AI。
- [WEB-COOKIE-GUIDE.md](getting-started/WEB-COOKIE-GUIDE.md) — 網頁 Cookie 類提供者（工作階段憑證設定）。

### guides/

- [SETUP_GUIDE.md](guides/SETUP_GUIDE.md) — OmniRoute 的首次設定。
- [USER_GUIDE.md](guides/USER_GUIDE.md) — dashboard 與 API 的日常使用。
- [THINKING_BUDGET.md](guides/THINKING_BUDGET.md) — 思考/推理預算模式（直通與自動剝除）。
- [FEATURES.md](guides/FEATURES.md) — dashboard 功能總覽。
- [CHAOS-MODE.md](guides/CHAOS-MODE.md) — 多模型平行/協作執行（設定、權限、API）。
- [TIERS.md](guides/TIERS.md) — OmniRoute 層級說明（使用者指南）。
- [USAGE_QUOTA_GUIDE.md](guides/USAGE_QUOTA_GUIDE.md) — 用量、配額與支出追蹤。
- [COST_TRACKING.md](guides/COST_TRACKING.md) — 成本與支出追蹤。
- [FREE_PROVIDER_RANKINGS.md](guides/FREE_PROVIDER_RANKINGS.md) — 免費提供者排名（Arena ELO）。
- [DOCKER_GUIDE.md](guides/DOCKER_GUIDE.md) — 在 Docker 中執行 OmniRoute，包括 coding agent 的執行階段記憶體用量。
- [ELECTRON_GUIDE.md](guides/ELECTRON_GUIDE.md) — 桌面版（Electron）建置。
- [TERMUX_GUIDE.md](guides/TERMUX_GUIDE.md) — 透過 Termux 在 Android 上執行。
- [PWA_GUIDE.md](guides/PWA_GUIDE.md) — 將 dashboard 安裝為 PWA。
- [REMOTE-MODE.md](guides/REMOTE-MODE.md) — 遠端公開 OmniRoute 及限定範圍的權杖。
- [CLI-INTEGRATIONS.md](guides/CLI-INTEGRATIONS.md) — `setup-*` CLI 整合的總表。
- [OPENCODE-V2-PLUGIN.md](guides/OPENCODE-V2-PLUGIN.md) — 安裝並設定 OpenCode v2 外掛程式。
- [CLAUDE-CODE-CONFIGURATION.md](guides/CLAUDE-CODE-CONFIGURATION.md) — 搭配 OmniRoute 使用 Claude Code CLI。
- [CODEX-CLI-CONFIGURATION.md](guides/CODEX-CLI-CONFIGURATION.md) — 搭配 OmniRoute 使用 Codex CLI。
- [KIRO_SETUP.md](guides/KIRO_SETUP.md) — Kiro 設定。
- [ANTIGRAVITY-ONBOARDING.md](guides/ANTIGRAVITY-ONBOARDING.md) — Antigravity（Google One AI）入門指南。
- [MANAGEMENT-AUTH.md](guides/MANAGEMENT-AUTH.md) — 管理驗證。
- [I18N.md](guides/I18N.md) — 翻譯與 locale 工作流程。
- [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md) — 詳細的疑難排解參考。
- [UNINSTALL.md](guides/UNINSTALL.md) — 徹底解除安裝的步驟。

---

## 面向技術使用者

面向開發者與貢獻者的技術文件。

## architecture/

系統的整體構成。閱讀這些文件可以了解執行階段、程式碼配置與韌性模型。

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — 高階系統架構（請求管線、分層、模組）。
- [CODEBASE_DOCUMENTATION.md](architecture/CODEBASE_DOCUMENTATION.md) — 程式碼庫的工程參考。
- [REPOSITORY_MAP.md](architecture/REPOSITORY_MAP.md) — 按目錄逐一導覽的指南。
- [AUTHZ_GUIDE.md](architecture/AUTHZ_GUIDE.md) — 授權管線（路由分類器 + 原則引擎）。
- [RESILIENCE_GUIDE.md](architecture/RESILIENCE_GUIDE.md) — 提供者 circuit breaker、connection cooldown 與模型鎖定。
- [QUALITY_GATES.md](architecture/QUALITY_GATES.md) — quality-gate 指令碼與 CI 工作清單。
- [MONITORING_SECTIONS.md](architecture/MONITORING_SECTIONS.md) — 監控/成本 dashboard 的導覽。
- [cluster-decisions.md](architecture/cluster-decisions.md) — 選用的 sidecar/cluster profile 決策。
- [DESIGN_SYSTEM.md](architecture/DESIGN_SYSTEM.md) — 設計系統與視覺識別。
- [ROUTER_BACKENDS.md](architecture/ROUTER_BACKENDS.md) — 路由後端與內嵌服務的架構約定（ADR）。
- [admission-lanes.md](architecture/admission-lanes.md) — 兩套准入通道系統及各自受哪些 gate 約束。
- [persistence-backend-boundary.md](architecture/persistence-backend-boundary.md) — 可插拔的持久化邊界（ADR）。

## reference/

查閱性資料：API 介面、環境變數、CLI 參數與提供者目錄。

- [API_REFERENCE.md](reference/API_REFERENCE.md) — REST API endpoint 與資料結構。
- [PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) — 自動產生的提供者目錄（請勿手動編輯）。
- [REMOVED_PROVIDERS.md](reference/REMOVED_PROVIDERS.md) — 應營運方要求而移除的提供者；未經書面許可請勿重新引入。
- [PROVIDER_PLUGIN_MANIFEST.md](reference/PROVIDER_PLUGIN_MANIFEST.md) — 面向 Bifrost 與 CLIProxyAPI 遷移的、sidecar 安全的提供者外掛程式契約。
- [openapi.yaml](openapi.yaml) — 公開 API 的 OpenAPI 規格。
- [ENVIRONMENT.md](reference/ENVIRONMENT.md) — 環境變數參考。
- [FEATURE_FLAGS.md](reference/FEATURE_FLAGS.md) — 功能開關及其預設值。
- [CLI-TOOLS.md](reference/CLI-TOOLS.md) — 內建 CLI 指令。
- [FREE_TIERS.md](reference/FREE_TIERS.md) — 免費層 LLM 提供者目錄。
- [FREE_PROXIES_API.md](reference/FREE_PROXIES_API.md) — 免費 proxy API。
- [RELAY_BACKEND_STRATEGY.md](reference/RELAY_BACKEND_STRATEGY.md) — relay 後端策略。
- [RELAY_TROUBLESHOOTING.md](reference/RELAY_TROUBLESHOOTING.md) — relay 疑難排解。

## frameworks/

面向用戶端、agent 與維運人員開放的可插拔子系統。

- [MCP-SERVER.md](frameworks/MCP-SERVER.md) — Model Context Protocol 伺服器。
- [A2A-SERVER.md](frameworks/A2A-SERVER.md) — Agent-to-Agent（A2A）JSON-RPC 伺服器。
- [ACP.md](frameworks/ACP.md) — Agent Client Protocol（agent 用戶端協定）。
- [AGENT_PROTOCOLS_GUIDE.md](frameworks/AGENT_PROTOCOLS_GUIDE.md) — A2A / ACP / Cloud Agent 概覽。
- [AGENTBRIDGE.md](frameworks/AGENTBRIDGE.md) — IDE agent 橋接。
- [AGENT-SKILLS.md](frameworks/AGENT-SKILLS.md) — agent 技能目錄。
- [CLOUD_AGENT.md](frameworks/CLOUD_AGENT.md) — Cloud Agent 執行階段與提供者。
- [SKILLS.md](frameworks/SKILLS.md) — Skills 框架（沙箱化擴充）。
- [MEMORY.md](frameworks/MEMORY.md) — 持久化記憶（FTS5 + Qdrant）。
- [WEBHOOKS.md](frameworks/WEBHOOKS.md) — Webhook 事件與分派。
- [EVALS.md](frameworks/EVALS.md) — 評估套件。
- [GAMIFICATION.md](frameworks/GAMIFICATION.md) — 遊戲化與排行榜系統。
- [EMBEDDED-SERVICES.md](frameworks/EMBEDDED-SERVICES.md) — 內嵌的 sidecar 服務（9Router、CLIProxyAPI）。
- [NOTION_CONTEXT.md](frameworks/NOTION_CONTEXT.md) — Notion 上下文來源。
- [OBSIDIAN_CONTEXT.md](frameworks/OBSIDIAN_CONTEXT.md) — Obsidian 上下文來源。
- [LOCAL_CORPUS_CONTEXT.md](frameworks/LOCAL_CORPUS_CONTEXT.md) — 本機語料上下文來源（向 MCP 開放的已核准目錄）。
- [OPENCODE.md](frameworks/OPENCODE.md) — OpenCode 整合。
- [OPEN_SSE_ARCHITECTURE.md](frameworks/OPEN_SSE_ARCHITECTURE.md) — open-sse 串流引擎內部實作。
- [PLAYGROUND_STUDIO.md](frameworks/PLAYGROUND_STUDIO.md) — Playground Studio 介面。
- [SEARCH_TOOLS_STUDIO.md](frameworks/SEARCH_TOOLS_STUDIO.md) — Search Tools Studio 介面。
- [TRAFFIC_INSPECTOR.md](frameworks/TRAFFIC_INSPECTOR.md) — 流量檢查器（MITM）。
- [PLUGINS.md](frameworks/PLUGINS.md) — CLI 外掛程式系統概覽。
- [PLUGIN_SDK.md](frameworks/PLUGIN_SDK.md) — 外掛程式 SDK 參考。
- [PLUGIN_MARKETPLACE.md](frameworks/PLUGIN_MARKETPLACE.md) — 外掛程式市集。
- [RADAR.md](frameworks/RADAR.md) — Radar 免費模型目錄覆蓋層（選用，預設關閉）。

## routing/

組合路由、評分與重播。

- [AUTO-COMBO.md](routing/AUTO-COMBO.md) — Auto-Combo（多因素評分，19 種策略）。
- [QUOTA_SHARE.md](routing/QUOTA_SHARE.md) — 配額共享引擎。
- [REASONING_REPLAY.md](routing/REASONING_REPLAY.md) — 推理重播快取。
- [REASONING_ROUTING.md](routing/REASONING_ROUTING.md) — 推理路由規則（effort/budget 規則引擎）。

## security/

Guardrail、合規、隱身，以及處理公開憑證與錯誤訊息的強制性模式。

- [GUARDRAILS.md](security/GUARDRAILS.md) — PII、prompt 注入與視覺 guardrail。
- [COMPLIANCE.md](security/COMPLIANCE.md) — 稽核軌跡與合規。
- [STEALTH_GUIDE.md](security/STEALTH_GUIDE.md) — TLS / 指紋隱身。
- [PUBLIC_CREDS.md](security/PUBLIC_CREDS.md) — **必須遵守**的模式：嵌入公開的上游 OAuth client_id/secret 與 Firebase Web 金鑰，且不觸發金鑰掃描器。
- [ERROR_SANITIZATION.md](security/ERROR_SANITIZATION.md) — **必須遵守**的模式：所有錯誤回應都須經過 `sanitizeErrorMessage` 處理，以防止堆疊資訊外洩。
- [ROUTE_GUARD_TIERS.md](security/ROUTE_GUARD_TIERS.md) — 路由守衛的分級。
- [CLI_TOKEN.md](security/CLI_TOKEN.md) — CLI 機器 ID 權杖驗證（HMAC + 舊版 SHA-256）。
- [EGRESS_POLICY.md](security/EGRESS_POLICY.md) — 出口 IP 協定族（IPv4/IPv6）原則。
- [BAN_DETECTION.md](security/BAN_DETECTION.md) — 帳號封鎖與違禁關鍵字偵測。
- [AGENTROUTER_WAF.md](security/AGENTROUTER_WAF.md) — agentrouter.org 的 WAF。
- [CORS.md](security/CORS.md) — CORS 設定與安全。
- [MITM-TPROXY-DECRYPT.md](security/MITM-TPROXY-DECRYPT.md) — 透明 MITM 解密。
- [SUPPLY_CHAIN.md](security/SUPPLY_CHAIN.md) — 供應鏈 gate（SLSA、SBOM、Trivy、osv-scanner、Scorecard）。
- [SOCKET_DEV_FINDINGS.md](security/SOCKET_DEV_FINDINGS.md) — 供應鏈發現項的證明紀錄。

## compression/

Prompt compression 引擎、規則與語言包。

- [COMPRESSION_GUIDE.md](compression/COMPRESSION_GUIDE.md) — 壓縮功能總覽。
- [COMPRESSION_ENGINES.md](compression/COMPRESSION_ENGINES.md) — 可用的壓縮引擎。
- [COMPRESSION_RULES_FORMAT.md](compression/COMPRESSION_RULES_FORMAT.md) — 規則檔案格式。
- [COMPRESSION_LANGUAGE_PACKS.md](compression/COMPRESSION_LANGUAGE_PACKS.md) — 語言包。
- [RTK_COMPRESSION.md](compression/RTK_COMPRESSION.md) — RTK 引擎深入解析。
- [CONTEXT_EDITING.md](compression/CONTEXT_EDITING.md) — 委派式上下文編輯（Anthropic）。
- [EXTENDING_COMPRESSION.md](compression/EXTENDING_COMPRESSION.md) — 新增自訂壓縮引擎。

## providers/

針對特定提供者的整合指南。

- [CLAUDE_WEB.md](providers/CLAUDE_WEB.md) — Claude Web（Cookie 驗證）提供者。
- [CHATGPT_WEB.md](providers/CHATGPT_WEB.md) — ChatGPT Web（Codex）提供者，以及常見提供者的停用說明。
- [COPILOT-M365.md](providers/COPILOT-M365.md) — Microsoft 365 Copilot（BizChat）提供者。
- [ALIBABA-QWEN-PROVIDER-FAMILIES.md](providers/ALIBABA-QWEN-PROVIDER-FAMILIES.md) — 阿里巴巴與 Qwen 提供者系列。
- [AGENTROUTER.md](providers/AGENTROUTER.md) — AgentRouter 設定。
- [ZED-DOCKER.md](providers/ZED-DOCKER.md) — Docker 下的 Zed IDE 整合。
- [CURSOR-DOCKER.md](providers/CURSOR-DOCKER.md) — Docker 下的 Cursor 模型清單。

## comparison/

- [OMNIROUTE_VS_ALTERNATIVES.md](comparison/OMNIROUTE_VS_ALTERNATIVES.md) — OmniRoute 與同類方案的比較。

## ops/

發行、部署、proxy、隧道、覆蓋率、資料庫與監控。

- [RELEASE_CHECKLIST.md](ops/RELEASE_CHECKLIST.md) — 發行流程檢查清單。
- [RELEASE_GREEN.md](ops/RELEASE_GREEN.md) — 保持 PR 佇列與發行分支處於通過狀態。
- [BRANCHING_MODEL.md](ops/BRANCHING_MODEL.md) — 分支與發行模型。
- [MERGE_TRAIN.md](ops/MERGE_TRAIN.md) — 合併佇列與手動 merge-train 執行手冊。
- [HOMOLOGATION.md](ops/HOMOLOGATION.md) — 一致性驗證套件（`npm run homolog`）。
- [QUALITY_GATE_PLAYBOOK.md](ops/QUALITY_GATE_PLAYBOOK.md) — quality-gate 操作手冊。
- [RUNNER_BOX.md](ops/RUNNER_BOX.md) — self-hosted runner 主機的維運。
- [BRANCH_PROTECTION_MAIN.md](ops/BRANCH_PROTECTION_MAIN.md) — `main` 分支保護。
- [CONTRIBUTION_GOLDEN_PATH.md](ops/CONTRIBUTION_GOLDEN_PATH.md) — 貢獻的標準流程（依變更類型執行針對性檢查）。
- [COVERAGE_PLAN.md](ops/COVERAGE_PLAN.md) — 測試覆蓋率計畫。
- [DATABASE_GUIDE.md](ops/DATABASE_GUIDE.md) — 資料庫結構與維運。
- [SQLITE_RUNTIME.md](ops/SQLITE_RUNTIME.md) — SQLite 驅動程式解析鏈。
- [REDIS_PRODUCTION_CONFIG.md](ops/REDIS_PRODUCTION_CONFIG.md) — Redis 正式環境設定。
- [MONITORING_GUIDE.md](ops/MONITORING_GUIDE.md) — 監控與可觀測性。
- [FLY_IO_DEPLOYMENT_GUIDE.md](ops/FLY_IO_DEPLOYMENT_GUIDE.md) — Fly.io 部署。
- [VM_DEPLOYMENT_GUIDE.md](ops/VM_DEPLOYMENT_GUIDE.md) — 通用虛擬機器部署。
- [PROXY_GUIDE.md](ops/PROXY_GUIDE.md) — 上游 proxy 設定。
- [TUNNELS_GUIDE.md](ops/TUNNELS_GUIDE.md) — Cloudflare 隧道及同類工具。

## diagrams/

文件中引用的 Mermaid 原始檔與匯出的 SVG/PNG 圖表。參見 [diagrams/README.md](diagrams/README.md)。

## i18n/

文件在 66 種 locale 中的譯本（加上英文原文，共 67 種語言）。支援的語言清單參見 [i18n/README.md](i18n/README.md)。

## screenshots/

dashboard 與 README 使用的靜態截圖，不屬於文件正文。

---

## 自動產生的產物

- [reference/PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) 由 `scripts/docs/gen-provider-reference.ts` 根據 `src/shared/constants/providers.ts` 產生，請勿手動編輯。
- `/docs` 介面由上述子目錄透過 Fumadocs MDX 原始碼產生機制提供支援。
