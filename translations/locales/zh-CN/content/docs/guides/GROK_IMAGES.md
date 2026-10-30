---
title: "Grok 图像生成"
---

# Grok 图像生成

使用路由器的 API 密钥向 `POST /v1/images/generations` 发送请求。
通过 `GET /v1/images/generations` 列出可用的图像模型。

除非 `GROK_SUBSCRIPTION_IMAGES_ENABLED` 为 `true`（定义默认值为 `false`），否则 Grok 订阅图像路由保持关闭。关闭期间，`xai-oauth` / `xao` 和 `grok-cli` / `gc` 不是图像提供者，`high`/`hd` 质量不会被改写为 `medium`，API 密钥方式的 `xai` 仍保持原有的 OpenAI 兼容图像请求。
开启该标志后，订阅连接可以通过 `grok-cli/grok-imagine-image-2.0`（别名 `gc/`）或 `xai-oauth/grok-imagine-image-2.0`（别名 `xao/`）生成图像。请使用一个已有的、具备 API 访问权限的 OAuth 连接；账户权限与订阅配额同样适用。API 密钥连接则通过同一条 xAI 图像请求路径使用 `xai/grok-imagine-image-2.0`。`xai-oauth` 和 `xai` 使用 xAI 图像端点；`grok-cli` 通过 Grok Build 代理（`cli-chat-proxy.grok.com`）发送相同的请求体，并附带 Grok CLI 令牌认证头，参见 [Grok Build OAuth 媒体](../providers/grok-cli-media.md)。它们都使用路由器现有的令牌刷新与凭据选择机制。

```json
{
  "model": "grok-cli/grok-imagine-image-2.0",
  "prompt": "A chef preparing pho in a bright Vietnamese kitchen",
  "aspect_ratio": "3:2",
  "resolution": "1k",
  "quality": "medium",
  "response_format": "b64_json"
}
```

对于这些提供者，原生的 `aspect_ratio` 和 `resolution` 优先于 OpenAI 风格的 `size`。例如，`1536x1024` 映射为 `3:2`，`2048x2048` 映射为 `1:1` 且分辨率为 `2k`；最终的像素尺寸由 xAI 决定。`size: "auto"` 保留自动选择宽高比的行为。Image 2.0 接受的 `quality` 值为 `low`、`medium` 和 `auto`；兼容值 `high`/`hd` 映射为 `medium`，`standard` 映射为 `low`。较早的 Grok 图像模型会拒绝 `quality` 选项。OpenAI 的 `style` 选项会被省略。无效选项返回 400。参见 [xAI 图像生成契约](https://docs.x.ai/developers/model-capabilities/images/generation)。
