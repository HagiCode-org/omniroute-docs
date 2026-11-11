---
title: "決定論的ルーティング戦略"
---

# 決定論的ルーティング戦略

OmniRoute の self-hosted gateway エントリ（`/v1/chat/completions`、RIC-738）は、デフォルトでは
単一のプロバイダーへルーティングします。`strategy:` ブロックを設定すると、ルートの決定は
**決定論的で説明可能なポリシー**になります。これは、NotDiamond や Martian の「予測」型ブラックボックス
ルーティングに対する OmniRoute の差別化要素です。

すべての決定には次の性質があります。

- **決定論的**ï¼同じ設定と同じ実行時状態からは、同じプロバイダーが選ばれます。
- **設定で表現**ï¼一行に一つのルールで、「一体化智能体」も学習済みモデルもありません。
- **説明可能**ï¼すべてのレスポンスに `x-omniroute-route-decision` が付きます。これは「なぜこのモデルなのか」
  （および「なぜあのモデルではないのか」）に 1 行で答えるものです。

これは RIC-697 の差別化における M2（D3 可审计路由）です。**予測や ML への依存はありません**。
各戦略は、観測可能なシグナル（連続失敗回数、宣言されたコスト、計測されたレイテンシ）に対する純粋なルールです。

## 有効化

`providers:` と同じ YAML ドキュメントに `strategy:` ブロックを追加します。または、
`OMNIROUTE_SELF_HOSTED_STRATEGY`（インライン YAML）や `OMNIROUTE_SELF_HOSTED_STRATEGY_FILE`
（ファイル）で、独立した `strategy:` ドキュメントを指定します。環境変数で明示した戦略は、
インラインブロックにキー単位でマージされ、環境変数側が優先されます。

```yaml
# providers.yaml
providers:
  - id: cheap
    kind: openai
    baseUrl: http://127.0.0.1:11434/v1
    model: llama3
    costPer1MInput: 0.2 # USD per 1M input tokens — used by cost-priority
  - id: fast
    kind: openai
    baseUrl: http://127.0.0.1:8080/v1
    model: gpt-4o-mini
    costPer1MInput: 0.6
  - id: premium
    kind: anthropic
    baseUrl: http://127.0.0.1:8081
    model: claude-sonnet
    costPer1MInput: 3.0

strategy:
  blacklist: [] # provider ids never used
  whitelist: [cheap, fast, premium] # when non-empty, ONLY these are used
  costPriority: true # cheapest eligible candidate first
  latencyAware:
    enabled: true # fastest recent-average candidate first
  cooldown:
    consecutiveFailures: 2 # breaker trips after this many in a row
    cooldownMs: 30000 # …and the provider stays excluded this long
  fallbackChain: [cheap, fast, premium] # explicit fallback order
```

## 五つの戦略

| 戦略             | 設定                                          | 効果                                                                                                         |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Blacklist        | `blacklist: [id, ...]`                        | 列挙されたプロバイダーは候補になりません。                                                                   |
| Whitelist        | `whitelist: [id, ...]`                        | 空でない場合、列挙されたプロバイダーだけが候補になります。                                                   |
| Cooldown/breaker | `cooldown: {consecutiveFailures, cooldownMs}` | 連続して N 回失敗したプロバイダーは、一定期間除外されます。成功するとカウンターはリセットされます。         |
| Cost-priority    | `costPriority: true`                          | 対象の候補を `costPer1MInput` の昇順で並べ替えます（宣言された値のみを使い、値を捏造することはありません）。 |
| Latency-aware    | `latencyAware.enabled: true`                  | 対象の候補を、直近の平均リクエストレイテンシの昇順で並べ替えます。サンプルのないプロバイダーは最後になります。 |
| Fallback chain   | `fallbackChain: [id, ...]`                    | プライマリからバックアップへの順序を明示します。コストやレイテンシによる順序より優先されます。               |

フィルター（blacklist / whitelist / cooldown）が先に実行され、候補を取り除きます。続いて順序付けの段階で
残った候補を並べ替えます。明示的な `fallbackChain` が優先され、それがなければ `costPriority`、
`latencyAware` の順で適用されます。

## ピン留めされたプロバイダー

`x-omniroute-provider` ヘッダーと `provider/model` 形式のモデルプレフィックスは、好みではなく
**明示的なピン留め**です。ピン留めされたプロバイダーがハードフィルター（blacklist / whitelist /
有効な cooldown）で除外された場合、リクエストは `400` とピン留めの理由を返して失敗します。
特定のプロバイダーを求めたクライアントを、gateway が黙って別のプロバイダーへ振り替えることはありません。
ピン留めがフィルターを通過した場合、それが最初の候補となり、残りの候補はその fallback chain として機能します。

## 失敗時の fallback

順序付けられた候補リストが fallback chain です。最初のプロバイダーが失敗すると（ネットワーク到達不能、
接続拒否、DNS/TLS の失敗、または 2xx 以外のレスポンス）、gateway は次の候補へ進み、これを繰り返します。
失敗はそのたびに cooldown breaker に記録され、各試行はレイテンシがサンプリングされます。そのため、
故障したプライマリは_後続の_リクエストに対しても cooldown に入ります。すべての候補が失敗した場合は、
最後に正規化されたエラー（OpenAI 形式）が返されます。対象となる候補がまったくない場合は、
説明可能な決定内容をすべて含む `503` が返されます。

## 説明可能性

戦略エンジンを経由したすべてのレスポンスには、次のヘッダーが付きます。

```
x-omniroute-route-decision: cheap(cost-priority: cheap #1) -> fast(cost-priority: fast #2); premium excluded: blacklist: premium forbidden
```

値は、順序付けられた候補リストとすべての除外理由です。これは「なぜこのモデルで、なぜあのモデルではないのか」を
示す監査証跡になります。

## 失敗時の契約（RIC-738 から変更なし）

- アップストリームの 2xx 以外のボディは、`parseUpstreamError` と `buildErrorBody` を通して、
  標準の OpenAI `error` 形式に正規化されます（Hard Rule #12）。
- ネットワークレベルの失敗は、正規化された `502` を返します。チェーン全体を使い切った後は、
  最後に正規化されたエラーが返されます。
- アップストリームにエコーされた認証情報およびセッションのヘッダーは、すべてのレスポンスから取り除かれます。
- 不正な形式の `strategy:` ブロックを含むプロバイダー設定は `500` を返します。誤設定のポリシーが
  黙って何もしない状態になることはありません。

## テスト

- `tests/unit/routing-strategies.test.ts` — 純粋な戦略エンジンに対する 25 件のユニットテスト：
  パース、blacklist/whitelist、cooldown breaker、cost-priority、latency-aware、fallback
  chain、組み合わせパイプライン、説明可能性。
- `tests/unit/self-hosted-entry.test.ts` — 実際の HTTP 上でのフォールトインジェクション：
  プライマリ停止 → fallback が成功、全停止 → 最後のエラー、ピン留め対象が blacklist 入り → 400、
  失敗中のプロバイダーを次のリクエストで cooldown が除外、対象なし → 説明可能な決定付きの 503。
