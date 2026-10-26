# 使用本地 Ollama 翻译 OmniRoute 文档

本指南说明如何使用仓库已有的 Ollama 翻译工具，将英文技术文档翻译为简体中文，包括运行评估、翻译单篇短文、维护术语及检查输出。默认模型为 `hy-mt2:1.8b`，默认服务地址为 `http://127.0.0.1:11434`。

当前工具用于生成和评估翻译初稿。它已经实现术语参考、背景信息、代码保护、格式检查，以及整篇文档的分块、换种子重试和术语违规检查；全站批量翻译和发布接入尚未实现。

## 1. 确认运行环境

下面的命令均在 `repos/omniroute-docs` 仓库根目录执行，使用项目采用的 Node.js 22。当前环境已安装模型，无需增加技能配置或额外依赖。

```sh
node --version
ollama list
```

确认模型列表包含 `hy-mt2:1.8b`。如果服务连接失败，先启动本机 Ollama 服务；已有服务运行时无需再启动一个实例。

工具默认连接本机服务。只有服务地址不同时才需要使用已有的 `OLLAMA_HOST` 环境变量，正常运行不需要传入命令行参数。

## 2. 运行现有翻译评估

```sh
node scripts/evaluate-ollama-translation.mjs
```

脚本读取固定上游版本的 14 组样本，依次执行三种方案，共 42 次调用：

1. 默认翻译提示词。
2. 术语参考提示词。
3. 术语参考、背景信息与程序保护组合。

终端显示每组结果的 `structure OK` 或 `REVIEW`，并打印日志路径。完整记录逐条写入 `docs/translation-evaluations/ollama-improved-<timestamp>.jsonl`，不会覆盖之前的记录。日志包含：

- `metadata`：模型、参数、术语表、源文、源文哈希及全站工作量。
- `run`：实际请求、原始响应、恢复后的译文、格式检查和耗时。
- `summary`：各方案完成数量、格式通过数量及请求错误数量。

`REVIEW` 表示格式校验或调用存在问题。即使脚本退出码为零，也要检查每条记录的 `accepted_structure`：当前脚本仅在发生调用异常时设置非零退出码，格式拒绝通过日志报告。

这个命令执行抽样对比，不会启动全站翻译，也不会更新站点文章或翻译审核基线。

## 3. 翻译自己的短文或文档片段

复用 [translateWithOllama](../scripts/ollama-translation.mjs)，即可默认启用术语、背景和程序保护。下面的例子读取一篇较短的英文故障转移文档，将译文打印到终端：

```sh
node --input-type=module - <<'JS'
import { readFile } from 'node:fs/promises';
import { translateWithOllama } from './scripts/ollama-translation.mjs';

const source = await readFile(
  'vendor/OmniRoute/docs/OMNIROUTE_PROVIDER_FAILOVER.md',
  'utf8',
);
const result = await translateWithOllama(source);

if (!result.accepted_structure || !result.output) {
  console.error(JSON.stringify({
    error: result.validation_error,
    checks: result.checks,
  }, null, 2));
  process.exitCode = 1;
} else {
  console.log(result.output);
}
JS
```

将 `source` 换成需要翻译的英文片段即可。`translateWithOllama` 本身不分块；整篇文档请用下面的脚本。

调用返回的主要字段如下：

- `output`：恢复代码和链接后的译文；无法恢复保护标记时为 `null`。
- `accepted_structure`：是否通过当前格式检查，调用者必须判断此字段。
- `validation_error`、`checks`：格式失败原因与各项检查结果。
- `request`、`response`：实际请求和原始 Ollama 响应，便于复核。
- `terms`、`protected_markers`：本次使用的术语和保护内容。
- `wall_seconds`：调用耗时。

部分结构变化会保留 `output`，同时返回 `accepted_structure: false`，因此不能只判断译文是否为空。HTTP 错误、超时、空响应或未正常结束的生成会抛出异常。

`accepted_structure: true` 只证明通过了当前格式检查。发布前仍需对照源文确认术语、条件、否定和技术行为。

### 整篇文档

```sh
node scripts/translate-document-ollama.mjs vendor/OmniRoute/README.md docs/translation-evaluations/<目录名>
node scripts/evaluate-translated-document.mjs vendor/OmniRoute/README.md <目录名>/README.zh-CN.md [上游中文版]
```

翻译脚本按空行把文档拆成块：代码块、徽章图、纯标记块（国旗图标、贡献者链接表）不交给模型；其余正文按约 300 词合并成分块，过大的表格按行拆分并重复表头。每个分块最多用 3 个种子重试，仍失败则逐块再试，最后保留英文并写入日志。输出目录包含 `README.zh-CN.md`、`summary.json` 和逐次尝试的 `translation-log.jsonl`。输出目录不能已存在日志文件。

评估脚本对整篇译文运行结构检查、统计术语落地、禁用译法和仍为英文的正文块；传入上游中文版时一并输出对照。这些都是机器检查，语义仍需对照英文校审。保留英文的块、HTML 表格中的文字和 frontmatter 需要另行处理。

## 4. 使用的提示词与推理参数

默认模板采用以下形式：

```text
将以下文本翻译为 简体中文，注意只需要输出翻译后的结果，不要额外解释：

{source_text}
```

术语模板采用 Hy-MT2 的参考译法格式，而非通用聊天助手角色设定：

```text
参考下面的翻译：
API key 翻译成 API 密钥
provider 翻译成 提供商
cooldown 翻译成 冷却期

将以下文本翻译为 简体中文，注意只需要输出翻译后的结果，不要额外解释：

{source_text}
```

改进方案在术语模板之前添加匹配术语的 `【背景信息】`，并在待译文本之前加入保护标记规则。例如，提供商冷却的背景会说明“提供商进入冷却期，后续请求暂时跳过它”。这些信息用于消歧，不应成为译文新增事实。

请求仅包含 `user` 消息，没有默认 system 提示词。当前 1.8B 模型的实际 Ollama 参数为：

```json
{
  "temperature": 0.7,
  "top_p": 0.6,
  "top_k": 20,
  "repeat_penalty": 1.05,
  "num_predict": 4096,
  "num_ctx": 8192,
  "seed": 42
}
```

`num_predict` 是输出上限，对应推荐推理配置中的 `max_tokens`；`num_ctx` 是上下文窗口设置，两者不是同一个参数。固定随机种子用于减少比较干扰，不保证逐字复现结果。其他模型规格未在本仓库中实测。

如需做对比，可在函数第二个参数中设置 `terminology: false`、`protect: false` 或 `background: false`。`language: 'en'` 仅切换提示词语言，目标语言仍为简体中文。翻译到其他语言需要扩展目标语言参数、对应术语表并重新评估，不能只修改术语文件的语言标签。

## 5. 维护术语表

术语保存在 [terminology.en-zh-CN.json](./translation-evaluations/terminology.en-zh-CN.json)。新增条目示例：

```json
{
  "source": "access token",
  "aliases": ["access tokens"],
  "target": "访问令牌"
}
```

字段含义：`source` 为英文术语，`aliases` 为可选别名，`target` 为参考译法；可选的 `contextAny` 限定使用语境，`background` 提供领域解释，`avoid` 列出禁用译法（只用于译后检查，不发给模型）。`source` 与 `target` 相同的条目用于产品名和功能名（如 `Combo`、`Claude Code`），防止被误译。

维护时遵循以下规则：

0. 与上游已有简体中文保持一致：先统计上游 `docs/i18n/zh-CN` 的现有用法再定译法（例如 provider 用“提供者”，token 用“令牌”，dashboard 用“仪表板”）。较长的词优先匹配，`API key` 不会同时选中 `key`。

1. 区分 `API key`（API 密钥）、`access token`（访问令牌）和 `input token`（输入词元），不要给所有 `token` 设置同一种译法。
2. 使用具体术语及必要语境，避免无条件把配置中的 key 也译成密钥。现有规则会排除 `per-key` 对独立 key 的匹配。
3. 用背景解释含义，不把样本答案或额外事实塞进术语表。只匹配正文中实际出现的术语，代码、URL 和 HTML 属性不参与选择。
4. 修改后执行专项测试，并重新运行难点样本；术语参考可能改善一个概念，同时干扰另一个概念。

语境匹配是启发式规则。一个段落同时涉及认证密钥、配置键与计量词元时，仍需人工判断。

## 6. 代码保护与失败处理

工具在调用模型前，将代码块（含注释）、行内代码、链接目标、HTML 标签及属性、常见变量占位符和 frontmatter 替换为唯一标记，例如 `⟦P0000⟧`。模型翻译可见文字后，程序将原内容逐字恢复。

行内标记允许随中文语序换位；代码块和 HTML 标签保持原顺序。标记丢失、重复、出现未知标记或固定结构顺序变化时，恢复失败。不要猜测缺失内容后当作成功翻译，应缩小片段重试或转人工处理。

当前检查包括代码、链接目标、HTML 标签、标题层级、表格形状及 frontmatter。它不是完整 CommonMark/MDX 解析器，尚未覆盖所有嵌套列表、缩进代码块、脚注和复杂模板语法，也没有替代最终页面渲染检查。

frontmatter 整体保留，因此标题和描述需要另设结构化翻译步骤；不能把保留英文元数据的结果当作完整中文页面。

## 7. 速度、质量与全量处理

在 [2026-10-25 的复测](./translation-evaluations/ollama-en-zh-cn-improved-2026-10-25.md)中，改进方案约处理 1,250 个英文正文词/分钟，输出约 2,400 个汉字/分钟。当前站点 164 篇文章约有 22.2 万英文正文及标题词，纯生成线性估算约 3 小时；包含分块、自动校验和失败重试时，建议预留 4–6 小时，人工校审另计。

这次 14 组难点样本中，8 组可作待校对初稿、5 组需要技术修正、1 组因丢失标记被拦截。`13/14` 是格式通过数，不是翻译正确率；样本判定也不能外推全站逐句准确率。

正式全量处理应先实现按段分块与失败记录，再校审路由优先级、冷却对象、认证、配额、状态机及范围上下界。约每块 500 个英文词可作为初始分块目标，但应结合模型输入、输出预算与 Markdown 边界调整。

站点文章由固定版本的 `vendor/OmniRoute` 导入。审核后的译文需要通过上游翻译内容与子模块版本更新接入，确认真实审核后再更新翻译基线；不要直接修改生成的 `src/content/docs/` 页面，也不要自动把机翻记录标成已审核。

## 8. 验证与排查

```sh
node --test test/ollama-translation.test.mjs
```

排查时按错误处理：

- 无法连接或 HTTP 错误：检查本机 Ollama 服务、地址与模型是否可用。
- `Incomplete Ollama translation`：响应为空或生成没有正常结束；检查原始响应和输出预算，必要时缩小片段。
- `Protected markers ...` 或 `Markdown structure changed`：检查 `validation_error`、原始响应与保护标记，缩小片段或转人工，不绕过校验。
- `Upstream revision changed` 或 `Evaluation source changed`：源文已与固定评估样本不同，先复核源文并有意识地更新样本记录，不跳过哈希检查。

相关资料：[工具使用与实现说明](./translation-evaluations/README.md)、[首次评估](./translation-evaluations/ollama-en-zh-cn-2026-10-25.md)、[改进复测与耗时统计](./translation-evaluations/ollama-en-zh-cn-improved-2026-10-25.md)。
