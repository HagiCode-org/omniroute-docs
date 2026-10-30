---
title: "有效的空助手轮次"
---

# 有效的空助手轮次

助手轮次可以在没有可见文本的情况下正常结束。当所选执行使用了受支持的原生端点，并且原始上游响应提供了协议的正常终止信号时，OmniRoute 会保留这样的轮次。没有该证据的空响应，仍会沿用现有的空内容防护。

执行边界会在响应标识上记录此策略。客户端请求头、提供者名称、已规划的连接，以及由翻译合成的终止信号，都无法获得此例外。该上下文会经过响应包装器、JSON 到 SSE 的转换以及非流式去重，它只包含协议与终止标志，不包含凭据，也不包含暴露给客户端的 URL。

## 支持的执行端点

| 执行方式 | 端点约定 |
| --- | --- |
| OpenAI Chat | 已登记的 `https://api.openai.com/v1/chat/completions` 端点 |
| Anthropic Messages，包括 Claude 连接 | 已登记的 `https://api.anthropic.com/v1/messages` 端点 |
| Codex Responses | 已登记的 `https://chatgpt.com/backend-api/codex/responses` 端点 |
| OpenRouter Chat | 已登记的 `https://openrouter.ai/api/v1/chat/completions` 端点 |
| Azure OpenAI / Foundry Responses | HTTPS 资源主机，且主机名须恰好以 `.openai.azure.com` 或 `.services.ai.azure.com` 结尾，路径为 `/openai/v1/responses` |
| Azure Foundry Anthropic | HTTPS 资源主机，且主机名须恰好以 `.services.ai.azure.com` 结尾，路径为 `/anthropic/v1/messages` |

Azure 路径遵循微软的 [端点文档](https://learn.microsoft.com/en-us/azure/ai-foundry/model-inference/concepts/endpoints?tabs=python)、[Responses REST API](https://learn.microsoft.com/en-us/rest/api/aifoundry/azureopenai/responses) 和 [Anthropic SDK 指南](https://learn.microsoft.com/en-us/azure/foundry/how-to/develop/sdk-overview)。非标准的 Azure 端口、URL 凭据、形似的主机名后缀以及其他自定义端点，都不会继承此策略。

## 终止信号与错误处理

- OpenAI Chat 要求原生的 `finish_reason: "stop"`。
- Claude 要求 `end_turn` 或 `stop_sequence`，并且消息生命周期已完整结束。若生命周期打开了内容块却未产生有用输出，则仍受防护。
- Responses 要求原生的已完成响应。若先出现 `response.created`，随后遇到 EOF，则不能将翻译器合成的 stop 作为完成的证明。
- 原生错误优先于正常终止信号。现有的配额错误、缺失终止信号的处理、令牌上限豁免、推理输出以及工具输出，仍保留各自独立的分类。

对于有效的空轮次，直接请求会返回补全结果，而组合会停止，不会从同级目标生成响应。去重后的调用方会共享其所加入执行的策略。空轮次例外不会写入连接冷却或模型锁定状态。

原生终止信号只说明协议层面已完成，无法判断模型是有意保持沉默，还是后端出现了故障。来源检查优先使用实际响应 URL；若不可用，则使用执行器返回的有效请求 URL。若执行器在此边界之前重建了响应，就可能掩盖 HTTP 重定向的最终目标；这并不是重定向证明机制。

## 回归测试证据

[HTTP 回归测试套件](../../tests/unit/valid-empty-stop-dispatch-16072.test.ts) 使用真实的 API 路由、已存储的合成连接、提供者执行器、翻译和组合。它会拦截出站传输并统计生成请求的次数。测试覆盖官方端点形态、原生 JSON 与 SSE、未知来源、错误、去重以及可选的空轮次重试。这些测试不会连接真实的提供者账户，也不会复现报告者的部署或令牌总量。

```sh
node --import tsx/esm --import ./open-sse/utils/setupPolyfill.ts --test --test-force-exit tests/unit/valid-empty-stop-dispatch-16072.test.ts
```

策略的实现位于 [`emptyTurnPolicy.ts`](../../open-sse/utils/emptyTurnPolicy.ts) 中；组合校验会在消费响应之后读取执行的原生终止信号。
