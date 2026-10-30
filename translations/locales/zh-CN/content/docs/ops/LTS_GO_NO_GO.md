---
title: "3.9.0 LTS GO/NO-GO 检查清单"
lastUpdated: 2026-10-10
---

# 3.9.0 LTS GO/NO-GO 检查清单

这是所有者在 **3.8.59** 结束时（ROADMAP 第 2 阶段）的决策关口：将成为 v3 LTS 线路（`stable/v3`，在整个 v4 周期内对应 npm `latest`）的代码，是否已准备好作为 **3.9.0** 切出？切版本身的说明见 [RELEASE_CHECKLIST.md → 3.9.0 LTS 切版](./RELEASE_CHECKLIST.md#390-lts-cut-rehearsed-in-3858)，分支与渠道模型见 [RELEASE_STRATEGY.md](./RELEASE_STRATEGY.md)，路线图见 [ROADMAP](../../ROADMAP.md)（第 3 阶段）。

使用方法：

- 所有命令都应针对 **3.8.59 发布头部**（或 3.9.0 发布 PR）运行，而不是功能分支。“通过”指命令以 0 退出，且没有新增白名单条目，也没有任何基线上移。
- 将证据（CI 运行 URL、命令输出摘录或提交 SHA）粘贴到 **证据** 列。留空即为 NO-GO。
- NO-GO 不代表轨道失败：修复后重新运行该行，再做一次决策。

## 轨道门禁

仅包含 3.8.x 轨道的门禁。G3–G10 属于 v4 阶段（模块化平台），不属于 LTS 决策的一部分。

| 门禁 | 必须满足的条件                                                                                                                                                                                                                                                                                                         | 如何证明                                                                                                                                                                                                                                                       | 证据 |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| G0   | 指向 `release/**` 的 PR（`quality.yml` 通道）与指向 `main` 的 PR 运行相同的棘轮与安全门禁                                                                                                                                                                                                                              | 3.9.0 发布 PR 上 `Gate / Quality` 为绿色：`gh pr checks <release-PR>`；本地运行 `npm run quality:ratchet`                                                                                                                                                     |          |
| G1   | `check:known-symbols` 能感知注册表（对已注册的策略/执行器不会出现正则漏报）                                                                                                                                                                                                                                             | `npm run check:known-symbols`                                                                                                                                                                                                                                  |          |
| G2   | 每个超大文件（god-file）拆分后的文件大小与质量指标都不高于基线（未经所有者明确批准，不得自行增长）                                                                                                                                                                                                                       | 在头部运行 `npm run check:file-size` 与 `npm run quality:ratchet`；周期内对 `config/quality/quality-baseline.json` 的每次改动（`git log -p origin/main..HEAD -- config/quality/quality-baseline.json`）都必须降低某个数值，或链接到所有者的批准                 |          |
| G11  | Mergify 队列 `release` 处于活跃状态：存在 `queue_rules`，定义了 `checks_timeout`，存在标签 `queue`；不使用 `--admin merge`（GitHub 原生合并队列已在 v3.8.49 中被否决——个人账户仓库不支持分支通配符，参见 `.mergify.yml` 文件头；批处理受 Mergify 套餐层级限制）                                                          | `npm run release:dry-run-lts-cut -- --from <tip>` 显示 `✓ merge-queue`（读取头部的 `.mergify.yml` 与 `queue` 标签）和 `✓ release-ruleset`（`release/*` 规则集保留 `deletion` 与 `non_fast_forward`）；周期内没有 `--admin` 合并                                   |          |
| G12  | `Gate / CI` 与 `Gate / Quality` 是必需的状态汇总，其所需的任一任务失败时即失败                                                                                                                                                                                                                                          | `gh pr checks <release-PR>` 显示两个汇总均为绿色；在临时 PR 上故意让某个任务变红，其汇总随之变红                                                                                                                                                                 |          |
| G13  | 在 `combo.ts` / `chatCore.ts` 拆分之前用于固定行为的黄金集仍然通过                                                                                                                                                                                                                                                     | `node --import tsx/esm --test tests/unit/g13-combo-chatcore-golden.test.ts tests/unit/executor-map-golden.test.ts tests/unit/provider-translate-path-golden.test.ts`                                                                                           |          |
| G14  | `no-restricted-imports` 边界保持有效（`src/lib/db/` 之外不得出现 `localDb.ts` 的聚合（barrel）导入，`src/app/**` 中不得出现 `open-sse/executors/**`）                                                                                                                                                                  | `npm run lint` 与 `node --import tsx/esm --test tests/unit/eslint-import-boundaries.test.ts`                                                                                                                                                                  |          |

## 收尾检查套件

同一套检查套件用于收尾每个轨道版本；对于 LTS，它在最终头部上运行。单元测试与 Vitest 套件须**连续运行两次**，在查明原因之前，出现的偶发失败一律视为 NO-GO。

| #   | 项目                                                  | 如何证明                                                                                                                                                                                                                         | 证据 |
| --- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | 代码检查与类型检查                                    | `npm run lint && npm run typecheck:core && npm run typecheck:noimplicit:core`                                                                                                                                                    |          |
| 2   | 单元测试与 Vitest（互不重叠的运行器，两者均需通过）   | `npm run test:unit && npm run test:vitest`（运行两次）                                                                                                                                                                           |          |
| 3   | 覆盖率不低于基线（下限 60/60/60/60）                  | `npm run test:coverage && npm run quality:ratchet`                                                                                                                                                                               |          |
| 4   | 循环依赖、文件大小、复杂度、死代码                    | `npm run check:cycles:ratchet && npm run check:file-size && npm run check:complexity && npm run check:cognitive-complexity && npm run check:dead-code`                                                                           |          |
| 5   | 已知符号、提供者一致性、生成器输出干净                | `npm run check:known-symbols && npm run check:provider-consistency && npm run gen:provider-reference && git diff --exit-code docs/reference/PROVIDER_REFERENCE.md`                                                               |          |
| 6   | E2E 提供者流程与 Playwright                           | `npm run test:integration`（包含 `tests/integration/provider-journey.contract.test.ts`）和 `npm run test:e2e`                                                                                                                    |          |
| 7   | 待发布构件的构建与冒烟测试                            | `gh workflow run preview-artifact.yml -f pr_number=<release-PR>`（构建一次，`check:pack-artifact` + `check:pack-boot`，并附带证明），或在本地运行 `npm run build:release && npm run check:pack-artifact && npm run check:pack-boot` |          |
| 8   | VPS 金丝雀与线上冒烟测试（硬性规则 #18）              | 将附带证明的 tarball 部署到 VPS（192.168.0.15），然后执行 `curl -fsS http://192.168.0.15:<port>/api/monitoring/health`，并对每个关键路由各发起一次线上请求（`/v1/chat/completions`、`/v1/messages`、`/v1/models`）                    |          |
| 9   | CHANGELOG 已整合，周期 issue 已分诊                   | `npm run check:changelog-integrity && npm run check:docs-sync`；周期内引用的每个 issue 都已关闭或已重新指向                                                                                                                       |          |
| 10  | 特征测试仍然通过                                      | `node --import tsx/esm --test "tests/unit/**/*.characterization.test.ts"`                                                                                                                                                        |          |

## 切版就绪度

| 项目                                  | 如何证明                                                                                                                                                                                                                                                                        | 证据 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 发布分支为绿色                        | 发布分支存在（`git ls-remote --heads origin <release-branch>` 的输出不为空），**并且** `gh issue list --repo diegosouzapw/OmniRoute --state open --search "Release branch not green: <release-branch> in:title"` 的结果为空——分支不存在而产生的 issue 不能作为证据 |          |
| 3.8.58 演练已完成并已回滚             | fork 上的演练日志，包括 `node scripts/release/dry-run-lts-cut.mjs --execute ...` 与 `--execute --rollback` 的日志（参见检查清单）                                                                                                                                              |          |
| 真实切版的试运行结果为 READY          | `npm run release:dry-run-lts-cut -- --from <3.9.0-tip>` 以 0 退出，并输出 `RESULT: READY`                                                                                                                                                                                      |          |

---

GO / NO-GO：______（所有者，日期）
