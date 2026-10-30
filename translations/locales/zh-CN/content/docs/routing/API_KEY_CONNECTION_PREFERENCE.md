---
title: "API 密钥连接偏好"
description: "按 API 密钥配置的有序提供者账户偏好，并支持自动回退"
---

# API 密钥连接偏好

OmniRoute 可以将不同项目路由到不同的**主账户**，同时保留自动账户回退。

每个 API 密钥都可以定义 `preferredConnections`，即一个由提供者连接 ID 组成的有序列表。系统会选择当前第一个符合条件的连接。如果该连接因配额耗尽、冷却、终态账户状态、模型限制、请求中的显式排除或其他健康检查门控而不可用，OmniRoute 会尝试列表中的下一个首选连接。主账户重新符合条件后，新的请求会再次优先使用它。

`preferredConnections` 与 `allowedConnections` 刻意分开：

- `allowedConnections` 是访问控制白名单。
- `preferredConnections` 仅决定路由顺序，从不授予访问权限。
- 偏好列表为空时，保留现有的全局连接策略与优先级行为。
- 强制连接路由以及已生效的独占租约始终优先生效。

## 示例

两个项目可以共享同样的两个 AntiGravity 账户，但选择相反的主账户：

```json
// Project A API key
{
  "allowedConnections": ["ACCOUNT_A", "ACCOUNT_B"],
  "preferredConnections": ["ACCOUNT_A", "ACCOUNT_B"]
}

// Project B API key
{
  "allowedConnections": ["ACCOUNT_A", "ACCOUNT_B"],
  "preferredConnections": ["ACCOUNT_B", "ACCOUNT_A"]
}
```

这种方式适用于配额隔离、工作负载归属、订阅或账户负载均衡，以及避免某个项目耗尽另一个项目的首选账户；同时，当该账户暂时不可用时，OmniRoute 的弹性机制依然生效。

## 配置

通过 API 密钥管理端点创建或更新 API 密钥，并将 `preferredConnections` 作为由连接 UUID 组成的有序数组一并传入。若同一请求中同时提供了 `allowedConnections`，则首选 ID 必须是其子集。

在仪表盘中，打开 **API Manager → (key) → Access → Connections**：_Preferred connections_ 列表仅显示该密钥可以使用的连接；点击某个连接可将其追加到顺序末尾，使用箭头调整顺序，点击 **Clear** 则恢复为默认路由策略。取消勾选某个允许的连接，也会将其从偏好顺序中移除。
