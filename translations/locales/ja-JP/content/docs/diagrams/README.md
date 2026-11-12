---
title: "ダイアグラム"
version: 3.8.49
lastUpdated: 2026-07-17
---

# ダイアグラム

OmniRoute v3.8.0 のアーキテクチャフロー用の Mermaid ソース（`.mmd`）とエクスポート済みの SVG です。

## 正式なダイアグラム

| ソース                                             | エクスポート済み                         | 使用箇所                                                                       |
| -------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| [request-pipeline.mmd](./request-pipeline.mmd)     | [SVG](./exported/request-pipeline.svg)   | docs/architecture/ARCHITECTURE.md, docs/architecture/CODEBASE_DOCUMENTATION.md |
| [auto-combo-scoring.mmd](./auto-combo-scoring.mmd) | [SVG](./exported/auto-combo-scoring.svg) | docs/routing/AUTO-COMBO.md                                                     |
| [resilience-3layers.mmd](./resilience-3layers.mmd) | [SVG](./exported/resilience-3layers.svg) | docs/architecture/RESILIENCE_GUIDE.md, CLAUDE.md                               |
| [i18n-flow.mmd](./i18n-flow.mmd)                   | [SVG](./exported/i18n-flow.svg)          | docs/guides/I18N.md                                                            |
| [mcp-tools.mmd](./mcp-tools.mmd)                   | [SVG](./exported/mcp-tools.svg)          | docs/frameworks/MCP-SERVER.md                                                  |
| [cloud-agent-flow.mmd](./cloud-agent-flow.mmd)     | [SVG](./exported/cloud-agent-flow.svg)   | docs/frameworks/CLOUD_AGENT.md                                                 |
| [authz-pipeline.mmd](./authz-pipeline.mmd)         | [SVG](./exported/authz-pipeline.svg)     | docs/architecture/AUTHZ_GUIDE.md                                               |
| [db-schema-overview.mmd](./db-schema-overview.mmd) | [SVG](./exported/db-schema-overview.svg) | docs/architecture/CODEBASE_DOCUMENTATION.md                                    |

## 手書きのアニメーション付きダイアグラム

すべてのダイアグラムが `.mmd` ソースから生成されるわけではありません。手書きの SVG はこのディレクトリのルートにあり、SMIL のみ（JS なし、外部フォントなし）でアニメーションするため、GitHub の `<img>` サンドボックス内で再生されます。

| ファイル                                               | 使用箇所              | 備考                                                                                                                                                                                                                                                  |
| ------------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [tier-cascade.svg](./tier-cascade.svg)                 | README.md（ルート）   | 4段階の自動 fallback カスケードのアニメーション（16秒ループ、4幕）。SVG を直接編集してください。`.mmd` ソースはありません。                                                                                                                           |
| [pool-fair-share.svg](./pool-fair-share.svg)           | —（未使用）           | キープールの公平分配クォータのアニメーション（寛容 → 厳格、16秒ループ）。SVG を直接編集してください。`.mmd` ソースはありません。                                                                                                                      |
| [combo-always-on.svg](./combo-always-on.svg)           | スタイルの参照用      | 優先度 combo の fallback（4レイヤー、16秒ループ）のアニメーション。SVG を直接編集してください。`.mmd` ソースはありません。                                                                                                                            |
| [cli-terminal.svg](./cli-terminal.svg)                 | README.md（ルート）   | コンパクトな半分の高さのアニメーションターミナル（1200×350）：実際の CLI コマンド3つを、タイプライター表示とスクロールするサブコマンドティッカーで循環表示します。最初のフレームは完成したプロバイダー画面です。SVG を直接編集してください。`.mmd` ソースはありません。 |
| [compression-pipeline.svg](./compression-pipeline.svg) | README.md（ルート）   | 12エンジンの圧縮ファネルのアニメーション（8秒ループ）。SVG を直接編集してください。`.mmd` ソースはありません。                                                                                                                                        |
| [free-tier-budget.svg](./free-tier-budget.svg)         | README.md（ルート）   | 無料枠の予算カードのアニメーション（月間約 1.62B の定量化された見出し、17プールと Groq 上限の予算バー、プールごとのグリッド、サインアップクレジット、10秒ループ）。SVG を直接編集してください。`.mmd` ソースはありません。                               |
| [readme-hero.svg](./readme-hero.svg)                   | README.md（ルート）   | ヒーローカードのアニメーション（タグライン、プロバイダー数と無料アクセスのライブ見出し、全幅の圧縮バーのデモ、6つの統計チップ）。SVG を直接編集してください。`.mmd` ソースはありません。                                                               |
| [promise-pillars.svg](./promise-pillars.svg)           | README.md（ルート）   | 「The Promise」の6本柱カードのアニメーション（12秒周期のボーダーハイライトスイープ）。SVG を直接編集してください。`.mmd` ソースはありません。                                                                                                          |
| [why-pain-fix.svg](./why-pain-fix.svg)                 | README.md（ルート）   | 「Why OmniRoute」の10行の課題対解決一覧のアニメーション（15秒周期の緑色の行スイープ）。SVG を直接編集してください。`.mmd` ソースはありません。                                                                                                         |
| [strategies-grid.svg](./strategies-grid.svg)           | README.md（ルート）   | 19のルーティング戦略のうち18を示すアニメーショングリッド。`cache-optimized` は隣接する表に記載されています。SVG を直接編集してください。`.mmd` ソースはありません。                                                                                   |
| [privacy-local.svg](./privacy-local.svg)               | README.md（ルート）   | 「Private & Local-First」の11行の保証一覧のアニメーション、receipt チップ付き（16秒周期の緑色の行スイープ）。SVG を直接編集してください。`.mmd` ソースはありません。                                                                                    |
| [resilience-layers.svg](./resilience-layers.svg)       | README.md（ルート）   | 3レイヤーのレジリエンスカードのアニメーション（breaker 状態 CLOSED→OPEN→HALF-OPEN、×2 バックオフ付きのキー cooldown、モデルロックアウト、18秒ループ）。SVG を直接編集してください。`.mmd` ソースはありません。                                         |

## 更新方法

1. `*.mmd` を編集します。
2. 再レンダリングします：`npm run docs:render-diagrams`（`@mermaid-js/mermaid-cli` を使用します）。
3. `.mmd` と `.svg` の両方をコミットします。

ローカルで `@mermaid-js/mermaid-cli` が利用できない場合は、一度だけインストールします：

```bash
npm install -g @mermaid-js/mermaid-cli
```

このスクリプトは、`docs/diagrams/` 内のすべての `.mmd` を白背景で `docs/diagrams/exported/*.svg` にレンダリングします。白背景はダークテーマとライトテーマの両方に適しています。

## ドキュメントからのリンク

`docs/<subfolder>/` 内のドキュメントからは、相対パスは `../diagrams/...` になります：

```markdown
![Request pipeline](../diagrams/exported/request-pipeline.svg)

> Source: [../diagrams/request-pipeline.mmd](../diagrams/request-pipeline.mmd)
```

リポジトリのルート（例：`CLAUDE.md`）からは、次のようになります：

```markdown
![Resilience layers](./exported/resilience-3layers.svg)
```

## 規約

- 1つのダイアグラムにつき1つの概念とします。プラットフォーム全体を1つの図に収めようとしないでください。
- ノードのラベルは短く（3〜6語）します。ノード内の改行には `<br/>` を使用します。
- パイプラインには `flowchart LR`、レイヤー構造のモデルには `flowchart TB` を使うことを推奨します。
- 対話的な（リクエスト/レスポンスの）フローには `sequenceDiagram` を使用します。
- データベーススキーマの概要には `erDiagram` を使用します。
- `.mmd` と `.svg` は同じコミットで更新します。常に同期を保ってください。
