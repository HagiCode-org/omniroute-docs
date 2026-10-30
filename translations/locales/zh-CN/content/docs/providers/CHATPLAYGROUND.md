---
title: "ChatPlayground 提供者集成"
version: 3.8.53
lastUpdated: 2026-10-24
---

# ChatPlayground 提供者集成

OmniRoute 支持 **ChatPlayground**（`chatplayground`，别名 `cpl`），可访问经由 ChatPlayground 路由的多种模型端点（Azure、LMSYS 和 Perplexity），并支持自动铸造 Clerk 会话 JWT 与模型发现。

---

## 身份验证与 Cookie 设置

ChatPlayground 的所有 API 请求都需要短期有效的 Clerk 会话 JWT（`Authorization: Bearer <jwt>`）。OmniRoute 通过无需浏览器的自动铸造机制处理整个令牌生命周期。

### 必需的 Cookie

要配置 ChatPlayground 连接，只需要 **两个 cookie**，二者都可以直接从 **`web.chatplayground.ai`** 获取（你**无需**单独检查 `clerk.chatplayground.ai`）：

1. **`__client`**：长期有效的 Clerk 客户端授权令牌。
2. **`__session`**：Clerk JWT（`eyJhbGciOi...`）。OmniRoute 会自动解码其载荷，以提取你当前的活动会话 ID（`sid: "sess_..."`）。

### 如何获取 Cookie

1. 在 **https://web.chatplayground.ai/** 登录你的账户。
2. 打开浏览器开发者工具（**F12**，或右键 → **检查**）。
3. 使用以下任一方法：

#### 方法 A（最简单：Network 标签页）

- 切换到 DevTools 中的 **Network** 标签页。
- 刷新页面，或点击任意操作（例如模型选择器或设置）。
- 点击发送到 `web.chatplayground.ai` 或 `app.chatplayground.ai` 的任意请求（例如 `models` 或 `user`）。
- 在右侧面板中，进入 **Headers** → **Request Headers**。
- 复制 **`Cookie:`** 请求头的完整值，并将其粘贴到 OmniRoute 的连接凭据字段中。OmniRoute 会自动提取 `__client` 与 `__session`。

#### 方法 B（Application 标签页）

- 在 DevTools 中进入 **Application**（Chrome/Edge）或 **Storage**（Firefox）→ **Cookies** → `https://web.chatplayground.ai`。
- 复制 `__client` 和 `__session` 的值。
- 按以下格式粘贴到 OmniRoute 中：
  ```text
  __client=<value>; __session=<value>
  ```

---

## 令牌铸造与轮换生命周期

1. **自动铸造**：
   - OmniRoute 从 `__session` 中提取 `sid`，并使用 `__client` 向 Clerk 的令牌铸造端点（`https://clerk.chatplayground.ai/v1/client/sessions/{sid}/tokens`）发送请求。
   - 返回的短期 Bearer JWT 会缓存在内存中。
   - OmniRoute 会解码 JWT 的 `exp` 声明，并在其过期前约 15 秒自动铸造新令牌。

2. **直接使用 Bearer JWT**：
   - 你也可以直接粘贴一个有效的 Clerk Bearer JWT。

3. **多账户管理（OmniRoute 原生）**：
   - 如需使用多个 ChatPlayground 账户，请在 OmniRoute 仪表盘中将它们添加为独立的提供者连接（例如 `ChatPlayground 1`、`ChatPlayground 2`）。
   - OmniRoute 原生组合路由器（Combo Router，可用策略包括 `round-robin`、`priority`、`least-used`、`headroom` 和 `reset-aware`）会自动在多个账户之间分配查询。
   - 如果某个账户遇到速率限制（429）或配额限制，OmniRoute 的自动账户回退系统（`open-sse/services/accountFallback.ts`）会透明地切换到下一个健康账户。
   - 每个连接都会在仪表盘的 Limits 页面上独立监控各自的用量、套餐以及每日或每月配额。

---

## 支持的端点与模型目录

ChatPlayground 将模型路由到三条不同的后端路径。**权威模型名单在运行时发现**：OmniRoute 会针对实时、无需身份验证的 `GET https://app.chatplayground.ai/api/models` 目录解析每个请求的模型，因此新增或下线的模型以及端点迁移，无需发布新版本即可生效：

- 实时目录在内存中缓存 **10 分钟**（使用单次进行中请求防护，超时 15 秒）。
- 若模型发现服务中断（网络故障、超时或载荷格式错误），OmniRoute 会回退到**最近一次成功加载的实时目录**；如果从未成功加载过，则回退到**内置离线目录**（`open-sse/services/chatplaygroundModels.ts` 中的 `CHATPLAYGROUND_FALLBACK_MODELS`，快照拍摄于 2026-10-20）。
- 该目录会为端点路由（`azure` / `lmsys` / `perplexity`）、上游的 `model`/`modelName`/`botId` 值，以及通过 `/api/providers/{id}/models` 进行的模型发现提供数据。

三个端点系列（目录行取自截至 2026-10-20 的内置快照；实时目录才是权威来源）：

### 1. Azure 端点（`https://app.chatplayground.ai/api/chat/azure`）

- **GPT**：`gpt-6.1-sol`、`gpt-6-luna`
- **Claude**：`claude-sonnet-5-5`、`claude-haiku-5-5`、`claude-opus-5-5`、`claude-fable-5-1`
- **Gemini**：`gemini-3.8-flash-l`、`gemini-3.8-flash`、`gemini-3.1-pro`
- **DeepSeek**：`deepseek-v4-pro`、`deepseek-v4-flash`
- **Kimi**：`kimi-k2.6`
- **xAI**：`grok-4.6`、`grok-4.7`
- **Mistral**：`mistral-large-3`

### 2. LMSYS 端点（`https://app.chatplayground.ai/api/chat/lmsys`）

- **Kimi**：`kimi-k3`
- **Llama**：`llama-4-scout`、`llama-4-maverick`
- **Qwen**：`qwen3.8-max`、`qwen3.7-plus`、`qwen3.6-flash`
- **DeepSeek**：`deepseek-r1`
- **Cohere**：`command-a`、`command-r-plus`
- **GLM**：`glm-5.3`、`glm-5.3-flash`
- **其他**：`minimax-m3`、`nova-2-lite-v1`、`mimo-v2.6-pro`、`hy3`

### 3. Perplexity 端点（`https://app.chatplayground.ai/api/chat/perplexity`）

- `perplexity-sonar`、`perplexity-sonar-pro`、`perplexity-sonar-reasoning-pro`

### 模型 ID 解析（严格模式，不做直通）

请求中的 `model` 字符串会与目录进行解析，**不做合成回退**；无法识别的模型会在前置阶段被直接拒绝，并返回 `400: ChatPlayground model not found or invalid`。解析顺序如下：

1. 首先去除提供者前缀 `chatplayground/`、`cpl/`、`cpl.`、`cp.`、`cpl:`、`cp:`（连续叠加的前缀会被合并，例如 `cpl/chatplayground/gpt-6-luna` → `gpt-6-luna`）。
2. 不区分大小写地依次匹配目录中的 `id`，然后是 `modelName`，最后是 `displayName`。
3. 带厂商前缀的 ID 会按后缀回退匹配：`openai/gpt-6-luna` 会解析为 `gpt-6-luna`。
4. 如果实时目录中没有任何匹配项，则会在拒绝之前尝试内置的回退目录，因此即使实时名单刚刚移除了某个模型，它仍能被路由，而不会报错。

仅考虑 `group: "chat"` 的目录行。

### 动态模型发现、定价套餐与积分权重

#### 官方订阅套餐（`chatplayground.ai/checkout`）

1. **Pro（每月 15 美元）**：
   - 每月 5,000 次基础模型查询
   - 每月 1,500 次高级模型查询
   - 每月 300 次文档上传
   - 每月 300 次图像生成
   - 可并排比较 4 个模型
2. **Unlimited（每月 25 美元）**：
   - 每月不限次数的基础模型查询
   - 每月不限次数的高级模型查询（通过公平使用滑动限制强制执行，上限为**每日 300 积分**）
   - 每月不限次数的文档上传
   - 每月 1,000 次图像生成
   - 可并排比较 6 个模型

#### StackSocial 终身订阅档位

ChatPlayground 还在 StackSocial 等平台上提供终身优惠：

1. **Basic 套餐（终身）**：
   - 每月 500 条消息
   - 面向轻度提示词使用与探索
2. **Pro 套餐（终身）**：
   - 每月 2,000 条消息
   - 面向高频工作流
3. **Unlimited 套餐（终身）**：
   - 每月不限消息数（受公平使用限制：**每日 300 积分**）
   - 可并排访问完整的 AI 模型目录

#### 上游 API 标志（`GET https://app.chatplayground.ai/api/models`）

虽然 ChatPlayground 的公开营销页面将模型分为“基础”与“高级”两类，但其内部 API 暴露的是以下字段：

- `premiumOnly: boolean`：上游的订阅者门控布尔值。`premiumOnly: true` 的模型（例如 `gpt-6.1-sol`、`claude-sonnet-5-5`、`claude-opus-5-5`、`kimi-k3`、`qwen3.8-max`）需要有效的付费套餐（Pro、Unlimited 或终身套餐）。若从免费账户访问，API 会返回 HTTP 403 并提示：_"This model is only available to active subscribers. Please upgrade your plan."_ `premiumOnly: false` 的模型（例如 `gpt-6-luna`、`deepseek-v4-pro`、`grok-4.7`、`glm-5.3-flash`）在所有套餐中均可访问。
- `creditWeight: number`：每次查询相对套餐额度的扣减倍数。当前目录中的权重范围为 `1` 至 `10`：
  - `1`：标准模型（`gpt-6-luna`、`deepseek-v4-pro`、`deepseek-v4-flash`、`kimi-k2.6`、`llama-4-scout`、`qwen3.7-plus`、`command-a`、`mistral-large-3`、`nova-2-lite-v1`，以及所有 `perplexity-*`）
  - `2`：中档（`grok-4.6`、`grok-4.7`、`gemini-3.8-flash-l`、`glm-5.3`、`glm-5.3-flash`）
  - `3–5`：旗舰（`gemini-3.8-flash`、`gemini-3.1-pro`、`gpt-6.1-sol`、`kimi-k3`）
  - `7–10`：重度推理（`claude-haiku-5-5`：7，`claude-sonnet-5-5` / `claude-opus-5-5` / `claude-fable-5-1`：10）
- `active: boolean`：上游的可用性开关。OmniRoute 的解析器不会根据此标志过滤，未激活的行仍会被路由，但上游 API 可能会拒绝对它们的请求。
- `group: string`：过滤为 `"chat"`，用于会话式文本补全。

---

## 配额与限制仪表盘

OmniRoute 会自动将 ChatPlayground 接入其 Limits 与 Quotas 仪表盘：

- **端点**：`GET https://app.chatplayground.ai/api/user`（通过已铸造的 Clerk Bearer JWT 进行身份验证）。
- **Unlimited 套餐（终身 / 每月 25 美元）**：在公平使用机制下按**每日 300 积分**统计。显示每日已用查询数（`user.dailyQueriesCount`）、剩余额度、百分比，以及每日 UTC 午夜重置。
- **Pro 套餐**：显示**每月 2,000 次查询**（StackSocial 终身）或**每月 1,500 次高级查询**（月付 Pro），并根据计费周期结束时间（`stripeCurrentPeriodEnd`）统计已用查询数与月度上限。
- **Basic 套餐**：显示**每月 500 次查询**（StackSocial 终身），并统计已用查询与重置时间。
- **免费账户**：显示基础用量指标及升级提示。

---

## 单条消息字符上限（15,000 字符）

ChatPlayground 在服务端对**每条消息强制限制为 15,000 个字符**：

- 如果单条消息的 `content` 超过 15,000 个字符（即 15,001 个及以上），ChatPlayground 的上游 API 会以 `HTTP 400: "Message cannot exceed 15,000 characters"` 拒绝该轮对话。
- 该限制按对话数组中的每一条消息轮次计算，而不是按请求的总负载大小计算。
- **预校验**：OmniRoute 的 `ChatPlaygroundExecutor` 会在分发前校验每条消息的字符长度；若有任何一轮超过 15,000 个字符，则会给出可操作的错误提示。
- **缓解策略**：
  - 启用 OmniRoute 的提示词压缩（例如 `RTK` 或 `lite` 模式），以压缩较大的上下文、系统指令与工具输出。
  - 将大型代码库、文件或多轮历史记录分块或拆分到多个独立的提示词中。

---

## 流式传输与协议细节

- ChatPlayground 的流式分块中会追加或包含形如 `CHAT_ID:[a-zA-Z0-9_-]+` 的哨兵标记。
- OmniRoute 的 `ChatPlaygroundExecutor` 会实时剥离这些哨兵标记，并将输出转换为 OpenAI 标准的 Server-Sent Events（`data: {"choices":[{"delta":{"content":"..."}}]}\n\n`），最后以 `data: [DONE]\n\n` 结束。
- 对于非流式请求，会返回标准的 `chat.completion` 响应封装。
- 对于 Perplexity 查询，上游返回的是一次性完整响应，而不是增量 SSE 分块；当对 Perplexity 查询请求 `stream: true` 时，OmniRoute 会合成标准的 SSE 分块，以确保支持流式的 OpenAI 客户端完全兼容。
- **CITATIONS 剥离**：Perplexity 端点会在其回答流末尾附加一个 `CITATIONS:[...]` 元数据块（网页客户端会解析它以生成引用链接，而不是直接渲染）。OmniRoute 会同时移除整行的 `CITATIONS:` 以及内联的、直至行尾的 `CITATIONS:` 片段（例如 `…Canberra**.[1]CITATIONS:[…]`），因此客户端永远不会看到原始标记。标记之前的引用文本会被保留；结构化的引用列表本身会被丢弃。
- **按端点的载荷约定**：请求体与 web.chatplayground.ai 为每个端点系列发送的内容保持一致：`azure`：`messages`、`model`、`chatId`、`isRegenerate`、`promptTemplate`、`fileUrl`、`botId`、`submissionId`、`noSave`；`lmsys`：`messages`、`model`、`botId`（必需，缺少时 API 会返回 500）；`perplexity`：`messages`、`modelName`、`botId`（必需）。

---

## 工具函数与思考 / 推理内容

### 1. 工具函数（上游不支持）

- **上游会忽略**：ChatPlayground 的 Web 后端不支持原生函数调用或工具执行。当传入 OpenAI 格式的 `tools` 参数时，上游 API 会返回 HTTP 200，但模型会**忽略工具定义**，并生成普通的对话文本，而不会生成结构化的 `tool_calls`。
- **模拟支持**：在 `src/shared/constants/providers/web-cookie-chatplayground.ts` 中被标记为 `toolCalling: "emulated"`。如果智能体式客户端需要工具调用，OmniRoute 会通过基于提示词的工具模拟来处理。

### 2. 思考与推理内容

- **内联 `<think>` 块**：推理模型（如 DeepSeek R1 / DeepSeek V4、Kimi K3 和 Sonar Reasoning Pro）会直接在生成的输出中包含其内部思维链，通常包裹在 `<think>...</think>` 块中。
- **直通**：这些推理消息会作为助手回复文本的一部分被逐字保留并流式输出。

---

## 服务条款、合规与运营方风险

ChatPlayground（由 Yaseen AI 运营）的服务条款包含以下具体限制：

- **第 11 条（过度或剥削性使用）**：严格禁止 _"sharing of accounts among multiple individuals or bots"_ 与 _"running scripts to exploit the AI on Yaseen AI"_。违反上述条款的账户可能被立即暂停，且不予退款。
- **第 12 条（临时中止使用的权利）**：单日使用超过 **10 美元的内部成本**将触发当日的临时暂停，月度内部成本超过 **80 美元**则会在当月剩余时间内触发终止。

### OmniRoute 的立场与安全建议

- **分类**：ChatPlayground 被明确归类为网页会话提供者，其 `subscriptionRisk: true` 且 `riskNoticeVariant: "webCookie"`。OmniRoute 仪表盘在设置时会展示风险提示弹窗。
- **单用户工作流**：请勿在公共代理或多用户团队中共享同一个 ChatPlayground 会话 Cookie。请将其用于个人助理或编码会话。
- **控制每日预算**：请勿向提供者发起高频基准测试或批量自动化。每日 300 次查询的公平使用上限有助于将用量稳定地控制在内部 10 美元/日的成本阈值之下。
- **与浏览器一致的请求头**：OmniRoute 会自动附加标准的桌面浏览器 User-Agent、Origin 与 Referer（`https://web.chatplayground.ai/`），并移除内部的 `CHAT_ID` 标记，以避免不必要的异常。
