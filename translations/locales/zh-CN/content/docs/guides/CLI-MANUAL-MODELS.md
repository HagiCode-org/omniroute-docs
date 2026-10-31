---
title: "CLI 模型目录与手动元数据"
version: "3.8.51"
lastUpdated: "2026-09-21"
---

# CLI 模型目录与手动元数据

`omniroute models` 会先读取所选服务器的公开模型目录，包括其中的自定义条目和同步条目。`--output json` 与 `--output jsonl` 会返回所有匹配的行，不会出现表格截断提示。交互式表格最多显示 50 行。JSON 保留公开的上下文上限、模态、能力、服务器提供的模型来源（如有）以及 API 格式元数据；凭据和兼容性请求头不会输出。只有当公开 endpoint 返回 HTTP 404、405 或 501 时，才会 fallback 到旧版 `/api/models`；认证失败后不会回退。`omniroute completion refresh` 使用同一份目录。模型目录请求失败时返回非零退出码，并保留之前的补全缓存。Bash、Zsh 与 Fish 补全脚本都会列出手动模型子命令。

## 手动模型生命周期

这些操作使用现有的已认证 `/api/provider-models` 管理 API。它们遵循与其他 CLI 命令相同的全局 `--context` 与 `--base-url` 选择方式。请分别使用规范的提供者 ID 和该提供者的模型 ID；模型 ID 中包含斜杠是合法的。请使用已配置的管理上下文，不要把凭据放进命令参数。

```bash
omniroute models openai --output json
omniroute models manual openai
omniroute models add openai my-model --name "My model" --context-window 32768 --dry-run
omniroute models add openai my-model --name "My model" --context-window 32768
omniroute models edit openai my-model --context-window 65536
omniroute models edit openai my-model --clear-context-window
omniroute models remove openai my-model --dry-run
omniroute models remove openai my-model --yes
```

示例仅说明语法；请将提供者与模型 ID 替换为你的服务器上实际存在的条目。add 操作不会创建提供者连接。

- `add` 会拒绝已存在的自定义条目。可选的 `--max-output-tokens` 在创建时设置输出上限；`--api-format` 设置模型的 API 格式及与之匹配的 endpoint 元数据，例如使用 `embeddings` 而非 `chat`。
- `edit` 要求已存在手动条目。其上下文上限使用后端独立的手动上下文覆盖值；清除该值只会移除这一覆盖，不会移除原始输入上限或同步元数据。
- `remove` 需要 `--yes`，使用 `--dry-run` 时除外。它会请求 `resetOverride=true`，保留 ID 相同的同步条目。不提供批量删除。
- `--dry-run` 只执行已认证的预检读取，不执行写入或推理。
- 每次实际写入后都会 readback 手动目录。`persistenceVerified: true` 表示写入后观察到了请求的元数据；它并不表示模型能够生成文本或调用工具。`inferenceValidation` 始终为 `not-run`。
- readback 失败时返回非零退出码。写入可能已经生效，重试前请先检查服务器。本 CLI 不会对并发写入者进行串行化处理，现有 API 也不提供 compare-and-swap 事务。

## Test & Add：未实现

手动条目未经验证。没有 `--validate` 标志，这些命令也不会发起推理请求或执行工具。未来若实现 opt-in 的验证流程，必须将推理凭据与管理认证分开，并确定究竟是哪一个具体的提供者连接产生了全部三项证明：生成、绑定 nonce 的合成工具调用，以及合成工具结果之后的继续生成。这些证明不需要真正执行任何工具。

仅有现有的 `x-omniroute-connection` 连接固定（pin）并不足以作为证明 receipt。凭据选择可能会出于 cooldown、配额或排除账号等情况有意释放该固定，而且会话亲和性也参与选择。参见 `src/sse/services/auth.ts`，以及 `src/sse/handlers/chat.ts` 中的 `forcedConnectionId` 处理。在实现 Test & Add 之前，需要先确定严格固定（strict-pin）或可验证连接 receipt 的契约。随后，测试必须证明：在任何失败、被截断、超时或来自错误连接的响应之后，都不会发生持久化。这是一个独立的后端契约决定，并非手动 CRUD 所作的承诺。
