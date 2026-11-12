---
title: Smoke tests isolados da CLI
description: Valide contratos de protocolo de CLIs instaladas com respostas locais descartáveis.
version: "3.8.51"
lastUpdated: "2026-09-22"
---

# Smoke tests isolados da CLI

Execute o harness opcional contra binários já instalados de Aider, Goose, OpenCode, Qwen Code
ou Codex:

```bash
node scripts/cli/smoke-cli-integrations.mjs --targets qwen,codex --json
```

`--bin-dir /absolute/path` antepõe um diretório de binários existente. O harness
não instala ferramentas. Executáveis ausentes produzem `HOLD-missing-binary`; um timeout
produz `HOLD-timeout`. Qualquer FAIL faz o processo encerrar com código 1; HOLD faz
o processo encerrar com código 2. Todos os alvos devem ter PASS para o código de saída 0.

Cada alvo é executado por meio de `omniroute run` contra um servidor HTTP descartável vinculado a
`127.0.0.1`, usando uma credencial sentinel fixa e não secreta. HOME, os diretórios XDG, os diretórios
de configuração das CLIs e o diretório de dados do OmniRoute são temporários. As credenciais de
provedor, as variáveis de proxy, os flags de runtime-loader e as configurações existentes não são
herdados. Nenhuma credencial real de upstream é necessária nem aceita.

A opção explícita `--inherit-isolated-env` do harness encaminha `--inherit-env` para
`omniroute run`, permitindo que flags de supressão de metadados/atualização controlados pelo harness
cheguem ao processo filho de terceiros. Ela vem desativada por padrão e ainda reconstrói o ambiente
externo a partir da mesma lista restrita de permissões: nunca herda os segredos do chamador,
`NODE_OPTIONS`, `NODE_PATH`, `LD_PRELOAD`, `PYTHONPATH` nem as configurações de proxy. A criptografia
de armazenamento usa apenas uma sentinel não secreta dentro do diretório de dados descartável.
O harness também seleciona os metadados de modelo empacotados do LiteLLM e a saída Python sem buffer;
esses são controles de teste fixos, não valores de ambiente fornecidos pelo chamador.
Esta opção exige uma CLI que implemente `run --inherit-env`; launchers sem suporte
falham normalmente e não devem ser contados como um smoke bem-sucedido.

Um PASS exige uma saída bem-sucedida do processo filho, o caminho de protocolo e o modelo esperados,
o cabeçalho de autorização sentinel, uma resposta HTTP concluída e um marcador de resposta imprevisível
gerado pelo servidor no stdout. O marcador não aparece no prompt, portanto imprimir o prompt ou um
diagnóstico não pode satisfazer o teste. Isso comprova o contrato de transporte/resposta do binário
instalado, não a autenticação real do provedor, a execução de ferramentas, uma implantação em produção
nem todas as versões da CLI.

O runner limita a saída capturada e o tempo de execução. Em POSIX, ele cria um grupo de processos
dedicado e encerra os membros restantes desse grupo no teardown; o Windows atualmente retorna
`HOLD-process-isolation` porque a limpeza equivalente de descendentes não está implementada.
Os arquivos temporários e os sockets do servidor são fechados após cada alvo. Isto é isolamento de
configuração e de processo, **não um sandbox de rede do sistema operacional**: binários de terceiros
podem tentar suas próprias requisições de metadados ou de atualização. Execute somente binários
instalados e confiáveis e use um ambiente restrito externamente se for exigido tráfego zero fora do
loopback.

Execute os testes determinísticos do harness sem binários de terceiros:

```bash
node --import tsx/esm --test tests/unit/cli/real-cli-smoke-harness.test.ts tests/unit/cli/real-cli-smoke-safety.test.ts
```

O mock oferece suporte a JSON/SSE de Chat Completions e Responses API da OpenAI. Ele nunca
encaminha requisições a um provedor. Os testes de upstream que dependem de credenciais continuam
sendo uma validação opt-in separada e não devem ser relatados como cobertos por este harness.
