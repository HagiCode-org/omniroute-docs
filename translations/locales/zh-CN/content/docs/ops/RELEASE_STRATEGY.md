---
title: "发布策略：LTS 轨道、渠道与标签"
lastUpdated: 2026-10-09
---

# 发布策略：LTS 轨道、渠道与标签

> **状态：休眠。** 本页描述的所有内容都属于从 **v3.9.0 LTS** 开始的分支与渠道模型。在此之前，日常模型保持不变：PR 仍然指向当前活跃的 `release/vX.Y.Z` 分支，参见 [BRANCHING_MODEL.md](./BRANCHING_MODEL.md)。下方的标签和 PR 模板现在就已存在，以便切换时只需修改配置，而不必仓促调整。逐版本的计划见 [ROADMAP](../../ROADMAP.md)。

## 版本轨道

```
3.8.50 ─ 3.8.54   PREPARE   non-breaking structural prep (all PRs welcome)
3.8.55 ─ 3.8.59   VALIDATE  fixes / docs / i18n / providers only; features get `v4-feature`
3.9.0             LTS       creates stable/v3 · develop · main (v4)
4.0.0-nightly/rc  v4        modular platform, built on develop, candidates on main
4.0.0             GA        npm `latest` switches to v4 · v3 stays supported as LTS
```

不存在 3.8.60：3.8.59 之后的下一个版本是 3.9.0。

## 分支（自 3.9.0 起）

| 分支        | 线路            | 合入内容                                                                                   | 发布到                           |
| ----------- | --------------- | ------------------------------------------------------------------------------------------ | -------------------------------- |
| `stable/v3` | v3 LTS（3.9.x） | 缺陷修复、安全补丁、提供者更新、文档、i18n。不接受新功能。                                 | 在 4.0 GA 之前为 `latest`        |
| `develop`   | v4 开发         | 新功能（包括被搁置的 `v4-feature` PR）、模块化重构、向前移植的修复                         | `nightly`                        |
| `main`      | v4 发布线       | v4 候选版本，之后是 4.0 GA                                                                 | `next`（rc），GA 时切换为 `latest` |

在 3.9.0 发布之前，这三个分支都不具备新的含义：`main` 仍是已发布的 v3 线，`release/vX.Y.Z` 仍是集成分支。

## 我的 PR 应该提交到哪里？

| 你要提交的内容 | 直到 3.8.54          | 3.8.55 → 3.8.59                 | 3.9.0 之后  |
| -------------- | -------------------- | ------------------------------- | ----------- |
| 缺陷修复 / 安全 | 活跃的 `release/v3.8.x` | 同上                            | `stable/v3` |
| 提供者更新     | 活跃的 `release/v3.8.x` | 同上                            | `stable/v3` |
| 文档 / i18n    | 活跃的 `release/v3.8.x` | 同上                            | `stable/v3` |
| 新功能         | 活跃的 `release/v3.8.x` | 使用 `v4-feature` 标签搁置      | `develop`   |

“活跃”的发布分支是编号最高的、处于开放状态的 `release/v*` 分支。若某个[发布冻结](./BRANCHING_MODEL.md#release-freeze-parallel-cycles)处于开启状态，则以冻结 issue 中公告的分支为准。

## npm dist-tag

| Dist-tag  | 含义                                                       | 安装                            |
| --------- | ---------------------------------------------------------- | ------------------------------- |
| `latest`  | v3（3.8.x，之后为 3.9.x LTS）——**在 4.0 GA 之前**，之后为 v4 | `npm install omniroute`         |
| `next`    | v4 候选版本（`4.0.0-rc.N`）                                | `npm install omniroute@next`    |
| `nightly` | 从 `develop` 构建的 v4 版本（`4.0.0-nightly.*`）           | `npm install omniroute@nightly` |

在整个 v4 周期内，`npm install omniroute` 都会继续安装 v3。只有 4.0 GA 才会移动 `latest`。

目前已接好的部分（位于 `.github/workflows/npm-publish.yml`）：`tag` 输入接受 `auto`、`latest`、`next` 和 `historic`。使用 `auto` 时，带有 `-rc`、`-alpha`、`-beta`、`-pre` 或 `-next` 标识的版本进入 `next`；稳定版本仅当它是最高的稳定 `v*` 标签时才进入 `latest`，否则进入 `historic`（这样旧线就不会抢走 `latest`）。

尚未接入的部分（计划在首个 v4 版本发布之前完成，并在 3.8.58 中演练）：

- 一个 `nightly` dist-tag。目前 `auto` 的预发布列表中没有 `-nightly`，因此在工作流支持之前，`4.0.0-nightly.*` 构建不得经由 `auto` 发布。
- 一个专用的 dist-tag，用于在 4.0 GA **之后**发布的 3.9.x 补丁（届时它们已不再是最高的稳定标签，因此 `auto` 会将其解析为 `historic`）。

## 带署名的向前移植

修复首先合入最老的受支持线路，再逐级向前移植：

1. 修复合入 `stable/v3`。
2. 通过标记为 `forward-port` 的向前移植 PR，将其 cherry-pick 到 `develop`。
3. 向前移植会为原始变更的每位人类作者保留原作者署名，使用标准的 `Co-authored-by: Name <email>` 尾注。必须为人类贡献者署名；禁止为 AI 助手或机器人署名（`AGENTS.md`，硬性规则 #16）。
4. 如果代码在 v4 重构中已经移动，且 cherry-pick 无法应用，则手工改写该向前移植，署名尾注仍然要加上。

自 3.9.0 起，向前移植计划实现自动化；3.8.58 的试运行会对其进行演练。在此之前无需向前移植，因为只有一条线路。

## 验证窗口（3.8.55 → 3.8.59）

这五个版本用于稳定将成为 LTS 线路的代码。修复、文档、i18n 和提供者更新继续合入；新功能则等待。

| 版本   | 重点                                                                          |
| ------ | ----------------------------------------------------------------------------- |
| 3.8.55 | 为每个待抽取的候选补充特征测试 · 重新测量耦合度                               |
| 3.8.56 | 扩展金丝雀发布 · 性能基线（堆、TTFB、构建）                                   |
| 3.8.57 | 安全与合规排查 · 发布来源证明（OIDC）演练                                     |
| 3.8.58 | 3.9.0 切版的完整试运行：分支、渠道、向前移植、PR 预览构建产物                 |
| 3.8.59 | 最终冻结 · 全套件审计 · 3.9.0 的 GO/NO-GO 决策                                |

## `v4-feature` 规则

**自 3.8.55 起**，凡新增功能（而非修复缺陷、更新提供者或修改文档 / i18n）的第三方 PR：

1. 获得 `v4-feature` 标签。**不会关闭**，贡献会被保留。
2. 保持开启，且不合入 v3 发布分支。
3. 待 v4 渠道在 3.9.0 开放时，重新指向 `develop`，然后在那里审查并合并，并完整保留作者署名。

维护者使用以下命令添加并调整该标签：

```bash
gh pr edit <N> --add-label v4-feature
# when develop exists:
gh pr edit <N> --base develop
gh pr view <N> --json baseRefName   # verify: `gh pr edit --base` can fail silently
```

不确定你的改动是修复还是功能？照常提交，并在 PR 正文中说明；由维护者决定标签。

## 标签

轨道标签声明在 `.github/labels.yml` 中，并由 `scripts/release/sync-labels.mjs` 同步到 GitHub：

| 标签               | 用途                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| `v4-feature`       | 为 v4 渠道（`develop`）搁置的功能 PR                                       |
| `lts`              | 属于 v3 LTS 线路（`stable/v3`）的变更                                     |
| `forward-port`     | 从 `stable/v3` 向前移植到 `develop` 的修复，并保留署名                     |
| `channel:latest`   | 随 npm `latest` dist-tag 发布                                             |
| `channel:next`     | 随 npm `next` dist-tag 发布                                               |
| `channel:nightly`  | 随 npm `nightly` dist-tag 发布                                            |
| `preview-artifact` | 请求生成 PR 预览构建产物（在 3.8.58 演练之前处于休眠）                    |

```bash
npm run labels:sync              # dry-run: print what would change
npm run labels:sync -- --apply   # create missing labels, update divergent ones
```

同步从不删除标签，也从不改动不在 `labels.yml` 中的标签。诸如 `queue`、`release-freeze` 和 `base-red` 之类的运维标签保持其既有含义，并刻意未列入该文件。

## PR 模板

默认模板为 `.github/pull_request_template.md`。两个专用模板位于 `.github/PULL_REQUEST_TEMPLATE/` 中，通过对比 URL 上的查询参数进行选择：

- 功能：`…/compare/<base>...<branch>?template=feature.md`
- 缺陷修复：`…/compare/<base>...<branch>?template=bugfix.md`，需要一个由失败转为通过的测试，或已记录的 VPS 验证（`AGENTS.md`，硬性规则 #18）。

## 相关文档

- [BRANCHING_MODEL.md](./BRANCHING_MODEL.md) — 当前的并行周期模型
- [CONTRIBUTION_GOLDEN_PATH.md](./CONTRIBUTION_GOLDEN_PATH.md) — 按变更类型划分的针对性检查
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) — 发布前验证
- [MERGE_TRAIN.md](./MERGE_TRAIN.md) — 合并队列与备用列车
- [ROADMAP](../../ROADMAP.md) — 3.8.50 → 4.0 的计划
