# Grok Build OAuth 媒体

使用现有的 OAuth 流程连接 **Grok Build**（`grok-cli`）。媒体请求会复用该连接池及其可续期的访问令牌，无需额外登录，也不需要开发者 API 密钥。可用性与计费取决于账户的权益与上游设置。该适配器并不意味着免费使用，也不会改变账户的按需消费上限。

| 网关端点                   | 模型                                              |
| -------------------------- | ------------------------------------------------- |
| `/v1/images/generations`   | `grok-cli/grok-imagine-image`（需显式启用，见下文） |
| `/v1/videos/generations`   | `grok-cli/grok-imagine-video`                     |
| `/v1/audio/speech`         | `grok-cli/grok-tts`                               |
| `/v1/audio/transcriptions` | `grok-cli/grok-voice-transcribe-2.0`              |

短前缀 `gc/` 同样有效。请始终带上 OAuth 前缀：为兼容起见，不带前缀的 Imagine 模型 ID 仍会解析到独立的 `xai` API 密钥提供者。OAuth 请求绝不会替换为 API 密钥，也不会隐式切换到该提供者。`xai-oauth` 是另一个登录提供者，未被加入这些媒体注册表。

## 请求示例

使用你正常的 OmniRoute 身份验证，将以下 JSON 请求体发送到对应的网关端点：

```json
{
  "model": "gc/grok-imagine-image",
  "prompt": "A blue cube on white",
  "n": 1,
  "size": "1024x1024",
  "response_format": "url"
}
```

图像需显式启用：仅当 `GROK_SUBSCRIPTION_IMAGES_ENABLED` 为 `true`（默认 `false`）时，`grok-cli` / `gc` 才是图像提供者。这与 [Grok 图像生成](../guides/GROK_IMAGES.md) 中其他 Grok 订阅图像路由所用的开关相同。开启该标志后，请求体遵循该指南（原生的 `aspect_ratio` / `resolution`、OpenAI 风格的 `size` 映射、Image 2.0 上的 `quality`，以及 `url` 或 `b64_json`）；区别仅在于传输方式：调用会发往 Grok Build 代理，并附带 CLI 令牌鉴权头，而不是公开的 xAI 端点。

```json
{
  "model": "gc/grok-imagine-video",
  "prompt": "A blue cube rotating slowly",
  "duration": 2,
  "aspect_ratio": "1:1",
  "resolution": "480p"
}
```

视频生成只提交一次，然后使用创建该任务的账户令牌进行轮询。完成后，它会返回现有的 MP4 URL 响应结构。鉴权错误、结果不明确的网络故障以及轮询超时都不会重新提交任务。超时并不能证明上游任务已经停止，因此请勿盲目重复请求。显式的视频组合保留其现有的并发扇出行为，因此如果只需生成一次，请使用具体模型。

视频请求接受正数的 `timeout_ms`（最大 1,800,000 毫秒）、取值范围为 1,000 至 1,800,000 毫秒的 `poll_interval_ms`，以及取值范围为 1 至 300 的 `max_polls`。默认值分别为 300,000 毫秒与 2,500 毫秒；轮询次数同时受请求截止时间与服务器上限约束。无效或超出范围的控制参数会在创建任务之前返回 400。创建与轮询的 JSON 响应均限制为 1 MiB。截止时间同样涵盖响应体读取。客户端取消会停止 Grok/xAI 及兼容的任务轮询处理程序（包括其组合目标）的本地请求、等待与轮询。这并不能证明提供者端的远程任务已被取消。

```json
{
  "model": "gc/grok-tts",
  "input": "Olá, este é um teste",
  "voice": "eve",
  "language": "pt-BR",
  "response_format": "mp3"
}
```

`grok-tts` 是网关路由 ID，而不是上游的 TTS 模型名称。适配器会将 `input` 映射为 `text`，将 `voice` 映射为 `voice_id`；默认值为 `eve`、`auto` 与 MP3。支持的编解码器为 `mp3`、`wav`、`pcm`、`mulaw` 和 `alaw`；语速必须介于 `0.7` 与 `1.5` 之间。原生的 `output_format` 选项可用于设置采样率与比特率。OpenAI 语音名称以及 `opus` 等不受支持的编解码器不会被重新映射。

进行转写时，请使用 multipart 字段 `model`、`file`，以及可选的 `language`。`response_format` 可以是 `json`、`verbose_json` 或 `text`；JSON 格式会保留原生的词级时间戳与时长。适配器会将原生选项放在文件之前，并将 `.opus` 上传文件重新标记为 `.ogg`，字节内容保持不变。支持的原生选项包括 `diarize`、`multichannel`、`channels`、`sample_rate`、`audio_format`、`format` 与 `filler_words`。这是批量 STT，而非 WebSocket 语音或翻译适配器。

## 上游拆分

Imagine 请求使用 `cli-chat-proxy.grok.com/v1`；语音功能使用 `api.x.ai/v1/tts` 与 `/stt`，并使用同一个 OAuth 令牌。CLI 代理上的语音路径会返回 404。原生语音选项请参阅 [xAI TTS 文档](https://docs.x.ai/developers/model-capabilities/audio/text-to-speech) 与 [批量 STT 文档](https://docs.x.ai/developers/model-capabilities/audio/speech-to-text)。
