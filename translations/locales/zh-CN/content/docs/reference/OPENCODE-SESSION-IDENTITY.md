---
title: "OpenCode 对话身份"
version: 3.8.51
lastUpdated: 2026-09-21
---

# OpenCode 对话身份

OpenCode 与 OpenCode Go 会在各轮请求之间复用显式的对话 ID。解析器依次检查 `x-opencode-session`、已有的亲和性（affinity）与会话请求头、原生 CLI 的会话与线程请求头、请求元数据，最后检查顶层的会话与线程字段。系统会检查 Claude 中以 JSON 编码的 `metadata.user_id`，从中查找会话 ID；仅有不透明的账户或用户 ID 时，绝不会将其视为对话 ID。

包含控制字符的值、空 ID 以及长度超过 256 个字符的 ID 都会被忽略。JSON 元数据的解析有长度上限。在格式转换之前，执行器的请求头规范化器只会为 OpenCode 提供者保留这一身份；不会为其他提供者注入 OpenCode 请求头。

既有的规范 `ses_` 编码与对话指纹 fallback 机制保持不变。若没有显式 ID，则仍由第一条用户消息及其他既有指纹输入决定对话的连续性。这不是新的授权边界，也不能证明上游内容相互隔离。

实现位于 `open-sse/utils/opencodeSessionIdentity.ts`、`open-sse/utils/opencodeHeaders.ts` 和 `open-sse/handlers/chatCore/executorClientHeaders.ts`。回归测试覆盖原生 ID、Claude 元数据、优先级、无效值以及既有的指纹行为，且不产生付费的上游调用。
