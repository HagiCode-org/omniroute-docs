---
title: "Worktree 隔离协议"
version: 3.8.52
lastUpdated: 2026-10-18
---

# Worktree 隔离协议

> 这是 AGENTS.md → Git Workflow → "Worktree isolation" 以及硬性规则 #19/#22 的操作细则。规范性规则位于 `AGENTS.md`；本文件记录分步流程、命令与事故历史。

## 为何必须隔离

多个会话或智能体会并行处理本仓库。主检出目录是**共享的**，因此在其中执行 `git checkout` 或切换分支，会悄无声息地丢弃其他会话未提交的工作，并让正在运行的其他任务失去所依赖的分支（事故记录：2026-06-05、2026-06-13）。

**规则：绝不在共享的主检出目录中开发。每个任务都必须拥有自己的 git worktree 和专用分支，并且在创建之前，必须与操作者确认基础分支。**

## 分步流程

1. **先问：基于哪个分支？** 在创建任何内容之前，请询问操作者（除非其已经告知）新 worktree/分支应从哪个分支切出。不要默认假定为 `main` 或"当前所在分支"——通常应为当前活跃的 `release/vX.Y.Z`，但也可能是其他功能/发布分支。必须明确获得基础分支。

2. **从该基础分支创建隔离的 worktree 和分支**（绝不复用主检出目录）。
   **🔴 强制路径：所有 worktree 都必须位于 `.claude/worktrees/` 之下，且只能位于此处。**
   这是唯一的标准位置。该目录已被 git 忽略，并且包含在 `tsconfig.json` / `.dockerignore` 的排除项中，因此 worktree 不会泄漏到构建范围内。**切勿**使用 `.worktrees/`、仓库根目录或其他任何路径——位于 `.claude/worktrees/` 之外的 worktree（a）会绕过构建范围排除项，并导致 `next build` 失败（`tsconfig` 的 `include: **/*` 通配符覆盖的文件约为代码库的 70 倍 → 内存溢出；事故 2026-06-25），以及（b）使 worktree 分散在两个目录中。

   ```bash
   BASE_BRANCH="release/vX.Y.Z"          # ← the branch the operator confirmed in step 1
   TASK="feat/your-feature"               # feat/ fix/ refactor/ docs/ test/ chore/
   git fetch origin "$BASE_BRANCH"
   git worktree add ".claude/worktrees/${TASK##*/}" -b "$TASK" "origin/$BASE_BRANCH"
   cd ".claude/worktrees/${TASK##*/}"
   # Reuse the main checkout's node_modules to skip a per-worktree npm install.
   # HARD LINKS (`cp -al`), never a symlink: ~5s for the whole tree and near-zero extra
   # disk (the inodes are shared), and unlike a symlink it does not break the dev server.
   cp -al "$(git -C <main_checkout> rev-parse --show-toplevel)/node_modules" node_modules
   # `.husky/_` is gitignored, so a fresh worktree does NOT have it and
   # `core.hooksPath=.husky/_` then points at a directory that does not exist —
   # every pre-commit gate goes silently mute. Copy it too.
   cp -a "$(git -C <main_checkout> rev-parse --show-toplevel)/.husky/_" .husky/_
   ```

   `scripts/dev/new-worktree.sh <branch> [base]` 会完成上述所有步骤（标准路径、硬链接的 `node_modules`、`.husky/_`），然后**验证**钩子确实可执行。因此优先使用它，而不是手动执行这些步骤。

   **绝不要用 `ln -s` 链接 node_modules。** Turbopack 会拒绝解析到项目根目录之外的符号链接，因此 `npm run dev` 会以 FATAL panic 退出（`Symlink [project]/node_modules
is invalid, it points out of the filesystem root`），而类型检查、lint 和测试运行器却都仍然通过。错误信息提到的是 "filesystem root" 而不是 worktree，因此看起来像是 Next/构建的 bug，排查起来非常耗时（事故 2026-07-31，#9043）。

   **没有 `.husky/_` 的 worktree 不会运行任何 pre-commit 门禁，而且不会给出任何提示。** `git` 会相对于 worktree 顶层解析 `core.hooksPath`；目录缺失时，它只是找不到钩子并直接提交。不会输出任何内容，提交会成功，而身份、lint 和文档门禁都从未运行。正是这样，携带过期身份覆盖（某位贡献者的姓名加上维护者的电子邮件）的 59 个提交，在 2026-08-29 至 09-02 期间绕过了 `scripts/check/check-git-identity.sh`——它们全部都是在 `cp -al` 的 worktree 中完成的。可在新 worktree 中运行 `ls .husky/_/pre-commit` 进行验证，或直接使用 `scripts/dev/new-worktree.sh`，后者在钩子不可执行时会明确报错。

3. **工作、提交、推送、开 PR，全部在 worktree 内完成。** 绝不要在其他会话可能共享的 worktree 中执行 `git checkout` 切换到其他分支。

4. **任务完成后，仅拆除你自己的** worktree 和分支，在主检出目录中执行：`git worktree remove .claude/worktrees/<dir>`，然后执行 `git branch -D <task>`。绝不要批量删除 `fix/*`/`feat/*`——其他会话各自保留着它们的分支；只按名称删除你自己创建的分支。

5. **绝不触碰其他会话的 worktree、分支或未提交的改动。** 如果 `git worktree
list` 显示了你没有创建的 worktree，请保持原样。每个会话结束时，都要让主检出目录回到其开始时所在的分支（当前活跃的 `release/vX.Y.Z`，绝不是 `main`）。

## 基线绿色检查（PR 不得生来即红）

在切出分支、将基础分支合并进 PR 分支、批量重新指定 PR 目标，或开启 PR 之前，请检查基础分支的顶端提交是否为绿色。`Release-Green (continuous)` 工作流（`.github/workflows/nightly-release-green.yml`）会将结论发布到一个去重后的 issue 中，该 issue 标题为 `🔴 Release branch not green: <branch>`（标签 `base-red`）。为此目的，一次调用即可替代任何本地测试套件运行：

```bash
gh issue list --repo diegosouzapw/OmniRoute --state open \
  --search "Release branch not green: <base> in:title"
```

如果基础分支为红：绝不要把继承来的失败当作你分支的缺陷；绝不要在功能分支中"修复"它们（基线变红的修复本身是一个受冻结门禁控制的 `fix/release-vX.Y.Z-basereds` PR）；若仍必须开启 PR，请在 PR 正文中加入 `⚠️ base-red inherited: #<issue>`，使评审者和 CI 值守人员不会去追查假问题。

## 回同步落地必须快进，绝不压缩合并

`main → release/vX+1` 的回同步（`/generate-release` 的第 5 阶段，或任何之后的"把 main 的发布后提交带过来"PR）必须以它本来就是的合并提交的形式落到发布分支上：先执行 `git merge-base --is-ancestor origin/release/vX+1 <head>`，然后执行 `git push origin <head>:refs/heads/release/vX+1`（GitHub 会将该 PR 标记为已合并）。压缩合并会使 `main` 从发布分支的祖先链中消失，下一次回同步会在 main 改动过的每个文件上再次冲突（在采用两步合并之前，v3.8.50 → v3.8.51 的同步曾产生 551 处冲突）。落地之后，`git merge-base --is-ancestor origin/main origin/release/vX+1` 必须为真——并检查 `config/quality/eslint-suppressions.json` / `quality-baseline.json` 是否带上了 main 的冻结项（它们会静默地以 "ours" 方式合并）。详情见：`.agents/skills/generate-release/phases/phase-5-next-cycle.md`。
