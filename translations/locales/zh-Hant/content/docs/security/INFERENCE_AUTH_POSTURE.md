---
title: "推論認證策略"
---

# 推論認證策略

## 概述

`GET /v1/models` 與推論 endpoint 受**不同的設定**控制。維運人員最自然的 probe 方式（用來回答「我的 API 是否受到保護？」）因此可能給出錯誤的結論。

| Endpoint                                                                             | 控制來源                                                                                                                                           |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/models`                                                                   | dashboard 登入策略（`isAuthRequired()`），可按執行個體透過 `requireAuthForModels` 覆寫（`src/app/api/v1/models/catalogRequest.ts`）                        |
| `POST /v1/chat/completions`、`POST /v1/responses`，以及其他用戶端 API 路由         | `REQUIRE_API_KEY`（`src/server/authz/policies/clientApi.ts`）                                                                                      |

在設定了管理員密碼且 `REQUIRE_API_KEY=false` 的執行個體上，`/v1/models` 回應 `401`，而任何能存取該連接埠的人都可以使用推論功能，無需認證。

> **Probing 注意事項：** `/v1/models` 回應的 `401` **不能**證明推論功能受到保護，它只說明 dashboard 要求登入。

這並非假設。在討論 #13310 中，一個部署在 Traefik 後面的 self-hosted 執行個體，其 Codex 配額被匿名的 `POST /v1/responses` 流量耗盡，而此時 `/v1/models` 仍傳回 `401`。用報告者的話說，這「最初讓人誤以為整個 API 都受到了保護」，並把他們引向了錯誤的排查方向。

## 實際檢查方法

應當 probe 推論路由，而不是模型目錄：

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST http://<host>:<api-port>/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"<any-model>","messages":[{"role":"user","content":"ping"}]}'
```

回應 `401` 表示 `REQUIRE_API_KEY` 已生效。任何能進入路由處理的回應（包括「模型未找到」錯誤）都說明匿名流量會被接受。

請注意，當 `REQUIRE_API_KEY=false` 時，**無效**的 Bearer token不會被拒絕，而是降級為匿名存取（#2257）。因此，傳送一個隨意的假金鑰同樣不是有效的 probe 方法。

## 啟動警告

當 `REQUIRE_API_KEY` 被停用且服務綁定到非 loopback 地址時，OmniRoute 會在啟動時輸出警告（`src/lib/startup/nonLoopbackApiKeyGuard.ts`）。該警告涵蓋以下三個面向：

- 提供 `/v1` 推論服務的 dashboard/API 伺服器，即 `HOST`，預設值為 `0.0.0.0`
- API 橋接器，即 `API_HOST`，預設值為 `127.0.0.1`
- 即時 dashboard WebSocket，使用其自身的主機設定

該警告不會阻止啟動：OmniRoute 前面的 reverse proxy 可能已經在執行自身的認證。

## 相關內容

- [ENVIRONMENT.md](../reference/ENVIRONMENT.md) 中的 `REQUIRE_API_KEY`
- `APP_BIND_HOST` 與 compose 的 loopback 預設值（#12568）
- #2257 — 當 `REQUIRE_API_KEY` 關閉時，無效的 Bearer token會降級為匿名存取
- #13695 — 本文件
