---
title: "🚀 Self-Host 指南 — OmniRoute（零月費自託管 / zero-fee self-host）"
version: 3.8.51
lastUpdated: 2026-09-14
---

# 🚀 Self-Host 指南 — OmniRoute

> **TL;DR** — 三條命令、一個本地 endpoint、零月費。沒有 SaaS 計費、沒有多租戶隔離，
> 也沒有託管的 prompt 處理環節。你的 prompt 會直接傳送到你所選的提供者。

```bash
cp .env.selfhost.example .env      # then edit the 2 lines marked "EDIT ME"
docker compose -f docker-compose.selfhost.yml up -d
open http://127.0.0.1:20128
```

這是 OmniRoute「零月費 + 自託管」產品形態的**self-host 載體**：一個封裝好的容器或二進位檔，可在你自己的機器上於 5 分鐘內執行。

---

## 為什麼需要本指南

OmniRoute 自帶一個功能完備的 `docker-compose.yml`，它提供了多個 profile：`base`、`web`、`cli`、`host`、`cliproxyapi`、`memory`、`bifrost`。每個應用程式服務都受 profile 控制，因此直接執行 `docker compose up -d` 時只會啟動 Redis。對於懂得選擇 profile 的進階使用者來說，這是正確的行為，但它*並不是*一個 5 分鐘即可完成的 self-host 方案。

`docker-compose.selfhost.yml` 是一個 KISS 風格的覆蓋檔案：**一條命令、使用已發布的映像檔、僅綁定 loopback、包含 Redis、無需選擇 profile、無需建置步驟。** 當需求超出它的能力範圍時，請改用完整的 [DOCKER_GUIDE](../guides/DOCKER_GUIDE.md) profile。

| 受眾 | 從這裡開始 | 升級到 |
| --- | --- | --- |
| Self-hoster，單使用者 | 本指南 | — |
| 進階使用者，CLI 工具 / 網頁 Cookie 提供者 / sidecar | — | `docker-compose.yml` profile |

---

## 前置條件

- 帶有 Compose v2 外掛程式的 Docker Engine 24+（或 Docker Desktop 4.30+）。
- 約 2 GB 可用記憶體（參見[容器資源設定](#容器資源設定)）。
- 來自任一受支援提供者的 API 金鑰（OpenAI、Anthropic、Google，或 [150+ 個免費層](./FREE-TIERS-GUIDE.md) 中的任一提供者）。

無需建置工具鏈、無需 Node、無需 git clone，直接拉取映像檔即可。

---

## 步驟 1 — 設定（1 分鐘）

```bash
cp .env.selfhost.example .env
```

在 `.env` 中恰好修改**兩行**：

```dotenv
REQUIRE_API_KEY=true          # was false — lock the endpoint down
APP_BIND_HOST=127.0.0.1       # keep loopback; see "Exposing" only if needed
```

`REQUIRE_API_KEY=true` 讓每個 `/v1` 請求和 dashboard 都需要 API 金鑰或登入。首次啟動時，dashboard 會自動產生一個 `INITIAL_PASSWORD`，請從日誌中讀取：

```bash
docker logs omniroute | grep -i password
```

其他變數（`DASHBOARD_PORT`、`API_PORT`、`LIVE_WS_PORT`、`OMNIROUTE_MEMORY_MB`）已有合理的預設值。除非你確實需要修改，否則請保持不變。

---

## 步驟 2 — 啟動（1 分鐘）

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

會拉取 `diegosouzapw/omniroute:latest`（多架構 AMD64 + ARM64，約 250 MB）和 `redis:8.6.5-alpine`，啟動這兩個容器，並在應用程式啟動前等待 Redis 透過健康檢查。

### 步驟 3 — 驗證（30 秒）

```bash
# process lifecycle + readiness
curl -fsS http://127.0.0.1:20128/healthz && echo

# container health
docker inspect --format '{{.State.Health.Status}}' omniroute
```

你應該會看到 `{"status":"ok"}` 和 `healthy`。然後開啟 dashboard：

```
http://127.0.0.1:20128
```

執行 `up -d` 後約 300 秒內，endpoint 即可在本地存取，健康檢查狀態也會變為 `healthy`，這正是 self-host issue 中的驗收標準。

---

## 連接埠

| 連接埠 | 用途 | 預設綁定 |
| --- | --- | --- |
| `20128` | Dashboard + `/v1` LLM proxy（統一入口） | `127.0.0.1` |
| `20129` | API 連接埠（伺服器間通訊） | `127.0.0.1` |
| `20132` | 即時 WebSocket（dashboard 即時更新） | `127.0.0.1` |

這三個連接埠預設都**僅綁定 loopback**。Redis **完全不會**發布到主機上，應用程式透過 Compose 網路存取它。這是有意為之：在 `0.0.0.0` 上提供未經身分驗證的 Redis 是一個典型的安全隱患。

---

## 連線提供者

1. 開啟 dashboard → **Providers**（提供者）。
2. 新增一個提供者並貼上其 API 金鑰。金鑰使用 AES-256-GCM 加密儲存，純文字永遠不會離開你的機器。
3. 將你的 IDE 或 agent 指向統一入口：

```
http://127.0.0.1:20128/v1
```

關於提供者的選擇，請參閱 [免費層指南](./FREE-TIERS-GUIDE.md)。OmniRoute 將 150+ 個免費層彙整到一個 endpoint 中，因此你可以執行 `model: "auto"`，為每個請求選擇最佳的免費選項。

---

## 容器資源設定

映像檔預設固定為 `OMNIROUTE_MEMORY_MB=1024`，這對 dashboard 和輕量聊天來說足夠了。**coding agent**（來自 Claude Code、Codex、Grok 等的 `POST /v1/responses` 請求）在壓縮時會保留多個大型上下文圖；當兩個長上下文同時重疊時，可能在約 12 GiB 的老生代（old-space）處使 V8 中止（[#7849](https://github.com/diegosouzapw/OmniRoute/issues/7849)）。

`.env.selfhost.example` 預設設定為 `OMNIROUTE_MEMORY_MB=2048`，這是單使用者執行 coding agent 時的安全下限。如果你要並行呼叫多個模型（融合組合），或遇到 `FATAL ERROR: Reached heap limit`，請提高該值：

```dotenv
OMNIROUTE_MEMORY_MB=4096
```

記憶體受 V8 堆上限約束；原生緩衝區（SQLite、ONNX、better-sqlite3）位於堆之外，因此容器的記憶體應比堆大小多出幾百 MB。

---

## 本地二進位建置（選用）

如果你更傾向於二進位檔而不是 Docker，npm 套件的程式碼完全相同：

```bash
npm install -g omniroute
omniroute
```

這會直接在主機上執行 Next.js 獨立（standalone）伺服器，連接埠相同，並使用相同的 `DATA_DIR`（預設為 `./data`）。當你無法執行 Docker 時（例如受限較多的虛擬機器），可以使用它。上文的容器方式是推薦的預設方案，因為它內建了映像檔測試時所用的確切執行階段。

從原始碼建置（僅用於開發，不是部署路徑）：

```bash
git clone https://github.com/diegosouzapw/OmniRoute.git
cd OmniRoute
npm install
npm run build && npm start
```

---

## 暴露到本機之外

**切勿**在 `REQUIRE_API_KEY=false` 的情況下設定 `APP_BIND_HOST=0.0.0.0`。這會在每個區域網路或廣域網路介面上發布一個開放的 `/v1` proxy，網路上的任何人都可以耗盡你的提供者配額。順序是固定的：

1. 在 `.env` 中設定 `REQUIRE_API_KEY=true`。
2. 讀取日誌中的 `INITIAL_PASSWORD` 並登入。
3. *只有在此之後*，才設定 `APP_BIND_HOST=0.0.0.0`（或者在前面放置一個強制身分驗證的 reverse proxy，並保持 loopback）。

如需啟用 TLS 或使用網域名稱，請在前面執行 Caddy 或 Traefik，並將 `APP_BIND_HOST` 保持為 `127.0.0.1`。可參閱 [DOCKER_GUIDE 中的 Caddy HTTPS](../guides/DOCKER_GUIDE.md#docker-compose-with-caddy-https-auto-tls) 和 [DOCKER_GUIDE 中的 Cloudflare Quick Tunnel](../guides/DOCKER_GUIDE.md#cloudflare-quick-tunnel) 兩節，其中有可直接複製貼上的 reverse proxy 設定。

---

## 資料、備份與重設

- **資料目錄**：`./data`（綁定掛載到 `/app/data`）。所有 SQLite 資料庫、遷移檔案、稽核記錄和加密儲存的提供者金鑰都儲存在這裡。
- **備份**：SQLite 自動備份預設開啟（未設定 `DISABLE_SQLITE_AUTO_BACKUP` 即為啟用）。如需手動建立快照：
  ```bash
  ./bin/snapshot-data.sh
  ```
  使用 `./bin/restore-data.sh` 進行還原。
- **重設 dashboard 密碼**：
  ```bash
  docker exec -it omniroute node bin/reset-password.mjs
  ```
- **重設策略**（將路由、故障轉移和配額還原為出廠預設值）：
  ```bash
  docker exec -it omniroute node bin/restore-policies.sh
  ```

---

## 常見問題

<details>
<summary><code>docker compose up</code> 只會啟動 Redis</summary>

你執行的是**完整的** `docker-compose.yml`，其中的應用程式服務受 profile 控制。若要使用一條命令的方式，請使用 self-host 檔案：

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

或者，使用完整的 Compose 時選擇一個 profile：`docker compose --profile base up -d`。
</details>

<details>
<summary>健康檢查一直停留在 <code>starting</code> / <code>unhealthy</code></summary>

- 檢查 Redis 是否已啟動：`docker inspect --format '{{.State.Health.Status}}' omniroute-redis`
- 檢查應用程式日誌：`docker logs omniroute`
- 健康檢查會 probe `/healthz`，並允許 20 秒的啟動期。首次啟動較慢（冷啟動遷移）可能需要更長時間；如果磁碟較慢，請在 Compose 檔案中調大 `start_period`。

</details>

<details>
<summary>使用 coding agent 時出現 <code>FATAL ERROR: Reached heap limit</code></summary>

請在 `.env` 中提高 `OMNIROUTE_MEMORY_MB`（例如 `4096`），然後執行 `docker compose -f docker-compose.selfhost.yml up -d`。參見 [容器資源設定](#容器資源設定)。
</details>

<details>
<summary>網頁 Cookie 提供者（Gemini Web、Claude Turnstile）報錯 <code>Executable doesn't exist at .../ms-playwright/chromium</code></summary>

`base` 映像檔不包含 Chromium，self-host Compose 使用的是已發布的 `base` 映像檔。對於網頁 Cookie 提供者，請切換到完整的 Compose 並使用 `web` profile（其中內建了 Playwright/Chromium）：

```bash
docker compose --profile web up -d
```

參見 [DOCKER_GUIDE 中的可用 profile](../guides/DOCKER_GUIDE.md#available-profiles)。
</details>

<details>
<summary>連接埠 20128 已被佔用</summary>

請在 `.env` 中修改 `DASHBOARD_PORT`、`API_PORT` 和 `LIVE_WS_PORT`，改用其他空閒連接埠，然後重新執行 `up -d`。
</details>

---

## 本指南刻意不包含的內容

根據 self-host 的 KISS 約束，此路徑**不包括**以下內容：

- ❌ SaaS 計費 / 計量 / 方案層級
- ❌ 多租戶隔離 / 每租戶命名空間
- ❌ 託管的 prompt 處理環節（你的 prompt 直接傳送給提供者）
- ❌ 任何內建的憑證或機密資訊

它是一個**純本地 self-host** 載體，以最簡單的方式讓「零月費 + 自託管」的承諾真正落地。

---

## 安全檢查清單（self-host）

在暴露到 loopback 之外之前：

- [ ] 在 `.env` 中設定 `REQUIRE_API_KEY=true`
- [ ] 將 `INITIAL_PASSWORD` 輪換為一個強且唯一的值
- [ ] `APP_BIND_HOST` 保持為 `127.0.0.1`，*除非*位於強制身分驗證的 reverse proxy 之後
- [ ] 由前端的 Caddy/Traefik/Cloudflare 終止 TLS（切勿在廣域網路上使用純文字 HTTP）
- [ ] Redis 未發布到主機（self-host Compose 已強制執行此項）
- [ ] 定期備份 `./data` 磁碟區（`bin/snapshot-data.sh`）
- [ ] 按各提供者自身的政策輪換提供者金鑰

如需完整的供應鏈、映像檔與依賴稽核相關內容，請參閱 [SECURITY.md](../../SECURITY.md) 和 [供應鏈文件](../security/SUPPLY_CHAIN.md)。

---

## 相關連結

- [Docker 指南](../guides/DOCKER_GUIDE.md) — profile、Caddy HTTPS、隧道、映像檔標籤
- [快速開始](./QUICK-START.md) — 面向首次使用者的 3 分鐘路徑
- [免費層指南](./FREE-TIERS-GUIDE.md) — 150+ 個提供者免費層
- [提供者指南](./PROVIDERS-GUIDE.md) — 連線和設定提供者
- [故障排查](../guides/TROUBLESHOOTING.md) — 更深入的問題排查
