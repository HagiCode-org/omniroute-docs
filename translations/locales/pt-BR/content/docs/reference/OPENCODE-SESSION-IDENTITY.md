---
title: "Identidade de conversa do OpenCode"
version: 3.8.51
lastUpdated: 2026-09-21
---

# Identidade de conversa do OpenCode

O OpenCode e o OpenCode Go reutilizam IDs de conversa explícitos entre os turnos. O
resolvedor verifica `x-opencode-session`, os headers de affinity/sessão existentes, os headers
nativos de sessão/thread da CLI, os metadados da requisição e, por fim, os campos de sessão/thread de nível superior.
O `metadata.user_id` codificado em JSON do Claude é inspecionado em busca de um ID de sessão;
um ID opaco de conta/usuário sozinho nunca é tratado como ID de conversa.

Valores que contêm caracteres de controle, IDs vazios e IDs com mais de 256
caracteres são ignorados. A análise de metadados JSON é limitada. Antes da tradução,
o normalizador de headers do executor preserva essa identidade apenas para os provedores
OpenCode; ele não injeta headers do OpenCode para outros provedores.

A codificação canônica `ses_` existente e o fallback de fingerprint de conversa
permanecem inalterados. Sem um ID explícito, a primeira mensagem do usuário e os demais
insumos de fingerprint existentes continuam determinando a continuidade. Isto não é um
novo limite de autorização nem prova de isolamento de conteúdo no upstream.

A implementação está em `open-sse/utils/opencodeSessionIdentity.ts`,
`open-sse/utils/opencodeHeaders.ts` e
`open-sse/handlers/chatCore/executorClientHeaders.ts`. Os testes de regressão cobrem
IDs nativos, metadados do Claude, precedência, valores inválidos e o comportamento
de fingerprint existente, sem chamadas pagas ao upstream.
