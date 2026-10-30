---
title: "自托管 OpenAI 兼容入口"
---

# 自托管的统一 OpenAI 兼容入口

启用后，OmniRoute 现有的 `/v1/chat/completions`（及其提供的 OpenAI 兼容约定）会变成一个**自托管网关**：接收一个 OpenAI 兼容请求，通过提供者适配器自动路由到你选择的提供者，并返回标准的 OpenAI 错误结构。客户端代码无需改动。

这是 RIC-697 设计中的 D4（接入即用）差异化特性：沿用 OpenAI SDK 已经指向的同一条 `/v1` 路径，但后端由你自己的提供者支撑，而不是单一的内置目录。

## 启用

设置以下任一环境变量（两个变量的示例见 `.env.example`）：

- `OMNIROUTE_SELF_HOSTED_PROVIDERS` — 内联 YAML 文档（仅在运行时使用，不记录日志）。
- `OMNIROUTE_SELF_HOSTED_PROVIDERS_FILE` — YAML 文件的路径。

```yaml
# providers.yaml
providers:
  - id: local
    kind: openai # openai | anthropic | local
    baseUrl: http://127.0.0.1:11434/v1
    model: llama3
    # apiKey: sk-...       # optional, runtime-only
  - id: claude
    kind: anthropic
    baseUrl: http://127.0.0.1:8080
    model: claude-sonnet
```

只要**任一**变量被设置，统一入口就会对所有发往 `/v1/chat/completions` 的请求生效。若配置存在但无法解析，将返回 `500`（绝不会悄悄回退到云端路由）。两个变量都未设置时，该路由的行为与之前完全一致。

## 提供者自动路由

优先级（确定性，不使用预测模型）：

1. `x-omniroute-provider: <id>` 请求头 —— 精确匹配提供者 id。
2. `model` 前缀：`provider/model`（斜杠）或 `provider::model`（双冒号）。
3. 第一个已配置的提供者。

路由前缀在转发前会被去掉 —— 上游接收到的是裸模型名（`claude-sonnet`，而不是 `claude/claude-sonnet`）。

```bash
# via header
curl http://localhost:20128/v1/chat/completions \
  -H "x-omniroute-provider: claude" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet","messages":[{"role":"user","content":"hi"}]}'

# or via model prefix
curl ... -d '{"model":"claude/claude-sonnet","messages":[...]}'
```

## 认证骨架（D5 预留）

可选设置 `OMNIROUTE_SELF_HOSTED_API_KEY`。设置后，请求必须携带 `Authorization: Bearer <key>`。未设置时为开放路由（回环地址或可信网络），与 OmniRoute 现有本地提供者的方式保持一致。D5 的配额与自治密钥体系预计将接管该请求头。

## 失败约定

- 上游返回的非 2xx 响应体，会经由 `parseUpstreamError` 与 `buildErrorBody` 规范化为标准 OpenAI `error` 结构（Hard Rule #12：绝不返回原始上游文本）。
- 网络层失败（连接被拒绝 / DNS / TLS）会返回规范化的 `502`，错误信息为 `error.message: "Upstream provider unreachable: …"`。
- 上游回显的凭据与会话请求头，会从每个响应中剥离。

## 测试

`tests/unit/self-hosted-entry.test.ts` 覆盖提供者选择、模型前缀转发、请求头处理、认证、上游错误规范化、SSE 流式透传，以及回退与配置错误路径 —— 全部通过对本地上游的真实 HTTP 调用完成。

## 备注

- 自托管模型按设计绕过云端专属的下线与别名机制：分流发生在这些云端检查之前，因此 `local/llama3` 这类 id 永远不会触发云端对等节点返回的 410，也不会被别名改写。
- 确定性路由策略（回退、冷却、成本、延迟与黑名单）属于 M2 的范围（`RIC-740`），并在此注入网关层。请通过 `strategy:` 配置块进行设置，参见 [DETERMINISTIC_ROUTING.md](./DETERMINISTIC_ROUTING.md)。
