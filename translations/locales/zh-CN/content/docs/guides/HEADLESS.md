---
title: "无头模式 — 仅运行代理引擎"
version: 3.8.52
lastUpdated: 2026-10-09
---

# 无头模式

无头模式会将 OmniRoute 作为纯粹的 LLM 代理启动：`/v1/*` 下的 OpenAI 兼容 API 继续工作，但仪表盘会被关闭，并且在启动时不会启动那些仅为仪表盘提供数据、或仅在代理之上增加可选功能的可选子系统。

适用于无人打开仪表盘、并希望进程更轻量、更安静的服务器、容器和 CI 机器。不会卸载或删除任何内容：取消设置该变量并重启，即可恢复完整服务器。

## 开启方式

可以设置环境变量：

```bash
OMNIROUTE_HEADLESS=1 omniroute serve
```

或传入 CLI 标志，它会为你在服务器进程上设置 `OMNIROUTE_HEADLESS=1`：

```bash
omniroute serve --headless
omniroute serve --headless --port 20128 --daemon
```

接受的真值为 `1`、`true`、`yes` 和 `on`（不区分大小写）。任何其他值或未设置该变量，都会保持完整服务器。该标志实现于 `bin/cli/commands/serve.mjs`；模式的唯一事实来源是 `src/lib/system/headless.ts`。

使用 `--headless` 时，CLI 不会打开浏览器，启动横幅会打印 `Dashboard: disabled (headless)`。`--headless` 不能与 `--tray` 组合使用（托盘菜单的作用就是打开仪表盘）。

## 保持开启的部分

| 范围                                                                        | 无头模式 |
| --------------------------------------------------------------------------- | -------- |
| `/v1/*`（聊天补全、responses、模型、嵌入等）                                | 开启     |
| `/api/monitoring/health`                                                    | 开启     |
| `/api/auth/*` 以及 API 密钥 / `REQUIRE_API_KEY` 检查                        | 开启     |
| 其他所有 `/api/*` 路由（供 `omniroute` CLI 使用的管理 API）                 | 开启     |
| 启动时的代理核心：数据库、密钥、配额获取器、设置初始化                      | 开启     |
| 后台代理工作：配额刷新、令牌自动刷新、冷却恢复                              | 开启     |
| API 桥接端口、清理/VACUUM 调度器、备份计划                                  | 开启     |
| 内存：已配置的内存后端 + 带类型记忆的衰减清理                               | 开启     |

认证方式不变：如果完整服务器上的 `/v1/*` 需要 API 密钥，那么无头模式下同样需要。

## 关闭的部分

**仪表盘页面。** `/dashboard`、`/dashboard/*`、`/home` 和 `/home/*` 会返回 `404`，JSON 响应体为 `{"error":"dashboard disabled (headless)"}`。该拦截在授权流程之前由 `src/proxy.ts` 执行，因此不影响其他路由。

**可选的启动子系统。** `src/instrumentation-node.ts` 中的 `registerNodejs()` 会跳过：

| 子系统名称                  | 在完整服务器上的作用                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `free-proxy-sync`           | 按间隔重新获取免费代理源列表                                                         |
| `cloud-sync`                | Cloud / 模型同步的后台引导                                                           |
| `embedded-services`         | 自动启动标记为自动启动的嵌入式服务                                                   |
| `embed-ws-proxy`            | 嵌入式服务界面的 WebSocket 代理                                                      |
| `conductor-bridge`          | 将 OmniConductor hub 任务镜像到 A2A（可选启用，`CONDUCTOR_HUB_URL`）                 |
| `arena-elo-sync`            | 为免费提供者排行页面同步 Arena ELO 排行榜                                            |
| `radar-sync`                | Radar 每日信息流同步（可选启用）                                                     |
| `pricing-sync`              | 外部定价数据同步（可选启用，`PRICING_SYNC_ENABLED`）                                 |
| `openrouter-provider-stats` | 为仪表盘提供的提供者目录 / 热度数据增强                                              |
| `models-dev-sync`           | models.dev 能力同步（在设置中可选启用）                                              |
| `live-dashboard-ws`         | 实时仪表盘 WebSocket 守护进程（端口 20132）                                          |

每个跳过项都会在启动时记录一次，例如：

```
[STARTUP] Headless mode: skipping free-proxy-sync
[STARTUP] Headless mode: skipping cloud-sync
[STARTUP] Headless mode: skipping optional subsystems: embedded-services, embed-ws-proxy, …
```

## 使用 curl 检查

```bash
# Health — 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:20128/api/monitoring/health

# Models — 200 (add -H "Authorization: Bearer $OMNIROUTE_KEY" when REQUIRE_API_KEY is on)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:20128/v1/models

# Dashboard — 404 with the headless error body
curl -s -w "\n%{http_code}\n" http://localhost:20128/dashboard
# {"error":"dashboard disabled (headless)"}
# 404
```

## 限制

- **需在启动前设置。** 服务器进程从自身环境中读取 `OMNIROUTE_HEADLESS`；切换模式意味着以该变量设置或取消设置后重启服务器。
- **管理 API 仍可访问。** 无头模式仅关闭仪表盘页面。`/api/*` 管理路由保留其正常的授权层级，因此 `omniroute` CLI（以及远程模式）仍可正常工作。它不是安全边界——在适当的场合，请继续使用 `REQUIRE_API_KEY` 和回环地址绑定（`OMNIROUTE_SERVER_HOST`）。
- **随路由加载的功能仍按需加载。** MCP、A2A、评估、游戏化、Webhook 和云端智能体没有启动时初始化；无论哪种模式，它们都会在其路由被调用时惰性启动。
- **内存保持开启。** 内存属于横切能力，与请求流水线紧密相关（`/v1` 会注入并查询它），因此已配置的内存后端和带类型记忆的衰减清理与完整服务器一样，在无头模式下启动时运行。
- **代码仍会随包分发。** 此模式改变的是运行的内容，而不是安装的内容——包大小和构建产物完全相同。

## 另请参阅

- [ENVIRONMENT.md](../reference/ENVIRONMENT.md) — `OMNIROUTE_HEADLESS` 和 `OMNIROUTE_DISABLE_BACKGROUND_SERVICES`（一个单独的开关，会停止后台调度器，但保留仪表盘）。
- [REMOTE-MODE.md](REMOTE-MODE.md) — 使用 `omniroute` CLI，从笔记本电脑驱动远程（例如无头）OmniRoute。
