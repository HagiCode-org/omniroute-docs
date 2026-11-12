---
title: "OmniRoute ドキュメント"
version: 3.8.40
lastUpdated: 2026-06-28
---

# OmniRoute ドキュメント

OmniRoute ドキュメントセットのナビゲーション用インデックスです。トピックは目的別にまとめているため、必要な情報をすばやく見つけられます。

> プロジェクトの概要、インストール手順、リリースノートをお探しの場合は、ルートの [README.md](../README.md), [ROADMAP.md](../ROADMAP.md), [CHANGELOG.md](../CHANGELOG.md), [CONTRIBUTING.md](../CONTRIBUTING.md) を参照してください。

---

## 非技術系ユーザー向け

OmniRoute を使うためのシンプルなガイドです。技術的な背景知識は不要です。

### getting-started/

- [QUICK-START.md](getting-started/QUICK-START.md) — OmniRoute を3分でインストールして実行します。
- [AUTO-COMBO-GUIDE.md](getting-started/AUTO-COMBO-GUIDE.md) — OmniRoute に最適な AI を選ばせます。
- [PROVIDERS-GUIDE.md](getting-started/PROVIDERS-GUIDE.md) — AI プロバイダーの接続方法。
- [FREE-TIERS-GUIDE.md](getting-started/FREE-TIERS-GUIDE.md) — クレジットカードなしで無料の AI を利用します。
- [WEB-COOKIE-GUIDE.md](getting-started/WEB-COOKIE-GUIDE.md) — Web cookie プロバイダー（セッション認証情報のセットアップ）。

### guides/

- [SETUP_GUIDE.md](guides/SETUP_GUIDE.md) — OmniRoute の初回セットアップ。
- [USER_GUIDE.md](guides/USER_GUIDE.md) — dashboard と API の日常的な使い方。
- [THINKING_BUDGET.md](guides/THINKING_BUDGET.md) — thinking/reasoning の予算モード（passthrough と auto-strip）。
- [FEATURES.md](guides/FEATURES.md) — dashboard の機能ギャラリー。
- [CHAOS-MODE.md](guides/CHAOS-MODE.md) — 複数モデルの並列/協調実行（セットアップ、権限、API）。
- [TIERS.md](guides/TIERS.md) — OmniRoute のティアの解説（ユーザーガイド）。
- [USAGE_QUOTA_GUIDE.md](guides/USAGE_QUOTA_GUIDE.md) — 使用量、クォータ、支出の追跡。
- [COST_TRACKING.md](guides/COST_TRACKING.md) — コストと支出の追跡。
- [FREE_PROVIDER_RANKINGS.md](guides/FREE_PROVIDER_RANKINGS.md) — 無料プロバイダーのランキング（Arena ELO）。
- [DOCKER_GUIDE.md](guides/DOCKER_GUIDE.md) — Docker 上での OmniRoute の実行（coding agent 向けのランタイム RAM を含む）。
- [ELECTRON_GUIDE.md](guides/ELECTRON_GUIDE.md) — デスクトップ（Electron）ビルド。
- [TERMUX_GUIDE.md](guides/TERMUX_GUIDE.md) — Termux 経由での Android 上での実行。
- [PWA_GUIDE.md](guides/PWA_GUIDE.md) — dashboard を PWA としてインストールします。
- [REMOTE-MODE.md](guides/REMOTE-MODE.md) — OmniRoute のリモート公開とスコープ付き token。
- [CLI-INTEGRATIONS.md](guides/CLI-INTEGRATIONS.md) — `setup-*` CLI 連携の一覧表。
- [OPENCODE-V2-PLUGIN.md](guides/OPENCODE-V2-PLUGIN.md) — OpenCode v2 plugin のインストールと設定。
- [CLAUDE-CODE-CONFIGURATION.md](guides/CLAUDE-CODE-CONFIGURATION.md) — OmniRoute と組み合わせた Claude Code CLI。
- [CODEX-CLI-CONFIGURATION.md](guides/CODEX-CLI-CONFIGURATION.md) — OmniRoute と組み合わせた Codex CLI。
- [KIRO_SETUP.md](guides/KIRO_SETUP.md) — Kiro のセットアップ。
- [ANTIGRAVITY-ONBOARDING.md](guides/ANTIGRAVITY-ONBOARDING.md) — Antigravity（Google One AI）のオンボーディング。
- [MANAGEMENT-AUTH.md](guides/MANAGEMENT-AUTH.md) — 管理認証。
- [I18N.md](guides/I18N.md) — 翻訳と locale のワークフロー。
- [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md) — 詳細なトラブルシューティングリファレンス。
- [UNINSTALL.md](guides/UNINSTALL.md) — クリーンな削除手順。

---

## 技術系ユーザー向け

開発者とコントリビューター向けの技術ドキュメントです。

## architecture/

システムがどのように構成されているかを説明します。ランタイム、コードレイアウト、レジリエンスモデルを理解するために読んでください。

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — システム全体のアーキテクチャ（リクエストパイプライン、レイヤー、モジュール）。
- [CODEBASE_DOCUMENTATION.md](architecture/CODEBASE_DOCUMENTATION.md) — コードベースのエンジニアリングリファレンス。
- [REPOSITORY_MAP.md](architecture/REPOSITORY_MAP.md) — ディレクトリごとのナビゲーションガイド。
- [AUTHZ_GUIDE.md](architecture/AUTHZ_GUIDE.md) — 認可パイプライン（route classifier と policy engine）。
- [RESILIENCE_GUIDE.md](architecture/RESILIENCE_GUIDE.md) — プロバイダーの circuit breaker、connection cooldown、モデルロックアウト。
- [QUALITY_GATES.md](architecture/QUALITY_GATES.md) — quality gate のスクリプトと CI ジョブの一覧。
- [MONITORING_SECTIONS.md](architecture/MONITORING_SECTIONS.md) — モニタリング/コストの dashboard ナビゲーション。
- [cluster-decisions.md](architecture/cluster-decisions.md) — オプションの sidecar/cluster profile に関する決定事項。
- [DESIGN_SYSTEM.md](architecture/DESIGN_SYSTEM.md) — デザインシステムとビジュアルアイデンティティ。
- [ROUTER_BACKENDS.md](architecture/ROUTER_BACKENDS.md) — ルーターバックエンドと組み込みサービスのアーキテクチャ契約（ADR）。
- [admission-lanes.md](architecture/admission-lanes.md) — 2つの admission-lane システムと、それぞれの gate となるもの。
- [persistence-backend-boundary.md](architecture/persistence-backend-boundary.md) — プラガブルな永続化の境界（ADR）。

## reference/

ルックアップ用の資料：API サーフェス、環境変数、CLI フラグ、プロバイダーカタログ。

- [API_REFERENCE.md](reference/API_REFERENCE.md) — REST API の endpoint と形式。
- [PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) — 自動生成されたプロバイダーカタログ（手作業で編集しないでください）。
- [REMOVED_PROVIDERS.md](reference/REMOVED_PROVIDERS.md) — 運営者の要請により削除されたプロバイダー。書面による許可なしに再導入しないでください。
- [PROVIDER_PLUGIN_MANIFEST.md](reference/PROVIDER_PLUGIN_MANIFEST.md) — Bifrost と CLIProxyAPI の移行向けの、sidecar 安全なプロバイダー plugin 契約。
- [openapi.yaml](openapi.yaml) — 公開 API の OpenAPI 仕様。
- [ENVIRONMENT.md](reference/ENVIRONMENT.md) — 環境変数のリファレンス。
- [FEATURE_FLAGS.md](reference/FEATURE_FLAGS.md) — フィーチャーフラグとそのデフォルト値。
- [CLI-TOOLS.md](reference/CLI-TOOLS.md) — 同梱の CLI コマンド。
- [FREE_TIERS.md](reference/FREE_TIERS.md) — 無料枠の LLM プロバイダーディレクトリ。
- [FREE_PROXIES_API.md](reference/FREE_PROXIES_API.md) — 無料 proxy の API。
- [RELAY_BACKEND_STRATEGY.md](reference/RELAY_BACKEND_STRATEGY.md) — relay バックエンド戦略。
- [RELAY_TROUBLESHOOTING.md](reference/RELAY_TROUBLESHOOTING.md) — relay のトラブルシューティング。

## frameworks/

クライアント、agent、オペレーターに公開されるプラガブルなサブシステム。

- [MCP-SERVER.md](frameworks/MCP-SERVER.md) — Model Context Protocol サーバー。
- [A2A-SERVER.md](frameworks/A2A-SERVER.md) — Agent-to-Agent（A2A）JSON-RPC サーバー。
- [ACP.md](frameworks/ACP.md) — Agent Client Protocol。
- [AGENT_PROTOCOLS_GUIDE.md](frameworks/AGENT_PROTOCOLS_GUIDE.md) — A2A / ACP / Cloud agent の概要。
- [AGENTBRIDGE.md](frameworks/AGENTBRIDGE.md) — IDE agent ブリッジ。
- [AGENT-SKILLS.md](frameworks/AGENT-SKILLS.md) — agent スキルのカタログ。
- [CLOUD_AGENT.md](frameworks/CLOUD_AGENT.md) — Cloud agent のランタイムとプロバイダー。
- [SKILLS.md](frameworks/SKILLS.md) — Skills フレームワーク（サンドボックス化された拡張）。
- [MEMORY.md](frameworks/MEMORY.md) — 永続メモリ（FTS5 + Qdrant）。
- [WEBHOOKS.md](frameworks/WEBHOOKS.md) — webhook のイベントとディスパッチ。
- [EVALS.md](frameworks/EVALS.md) — eval スイート。
- [GAMIFICATION.md](frameworks/GAMIFICATION.md) — ゲーミフィケーションとリーダーボードのシステム。
- [EMBEDDED-SERVICES.md](frameworks/EMBEDDED-SERVICES.md) — 組み込み sidecar サービス（9Router、CLIProxyAPI）。
- [NOTION_CONTEXT.md](frameworks/NOTION_CONTEXT.md) — Notion コンテキストソース。
- [OBSIDIAN_CONTEXT.md](frameworks/OBSIDIAN_CONTEXT.md) — Obsidian コンテキストソース。
- [LOCAL_CORPUS_CONTEXT.md](frameworks/LOCAL_CORPUS_CONTEXT.md) — ローカルコーパスのコンテキストソース（MCP に公開される承認済みディレクトリ）。
- [OPENCODE.md](frameworks/OPENCODE.md) — OpenCode 連携。
- [OPEN_SSE_ARCHITECTURE.md](frameworks/OPEN_SSE_ARCHITECTURE.md) — open-sse ストリーミングエンジンの内部構造。
- [PLAYGROUND_STUDIO.md](frameworks/PLAYGROUND_STUDIO.md) — Playground Studio UI。
- [SEARCH_TOOLS_STUDIO.md](frameworks/SEARCH_TOOLS_STUDIO.md) — Search Tools Studio UI。
- [TRAFFIC_INSPECTOR.md](frameworks/TRAFFIC_INSPECTOR.md) — トラフィックインスペクター（MITM）。
- [PLUGINS.md](frameworks/PLUGINS.md) — CLI plugin システムの概要。
- [PLUGIN_SDK.md](frameworks/PLUGIN_SDK.md) — plugin SDK リファレンス。
- [PLUGIN_MARKETPLACE.md](frameworks/PLUGIN_MARKETPLACE.md) — plugin マーケットプレイス。
- [RADAR.md](frameworks/RADAR.md) — Radar の無料モデルカタログオーバーレイ（オプション、デフォルトでは無効）。

## routing/

Combo ルーティング、スコアリング、リプレイ。

- [AUTO-COMBO.md](routing/AUTO-COMBO.md) — Auto-Combo（多因子スコアリング、19種類の戦略）。
- [QUOTA_SHARE.md](routing/QUOTA_SHARE.md) — クォータ共有エンジン。
- [REASONING_REPLAY.md](routing/REASONING_REPLAY.md) — reasoning リプレイキャッシュ。
- [REASONING_ROUTING.md](routing/REASONING_ROUTING.md) — reasoning ルーティングルール（effort/budget ルールエンジン）。

## security/

guardrail、コンプライアンス、stealth、および公開認証情報とエラーメッセージを扱うための必須パターン。

- [GUARDRAILS.md](security/GUARDRAILS.md) — PII、prompt injection、ビジョンの guardrail。
- [COMPLIANCE.md](security/COMPLIANCE.md) — 監査証跡とコンプライアンス。
- [STEALTH_GUIDE.md](security/STEALTH_GUIDE.md) — TLS / フィンガープリントの stealth。
- [PUBLIC_CREDS.md](security/PUBLIC_CREDS.md) — 公開されている upstream の OAuth client_id/secret と Firebase Web キーを、シークレットスキャナーに検知されずに埋め込むための**必須**パターン。
- [ERROR_SANITIZATION.md](security/ERROR_SANITIZATION.md) — すべてのエラーレスポンスを `sanitizeErrorMessage` 経由にしてスタックトレースの露出を防ぐための**必須**パターン。
- [ROUTE_GUARD_TIERS.md](security/ROUTE_GUARD_TIERS.md) — route-guard の分類ティア。
- [CLI_TOKEN.md](security/CLI_TOKEN.md) — CLI の machine-ID token（HMAC と従来の SHA-256）認証。
- [EGRESS_POLICY.md](security/EGRESS_POLICY.md) — egress IP ファミリー（IPv4/IPv6）のポリシー。
- [BAN_DETECTION.md](security/BAN_DETECTION.md) — アカウント BAN/禁止キーワードの検出。
- [AGENTROUTER_WAF.md](security/AGENTROUTER_WAF.md) — agentrouter.org の WAF。
- [CORS.md](security/CORS.md) — CORS の設定とセキュリティ。
- [MITM-TPROXY-DECRYPT.md](security/MITM-TPROXY-DECRYPT.md) — 透過 MITM 復号。
- [SUPPLY_CHAIN.md](security/SUPPLY_CHAIN.md) — サプライチェーン gate（SLSA、SBOM、Trivy、osv-scanner、Scorecard）。
- [SOCKET_DEV_FINDINGS.md](security/SOCKET_DEV_FINDINGS.md) — サプライチェーンの検出結果の証明。

## compression/

Prompt compression のエンジン、ルール、言語パック。

- [COMPRESSION_GUIDE.md](compression/COMPRESSION_GUIDE.md) — 圧縮の最上位の概要。
- [COMPRESSION_ENGINES.md](compression/COMPRESSION_ENGINES.md) — 利用可能な圧縮エンジン。
- [COMPRESSION_RULES_FORMAT.md](compression/COMPRESSION_RULES_FORMAT.md) — ルールファイルの形式。
- [COMPRESSION_LANGUAGE_PACKS.md](compression/COMPRESSION_LANGUAGE_PACKS.md) — 言語パック。
- [RTK_COMPRESSION.md](compression/RTK_COMPRESSION.md) — RTK エンジンの詳細解説。
- [CONTEXT_EDITING.md](compression/CONTEXT_EDITING.md) — 委任されたコンテキスト編集（Anthropic）。
- [EXTENDING_COMPRESSION.md](compression/EXTENDING_COMPRESSION.md) — カスタム圧縮エンジンの追加。

## providers/

プロバイダー固有の連携ガイド。

- [CLAUDE_WEB.md](providers/CLAUDE_WEB.md) — Claude Web（cookie 認証）プロバイダー。
- [CHATGPT_WEB.md](providers/CHATGPT_WEB.md) — ChatGPT Web（Codex）プロバイダーと、一般プロバイダーの廃止に関する注記。
- [COPILOT-M365.md](providers/COPILOT-M365.md) — Microsoft 365 Copilot（BizChat）プロバイダー。
- [ALIBABA-QWEN-PROVIDER-FAMILIES.md](providers/ALIBABA-QWEN-PROVIDER-FAMILIES.md) — Alibaba と Qwen のプロバイダーファミリー。
- [AGENTROUTER.md](providers/AGENTROUTER.md) — AgentRouter のセットアップ。
- [ZED-DOCKER.md](providers/ZED-DOCKER.md) — Docker 下での Zed IDE 連携。
- [CURSOR-DOCKER.md](providers/CURSOR-DOCKER.md) — Docker 下での Cursor モデル一覧。

## comparison/

- [OMNIROUTE_VS_ALTERNATIVES.md](comparison/OMNIROUTE_VS_ALTERNATIVES.md) — OmniRoute と代替製品の比較。

## ops/

リリース、デプロイ、proxy、トンネル、カバレッジ、データベース、モニタリング。

- [RELEASE_CHECKLIST.md](ops/RELEASE_CHECKLIST.md) — リリースフローのチェックリスト。
- [RELEASE_GREEN.md](ops/RELEASE_GREEN.md) — PR キューとリリースブランチを green に保つ方法。
- [BRANCHING_MODEL.md](ops/BRANCHING_MODEL.md) — ブランチとリリースのモデル。
- [MERGE_TRAIN.md](ops/MERGE_TRAIN.md) — マージキューと手動 merge-train のランブック。
- [HOMOLOGATION.md](ops/HOMOLOGATION.md) — homologation スイート（`npm run homolog`）。
- [QUALITY_GATE_PLAYBOOK.md](ops/QUALITY_GATE_PLAYBOOK.md) — quality gate のプレイブック。
- [RUNNER_BOX.md](ops/RUNNER_BOX.md) — self-hosted ランナーボックスの運用。
- [BRANCH_PROTECTION_MAIN.md](ops/BRANCH_PROTECTION_MAIN.md) — `main` ブランチの保護。
- [CONTRIBUTION_GOLDEN_PATH.md](ops/CONTRIBUTION_GOLDEN_PATH.md) — コントリビューションのゴールデンパス（変更種別ごとの絞り込んだチェック）。
- [COVERAGE_PLAN.md](ops/COVERAGE_PLAN.md) — テストカバレッジの計画。
- [DATABASE_GUIDE.md](ops/DATABASE_GUIDE.md) — DB スキーマと運用。
- [SQLITE_RUNTIME.md](ops/SQLITE_RUNTIME.md) — SQLite ドライバー解決チェーン。
- [REDIS_PRODUCTION_CONFIG.md](ops/REDIS_PRODUCTION_CONFIG.md) — Redis の本番設定。
- [MONITORING_GUIDE.md](ops/MONITORING_GUIDE.md) — モニタリングとオブザーバビリティ。
- [FLY_IO_DEPLOYMENT_GUIDE.md](ops/FLY_IO_DEPLOYMENT_GUIDE.md) — Fly.io へのデプロイ。
- [VM_DEPLOYMENT_GUIDE.md](ops/VM_DEPLOYMENT_GUIDE.md) — 汎用 VM へのデプロイ。
- [PROXY_GUIDE.md](ops/PROXY_GUIDE.md) — upstream proxy の設定。
- [TUNNELS_GUIDE.md](ops/TUNNELS_GUIDE.md) — Cloudflare トンネルなど。

## diagrams/

上記のドキュメントから参照される Mermaid ソースとエクスポート済みの SVG/PNG ダイアグラム。[diagrams/README.md](diagrams/README.md) を参照してください。

## i18n/

66の locale によるドキュメントの翻訳ミラー（英語の原文を加えて合計67言語）。サポートされている言語の一覧は [i18n/README.md](i18n/README.md) を参照してください。

## screenshots/

dashboard と README で使用される静的なスクリーンショット。ドキュメント本文の一部ではありません。

---

## 自動生成される成果物

- [reference/PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) は、`src/shared/constants/providers.ts` から `scripts/docs/gen-provider-reference.ts` によって生成されます。手作業で編集しないでください。
- `/docs` UI は、上記のサブフォルダーからの Fumadocs MDX ソース生成を基盤としています。
