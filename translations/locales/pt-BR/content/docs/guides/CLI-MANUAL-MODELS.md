---
title: "Catálogo de modelos da CLI e metadados manuais"
version: "3.8.51"
lastUpdated: "2026-09-21"
---

# Catálogo de modelos da CLI e metadados manuais

`omniroute models` lê primeiro o catálogo público de modelos do servidor selecionado,
incluindo suas entradas personalizadas e sincronizadas. `--output json` e `--output jsonl`
retornam todas as linhas correspondentes, sem mensagem de truncamento de tabela. As tabelas
interativas mostram no máximo 50 linhas. O JSON preserva os limites públicos de contexto,
as modalidades, as capacidades, a origem do modelo quando fornecida pelo servidor e os
metadados de formato de API; as credenciais e os cabeçalhos de compatibilidade não são
exibidos na saída. Um fallback legado para `/api/models` é usado somente quando o endpoint
público retorna HTTP 404, 405 ou 501, nunca após uma falha de autenticação.
`omniroute completion refresh` usa esse mesmo catálogo. Uma requisição de catálogo de modelos
que falha retorna um código de saída diferente de zero e preserva o cache de completion
anterior. Os scripts de completion de Bash, Zsh e Fish anunciam os subcomandos de modelos manuais.

## Ciclo de vida de modelos manuais

Estas operações usam a API de gerenciamento autenticada `/api/provider-models` já existente.
Elas respeitam a mesma seleção global de `--context` e `--base-url` dos demais comandos da CLI.
Use o ID canônico do provedor e o ID do modelo do provedor separadamente; um ID de modelo que
contenha barras é válido. Use um contexto de gerenciamento configurado em vez de colocar
credenciais nos argumentos do comando.

```bash
omniroute models openai --output json
omniroute models manual openai
omniroute models add openai my-model --name "My model" --context-window 32768 --dry-run
omniroute models add openai my-model --name "My model" --context-window 32768
omniroute models edit openai my-model --context-window 65536
omniroute models edit openai my-model --clear-context-window
omniroute models remove openai my-model --dry-run
omniroute models remove openai my-model --yes
```

Os exemplos descrevem a sintaxe; substitua os IDs de provedor/modelo por entradas que pertençam
ao seu servidor. A operação add não cria uma conexão com o provedor.

- `add` recusa uma entrada personalizada já existente. O parâmetro opcional `--max-output-tokens`
  define o limite de saída na criação; `--api-format` define o formato de API do modelo e os
  metadados de endpoint correspondentes, como `embeddings` em vez de `chat`.
- `edit` exige uma entrada manual já existente. Seu limite de contexto usa a substituição manual
  de contexto independente do backend; limpá-lo remove essa substituição, não o limite de entrada
  original nem os metadados sincronizados.
- `remove` exige `--yes`, exceto com `--dry-run`. Ele solicita `resetOverride=true`, preservando
  uma entrada sincronizada com o mesmo ID. A exclusão em massa não é exposta.
- `--dry-run` executa a leitura prévia autenticada, mas nenhuma escrita nem inferência.
- Toda mutação real lê o catálogo manual de volta. `persistenceVerified: true` significa que os
  metadados solicitados foram observados após a escrita; não significa que o modelo consiga
  gerar texto ou chamar ferramentas. `inferenceValidation` é sempre `not-run`.
- Uma falha de readback retorna um código de saída diferente de zero. A escrita pode já ter
  surtido efeito; inspecione o servidor antes de tentar novamente. Escritores concorrentes não
  são serializados por esta CLI, e a API existente não oferece uma transação compare-and-swap.

## Test & Add: não implementado

As entradas manuais não são verificadas. Não há o flag `--validate`, e estes comandos não emitem
requisições de inferência nem executam ferramentas. Um futuro fluxo de validação opt-in deverá
separar as credenciais de inferência da autenticação de gerenciamento e estabelecer qual conexão
exata com o provedor produziu as três provas: geração, uma chamada de ferramenta sintética
vinculada a um nonce e a continuação após um resultado de ferramenta sintético. Nenhuma execução
real de ferramenta é necessária para essas provas.

A fixação `x-omniroute-connection` existente, sozinha, é insuficiente como receipt de prova: a seleção
de credenciais pode liberar intencionalmente uma fixação nos casos de cooldown, cota ou conta excluída,
e a afinidade de sessão participa da seleção. Veja `src/sse/services/auth.ts` e o tratamento de
`forcedConnectionId` em `src/sse/handlers/chat.ts`. Antes de implementar o Test & Add, defina um
contrato de fixação estrita ou de receipt de conexão verificável. Os testes deverão então provar que
não há persistência após qualquer resposta com falha, truncada, com timeout ou de conexão errada.
Esta é uma decisão de contrato de backend separada, não uma promessa feita pelo CRUD manual.
