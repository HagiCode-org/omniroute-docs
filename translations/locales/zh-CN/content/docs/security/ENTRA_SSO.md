---
title: "面向 Client API 的 Entra ID SSO"
version: 3.8.51
lastUpdated: 2026-09-23
---

# 面向 Client API 的 Entra ID SSO

> **权威来源：** `src/server/authz/entra/`、`src/lib/db/ssoIdentities.ts`
> **客户端辅助脚本：** `scripts/cli/omniroute-sso.mjs`
> **测试：** `tests/unit/entra-sso-auth.test.ts`、`tests/unit/entra-sso-client-script.test.ts`、`tests/integration/entra-sso-e2e.int.test.ts`（需主动开启）
> **读者对象：** 在 Microsoft Entra ID 租户中部署 OmniRoute 的管理员，以及登录该租户的开发者。

开发者使用短期有效的 Microsoft Entra ID 令牌（而非静态的 OmniRoute API 密钥）向 `/v1/*` 进行身份验证。他们的 Entra 安全组映射到 OmniRoute 密钥组，用量在调用日志中按人归属。

### 群组映射能承载什么、不能承载什么

密钥组**仅承载模型的允许/拒绝规则**（`group_model_permissions`）。预算、速率限制、用量上限、访问时段和组合权限都是 `api_keys` 表中的**按密钥**字段，加入某个组并不会授予这些权限，因此 SSO 用户的影子密钥在这些项上都使用默认值。

| 控制项                                                              | 能否通过群组映射作用于 SSO 用户？       |
| ------------------------------------------------------------------- | --------------------------------------- |
| 模型允许/拒绝                                                       | **是**——这正是密钥组存储的内容          |
| 按密钥的速率限制（`rateLimits`、`maxRequestsPerDay`/`PerMinute`）   | 否——按密钥设置                          |
| 预算/用量上限（`budget`、`dailyUsageLimitUsd` 等）                  | 否——按密钥设置                          |
| 访问时段、端点允许列表、组合允许列表                                | 否——按密钥设置                          |
| 调用日志归属（`usage_history.api_key_id`）                          | **是**——影子密钥是真实的密钥记录        |

要为 SSO 用户设置任何按密钥的控制项，请直接在已配置的 `sso:<upn>` 密钥上设置。在配置时把群组级默认值应用到这些字段是合理的后续工作，但本次变更不包含此项。

静态 API 密钥仍然可用。启用 SSO 只是新增一种身份验证方式。

---

## 整体工作方式

```
Claude Code ──apiKeyHelper──► omniroute-sso.mjs token ──► Entra access token
                                                              │
                                    Authorization: Bearer <token>
                                                              ▼
                                            clientApiPolicy (CLIENT_API)
                                              │ looksLikeEntraJwt?
                                              ▼
                             verifyToken → resolveGroups → provisionSsoIdentity
                                                              │
                                              shadow api_keys row + key groups
                                                              ▼
                                        the existing policy engine, unchanged
```

用户的第一次认证请求会创建一条与其 Entra `oid` 绑定的**影子 `api_keys` 记录**。之所以需要这条记录，是因为 `key_group_members` 对 `api_keys(id)` 有外键约束；让 SSO 用户走真实的密钥记录，群组模型规则和调用日志归属就能在下游各处无需任何 SSO 专用分支即可生效。

影子密钥的密文从不发放给任何人。对于 `source='sso'` 的记录，`getApiKeys()` 和 `getApiKeyById()` 会将其清空：一旦暴露，就会形成永久性的静态凭据，既绕过 SSO，又在离职后依然有效。

---

## 1. 在 Entra 中注册应用

只需创建一个应用注册。它同时服务于 CLI（公共客户端）和 API（令牌签发的受众）。

1. **Entra 管理中心 → 应用注册 → 新建注册。**
   - 名称：`OmniRoute`
   - 支持的账户类型：**仅此组织目录中的账户**
2. **身份验证 → 添加平台 → 移动和桌面应用程序。**
   - 重定向 URI：`http://localhost`。辅助脚本会在一个临时端口上绑定回环地址，因此请注册 Entra 为公共客户端保留的回环地址重定向。
   - **允许公共客户端流：是。** 辅助脚本会分发到开发者机器上，因此不持有客户端密钥，改用 PKCE。
3. **公开 API → 设置应用程序 ID URI。** 使用 `api://omniroute`（或接受生成的 `api://<client-id>`）。该值即 `entraApiAudience`。
   - **添加范围**，例如 `access_as_user`，并启用管理员同意。
4. **API 权限 → 添加权限 → 我的 API →** 选择你自己的应用 → 第 3 步中的范围。**授予管理员同意**，使开发者不会看到同意提示。
5. **令牌配置 → 添加 groups 声明 → 安全组。** 在**访问**令牌中输出**组 ID**。

记下**目录（租户）ID** 和**应用程序（客户端）ID**。

### 需要 Graph 回退时

当用户所属的组超过 150 个时，Entra 会完全省略 `groups` 声明，转而发送 `_claim_names`/`_claim_sources`。在已有一定规模的租户中，总会有人遇到这种情况。有两种处理方式：

- **保持回退关闭。** 这些用户会收到明确的拒绝信息（`AUTH_SSO_GROUP_OVERAGE`），而不是被静默地解析为“没有组”。
- **启用回退。** 添加**应用程序**权限 `GroupMember.Read.All`，授予管理员同意，创建客户端密钥，并将其设置为 `entraGraphClientSecret`（静态加密存储）。

---

## 2. 配置 OmniRoute

先创建你要映射的密钥组（它们承载实际策略），然后调用 `PATCH /api/settings`。每个 `entra*` 设置都会影响安全，因此请求必须包含 `currentPassword`；请求须来自仪表盘会话或本地 CLI（API 密钥和访问令牌会收到 `403`），且旧版 JSON 设置导入会丢弃这些键。

```bash
curl -X PATCH https://omniroute.corp/api/settings \
  -H 'Content-Type: application/json' \
  -H "Cookie: auth_token=$TOKEN" \
  -d '{
    "currentPassword": "…",
    "entraSsoEnabled": true,
    "entraTenantId": "<directory-tenant-id>",
    "entraClientId": "<application-client-id>",
    "entraApiAudience": "api://omniroute",
    "entraGroupMappings": [
      { "groupId": "<entra-group-object-id>", "keyGroupId": "<omniroute-key-group-id>" }
    ],
    "entraDefaultKeyGroupId": null,
    "entraGraphFallbackEnabled": false
  }'
```

| 设置                        | 含义                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `entraSsoEnabled`           | 总开关。默认 `false`。                                                                           |
| `entraAuthorityHost`        | 授权机构源。默认为 `https://login.microsoftonline.com`；对于主权云请进行设置。                    |
| `entraTenantId`             | 目录（租户）ID。会与令牌的 `tid` 进行比对。                                                      |
| `entraClientId`             | 辅助脚本使用的应用程序（客户端）ID。                                                             |
| `entraApiAudience`          | 应用程序 ID URI。会与令牌的 `aud` 进行比对。                                                     |
| `entraGroupMappings`        | Entra 组 objectId → `key_groups.id`。用户获得所有匹配项的并集。                                  |
| `entraDefaultKeyGroupId`    | 适用于不匹配任何映射的用户的密钥组。设为 `null` 则拒绝这些用户。                                 |
| `entraGraphFallbackEnabled` | 通过 Microsoft Graph 解析组声明超量的情况。                                                      |
| `entraGraphClientSecret`    | Graph 回退所用的客户端密钥。静态加密存储。                                                       |

该端点会拒绝无法认证任何用户的配置：租户和受众为必填项，且至少需要一条群组映射或一个默认密钥组（否则所有用户都会收到一个看起来像服务器故障的 403）。

修改会在每位用户下一次刷新令牌时生效，最长延迟为一个 `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` 周期。

### 主权云

`entraAuthorityHost` 用于选择 Entra 实例。商业云保持未设置；如需使用美国政府云，请设为 `https://login.microsoftonline.us`，中国云请设为 `https://login.partner.microsoftonline.cn`。该值通过 `/api/auth/sso/config` 发布，因此登录辅助脚本会自动跟随，无需在每台机器上单独配置。

除非主机是回环地址，否则明文 `http` 会被拒绝，并回退到商业云。授权机构决定了哪些密钥签发本网关所信任的令牌；如果通过网络接受 http 授权机构，路径上的任何人都能伪造网关会接受的身份。回环地址例外的存在，是为了让端到端测试能够启动一个模拟授权机构，参见 `tests/integration/entra-sso-e2e.int.test.ts`。

---

## 3. 开发者设置

分发 `scripts/cli/omniroute-sso.mjs`。它只需要 Node 18 或更高版本。

```bash
export OMNIROUTE_URL=https://omniroute.corp

node omniroute-sso.mjs login     # opens the browser, stores a refresh token
node omniroute-sso.mjs install   # writes the apiKeyHelper block
claude                           # /status shows the helper is active
```

`install` 会将配置合并到 `~/.claude/settings.json`，且不影响其他键：

```jsonc
{
  "apiKeyHelper": "node \"/path/to/omniroute-sso.mjs\" token --url https://omniroute.corp",
  "env": {
    "ANTHROPIC_BASE_URL": "https://omniroute.corp",
    "CLAUDE_CODE_API_KEY_HELPER_TTL_MS": "900000",
  },
}
```

若要实现零接触部署，请改为通过[托管设置](https://code.claude.com/docs/en/managed-settings)分发同样的配置块；开发者此时只需运行 `login`。

令牌缓存在 `~/.omniroute-sso/<host>.json` 中，权限为 `0600`，与 `gh` 和 `aws` 的做法一致。独立脚本在没有原生依赖的情况下无法访问操作系统密钥链。

### 命令

| 命令      | 行为                                                                                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `login`   | 在临时 `127.0.0.1` 端口上使用授权码 + PKCE（S256）。                                                                                                             |
| `token`   | 仅将访问令牌输出到标准输出，不输出其他内容。静默刷新；当需要重新执行 `login` 时，以非零状态退出，并在标准错误中给出说明。                                       |
| `install` | 将 `apiKeyHelper` 和 `env` 配置块合并到 `~/.claude/settings.json`。                                                                                              |
| `logout`  | 删除某一主机的已存储令牌。                                                                                                                                       |

`token` 的设计是只输出凭据本身：Claude Code v2.1.227 及更高版本会在 `apiKeyHelper` 与密钥一同输出横幅或日志行时判定其失败。脚本中的所有诊断信息都输出到标准错误。

---

## 吊销

在依赖 SSO 进行离职回收之前，请先了解以下内容。

在 Entra 中禁用用户会阻止签发**新的**令牌，但不会使已签发的令牌失效；这些令牌会一直有效直到 `exp`（默认一小时，可在 Entra 中调整）。OmniRoute 的即时紧急开关是影子密钥：将其设为未激活后，该用户在下一次请求时即停止认证，即使仍处于解析缓存窗口内。

```sql
UPDATE api_keys SET is_active = 0
WHERE id = (SELECT api_key_id FROM sso_identities WHERE oid = '<entra-oid>');
```

将用户从所有已映射的 Entra 组中移除，同样会在其下一次刷新令牌时产生相同效果。

---

## 验证状态

**已验证。** 令牌验证使用本地生成的 RSA 密钥对和模拟的 JWKS 运行，因此真实的 `jose` 路径（包括 `createRemoteJWKSet`）可以离线执行，所有负面用例也都会覆盖（错误的受众、错误的租户、已过期、签名不在 JWKS 中、缺少 `oid`、仅应用令牌、没有委派范围、算法替换）。端到端测试套件会以子进程方式运行实际的登录辅助脚本，并与一个以 Entra 方式校验 PKCE 挑战的模拟授权机构交互，覆盖回环地址回调、授权码交换、刷新令牌轮换、授权机构固定以及 `0600` 令牌缓存。

**未验证。** 以上所有令牌均非由 Microsoft 签发。因此，任何针对真实授权机构的内容都尚未得到证明：同意行为、特定租户实际输出的声明结构、条件访问的交互，以及在真实 Graph 响应下的组超量路径。

硬性规则第 18 条将 OAuth 上游流程列为需要在真实环境中验证的内容，因此如果你需要这一点，请将一次真实租户运行视为合并条件；上述测试套件并不覆盖此项。

```bash
# the opt-in end-to-end suite (stub authority, no network)
RUN_ENTRA_SSO_E2E=1 node --import tsx/esm --test tests/integration/entra-sso-e2e.int.test.ts
```

---

## 已知限制：会对原始密钥重新校验的路由

`/v1/models`、`/v1/embeddings` 以及其他几个处理程序会在处理函数内部重新校验原始 Bearer 令牌，而不是依赖中央的 CLIENT_API 决策，因此对 SSO 令牌会返回 401。`/v1/chat/completions` 和 `/v1/messages`（即 Claude Code 使用的路径）不受影响。将这些处理程序统一到中央决策上是后续工作。

## 故障参考

| 错误码                       | 状态码 | 原因                                                                                               |
| ---------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| `AUTH_SSO_DISABLED`          | 401    | SSO 已关闭或配置不完整。                                                                           |
| `AUTH_SSO_EXPIRED`           | 401    | 令牌已超过 `exp`。若刷新也失败，请重新运行 `login`。                                               |
| `AUTH_SSO_INVALID`           | 401    | 签名未能通过租户 JWKS 校验。                                                                       |
| `AUTH_SSO_CLAIM`             | 401    | `iss` 或 `aud` 不正确，通常是 `entraApiAudience` 配置不匹配。                                      |
| `AUTH_SSO_TENANT`            | 401    | 令牌的 `tid` 不是已配置的租户。                                                                    |
| `AUTH_SSO_NO_SUBJECT`        | 401    | 令牌不包含 `oid`。                                                                                 |
| `AUTH_SSO_NO_GROUP`          | 403    | 没有匹配的映射组，且未设置默认值。                                                                 |
| `AUTH_SSO_GROUP_OVERAGE`     | 403    | 用户所属组超过 150 个，且 Graph 回退未开启。                                                       |
| `AUTH_SSO_GRAPH_UNAVAILABLE` | 503    | Graph 查询失败。                                                                                   |
| `AUTH_SSO_DEACTIVATED`       | 403    | 影子密钥已在网关上被停用。                                                                         |
| `AUTH_SSO_UNAVAILABLE`       | 503    | 获取 JWKS 失败，OmniRoute 无法完成校验，因此此处特意不返回 401。                                   |
| `AUTH_SSO_PROVISION_FAILED`  | 503    | 无法创建影子密钥。                                                                                 |

Entra 故障绝不会降级为匿名访问，也绝不会回退到 API 密钥路径：自称为 Entra 令牌的 Bearer 凭据，会由 SSO 分支给出最终判定。

---

## 设计说明

**为何 `tid` 与 `aud` 分开校验。** 多租户应用注册也会为其他租户的用户签发带有我们受众的令牌。固定 `tid` 才使其成为单租户闸门。

**为何 SSO 分支必须先于 `x-api-key` 解析。** Claude Code 会把 `apiKeyHelper` 的值同时放入 `Authorization: Bearer` 与 `x-api-key` **两个**请求头中。如果 `extractUngatedClientApiKey()` 胜出，策略层就会收到原始 JWT，将其解析为“无密钥”，并静默丢弃用户所受的全部限制，这与 GHSA-2phc-xp22-9f56 中的认证与策略不一致属于同一问题。因此 `resolveSsoApiKeySecret()` 在 `src/shared/utils/apiKeyPolicy.ts` 的链中排在最前面。

**为何缓存判定结果。** 一旦 jose 持有了 JWKS，校验签名的开销很低；但如果每次请求都重新解析组并对账 `key_group_members`，就意味着每位用户每次请求都要执行一次 SQLite 写入。`src/server/authz/entra/evaluate.ts` 中的缓存把这一开销降低到大约每位用户每次辅助脚本刷新一次，并且缓存的生命周期绝不会超过令牌自身的 `exp`。
