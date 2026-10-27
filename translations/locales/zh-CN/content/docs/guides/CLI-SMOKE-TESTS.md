---
title: 隔离的 CLI 冒烟测试
description: 使用一次性的本地响应验证已安装 CLI 的协议契约。
version: "3.8.51"
lastUpdated: "2026-09-22"
---

# 隔离的 CLI 冒烟测试

对已安装的 Aider、Goose、OpenCode、Qwen Code 或 Codex 可执行文件运行可选的测试工具:

```bash
node scripts/cli/smoke-cli-integrations.mjs --targets qwen,codex --json
```

`--bin-dir /absolute/path` 会前置一个已存在的二进制目录。该测试工具不会安装任何工具。缺失的可执行文件会产生 `HOLD-missing-binary`;超时会产生 `HOLD-timeout`。任何 FAIL 都会使进程以退出码 1 结束;HOLD 则以退出码 2 结束。所有目标都必须 PASS,退出码才为 0。

每个目标都通过 `omniroute run` 运行,由绑定在 `127.0.0.1` 上的一次性 HTTP 服务器提供服务,并使用固定的、非机密的哨兵凭据。HOME、XDG 目录、CLI 配置目录以及 OmniRoute 数据目录都是临时的。提供者凭据、代理变量、运行时加载器标志与已有配置均不会被继承。不需要、也不接受真实的上游凭据。

显式的 `--inherit-isolated-env` 测试工具选项会把 `--inherit-env` 转发给 `omniroute run`,使工具控制的元数据/更新抑制标志能够传到第三方子进程。该选项默认关闭,并且仍然从同一份窄白名单重建外层环境:它绝不会继承调用者的密钥、`NODE_OPTIONS`、`NODE_PATH`、`LD_PRELOAD`、`PYTHONPATH` 或代理设置。存储加密只在一次性数据目录内使用非机密的哨兵值。该工具还会选择 LiteLLM 的打包模型元数据以及无缓冲的 Python 输出;这些都是固定的测试控制项,而非调用者提供的环境变量值。该选项要求 CLI 实现 `run --inherit-env`;不支持的启动器会正常失败,不得计为成功的冒烟测试。

PASS 需要满足:子进程成功退出、出现预期的协议路径与模型、哨兵授权头、HTTP 响应完整结束,并且标准输出中出现一个不可预测的、由服务器生成的响应标记。该标记不会出现在提示词中,因此打印提示词或诊断信息无法满足测试。这证明的是已安装二进制文件的传输/响应契约,并不证明真实的提供者认证、工具执行、生产部署,或每一个 CLI 版本。

运行器会限制捕获输出的大小与执行时间。在 POSIX 系统上,它会创建独立的进程组,并在收尾时终止该组中残留的进程;Windows 目前返回 `HOLD-process-isolation`,因为尚未实现等效的后代进程清理。每个目标结束后,临时文件与服务器套接字都会被关闭。这是配置与进程隔离,**不是操作系统级的网络沙箱**:第三方二进制文件仍可能自行发出元数据或更新请求。只运行可信的已安装二进制文件;若要求零非回环流量,请使用外部受限的环境。

运行本工具的确定性测试,无需第三方二进制文件:

```bash
node --import tsx/esm --test tests/unit/cli/real-cli-smoke-harness.test.ts tests/unit/cli/real-cli-smoke-safety.test.ts
```

该模拟服务器支持 OpenAI Chat Completions 与 Responses API 的 JSON/SSE 格式。它从不把请求转发给提供者。依赖凭据的上游测试仍是单独的、需要主动开启的验证,不得报告为已被本工具覆盖。
