---
title: "OmniRoute 文档"
version: 3.8.40
lastUpdated: 2026-06-28
---

# OmniRoute 文档

OmniRoute 文档集的导航索引。主题按用途分组，便于你快速找到所需内容。

> 想了解项目概览、安装步骤或发布说明？请参阅根目录下的 [README.md](../README.md)、[ROADMAP.md](../ROADMAP.md)、[CHANGELOG.md](../CHANGELOG.md) 和 [CONTRIBUTING.md](../CONTRIBUTING.md)。

---

## 面向非技术用户

使用 OmniRoute 的简明指南，无需技术背景。

### getting-started/

- [QUICK-START.md](getting-started/QUICK-START.md) — 3 分钟内安装并运行 OmniRoute。
- [AUTO-COMBO-GUIDE.md](getting-started/AUTO-COMBO-GUIDE.md) — 让 OmniRoute 为你挑选最合适的 AI。
- [PROVIDERS-GUIDE.md](getting-started/PROVIDERS-GUIDE.md) — 如何连接 AI 提供者。
- [FREE-TIERS-GUIDE.md](getting-started/FREE-TIERS-GUIDE.md) — 无需信用卡即可免费使用 AI。
- [WEB-COOKIE-GUIDE.md](getting-started/WEB-COOKIE-GUIDE.md) — 网页 Cookie 类提供者（会话凭据设置）。

### guides/

- [SETUP_GUIDE.md](guides/SETUP_GUIDE.md) — OmniRoute 的首次设置。
- [USER_GUIDE.md](guides/USER_GUIDE.md) — dashboard 与 API 的日常使用。
- [THINKING_BUDGET.md](guides/THINKING_BUDGET.md) — 思考/推理预算模式（直通与自动剥离）。
- [FEATURES.md](guides/FEATURES.md) — dashboard 功能总览。
- [CHAOS-MODE.md](guides/CHAOS-MODE.md) — 多模型并行/协作执行（设置、权限、API）。
- [TIERS.md](guides/TIERS.md) — OmniRoute 层级说明（用户指南）。
- [USAGE_QUOTA_GUIDE.md](guides/USAGE_QUOTA_GUIDE.md) — 用量、配额与支出跟踪。
- [COST_TRACKING.md](guides/COST_TRACKING.md) — 成本与支出跟踪。
- [FREE_PROVIDER_RANKINGS.md](guides/FREE_PROVIDER_RANKINGS.md) — 免费提供者排名（Arena ELO）。
- [DOCKER_GUIDE.md](guides/DOCKER_GUIDE.md) — 在 Docker 中运行 OmniRoute，包括 coding agent 的运行时内存占用。
- [ELECTRON_GUIDE.md](guides/ELECTRON_GUIDE.md) — 桌面端（Electron）构建。
- [TERMUX_GUIDE.md](guides/TERMUX_GUIDE.md) — 通过 Termux 在 Android 上运行。
- [PWA_GUIDE.md](guides/PWA_GUIDE.md) — 将 dashboard 安装为 PWA。
- [REMOTE-MODE.md](guides/REMOTE-MODE.md) — 远程暴露 OmniRoute 及限定范围的令牌。
- [CLI-INTEGRATIONS.md](guides/CLI-INTEGRATIONS.md) — `setup-*` CLI 集成的总表。
- [OPENCODE-V2-PLUGIN.md](guides/OPENCODE-V2-PLUGIN.md) — 安装并配置 OpenCode v2 插件。
- [CLAUDE-CODE-CONFIGURATION.md](guides/CLAUDE-CODE-CONFIGURATION.md) — 在 OmniRoute 中使用 Claude Code CLI。
- [CODEX-CLI-CONFIGURATION.md](guides/CODEX-CLI-CONFIGURATION.md) — 在 OmniRoute 中使用 Codex CLI。
- [KIRO_SETUP.md](guides/KIRO_SETUP.md) — Kiro 设置。
- [ANTIGRAVITY-ONBOARDING.md](guides/ANTIGRAVITY-ONBOARDING.md) — Antigravity（Google One AI）入门指南。
- [MANAGEMENT-AUTH.md](guides/MANAGEMENT-AUTH.md) — 管理认证。
- [I18N.md](guides/I18N.md) — 翻译与 locale 工作流。
- [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md) — 详细的故障排查参考。
- [UNINSTALL.md](guides/UNINSTALL.md) — 彻底卸载的步骤。

---

## 面向技术用户

面向开发者与贡献者的技术文档。

## architecture/

系统的整体构成。阅读这些文档可以了解运行时、代码布局与容错模型。

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — 高层系统架构（请求管线、分层、模块）。
- [CODEBASE_DOCUMENTATION.md](architecture/CODEBASE_DOCUMENTATION.md) — 代码库的工程参考。
- [REPOSITORY_MAP.md](architecture/REPOSITORY_MAP.md) — 按目录逐一导航的指南。
- [AUTHZ_GUIDE.md](architecture/AUTHZ_GUIDE.md) — 授权管线（路由分类器 + 策略引擎）。
- [RESILIENCE_GUIDE.md](architecture/RESILIENCE_GUIDE.md) — 提供者 circuit breaker、connection cooldown 与模型锁定。
- [QUALITY_GATES.md](architecture/QUALITY_GATES.md) — quality-gate 脚本与 CI 任务清单。
- [MONITORING_SECTIONS.md](architecture/MONITORING_SECTIONS.md) — 监控/成本 dashboard 的导航。
- [cluster-decisions.md](architecture/cluster-decisions.md) — 可选的 sidecar/cluster profile 决策。
- [DESIGN_SYSTEM.md](architecture/DESIGN_SYSTEM.md) — 设计系统与视觉识别。
- [ROUTER_BACKENDS.md](architecture/ROUTER_BACKENDS.md) — 路由后端与内嵌服务的架构约定（ADR）。
- [admission-lanes.md](architecture/admission-lanes.md) — 两套准入通道系统及各自受哪些 gate 约束。
- [persistence-backend-boundary.md](architecture/persistence-backend-boundary.md) — 可插拔的持久化边界（ADR）。

## reference/

查阅性资料：API 接口、环境变量、CLI 参数与提供者目录。

- [API_REFERENCE.md](reference/API_REFERENCE.md) — REST API endpoint 与数据结构。
- [PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) — 自动生成的提供者目录（请勿手动编辑）。
- [REMOVED_PROVIDERS.md](reference/REMOVED_PROVIDERS.md) — 应运营方要求而移除的提供者；未经书面许可请勿重新引入。
- [PROVIDER_PLUGIN_MANIFEST.md](reference/PROVIDER_PLUGIN_MANIFEST.md) — 面向 Bifrost 与 CLIProxyAPI 迁移的、sidecar 安全的提供者插件契约。
- [openapi.yaml](openapi.yaml) — 公共 API 的 OpenAPI 规范。
- [ENVIRONMENT.md](reference/ENVIRONMENT.md) — 环境变量参考。
- [FEATURE_FLAGS.md](reference/FEATURE_FLAGS.md) — 功能开关及其默认值。
- [CLI-TOOLS.md](reference/CLI-TOOLS.md) — 内置 CLI 命令。
- [FREE_TIERS.md](reference/FREE_TIERS.md) — 免费层 LLM 提供者目录。
- [FREE_PROXIES_API.md](reference/FREE_PROXIES_API.md) — 免费 proxy API。
- [RELAY_BACKEND_STRATEGY.md](reference/RELAY_BACKEND_STRATEGY.md) — relay 后端策略。
- [RELAY_TROUBLESHOOTING.md](reference/RELAY_TROUBLESHOOTING.md) — relay 故障排查。

## frameworks/

面向客户端、agent 与运维人员开放的可插拔子系统。

- [MCP-SERVER.md](frameworks/MCP-SERVER.md) — Model Context Protocol 服务器。
- [A2A-SERVER.md](frameworks/A2A-SERVER.md) — Agent-to-Agent（A2A）JSON-RPC 服务器。
- [ACP.md](frameworks/ACP.md) — Agent Client Protocol（agent 客户端协议）。
- [AGENT_PROTOCOLS_GUIDE.md](frameworks/AGENT_PROTOCOLS_GUIDE.md) — A2A / ACP / Cloud Agent 概览。
- [AGENTBRIDGE.md](frameworks/AGENTBRIDGE.md) — IDE agent 桥接。
- [AGENT-SKILLS.md](frameworks/AGENT-SKILLS.md) — agent 技能目录。
- [CLOUD_AGENT.md](frameworks/CLOUD_AGENT.md) — Cloud Agent 运行时与提供者。
- [SKILLS.md](frameworks/SKILLS.md) — Skills 框架（沙箱化扩展）。
- [MEMORY.md](frameworks/MEMORY.md) — 持久化记忆（FTS5 + Qdrant）。
- [WEBHOOKS.md](frameworks/WEBHOOKS.md) — Webhook 事件与分发。
- [EVALS.md](frameworks/EVALS.md) — 评估套件。
- [GAMIFICATION.md](frameworks/GAMIFICATION.md) — 游戏化与排行榜系统。
- [EMBEDDED-SERVICES.md](frameworks/EMBEDDED-SERVICES.md) — 内嵌的 sidecar 服务（9Router、CLIProxyAPI）。
- [NOTION_CONTEXT.md](frameworks/NOTION_CONTEXT.md) — Notion 上下文源。
- [OBSIDIAN_CONTEXT.md](frameworks/OBSIDIAN_CONTEXT.md) — Obsidian 上下文源。
- [LOCAL_CORPUS_CONTEXT.md](frameworks/LOCAL_CORPUS_CONTEXT.md) — 本地语料上下文源（向 MCP 开放的已批准目录）。
- [OPENCODE.md](frameworks/OPENCODE.md) — OpenCode 集成。
- [OPEN_SSE_ARCHITECTURE.md](frameworks/OPEN_SSE_ARCHITECTURE.md) — open-sse 流式引擎内部实现。
- [PLAYGROUND_STUDIO.md](frameworks/PLAYGROUND_STUDIO.md) — Playground Studio 界面。
- [SEARCH_TOOLS_STUDIO.md](frameworks/SEARCH_TOOLS_STUDIO.md) — Search Tools Studio 界面。
- [TRAFFIC_INSPECTOR.md](frameworks/TRAFFIC_INSPECTOR.md) — 流量检查器（MITM）。
- [PLUGINS.md](frameworks/PLUGINS.md) — CLI 插件系统概览。
- [PLUGIN_SDK.md](frameworks/PLUGIN_SDK.md) — 插件 SDK 参考。
- [PLUGIN_MARKETPLACE.md](frameworks/PLUGIN_MARKETPLACE.md) — 插件市场。
- [RADAR.md](frameworks/RADAR.md) — Radar 免费模型目录覆盖层（可选，默认关闭）。

## routing/

组合路由、评分与回放。

- [AUTO-COMBO.md](routing/AUTO-COMBO.md) — Auto-Combo（多因素评分，19 种策略）。
- [QUOTA_SHARE.md](routing/QUOTA_SHARE.md) — 配额共享引擎。
- [REASONING_REPLAY.md](routing/REASONING_REPLAY.md) — 推理回放缓存。
- [REASONING_ROUTING.md](routing/REASONING_ROUTING.md) — 推理路由规则（effort/budget 规则引擎）。

## security/

Guardrail、合规、隐身，以及处理公开凭据与错误信息的强制性模式。

- [GUARDRAILS.md](security/GUARDRAILS.md) — PII、prompt 注入与视觉 guardrail。
- [COMPLIANCE.md](security/COMPLIANCE.md) — 审计追踪与合规。
- [STEALTH_GUIDE.md](security/STEALTH_GUIDE.md) — TLS / 指纹隐身。
- [PUBLIC_CREDS.md](security/PUBLIC_CREDS.md) — **必须遵守**的模式：嵌入公开的上游 OAuth client_id/secret 与 Firebase Web 密钥，且不触发密钥扫描器。
- [ERROR_SANITIZATION.md](security/ERROR_SANITIZATION.md) — **必须遵守**的模式：所有错误响应都须经过 `sanitizeErrorMessage` 处理，以防止堆栈信息泄露。
- [ROUTE_GUARD_TIERS.md](security/ROUTE_GUARD_TIERS.md) — 路由守卫的分级。
- [CLI_TOKEN.md](security/CLI_TOKEN.md) — CLI 机器 ID 令牌认证（HMAC + 旧版 SHA-256）。
- [EGRESS_POLICY.md](security/EGRESS_POLICY.md) — 出口 IP 协议族（IPv4/IPv6）策略。
- [BAN_DETECTION.md](security/BAN_DETECTION.md) — 账号封禁与违禁关键词检测。
- [AGENTROUTER_WAF.md](security/AGENTROUTER_WAF.md) — agentrouter.org 的 WAF。
- [CORS.md](security/CORS.md) — CORS 配置与安全。
- [MITM-TPROXY-DECRYPT.md](security/MITM-TPROXY-DECRYPT.md) — 透明 MITM 解密。
- [SUPPLY_CHAIN.md](security/SUPPLY_CHAIN.md) — 供应链 gate（SLSA、SBOM、Trivy、osv-scanner、Scorecard）。
- [SOCKET_DEV_FINDINGS.md](security/SOCKET_DEV_FINDINGS.md) — 供应链发现项的证明记录。

## compression/

Prompt compression 引擎、规则与语言包。

- [COMPRESSION_GUIDE.md](compression/COMPRESSION_GUIDE.md) — 压缩功能总览。
- [COMPRESSION_ENGINES.md](compression/COMPRESSION_ENGINES.md) — 可用的压缩引擎。
- [COMPRESSION_RULES_FORMAT.md](compression/COMPRESSION_RULES_FORMAT.md) — 规则文件格式。
- [COMPRESSION_LANGUAGE_PACKS.md](compression/COMPRESSION_LANGUAGE_PACKS.md) — 语言包。
- [RTK_COMPRESSION.md](compression/RTK_COMPRESSION.md) — RTK 引擎深入解析。
- [CONTEXT_EDITING.md](compression/CONTEXT_EDITING.md) — 委托式上下文编辑（Anthropic）。
- [EXTENDING_COMPRESSION.md](compression/EXTENDING_COMPRESSION.md) — 添加自定义压缩引擎。

## providers/

针对特定提供者的集成指南。

- [CLAUDE_WEB.md](providers/CLAUDE_WEB.md) — Claude Web（Cookie 认证）提供者。
- [CHATGPT_WEB.md](providers/CHATGPT_WEB.md) — ChatGPT Web（Codex）提供者，以及常见提供者的停用说明。
- [COPILOT-M365.md](providers/COPILOT-M365.md) — Microsoft 365 Copilot（BizChat）提供者。
- [ALIBABA-QWEN-PROVIDER-FAMILIES.md](providers/ALIBABA-QWEN-PROVIDER-FAMILIES.md) — 阿里巴巴与 Qwen 提供者系列。
- [AGENTROUTER.md](providers/AGENTROUTER.md) — AgentRouter 设置。
- [ZED-DOCKER.md](providers/ZED-DOCKER.md) — Docker 下的 Zed IDE 集成。
- [CURSOR-DOCKER.md](providers/CURSOR-DOCKER.md) — Docker 下的 Cursor 模型列表。

## comparison/

- [OMNIROUTE_VS_ALTERNATIVES.md](comparison/OMNIROUTE_VS_ALTERNATIVES.md) — OmniRoute 与同类方案的对比。

## ops/

发布、部署、proxy、隧道、覆盖率、数据库与监控。

- [RELEASE_CHECKLIST.md](ops/RELEASE_CHECKLIST.md) — 发布流程检查清单。
- [RELEASE_GREEN.md](ops/RELEASE_GREEN.md) — 保持 PR 队列与发布分支处于通过状态。
- [BRANCHING_MODEL.md](ops/BRANCHING_MODEL.md) — 分支与发布模型。
- [MERGE_TRAIN.md](ops/MERGE_TRAIN.md) — 合并队列与手动 merge-train 运行手册。
- [HOMOLOGATION.md](ops/HOMOLOGATION.md) — 一致性验证套件（`npm run homolog`）。
- [QUALITY_GATE_PLAYBOOK.md](ops/QUALITY_GATE_PLAYBOOK.md) — quality-gate 操作手册。
- [RUNNER_BOX.md](ops/RUNNER_BOX.md) — self-hosted runner 主机的运维。
- [BRANCH_PROTECTION_MAIN.md](ops/BRANCH_PROTECTION_MAIN.md) — `main` 分支保护。
- [CONTRIBUTION_GOLDEN_PATH.md](ops/CONTRIBUTION_GOLDEN_PATH.md) — 贡献的标准流程（按变更类型执行针对性检查）。
- [COVERAGE_PLAN.md](ops/COVERAGE_PLAN.md) — 测试覆盖率计划。
- [DATABASE_GUIDE.md](ops/DATABASE_GUIDE.md) — 数据库结构与运维。
- [SQLITE_RUNTIME.md](ops/SQLITE_RUNTIME.md) — SQLite 驱动解析链。
- [REDIS_PRODUCTION_CONFIG.md](ops/REDIS_PRODUCTION_CONFIG.md) — Redis 生产环境配置。
- [MONITORING_GUIDE.md](ops/MONITORING_GUIDE.md) — 监控与可观测性。
- [FLY_IO_DEPLOYMENT_GUIDE.md](ops/FLY_IO_DEPLOYMENT_GUIDE.md) — Fly.io 部署。
- [VM_DEPLOYMENT_GUIDE.md](ops/VM_DEPLOYMENT_GUIDE.md) — 通用虚拟机部署。
- [PROXY_GUIDE.md](ops/PROXY_GUIDE.md) — 上游 proxy 配置。
- [TUNNELS_GUIDE.md](ops/TUNNELS_GUIDE.md) — Cloudflare 隧道及同类工具。

## diagrams/

文档中引用的 Mermaid 源文件与导出的 SVG/PNG 图表。参见 [diagrams/README.md](diagrams/README.md)。

## i18n/

文档在 66 种 locale 中的译本（加上英文原文，共 67 种语言）。支持的语言列表参见 [i18n/README.md](i18n/README.md)。

## screenshots/

dashboard 与 README 使用的静态截图，不属于文档正文。

---

## 自动生成的产物

- [reference/PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) 由 `scripts/docs/gen-provider-reference.ts` 根据 `src/shared/constants/providers.ts` 生成，请勿手动编辑。
- `/docs` 界面由上述子目录通过 Fumadocs MDX 源生成机制提供支持。
