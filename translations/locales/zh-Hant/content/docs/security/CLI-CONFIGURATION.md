---
title: "CLI 設定的預覽與寫入"
---

# CLI 設定的預覽與寫入

經過身分驗證的 `/api/cli-tools/config` 與 `/api/cli-tools/apply` 路由傳回不可快取、已遮蔽的預覽。它們保留既有的身分驗證與授權檢查。請求主體會拒絕未知欄位。明確指定的 base URL 必須使用 HTTP(S)，且不得內嵌使用者名稱和密碼憑證；省略時使用伺服器設定的 base URL。

批次預覽時，`GET /api/cli-tools/config` 接受選用的 `baseUrl` 查詢參數，並從 `x-omniroute-config-api-key` 請求標頭中讀取設定憑證。查詢字串中的憑證會被拒絕。`POST /api/cli-tools/config` 的 JSON 請求主體接受 `toolId`、`baseUrl`、`apiKey` 以及選用的 `model`。無論成功還是出錯，回應都使用 `Cache-Control: no-store`。預覽文字不是可以直接使用的、帶憑證的設定。

預覽投影會對序列化後的呼叫方憑證，以及合併後的 JSONC、TOML 或 YAML profile 中已存在的憑證欄位進行遮蔽。套用路由寫入的是原始設定；預覽遮蔽不會改變磁碟上的值。格式錯誤的 JSON 會以 400 拒絕。對外的錯誤回應使用標準的、經過清理的錯誤回應封裝。

套用設定時，會先在目標目錄中建立一個私有暫時檔案，將其刷寫到磁碟，再原子地重新命名到目標位置。檔案與備份均使用 `0600` 權限模式；權限在重新命名之前，透過已擁有的檔案描述元設定。目標路徑的最終符號連結以及非一般檔案會被拒絕。在合併已有的 TOML/JSONC 之前，讀取 Codex 與 OpenCode 設定時同樣會拒絕最終路徑上的符號連結。本設計並不聲稱能防範控制父目錄的攻擊者。

容器寫入保護仍然生效：若目標位置是不安全的暫時（ephemeral）路徑，將傳回 422，並指引操作者使用主機上的設定命令。仍可使用試執行（dry run）模式，且不會寫入檔案。受支援的主機設定命令請參閱 [CLI 整合](../guides/CLI-INTEGRATIONS.md)，對外錯誤契約請參閱 [錯誤清理](./ERROR_SANITIZATION.md)。
