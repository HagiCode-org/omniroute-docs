---
title: "确定性路由策略"
---

# 确定性路由策略

OmniRoute 的自托管网关入口（`/v1/chat/completions`，RIC-738）默认把请求路由到单个提供者。配置 `strategy:` 块之后，路由决策就变成了**确定性、可解释的策略**——这正是 OmniRoute 区别于 NotDiamond/Martian 等“predict”式黑盒路由的差异化特性。

每个决策都满足以下三点：

- **确定性**——相同的配置加上相同的运行时状态，会得到同一个提供者。
- **由配置表达**——每行一条规则，没有“一体化智能体”，也没有学习得到的模型。
- **可解释**——每个响应都带有 `x-omniroute-route-decision`，这是一行回答“为什么选这个模型？”（以及“为什么不选那个？”）的说明。

这是 RIC-697 差异化工作的 M2 部分（D3 可审计路由）。它**没有任何预测式或机器学习依赖**——各策略都是基于可观测信号（连续失败次数、声明的成本、实测延迟）的纯规则。

## 启用

可以在与 `providers:` 位于同一个 YAML 文档中添加 `strategy:` 块，也可以通过 `OMNIROUTE_SELF_HOSTED_STRATEGY`（内联 YAML）或 `OMNIROUTE_SELF_HOSTED_STRATEGY_FILE`（文件）环境变量，指向一个独立的 `strategy:` 文档。显式设置的环境变量策略会按键逐项合并到内联块之上。

```yaml
# providers.yaml
providers:
  - id: cheap
    kind: openai
    baseUrl: http://127.0.0.1:11434/v1
    model: llama3
    costPer1MInput: 0.2 # USD per 1M input tokens — used by cost-priority
  - id: fast
    kind: openai
    baseUrl: http://127.0.0.1:8080/v1
    model: gpt-4o-mini
    costPer1MInput: 0.6
  - id: premium
    kind: anthropic
    baseUrl: http://127.0.0.1:8081
    model: claude-sonnet
    costPer1MInput: 3.0

strategy:
  blacklist: [] # provider ids never used
  whitelist: [cheap, fast, premium] # when non-empty, ONLY these are used
  costPriority: true # cheapest eligible candidate first
  latencyAware:
    enabled: true # fastest recent-average candidate first
  cooldown:
    consecutiveFailures: 2 # breaker trips after this many in a row
    cooldownMs: 30000 # …and the provider stays excluded this long
  fallbackChain: [cheap, fast, premium] # explicit fallback order
```

## 五种策略

| 策略 | 配置 | 效果 |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 黑名单 | `blacklist: [id, ...]` | 列出的提供者永远不会成为候选。 |
| 白名单 | `whitelist: [id, ...]` | 列表非空时，只有列出的提供者会成为候选。 |
| 冷却/断路器 | `cooldown: {consecutiveFailures, cooldownMs}` | 某个提供者连续失败 N 次后，会在冷却窗口内被排除。一次成功会把计数器重置。 |
| 成本优先 | `costPriority: true` | 按 `costPer1MInput` 升序对符合条件的候选排序（使用声明值，绝不伪造）。 |
| 延迟感知 | `latencyAware.enabled: true` | 按近期平均请求延迟升序对符合条件的候选排序。未采样的提供者排在最后。 |
| 回退链 | `fallbackChain: [id, ...]` | 显式的主用到备用顺序。优先级高于成本与延迟排序。 |

过滤条件（黑名单、白名单、冷却）先执行，移除不符合条件的候选。随后排序阶段对剩余候选排序：显式的 `fallbackChain` 优先；否则依次应用 `costPriority` 与 `latencyAware`。

## 固定的提供者

`x-omniroute-provider` 请求头和 `provider/model` 模型前缀都是**显式固定**，而不是偏好。如果被固定的提供者被硬过滤条件（黑名单、白名单或生效中的冷却）排除，请求会以 `400` 失败，并附上固定原因。网关绝不会在客户端明确指定某个提供者时悄悄改路由。如果固定的提供者通过了过滤，它就是第一候选，其余候选则作为它的回退链。

## 失败时回退

有序的候选列表即为回退链。当第一个提供者失败（网络不可达、连接被拒、DNS/TLS 错误，或任何非 2xx 响应）时，网关会依次尝试下一个候选，以此类推。每次失败都会记录到冷却断路器中，每次尝试的延迟也会被采样，因此失效的主用提供者也会在 _后续_ 请求中进入冷却。所有候选都失败时，返回最后一个规范化错误（OpenAI 格式）。如果根本没有符合条件的候选，则返回 `503`，并附带完整的可解释决策。

## 可解释性

每个经过策略引擎路由的响应都会带有：

```
x-omniroute-route-decision: cheap(cost-priority: cheap #1) -> fast(cost-priority: fast #2); premium excluded: blacklist: premium forbidden
```

该值是有序的候选列表，外加每一项被排除的原因。它就是回答“为什么选这个模型、为什么不选那个”的审计依据。

## 失败契约（相对 RIC-738 保持不变）

- 上游非 2xx 的响应体会经过 `parseUpstreamError` 与 `buildErrorBody` 规范化为标准的 OpenAI `error` 结构（Hard Rule #12）。
- 网络层失败会返回规范化的 `502`；整条链耗尽后，返回最后一个规范化错误。
- 上游回显的凭据与会话相关请求头会从所有响应中移除。
- 提供者配置中的 `strategy:` 块格式错误时，会返回 `500`。错误配置的策略绝不会悄无声息地变成空操作。

## 测试

- `tests/unit/routing-strategies.test.ts`——针对纯策略引擎的 25 个单元测试：解析、黑名单/白名单、冷却断路器、成本优先、延迟感知、回退链、组合流水线与可解释性。
- `tests/unit/self-hosted-entry.test.ts`——通过真实 HTTP 进行的故障注入：主用提供者宕机 → 回退成功；全部宕机 → 返回最后一个错误；被固定且被黑名单的提供者 → 400；冷却会在下一次请求时排除失败的提供者；无符合条件的候选 → 503，并附带可解释的决策。
