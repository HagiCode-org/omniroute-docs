---
title: "Entrada self-hosted compatível com OpenAI"
---

# Entrada unificada self-hosted compatível com OpenAI

Quando ativado, o `/v1/chat/completions` já existente do OmniRoute (e o contrato compatível com
OpenAI que ele atende) passa a ser um **gateway self-hosted**: uma requisição compatível com OpenAI
entra, é roteada automaticamente para o provedor de sua escolha por meio dos adaptadores de provedor,
e sai com um formato de erro padrão da OpenAI. O código do cliente não muda.

Este é o diferencial D4 (接入即用) do design RIC-697: o mesmo caminho `/v1`
que o SDK da OpenAI já utiliza, sustentado pelos seus próprios provedores em vez de um único
catálogo incorporado ao código.

## Ativar

Defina qualquer uma das variáveis de ambiente (veja `.env.example` para ambas):

- `OMNIROUTE_SELF_HOSTED_PROVIDERS` — documento YAML inline (somente em runtime, não é registrado em log).
- `OMNIROUTE_SELF_HOSTED_PROVIDERS_FILE` — caminho para um arquivo YAML.

```yaml
# providers.yaml
providers:
  - id: local
    kind: openai # openai | anthropic | local
    baseUrl: http://127.0.0.1:11434/v1
    model: llama3
    # apiKey: sk-...       # optional, runtime-only
  - id: claude
    kind: anthropic
    baseUrl: http://127.0.0.1:8080
    model: claude-sonnet
```

Quando **qualquer uma** das variáveis está definida, a entrada unificada fica ativa para toda requisição a
`/v1/chat/completions`. Uma configuração presente mas que não pode ser interpretada retorna `500` (ela nunca
recai silenciosamente no roteamento de nuvem). Quando nenhuma das duas está definida, a rota se comporta
exatamente como antes.

## Roteamento automático de provedor

Precedência (determinística, sem modelo preditivo):

1. Cabeçalho `x-omniroute-provider: <id>` — ID exato do provedor.
2. Prefixo de `model`: `provider/model` (barra) ou `provider::model` (dois-pontos duplo).
3. O primeiro provedor configurado.

O prefixo de roteamento é removido antes do encaminhamento — o upstream recebe o modelo simples
(`claude-sonnet`, não `claude/claude-sonnet`).

```bash
# via header
curl http://localhost:20128/v1/chat/completions \
  -H "x-omniroute-provider: claude" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet","messages":[{"role":"user","content":"hi"}]}'

# or via model prefix
curl ... -d '{"model":"claude/claude-sonnet","messages":[...]}'
```

## Estrutura de autenticação (D5 reservado)

`OMNIROUTE_SELF_HOSTED_API_KEY` opcional. Quando definida, as requisições devem conter
`Authorization: Bearer <key>`. Não definida = rota aberta (loopback / rede confiável),
espelhando o funcionamento dos provedores locais já existentes do OmniRoute. Espera-se que o sistema
de chaves D5 de cota/cota-自治 assuma esse cabeçalho.

## Contrato de falha

- O corpo de uma resposta não 2xx do upstream é normalizado por `parseUpstreamError` + `buildErrorBody`
  para o formato `error` padrão da OpenAI (Regra rígida #12 — nunca texto bruto do upstream).
- Falhas em nível de rede (conexão recusada / DNS / TLS) retornam um `502` normalizado
  com `error.message: "Upstream provider unreachable: …"`.
- Os cabeçalhos de credencial / sessão ecoados pelo upstream são removidos de toda resposta.

## Testes

`tests/unit/self-hosted-entry.test.ts` cobre a seleção de provedor, o encaminhamento do prefixo de
modelo, a higiene de cabeçalhos, a autenticação, a normalização de erros do upstream, o passthrough
de streaming SSE e os caminhos de fall-through / configuração incorreta — tudo sobre HTTP real contra um
upstream local.

## Observações

- Os modelos self-hosted contornam por design o mecanismo de aposentadoria / alias exclusivo da nuvem:
  o desvio acontece antes dessas verificações de nuvem, de modo que IDs como `local/llama3` nunca
  disparam 410s de cloud-peer nem reescritas de alias.
- As estratégias de roteamento determinísticas (fallback / cooldown / custo / latência / blacklist)
  são escopo do M2 (`RIC-740`) e são injetadas na camada de gateway aqui. Configure-as
  com um bloco `strategy:` — veja [DETERMINISTIC_ROUTING.md](./DETERMINISTIC_ROUTING.md).
