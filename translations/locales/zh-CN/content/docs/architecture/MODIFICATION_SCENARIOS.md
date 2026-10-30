---
title: "常见修改场景"
version: 3.8.52
lastUpdated: 2026-10-18
---

# 常见修改场景——完整操作步骤

> 这是 `AGENTS.md` 中“Common Modification Scenarios”快速索引的深入补充。
> 为每一种反复出现的变更类型提供分步操作指南。若需了解更广泛的贡献流程（本地循环与 CI、对账），请参阅 [docs/ops/CONTRIBUTION_GOLDEN_PATH.md](../ops/CONTRIBUTION_GOLDEN_PATH.md)。

## 新增提供者

0. 先检查 `docs/reference/REMOVED_PROVIDERS.md`——应其运营方要求而移除的提供者，绝不可重新引入（由 `tests/unit/removed-providers-blocklist.test.ts` 守护）
1. 在 `src/shared/constants/providers.ts` 中注册（加载时经 Zod 校验）
2. 若需要自定义逻辑，在 `open-sse/executors/` 中新增执行器（继承 `BaseExecutor`）
3. 若提供者使用的并非 OpenAI 格式，在 `open-sse/translator/` 中新增转换器
4. 若基于 OAuth，在 `src/lib/oauth/constants/oauth.ts` 中添加 OAuth 配置——若上游 CLI 附带公开的 client_id/secret，请通过 `resolvePublicCred()` 嵌入（参见 `docs/security/PUBLIC_CREDS.md`），**绝不**写成字面量
5. 在 `open-sse/config/providerRegistry.ts` 中注册模型
6. 在 `tests/unit/` 中编写测试（若新增了内嵌的默认值，请包含 publicCreds 结构断言）

## 为提供者启用双重认证（多个 API 密钥）

1. 将提供者的 ID 加入 `src/shared/constants/providers.ts` 中的 `DUAL_AUTH_PROVIDER_IDS` 集合。这会让前端渲染多密钥的文本域输入框，而不是单行的密码输入框。
2. 更新该提供者的 `authHint`（位于 `src/shared/constants/providers.ts` 或 `src/shared/constants/providers/oauth.ts`），告知用户可以用逗号分隔提供多个密钥。
3. 每个密钥都作为独立的提供者连接记录存储（批量添加流程会通过 `src/shared/utils/bulkApiKeyParser.ts` 中的 `parseBulkApiKeys()` 按行解析，每行一个密钥）。请求时，`src/sse/services/auth.ts` 中的 `getProviderCredentials()` 会自动在提供者的各个连接之间进行选择、轮换与回退——回退机制参见 [RESILIENCE_GUIDE.md](./RESILIENCE_GUIDE.md) 中的“Connection Cooldown”。

## 新增 API 路由

1. 在 `src/app/api/v1/your-route/` 下创建目录
2. 创建 `route.ts`，并实现 `GET`/`POST` 处理函数
3. 遵循以下模式：CORS → Zod 请求体校验 → 可选的认证 → 委托给处理器
4. 处理器放在 `open-sse/handlers/` 中（从该处导入，而不是内联实现）
5. 错误响应使用 `open-sse/utils/error.ts` 中的 `buildErrorBody()` / `errorResponse()`（会自动净化——绝不可将 `err.stack` 或 `err.message` 原样放入响应体）。参见 `docs/security/ERROR_SANITIZATION.md`。
6. 添加测试——至少包含一条断言，确认错误响应不会泄露堆栈信息（`!body.error.message.includes("at /")`）

## 新增数据库模块

1. 创建 `src/lib/db/yourModule.ts`——从 `./core.ts` 导入 `getDbInstance`
2. 为你的领域表导出 CRUD 函数
3. 若需要新表，在 `src/lib/db/migrations/` 中添加迁移
4. 编写测试

## 新增 MCP 工具

1. 在 `open-sse/mcp-server/tools/` 中添加工具定义，包含 Zod 输入 schema 与异步处理函数
2. 注册到工具集中（由 `createMcpServer()` 接入）
3. 分配到合适的作用域
4. 编写测试（工具调用会记录到 `mcp_tool_audit` 表中）

## 新增 A2A 技能

1. 在 `src/lib/a2a/skills/` 中创建技能（目前已有 6 个：smart-routing、quota-management、provider-discovery、cost-analysis、health-report、list-capabilities）
2. 技能接收任务上下文（messages、metadata），返回结构化结果
3. 在 `src/lib/a2a/taskExecution.ts` 的 `A2A_SKILL_HANDLERS` 中注册
4. 在 `src/lib/a2a/agentCardMetadata.ts` 中对外暴露（即智能体 Agent Card 的 skills 数组，两条发现路由共用）
5. 在 `tests/unit/` 中编写测试
6. 在 `docs/frameworks/A2A-SERVER.md` 的技能表中添加说明

## 新增云端智能体

1. 在 `src/lib/cloudAgent/agents/` 中创建智能体类，继承 `CloudAgentBase`（目前已有 4 个：codex-cloud、devin、jules、cursor-cloud）
2. 实现 `createTask`、`getStatus`、`approvePlan`、`sendMessage` 与 `listSources`
3. 在 `src/lib/cloudAgent/registry.ts` 中注册
4. 如有需要，添加 OAuth / 凭据处理（`src/lib/oauth/providers/`）
5. 编写测试，并在 `docs/frameworks/CLOUD_AGENT.md` 中补充文档

## 新增内嵌服务

1. 参照 `ninerouter.ts`，在 `src/lib/services/installers/{name}.ts` 中创建安装器（使用 `installers/utils.ts` 中的 `runNpm`——不进行 shell 插值，即硬性规则 #13）。
2. 在 `src/lib/services/bootstrap.ts` 中注册该服务（加入 `SERVICES[]` 数组，并扩展 `buildSpawnArgsFactory()`）。
3. 在 `src/lib/db/migrations/` 中为新服务添加一条数据库种子行（`version_manager` 表，`status='not_installed'`，`auto_start=0`）。
4. 在 `src/app/api/services/{name}/` 下创建 8 个 API 端点（`_lib.ts`、`install`、`start`、`stop`、`restart`、`update`、`status`、`auto-start`、`auto-restart-adopted`）。所有错误均通过 `createErrorResponse()` 委托处理。共享的 `logs` 端点已通过 `[name]/logs/route.ts` 接入。
5. 确认 `/api/services/` 位于 `src/server/authz/routeGuard.ts` 中的 `LOCAL_ONLY_API_PREFIXES` 内；若新增了前缀，请添加测试，断言 `isLocalOnlyPath()` 对该新前缀返回 `true`（硬性规则 #17）。
6. 在 `src/app/(dashboard)/dashboard/providers/services/tabs/` 中添加 UI 标签页，复用 `ServiceStatusCard`、`ServiceLifecycleButtons` 与 `ServiceLogsPanel`。
7. 在 `docs/frameworks/EMBEDDED-SERVICES.md` 中补充文档（更新 §1 服务表与 §4 API 参考），并更新 `docs/openapi.yaml`。
8. 编写测试：单元测试（`tests/unit/services/`）、集成测试（`tests/integration/services/`，由 `RUN_SERVICES_INT=1` 控制），并更新 `docs/ops/RELEASE_CHECKLIST.md` 中的冒烟测试部分。

## 新增护栏 / 评估 / 技能 / Webhook 事件 / 日志导出目标

- 护栏：`src/lib/guardrails/` → 文档：`docs/security/GUARDRAILS.md`
- 评估套件：`src/lib/evals/` → 文档：`docs/frameworks/EVALS.md`
- 技能（沙箱）：`src/lib/skills/` → 文档：`docs/frameworks/SKILLS.md`
- Webhook 事件：`src/lib/webhookDispatcher.ts` → 文档：`docs/frameworks/WEBHOOKS.md`
- 日志导出目标：新增 `src/lib/logExport/destinations/<name>.ts`，并在
  `src/lib/logExport/registry.ts` 中添加一行 → 文档：`docs/frameworks/LOG-EXPORT.md`。运行器、REST 层与仪表盘表单都会读取该注册表，因此无需改动其他内容。
