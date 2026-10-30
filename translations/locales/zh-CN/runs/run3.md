# 运行记录 run3(试跑:带表格与代码块的长文档,强制分块)

## 概览

- **runId**:run3(2026-10-30;手动试跑)
- **流程**:`scan` → `next --run run3 --doc docs/getting-started/SELF_HOST_GUIDE.md --chunk-bytes 4096` → haiku 级 subagent 逐块翻译(3 块)→ `assemble` → 主会话复核并统一用词 → `finalize` → `glossary merge`
- **源版本标识**:`vendor/OmniRoute` 子模块 HEAD `a58000c7685f4091c7a6fd8ddf3ebce7d2ec67c3`
- **调用方覆盖**:只处理 1 篇;`COMMIT=false`;`--chunk-bytes 4096`(该文档 10.4 KB,低于默认的 12 KB 分块阈值,为验证分块在复杂结构上的表现而调低)
- **锁**:已获取并释放。

## 本次结果

| 文档 | 字节数 | 状态 | 备注 |
| --- | --- | --- | --- |
| `docs/getting-started/SELF_HOST_GUIDE.md` | 10462 | done_flagged | 3 块(3.8 / 3.3 / 3.3 KB),subagent 重试 1 轮后通过硬校验;主会话统一两处用词后重新校验通过 |

- 结构核对(脚本之外的独立计数):链接 16/16、标题 18/18、列表项 26/26、有序项 6/6、表格行 9/9、围栏行 26/26、分隔线 16/16、HTML 标签 30/30、段落块 90/90;13 个代码块逐字节一致。行数 328 → 272 是因为源文把 22 个段落按约 80 列硬换行,中文合并成了整段。
- 锚点:在能解析到 `github-slugger` 的目录(`repos/docs`)里重跑校验,文内锚点 `#容器资源配置` 通过,无任何软标记。
- 模型 haiku,subagent 用时约 139 秒、约 108k token(含读取与提示,不区分输入输出)。

## 复核发现

- **跨文档不一致**(机器校验发现不了):subagent 把 *free tier* 译成"免费套餐"、*sidecar* 译成"边车",而上一篇 `docs/README.md` 用的是"免费层"和英文 `sidecar`。上游简体中文译文里"免费层"130 处、"免费套餐"48 处;`sidecar` 英文 98 处、"边车"38 处。已统一为"免费层"和英文 `sidecar`(4 处替换);"SaaS ... 套餐档位"里的"套餐"指 plan tier,保留。
- agent / proxy 的区分这次一次就对(任务里写明了"agent=智能体,proxy=代理"),说明术语表 + 一句规则足够约束 haiku。

## `flags`

- `cross-doc-anchor`:指向 `DOCKER_GUIDE.md` 的三个锚点(`#docker-compose-with-caddy-https-auto-tls`、`#cloudflare-quick-tunnel`、`#available-profiles`)保持源文原样;待 DOCKER_GUIDE 译成后需核对其标题锚点(上游已有 DOCKER_GUIDE 简体中文译文,外部负责,不由本流程翻译)。

## 术语表

- v4 → v5:新增 11 条(配置档、自托管、端点、提示词、回环地址、编码智能体、融合组合、网页 Cookie 提供者、免费层、sidecar 记为不翻译、覆盖文件);无 `conflicts`,无 `collisions`。

## 待办全貌

- 发现 164 篇;148 篇外部已有译文;16 篇待翻译;本次后 `fresh` 5(带标记 2)、`new` 11;无 `stale` / `drift` / `interrupted` / `blocked`。

## 需要人处理

- 待人裁决(来自 run2、run3 的 haiku 选择,未与上游全部核对):`stealth → 隐身`、`homologation suite → 一致性验证套件`、`locale → 语言环境`、`profile → 配置档`(上游多用"配置文件"表示 config file,"配置档"在上游 0 处)。
