---
title: "质量证据契约"
version: 3.8.51
lastUpdated: 2026-09-21
---

# 质量证据契约

## 范围与负责人

发布验收报告是一个有版本的接口，而不是对绿色勾选标记的非正式汇总。其 schema 见 [`config/quality/release-acceptance.schema.json`](../../config/quality/release-acceptance.schema.json)。仓库负责人与质量闸门维护者负责该 schema 与归约器（reducer）。闸门维护者负责其命令结果。CI 与发布负责人使用这些结果；贡献者不对从基础分支或运行器继承来的失败承担责任。

生产者适配器位于 [`scripts/quality/release-acceptance/`](../../scripts/quality/release-acceptance/)。[`validate-release-acceptance.mjs`](../../scripts/quality/validate-release-acceptance.mjs) 会加载计划（plan）与清单（manifests），对其进行归约，校验报告 schema 并写出报告。其命令行接口接受 `--plan`、`--manifests` 与 `--out`。

当前的 `release-acceptance.yml` 工作流是一个使用夹具（fixtures）的**影子**集成。夹具运行成功并不能证明实际发布、其测试或其产物已通过。要真正强制执行发布准入，需要真实的生产者以及经过审查的必需闸门计划；本文档并不声称该推广已经完成。

## 版本 1 的语义

每个计划中的闸门实例由 `gate_id`、`suite_id`、`shard_index` 和 `shard_total` 标识。每个结果都必须属于计划中精确的 `tested_sha`、`run_id` 与 `run_attempt`。若某个符合 SHA 格式的字符串指向另一修订版本，则它本身并不足够。

| 观察结果                                                                | 解释                                                                                |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 一条与之匹配的必需 `PASS` 记录，退出码为零                              | 该闸门的合格证据，但仍需通过报告其余部分的校验                                      |
| 必需的 `FAIL` 且退出码为正                                              | 执行失败；但因果关系仍需与精确的基础版本进行比对                                    |
| 记录缺失、实例重复、状态未知或身份不匹配                                | 证据不完整或相互冲突；绝不得为 `VERIFIED`                                           |
| `PASS` 但退出码非零或缺失，或 `FAIL` 但退出码为零                       | 生产者结果前后矛盾；按基础设施错误处理                                              |
| 必需项被跳过或出现基础设施错误                                          | `UNVERIFIED`；除非另有一个有效的必需失败已经确立 `FAILED`                           |
| 必需闸门集合为空                                                        | `UNVERIFIED`                                                                        |

最终结论为 `VERIFIED`、`FAILED` 或 `UNVERIFIED`，CLI 分别以退出码 0、1 或 2 退出。这些取值描述的是校验证据，而非追究贡献者的责任。产物前置条件的失败会通过 `cause` 传播给其依赖项；基础设施的不确定性绝不能变成捏造的测试失败。基础设施错误使用 [验收状态定义](../../scripts/quality/release-acceptance/types.mjs) 中声明的状态值 INFRA_ERROR；这是结果状态，而不是环境变量。

## 时效性、兼容性与推广

新的候选 SHA 需要新的证据。仅因闸门名称相同，就将其他运行尝试的结果拼入当前报告是不允许的。历史报告仍保持其历史属性：绝不可为了使其看似为当前报告而改写其身份标识。当证据需要更新时，应重新执行受影响的闸门。

身份与一致性检查在不重命名字段的前提下，收紧了版本 1 原有的语义。曾输出不匹配身份、相互矛盾的退出码或重复结果的生产者，现在将得到 `UNVERIFIED`，而不再是错误的验证通过。应修复生产者并重放命令；不要为了保持绿色而移除校验。

破坏性的字段或语义变更，需要显式的 schema 版本，并与生产者和消费者一同进行迁移审查。新增字段同样需要审查：版本 1 会拒绝未知属性。应在影子模式下同时部署解析器与生产者的变更，运行有效与无效的夹具，然后单独审查任何必需的 GitHub 检查的启用。

schema 与归约器并非进程监管器。它们本身不提供心跳检测、后代进程清理、产物字节校验，也不包含完整的生产闸门清单。这些能力需要各自的执行与集成证据，之后才能宣布准入已完成。

## 回归证据

归约器、schema 与 CLI 由 [`release-acceptance-reduce.test.ts`](../../tests/unit/release-acceptance-reduce.test.ts)、[`release-acceptance-schema.test.ts`](../../tests/unit/release-acceptance-schema.test.ts) 与 [`release-acceptance-cli.test.ts`](../../tests/unit/release-acceptance-cli.test.ts) 覆盖。身份相关的回归用例涵盖：其他 SHA、运行与尝试、重复的 PASS 记录、未知的执行状态以及相互矛盾的退出码。既有的前置条件测试与分片测试仍属于验收边界的一部分。
