---
title: "CLI 模型目錄與手動中繼資料"
version: "3.8.51"
lastUpdated: "2026-09-21"
---

# CLI 模型目錄與手動中繼資料

`omniroute models` 會先讀取所選伺服器的公開模型目錄，包括其中的自訂條目和同步條目。`--output json` 與 `--output jsonl` 會傳回所有符合的行，不會出現表格截斷提示。互動式表格最多顯示 50 行。JSON 保留公開的上下文上限、模態、能力、伺服器提供的模型來源（如有）以及 API 格式中繼資料；憑證和相容性請求標頭不會輸出。只有當公開 endpoint 傳回 HTTP 404、405 或 501 時，才會 fallback 到舊版 `/api/models`；認證失敗後不會回退。`omniroute completion refresh` 使用同一份目錄。模型目錄請求失敗時傳回非零結束碼，並保留之前的自動完成快取。Bash、Zsh 與 Fish 自動完成指令碼都會列出手動模型子命令。

## 手動模型生命週期

這些操作使用現有的已認證 `/api/provider-models` 管理 API。它們遵循與其他 CLI 命令相同的全域 `--context` 與 `--base-url` 選擇方式。請分別使用正規的提供者 ID 和該提供者的模型 ID；模型 ID 中包含斜線是有效的。請使用已設定的管理上下文，不要把憑證放進命令引數。

```bash
omniroute models openai --output json
omniroute models manual openai
omniroute models add openai my-model --name "My model" --context-window 32768 --dry-run
omniroute models add openai my-model --name "My model" --context-window 32768
omniroute models edit openai my-model --context-window 65536
omniroute models edit openai my-model --clear-context-window
omniroute models remove openai my-model --dry-run
omniroute models remove openai my-model --yes
```

範例僅說明語法；請將提供者與模型 ID 替換為你的伺服器上實際存在的條目。add 操作不會建立提供者連線。

- `add` 會拒絕已存在的自訂條目。選用的 `--max-output-tokens` 在建立時設定輸出上限；`--api-format` 設定模型的 API 格式及與之符合的 endpoint 中繼資料，例如使用 `embeddings` 而非 `chat`。
- `edit` 要求已存在手動條目。其上下文上限使用後端獨立的手動上下文覆寫值；清除該值只會移除這一覆蓋，不會移除原始輸入上限或同步中繼資料。
- `remove` 需要 `--yes`，使用 `--dry-run` 時除外。它會請求 `resetOverride=true`，保留 ID 相同的同步條目。不提供批次刪除。
- `--dry-run` 只執行已認證的預檢讀取，不執行寫入或推論。
- 每次實際寫入後都會 readback 手動目錄。`persistenceVerified: true` 表示寫入後觀察到了請求的中繼資料；它並不表示模型能夠產生文字或呼叫工具。`inferenceValidation` 始終為 `not-run`。
- readback 失敗時傳回非零結束碼。寫入可能已經生效，重試前請先檢查伺服器。本 CLI 不會對並行寫入者進行序列化處理，現有 API 也不提供 compare-and-swap 交易。

## Test & Add：未實作

手動條目未經驗證。沒有 `--validate` 旗標，這些命令也不會發起推論請求或執行工具。未來若實作 opt-in 的驗證流程，必須將推論憑證與管理認證分開，並確定究竟是哪一個具體的提供者連線產生了全部三項證明：產生、綁定 nonce 的合成工具呼叫，以及合成工具結果之後的繼續產生。這些證明不需要真正執行任何工具。

僅有現有的 `x-omniroute-connection` 連線固定（pin）並不足以作為證明 receipt。憑證選擇可能會出於 cooldown、配額或排除帳號等情況有意釋放該固定，而且工作階段親和性也參與選擇。參見 `src/sse/services/auth.ts`，以及 `src/sse/handlers/chat.ts` 中的 `forcedConnectionId` 處理。在實作 Test & Add 之前，需要先確定嚴格固定（strict-pin）或可驗證連線 receipt 的契約。隨後，測試必須證明：在任何失敗、被截斷、逾時或來自錯誤連線的回應之後，都不會發生持久化。這是一個獨立的後端契約決定，並非手動 CRUD 所作的承諾。
