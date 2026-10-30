---
title: "OpenAI 兼容协议"
version: 3.8.51
lastUpdated: 2026-09-18
---

<!-- markdownlint-disable MD025 -->

# OpenAI 兼容协议

OmniRoute 在 `/v1` 提供面向客户端的、OpenAI 结构的 API。使用 `Authorization: Bearer <key>` 进行认证，并使用 `GET /v1/models` 返回的模型 ID。模型 ID 通常为 `<provider-prefix>/<model-id>` 形式；组合同样可以作为有效的模型目标。

本页描述公开契约。各提供者的能力并不统一：网关在具备受支持的翻译器时会翻译请求，但上游仍可能拒绝其未实现的功能。选择模型时，请以实时的 `/v1/models` 记录和提供者的能力元数据为准。

## 端点与能力矩阵

| 端点 | 传输格式 | 流式输出 | 主要输入 | 能力说明 | 自动化测试覆盖 |
| --- | --- | --- | --- | --- | --- |
| `POST /v1/chat/completions` | OpenAI Chat Completions | `stream: true` 时返回 SSE | `messages`（或共享 schema 接受的兼容 `input`/`prompt` 形式） | 当所选模型或提供者支持时，文本、工具调用、推理控制、结构化输出字段以及多模态消息内容都会被翻译。 | [`chat-completions-route-shape-gate.test.ts`](../../tests/unit/chat-completions-route-shape-gate.test.ts)、[`openai-compatible-tools.test.ts`](../../tests/unit/openai-compatible-tools.test.ts) |
| `POST /v1/responses` | OpenAI Responses | `stream: true` 时为 SSE 事件流 | `input` | 对于提供兼容路径的提供者，Responses 的输入、工具、推理以及输出事件都会被翻译。 | [`responses-passthrough-openai-compatible.test.ts`](../../tests/unit/responses-passthrough-openai-compatible.test.ts)、[`openclaw-omniroute-tool-boundary.live.test.ts`](../../tests/boundary/openclaw-omniroute-tool-boundary.live.test.ts) |
| `POST /v1/embeddings` | OpenAI Embeddings | 否 | `input` | 文本嵌入的支持较为普遍；多模态输入仅限于声明支持该能力的模型。内联媒体每项上限为 8 MiB，每个请求上限为 16 MiB。 | [`v1-contracts-behavior.test.ts`](../../tests/integration/v1-contracts-behavior.test.ts) |
| `POST /v1/images/generations` | OpenAI Images | 否 | `prompt` | 仅限支持图像生成的模型；响应格式可为 `url` 或 `b64_json`。 | [`v1-contracts-behavior.test.ts`](../../tests/integration/v1-contracts-behavior.test.ts) |
| `POST /v1/images/edits` | OpenAI Images edit | 否 | multipart 图像 + prompt | 仅适用于实现了图像编辑的提供者或模型。 | [`image-generation-handler.test.ts`](../../tests/unit/image-generation-handler.test.ts) |
| `POST /v1/audio/transcriptions` | OpenAI Audio | 否 | multipart 音频 | 仅限语音转文本的提供者或模型。 | [`audio-transcription-handler.test.ts`](../../tests/unit/audio-transcription-handler.test.ts) |
| `POST /v1/audio/speech` | OpenAI Audio | 否 | `input`、`voice`、`model` | 仅限文本转语音的提供者或模型；返回音频响应体。 | [`audio-speech-handler.test.ts`](../../tests/unit/audio-speech-handler.test.ts) |
| `GET /v1/models` | OpenAI 模型列表 | 否 | — | 列出可见的聊天、媒体、嵌入模型以及组合。使用 `?prefix=alias`、`dual` 或 `canonical` 选择 ID 的呈现方式。 | [`v1-contracts-behavior.test.ts`](../../tests/integration/v1-contracts-behavior.test.ts)、[`provider-journey.contract.test.ts`](../../tests/integration/provider-journey.contract.test.ts) |

其他兼容接口列在 [API 参考](./API_REFERENCE.md) 中，包括 `/v1/messages`、`/v1/rerank`、`/v1/moderations`、视频与音乐路由、Files、Batches，以及带令牌的 VS Code 别名。

## 聊天请求字段

聊天路由要求 `model`，并且至少包含 `messages`、`input` 或 `prompt` 之一。该 schema 有意保持前向兼容，并会保留未知的 OpenAI 风格字段以供翻译；OmniRoute 使用的规范字段包括：

| 字段 | 行为 |
| --- | --- |
| `messages` | 对话消息。助手的 `tool_calls` 会与随后的 `role: "tool"` 结果配对。 |
| `tools` / `tool_choice` | 函数或工具定义及选择策略。在可能时会被翻译为所选上游的格式。 |
| `parallel_tool_calls` | 作为客户端偏好原样传递。它不会使模型具备并行调用的能力；模型或提供者必须支持该能力。 |
| `stream` | 启用 SSE 流式传输。客户端必须解析 `data:` 事件，并在 Chat Completions 中遇到 `data: [DONE]` 时停止。 |
| `stream_options.include_usage` | 在可获得用量信息的 Chat Completions 上受支持。转换为拒绝该字段的 Responses 上游时会被移除。 |
| `response_format` | 结构化或 JSON 响应控制取决于提供者。 |
| `reasoning_effort`, `reasoning`, `thinking`, `effort` | 会被规范化为所选提供者的推理控制参数；不受支持的 effort 值可能会被钳制到有效范围，或被上游拒绝。 |
| 多模态内容 | 使用目标模型支持的 OpenAI 消息内容部件。不要假定文本模型接受图像、音频、视频或文档部件。 |

工具调用可以在单个助手轮次中以一个或多个调用的形式发出。当提供者并不原生使用 OpenAI 工具调用对象时，OmniRoute 的翻译器会把提供者的表示形式映射回 OpenAI 响应中的 `tool_calls`。执行工具并在下一次请求中发送对应的工具结果，仍由应用程序负责。

## 流式传输与错误

Chat 与 Responses 流都是长连接的 HTTP 响应。请保持连接直到终止事件到达，并传递客户端的取消信号；若在流开始前收到非 2xx 响应，应按普通 JSON 错误处理。分发期间的提供者故障会通过 OmniRoute 经过净化的错误结构返回；原始上游堆栈和凭据材料不会暴露。

客户端通常会看到以下状态：`400` 表示验证失败或请求结构不受支持，`401` 表示认证失败，`403` 表示策略或密钥权限失败，`404` 表示未知路由或模型，`409` 表示请求冲突，`429` 表示速率限制或容量不足，`5xx` 表示网关或上游故障。确切的 JSON 错误字段属于该路由经过净化的错误辅助工具的一部分，应通过 `status` 以及返回的错误 `code`/`type` 来处理，而不应依赖匹配文字描述。

## 媒体限制

媒体支持因端点和模型而异。`/v1/models` 可能包含无法回答聊天请求的媒体模型；请选择与模型模态相匹配的端点。对于嵌入的媒体，远程来源必须是安全的公共 HTTPS URL；内联来源使用 base64 编码，并限制为每项 8 MiB、总计 16 MiB。ChatGPT Web 的输入图像是更窄的情况：该后端只接受内联 `data:` 图像 URL，不接受远程图像 URL 或文件 ID 引用。

## 通用 OpenAI 兼容提供者节点

运维人员可以添加一个提供者节点，并设置 `type: "openai-compatible"`、`baseUrl`、`prefix` 以及一个 `apiType`：

```json
{
  "name": "Local gateway",
  "prefix": "local",
  "type": "openai-compatible",
  "apiType": "chat",
  "baseUrl": "http://127.0.0.1:1234/v1"
}
```

支持的 `apiType` 值为 `chat`、`responses`、`embeddings`、`audio-transcriptions`、`audio-speech` 和 `images-generations`。OmniRoute 会将对应的标准路径（`/chat/completions`、`/responses`、`/embeddings`、`/audio/transcriptions`、`/audio/speech` 或 `/images/generations`）追加到已配置的基础 URL 之后。末尾的斜杠会被去除。提供者节点的 schema 并不保证每个上游都接受所有 OpenAI 字段；请只配置上游实际提供的端点类型。

## 客户端示例

```bash
export OMNIROUTE_BASE_URL="http://localhost:20128/v1"
export OMNIROUTE_API_KEY="your-api-key"

curl "$OMNIROUTE_BASE_URL/models" \
  -H "Authorization: Bearer $OMNIROUTE_API_KEY"

curl "$OMNIROUTE_BASE_URL/chat/completions" \
  -H "Authorization: Bearer $OMNIROUTE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Hello"}]}'
```

对于 OpenAI SDK，请将其 base URL 设置为 `http://localhost:20128/v1`（即 `/v1` 根路径，而非 `/v1/chat/completions`），并将 OmniRoute 密钥作为 API key 提供。同一根路径也适用于使用 Chat Completions 或 Responses 的客户端，但需遵循客户端自身的传输格式设置。

## 已验证的实现来源

- [公开 API 参考](./API_REFERENCE.md)
- [OpenAI 兼容提供者路由](../../open-sse/services/provider.ts)
- [OpenAI v1 schema](../../src/shared/validation/schemas/apiV1.ts)
- [提供者模型能力元数据](../../src/shared/constants/modelSpecs.ts)
- [提供者节点校验](../../src/shared/validation/schemas/provider.ts)

`/v1/realtime` 尚未实现。客户端必须将其视为不受支持，而不应假定聊天或 Responses 端点提供实时 WebSocket 契约。
