# 运行记录 run6(真实仓库:与已有文档术语重叠的文档,验证"靠使用确认")

## 概览

- **runId**:run6(2026-10-30;手动试跑)
- **流程**:`scan`(统计各待办文档与待定/正式术语的重叠,选重叠最多的)→ `next --run run6 --doc docs/routing/SELF_HOSTED_OPENAI_ENTRY.md` → haiku 级 subagent 翻译(任务里带 `glossary.pending` 两条建议)→ `check` → 主会话复核并统一一处用词 → `finalize`(术语自动入库)
- **源版本标识**:`vendor/OmniRoute` 子模块 HEAD `a58000c7685f4091c7a6fd8ddf3ebce7d2ec67c3`
- **调用方覆盖**:只处理 1 篇;`COMMIT=false`;锁已获取并释放。

## 本次结果

| 文档 | 字节数 | 状态 | 备注 |
| --- | --- | --- | --- |
| `docs/routing/SELF_HOSTED_OPENAI_ENTRY.md` | 3573 | done | subagent 0 轮重试一次通过硬校验;主会话统一一处用词后重新校验通过 |

- 结构核对(脚本之外的独立计数):链接 1/1、标题 10/10、列表项 9/9、有序项 3/3、围栏行 4/4;2 个代码块逐字节一致。模型 haiku,约 43 秒、约 97k token。

## 术语:靠使用确认(本次重点)

- 任务里带了两条待定建议:`loopback → 回环地址`(之前只有 `SELF_HOST_GUIDE.md` 一篇用过)、`blacklist → 黑名单`(之前只有 `DETERMINISTIC_ROUTING.md` 一篇用过)。
- haiku **没有**在 `termCandidates` 里重复报告它们,但译文里沿用了这两个译法;`finalize` 据此判定"原文含该词、译文用了该译法",两条各增加 1 篇文档的确认,达到 2 篇门槛,**自动升为正式术语**:术语表 v6 → v7(16 → 18 条),`changes.jsonl` 里是 `confirm … by use` 与 `promote`。
- 本篇 3 个新候选(`gateway → 网关`、`self-hosted → 自托管`、`provider adapter → 提供者适配器`)进入待定区;无拒绝、无撞车;待定区 40 → 41 条(升级 2 条、新增 3 条)。

## 发现并修复的缺口

- 升级后,早先作为证据的两篇文档(`SELF_HOST_GUIDE.md`、`DETERMINISTIC_ROUTING.md`)的 `termTargets` 里没有这两个新正式术语,以后改了它们的译法,这两篇不会被判为 `drift`。已修:升级时把证据文档一并登记(技能脚本已改并有测试);真实快照里这两篇的缺失登记用 `statectl snapshot write` 补上(补之前的快照备份在会话草稿区 `snapshot-before-fix.json`)。

## 复核发现

- 一句话里 `fallback / cooldown / cost / latency / blacklist` 前四个留了英文、只有 `blacklist` 译了,而上一篇 `DETERMINISTIC_ROUTING.md` 把这几个概念统一为"回退/冷却/成本/延迟";已统一为"回退、冷却、成本、延迟与黑名单"。

## 待办全貌

- 发现 164 篇;148 篇外部已有译文;16 篇待翻译;本次后 `fresh` 7、`new` 9;无 `stale` / `drift` / `interrupted` / `blocked`。

## 需要人处理

- 待定区里 `self-host`(来自 SELF_HOST_GUIDE)与 `self-hosted`(本篇)是同一概念的两种词形,译法都是"自托管";若两者都升级,第二个会因"同一译法对应两个源词"被撞车规则拦下。需要时可在术语表里把它们合并为一条。
