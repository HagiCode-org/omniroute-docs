---
title: "Estratégias de roteamento determinístico"
---

# Estratégias de roteamento determinístico

A entrada do gateway self-hosted do OmniRoute (`/v1/chat/completions`, RIC-738) roteia para um
único provedor por padrão. Quando você configura um bloco `strategy:`, a decisão de rota
passa a ser uma **política determinística e explicável** — o diferencial do OmniRoute em relação
ao roteamento "predict" caixa-preta do NotDiamond/Martian.

Toda decisão é:

- **Determinística** — a mesma configuração + o mesmo estado de runtime resulta no mesmo provedor.
- **Expressa em configuração** — uma regra por linha; sem "一体化智能体", sem modelo aprendido.
- **Explicável** — toda resposta carrega `x-omniroute-route-decision`, uma resposta de uma linha
  para "por que este modelo?" (e "por que NÃO aquele").

Este é o M2 da diferenciação RIC-697 (D3 可审计路由). **Não há dependência preditiva /
de ML** — as estratégias são regras puras sobre sinais observáveis
(falhas consecutivas, custo declarado, latência medida).

## Ativar

Adicione um bloco `strategy:` ao mesmo documento YAML de `providers:`, ou aponte
`OMNIROUTE_SELF_HOSTED_STRATEGY` (YAML inline) / `OMNIROUTE_SELF_HOSTED_STRATEGY_FILE`
(um arquivo) para um documento `strategy:` independente. Uma estratégia explícita no env se
sobrepõe ao bloco inline chave a chave.

```yaml
# providers.yaml
providers:
  - id: cheap
    kind: openai
    baseUrl: http://127.0.0.1:11434/v1
    model: llama3
    costPer1MInput: 0.2 # USD per 1M input tokens — used by cost-priority
  - id: fast
    kind: openai
    baseUrl: http://127.0.0.1:8080/v1
    model: gpt-4o-mini
    costPer1MInput: 0.6
  - id: premium
    kind: anthropic
    baseUrl: http://127.0.0.1:8081
    model: claude-sonnet
    costPer1MInput: 3.0

strategy:
  blacklist: [] # provider ids never used
  whitelist: [cheap, fast, premium] # when non-empty, ONLY these are used
  costPriority: true # cheapest eligible candidate first
  latencyAware:
    enabled: true # fastest recent-average candidate first
  cooldown:
    consecutiveFailures: 2 # breaker trips after this many in a row
    cooldownMs: 30000 # …and the provider stays excluded this long
  fallbackChain: [cheap, fast, premium] # explicit fallback order
```

## As cinco estratégias

| Estratégia | Configuração | Efeito |
| --- | --- | --- |
| Blacklist | `blacklist: [id, ...]` | Os provedores listados nunca são candidatos. |
| Whitelist | `whitelist: [id, ...]` | Não vazia → somente os provedores listados são candidatos. |
| Cooldown/breaker | `cooldown: {consecutiveFailures, cooldownMs}` | Após N falhas consecutivas, um provedor é excluído durante a janela. Um sucesso zera o contador. |
| Prioridade de custo | `costPriority: true` | Candidatos elegíveis ordenados por `costPer1MInput` crescente (declarado, nunca inventado). |
| Sensível à latência | `latencyAware.enabled: true` | Candidatos elegíveis ordenados pela latência média recente das requisições, crescente. Provedores sem amostras ficam por último. |
| Cadeia de fallback | `fallbackChain: [id, ...]` | Ordem explícita primário→reserva. Prevalece sobre a ordenação por custo/latência. |

Os filtros (blacklist / whitelist / cooldown) rodam primeiro e removem candidatos. Em seguida,
a etapa de ordenação ordena os sobreviventes: um `fallbackChain` explícito prevalece; caso contrário,
`costPriority` e depois `latencyAware` se aplicam nessa ordem.

## Provedores fixados

O cabeçalho `x-omniroute-provider` e o prefixo de modelo `provider/model` são
**fixações explícitas**, não preferências. Se um provedor fixado for excluído por um filtro
rígido (blacklist / whitelist / cooldown ativo), a requisição falha com `400` e o motivo da fixação — o
gateway nunca redireciona silenciosamente um cliente que pediu um provedor específico. Se a fixação
sobreviver aos filtros, ela é o primeiro candidato, e os demais candidatos servem como
a cadeia de fallback dela.

## Fallback em caso de falha

A lista ordenada de candidatos é a cadeia de fallback. Quando o primeiro provedor falha
(rede inacessível, conexão recusada, DNS/TLS ou qualquer resposta não 2xx), o gateway percorre
o próximo candidato, e assim por diante. Cada falha é registrada no cooldown breaker e
cada tentativa tem a latência amostrada — assim, um primário quebrado também entra em cooldown para as
requisições _seguintes_. Quando todos os candidatos falham, o último erro normalizado (formato OpenAI) é
retornado. Quando nenhum candidato está elegível, é retornado um `503` com a decisão
explicável completa.

## Explicabilidade

Toda resposta roteada pelo mecanismo de estratégia carrega:

```
x-omniroute-route-decision: cheap(cost-priority: cheap #1) -> fast(cost-priority: fast #2); premium excluded: blacklist: premium forbidden
```

O valor é a lista ordenada de candidatos mais todos os motivos de exclusão — a trilha de auditoria
para "por que este modelo, por que não aquele".

## Contrato de falha (inalterado desde RIC-738)

- O corpo de resposta não 2xx do upstream é normalizado por `parseUpstreamError` + `buildErrorBody`
  para o formato padrão `error` da OpenAI (Regra rígida #12).
- Falhas em nível de rede retornam um `502` normalizado; depois que a cadeia inteira se esgota,
  o último erro normalizado é exposto.
- Os cabeçalhos de credencial / sessão ecoados pelo upstream são removidos de toda resposta.
- Uma configuração de provedor com um bloco `strategy:` malformado retorna `500` — uma política
  mal configurada nunca se torna silenciosamente um no-op.

## Testes

- `tests/unit/routing-strategies.test.ts` — 25 testes unitários sobre o mecanismo de estratégia puro:
  parse, blacklist/whitelist, cooldown breaker, prioridade de custo, sensível à latência, cadeia de
  fallback, pipeline combinado, explicabilidade.
- `tests/unit/self-hosted-entry.test.ts` — injeção de falhas sobre HTTP real: primário fora
  do ar → o fallback tem sucesso; todos fora do ar → último erro; fixado na blacklist → 400; o cooldown
  exclui um provedor com falha na requisição seguinte; nenhum elegível → 503 com decisão
  explicável.
