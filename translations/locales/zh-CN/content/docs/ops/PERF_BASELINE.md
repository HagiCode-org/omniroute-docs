---
title: "性能基线（LTS 轨道）"
---

# 性能基线（LTS 轨道）

`npm run perf:lts-baseline`（`scripts/perf/lts-baseline.mjs`）记录当前代码树的一次可复现性能快照：堆行为、路由热路径开销、发布构建耗时以及 HTTP 首字节时间（TTFB）。它是为 3.9.0 LTS 轨道（当时为 3.8.56）加入的，使 LTS 切版有一个可供对比的基线，而不是凭印象判断。

它并不取代现有的探针，而是按固定顺序运行它们、将它们彼此隔离，并输出一份 JSON 文档（可选输出 Markdown 表格），两次运行的结果可以据此做对比。

## 唯一原则：只比较同一主机上的运行结果

报告中的每个数字都取决于机器本身，以及该机器当时正在做什么。与数十个工作树和其他会话共用的开发机相比，空闲的主机上耗时可能要低 2–3 倍，而且这种膨胀在每次运行之间并不稳定。

- 只与 `host` 块（`cpuCount`、`totalMemMB`、`nodeVersion`）一致，且 `loadAvg` 相近的报告进行比较。
- 当 1 分钟负载超过 CPU 数量的 25% 时，Markdown 输出会打印 `host busy` 警告。带有该警告的报告属于**初步结果**，不得用作回归阈值。
- 报告刻意省略了主机名。请在发布这些数字的 PR 或说明中记录所用的机器。

## 运行方法

```bash
# Shared dev box — build is never run here (default), TTFB only if dist/ already exists
npm run perf:lts-baseline -- --runs 20 --out baseline.json --md > baseline.md

# Idle dedicated host — measures the release build and then TTFB on the fresh bundle
npm run perf:lts-baseline -- --with-build --runs 50 --out baseline.json --md > baseline.md

# Against a server that is already running (boot time is not measured)
npm run perf:lts-baseline -- --url http://127.0.0.1:20128 --runs 50 --out baseline.json
```

| 参数                     | 含义                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `--skip-build`           | 默认值。不运行 `npm run build:release`。在共享开发机上必须使用。                                                       |
| `--with-build`           | 先运行 `build:release` 并记录其实际耗时。仅在空闲主机上使用。与 `--skip-build` 互斥。                                   |
| `--runs <n>`             | 每个 TTFB 端点的计时请求次数，在丢弃 3 次预热请求之后执行（默认 20）。                                                  |
| `--url <base>`           | 对已经运行中的服务器进行基准测试，而不是启动新实例。                                                                  |
| `--out <path>`           | 将 JSON 报告写入该路径。                                                                                              |
| `--md`                   | 将 Markdown 表格输出到标准输出。进度日志始终写入标准错误。                                                            |
| `--data-dir <path>`      | 每次测量所用的隔离 `DATA_DIR` 的父目录（默认：新建的临时目录，结束时删除）。                                          |
| `--heap-timeout-min <n>` | `test:heap` 运行超过 n 分钟则中止，并将其标记为 `skipped`（默认 15）。                                                |

失败或被跳过的测量同样是数据，而不是崩溃：脚本始终会写出报告并以 0 退出。只有参数错误才会以非零值（2）退出。脚本在不经过 shell 的情况下启动 `npm`，因此只面向 Linux 和 macOS。

### 隔离保证

- 每个子进程都在 `--data-dir` 下拥有自己的 `DATA_DIR`。继承而来的 `DATA_DIR`（因此也包括 `~/.omniroute`）从不使用，因此本次运行不会打开或迁移运维人员的数据库。
- 子进程会获得伪造的 `JWT_SECRET` / `API_KEY_SECRET` / `INITIAL_PASSWORD`、`DISABLE_SQLITE_AUTO_BACKUP=true`、`REQUIRE_API_KEY=false`，且不继承 `OMNIROUTE_API_KEY`。
- 命令以参数数组的形式启动（不经过 shell 插值），并各自运行在独立的进程组中。超时的命令和已启动的服务器始终会被终止，出错时也是如此。

## 各项数字的含义

JSON 结构为 `{ generatedAt, host, gitSha, options, measurements }`。每项测量的结构为 `{ status: "ok" | "skipped" | "failed", durationMs, summary, raw? }`。

| 测量项          | 来源                                                  | 说明                                                                                                                                                                                                                                  |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buildSeconds`  | `npm run build:release`                               | 完整发布构建（Next standalone + CLI 打包）的实际耗时。仅在使用 `--with-build` 时生成。                                                                                                                                                 |
| `heapGrowth`    | `npm run test:heap`                                   | `raw.growthMB`：经过 `createSSEStream` 处理 500 个 SSE 流之后，V8 堆的增长量（在 GC 之后测量）。若存在内存泄漏，增长量会随流的数量成比例增加。测试本身在 20 MB 时失败。                                                              |
| `heapBody`      | `npm run bench:heap-body -- --json`                   | `raw.perRequestMiB`：针对 #7847 事件中的请求体形态，每个请求保留的堆内存（传输中的大小为 `raw.wireMiB`）；`raw.amplification` 为保留量 ÷ 传输大小。                                                                                 |
| `routingEvents` | `npm run bench:routing-events`                        | `raw.scenarios[].usPerOp`：每次路由决策的耗时（微秒），分别为不启用与启用路由事件 sink 两种情况。相对开销比绝对数值更值得关注。                                                                                                        |
| `serverBoot`    | 基于 `dist/` 运行 `omniroute serve`                   | 从启动进程到 `/api/health/ping` 返回第一个 `200` 的时间（冷启动）。使用 `--url` 或没有构建产物时为 `skipped`。                                                                                                                         |
| `ttft`          | `/api/health`、`/v1/models`、`/api/monitoring/health` | 按端点统计，从发出请求到收到响应头的时间（首字节时间），在 keep-alive 连接上顺序发送请求：`raw.medianMs`、`raw.p95Ms`（最近秩法）、`raw.minMs`、`raw.maxMs`。非 2xx 响应会将该端点标记为 `failed`。                                        |

`ttft` 需要服务器。若未提供 `--url` 且 `dist/server.js` 不存在，则每个 `ttft` 条目都会被标记为 `skipped`，原因是 `omniroute serve` 无法启动未构建的代码树。若构建产物存在，脚本会在一个临时端口上以 `NODE_ENV=production` 启动它。

## 在空闲主机上的操作流程（VPS 或 .113 runner 机器）

用于 LTS 切版的基线必须来自空闲的专用主机。关于 .113 资源池及其调度限制，请参阅 [`RUNNER_BOX.md`](RUNNER_BOX.md)。

1. 确认该机器上没有 CI 任务或其他构建正在运行（`uptime` 的负载应远低于 CPU 数量；无论如何报告都会记录 `loadAvg`）。
2. 检出要测量的确切提交，并使用 lockfile 安装依赖：`npm ci`。
3. 带构建运行：

   ```bash
   npm run perf:lts-baseline -- --with-build --runs 50 \
     --data-dir /var/tmp/omniroute-perf --out perf-<version>.json --md > perf-<version>.md
   ```

4. 不带 `--with-build` 再运行一次（此时构建产物已存在），并检查两次运行的 TTFB 中位数是否在几个百分点之内一致。若不一致，则说明主机并不空闲。
5. 连同主机名和日期一并发布这两个文件。之后的比较使用同一台机器和相同的 `--runs`。

## 相关文档

- [`QUALITY_GATES.md`](../architecture/QUALITY_GATES.md)：`nightly-resilience` 工作流会按计划运行堆增长门禁。
- `bin/cold-start-bench.sh`：针对单次启动的预算检查（监听 ≤ 800 ms，热启动 TTFB ≤ 200 ms），与本文记录的基线不同。
