---
title: "LTS 安全基线"
---

# LTS 安全基线（v3.9.x 准备阶段）

> **测量于：** 2026-10-10，在 `release/v3.8.52` @ `cc84e9426a` 上测得（rail 发布 3.8.57，安全与合规）。
> **读者对象：** 准备 3.9.0 LTS 发版的维护者，以及审计 LTS 线交付内容的人员。
> **规则：** 下文每个数字都附有测得它的命令。引用前请重新测量，扫描器状态每天都在变化。

LTS 支持窗口本身的说明见 [`SECURITY.md`](../../SECURITY.md) → “LTS 支持窗口（v3.9.x）”一节。

## 1. 自动化证明（每个 PR 都会运行）

| 硬性规则                                           | 证明                                                                                                            | 断言内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #15 / #17 —— 可派生进程的路由仅限回环地址访问       | `npm run check:route-guard-membership`（CI 门禁）+ `tests/unit/route-guard-local-only-sweep.test.ts`            | `/api/mcp/`、`/api/cli-tools/runtime/`、`/api/services/` 以及仪表盘嵌入代理（`/dashboard/providers/services/<name>/embed/**`）下的每个 `route.ts`，对每种写方法都满足 `isLocalOnlyPath()`；这些根路径下唯一的读取豁免是 `/api/mcp/audit` 和 `/api/mcp/audit/stats`；每个路由都被归类为 `MANAGEMENT`（即执行回环地址门禁策略的那一类）；管理范围的例外仅保留在 `/api/mcp/`；`src/app/api` 下任何直接派生进程的文件都必须属于 LOCAL_ONLY 路由。 |
| #11 —— 公开上游凭据不得以字面量出现                | `npm run check:public-creds`（CI 门禁，基于键名）+ `tests/unit/public-creds-no-literals.test.ts`（基于值）      | 在 `src/lib/oauth/`、`open-sse/` 或 `src/shared/constants/` 中，除 `resolvePublicCred()` 调用之外，不得出现 Google OAuth 客户端 ID、`GOCSPX-` 密钥、`AIza` 密钥、GitHub OAuth 应用 ID 或非空的 `client_secret` 字面量；`open-sse/utils/publicCreds.ts` 将其内嵌默认值保留为掩码字节数组。                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

这两项测试是对门禁的补充而非重复：二者都经过了变异验证（在路由旁放入一个带 `fork()` 的辅助模块，以及在 `src/shared/constants/` 中放入一个裸 `const` 客户端 ID），使测试变红而对应门禁保持绿色。

## 2. 依赖审计

| 范围                      | 命令                          | critical | high | moderate | low |
| ------------------------- | ----------------------------- | -------: | ---: | -------: | --: |
| 生产环境（`--omit=dev`） | `npm audit --omit=dev --json` |        0 |    3 |        0 |   0 |
| 完整依赖树（包含开发依赖） | `npm audit --json`            |        0 |   22 |        1 |   0 |

生产环境的三个高危漏洞来自同一条公告 `GHSA-vfj7-8cjw-p6xm`（braces，通过深度嵌套模式导致的栈耗尽拒绝服务），经由 `http-proxy-middleware` → `micromatch` → `braces` 引入。`npm audit` 建议对 `http-proxy-middleware` 做语义化版本的主版本降级，但这并不是修复。对应的 Dependabot 告警已以 `tolerable_risk` 为由被忽略。

## 3. GitHub 安全告警

| 来源                   | 命令                                                                                 | 未解决 | 已修复 | 已忽略                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------ | -----: | -----: | ------------------------------------------------------------------------ |
| 代码扫描（CodeQL）     | `gh api "repos/diegosouzapw/OmniRoute/code-scanning/alerts?state=open" --paginate`   |      0 |     67 | 241（误报 120 · 不修复 72 · 仅用于测试 49）                              |
| Dependabot             | `gh api "repos/diegosouzapw/OmniRoute/dependabot/alerts?state=open" --paginate`      |      0 |    286 | 5（均为 `tolerable_risk`：braces、sprintf-js、node-forge、extract-zip ×2） |
| 密钥扫描               | `gh api "repos/diegosouzapw/OmniRoute/secret-scanning/alerts?state=open" --paginate` |      0 |      — | —                                                                        |

制作本基线的过程中没有关闭或忽略任何告警（硬性规则 #14）。

## 4. 安全工作流

以下状态来自 2026-10-10 执行的 `gh run list --workflow <file> --limit 3 --json conclusion,createdAt` 命令。

| 工作流                     | 触发条件                                  | 最新状态                                                                                                                                                                                                                                                                  | 是否阻塞                 |
| -------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `codeql.yml`               | 仅 `workflow_dispatch`                    | 最近一次运行于 2026-09-02 失败：在 GitHub **默认设置**开启时，高级 CodeQL 配置无法上传结果。代码扫描改由默认设置提供数据（已配置；`actions`、`c-cpp`、`javascript-typescript`、`python`；每周及 PR；最新提交的分析于 2026-10-10 完成）。             | 不适用                   |
| `semgrep.yml`              | 针对 `main` / `release/**` 的 PR，以及推送到 `main` | 发布分支最新提交的 PR（`cc84e9426a`）上运行成功：205 条发现（203 条 warning，2 条 error）。其中 193 条为 `github-actions-mutable-action-tag`；2 条 error 均为 `docker/devin-bridge/run-contract.mjs` 中的 `react-insecure-request`。SARIF 作为构件保存，未上传至代码扫描。 | 否（仅作提示）           |
| `scorecard.yml`            | 推送、每周，以及分支保护变更              | 运行成功（2026-10-10）。OpenSSF 评分 **6.5**；得分为零或偏低的检查项：Token-Permissions 0、Signed-Releases 0、CII-Best-Practices 0、Vulnerabilities 1、Pinned-Dependencies 2、Branch-Protection 3。                                                                  | 否                       |
| `dast-smoke.yml`           | 针对 `main` 的 PR，以及 `workflow_dispatch` | 发布 PR 上运行成功（2026-10-10 06:41 UTC）；其前一次运行已被取消。                                                                                                                                                                                                        | 否（`continue-on-error`） |
| `nightly-llm-security.yml` | 每晚定时，以及 `workflow_dispatch`        | **2026-10-03 至 2026-10-09 期间每次定时运行都失败。** 在 2026-10-09 的运行中，两个作业都在任何探测开始之前失败（promptfoo 停在“Build CLI bundle”，garak 停在“Start OmniRoute”），因此两者都没有产生结论。                                                          | 否                       |

Scorecard 评分来自 `https://api.securityscorecards.dev/projects/github.com/diegosouzapw/OmniRoute`。

## 5. npm 发布来源证明（provenance）

| 检查项                                                          | 结果                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 主包发布路径（`.github/workflows/npm-publish.yml`） | 构建，并在构建运行器上运行 `check:pack-artifact`（BUILD_SHA 来源保护，#10427）与 `check:pack-boot`；上传由独立的 `stage-npm` 作业在 `ubuntu-latest` 上完成（npm 会拒绝来自自托管运行器的 `--provenance`），该作业具有 `id-token: write` 权限，固定 npm 版本 `11.15.0`，并执行 `npm publish "$TARBALL" --provenance --access public --tag "$TAG" --ignore-scripts`。                                                                                                                                                                                                                                                               |
| 默认模式                                                        | `publish_mode=auto` 即可信发布（Trusted Publishing，OIDC）：该步骤不导出任何 npm 认证令牌。`staged` 与 `direct` 仍是基于令牌的回退方案。                                                                                                                                                                                                                                                                                                                                                                                                 |
| npm 注册表证据（`npm view omniroute@<v> --json`）                | 3.8.49、3.8.50 和 3.8.51 由 `GitHub Actions`（OIDC 可信发布者）发布，并带有 SLSA v1 来源证明。                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| LTS 演练前的缺口                                                | （1）`workflow_call` 仍将 npm 令牌密钥声明为必需，尽管默认路径并不使用它。（2）`publish-opencode-plugin` / `publish-opencode-plugin-v2` 使用长期有效的 npm 令牌加 `--provenance` 发布，而非可信发布；在该令牌可以退役之前，每个都需要各自的 npm 可信发布者条目。（3）npmjs.com 上的可信发布者绑定（仓库 + 工作流文件）只能由包的所有者确认。（4）GitHub Release 资产未签名（Scorecard Signed-Releases 为 0）。                                                                                                                                                                                                                           |
| 本地打包试运行                                                  | 未构建时执行 `npm pack --dry-run --json --ignore-scripts`：4,165 个条目，打包后 9.4 MB / 解包后 35.9 MB。`check:pack-artifact` 需要已构建的 `dist/`，本基线未运行该检查。                                                                                                                                                                                                                                                                                                                                                                  |

针对真实注册表的发布演练需由维护者执行；制作本基线期间未发布任何内容。

## 6. 如何刷新本基线

```bash
npm audit --omit=dev --json
gh api "repos/diegosouzapw/OmniRoute/code-scanning/alerts?state=open" --paginate
gh api "repos/diegosouzapw/OmniRoute/dependabot/alerts?state=open" --paginate
for w in codeql.yml semgrep.yml scorecard.yml dast-smoke.yml nightly-llm-security.yml; do
  gh run list --workflow "$w" --limit 3 --json conclusion,createdAt
done
node --import tsx/esm --import ./tests/_setup/isolateDataDir.ts --test \
  tests/unit/route-guard-local-only-sweep.test.ts tests/unit/public-creds-no-literals.test.ts
npm run check:route-guard-membership && npm run check:public-creds
```
