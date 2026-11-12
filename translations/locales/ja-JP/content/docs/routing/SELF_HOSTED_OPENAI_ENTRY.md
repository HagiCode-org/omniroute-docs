---
title: "self-hosted OpenAI 互換エントリ"
---

# self-hosted 統合 OpenAI 互換エントリ

有効にすると、OmniRoute の既存の `/v1/chat/completions`（およびそれが提供する OpenAI 互換の契約）は **self-hosted gateway** になります。OpenAI 互換のリクエストを 1 つ受け取り、プロバイダーアダプターを通じて任意のプロバイダーへ自動ルーティングし、標準的な OpenAI のエラー形式で返します。クライアントコードは変更不要です。

これは RIC-697 設計における D4（接入即用）の差別化要素です。OpenAI SDK がすでに対象としているのと同じ `/v1` パスを、単一の組み込みカタログではなく、自前のプロバイダーで支えます。

## 有効化

次のいずれかの環境変数を設定します（両方とも `.env.example` を参照）：

- `OMNIROUTE_SELF_HOSTED_PROVIDERS` — インライン YAML ドキュメント（実行時のみ、ログには出力されません）。
- `OMNIROUTE_SELF_HOSTED_PROVIDERS_FILE` — YAML ファイルへのパス。

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

**どちらか一方**の変数が設定されていると、`/v1/chat/completions` へのすべてのリクエストで統合エントリが有効になります。設定が存在するのに解析できない場合は `500` を返します（クラウドルーティングに黙って素通りすることはありません）。どちらも設定されていない場合、このルートは従来とまったく同じように動作します。

## プロバイダーの自動ルーティング

優先順位（決定論的であり、予測モデルは使いません）：

1. `x-omniroute-provider: <id>` ヘッダー — プロバイダー ID の完全一致。
2. `model` のプレフィックス：`provider/model`（スラッシュ）または `provider::model`（ダブルコロン）。
3. 最初に設定されたプロバイダー。

ルーティング用のプレフィックスは転送前に取り除かれます。upstream は素のモデル名（`claude/claude-sonnet` ではなく `claude-sonnet`）を受け取ります。

```bash
# via header
curl http://localhost:20128/v1/chat/completions \
  -H "x-omniroute-provider: claude" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet","messages":[{"role":"user","content":"hi"}]}'

# or via model prefix
curl ... -d '{"model":"claude/claude-sonnet","messages":[...]}'
```

## 認証の足場（D5 予約）

オプションの `OMNIROUTE_SELF_HOSTED_API_KEY` があります。設定されている場合、リクエストは `Authorization: Bearer <key>` を含める必要があります。未設定の場合はオープンなルートになります（loopback／信頼できるネットワーク）。これは OmniRoute の既存のローカルプロバイダーの動作と同じです。D5 の quota／quota-自治キーシステムが、このヘッダーを引き継ぐ想定です。

## 失敗時の契約

- upstream の 2xx 以外の body は、`parseUpstreamError` + `buildErrorBody` を通して、標準的な OpenAI の `error` 形式に正規化されます（Hard Rule #12 — upstream の生テキストは決して返しません）。
- ネットワークレベルの障害（接続拒否／DNS／TLS）は、`error.message: "Upstream provider unreachable: …"` を持つ正規化された `502` を返します。
- upstream がエコーした認証情報／セッションヘッダーは、すべてのレスポンスから除去されます。

## テスト

`tests/unit/self-hosted-entry.test.ts` は、プロバイダーの選択、モデルプレフィックスの転送、ヘッダーの衛生管理、認証、upstream エラーの正規化、SSE ストリーミングのパススルー、および素通り／設定ミスの経路を網羅しています。いずれも、ローカルの upstream に対する実際の HTTP で行います。

## 補足

- self-hosted のモデルは、設計上、クラウド専用の retirement／alias の仕組みを迂回します。迂回はそれらのクラウド側のチェックより前に行われるため、`local/llama3` のような ID が cloud-peer の 410 や alias の書き換えに引っかかることはありません。
- 決定論的ルーティング戦略（fallback／cooldown／cost／latency／blacklist）は M2 のスコープ（`RIC-740`）であり、ここでは gateway 層に注入されます。`strategy:` ブロックで設定します — [DETERMINISTIC_ROUTING.md](./DETERMINISTIC_ROUTING.md) を参照してください。
