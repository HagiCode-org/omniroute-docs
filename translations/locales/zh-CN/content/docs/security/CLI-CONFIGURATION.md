---
title: "CLI 配置的预览与写入"
---

# CLI 配置的预览与写入

经过身份验证的 `/api/cli-tools/config` 与 `/api/cli-tools/apply` 路由返回不可缓存、已脱敏的预览。它们保留既有的身份验证与授权检查。请求体会拒绝未知字段。显式指定的 base URL 必须使用 HTTP(S)，且不得内嵌用户名和密码凭据；省略时使用服务器配置的 base URL。

批量预览时，`GET /api/cli-tools/config` 接受可选的 `baseUrl` 查询参数，并从 `x-omniroute-config-api-key` 请求头中读取配置凭据。查询字符串中的凭据会被拒绝。`POST /api/cli-tools/config` 的 JSON 请求体接受 `toolId`、`baseUrl`、`apiKey` 以及可选的 `model`。无论成功还是出错，响应都使用 `Cache-Control: no-store`。预览文本不是可以直接使用的、带凭据的配置。

预览投影会对序列化后的调用方凭据，以及合并后的 JSONC、TOML 或 YAML 配置档中已存在的凭据字段进行脱敏。应用路由写入的是原始配置；预览脱敏不会改变磁盘上的值。格式错误的 JSON 会以 400 拒绝。对外的错误响应使用标准的、经过净化的错误响应封装。

应用配置时，会先在目标目录中创建一个私有临时文件，将其刷写到磁盘，再原子地重命名到目标位置。文件与备份均使用 `0600` 权限模式；权限在重命名之前，通过已拥有的文件描述符设置。目标路径的最终符号链接以及非普通文件会被拒绝。在合并已有的 TOML/JSONC 之前，读取 Codex 与 OpenCode 配置时同样会拒绝最终路径上的符号链接。本设计并不声称能防范控制父目录的攻击者。

容器写入保护仍然生效：若目标位置是不安全的临时（ephemeral）路径，将返回 422，并指引操作者使用宿主机上的设置命令。仍可使用试运行（dry run）模式，且不会写入文件。受支持的宿主机设置命令请参阅 [CLI 集成](../guides/CLI-INTEGRATIONS.md)，对外错误契约请参阅 [错误净化](./ERROR_SANITIZATION.md)。
