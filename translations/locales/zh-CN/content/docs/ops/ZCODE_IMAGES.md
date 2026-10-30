---
title: "ZCode 图像输入"
version: 3.8.52
lastUpdated: 2026-10-17
---

# ZCode 图像输入（显式选择启用的原生协议）

ZCode 执行器会将 OpenAI 用户消息中的 `image_url` 部件转发为原生图像块，并保留它们在文本部件之间的位置。支持 PNG、JPEG、WebP 和 GIF。Data URL 保留其原始字节。公开的 HTTP(S) URL 使用现有的有界图像解析器，并检查 DNS、私有地址与重定向。限制为每个请求最多 12 张图像、每张解码后的图像最多 1 MiB。非图像媒体会被拒绝。

经过测试的官方 ZCode worker 已能在其模型 SDK 中处理图像块，但其 `workspace/generateText` 线协议 schema 只接受字符串内容。因此，启用图像需要**显式选择的独立协议补丁**。OmniRoute 绝不会自动为已安装的 ZCode 运行时打补丁。

从受支持的已安装 worker 准备一个独立副本：

```sh
node scripts/ops/zcode-image-runtime.mjs /path/to/installed/zcode.cjs /path/to/isolated/zcode-images
```

该辅助脚本会固定经过测试的输入 SHA-256，只修改一个用户内容 schema，复制相邻的运行时包，并记录源文件与输出的哈希值。未知构建、重复的 schema 匹配与冲突的输出目录都会直接失败（fail closed）。原始 ZCode 文件、身份验证、提供者配置与原生工具行为均保持不变。本仓库不包含任何厂商捆绑包。

自 2026-10-18 起，该辅助脚本会应用第二个带版本号的步骤 `numeric-provider-code-v1`：结束记录（finish record）中的业务错误检测器只接受数字形式的提供者错误码，因此 GLM 在结束记录中自行生成的工具调用文本，不再被误读为 `502 Provider returned a business error`。明确的失败标记（`success:false`、`event:"error"`、`ProviderBusinessError` 实例）仍会按原样判定为失败。`omniroute-image-patch.json` 中的回执列出了这两个步骤；从新的厂商构建重新准备时，必须在应用每个步骤之前重新审核。

仅为 OmniRoute 进程配置 ZCode 的命令覆盖项以选择该副本；同时保留原始未修改的 `ZCODE_SERVER_ENTRY` 以及已登录的配置档（profile）：

```sh
ZCODE_AGENT_SERVER_COMMAND=/path/to/node
ZCODE_AGENT_SERVER_ARGS_JSON='["/path/to/isolated/zcode-images/zcode.cjs","app-server","--stdio"]'
```

通过常规部署路径重启 OmniRoute。在调用方的模型输入能力中为 `zc/glm-5.3-flash` 启用 `image`，然后通过该调用方验证一张真实图像。普通的 `zc/glm-5.3` 仅支持文本：适配器会在原生推理之前拒绝图像请求，而不是悄悄丢弃像素。参见 [GLM-5.3 官方文档](https://docs.z.ai/guides/llm/glm-5.3)。原生推理仍会将工具调用返回给调用方；不会创建自主的 ZCode 编码会话。SSE 仍然按模型步骤进行缓冲。

回滚时，请恢复之前的 OmniRoute 制品与配置，移除两个命令覆盖项，并通过同一控制平面重启。原始安装的 ZCode worker 仍然可用。ZCode 更新后需重新审核协议扩展；请勿在未经审核的情况下，将补丁直接应用于新的厂商构建。
