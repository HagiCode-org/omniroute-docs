---
title: "本地 Ollama + Docker 部署 OmniRoute"
version: 3.8.51
lastUpdated: 2026-09-29
---

# 本地 Ollama + Docker 部署 OmniRoute

本指南介绍如何在 Docker 中运行 **OmniRoute**，同时让 **Ollama 原生运行在宿主机上**。这是与 VS Code OmniCopilot 及其他 OpenAI 兼容客户端配合使用的部署方式。

## 架构

```
VS Code / OmniCopilot
        ↓  :20128
OmniRoute (Docker)
        ↓  host.docker.internal:11434
Ollama (native, GPU)
        ↓
your model (e.g. qwen35b-highctx:latest)
```

## 快速开始

1. 在宿主机上安装并启动 Ollama（`ollama serve`；如果远程客户端需要访问，请将其绑定到 `0.0.0.0:11434`）。

2. 使用本地 Ollama 的 Compose 覆盖文件启动 OmniRoute：

   ```bash
   docker compose -f docker-compose.ollama-local.yml up -d
   ```

3. 在 OmniRoute 仪表盘中添加一个 **OpenAI 兼容** 提供者：
   - **Base URL:** `http://host.docker.internal:11434/v1`
   - **Prefix:** `ollama`（可选，用于 `ollama/model-name` 路由）

4. 将客户端指向 OmniRoute：
   - **VS Code OmniCopilot:** `omnicopilot.baseUrl` → `http://<host-ip>:20128`
   - **模型：** `ollama/<model-name>`

## 验证 Docker 到 Ollama 的连通性

```bash
docker exec omniroute getent hosts host.docker.internal
# → 172.17.0.1  host.docker.internal

docker exec omniroute node -e \
  "fetch('http://host.docker.internal:11434/api/tags').then(r=>r.json()).then(j=>console.log(j.models.length,'models')).catch(console.error)"
```

## 故障排查：`Direct response did not start within 30000ms`

### 根本原因

这个 504 错误来自 **OmniRoute**，而不是 OmniCopilot。直连（不使用代理）的 fetch 路径使用 `open-sse/utils/directResponseStartTimeout.ts` 中的 `resolveDirectHeadersTimeoutMs()`。未设置 `OMNIROUTE_DIRECT_HEADERS_TIMEOUT_MS` 时，每次尝试的默认时间预算为 **30 秒**。OmniRoute 会在新的套接字上重试一次，因此失败通常会在总计约 **60 秒**时出现。

大型本地模型（22B+ MoE）以及 VS Code Copilot 智能体请求（系统提示词和工具较大）可能会超过 30 秒的**首字节时间**（time-to-first-byte），尤其是在冷启动时。

使用小型提示词的简单 `curl` 测试可能会成功，而 Copilot 仍然失败。

### 修复方法（v3.8.51 及以上）

对于本地或自托管目标（`host.docker.internal`、`192.168.x.x`、`localhost` 等），OmniRoute 现在会自动将直连响应开始的下限提高到 **300 秒**。

对于较旧的镜像，或需要显式控制时，请在 `docker-compose.ollama-local.yml` 中设置：

```yaml
environment:
  - OMNIROUTE_DIRECT_HEADERS_TIMEOUT_MS=300000
  - OMNIROUTE_LOCAL_DIRECT_HEADERS_TIMEOUT_MS=300000
  - STREAM_IDLE_TIMEOUT_MS=600000
  - RATE_LIMIT_EXECUTION_MAX_WAIT_MS=300000
  - RATE_LIMIT_MAX_WAIT_MS=300000
  - OMNIROUTE_DIRECT_DISPATCHER_CONNECTIONS=32
```

### 次要错误：速率限制执行超时（120 秒）

负载较重的智能体会话也可能在并发请求排队等待一个较长的 SSE 流时触发 `RATE_LIMIT_EXECUTION_TIMEOUT`。请按上文所示增大 `RATE_LIMIT_EXECUTION_MAX_WAIT_MS` 和 `RATE_LIMIT_MAX_WAIT_MS`。

## 相关链接

- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) — 完整的 Docker Compose 配置档（profiles）
- [OmniCopilot](https://github.com/diegosouzapw/OmniCopilot) — VS Code 扩展（没有请求超时设置；错误来自 OmniRoute）
