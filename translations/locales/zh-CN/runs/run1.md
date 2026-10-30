# 运行记录 run1(试跑:便宜模型 subagent 流程)

## 概览

- **runId**:run1(2026-10-30;手动试跑,非定时)
- **流程**:`tr.mjs scan` → `next --run run1` → haiku 级 subagent 只凭 `job.json` 翻译 → `check` → 主会话核对 → `finalize` → `glossary merge`
- **源版本标识**:`vendor/OmniRoute` 子模块 HEAD `a58000c7685f4091c7a6fd8ddf3ebce7d2ec67c3`
- **调用方覆盖**:只处理 1 篇(`--doc docs/guides/CLI-MANUAL-MODELS.md`);`COMMIT=false`
- **锁**:已获取并释放。

## 本次结果

| 文档 | 字节数 | 状态 | 备注 |
| --- | --- | --- | --- |
| `docs/guides/CLI-MANUAL-MODELS.md` | 4281 | done | subagent 重试 1 轮后硬校验通过;主会话复核后修正 1 处误译(`wrong-connection response` 原译"连接错误的响应",改为"来自错误连接的响应"),重新校验通过 |

- 完成 1 / 带标记 0 / 失败 0 / 跳过 0。
- 模型 haiku,约 45 秒;subagent 实际消耗约 98k token(含读取文件与提示,不区分输入输出),自报为 0,所以快照里没有记录 token。
- `anchor-check-skipped`:本环境解析不到 `github-slugger`,文内锚点未机器核对;该文档没有文内锚点链接。

## 待办全貌

- 发现 164 篇,148 篇上游已有简体中文译文(`external`),16 篇待翻译;本次后 `fresh` 3、`new` 13;无 `stale` / `drift` / `interrupted` / `blocked`。
- 下一批(按优先级):`docs/getting-started/SELF_HOST_GUIDE.md`(10 KB,会走分块),`docs/reference/OPENCODE-SESSION-IDENTITY.md`,`docs/security/*`,`docs/routing/*`。

## 术语表

- v2 → v3:新增 9 条自动术语(模型目录、手动条目、手动模型、回读、比较并交换、连接固定、合成工具调用、会话亲和性、连接回执);无新增 `conflicts`。

## 需要人处理

- 无。可选:在 `profile.yaml` 里加 `models: { translate: haiku, review: haiku, escalate: sonnet }` 与 `keepBaseSource: true`(代理不改 profile)。
- `anchor-check-skipped` 说明本机没有 `github-slugger` 可解析;要机器核对锚点需在能解析到它的目录运行。
