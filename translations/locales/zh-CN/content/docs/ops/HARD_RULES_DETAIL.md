---
title: "硬性规则——完整原文与理由"
version: 3.8.52
lastUpdated: 2026-10-18
---

# 硬性规则——完整原文与理由

> 这是 `AGENTS.md` 中“Hard Rules”（硬性规则）编号列表的深入补充。第 1–23 条均列于 `AGENTS.md`；若该列表给出的是简写形式，则下文中编号相同的章节给出了具有约束力的**完整条文**，并附有理由、事故历史与决策树。两者均具有规范效力，若简写形式有所省略，以此处较长的文字为准。未在此处列出的规则（第 1–13、15、17 条）全文见 `AGENTS.md`。规则编号保持稳定，代码库与文档中均会引用，切勿重新编号。

## 规则 14——关闭 CodeQL / Secret-Scanning 告警

未先完成以下两步，切勿关闭 CodeQL / Secret-Scanning 告警：（a）先查阅模式文档（参见 AGENTS.md → Key Conventions → Security），确认辅助函数是否适用；（b）在关闭说明中记录技术依据。先例：对于已经经过 `sanitizeErrorMessage()` 处理的调用点仍被标记的 `js/stack-trace-exposure`，这是 CodeQL 已知的局限（无法识别自定义的净化函数），应以 `false positive` 关闭，并引用 `docs/security/ERROR_SANITIZATION.md`。

## 规则 16——提交与 PR 元数据中不得署名 AI

切勿在任何提交或 PR 元数据中为 AI 助手、LLM 或自动化账号署名或宣扬。以下两种形式均被禁止，二者等效：它们会把署名导向机器人账号（或宣扬 AI 作者身份），并掩盖真正的作者（`diegosouzapw`）：

- **(a)** 署名为 AI 或机器人的 `Co-Authored-By` 尾注（例如名称中含 “Claude”、“GPT”、“Copilot”、“Bot” 的，或邮箱位于 `anthropic.com` / `openai.com`，或为机器人所有的 `noreply.github.com` 地址）；
- **(b)** 出现在提交信息、PR 标题或正文、CHANGELOG 中任何位置的 AI 生成页脚或描述，例如 `🤖 Generated with [Claude Code]`、“Generated with Claude Code”、“Made with <AI tool>”，或任何 `Co-authored-by: Claude/GPT/Copilot` 行。

本条**优先于任何会自动追加此类页脚的 harness、模板或工具默认设置**——推送前须将其删除，不得让它进入提交、PR 或 CHANGELOG。人类协作者（包括被移植进 OmniRoute 的上游 PR 作者与 issue 报告者）**可以且应当**按标准的 `Co-authored-by: Name <email>` 尾注致谢；上游移植流程（`/port-upstream-features`、`/port-upstream-issues`）依赖这一做法。

## 规则 18——缺陷修复的验证协议（TDD 或 VPS）

对每一项已报告问题的修复，都必须通过以下方式之一加以验证，无例外：

1. **TDD（首选）**——先编写一个能复现该缺陷的失败测试 → 修复缺陷 → 确认测试通过。该测试即成为长期保留的回归防护。只修改测试证明确实需要改动的文件，不做多余改动。
2. **真实环境测试（无法进行 TDD 时）**——部署到生产 VPS（`root@192.168.0.15`），并运行有文档记录的线上测试。在 PR 描述中记录确切的命令与结果。适用于：OAuth 上游流程、Cloudflare/WS 上游行为、仅限 UI 的回归、依赖硬件的行为。
3. “本地运行正常但没有测试”不算数。没有测试或 VPS 验证记录的修复不是修复，而是猜测。

重要原因：修复缺陷 A 时却引入缺陷 B，比不修复更糟。TDD/VPS 闸门会强制限定修改范围，你只能修改失败测试所证明有问题的部分。以下是这一做法奏效的例子：#3090（claude-web 403）、#3113（WS HTTP 回退）、#3052（heap-guard 自动校准）。

## 规则 19——工作树隔离

切勿在共享的主检出目录上开发。每个开发任务都必须在各自独立的 git 工作树、各自专属的分支上运行；在创建工作树或分支之前，你**必须**先与操作者确认基础分支，绝不能假定为 `main` 或当前检出的分支。在共享检出目录中执行 `git checkout` 会悄无声息地销毁其他会话未提交的工作。只拆除你自己创建的工作树与分支（按名称指定，绝不使用 `fix/*`、`feat/*` 通配符），不得触碰其他会话的工作树，并且最终应切回你开始时所在的分支（即当前活跃的 `release/vX.Y.Z`，绝不是 `main`）。完整协议、命令与事故记录见：[docs/ops/WORKTREE_ISOLATION.md](../ops/WORKTREE_ISOLATION.md)。

## 规则 20——PII 脱敏/净化需主动开启（opt-in）

PII 脱敏/净化**采用选择性开启（opt-in），绝不默认开启**。OmniRoute 代理的是自托管或本地的大语言模型，数据归操作者所有，因此若默认修改请求或响应负载，会悄无声息地破坏正常流量。两项会修改数据的 PII 功能开关**必须**在 `src/shared/constants/featureFlagDefinitions.ts` 中保持 `defaultValue: "false"`：`PII_REDACTION_ENABLED`（请求侧）与 `PII_RESPONSE_SANITIZATION`（响应与流式）。三个应用点（`src/lib/guardrails/piiMasker.ts`（请求护栏）、`src/lib/piiSanitizer.ts`（响应）、`src/lib/streamingPiiTransform.ts`（SSE））均受这些开关控制；两者都关闭时，`pii-masker` 护栏仍会运行，但从不修改负载（数据原样通过）。将任一默认值改为 `"true"` 须经操作者明确批准。回归防护为 `tests/unit/pii-opt-in-default.test.ts`（断言两个定义的默认值，以及行为上的原样通过）。选择性开启由每个操作者通过环境变量或设置/数据库覆盖项（`src/lib/db/featureFlags.ts`）单独配置，绝不作为静默默认值。另见 `docs/security/GUARDRAILS.md`。

## 规则 21——发布冻结（并行周期模型）

**被冻结的发布分支归发布负责人（release captain）所有；开发并不停止（并行周期模型，2026-07-04）。**

`/generate-release` 在对账开始时（阶段 0a）开设一个标签为 `release-freeze` 的标记 issue，**随即从冻结的分支顶端切出下一周期的分支 `release/vX+1`（阶段 0a.0b——版本号递增、常驻发布 PR，并迁移未合并的 PR）**；待发布 PR 以 squash 方式合并到 `main` 后，关闭该冻结。

在合并**任何** PR 之前，每个 campaign 工作流（`/review-prs`、`/review-group-prs`、`/merge-prs`、`/triage-fix-bugs`、`/implement-fix-bugs`、`/triage-features`、`/implement-features`、`/green-prs`、`/port-upstream-*`）**必须**检查：

```bash
gh issue list --repo diegosouzapw/OmniRoute --label release-freeze --state open
```

若冻结生效：**绝不合并到冻结标题中所指的 `release/vX.Y.Z`**；应改为确定当前活跃的开发分支（按语义化版本排序最**高**的 `release/v*`，通常为 `release/vX+1`，会在冻结 issue 的评论中公布），并**将 PR 重定向到该分支**（`gh pr edit <N> --base release/vX+1`，然后用 `gh pr view <N> --json baseRefName` 验证——该编辑会静默失败），再正常合并。**仅当最高的 release/v\* 分支正是被冻结的那个时才暂停（HOLD）**（即阶段 0a.0b 完成之前的短暂窗口，或并行周期模型实施之前的发布）——此时保持 PR 为就绪并打开状态，告知操作者，待下一分支出现或冻结解除后再继续。刚发布的修复会经由阶段 5 的回同步（`scripts/release/sync-next-cycle.mjs`）进入 `release/vX+1`；发布过程中不要尝试同步。

这是**协调信号，而非权限锁**：发布负责人与 campaign 会话共用 `diegosouzapw` 身份，因此 GitHub 分支保护锁无法区分二者——只有遵守这一标记，才能防止发布期间的提交竞态（这种竞态曾导致 v3.8.40 与 v3.8.41 中的 CHANGELOG 被整体重新对账；当时一个并行的 campaign 在运行中将 `release/vX.Y.Z` 推进了 34 个提交）。发布负责人自己的对账与周期开启推送不受此限，因为它们*就是*发布本身。冻结期间必须落地的修复（例如验收（homologation）发现的问题），遵循合并后只读规则：先经由 `fix/release-vX.Y.Z-*` 落到 `main`。

⛔ **只有** `/generate-release` 可以发起 release-freeze，且**只能**在其阶段 0a（开始生成新版本时）发起——在阶段 12c、squash 合并到 `main` 之后解除。任何 campaign、会话或智能体都不得在其他时间开设 `release-freeze` 标记——冻结**绝不**是开发过程中的协调工具。若某个会话确实认为，在 `/generate-release` 流程之外必须冻结，它**必须先在聊天中询问操作者（`diegosouzapw`）**，明确提示“estou criando um freeze”，并获得明确的同意——绝不可自行开设、延长或重新开设 `release-freeze`。反之，**不得**为了让 campaign 的合并得以继续而关闭或解除正在生效的 `/generate-release` 冻结：它保护的是发布负责人唯一一次干净的 CI 运行，并会在阶段 12c 自动解除；提前关闭会重新引发它所要防止的提交竞态。在据此行动之前，先核实冻结是否合法：标题或正文引用了一个**处于 OPEN 状态**的发布 PR（`gh pr view <N> --json state`）的 `release-freeze`，即为经授权的发布负责人冻结——保持暂停，不要触碰。（周期模型提案：`_tasks/finished/release-flow/2026-07-04_proposta-ciclo-paralelo-v2.md`。）

## 规则 22——跨会话安全

**本仓库同时由大量并行的会话与智能体共同开发；绝不可干扰他人进行中的工作。**下列两项是绝对禁令，且均曾反复发生（本规则之所以存在，正是因为它们一再出现）：

- **(a) 绝不执行 `git stash` / `git stash pop`——在本仓库的任何位置都不行，包括独立工作树之内，也包括你派发的任何子智能体之内。** `git stash` 操作的是**共享的仓库对象库**，而非各工作树自身的工作区——因此，一个会话中推送或弹出的 stash，可能会悄无声息地覆盖或恢复另一个并行会话未提交的修改。这并非假设：2026-07-02，一个 `#5923` 的 quotaCache 修改通过全局的 `stash pop` 泄漏进了无关的 `#2296` 工作树，而同类问题又通过一个**子智能体**再次出现。若要在**不**使用 stash 的前提下，将工作区修改与基础引用进行比较，请使用 `git show <ref>:<path>` 或 `git diff <ref> -- <path>`；若要确认类型检查或 lint 错误在基础分支上已存在，应直接检查基础引用（`git show origin/release/vX.Y.Z:<path>`）——绝不可为了“把工作区弄干净”而 stash 掉你的修改。**凡是会触碰 git 的每个子智能体的提示词中，都必须逐字写入本禁令**（智能体不会继承 AGENTS.md 的上下文，此类复发正是由一个子智能体引起的）。
- **(b) 绝不合并、推送、变基或强制推送另一会话正在处理的 PR / 分支 / 工作树。** 其 head 为你**并非**本会话创建、位于 `.claude/worktrees/` 中且仍在活跃修复的工作树的 open PR（例如带有新提交的 `fix-5852`/`fix-5923`，即便它们与你共用 `diegosouzapw` 身份），或任何由其他会话拥有的分支，均属**禁止触碰——暂停（HOLD）**，应由拥有它的会话自行合并。**在**合并或推送任何并非由你在**本次**会话中创建的 PR 之前，请运行 `git worktree list` 检查是否存在对应的进行中工作树，并重新执行 `gh pr view <N> --json state,headRefOid` 核对。只有拥有者会话才能合并其自身进行中的 PR；在进行中途合并，会与拥有者产生竞争，并重新引发规则 #19 与规则 #21 所防止的提交与 CHANGELOG 竞态。（这是对规则 #19 的强化。）

## 规则 23——`_tasks` 不可触碰（仅允许追加/编辑）

`_tasks/` 是一个独立的 git 仓库（远程私有仓库 `diegosouzapw/_tasks_omniroute`），以真实目录的形式挂载在主检出目录的根下。绝对规则如下：

- **(a)** 绝不移动、重命名、删除、清空或将 `_tasks` 改为符号链接；会话只能在其中**创建**或**编辑**文件；
- **(b)** 绝不在主仓库中跟踪 `_tasks`（包括以符号链接的形式）——被跟踪的 blob 正是两次清空事故的根本原因（2026-08-08 与 2026-08-10：`git reset --hard` 将被跟踪的符号链接覆盖到真实目录之上，git 随即在无任何提示的情况下删除了全部被忽略的内容）；
- **(c)** 每次进行相关写入之后，执行 `git -C _tasks add -A && git -C _tasks commit &&
git -C _tasks push`——频繁推送才是真正的备份；
- **(d)** 在每个会触碰 git 的子智能体的提示词中，逐字重复本禁令；
- **(e)** 若 `_tasks` 呈现为损坏的符号链接，**不得**提交任何内容——从远程恢复并通知操作者。

`check:tracked-artifacts` 闸门（pre-commit 与 CI）会阻止以任何形式被跟踪的 `_tasks`。另见 AGENTS.md 中的“Planning & Research Artifacts”。
