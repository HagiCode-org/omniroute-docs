---
title: "OpenCode 對話身分"
version: 3.8.51
lastUpdated: 2026-09-21
---

# OpenCode 對話身分

OpenCode 與 OpenCode Go 會在各輪請求之間重複使用明確的對話 ID。解析器依次檢查 `x-opencode-session`、已有的親和性（affinity）與工作階段請求標頭、原生 CLI 的工作階段與執行緒請求標頭、請求中繼資料，最後檢查頂層的工作階段與執行緒欄位。系統會檢查 Claude 中以 JSON 編碼的 `metadata.user_id`，從中查詢工作階段 ID；僅有不透明的帳戶或使用者 ID 時，絕不會將其視為對話 ID。

包含控制字元的值、空 ID 以及長度超過 256 個字元的 ID 都會被忽略。JSON 中繼資料的解析有長度上限。在格式轉換之前，執行器的請求標頭正規化器只會為 OpenCode 提供者保留這一身分；不會為其他提供者注入 OpenCode 請求標頭。

既有的規範 `ses_` 編碼與對話指紋 fallback 機制保持不變。若沒有明確 ID，則仍由第一條使用者訊息及其他既有指紋輸入決定對話的連續性。這不是新的授權邊界，也不能證明上游內容相互隔離。

實作位於 `open-sse/utils/opencodeSessionIdentity.ts`、`open-sse/utils/opencodeHeaders.ts` 和 `open-sse/handlers/chatCore/executorClientHeaders.ts`。迴歸測試覆蓋原生 ID、Claude 中繼資料、優先順序、無效值以及既有的指紋行為，且不產生付費的上游呼叫。
