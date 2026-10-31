---
title: "推理认证策略"
---

# 推理认证策略

## 概述

`GET /v1/models` 与推理 endpoint 受**不同的设置**控制。运维人员最自然的探测方式（用来回答“我的 API 是否受到保护？”）因此可能给出错误的结论。

| Endpoint                                                                             | 控制来源                                                                                                                                           |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/models`                                                                   | dashboard 登录策略（`isAuthRequired()`），可按实例通过 `requireAuthForModels` 覆盖（`src/app/api/v1/models/catalogRequest.ts`）                        |
| `POST /v1/chat/completions`、`POST /v1/responses`，以及其他客户端 API 路由         | `REQUIRE_API_KEY`（`src/server/authz/policies/clientApi.ts`）                                                                                      |

在设置了管理员密码且 `REQUIRE_API_KEY=false` 的实例上，`/v1/models` 返回 `401`，而任何能访问该端口的人都可以调用推理接口。

> **探测注意事项：** `/v1/models` 返回的 `401` **不能**证明推理接口受到保护，它只说明 dashboard 要求登录。

这并非假设。在讨论 #13310 中，一个部署在 Traefik 后面的 self-hosted 实例，其 Codex 配额被匿名的 `POST /v1/responses` 流量耗尽，而此时 `/v1/models` 仍返回 `401`。用报告者的话说，这“最初让人误以为整个 API 都受到了保护”，并把他们引向了错误的排查方向。

## 实际检查方法

应当探测推理路由，而不是模型目录：

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST http://<host>:<api-port>/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"<any-model>","messages":[{"role":"user","content":"ping"}]}'
```

返回 `401` 表示 `REQUIRE_API_KEY` 已生效。任何能进入路由处理的响应（包括“模型未找到”错误）都说明匿名流量会被接受。

请注意，当 `REQUIRE_API_KEY=false` 时，**无效**的 Bearer 令牌不会被拒绝，而是降级为匿名访问（#2257）。因此，发送一个随意的假密钥同样不是有效的探测方法。

## 启动警告

当 `REQUIRE_API_KEY` 被禁用且服务绑定到非 loopback 地址时，OmniRoute 会在启动时输出警告（`src/lib/startup/nonLoopbackApiKeyGuard.ts`）。该警告覆盖以下三个入口：

- 提供 `/v1` 推理服务的 dashboard/API 服务器，即 `HOST`，默认值为 `0.0.0.0`
- API 桥接器，即 `API_HOST`，默认值为 `127.0.0.1`
- 实时 dashboard WebSocket，使用其自身的主机配置

该警告不会阻止启动：OmniRoute 前面的 reverse proxy 可能已经在执行自身的认证。

## 相关内容

- [ENVIRONMENT.md](../reference/ENVIRONMENT.md) 中的 `REQUIRE_API_KEY`
- `APP_BIND_HOST` 与 compose 的 loopback 默认值（#12568）
- #2257 — 当 `REQUIRE_API_KEY` 关闭时，无效的 Bearer 令牌会降级为匿名访问
- #13695 — 本文档
