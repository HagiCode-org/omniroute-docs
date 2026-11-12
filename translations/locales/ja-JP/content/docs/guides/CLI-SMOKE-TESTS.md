---
title: 分離されたCLI smoke test
description: 使い捨てのローカルレスポンスを使って、インストール済みCLIのプロトコル契約を検証します。
version: "3.8.51"
lastUpdated: "2026-09-22"
---

# 分離されたCLI smoke test

インストール済みのAider、Goose、OpenCode、Qwen Code、またはCodexのバイナリーに対して、
オプションのharnessを実行します：

```bash
node scripts/cli/smoke-cli-integrations.mjs --targets qwen,codex --json
```

`--bin-dir /absolute/path`は、既存のバイナリーディレクトリーを先頭に追加します。harnessは
ツールをインストールしません。実行ファイルが見つからない場合は`HOLD-missing-binary`になり、
タイムアウトの場合は`HOLD-timeout`になります。FAILが1つでもあるとプロセスは終了コード1で終了し、
HOLDがあると終了コード2で終了します。終了コード0にするには、すべてのターゲットがPASSする必要があります。

各ターゲットは、`127.0.0.1`にバインドされた使い捨てのHTTPサーバーに対して`omniroute run`経由で実行され、
固定の非シークレットなsentinel認証情報を使用します。HOME、XDGディレクトリー、CLIの設定ホーム、
OmniRouteのデータディレクトリーは一時的なものです。プロバイダーの認証情報、proxy変数、
ランタイムローダーのフラグ、既存の設定は継承されません。実際の上流の認証情報は必要とされず、
受け付けられることもありません。

明示的な`--inherit-isolated-env`harnessオプションは`--inherit-env`を`omniroute run`に転送し、
harnessが制御するメタデータ/アップデート抑制フラグがサードパーティの子プロセスに届くようにします。
デフォルトではオフであり、それでも外側の環境を同じ狭いallowlistから再構築します。
呼び出し元のシークレット、`NODE_OPTIONS`、`NODE_PATH`、`LD_PRELOAD`、`PYTHONPATH`、proxy設定を継承することはありません。
ストレージの暗号化は、使い捨てのデータディレクトリー内でのみ非シークレットのsentinelを使用します。
harnessはまた、LiteLLMのパッケージ済みモデルメタデータとバッファなしのPython出力を選択します。
これらは固定のテスト制御であり、呼び出し元が指定する環境値ではありません。
このオプションには`run --inherit-env`を実装したCLIが必要です。未対応のlauncherは通常どおり失敗し、
成功したsmoke testとしてカウントしてはなりません。

PASSには、子プロセスの正常終了、期待されるプロトコルパスとモデル、sentinelのauthorizationヘッダー、
完了したHTTPレスポンス、そしてサーバーが生成した予測不可能なレスポンスマーカーがstdoutに出力されることが必要です。
マーカーはpromptに含まれないため、promptや診断情報を出力してもテストを満たすことはできません。
これが証明するのは、インストールされたバイナリーの転送/レスポンスの契約であり、実際のプロバイダー認証、
ツール実行、本番デプロイ、あるいはすべてのCLIバージョンについては証明しません。

runnerは取得する出力と実行時間に上限を設けます。POSIXでは専用のプロセスグループを作成し、
teardown時にそのグループの残りのメンバーを終了させます。Windowsでは、同等の子孫プロセスのクリーンアップが
実装されていないため、現在は`HOLD-process-isolation`を返します。
一時ファイルとサーバーソケットは各ターゲットの後に閉じられます。これは設定とプロセスの分離であり、
**オペレーティングシステムのネットワークサンドボックスではありません**。サードパーティのバイナリーが
独自のメタデータやアップデートのリクエストを試みる場合があります。信頼できるインストール済みバイナリーのみを実行し、
非loopbackトラフィックをゼロにする必要がある場合は、外部から制限された環境を使用してください。

サードパーティのバイナリーなしで、harnessの決定論的テストを実行します：

```bash
node --import tsx/esm --test tests/unit/cli/real-cli-smoke-harness.test.ts tests/unit/cli/real-cli-smoke-safety.test.ts
```

mockはOpenAI Chat CompletionsとResponses APIのJSON/SSEをサポートします。リクエストをプロバイダーに転送することはありません。
認証情報に依存する上流テストは別個のopt-inの検証のままであり、このharnessでカバーされていると報告してはなりません。
