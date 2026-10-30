---
title: "命名批量代理导入"
description: "导入直连代理并为其指定明确的名称，同时保留现有格式。"
---

# 命名批量代理导入

在仪表盘的代理注册表中，打开现有的批量导入对话框，每行粘贴一个代理，查看解析后的预览，然后导入。你可以在以主机开头的行末尾提供名称：

```text
socks5://gateway.example.invalid:12000:session-1:example-password:UK 1
socks5://gateway.example.invalid:12001:session-2:example-password:UK 2
https://gateway.example.invalid:12002:session-3:example-password:UK 3
```

最后一个字段是代理名称；它可以包含空格或非 ASCII 字符。以上均为合成示例，并非可用的凭据。支持的直连协议为 `http`、`https` 与 `socks5`。IPv6 字面量需使用方括号，例如用 `[2001:db8::1]` 代替主机。

这是一种自定义的冒号分隔导入格式，并非标准的代理 URI。字段中不得包含冒号；当用户名、密码或名称包含冒号时，请改用现有的管道符分隔格式：

```text
UK 1|gateway.example.invalid|12000|example-user|example:password|socks5
```

名称为空、端口无效或存在有歧义的多余字段时，会在预览中被拒绝。端口必须为 1 到 65535 之间的整数。错误条目报告的是行号与原因，不会显示提交的凭据。现有的无名称简写、协议头、用户信息与管道符分隔格式仍然受支持。名称不会改变注册表中能识别凭据的代理身份或路由分配。此次新增功能不会安装隧道核心，也不会启用新的全局代理范围。
