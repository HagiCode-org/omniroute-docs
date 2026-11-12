---
title: "Prévias e gravações de configuração da CLI"
---

# Prévias e gravações de configuração da CLI

As rotas autenticadas `/api/cli-tools/config` e `/api/cli-tools/apply` retornam
prévias não armazenáveis em cache e com dados ocultados. Elas preservam as verificações
existentes de autenticação e autorização. Os corpos de requisição rejeitam campos desconhecidos. Uma URL base
explícita deve usar HTTP(S) sem credenciais de nome de usuário/senha incorporadas; quando omitida,
é usada a URL base configurada no servidor.

Para uma prévia em lote, `GET /api/cli-tools/config` aceita um parâmetro de consulta `baseUrl`
opcional e obtém a credencial de configuração do
header `x-omniroute-config-api-key`. Credenciais na query string são rejeitadas.
`POST /api/cli-tools/config` aceita `toolId`, `baseUrl`, `apiKey` e `model`
opcional em seu corpo JSON. As respostas usam `Cache-Control: no-store` tanto nos caminhos de sucesso
quanto nos de erro. O texto da prévia não é uma configuração utilizável que contenha credenciais.

A projeção da prévia oculta as credenciais serializadas do chamador e os campos de credenciais
já presentes em profiles JSONC, TOML ou YAML mesclados. A rota apply grava a
configuração original; a ocultação da prévia não altera os valores em disco.
JSON malformado é rejeitado com 400. As respostas de erro públicas usam o envelope
de erro sanitizado padrão.

A aplicação de uma configuração usa um arquivo temporário privado no diretório de destino,
descarrega seu conteúdo e o renomeia atomicamente para o lugar final. Arquivos e backups usam
o modo `0600`; as permissões são definidas no descritor próprio antes da renomeação. Symlinks
no destino final e arquivos não regulares são recusados. As leituras do Codex e do OpenCode
também recusam symlinks no caminho final antes de mesclar TOML/JSONC existentes. Isso não
alega proteção contra um adversário que controle o diretório pai.

A proteção de gravação em contêiner continua ativa: um destino efêmero inseguro retorna
422 e orienta o operador para o comando de configuração no lado do host. Uma simulação (dry run) continua
disponível e não grava arquivos. Consulte [Integrações de CLI](../guides/CLI-INTEGRATIONS.md)
para os comandos de configuração no lado do host compatíveis e
[sanitização de erros](./ERROR_SANITIZATION.md) para o contrato de erros públicos.
