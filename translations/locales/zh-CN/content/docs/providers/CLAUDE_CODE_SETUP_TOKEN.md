---
title: "使用 `claude setup-token` 令牌的 Claude Code"
---

# 使用 `claude setup-token` 令牌的 Claude Code

`claude setup-token` 会为 Claude Pro/Max 订阅打印一个长期有效的 OAuth 令牌（`sk-ant-oat01-…`）。该令牌有效期为一年，无需浏览器会话，因此它是将无头或容器化的 OmniRoute 连接到 **Claude Code** 提供者（`cc/`）的最简单方式。

## 连接令牌

1. 在任何已安装并登录 Claude Code 的机器上运行 `claude setup-token`，并复制它打印出的令牌。
2. 进入仪表盘 → Providers → **Claude Code** → **Add Connection**。对话框会打开 **Setup Token** 标签页；除非你切换到 **Browser Login**，否则不会向 claude.ai 发送任何内容。
3. 粘贴令牌并保存。该连接会被命名为“Setup token”；如果添加了多个连接，请将其重命名以便区分。

![在 Setup Token 标签页中连接 Claude Code 的对话框](../screenshots/claude-setup-token-1-dialog.png)

在保存之前，OmniRoute 会用该令牌向 Anthropic 发送一个 `max_tokens: 1` 的请求。不以 `sk-ant-oat` 开头、或被 Anthropic 拒绝的令牌会被以 400 拒绝，并且不会创建连接。

同样的导入也可以通过 API 完成（需要管理认证）：

```bash
curl -X POST http://localhost:20128/api/oauth/claude/import-token \
  -H "Content-Type: application/json" \
  -b "auth_token=<dashboard session cookie>" \
  -d '{"token":"sk-ant-oat01-..."}'
```

传入 `"connectionId": "<id>"` 可以替换现有 Claude Code 连接的令牌，例如在一年有效期届满时。粘贴已存储的令牌会更新对应的连接，而不会再添加一个新连接。

## 与 Browser Login 的区别

|                       | Browser Login               | Setup token                      |
| --------------------- | --------------------------- | -------------------------------- |
| 有效期                | 短期访问令牌，自动刷新       | 一年，无刷新令牌                  |
| 连接中的账号邮箱      | 是                          | 否（令牌无法读取个人资料）         |
| Chat / Messages / 流式传输 | 是                     | 是                               |
| 配额进度条（5 小时 / 每周） | 是                      | 否                               |

该令牌仅包含 `user:inference` 权限范围。Anthropic 对个人资料、bootstrap 与用量端点返回 `403
oauth_scope_insufficient`，因此该连接没有邮箱，配额视图会显示一条提示信息，而不是 5 小时与每周进度条。请求本身不受影响。

健康检查不会因为 setup-token 连接没有刷新令牌而将其标记为已过期（#14261）。由于没有可刷新的内容，当令牌被吊销或达到一年有效期时，该连接上的请求会以 Anthropic 返回的 401 失败。请重新运行 `claude setup-token`，并将新令牌粘贴到同一连接中（Reconnect → **Setup Token**）。
