---
title: 隔離的 CLI smoke test
description: 使用拋棄式的本地回應驗證已安裝 CLI 的協議契約。
version: "3.8.51"
lastUpdated: "2026-09-22"
---

# 隔離的 CLI smoke test

對已安裝的 Aider、Goose、OpenCode、Qwen Code 或 Codex 可執行檔執行選用的 harness：

```bash
node scripts/cli/smoke-cli-integrations.mjs --targets qwen,codex --json
```

`--bin-dir /absolute/path` 會前置一個已存在的二進位檔目錄。該 harness 不會安裝任何工具。缺少的可執行檔會產生 `HOLD-missing-binary`；逾時會產生 `HOLD-timeout`。任何 FAIL 都會使行程以結束碼 1 結束；HOLD 則以結束碼 2 結束。所有目標都必須 PASS，結束碼才為 0。

每個目標都透過 `omniroute run` 執行，由綁定在 `127.0.0.1` 上的拋棄式 HTTP 伺服器提供服務，並使用固定的、非機密的 sentinel 憑證。HOME、XDG 目錄、CLI 設定目錄以及 OmniRoute 資料目錄都是暫時的。提供者憑證、proxy 變數、執行階段載入器旗標與已有設定均不會被繼承。不需要、也不接受真實的上游憑證。

明確的 `--inherit-isolated-env` harness 選項會把 `--inherit-env` 轉發給 `omniroute run`，使 harness 控制的中繼資料/更新抑制旗標能夠傳到第三方子行程。該選項預設關閉，並且仍然從同一份窄白名單重建外層環境：它絕不會繼承呼叫者的機密、`NODE_OPTIONS`、`NODE_PATH`、`LD_PRELOAD`、`PYTHONPATH` 或 proxy 設定。儲存加密只在拋棄式資料目錄內使用非機密的 sentinel 值。該 harness 還會選擇 LiteLLM 的隨附的模型中繼資料以及無緩衝的 Python 輸出；這些都是固定的測試控制項，而非呼叫者提供的環境變數值。該選項要求 CLI 實作 `run --inherit-env`；不支援的 launcher 會正常失敗，不得計為成功的 smoke test。

PASS 需要滿足：子行程成功結束、出現預期的協議路徑與模型、sentinel 授權標頭、HTTP 回應完整結束，並且標準輸出中出現一個不可預測的、由伺服器產生的回應標記。該標記不會出現在 prompt 中，因此列印 prompt 或診斷資訊無法滿足測試。這證明的是已安裝二進位檔的傳輸/回應契約，並不證明真實的提供者認證、工具執行、生產部署，或每一個 CLI 版本。

執行器會限制擷取輸出的大小與執行時間。在 POSIX 系統上，它會建立獨立的行程群組，並在收尾時終止該組中殘留的行程；Windows 目前傳回 `HOLD-process-isolation`，因為尚未實作等價的後代行程清理。每個目標結束後，暫時檔案與伺服器 socket 都會被關閉。這是設定與行程隔離，**不是作業系統層級的網路沙箱**：第三方二進位檔仍可能自行發出中繼資料或更新請求。只執行可信的已安裝二進位檔；若要求零非 loopback 流量，請使用外部受限的環境。

執行該 harness 的確定性測試，無需第三方二進位檔：

```bash
node --import tsx/esm --test tests/unit/cli/real-cli-smoke-harness.test.ts tests/unit/cli/real-cli-smoke-safety.test.ts
```

該模擬伺服器支援 OpenAI Chat Completions 與 Responses API 的 JSON/SSE 格式。它從不把請求轉發給提供者。依賴憑證的上游測試仍是單獨的、需要 opt-in 的驗證，不得報告為已被本 harness 覆蓋。
