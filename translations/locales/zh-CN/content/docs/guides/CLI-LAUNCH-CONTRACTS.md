---
title: "共享的 CLI 启动与配置契约"
version: 3.8.51
lastUpdated: 2026-09-21
---

# 共享的 CLI 启动与配置契约

中立的 `config/cli-tools-manifest.json` 契约声明了规范 ID、别名、可执行文件候选、设置方案、模型参数和能力。
纯 Node 适配器（位于 `bin/cli/cli-manifest.mjs`）与 TypeScript 适配器（位于 `src/shared/constants/cliIntegrationManifest.ts`）读取的是同一个文件。
运行时、目录、配置、补全、生成器和后端注册由 `tests/unit/cli/cli-manifest-drift.test.ts` 一并检查。
已编入目录并不意味着工具可以被启动或配置。
特别是，5dive 仍然只能进行配置。

## 子进程环境与生命周期

`omniroute run`、`omniroute launch` 和 `omniroute launch-codex` 会继承操作系统与终端的兼容性白名单，并注入所选目标的凭据。默认情况下，无关的提供者和数据库机密不会被继承。`--inherit-env` 会显式恢复对父进程环境的完整继承；仅当所选的第三方进程确实需要这些值时才使用它。这是环境变量过滤，而不是操作系统沙箱：进程仍以调用者的文件系统权限运行。

中断和终止信号会转发给子进程。启动器会等待子进程的 close 事件，然后才删除临时配置。`OMNIROUTE_CHILD_SIGNAL_TIMEOUT_MS` 控制强制终止前的宽限期（默认 5000 毫秒）。

## Gemini 持久化设置

```bash
omniroute setup-gemini --remote https://omni.example --model provider/model --yes
omniroute configure gemini --model provider/model --yes
omniroute run gemini --model provider/model --dry-run --json
```

前两条命令会为所选的本地或远程服务器配置本机。设置过程会保留无关的 JSON 配置项，选择 Gemini API 密钥认证，并将端点地址和凭据写入一个私有的 `.gemini/.env` 文件。遇到无效的 JSON 时会直接拒绝，而不会覆盖它。端点 URL 必须为 HTTP(S)，且不得包含嵌入的凭据、查询参数或片段。试运行（dry-run）只打印路径，不打印凭据的值。

`GEMINI_CLI_HOME` 或 `--gemini-home` 用于选择持久化的主目录根路径。实际执行 `run gemini` 时，会创建并在之后删除其自身的临时主目录。两种模式都不会绕过 Gemini 的工作区信任检查。

## Codex 配置档

`configure codex` 会写入一个私有的 `<name>.config.toml`，其中包含模型及其 OmniRoute 提供者端点。凭据通过 `OMNIROUTE_API_KEY` 引用，绝不嵌入其中。启动命令会将所选模型设置在顶层的 `model` 键中，而不是 `model_providers` 之内。

独立的配置档文件是当前有文档记录的 Codex 契约；通过 `codex --profile <name>` 选择时，它们会覆盖在用户配置之上。参见 [官方配置档参考](https://learn.chatgpt.com/docs/config-file/config-advanced#profiles) 和 [OmniRoute Codex 指南](./CODEX-CLI-CONFIGURATION.md)。

## 隔离的命令执行

在显式设置 `DATA_DIR` 的情况下，设置 `OMNIROUTE_CLI_SKIP_DEFAULT_DATA_ENV=1` 可防止启动时回退到默认用户数据目录的凭据环境。这对隔离测试很有用。它不会禁用其他显式选择的环境文件。
