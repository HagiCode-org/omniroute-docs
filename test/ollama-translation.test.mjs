import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { GLOSSARY_URL, OLLAMA_OPTIONS, buildPrompt, checkStructure, protectMarkdown, selectTerms, translateWithOllama } from "../scripts/ollama-translation.mjs";

const glossary = JSON.parse(await readFile(GLOSSARY_URL, "utf8"));

test("protects code, nested link targets, HTML attributes and template variables while leaving prose editable", () => {
  const source = [
    '---', 'title: "Metadata"', '---', '', '# Heading', '',
    'Use `model: "auto"` and ``literal ` tick``.', '',
    '````yaml', '# Keep this comment', 'value: ```', '````', '',
    '[Guide](https://example.com/a_(b) "Title") and <a href="/a?x=>">Visible text</a>.',
    'Keep {{name}}, ${value}, %s and <https://example.com>.',
    '[Other][ref]', '[ref]: https://example.com/path',
  ].join('\n');
  const protectedText = protectMarkdown(source);
  assert.equal(protectedText.restore(protectedText.text), source);
  assert.ok(protectedText.text.includes('Visible text'));
  assert.ok(!protectedText.text.includes('Keep this comment'));
  assert.ok(!protectedText.text.includes('https://'));
  const translated = protectedText.restore(protectedText.text.replace('Visible text', '可见文字').replace('# Heading', '# 标题'));
  assert.ok(translated.includes('href="/a?x=>"'));
  assert.ok(translated.includes('model: "auto"'));
  assert.ok(translated.includes('可见文字'));
  assert.ok(Object.values(checkStructure(source, translated)).every(Boolean));
});

test("rejects lost/repeated/invented markers while permitting natural inline word order", () => {
  const protectedText = protectMarkdown('A `first` then `second`.');
  const [first, second] = protectedText.markers.map((m) => m.marker);
  for (const output of [
    protectedText.text.replace(first, ''),
    protectedText.text + first,
    protectedText.text + '⟦P9999⟧',
  ]) assert.throws(() => protectedText.restore(output), /Protected markers/u);
  const reordered = protectedText.text.replace(first, '__TEMP__').replace(second, first).replace('__TEMP__', second);
  assert.equal(protectedText.restore(reordered), 'A `second` then `first`.');
  const blocks = protectMarkdown('<b>Visible</b>');
  const [open, close] = blocks.markers.map((m) => m.marker);
  assert.throws(() => blocks.restore(`${close}Visible${open}`), /block order/u);
  const collision = protectMarkdown('Literal ⟦P0000⟧ and `code`.');
  assert.equal(collision.restore(collision.text), 'Literal ⟦P0000⟧ and `code`.');
});

test("glossary disambiguates credentials, mapping keys and token units without matching code or URLs", () => {
  const auth = selectTerms('From [API Keys](/keys), create a new key. An access token is not an input token.', glossary);
  assert.ok(auth.some((t) => t.source === 'key' && t.target === '密钥'));
  assert.ok(auth.some((t) => t.source === 'access token' && t.target === '访问令牌'));
  assert.ok(auth.some((t) => t.source === 'input token' && t.target === '输入令牌'));
  const mapping = selectTerms('Merge the per-key configuration. `API key` https://example.com/provider', glossary);
  assert.ok(!mapping.some((t) => ['key', 'API key', 'provider'].includes(t.source)));
  assert.ok(!auth.some((t) => t.source === 'token'), 'token inside a longer term is not selected twice');
});

test("uses the supplied official Chinese and English prompt formats and contextual references", () => {
  const plain = buildPrompt('Hello.', { terminology: false, protect: false });
  assert.equal(plain.prompt, '将以下文本翻译为 简体中文，注意只需要输出翻译后的结果，不要额外解释：\n\nHello.');
  const english = buildPrompt('Hello.', { terminology: false, protect: false, language: 'en' });
  assert.equal(english.prompt, 'Translate the following text into Simplified Chinese. Note that you should only output the translated result without any additional explanation:\n\nHello.');
  const terminology = buildPrompt('An API key.', { glossary, protect: false, language: 'en' });
  assert.match(terminology.prompt, /^Reference the following translations:\nAPI key translates to API 密钥/u);
  assert.ok(!terminology.prompt.includes('input token translates'));
});

test("background definitions are contextual and can be disabled for a terminology-only comparison", () => {
  const source = 'A provider cooldown follows a transient failure.';
  const contextual = buildPrompt(source, { glossary });
  assert.match(contextual.prompt, /【背景信息】/u);
  assert.ok(contextual.prompt.includes('请求本身不进入冷却期'));
  assert.ok(!contextual.prompt.includes('不是释放内存'));
  const referenceOnly = buildPrompt(source, { glossary, background: false, protect: false });
  assert.ok(!referenceOnly.prompt.includes('【背景信息】'));
  assert.ok(referenceOnly.prompt.startsWith('参考下面的翻译：'));
});

test("restores Ollama output without a system prompt and rejects incomplete or structurally damaged output", async () => {
  const source = '# Heading\n\nUse `model: "auto"`.';
  const prepared = buildPrompt(source, { glossary });
  let request;
  const mockFetch = async (_url, init) => {
    request = JSON.parse(init.body);
    return new Response(JSON.stringify({ done: true, done_reason: 'stop', message: {
      role: 'assistant', content: prepared.protectedText.text.replace('# Heading', '# 标题'),
    } }));
  };
  const result = await translateWithOllama(source, { glossary, fetchImpl: mockFetch });
  assert.deepEqual(request.messages.map((m) => m.role), ['user']);
  assert.equal(request.options.num_predict, 4096);
  assert.equal(request.options.repeat_penalty, 1.05);
  assert.equal(OLLAMA_OPTIONS.num_ctx, 8192);
  assert.equal(result.accepted_structure, true);
  assert.equal(result.output, '# 标题\n\nUse `model: "auto"`.');
  const damaged = await translateWithOllama(source, { glossary, fetchImpl: async () => new Response(JSON.stringify({
    done: true, done_reason: 'stop', message: { content: '丢失了代码的译文' },
  })) });
  assert.equal(damaged.output, null);
  assert.equal(damaged.accepted_structure, false);
  await assert.rejects(translateWithOllama(source, { glossary, fetchImpl: async () => new Response(JSON.stringify({
    done: true, done_reason: 'length', message: { content: 'truncated' },
  })) }), /Incomplete/u);
  await assert.rejects(translateWithOllama(source, { glossary, fetchImpl: async () => new Response('', { status: 503 }) }), /HTTP 503/u);
});

test("structure checks detect dropped headings, table rows and changed executable quote characters", () => {
  const source = '# Guide\n\n| Example |\n| --- |\n| `model: "auto"` |';
  assert.equal(checkStructure(source, source.replace('# Guide', '指南')).heading_levels_exact, false);
  assert.equal(checkStructure(source, source.replace('"auto"', '“auto”')).inline_code_exact, false);
  assert.equal(checkStructure(source, source.split('\n').slice(0, -1).join('\n')).table_shape_exact, false);
});

test("keeps the text inside inline HTML code elements out of the model", () => {
  const html = protectMarkdown('Frozen at <code>release/v3.8.50</code> tip <code>dafb4ae808</code>.');
  assert.ok(!html.visibleText.includes('release'));
  assert.equal(html.restore(html.text), 'Frozen at <code>release/v3.8.50</code> tip <code>dafb4ae808</code>.');
});
