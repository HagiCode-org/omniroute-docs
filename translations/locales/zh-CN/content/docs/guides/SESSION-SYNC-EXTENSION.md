---
title: "浏览器会话同步扩展"
version: 3.8.51
lastUpdated: 2026-09-09
---

# 浏览器会话同步扩展

> **⚠️ 第三方软件——未经 OmniRoute 团队审计。** 本页描述的扩展程序和本地桥接程序位于一个独立维护的仓库中（[`avichal15/omniroute-session-sync`](https://github.com/avichal15/omniroute-session-sync)）。下文列出的安全特性（仅回环流量、Cloud Sync 强制检查、不落盘等）是该项目作者对其行为的自我描述，OmniRoute 团队尚未对其进行独立验证。使用前请自行承担风险，并在授予其访问提供者凭据的权限之前审阅其源代码。

OmniRoute 支持多种网页界面提供者适配器，包括 ChatGPT Web、Gemini Web、Z.ai Web、Qwen Web、Grok Web 和 DeepSeek Web。这些适配器使用浏览器中的会话 Cookie，而不是传统的 API 密钥。

Web 会话 Cookie 会定期过期或轮换。发生这种情况时，在 OmniRoute 仪表盘中粘贴新的 Cookie 请求头之前，发往该提供者的请求都会失败。

[OmniRoute Session Sync](https://github.com/avichal15/omniroute-session-sync) 配套扩展程序会在本地自动完成这一续期流程：

```
[ Google Chrome Extension ]
      |
      | 1. Detects cookie rotation for mapped domain
      | 2. Reassembles tokens (e.g. multi-chunk ChatGPT session)
      v
[ Local Sync Bridge (Port 20129) ]
      |
      | 3. Authenticates via paired Bearer token
      | 4. Checks that Cloud Sync is disabled
      | 5. PUT /api/providers/:id
      v
[ OmniRoute Management API (Port 20128) ]
      |
      | 6. Encrypts and persists updated cookie in storage.sqlite
      v
[ Active Inference / Fallback Combos ]
```

---

## 能力

- **自动 Cookie 检测：** 通过 `chrome.cookies.onChanged` 监听已配置提供者域名的变化，并对每个提供者进行防抖处理（包括 Qwen 的顶级域名 `qwen.ai` 和旧版主机名）。
- **分块 Token 重组：** 按顺序处理多段会话 Cookie（例如 ChatGPT 的数字 Token 分块）。
- **单一连接映射：** 你可以为每个浏览器提供者选择其更新所对应的确切连接 ID。其他账户和官方 API 提供者不受影响。
- **受监管的 sidecar 运行时：** 本地桥接程序以独立的、受监管的 sidecar 进程形式运行在 20129 端口，与 OmniRoute（20128 端口）并行。这使桥接程序的存活状态与 OmniRoute 的事件循环解耦，因此在 OmniRoute 重启期间，待处理的浏览器会话更新会保持排队并自动重试。
- **优先级回退组合：** 可轻松创建或更新 `browser-sessions` 组合，其中包含最多八个按优先级排序的浏览器模型。

---

## 安全边界

Session Sync 严格在本地运行：

1. **仅限回环地址：** 所有网络通信都限于 `127.0.0.1`。带有非回环 Host 请求头的请求会被拒绝。
2. **Cloud Sync 强制检查：** 桥接程序在每次写入前都会查询 OmniRoute 设置。如果启用了 Cloud Sync，则拒绝凭据更新。
3. **不在磁盘上明文持久化：** 同步桥接程序仅在传输到 OmniRoute 期间将 Cookie 保存在内存中。Cookie 从不写入磁盘文件、状态记录或诊断日志。
4. **独立的用户状态：** 配对元数据、非机密的确认哈希值以及连接映射保存在 `%USERPROFILE%\.omniroute\session-sync\state.json` 中，并受仅用户可访问的 ACL（`0600`）保护。
5. **一次性配对：** 扩展程序注册需要所有者生成的 8 位配对码，该配对码 5 分钟后过期。

---

## 设置

### 前提条件

- Node.js 24 LTS（或与 OmniRoute 运行时匹配的版本）。
- Google Chrome 120 或更高版本。
- 在 20128 端口运行的本地 OmniRoute 实例。
- 已在目标网页提供者下配置好的现有提供者连接。

### 步骤 1：安装 Session Sync 仓库

将项目克隆到本地计算机：

```bash
git clone https://github.com/avichal15/omniroute-session-sync.git
cd omniroute-session-sync
```

### 步骤 2：配置嵌入模式

运行嵌入式设置命令：

```bash
npm run setup:embedded
```

这会在 OmniRoute 的本地 `.env` 中添加 `--import=.../bridge/omniroute-preload.mjs`，并通过 Windows 任务计划程序（`OmniRoute Session Sync`）配置自动启动。

以集成同步模式启动 OmniRoute：

```bash
npm run start:integrated
```

检查状态以确认两个服务都在运行：

```bash
npm run status
```

### 步骤 3：安装 Chrome 扩展程序

1. 打开 Chrome，访问 `chrome://extensions`。
2. 在右上角启用 **开发者模式**。
3. 点击 **加载已解压的扩展程序**，选择 `omniroute-session-sync` 目录中的 `extension/` 文件夹。
4. 确认 **OmniRoute Session Sync**（v2.0.1）已列出。

### 步骤 4：配对并映射连接

1. 在终端中生成所有者配对码：
   ```bash
   npm run pair
   ```
2. 点击 Chrome 中的扩展程序图标，将配对码粘贴到弹出窗口中，然后点击 **Connect**。
3. 为每个提供者，从下拉列表中选择你的 OmniRoute 连接，然后点击 **Apply**。
4. 在 Chrome 中登录提供者网站，然后点击 **Sync** 和 **Test**。

---

## 优先级回退路由

在弹出窗口的 **Model Fallback** 部分中，选择并排列你偏好的模型（例如 `chatgpt-web/gpt-5.5`、`gemini-web/gemini-3.5-flash`、`qwen-web/qwen3.7-plus`、`zai-web/glm-5.3`）。

点击 **Save fallback** 以创建或更新 OmniRoute 中的 `browser-sessions` 组合。之后即可将推理请求路由到：

```json
{
  "model": "browser-sessions",
  "messages": [{ "role": "user", "content": "Hello" }]
}
```

如果某个提供者会话过期或达到上游配额限制，OmniRoute 会自动回退到列表中的下一个可用浏览器模型。
