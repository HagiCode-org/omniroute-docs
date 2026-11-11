---
title: "Self-Hosted OpenAI 相容入口"
---

# Self-hosted 的統一 OpenAI 相容入口

啟用後，OmniRoute 現有的 `/v1/chat/completions`（及其所提供的 OpenAI 相容契約）會變成一個**self-hosted gateway**：接收一個 OpenAI 相容請求，透過提供者轉接器自動路由到你選擇的提供者，並傳回標準的 OpenAI 錯誤結構。用戶端程式碼無需改動。

這是 RIC-697 設計中的 D4（接入即用）差異化特性：沿用 OpenAI SDK 已經指向的同一條 `/v1` 路徑，但後端由你自己的提供者支撐，而不是單一的內建目錄。

## 啟用

設定以下任一環境變數（兩個變數的範例見 `.env.example`）：

- `OMNIROUTE_SELF_HOSTED_PROVIDERS` — 內嵌 YAML 文件（僅在執行階段使用，不寫入日誌）。
- `OMNIROUTE_SELF_HOSTED_PROVIDERS_FILE` — YAML 檔案的路徑。

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

只要**任一**變數被設定，統一入口就會對所有發往 `/v1/chat/completions` 的請求生效。若設定存在但無法解析，將傳回 `500`（絕不會無聲地落入雲端路由）。兩個變數都未設定時，該路由的行為與之前完全一致。

## 提供者自動路由

優先順序（確定性，不使用預測模型）：

1. `x-omniroute-provider: <id>` 請求標頭 —— 精確符合提供者 id。
2. `model` 前綴：`provider/model`（斜線）或 `provider::model`（雙冒號）。
3. 第一個已設定的提供者。

路由前綴在轉發前會被去掉 —— 上游接收到的是不含前綴的模型名稱（`claude-sonnet`，而不是 `claude/claude-sonnet`）。

```bash
# via header
curl http://localhost:20128/v1/chat/completions \
  -H "x-omniroute-provider: claude" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet","messages":[{"role":"user","content":"hi"}]}'

# or via model prefix
curl ... -d '{"model":"claude/claude-sonnet","messages":[...]}'
```

## 認證骨架（D5 預留）

選用設定 `OMNIROUTE_SELF_HOSTED_API_KEY`。設定後，請求必須攜帶 `Authorization: Bearer <key>`。未設定時為開放路由（loopback 或可信網路），與 OmniRoute 現有本地提供者的方式保持一致。D5 的配額與自治金鑰系統預計將接管該請求標頭。

## 失敗契約

- 上游傳回的非 2xx 回應主體，會經由 `parseUpstreamError` 與 `buildErrorBody` 正規化為標準 OpenAI `error` 結構（Hard Rule #12：絕不傳回原始上游文字）。
- 網路層失敗（連線被拒絕 / DNS / TLS）會傳回正規化的 `502`，錯誤資訊為 `error.message: "Upstream provider unreachable: …"`。
- 上游回顯的憑證與工作階段請求標頭，會從每個回應中剝離。

## 測試

`tests/unit/self-hosted-entry.test.ts` 涵蓋提供者選擇、模型前綴轉發、請求標頭處理、認證、上游錯誤正規化、SSE 串流透傳，以及直接落入雲端路由與設定錯誤的路徑 —— 全部透過對本地上游的真實 HTTP 呼叫完成。

## 備註

- self-hosted 模型按設計繞過雲端專屬的停用與別名機制：分流發生在這些雲端檢查之前，因此 `local/llama3` 這類 id 永遠不會觸發雲端對等節點傳回的 410，也不會被別名改寫。
- 確定性路由策略（fallback、cooldown、成本、延遲與 blacklist）屬於 M2 的範圍（`RIC-740`），並在此注入 gateway 層。請透過 `strategy:` 設定區塊進行設定，參見 [DETERMINISTIC_ROUTING.md](./DETERMINISTIC_ROUTING.md)。
