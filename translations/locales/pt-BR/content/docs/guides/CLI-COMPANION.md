---
title: "CLI Companion — orientação de terminal somente para cópia"
version: 3.8.51
lastUpdated: 2026-09-22
---

# CLI Companion

O dashboard CLI Code inclui um companion somente para cópia para os alvos de CLI
executáveis compatíveis com esta versão do OmniRoute. Ele não inicia um processo,
não grava configuração, não testa inferência nem envia credenciais para a
clipboard.

## A detecção no servidor não é detecção no navegador

O status de detecção, de runtime e de configuração descreve a máquina que executa
o servidor do OmniRoute. Se você abrir um dashboard remoto a partir do seu laptop,
a ausência de uma CLI nesse servidor não diz nada sobre a CLI instalada no seu
laptop. Detecção desconhecida e detecção com falha permanecem explícitas; elas não
são tratadas como “não instalado”. Erros brutos de diagnóstico e endpoints de
configuração não são exibidos neste painel.

Copie os comandos para o terminal da máquina em que você quer usar a CLI. O
companion não bloqueia as instruções locais quando a detecção no servidor falha.

## Contextos locais ou remotos

Comece inspecionando os contextos já configurados no seu terminal:

```sh
omniroute contexts list
omniroute contexts current
```

Deixe o campo de contexto do companion vazio para usar o contexto ativo da CLI, ou
informe o nome de um contexto existente. Um contexto nomeado pode apontar para um
servidor local ou remoto. O dashboard não lê o armazenamento de contextos do seu
terminal, não cria um contexto nem copia as credenciais dele. Por exemplo, se
`office` já existir:

```sh
omniroute configure claude --context office
omniroute run claude --context office --dry-run
```

`configure` é interativo e grava a configuração na máquina em que você o executa.
`run --dry-run` exibe o plano de inicialização sem iniciar o alvo; ele não
comprova que a inferência de upstream funciona. Autentique o terminal usando o
fluxo de contexto da CLI já existente antes de executar esses comandos.

Somente as capacidades declaradas pelo manifest executável são oferecidas. Se um
alvo exige um modelo, o comando de inicialização dele permanece indisponível até
que você informe um identificador de modelo real. Os campos de contexto/modelo
aceitam um conjunto restrito de caracteres literais; operadores de shell, espaços
em branco e sintaxe de opção no início são rejeitados.

Se o acesso à clipboard falhar, o painel informa a falha e deixa o comando visível
para seleção manual. Copiar nunca o executa.

## Limite de implementação

O carregador exclusivo do servidor em `src/lib/cli-helper/companionTargets.ts`
projeta o manifest executável em descritores públicos. O navegador recebe apenas
IDs de alvos, nomes de exibição e flags de capacidade, não módulos Node nem
segredos de runtime. A validação de comandos e o mapeamento de status ficam em
`src/shared/utils/cliCompanion.ts`. O painel reutiliza a requisição de status em
lote já existente no dashboard; ele não introduz nenhuma API de execução nem
polling de status adicional.
