---
title: "確定性路由策略"
---

# 確定性路由策略

OmniRoute 的 self-hosted gateway 入口（`/v1/chat/completions`，RIC-738）預設把請求路由到單一提供者。設定 `strategy:` 區塊之後，路由決策就變成了**確定性、可解釋的策略**——這正是 OmniRoute 區別於 NotDiamond/Martian 等「predict」式黑盒路由的差異化特性。

每個決策都具備以下特性：

- **確定性**——相同的設定加上相同的執行階段狀態，會得到同一個提供者。
- **由設定表達**——每行一條規則，沒有「一體化智慧體」，也沒有學習得到的模型。
- **可解釋**——每個回應都帶有 `x-omniroute-route-decision`，這是一行回答「為什麼選這個模型？」（以及「為什麼不選那個？」）的說明。

這是 RIC-697 差異化工作的 M2 部分（D3 可稽核路由）。它**沒有任何預測式或機器學習依賴**——各策略都是基於可觀測訊號（連續失敗次數、宣告的成本、實測延遲）的純規則。

## 啟用

可以在與 `providers:` 位於同一個 YAML 文件中新增 `strategy:` 區塊，也可以透過 `OMNIROUTE_SELF_HOSTED_STRATEGY`（內嵌 YAML）或 `OMNIROUTE_SELF_HOSTED_STRATEGY_FILE`（檔案）環境變數，指向一個獨立的 `strategy:` 文件。明確設定的環境變數策略會按鍵逐項合併到內嵌區塊之上。

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

## 五種策略

| 策略 | 設定 | 效果 |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Blacklist | `blacklist: [id, ...]` | 列出的提供者永遠不會成為候選。 |
| Whitelist | `whitelist: [id, ...]` | 列表非空時，只有列出的提供者會成為候選。 |
| Cooldown/breaker | `cooldown: {consecutiveFailures, cooldownMs}` | 某個提供者連續失敗 N 次後，會在 cooldown 視窗內被排除。一次成功會把計數器重設。 |
| 成本優先 | `costPriority: true` | 按 `costPer1MInput` 升序對符合條件的候選排序（使用宣告值，絕不偽造）。 |
| 延遲感知 | `latencyAware.enabled: true` | 按近期平均請求延遲升序對符合條件的候選排序。未取樣的提供者排在最後。 |
| Fallback chain | `fallbackChain: [id, ...]` | 明確的主用到備用順序。優先順序高於成本與延遲排序。 |

過濾條件（blacklist、whitelist、cooldown）先執行，移除不符合條件的候選。隨後排序階段對剩餘候選排序：明確的 `fallbackChain` 優先；否則依次套用 `costPriority` 與 `latencyAware`。

## 固定的提供者

`x-omniroute-provider` 請求標頭和 `provider/model` 模型前綴都是**明確固定**，而不是偏好。如果被固定的提供者被硬過濾條件（blacklist、whitelist 或生效中的 cooldown）排除，請求會以 `400` 失敗，並附上固定原因。gateway 絕不會在用戶端明確指定某個提供者時悄悄改路由。如果固定的提供者透過了過濾，它就是第一候選，其餘候選則作為它的 fallback chain。

## 失敗時 fallback

有序的候選列表即為 fallback chain。當第一個提供者失敗（網路不可達、連線被拒、DNS/TLS 錯誤，或任何非 2xx 回應）時，gateway 會依次嘗試下一個候選，以此類推。每次失敗都會記錄到 cooldown breaker 中，每次嘗試的延遲也會被取樣，因此失效的主用提供者也會在 _後續_ 請求中進入 cooldown。所有候選都失敗時，傳回最後一個正規化錯誤（OpenAI 格式）。如果根本沒有符合條件的候選，則傳回 `503`，並附帶完整的可解釋決策。

## 可解釋性

每個經過策略引擎路由的回應都會帶有：

```
x-omniroute-route-decision: cheap(cost-priority: cheap #1) -> fast(cost-priority: fast #2); premium excluded: blacklist: premium forbidden
```

該值是有序的候選列表，外加每一項被排除的原因。它就是回答「為什麼選這個模型、為什麼不選那個」的稽核依據。

## 失敗契約（相對 RIC-738 保持不變）

- 上游非 2xx 的回應主體會經過 `parseUpstreamError` 與 `buildErrorBody` 正規化為標準的 OpenAI `error` 結構（Hard Rule #12）。
- 網路層失敗會傳回正規化的 `502`；整條鏈耗盡後，傳回最後一個正規化錯誤。
- 上游回顯的憑證與工作階段相關請求標頭會從所有回應中移除。
- 提供者設定中的 `strategy:` 區塊格式錯誤時，會傳回 `500`。錯誤設定的策略絕不會無聲無息地變成無作用（no-op）。

## 測試

- `tests/unit/routing-strategies.test.ts`——針對純策略引擎的 25 個單元測試：解析、blacklist/whitelist、cooldown breaker、成本優先、延遲感知、fallback chain、組合管線與可解釋性。
- `tests/unit/self-hosted-entry.test.ts`——透過真實 HTTP 進行的故障注入：主用提供者當機 → fallback 成功；全部當機 → 傳回最後一個錯誤；被固定且在 blacklist 中的提供者 → 400；cooldown 會在下一次請求時排除失敗的提供者；無符合條件的候選 → 503，並附帶可解釋的決策。
