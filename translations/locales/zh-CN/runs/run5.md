# 运行记录 run5(真实仓库:带表格与代码块的路由文档,术语自动入库)

## 概览

- **runId**:run5(2026-10-30;手动试跑)
- **流程**:`scan` → `next --run run5 --doc docs/routing/DETERMINISTIC_ROUTING.md` → haiku 级 subagent 翻译 → `check` → 主会话复核并统一用词 → `finalize`(**术语自动入库,没有再调 `glossary merge`**)
- **源版本标识**:`vendor/OmniRoute` 子模块 HEAD `a58000c7685f4091c7a6fd8ddf3ebce7d2ec67c3`
- **调用方覆盖**:只处理 1 篇;`COMMIT=false`
- **锁**:已获取并释放。

## 本次结果

| 文档 | 字节数 | 状态 | 备注 |
| --- | --- | --- | --- |
| `docs/routing/DETERMINISTIC_ROUTING.md` | 6215 | done | 6.2 KB,不分块;subagent 0 轮重试一次通过硬校验;主会话复核后统一一处用词(见下) |

- 完成 1 / 带标记 0 / 失败 0 / 跳过 0。
- 结构核对(脚本之外的独立计数):标题 9/9、列表项 12/12、表格行 8/8、围栏行 4/4、分隔线 2/2;2 个代码块逐字节一致;文档没有链接,也没有文内锚点。
- 模型 haiku,subagent 用时约 85 秒、约 85k token(含读取与提示,不区分输入输出)。

## 复核发现

- **跨文档用词不一致**:subagent 把 *breaker* 译成"熔断器",而上一篇 `docs/README.md` 已落盘的是"断路器"。上游简体中文译文里"熔断"136 处、"断路器"60 处,没有定论,所以以内部一致为准,统一为"断路器"(共 3 处替换,`cooldown breaker` 译为"冷却断路器"),重新校验通过。

## 术语表

- 9 个候选(strategy engine、cooldown breaker、fallback chain、route decision、pinned provider、cost-priority、latency-aware、blacklist、whitelist)**全部进入待定区**,没有被拒绝、没有撞车;`glossary.json` 保持 v6 不变,待定区 31 → 40 条。
- 没有待定项被"靠使用确认"升级:待定区里已有的 31 个词在这篇原文里都没有出现(这篇的术语与之前几篇基本不重叠),所以这一次没有观察到升级。
- 待人裁决:`pinned provider → 固定的提供者`("的"字短语,作为术语不太像)。

## 待办全貌

- 发现 164 篇;148 篇外部已有译文;16 篇待翻译;本次后 `fresh` 6、`new` 10;无 `stale` / `drift` / `interrupted` / `blocked`。
