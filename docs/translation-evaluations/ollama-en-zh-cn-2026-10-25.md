# 本地 Ollama 英文 → 简体中文翻译评估

评估日期：2026-10-25（America/Los_Angeles）。

**结论：当前本地 `hy-mt2:1.8b` 适合生成中文初稿；复杂技术语义仍有实质错误，不能仅凭格式检查通过就直接发布。** 普通操作步骤较流畅，术语、重试条件、熔断状态、配置指向和内存准入规则需要校审。加入约束明显改善格式保留，但也出现把 API 密钥译成“词元”的退化。

完整原文、逐次译文、提示词、参数、模型摘要、耗时及逐项评价保存在[原始评估记录](./ollama-en-zh-cn-2026-10-25.json)。本次只新增评估材料，站点文章、生成内容、上游子模块和翻译审核基线均未改动。

## 环境与取样

- 服务：本地 `http://127.0.0.1:11434`，Ollama `0.40.11`。
- 模型：`hy-mt2:1.8b`，`1.8B`，`Q8_0`；摘要 `2a4269484c0a3411a2001a9989a51a0dc26c321fd9e874f068fcb0c16f942077`。
- 运行时观测：`ollama ps` 显示 `100% GPU`、约 `2.2 GB`、实际上下文 `4096`。本次没有测量冷启动。
- 英文来源：`vendor/OmniRoute`，固定版本 `a58000c7685f4091c7a6fd8ddf3ebce7d2ec67c3`。
- 样本：12 组，每组分别使用普通提示词和约束提示词，合计 24 次独立会话调用；没有前序聊天历史。
- 覆盖安装命令、链接、操作步骤、API 密钥说明、完整短篇故障转移文档、路由规则、YAML、表格、状态码、长技术段落及 HTML 导航。

用户未指定模型和待译文本，因此选用当前唯一已安装模型，并以所选仓库英文文档作为评估材料。

## 比较方法

普通提示词：

```text
Translate the following segment into Simplified Chinese, without additional explanation.
```

约束提示词：

```text
将以下英文技术文档翻译为简体中文，只输出译文，不添加解释，不遗漏或新增事实。保留 Markdown 和 HTML 结构，代码块（包括注释）、行内代码、URL、链接目标、配置键名、模型名、品牌名和数字必须逐字不变。只翻译自然语言正文、标题、表格文字和链接显示文字。术语统一：provider=提供商，fallback=回退，failover=故障转移，circuit breaker=熔断器，cooldown=冷却期，streaming=流式传输，pinned provider=固定指定的提供商，token=词元。不要改变条件、否定、优先级、状态码与单位。
```

两种提示词均追加两个换行和完全相同的英文原文。保持模型采样参数一致：

```json
{
  "temperature": 0.7,
  "top_k": 20,
  "top_p": 0.6,
  "repeat_penalty": 1.05,
  "num_ctx": 4096,
  "num_predict": 2048,
  "seed": 42
}
```

采样参数与模型现有设置一致，额外固定随机种子和输出上限。固定种子用于减少比较干扰，不保证跨硬件或版本逐字复现。

语义评价由本会话执行助手对照英文完成，关注事实遗漏、条件与否定、术语、配置含义和中文可读性；没有独立人工金标准或标准化质量分数。表中的“可用初稿”仍然需要校对。

## 格式保留与速度

分母仅包含实际具备相应结构的样本。代码块比较包括注释，行内代码比较保留重复次数，链接比较目标地址，HTML 比较标签及属性，表格比较行数及每行管道数，标题比较层级顺序。

| 检查项 | 普通提示词 | 约束提示词 |
| --- | --- | --- |
| 代码块逐字保留 | 1/2 | 1/2 |
| 行内代码逐字保留 | 4/10 | 10/10 |
| Markdown 链接目标保留 | 2/2 | 2/2 |
| HTML 标签与属性保留 | 1/1 | 1/1 |
| 表格行列形状保留 | 2/2 | 2/2 |
| 标题层级保留 | 5/8 | 8/8 |
| 样本内上述全部检查通过 | 4/12 | 11/12 |
| 12 次调用总耗时 | 32.684 秒 | 37.080 秒 |
| 单次耗时中位数 | 1.835 秒 | 1.856 秒 |
| 生成阶段吞吐量 | 80.80 tokens/秒 | 80.68 tokens/秒 |

吞吐量按总输出 token 数除以总生成耗时计算，不含提示词计算和加载。24 次响应均以 `done_reason: stop` 结束，未触及输出上限；最长提示词为 675 tokens。上述速度仅代表这台机器的预热后、顺序执行、小样本结果。

**11/12 的格式通过率不代表 11/12 的翻译正确率。** 约束组仍有 5 个样本需要实质技术修正，其余 7 个可作为待校对初稿。结构检查未覆盖完整 Markdown 渲染、所有数字与单位的语义、章节锚点或跨段术语一致性。

## 逐项评价

以下结论针对约束提示词；普通提示词的对应问题也记录在 JSON 中。

| 样本 ID | 内容 | 判断 | 主要依据 |
| --- | --- | --- | --- |
| `install` | 安装步骤与镜像标签 | 可用初稿 | 命令、链接、SemVer 和不跟踪 main 的事实保留；中文仍略生硬。 |
| `ui_steps` | Kiro 连接步骤 | 可用初稿 | 顺序、免信用卡、无需 API 密钥等信息正确。 |
| `key_warning` | API 密钥用途 | 必须修正 | key 被译成“词元”，改变了认证对象的概念。 |
| `failover` | 故障分类与熔断恢复 | 必须修正 | 对限流和超时失败重试，被写成重新执行限流和超时处理。 |
| `routing_overview` | 确定性路由说明 | 可用初稿 | 普通组的“可预测”被修正为“确定性”。 |
| `yaml_config` | YAML 配置与环境变量 | 必须修正 | 配置指向关系不准确，且代码注释没有按要求保留。 |
| `strategy_table` | 策略表格与优先级 | 可用初稿 | 成本字段、过滤顺序及优先级保留；“幸存者”等表达需润色。 |
| `pinned_provider` | 固定指定提供商 | 可用初稿 | 400 失败条件、首选与回退关系保留。 |
| `fallback_errors` | 失败回退与冷却 | 必须修正 | 把提供商进入冷却期写成后续请求进入冷却期。 |
| `troubleshooting_table` | 错误信息与处理方法 | 可用初稿 | 代码中的双引号恢复；Node modules 不宜译为“节点模块”。 |
| `memory_budget` | 内存预算与准入控制 | 必须修正 | shed 被译为“释放”，预算钳制范围被概括为上限。 |
| `html_navigation` | HTML 导航 | 可用初稿 | 标签、href 和产品用语 Combos 保留。 |

## 需要关注的实际译例

| 英文原意 | 模型实际表现 | 应修正为 |
| --- | --- | --- |
| `create a new key` | 约束组：“创建一个新的词元” | “创建一个新密钥”。词元是计量单位，不应替换 API 密钥。 |
| `retries rate limits and timeouts` | 普通组：“对重试次数和超时时间进行限制”；约束组：“重新执行速率限制和超时处理” | “对限流或超时导致的失败进行重试”。 |
| `Circuit states are closed, open, and half_open` | 普通组：“连接状态包括‘关闭’、‘开启’和‘半开启’”，并移除了原始标识符 | “熔断器状态为 `closed`、`open` 和 `half_open`”；使用熔断语义解释，不应当成连接开关。 |
| `a broken primary also cools down for subsequent requests` | 约束组：“后续请求也会进入冷却期” | “故障主提供商也会进入冷却期，供后续请求路由时排除”。 |
| `An inflight_bytes_budget shed is temporary contention` | 约束组：“inflight_bytes_budget 的释放属于暂时性竞争” | “因 `inflight_bytes_budget` 而拒绝请求属于暂时性资源竞争，仍可重试”。 |
| `model: "auto"` | 普通组把左侧 ASCII 双引号改成弯引号：`model: “auto"` | 代码应逐字保留，否则复制后可能无法解析。 |

约束提示词中的 `token=词元` 与 key 的误译同时出现，但本次没有做消融实验，不能据此确定因果关系。这说明术语约束也必须检查实际输出。

两组 YAML 都修改了注释，违反约束组“包括注释逐字保留”的要求。其中普通组将有界冷却说明写成“长期被排除在外”，约束组仍误解环境变量与配置文档之间的关系。本样本去除注释后，YAML 的非空运行配置行与原文一致；因此没有把注释变化计作键值遭破坏。

## 使用建议与评估边界

1. 将该模型用于初稿生成，发布前校审限流与重试、状态机、认证、配置指向、优先级和资源预算等段落。
2. 用程序提取并恢复代码块、行内代码和链接目标，再检查恢复结果；本次实测表明，仅写入提示词不足以确保逐字保留。此保护流程尚未在本次评估中实施或验证。
3. 建立区分 API key、认证 token 和计量 token 的术语表，并根据上下文区分熔断器状态与连接状态；术语表本身也需要回归检查。
4. 下一轮使用未参与提示词调整的整篇简体中文文档作为验证集，检查遗漏、渲染、锚点和跨段术语，再扩展其他语言。

本轮样本为有目的选择，每种提示词只运行一次；除一篇 9 行短文外，以节选为主。没有验证整站、长上下文、其他语言或跨模型优劣，没有计算 BLEU/COMET。模型元数据报告的最大上下文不代表本次运行上下文，实际只使用 4096。

上游原文 `The five strategies` 下实际列出六种策略；译文延续了这个源文问题，本次没有把它计为模型新增错误。

## 复现

在 `repos/omniroute-docs` 内执行下面代码，使用记录中的同一模型、提示词、原文和参数重新调用本地服务。结果输出到终端。重跑结果可能受运行版本与硬件影响。

```sh
python3 - <<'PY'
import json
import urllib.request
from pathlib import Path

record = json.loads(Path(
    'docs/translation-evaluations/ollama-en-zh-cn-2026-10-25.json'
).read_text())
for sample in record['samples']:
    for variant, prefix in record['prompts'].items():
        payload = {
            'model': record['model'],
            'messages': [{'role': 'user', 'content': prefix + sample['source']}],
            'stream': False,
            'options': record['options'],
        }
        request = urllib.request.Request(
            record['endpoint'] + '/api/chat',
            data=json.dumps(payload).encode(),
            headers={'Content-Type': 'application/json'},
        )
        with urllib.request.urlopen(request, timeout=180) as response:
            result = json.load(response)
        print(json.dumps({
            'sample': sample['id'], 'variant': variant, 'response': result,
        }, ensure_ascii=False), flush=True)
PY
```
