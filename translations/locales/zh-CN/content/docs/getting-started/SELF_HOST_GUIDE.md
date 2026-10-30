---
title: "🚀 自托管指南 — OmniRoute（零月费自托管 / zero-fee self-host）"
version: 3.8.52
lastUpdated: 2026-10-05
---

# 🚀 自托管指南 — OmniRoute

> **TL;DR** — 三条命令、一个本地端点、零月费。没有 SaaS 计费、没有多租户隔离，
> 也没有托管的提示词处理环节。你的提示词会直接发送到你所选的提供者。

> **版本说明：** 此流程适用于 **v3.8.51** 及以上版本。它使用的两个文件（`docker-compose.selfhost.yml` 和 `.env.selfhost.example`）不在 v3.8.50 或更早的任何标签中。在 v3.8.50 上，请改用 Docker 指南中的单容器 [`docker run` 流程](../guides/DOCKER_GUIDE.md#quick-run)。

```bash
mkdir omniroute && cd omniroute
BASE=https://raw.githubusercontent.com/diegosouzapw/OmniRoute/v3.8.51
curl -fsSLO "$BASE/docker-compose.selfhost.yml"
curl -fsSLO "$BASE/.env.selfhost.example"
cp .env.selfhost.example .env      # then edit the 2 lines marked "EDIT ME"
docker compose -f docker-compose.selfhost.yml up -d
open http://127.0.0.1:20128
```

这是 OmniRoute「零月费 + 自托管」产品形态的**自托管载体**：一个打包好的容器或二进制文件，可以在你自己的机器上 5 分钟内运行。

---

## 为什么需要本指南

OmniRoute 自带一个功能完备的 `docker-compose.yml`，它提供了多个配置档（profile）：`base`、`web`、`cli`、`host`、`cliproxyapi`、`memory`、`bifrost`。每个应用服务都受配置档控制，因此执行 `docker compose up -d` 时只会启动 Redis。对于懂得选择配置档的高级用户来说，这是正确的行为，但它*并不是*一个 5 分钟即可完成的自托管方案。

`docker-compose.selfhost.yml` 是一个 KISS 风格的覆盖文件：**一条命令、使用已发布的镜像、仅绑定回环地址、包含 Redis、无需选择配置档、无需构建步骤。** 当需求超出它的能力范围时，请改用完整的 [DOCKER_GUIDE](../guides/DOCKER_GUIDE.md) 配置档。

| 受众 | 从这里开始 | 升级到 |
| --- | --- | --- |
| 自托管者，单用户 | 本指南 | — |
| 高级用户，CLI 工具 / 网页 Cookie 提供者 / sidecar | — | `docker-compose.yml` 配置档 |

---

## 前置条件

- 带有 Compose v2 插件的 Docker Engine 24+（或 Docker Desktop 4.30+）。
- 约 2 GB 可用内存（参见 [容器资源配置](#容器资源配置)）。
- 来自任一受支持提供者的 API 密钥（OpenAI、Anthropic、Google，或 [150+ 个免费层](./FREE-TIERS-GUIDE.md) 中的任一提供者）。

无需构建工具链、无需 Node、无需 git clone：你只需下载两个文件（Compose 文件和环境变量模板，见步骤 1），镜像随后自动拉取。

---

## 步骤 1 — 配置（1 分钟）

将两个自托管文件下载到一个空目录中，并固定到发布标签，然后从模板创建 `.env`：

```bash
mkdir omniroute && cd omniroute
BASE=https://raw.githubusercontent.com/diegosouzapw/OmniRoute/v3.8.51
curl -fsSLO "$BASE/docker-compose.selfhost.yml"
curl -fsSLO "$BASE/.env.selfhost.example"
cp .env.selfhost.example .env
```

（如果你是在 v3.8.51 或更高版本的 git 克隆中操作，两个文件都位于仓库根目录，直接运行 `cp` 即可。）

Compose 文件读取的是**与 `docker-compose.selfhost.yml` 同目录的 `./.env`**（`env_file: .env`）。它**不会**读取 `~/.omniroute/.env`：该文件属于 npm CLI 安装（`omniroute` 命令，参见 [本地二进制构建](#本地二进制构建可选)），对 Docker 流程没有任何作用。

在 `.env` 中恰好修改**两行**：

```dotenv
REQUIRE_API_KEY=true          # was false — lock the endpoint down
APP_BIND_HOST=127.0.0.1       # keep loopback; see "Exposing" only if needed
```

`REQUIRE_API_KEY=true` 会使 `/v1` 请求需要 API 密钥（已登录的仪表盘会话同样可用），并且只要存在登录密码，仪表盘也需要登录。首次访问时，你需要在仪表盘的引导向导中创建登录密码；如果跳过这一步，即使设置了 `REQUIRE_API_KEY=true`，仪表盘登录也会被关闭。Docker 的端口转发会让容器认为你的浏览器并非本机访问，因此提交密码后，向导会要求输入一次性的引导令牌（bootstrap token），该令牌会在此时由容器打印到日志中：

```bash
docker logs omniroute | grep BOOTSTRAP
```

其他变量（`DASHBOARD_PORT`、`API_PORT`、`LIVE_WS_PORT`、`OMNIROUTE_MEMORY_MB`）已有合理的默认值。除非你确实需要修改，否则请保持不变。

---

## 步骤 2 — 启动（1 分钟）

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

会拉取 `diegosouzapw/omniroute:latest`（多架构 AMD64 + ARM64，约 250 MB）和 `redis:8.6.5-alpine`，启动这两个容器，并在应用启动前等待 Redis 通过健康检查。

### 步骤 3 — 验证（30 秒）

```bash
# process lifecycle + readiness
curl -fsS http://127.0.0.1:20128/healthz && echo

# container health
docker inspect --format '{{.State.Health.Status}}' omniroute
```

你应该会看到 `{"status":"ok"}` 和 `healthy`。然后打开仪表盘：

```
http://127.0.0.1:20128
```

执行 `up -d` 后约 300 秒内，端点即可在本地访问，健康检查状态也会变为 `healthy`，这正是自托管 issue 中的验收标准。

---

## 端口

| 端口 | 用途 | 默认绑定 |
| --- | --- | --- |
| `20128` | 仪表盘 + `/v1` LLM 代理（统一入口） | `127.0.0.1` |
| `20129` | API 端口（服务器间通信） | `127.0.0.1` |
| `20132` | 实时 WebSocket（仪表盘实时更新） | `127.0.0.1` |

这三个端口默认都**仅绑定回环地址**。Redis **完全不会**发布到宿主机上，应用通过 Compose 网络访问它。这是有意为之：在 `0.0.0.0` 上提供未经身份验证的 Redis 是一个典型的安全隐患。

---

## 连接提供者

1. 打开仪表盘 → **Providers**（提供者）。
2. 添加一个提供者并粘贴其 API 密钥。密钥使用 AES-256-GCM 加密存储，明文永远不会离开你的机器。
3. 将你的 IDE 或智能体指向统一入口：

```
http://127.0.0.1:20128/v1
```

关于提供者的选择，请参阅 [免费层指南](./FREE-TIERS-GUIDE.md)。OmniRoute 将 150+ 个免费层聚合到一个端点中，因此你可以运行 `model: "auto"`，为每个请求选择最佳的免费选项。

---

## 容器资源配置

镜像默认固定为 `OMNIROUTE_MEMORY_MB=1024`，这对仪表盘和轻量聊天来说足够了。**编码智能体**（来自 Claude Code、Codex、Grok 等的 `POST /v1/responses` 请求）在压缩时会保留多个大型上下文图；当两个长上下文同时重叠时，可能在约 12 GiB 的老生代（old-space）处使 V8 中止（[#7849](https://github.com/diegosouzapw/OmniRoute/issues/7849)）。

`.env.selfhost.example` 默认设置为 `OMNIROUTE_MEMORY_MB=2048`，这是单用户运行编码智能体时的安全下限。如果你要并行调用多个模型（融合组合），或遇到 `FATAL ERROR: Reached heap limit`，请提高该值：

```dotenv
OMNIROUTE_MEMORY_MB=4096
```

内存受 V8 堆上限约束；原生缓冲区（SQLite、ONNX、better-sqlite3）位于堆之外，因此容器的内存应比堆大小多出几百 MB。

---

## 本地二进制构建（可选）

如果你更倾向于二进制文件而不是 Docker，npm 包的代码完全相同：

```bash
npm install -g omniroute
omniroute
```

这会直接在宿主机上运行 Next.js 独立（standalone）服务器，端口与容器方式相同。它的数据和 `.env` 默认保存在 `~/.omniroute` 中（当 `~/.omniroute` 不存在时：Windows 上为 `%APPDATA%\omniroute`，设置了 XDG 配置目录变量时则为 `$XDG_CONFIG_HOME/omniroute`；`$DATA_DIR` 可覆盖以上所有位置），而不是 Docker 流程挂载的 `./data` 目录。当你无法运行 Docker 时（例如受限较多的虚拟机），可以使用它。上文的容器方式是推荐的默认方案，因为它内置了镜像测试时所用的确切运行时。

从源码构建（仅用于开发，不是部署路径）：

```bash
git clone https://github.com/diegosouzapw/OmniRoute.git
cd OmniRoute
npm install
npm run build && npm start
```

---

## 暴露到本机之外

**切勿**在 `REQUIRE_API_KEY=false` 的情况下设置 `APP_BIND_HOST=0.0.0.0`。这会在每个局域网或广域网接口上发布一个开放的 `/v1` 代理，网络上的任何人都可以耗尽你的提供者配额。顺序是固定的：

1. 在 `.env` 中设置 `REQUIRE_API_KEY=true`。
2. 在引导向导中创建登录密码（参见上文），然后登录。
3. *只有在此之后*，才设置 `APP_BIND_HOST=0.0.0.0`（或者在前面放置一个强制身份验证的反向代理，并保持回环地址）。

如需启用 TLS 或使用域名，请在前面运行 Caddy 或 Traefik，并将 `APP_BIND_HOST` 保持为 `127.0.0.1`。可参阅 [DOCKER_GUIDE 中的 Caddy HTTPS](../guides/DOCKER_GUIDE.md#docker-compose-with-caddy-https-auto-tls) 和 [DOCKER_GUIDE 中的 Cloudflare Quick Tunnel](../guides/DOCKER_GUIDE.md#cloudflare-quick-tunnel) 两节，其中有可直接复制粘贴的反向代理配置。

---

## 数据、备份与重置

- **数据目录**：`./data`（绑定挂载到 `/app/data`）。所有 SQLite 数据库、迁移文件、审计记录和加密存储的提供者密钥都保存在这里。
- **备份**：SQLite 自动备份默认开启（未设置 `DISABLE_SQLITE_AUTO_BACKUP` 即为启用）。如需手动创建快照：
  ```bash
  ./bin/snapshot-data.sh
  ```
  使用 `./bin/restore-data.sh` 进行恢复。
- **重置仪表盘密码**：
  ```bash
  docker exec -it omniroute node bin/reset-password.mjs
  ```
- **重置策略**（将路由、故障转移和配额恢复为出厂默认值）：
  ```bash
  docker exec -it omniroute node bin/restore-policies.sh
  ```

---

## 常见问题

<details>
<summary><code>cp: cannot stat '.env.selfhost.example': No such file or directory</code></summary>

当前目录中没有自托管文件。请先下载它们（参见 [步骤 1](#步骤-1--配置1-分钟)）；这些文件从 v3.8.51 开始提供，因此带标签固定的 URL 在 v3.8.50 或更早版本中并不存在。在 v3.8.50 上，请使用 [`docker run` 流程](../guides/DOCKER_GUIDE.md#quick-run)。
</details>

<details>
<summary>编辑了 <code>~/.omniroute/.env</code> 但没有任何变化</summary>

该文件只会被 npm CLI 安装读取。Docker 流程读取的是与 `docker-compose.selfhost.yml` 同目录的 `.env`。请编辑那个文件，然后重新执行 `docker compose -f docker-compose.selfhost.yml up -d`。
</details>

<details>
<summary><code>docker compose up</code> 只会启动 Redis</summary>

你运行的是**完整的** `docker-compose.yml`，其中的应用服务受配置档控制。若要使用一条命令的方式，请使用自托管文件：

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

或者，使用完整的 Compose 时选择一个配置档：`docker compose --profile base up -d`。
</details>

<details>
<summary>健康检查一直停留在 <code>starting</code> / <code>unhealthy</code></summary>

- 检查 Redis 是否已启动：`docker inspect --format '{{.State.Health.Status}}' omniroute-redis`
- 检查应用日志：`docker logs omniroute`
- 健康检查会探测 `/healthz`，并允许 20 秒的启动期。首次启动较慢（冷启动迁移）可能需要更长时间；如果磁盘较慢，请在 Compose 文件中调大 `start_period`。

</details>

<details>
<summary>编码智能体运行时出现 <code>FATAL ERROR: Reached heap limit</code></summary>

请在 `.env` 中提高 `OMNIROUTE_MEMORY_MB`（例如 `4096`），然后执行 `docker compose -f docker-compose.selfhost.yml up -d`。参见 [容器资源配置](#容器资源配置)。
</details>

<details>
<summary><code>EACCES: permission denied</code> 写入 <code>/app/data</code> 时报错</summary>

`docker-compose.selfhost.yml` 默认以 `./data:/app/data` 方式绑定挂载，因此容器会继承宿主机目录的属主。部分托管部署平台以 root 身份运行 Docker 守护进程，而容器进程以非特权用户运行，这可能导致首次写入时出现 `EACCES`。

在不改变文档默认配置的前提下，有两种修复方式：

- **对宿主机目录执行 `chown`**，使其属于容器用户，让绑定挂载可写。镜像以 `node` 用户（UID/GID 1000）运行：`sudo chown -R 1000:1000 ./data`。
- **改用 Docker 管理的命名卷**，而不是绑定挂载：在 `docker-compose.selfhost.yml` 中注释掉 `- ./data:/app/data` 这一行，取消其正下方备选项 `- omniroute-data:/app/data` 的注释，并取消顶层 `volumes:` 下 `omniroute-data:` 条目的注释。注意这会改变数据的存放位置：
  - 新的命名卷初始为**空**。如果是已有安装，请先把 `./data` 复制进去，否则 OmniRoute 会以全新实例启动；
  - `bin/snapshot-data.sh` 和 `bin/restore-data.sh` 直接读写宿主机上的 `./data`，因此除非你另行备份，否则它们看不到命名卷中的内容，例如：

    ```bash
    docker run --rm -v omniroute-data:/data -v "$PWD":/backup alpine \
      tar czf /backup/omniroute-data.tar.gz -C /data .
    ```

</details>

<details>
<summary>网页 Cookie 提供者（Gemini Web、Claude Turnstile）报错 <code>Executable doesn't exist at .../ms-playwright/chromium</code></summary>

`base` 镜像不包含 Chromium，自托管 Compose 使用的是已发布的 `base` 镜像。对于网页 Cookie 提供者，请切换到完整的 Compose 并使用 `web` 配置档（其中内置了 Playwright/Chromium）：

```bash
docker compose --profile web up -d
```

参见 [DOCKER_GUIDE 中的可用配置档](../guides/DOCKER_GUIDE.md#available-profiles)。
</details>

<details>
<summary>端口 20128 已被占用</summary>

请在 `.env` 中修改 `DASHBOARD_PORT`、`API_PORT` 和 `LIVE_WS_PORT`，改用其他空闲端口，然后重新执行 `up -d`。
</details>

---

## 本指南刻意不包含的内容

根据自托管的 KISS 约束，此路径**不包括**以下内容：

- ❌ SaaS 计费 / 计量 / 套餐档位
- ❌ 多租户隔离 / 每租户命名空间
- ❌ 托管的提示词处理环节（你的提示词直接发送给提供者）
- ❌ 任何内置的凭据或机密信息

它是一个**纯本地自托管**载体，以最简单的方式让「零月费 + 自托管」的承诺真正落地。

---

## 安全检查清单（自托管）

在暴露到回环地址之外之前：

- [ ] 在 `.env` 中设置 `REQUIRE_API_KEY=true`
- [ ] 在引导向导中为仪表盘登录设置一个强且唯一的密码
- [ ] `APP_BIND_HOST` 保持为 `127.0.0.1`，*除非*位于强制身份验证的反向代理之后
- [ ] 由前端的 Caddy/Traefik/Cloudflare 终止 TLS（切勿在广域网上使用明文 HTTP）
- [ ] Redis 未发布到宿主机（自托管 Compose 已强制执行此项）
- [ ] 定期备份 `./data` 卷（`bin/snapshot-data.sh`）
- [ ] 按各提供者自身的政策轮换提供者密钥

如需完整的供应链、镜像与依赖审计相关内容，请参阅 [SECURITY.md](../../SECURITY.md) 和 [供应链文档](../security/SUPPLY_CHAIN.md)。

---

## 相关链接

- [Docker 指南](../guides/DOCKER_GUIDE.md) — 配置档、Caddy HTTPS、隧道、镜像标签
- [快速开始](./QUICK-START.md) — 面向首次使用者的 3 分钟路径
- [免费层指南](./FREE-TIERS-GUIDE.md) — 150+ 个提供者免费层
- [提供者指南](./PROVIDERS-GUIDE.md) — 连接和配置提供者
- [故障排查](../guides/TROUBLESHOOTING.md) — 更深入的问题排查
