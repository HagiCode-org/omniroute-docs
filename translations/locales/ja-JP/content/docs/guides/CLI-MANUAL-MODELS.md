---
title: "CLIのモデルカタログと手動メタデータ"
version: "3.8.51"
lastUpdated: "2026-09-21"
---

# CLIのモデルカタログと手動メタデータ

`omniroute models`は、まず選択したサーバーの公開モデルカタログを読み取ります。これにはカスタムエントリーと
同期されたエントリーが含まれます。`--output json`と`--output jsonl`は、テーブルの切り詰めメッセージなしで、
一致するすべての行を返します。対話式のテーブルは最大50行を表示します。JSONは、公開されたコンテキスト上限、
モダリティ、機能、サーバーから提供された場合のモデルソース、およびAPIフォーマットのメタデータを保持します。
認証情報と互換性ヘッダーは出力されません。レガシーの`/api/models`fallbackは、公開endpointがHTTP 404、405、
または501を返した場合にのみ使用され、認証失敗の後に使用されることはありません。
`omniroute completion refresh`も同じカタログを使用します。モデルカタログのリクエストが失敗すると、
非ゼロの終了コードを返し、以前の補完キャッシュを保持します。Bash、Zsh、Fishの補完スクリプトは、
手動モデルのサブコマンドを提示します。

## 手動モデルのライフサイクル

これらの操作は、既存の認証済み`/api/provider-models`管理APIを使用します。他のCLIコマンドと同じ
グローバルな`--context`および`--base-url`の選択に従います。正規のプロバイダーIDとプロバイダーのモデルIDを
別々に指定してください。スラッシュを含むモデルIDも有効です。認証情報をコマンド引数に含めるのではなく、
設定済みの管理コンテキストを使用してください。

```bash
omniroute models openai --output json
omniroute models manual openai
omniroute models add openai my-model --name "My model" --context-window 32768 --dry-run
omniroute models add openai my-model --name "My model" --context-window 32768
omniroute models edit openai my-model --context-window 65536
omniroute models edit openai my-model --clear-context-window
omniroute models remove openai my-model --dry-run
omniroute models remove openai my-model --yes
```

例は構文を示すものです。プロバイダー/モデルのIDは、お使いのサーバーに存在するエントリーに置き換えてください。
add操作はプロバイダー接続を作成しません。

- `add`は既存のカスタムエントリーを拒否します。オプションの`--max-output-tokens`は作成時に出力上限を設定します。
  `--api-format`はモデルのAPIフォーマットと、それに対応するendpointメタデータ（`embeddings`であって`chat`ではない、など）を設定します。
- `edit`には既存の手動エントリーが必要です。そのコンテキスト上限は、バックエンドの独立した手動コンテキストの
  オーバーライドを使用します。これをクリアすると、そのオーバーライドが削除されますが、元の入力上限や
  同期されたメタデータは削除されません。
- `remove`は`--dry-run`の場合を除き`--yes`が必要です。`resetOverride=true`をリクエストし、
  同じIDの同期されたエントリーを保持します。一括削除は公開されていません。
- `--dry-run`は認証済みの事前読み取りを行いますが、書き込みも推論も行いません。
- 実際の変更ごとに、手動カタログのreadbackを行います。`persistenceVerified: true`は、書き込み後に
  要求されたメタデータが確認されたことを意味します。モデルがテキストを生成したりツールを呼び出したりできることを
  意味するものではありません。`inferenceValidation`は常に`not-run`です。
- readbackの失敗は非ゼロの終了コードを返します。書き込みはすでに反映されている可能性があります。
  再試行する前にサーバーを確認してください。同時書き込みはこのCLIによって直列化されず、
  既存のAPIはcompare-and-swapトランザクションを提供しません。

## Test & Add：未実装

手動エントリーは未検証です。`--validate`フラグはなく、これらのコマンドは推論リクエストを発行せず、
ツールも実行しません。将来のopt-inの検証フローでは、推論の認証情報と管理認証を分離し、
3つの証明（生成、nonceに紐付けられた合成ツール呼び出し、合成ツール結果の後の継続）のすべてを、
どの具体的なプロバイダー接続が生成したかを確立する必要があります。
これらの証明に実際のツール実行は必要ありません。

既存の`x-omniroute-connection`ピンだけでは、証明のreceiptとして不十分です。
認証情報の選択は、cooldown、クォータ、または除外アカウントの場合に意図的にピンを解放することがあり、
セッションアフィニティも選択に関与します。`src/sse/services/auth.ts`および
`src/sse/handlers/chat.ts`の`forcedConnectionId`の処理を参照してください。
Test & Addを実装する前に、厳密なピン、または検証可能な接続receiptの契約を決定してください。
その上で、失敗、切り詰め、タイムアウト、または誤った接続のレスポンスのいずれの後にも永続化が行われないことを、
テストで証明する必要があります。これは別個のバックエンドの契約上の決定であり、手動CRUDが約束するものではありません。
