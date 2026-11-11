---
title: "🚀 セルフホストガイド — OmniRoute（月額ゼロのセルフホスト / zero-fee self-host）"
version: 3.8.51
lastUpdated: 2026-09-14
---

# 🚀 セルフホストガイド — OmniRoute

> **TL;DR** — コマンド 3 つ、ローカル endpoint 1 つ、月額費用ゼロ。SaaS の
> 課金も、マルチテナント分離も、ホスト型の prompt 処理の中継もありません。
> prompt は選んだプロバイダーへ直接送られます。

```bash
cp .env.selfhost.example .env      # then edit the 2 lines marked "EDIT ME"
docker compose -f docker-compose.selfhost.yml up -d
open http://127.0.0.1:20128
```

これは OmniRoute の「月額ゼロ + セルフホスト」という製品形態の**セルフホスト版の提供形態**です。
自分のマシン上で 5 分で動かせる、パッケージ化されたコンテナ／バイナリです。

---

## このガイドが存在する理由

OmniRoute には、profile（`base`、`web`、`cli`、`host`、`cliproxyapi`、`memory`、`bifrost`）を備えた高機能な
`docker-compose.yml` が同梱されています。各アプリサービスは profile で制御されているため、
素の `docker compose up -d` では Redis しか起動しません。
profile を自分で選べる上級ユーザーにとっては正しい挙動ですが、5 分で始める
セルフホストの手順としては適切では*ありません*。

`docker-compose.selfhost.yml` は KISS オーバーレイです。**コマンド 1 つ、公開済みイメージ、
loopback のみ、Redis 同梱、profile の選択なし、ビルド手順なし。**
手狭になったら、完全版の
[DOCKER_GUIDE](../guides/DOCKER_GUIDE.md) の profile に移行してください。

| 対象 | ここから始める | 移行先 |
| --- | --- | --- |
| セルフホストする個人ユーザー | このガイド | — |
| 上級ユーザー（CLI ツール / Web Cookie 方式のプロバイダー / sidecar） | — | `docker-compose.yml` の profile |

---

## 前提条件

- Docker Engine 24 以上（または Docker Desktop 4.30 以上）と Compose v2 プラグイン。
- 空きメモリ約 2 GB（[サイジング](#コンテナのサイジング)を参照）。
- 対応しているいずれかのプロバイダーの API キー（OpenAI、Anthropic、Google、
  または [150 以上の無料枠](./FREE-TIERS-GUIDE.md)のいずれか）。

ビルドツールチェーン、Node、git clone は不要です。イメージは pull されます。

---

## ステップ 1 — 設定（1 分）

```bash
cp .env.selfhost.example .env
```

`.env` の**2 行だけ**を編集します。

```dotenv
REQUIRE_API_KEY=true          # was false — lock the endpoint down
APP_BIND_HOST=127.0.0.1       # keep loopback; see "Exposing" only if needed
```

`REQUIRE_API_KEY=true` にすると、すべての `/v1` リクエストと dashboard に
API キー／ログインが必要になります。初回起動時に dashboard が
`INITIAL_PASSWORD` を自動生成するので、ログから読み取ってください。

```bash
docker logs omniroute | grep -i password
```

その他の変数（`DASHBOARD_PORT`、`API_PORT`、`LIVE_WS_PORT`、
`OMNIROUTE_MEMORY_MB`）には、すでに妥当な既定値が設定されています。変更が必要だと
わかっている場合を除き、そのままにしてください。

---

## ステップ 2 — 起動（1 分）

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

`diegosouzapw/omniroute:latest`（マルチアーキテクチャ AMD64 + ARM64、約 250 MB）と
`redis:8.6.5-alpine` を pull して両方を起動し、Redis が healthy になるのを待ってから
アプリを起動します。

### ステップ 3 — 動作確認（30 秒）

```bash
# process lifecycle + readiness
curl -fsS http://127.0.0.1:20128/healthz && echo

# container health
docker inspect --format '{{.State.Health.Status}}' omniroute
```

`{"status":"ok"}` と `healthy` が表示されるはずです。続いて dashboard を開きます。

```
http://127.0.0.1:20128
```

`up -d` から約 300 秒以内に、endpoint がローカルから到達可能になり、ヘルスチェックが
`healthy` になります。これはセルフホストの issue で定められた受け入れ基準です。

---

## ポート

| ポート | 用途 | 既定のバインド先 |
| --- | --- | --- |
| `20128` | dashboard + `/v1` LLM proxy（統合エントリ） | `127.0.0.1` |
| `20129` | API ポート（サーバー間通信） | `127.0.0.1` |
| `20132` | Live WebSocket（dashboard のリアルタイム更新） | `127.0.0.1` |

3 つとも、既定では **loopback のみ**にバインドされます。Redis はホストに**まったく公開されず**、
アプリは compose ネットワーク経由で接続します。これは意図的な設計です。認証なしの
Redis を `0.0.0.0` で公開するのは落とし穴になります。

---

## プロバイダーの接続

1. dashboard を開き、**Providers** に移動します。
2. プロバイダーを追加し、その API キーを貼り付けます。キーは AES-256-GCM で
   保存時に暗号化され、平文があなたのマシンの外に出ることはありません。
3. IDE や agent を統合エントリに向けます。

```
http://127.0.0.1:20128/v1
```

プロバイダーの選び方については、
[無料枠ガイド](./FREE-TIERS-GUIDE.md)を参照してください。OmniRoute は 150 以上の無料枠を
1 つの endpoint に集約しているので、`model: "auto"` を指定すれば、リクエストごとに
最適な無料の選択肢が選ばれます。

---

## コンテナのサイジング

イメージでは `OMNIROUTE_MEMORY_MB=1024` が固定されています。これは dashboard と
軽いチャットには十分です。**coding agent**（Claude Code、Codex、Grok などからの
`POST /v1/responses`）は、圧縮の間に大きなコンテキストグラフを複数保持し、
長いコンテキストが 2 つ重なると、old-space が約 12 GiB に達した時点で V8 が異常終了する
場合があります
（[#7849](https://github.com/diegosouzapw/OmniRoute/issues/7849)）。

`.env.selfhost.example` の既定値は `OMNIROUTE_MEMORY_MB=2048` で、coding agent を使う
個人ユーザーにとって安全な下限です。多数のモデルを並列にファンアウトする場合
（fusion combo）や、`FATAL ERROR: Reached heap limit` が発生する場合は、この値を上げてください。

```dotenv
OMNIROUTE_MEMORY_MB=4096
```

メモリ設定は V8 ヒープの上限です。ネイティブバッファ（SQLite、ONNX、better-sqlite3）は
その外側にあるため、コンテナのサイズはヒープより数百 MB 大きく設定してください。

---

## ローカルバイナリのビルド（任意）

Docker よりバイナリを使いたい場合、npm パッケージは同じコードです。

```bash
npm install -g omniroute
omniroute
```

これは Next.js の standalone サーバーをホスト上で直接実行します。ポートも
`DATA_DIR`（既定では `./data`）も同じです。Docker を実行できない場合
（ロックダウンされた VM など）に使用してください。上記のコンテナ経由の方法は、
イメージがテストされた実行環境そのものを同梱しているため、推奨の既定です。

ソースからの場合（開発専用であり、デプロイ方法ではありません）:

```bash
git clone https://github.com/diegosouzapw/OmniRoute.git
cd OmniRoute
npm install
npm run build && npm start
```

---

## localhost を超えた公開

`REQUIRE_API_KEY=false` のまま `APP_BIND_HOST=0.0.0.0` に**変更しないでください**。
そうすると、すべての LAN/WAN インターフェースでオープンな `/v1` proxy が公開され、
ネットワーク上の誰もがあなたのプロバイダーのクォータを使い果たせてしまいます。
手順は固定です。

1. `.env` で `REQUIRE_API_KEY=true` を設定します。
2. ログから `INITIAL_PASSWORD` を読み取り、ログインします。
3. *その後で初めて* `APP_BIND_HOST=0.0.0.0` を設定します（または、認証を強制する
   reverse proxy を前段に置き、loopback のままにします）。

TLS やドメインが必要な場合は、Caddy または Traefik を前段で動かし、`APP_BIND_HOST` は
`127.0.0.1` のままにします。コピー＆ペーストで使える reverse proxy の設定については、
[DOCKER_GUIDE — Caddy HTTPS](../guides/DOCKER_GUIDE.md#docker-compose-with-caddy-https-auto-tls)
と
[Cloudflare Quick Tunnel](../guides/DOCKER_GUIDE.md#cloudflare-quick-tunnel)
の各セクションを参照してください。

---

## データ、バックアップ、リセット

- **データディレクトリ**: `./data`（`/app/data` にバインドマウントされます）。すべての SQLite DB、
  マイグレーション、監査証跡、暗号化されたプロバイダーキーはここに保存されます。
- **バックアップ**: SQLite の自動バックアップは既定で有効です
  （`DISABLE_SQLITE_AUTO_BACKUP` は未設定 → 有効）。手動でスナップショットを取るには次を実行します。
  ```bash
  ./bin/snapshot-data.sh
  ```
  復元は `./bin/restore-data.sh` で行います。
- **dashboard のパスワードのリセット**:
  ```bash
  docker exec -it omniroute node bin/reset-password.mjs
  ```
- **ポリシーのリセット**（ルーティング/フェイルオーバー/クォータを工場出荷時の既定値に戻す）:
  ```bash
  docker exec -it omniroute node bin/restore-policies.sh
  ```

---

## よくある問題

<details>
<summary><code>docker compose up</code> で Redis しか起動しない</summary>

アプリサービスが profile で制御されている**完全版**の `docker-compose.yml` を
実行しています。コマンド 1 つで済ませるには、セルフホスト用のファイルを使ってください。

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

または、完全版の compose で profile を選択します：
`docker compose --profile base up -d`。
</details>

<details>
<summary>ヘルスチェックが <code>starting</code> / <code>unhealthy</code> のままになる</summary>

- Redis が起動しているか確認します： `docker inspect --format '{{.State.Health.Status}}' omniroute-redis`
- アプリのログを確認します： `docker logs omniroute`
- ヘルスチェックは `/healthz` を probe し、20 秒の起動猶予期間を設けています。初回起動が遅い場合
  （コールドマイグレーション）はそれより時間がかかることがあります。ディスクが遅い場合は、
  compose ファイルの `start_period` を延ばしてください。
</details>

<details>
<summary>coding agent の使用中に <code>FATAL ERROR: Reached heap limit</code> が発生する</summary>

`.env` の `OMNIROUTE_MEMORY_MB` を上げ（例： `4096`）、その後
`docker compose -f docker-compose.selfhost.yml up -d` を実行してください。
[コンテナのサイジング](#コンテナのサイジング)を参照してください。
</details>

<details>
<summary>Web Cookie 方式のプロバイダー（Gemini Web、Claude Turnstile）が
<code>Executable doesn't exist at .../ms-playwright/chromium</code> で失敗する</summary>

`base` イメージには Chromium が含まれていません。セルフホスト用の compose は
公開済みの `base` イメージを使用します。Web Cookie 方式のプロバイダーを使うには、
`web` profile を指定した完全版の compose に切り替えてください
（Playwright/Chromium が同梱されます）。

```bash
docker compose --profile web up -d
```

[DOCKER_GUIDE — Available Profiles](../guides/DOCKER_GUIDE.md#available-profiles) を参照してください。
</details>

<details>
<summary>ポート 20128 がすでに使用されている</summary>

`.env` の `DASHBOARD_PORT`、`API_PORT`、`LIVE_WS_PORT` を空いているポートに設定し、
`up -d` を再実行してください。
</details>

---

## これが意図的に含まないもの

セルフホストの KISS 制約に従い、この方法には以下は**含まれません**。

- ❌ SaaS の課金 / 従量計測 / プランの階層
- ❌ マルチテナント分離 / テナントごとの名前空間
- ❌ ホスト型の prompt 処理の中継（prompt はプロバイダーへ直接送られます）
- ❌ 組み込み済みの認証情報やシークレット

これは**純粋なローカルのセルフホスト**の提供形態であり、「月額ゼロ + セルフホスト」という約束を
現実のものにする、最もシンプルな手段です。

---

## セキュリティチェックリスト（セルフホスト）

loopback の外へ公開する前に：

- [ ] `.env` で `REQUIRE_API_KEY=true`
- [ ] `INITIAL_PASSWORD` を強力で一意な値にローテーション済み
- [ ] `APP_BIND_HOST` は、認証を強制する proxy の背後にある場合を除き `127.0.0.1` のまま
- [ ] TLS は前段の Caddy/Traefik/Cloudflare で終端（WAN 上でプレーンな HTTP は使わない）
- [ ] Redis がホストに公開されていない（セルフホスト用 compose はすでにこれを強制しています）
- [ ] `./data` ボリュームを定期的にバックアップ（`bin/snapshot-data.sh`）
- [ ] プロバイダーキーを、各プロバイダー自身のポリシーに従ってローテーション

サプライチェーン / イメージ / 依存関係の監査全般については、
[SECURITY.md](../../SECURITY.md) と
[SUPPLY_CHAIN](../security/SUPPLY_CHAIN.md) を参照してください。

---

## 関連ドキュメント

- [Docker ガイド](../guides/DOCKER_GUIDE.md) — profile、Caddy HTTPS、トンネル、イメージタグ
- [クイックスタート](./QUICK-START.md) — 初めてのユーザー向けの 3 分間の手順
- [無料枠ガイド](./FREE-TIERS-GUIDE.md) — 150 以上の無料プロバイダー枠
- [プロバイダーガイド](./PROVIDERS-GUIDE.md) — プロバイダーの接続と設定
- [トラブルシューティング](../guides/TROUBLESHOOTING.md) — より詳しい問題解決
