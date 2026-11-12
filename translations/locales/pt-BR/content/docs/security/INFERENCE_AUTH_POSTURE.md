---
title: "Postura de autenticação da inferência"
---

# Postura de autenticação da inferência

## Visão geral

`GET /v1/models` e os endpoints de inferência são controlados por **configurações
diferentes**. O probe mais natural que um operador executa para responder "minha API está
protegida?" pode, portanto, retornar a resposta errada.

| Endpoint                                                                           | Controlado por                                                                                                                                     |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/models`                                                                   | A postura de login do dashboard — `isAuthRequired()`, substituível por instância com `requireAuthForModels` (`src/app/api/v1/models/catalogRequest.ts`) |
| `POST /v1/chat/completions`, `POST /v1/responses`, e as demais rotas de API de cliente | `REQUIRE_API_KEY` (`src/server/authz/policies/clientApi.ts`)                                                                                       |

Em uma instância com senha de administrador definida e `REQUIRE_API_KEY=false`,
`/v1/models` responde `401` enquanto a inferência fica aberta para qualquer pessoa que consiga
alcançar a porta.

> **Ressalva sobre o probe:** um `401` de `/v1/models` **não** comprova que a
> inferência está protegida. Ele apenas indica que o dashboard exige login.

Isso não é hipotético. Na discussão #13310, uma instância self-hosted atrás do
Traefik teve a cota do Codex consumida por tráfego anônimo em `POST /v1/responses`
enquanto `/v1/models` retornava `401` — o que, nas palavras de quem relatou, "inicialmente
criou a impressão de que toda a API estava protegida" e o levou a investigar o componente errado.

## Como verificar de fato

Faça o probe de uma rota de inferência, não do catálogo:

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST http://<host>:<api-port>/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"<any-model>","messages":[{"role":"user","content":"ping"}]}'
```

Um `401` significa que `REQUIRE_API_KEY` está sendo aplicado. Qualquer coisa que chegue ao
roteamento (incluindo um erro de modelo não encontrado) significa que o tráfego anônimo é aceito.

Observe que, com `REQUIRE_API_KEY=false`, um bearer **inválido** é rebaixado para
anônimo em vez de ser rejeitado (#2257); portanto, enviar uma chave inválida também não é um probe válido.

## Aviso na inicialização

Quando `REQUIRE_API_KEY` está desativado e um servidor se vincula a uma interface fora do loopback,
o OmniRoute registra um aviso na inicialização (`src/lib/startup/nonLoopbackApiKeyGuard.ts`).
Isso abrange três superfícies:

- o servidor de Dashboard/API que serve a inferência `/v1` — `HOST`, padrão `0.0.0.0`
- a API bridge — `API_HOST`, padrão `127.0.0.1`
- o WebSocket do dashboard ao vivo — com seu próprio host

O aviso nunca bloqueia a inicialização: um reverse proxy na frente do OmniRoute pode
já estar aplicando sua própria autenticação.

## Relacionado

- `REQUIRE_API_KEY` em [ENVIRONMENT.md](../reference/ENVIRONMENT.md)
- `APP_BIND_HOST` e os padrões de loopback do compose (#12568)
- #2257 — bearer inválido é rebaixado para anônimo quando `REQUIRE_API_KEY` está desativado
- #13695 — este documento
