# 运行记录 audit1(存量术语表清理)

## 概览

- **命令**:`tr.mjs glossary audit --apply --run audit1`(`--source-root vendor/OmniRoute`),随后 `glossary merge --file --run audit1-fix` 放回一条误删。
- **对象**:`glossary/glossary.json` v5(50 条术语、19 条不翻译名称)。依据:5 篇已完成译文(`docs/guides/CLI-COMPANION.md`、`CLI-SMOKE-TESTS.md`、`CLI-MANUAL-MODELS.md`、`docs/README.md`、`getting-started/SELF_HOST_GUIDE.md`)。
- **起因**:v5 是质量闸门上线之前入库的,里面混有普通词和只在一篇文档里出现过一次的措辞。

## 结果

- 术语表 v5 → v6:**保留 16 条**、**移除 3 条**、**退回待定区 31 条**(其中 1 条是误删后放回的);不翻译名称 19 条全部保留。
- **移除**(从来就不是术语,`generic`):`command → 命令`、`file → 文件`、`variable → 变量`。
- **退回待定区**(`glossary/pending.json`,原因:已完成译文里"源文含该词且译文用了该译法"的文档不足 2 篇;证据文档一并保留):`admission-lanes`、`circuit-breaker`、`clipboard`、`compare-and-swap`、`connection-pin`(0 篇)、`connection-receipt`、`fusion-combo`、`guardrails`、`harness`、`homologation-suite`、`kiss-overlay`、`locale`、`loopback`、`manifest`、`manual-entry`、`manual-model`、`merge-queue`、`profile`、`prompt-compression`、`quota-sharing`、`readback`、`reasoning-replay`、`relay`、`route-guard`、`self-host`、`sentinel`、`session-affinity`、`smoke-test`、`stealth`、`synthetic-tool-call`、`web-cookie-provider`。后续任何一篇文档的原文含该词、译文用了同样的译法,就会自动重新升为正式术语。
- **保留**:`agent`、`channel`、`coding-agent`、`common-questions`、`context`、`dashboard`、`endpoint`、`factor`、`free-tier`、`model-catalog`、`prompt`、`provider`、`proxy`、`quick-start`、`table-of-contents`、`workload`。

## 误删与修复

- 第一次 `--apply` 把 `synthetic-tool-call` 判为 `too-long: a sentence fragment`(规则过宽:对任何 3 词以上且中间有小写词的短语生效,误伤全小写的多词术语)。已把该规则收窄为只对引导生效,并补了测试;这一条通过 `glossary merge --file` 经正常闸门放回待定区,证据文档与审计本应记录的一致(`CLI-MANUAL-MODELS.md`)。`changes.jsonl` 里保留了"移除"和"重新暂存"两条记录。
- 审计前的备份:`glossary.json`、`changes.jsonl`、`state/snapshot.json`(在会话草稿区 `glossary-before/`;`glossary.json` 与 `changes.jsonl` 在 git 里也有上一次提交的版本)。

## 需要人处理

- `inconsistent` 提示:`quick-start → 快速开始` 在 `docs/README.md` 里没有用该译法(该文档里只出现文件名 `QUICK-START.md`,不构成译法不一致,可忽略)。
- 待定区里仍有几条是 haiku 的措辞选择、未与上游核对:`stealth → 隐身`、`locale → 语言环境`、`profile → 配置档`、`homologation-suite → 一致性验证套件`。
