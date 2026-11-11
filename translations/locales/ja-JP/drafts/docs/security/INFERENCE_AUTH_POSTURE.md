---
title: "推論認証のポスチャ"
---

# 推論認証のポスチャ

## 概要

`GET /v1/models` と推論 endpoint は、**それぞれ別の設定**によって制御されています。そのため、運用者が「自分の API は保護されているか」を確認するために実行する最も自然な probe が、誤った答えを返すことがあります。

| Endpoint                                                                           | 制御する設定                                                                                                                                       |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/models`                                                                   | dashboard のログインポスチャ — `isAuthRequired()`。インスタンスごとに `requireAuthForModels` で上書きできます（`src/app/api/v1/models/catalogRequest.ts`） |
| `POST /v1/chat/completions`、`POST /v1/responses`、およびその他のクライアント API ルート | `REQUIRE_API_KEY`（`src/server/authz/policies/clientApi.ts`）                                                                                      |

管理者パスワードが設定され、かつ `REQUIRE_API_KEY=false` のインスタンスでは、`/v1/models` は `401` を返す一方、推論はそのポートに到達できる誰にでも開放されています。

> **probe 時の注意：** `/v1/models` からの `401` は、推論が保護されていることを**確認したことにはなりません**。それが示すのは、dashboard がログインを要求しているということだけです。

これは仮定の話ではありません。discussion #13310 では、Traefik の背後にある self-hosted インスタンスで、`/v1/models` が `401` を返していたにもかかわらず、匿名の `POST /v1/responses` トラフィックによって Codex のクォータが消費されました。報告者の言葉を借りれば、この `401` は「最初は API 全体が保護されているという印象を与え」、誤ったコンポーネントの調査に向かわせたといいます。

## 実際に確認する方法

カタログではなく、推論ルートを probe してください。

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST http://<host>:<api-port>/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"<any-model>","messages":[{"role":"user","content":"ping"}]}'
```

`401` が返れば、`REQUIRE_API_KEY` が有効に機能しています。ルーティングに到達するもの（model-not-found エラーを含む）はすべて、匿名トラフィックが受け入れられていることを意味します。

なお、`REQUIRE_API_KEY=false` の場合、**無効な** bearer は拒否されず匿名扱いに格下げされます（#2257）。そのため、でたらめなキーを送ることも有効な probe ではありません。

## 起動時の警告

`REQUIRE_API_KEY` が無効で、サーバーが loopback 以外のインターフェースに bind している場合、OmniRoute は起動時に警告をログに出力します（`src/lib/startup/nonLoopbackApiKeyGuard.ts`）。対象は次の 3 つです。

- `/v1` 推論を提供する Dashboard/API サーバー — `HOST`、デフォルトは `0.0.0.0`
- API ブリッジ — `API_HOST`、デフォルトは `127.0.0.1`
- ライブ dashboard の WebSocket — 独自のホスト

この警告が起動を妨げることはありません。OmniRoute の前段にある reverse proxy が、すでに独自の認証を強制している場合があるためです。

## 関連

- [ENVIRONMENT.md](../reference/ENVIRONMENT.md) の `REQUIRE_API_KEY`
- `APP_BIND_HOST` と compose の loopback デフォルト（#12568）
- #2257 — `REQUIRE_API_KEY` が off のとき、無効な bearer は匿名に格下げされる
- #13695 — このドキュメント
