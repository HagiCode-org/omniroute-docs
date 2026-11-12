---
title: "OpenCode の会話 ID"
version: 3.8.51
lastUpdated: 2026-09-21
---

# OpenCode の会話 ID

OpenCode と OpenCode Go は、ターンをまたいで明示的な会話 ID を再利用します。
リゾルバーは、`x-opencode-session`、既存の affinity/session ヘッダー、ネイティブ CLI の
session/thread ヘッダー、リクエストの metadata、そして最上位の session/thread フィールドの順に確認します。
Claude の JSON エンコードされた `metadata.user_id` からはセッション ID を調べます。
不透明なアカウント/ユーザー ID だけが会話 ID として扱われることはありません。

制御文字を含む値、空の ID、256 文字を超える ID は無視されます。JSON metadata の解析には
上限があります。変換の前に、executor のヘッダーノーマライザーはこの ID を OpenCode の
プロバイダーに対してのみ保持し、他のプロバイダー向けに OpenCode のヘッダーを注入することはありません。

既存の正規の `ses_` エンコードと、会話フィンガープリントの fallback は変更されません。
明示的な ID がない場合は、最初のユーザーメッセージとその他の既存のフィンガープリント入力が
引き続き連続性を決定します。これは新しい認可の境界ではなく、upstream のコンテンツ分離の証明でもありません。

実装は `open-sse/utils/opencodeSessionIdentity.ts`、
`open-sse/utils/opencodeHeaders.ts`、
`open-sse/handlers/chatCore/executorClientHeaders.ts` にあります。回帰テストは、
ネイティブ ID、Claude の metadata、優先順位、無効な値、既存のフィンガープリントの挙動を、
有料の upstream 呼び出しなしでカバーしています。
