# GitHub Copilot 提供者

**状态：实验性 / 政策上存在歧义**

OmniRoute 可以通过用户自己的 GitHub Copilot 订阅转发请求。本文说明用户会获得哪些内容、如何连接 GitHub，以及 OmniRoute 能够和不能够衡量其用量额度的哪些方面。

## 重要提示：实验性状态

OmniRoute 使用的是 `api.githubcopilot.com` 端点——与官方 GitHub Copilot CLI 和 VS Code 扩展所使用的端点相同。**GitHub 并未将该端点公开为面向第三方的通用推理 API。**因此，该集成被归类为实验性质，且政策上存在歧义。

- GitHub 可能在不另行通知的情况下更改或撤销 API 访问权限。
- 用户必须使用自己的 GitHub 账号，绝不可共享凭据。
- 用户仍需对自己的 GitHub 套餐、账单设置以及是否遵守 GitHub 服务条款负责。

参考来源（访问于 2026-09-02）：

- [GitHub 适用于附加产品与功能的条款](https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#github-copilot)
- [GitHub Copilot 产品专用条款](https://github.com/customer-terms/github-copilot-product-specific-terms)
- [GitHub Copilot 套餐](https://docs.github.com/en/copilot/about-github-copilot/subscription-plans-for-github-copilot)

## 用户可获得的内容

| 套餐       | 每月积分（官方文档）                     | 模型选择 |
| ---------- | ---------------------------------------- | -------- |
| Free       | “An allowance”——数量未公布               | 仅 Auto  |
| Student    | “An allowance”——数量未公布               | 仅 Auto  |
| Pro        | 基础 1,000 + 弹性 500 = 合计 1,500       | 可显式选择 |
| Pro+       | 基础 3,900 + 弹性 3,100 = 合计 7,000     | 可显式选择 |
| Max        | 基础 10,000 + 弹性 10,000 = 合计 20,000  | 可显式选择 |
| Business   | 每席位 1,900                             | 可显式选择 |
| Enterprise | 每席位 3,900                             | 可显式选择 |

**GitHub Copilot 不适用于 GitHub Enterprise Server。**

## 如何连接

1. 打开 OmniRoute 仪表盘 → Providers → GitHub Copilot。
2. 阅读实验性状态警告并确认。
3. 点击 **Connect GitHub**，此时会出现一个设备授权码。
4. 访问 `https://github.com/login/device` 并输入该授权码。
5. 在你的 GitHub 账号中授权 OmniRoute 应用。
6. OmniRoute 会验证你的 Copilot 使用资格，并识别你的套餐等级。
7. 连接状态会显示你的套餐（若可识别）以及模型的可用情况。

要断开连接，请打开提供者卡片并点击 **Disconnect**。

## OmniRoute 能够和不能够衡量的内容

**可以衡量（当 GitHub API 返回相应数据时）：**

- 套餐等级（来自用户 API 响应中的 `copilot_plan` 字段）
- 免费账号剩余的对话与补全配额（来自 `limited_user_quotas`）
- 付费账号剩余的配额百分比（来自 `quota_snapshots`）
- 每个模型是否启用了模型选择器

**无法衡量：**

- 免费版套餐包含的确切积分数量（GitHub 未公布该数字）
- 除非 API 包含明确的字段，否则无法判断是否启用了额外的付费用量
- 月中套餐或配额的未来变更

## 为何不显示固定的免费 Token 数量

GitHub 为免费版公布的文档中，仅写明“An allowance of GitHub AI Credits”，未注明具体数量。因此，OmniRoute 将免费版的配额表示为**“未知”**——既不是零，也不是无限。

OmniRoute 绝不会在其免费 Token 总量的汇总标题中加入猜测的积分数。该额度作为已连接账号的一项权益展示，与数值化的免费 Token 池分开。

## 免费账号的自动模型选择

在 Free 与 Student 套餐中，GitHub 不允许用户选择模型。Copilot 界面会为每个请求自动选择一个模型。

OmniRoute 将其表示为目录中的模型 **“Auto”**（`auto`）。对于经由该模型路由的每个请求，OmniRoute 会先向 Copilot 的 `/auto` 端点询问应由哪个具体模型来处理本轮请求，然后使用该模型 ID 以及 `/auto` 返回的会话令牌发送请求（`open-sse/executors/github/autoModel.ts`）。选择由 GitHub 决定；相邻请求所用的模型可能不同。

Free 与 Student 账号只能使用 `auto`。显式指定的模型，例如 `claude-opus-5` 或 `gpt-5.4`，仅在账号的实时能力确认允许选择模型时才会显示。

## 路由与回退行为

- 状态健康的已连接账号可以参与正常路由。
- 配额耗尽会触发范围较窄的账号/模型锁定；其他提供者与其他 GitHub 账号不受影响。
- 认证失败只影响该连接。
- 提供者级别的 GitHub 故障可能会触发提供者的断路器。
- OmniRoute 会遵循 GitHub 返回的重试/重置信息。若无可用的重置时间，则需要进行保守的重新验证，而不会激进地重试。

## 计费与超额用量的不确定性

若你的 GitHub 套餐包含额外的付费用量（“pay as you go”，即按量付费），超出基础额度可能会产生 GitHub 收取的费用。OmniRoute 无法可靠地判断你的账号是否启用了付费超额。用户应直接在 GitHub 设置中管理支出控制：[github.com/settings/copilot](https://github.com/settings/copilot)

## 故障排查

**“Copilot entitlement not found”：**你的 GitHub 账号没有有效的 Copilot 订阅。请在 [github.com/features/copilot](https://github.com/features/copilot) 启用 Copilot Free。

**“Authorization expired”：**该连接的 OAuth 令牌已过期。请断开连接后重新连接，以获取新的设备授权。

**“No models available”：**能力发现无法访问 Copilot API。请检查网络连接，然后尝试重新连接。

**配额耗尽：**Free 套餐每月允许的对话与补全请求数量有限。请等待每月重置，或升级你的 Copilot 套餐。

## 运营方注意事项

- 凭据使用 OmniRoute 的标准 AES-256-GCM 方案进行静态加密。
- 设备授权流程使用 GitHub 的公开 client ID（依据硬性规则 #11，通过 `resolvePublicCred()` 嵌入——不涉及任何密钥）。
- 能力记录每 6 小时刷新一次（可配置）。
- 除非选择了显式的路由策略，否则该提供者不参与自动组合（auto-combo）评分，因为其积分数量未知，无法表示为量化的 Token 预算。
