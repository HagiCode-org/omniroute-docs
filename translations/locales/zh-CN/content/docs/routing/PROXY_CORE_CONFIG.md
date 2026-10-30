---
title: "本地代理核心配置"
---

# 本地代理核心配置（可选启用）

此订阅字段用于生成本地核心配置文件。留空（默认）表示不生成，同步行为与之前完全一致。

- 将 **Core config file** 设为所采用的 sing-box 配置的绝对路径（扩展名为小写 `.json`，例如 `/var/lib/omniroute/sing-box/config.json`）。
- 每次同步都会渲染该模型，并以原子写入、拒绝符号链接的方式（权限 0600），在已采用的文件**旁边**写入 `<path>.generated`。若主机上没有核心二进制文件，已采用的文件永远不会被修改。
- **经校验的替换（主机可选启用）。** 当主机环境将 `OMNIROUTE_PROXY_CORE_BINARY_PATH` 设为核心二进制文件的绝对路径（目前仅支持名为 `sing-box` 的文件）时，每次同步都会使用 `<binary> check -c <candidate>` 检查渲染后的文本（不经过 shell，超时 10 秒）。只有检查通过后，才会原子地替换已采用的文件，并将原文件保留为 `<path>.prev`。检查或替换失败时，已采用的文件保持不变，并写入 `<path>.generated` 且给出警告。二进制路径仅从环境变量读取：它绝不会存入数据库，管理 API 也会拒绝 `coreBinaryPath` 字段，因为该二进制文件会被执行（硬性规则 #15）。
- 只有标签以 `omniroute-` 开头的配置段归本功能所有：归属的条目会先被删除，再重新生成；其余内容（`dns`、`log`、`experimental/clash_api`、用户规则与出站，以及未知键）都会原样保留。目前仅渲染 sing-box。
- 遇到以下情况会拒绝且不写入：无法解析的 JSON、根节点不是对象，或文件中既没有 `inbounds` 也没有 `outbounds` 数组。来源格式不是 sing-box 的节点会被跳过并注明原因，而不会被转换。
- 失败与拒绝会以同步警告的形式呈现，绝不会导致同步失败。若更早的警告已占用同步状态，则跳过生成，并在服务端记录该次跳过。删除订阅会移除其 `<path>.generated` 副本，但绝不会删除已采用的文件（即运维人员正在使用的核心配置）；更改路径则会保留之前写入的 `.generated` 文件。
- 切换记录的最后一行会显示触发切换的拒绝原因；实时切换活动也可以在应用日志中的 [SelectorControl] 下查看。
- 若没有任何选择器组，模型将保持为空：节点既不会被渲染，也不会被列出。切换原因会以通用标签显示（quota、unreachable、transport、slow）。

  切换活动也可在应用日志中的 [SelectorControl] 下查看。

- 若没有任何选择器组，模型将保持为空：节点既不会被渲染，也不会被列出。切换原因会以通用标签显示（quota、unreachable、transport、slow）。

## 经校验替换后重新加载核心

只有两个条件同时成立时，替换才会重新加载核心：经校验的应用步骤报告了 `replaced`，并且渲染出的成员摘要发生了变化（成员标签相同但节点参数不同，不会重新加载；仅写入旁边的文件而不替换，同样不会重新加载）。

必须声明且仅声明一种重新加载渠道，并按以下顺序判断：

1. **Control API** — 订阅上设置了控制 URL，且当前核心提供 API 重新加载功能。只有兼容 Clash 的核心才符合条件（`PUT <controlUrl>/configs?force=true`，请求体为 `{"path": "<file>"}`）；sing-box 没有此类端点，需要通过下面的命令来重新加载。
2. **Command** — `OMNIROUTE_PROXY_CORE_RELOAD_COMMAND` 保存一个 JSON 参数数组，例如 `["/usr/bin/systemctl","--user","reload","sing-box"]`。它通过 `execFile` 运行，不经过 shell，超时时间为 30 秒，因此 `$(…)`、空格等特殊字符会原样保留在参数中。该值绝不会存入数据库，也不会通过 API 暴露。
3. **External observer** — 同一变量的值恰好为 `external`：不运行任何命令，由外部监视程序应用该文件。

若替换后没有声明任何通道，同步状态仍为 `ok`，并给出一条警告，列出上述三个选项（警告代码 CORE_RELOAD_UNDECLARED）。命令执行失败时，同步状态同样保持为 `ok`（警告代码 CORE_RELOAD_FAILED）。每个订阅的重新加载频率最多为每 60 秒一次；若第二次替换发生在该时间窗口内，则会在窗口截止时执行一次。删除订阅会清除其待处理状态。记录会提供 `coreReloadMode`（取值为 `api`/`command`/`external`/`undeclared`，实时计算，从不存储），并在界面中显示为“Applied by: …”。核心绝不会被自动重启。
