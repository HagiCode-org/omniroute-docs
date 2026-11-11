---
title: "CLI 伴侶 — 僅複製的終端機指引"
version: 3.8.51
lastUpdated: 2026-09-22
---

# CLI 伴侶

CLI Code dashboard 內建了一個僅複製的伴侶面板，適用於本版 OmniRoute 支援的可執行 CLI 目標。它不會啟動行程、不會寫入設定、不會測試推論，也不會把憑證傳送到 clipboard。

## 伺服器偵測不等於瀏覽器偵測

偵測、執行與設定狀態描述的是執行 OmniRoute 伺服器的那臺機器。如果你從筆記型電腦開啟遠端 dashboard，伺服器上缺少某個 CLI 並不能說明你的筆記型電腦上也沒有安裝該 CLI。未知和偵測失敗的狀態會保持明確顯示，不會被當作「未安裝」。面板中不顯示原始診斷錯誤與設定 endpoint。

請把命令複製到你要使用 CLI 的那臺機器的終端機中。即使伺服器偵測失敗，伴侶面板也不會阻止你按本地說明操作。

## 本地或遠端上下文

先檢查你的終端機中已經設定的上下文：

```sh
omniroute contexts list
omniroute contexts current
```

將伴侶面板的上下文欄位留空，即可使用 CLI 的目前作用中的上下文；也可以填寫一個已存在的上下文名稱。命名上下文可以指向本地或遠端伺服器。dashboard 不會讀取你終端機的上下文儲存，不會建立上下文，也不會複製其憑證。例如，若 `office` 已存在：

```sh
omniroute configure claude --context office
omniroute run claude --context office --dry-run
```

`configure` 是互動式命令，會在你執行它的那臺機器上寫入設定。`run --dry-run` 只顯示啟動計畫而不啟動目標，它並不能證明上游推論可用。執行這些命令之前，請先按照現有的 CLI 上下文流程為終端機完成認證。

只有可執行 manifest 宣告的能力才會提供。如果某個目標需要模型，在你提供真實的模型識別碼之前，它的啟動命令會保持不可用。上下文與模型欄位只接受受限的字元集，並按字面值處理；shell 運算子、空白字元以及以選項前綴開頭的寫法都會被拒絕。

如果 clipboard 存取失敗，面板會報告失敗，並讓命令保持可見，以便你手動選取。複製操作絕不會執行命令。

## 實作邊界

伺服器端載入器 `src/lib/cli-helper/companionTargets.ts` 會把可執行 manifest 轉換為公開描述元。瀏覽器只接收目標 ID、顯示名稱與能力旗標，不會接收 Node 模組或執行階段機密。命令驗證與狀態對應位於 `src/shared/utils/cliCompanion.ts`。面板重複使用 dashboard 現有的批次狀態請求，不引入任何執行介面，也不增加額外的狀態輪詢。
