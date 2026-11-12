---
title: "🚀 Guia de Self-Host — OmniRoute (零月费自托管 / self-host sem taxas)"
version: 3.8.51
lastUpdated: 2026-09-14
---

# 🚀 Guia de Self-Host — OmniRoute

> **Resumo** — três comandos, um endpoint local, zero mensalidade. Sem cobrança
> SaaS, sem isolamento multi-tenant, sem etapa hospedada de processamento de
> prompt. Seus prompts vão direto para o provedor que você escolher.

```bash
cp .env.selfhost.example .env      # then edit the 2 lines marked "EDIT ME"
docker compose -f docker-compose.selfhost.yml up -d
open http://127.0.0.1:20128
```

Esta é a **distribuição self-host** da forma de produto "零月费 + 自托管" do
OmniRoute: um container/binário empacotado que você executa na sua própria máquina
em 5 minutos.

---

## Por que este guia existe

O OmniRoute traz um `docker-compose.yml` sofisticado com profiles
(`base`, `web`, `cli`, `host`, `cliproxyapi`, `memory`, `bifrost`). Cada serviço
de aplicação é controlado por profile, então um simples `docker compose up -d`
inicia apenas o Redis. Isso é correto para usuários avançados que escolhem um
profile — mas *não* é uma história de self-host em 5 minutos.

`docker-compose.selfhost.yml` é o overlay KISS: **um comando, imagem publicada,
somente loopback, Redis incluído, sem escolha de profile, sem etapa de build.**
Quando ele não bastar mais, migre para os profiles completos do
[DOCKER_GUIDE](../guides/DOCKER_GUIDE.md).

| Público | Comece aqui | Migrar para |
| --- | --- | --- |
| Self-hoster, usuário único | este guia | — |
| Usuário avançado, ferramentas de CLI / provedores com web-cookie / sidecars | — | profiles do `docker-compose.yml` |

---

## Pré-requisitos

- Docker Engine 24+ (ou Docker Desktop 4.30+) com o plugin Compose v2.
- ~2 GB de RAM livres (veja [Dimensionamento](#dimensionamento-do-container)).
- Uma chave de API de qualquer provedor compatível (OpenAI, Anthropic, Google
  ou um dos [150+ níveis gratuitos](./FREE-TIERS-GUIDE.md)).

Sem toolchain de build, sem Node, sem git clone — a imagem é baixada.

---

## Etapa 1 — Configurar (1 min)

```bash
cp .env.selfhost.example .env
```

Edite exatamente **duas** linhas em `.env`:

```dotenv
REQUIRE_API_KEY=true          # was false — lock the endpoint down
APP_BIND_HOST=127.0.0.1       # keep loopback; see "Exposing" only if needed
```

`REQUIRE_API_KEY=true` faz com que toda requisição `/v1` e o dashboard exijam uma
chave de API / login. Na primeira inicialização, o dashboard gera automaticamente
um `INITIAL_PASSWORD` — leia-o nos logs:

```bash
docker logs omniroute | grep -i password
```

As demais variáveis (`DASHBOARD_PORT`, `API_PORT`, `LIVE_WS_PORT`,
`OMNIROUTE_MEMORY_MB`) já têm padrões sensatos. Deixe-as como estão, a menos que
você saiba que precisa alterá-las.

---

## Etapa 2 — Iniciar (1 min)

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

Baixa `diegosouzapw/omniroute:latest` (multi-arch AMD64 + ARM64, ~250 MB) e
`redis:8.6.5-alpine`, inicia ambos e espera o Redis ficar saudável antes de o app
subir.

### Etapa 3 — Verificar (30 s)

```bash
# process lifecycle + readiness
curl -fsS http://127.0.0.1:20128/healthz && echo

# container health
docker inspect --format '{{.State.Health.Status}}' omniroute
```

Você deve ver `{"status":"ok"}` e `healthy`. Em seguida, abra o dashboard:

```
http://127.0.0.1:20128
```

Em ~300 s após o `up -d`, o endpoint fica acessível localmente e o healthcheck
fica `healthy` — o critério de aceitação da issue de self-host.

---

## Portas

| Porta | O quê | Bind padrão |
| --- | --- | --- |
| `20128` | Dashboard + proxy LLM `/v1` (entrada unificada) | `127.0.0.1` |
| `20129` | Porta de API (servidor para servidor) | `127.0.0.1` |
| `20132` | WebSocket ao vivo (atualizações em tempo real do dashboard) | `127.0.0.1` |

As três fazem bind **somente em loopback** por padrão. O Redis **não** é publicado
no host de forma alguma — o app o acessa pela rede do compose. Isso é
deliberado: expor um Redis sem autenticação em `0.0.0.0` é uma armadilha.

---

## Conectando um provedor

1. Abra o dashboard → **Providers**.
2. Adicione um provedor e cole a chave de API dele. As chaves são criptografadas em
   repouso com AES-256-GCM; o texto em claro nunca sai da sua máquina.
3. Aponte sua IDE / agent para a entrada unificada:

```
http://127.0.0.1:20128/v1
```

Para escolher provedores, consulte o
[Guia de Níveis Gratuitos](./FREE-TIERS-GUIDE.md) — o OmniRoute agrega 150+ níveis
gratuitos em um único endpoint, para que você possa usar `model: "auto"` e escolher
a melhor opção gratuita a cada requisição.

---

## Dimensionamento do container

A imagem fixa `OMNIROUTE_MEMORY_MB=1024`. Isso é suficiente para o dashboard e
chats leves. **Coding agents** (`POST /v1/responses` a partir de Claude Code,
Codex, Grok, …) retêm vários grafos de contexto grandes durante a compressão e
podem abortar o V8 em ~12 GiB de old-space com dois contextos longos sobrepostos
([#7849](https://github.com/diegosouzapw/OmniRoute/issues/7849)).

`.env.selfhost.example` usa por padrão `OMNIROUTE_MEMORY_MB=2048` — um piso seguro
para um único usuário executando coding agents. Aumente-o se você distribuir muitos
modelos em paralelo (combos de fusão) ou se encontrar `FATAL ERROR: Reached heap limit`:

```dotenv
OMNIROUTE_MEMORY_MB=4096
```

A memória é um teto do heap do V8; buffers nativos (SQLite, ONNX, better-sqlite3)
ficam fora dele, então dimensione o container algumas centenas de MB acima do heap.

---

## Build de binário local (opcional)

Prefere um binário a Docker? O pacote npm é o mesmo código:

```bash
npm install -g omniroute
omniroute
```

Isso executa o servidor standalone do Next.js diretamente no seu host — mesmas
portas, mesmo `DATA_DIR` (`./data` por padrão). Use-o quando você não puder
executar Docker (por exemplo, uma VM restrita). O caminho com container acima é o
padrão recomendado porque inclui o runtime exato com que a imagem foi testada.

A partir do código-fonte (somente desenvolvimento — não é um caminho de deploy):

```bash
git clone https://github.com/diegosouzapw/OmniRoute.git
cd OmniRoute
npm install
npm run build && npm start
```

---

## Exposição além do localhost

**Não** altere `APP_BIND_HOST=0.0.0.0` enquanto `REQUIRE_API_KEY=false`. Isso
publica um proxy `/v1` aberto em toda interface de LAN/WAN — qualquer pessoa na
rede pode consumir as cotas do seu provedor. A ordem é fixa:

1. Defina `REQUIRE_API_KEY=true` em `.env`.
2. Leia `INITIAL_PASSWORD` nos logs e faça login.
3. *Somente então* defina `APP_BIND_HOST=0.0.0.0` (ou coloque à frente um
   reverse proxy que imponha autenticação e mantenha o loopback).

Para TLS / um domínio, execute Caddy ou Traefik à frente e deixe `APP_BIND_HOST`
em `127.0.0.1`. Consulte as seções
[DOCKER_GUIDE — Caddy HTTPS](../guides/DOCKER_GUIDE.md#docker-compose-with-caddy-https-auto-tls)
e
[Cloudflare Quick Tunnel](../guides/DOCKER_GUIDE.md#cloudflare-quick-tunnel)
para configurações de reverse proxy prontas para copiar e colar.

---

## Dados, backups e redefinições

- **Diretório de dados**: `./data` (bind-mounted em `/app/data`). Todos os bancos
  SQLite, migrations, trilha de auditoria e chaves de provedor criptografadas ficam aqui.
- **Backups**: o backup automático do SQLite vem ativado por padrão
  (`DISABLE_SQLITE_AUTO_BACKUP` não definido → ativado). Para um snapshot manual:
  ```bash
  ./bin/snapshot-data.sh
  ```
  Restaure com `./bin/restore-data.sh`.
- **Redefinir a senha do dashboard**:
  ```bash
  docker exec -it omniroute node bin/reset-password.mjs
  ```
- **Redefinir políticas** (roteamento/failover/cota para os padrões de fábrica):
  ```bash
  docker exec -it omniroute node bin/restore-policies.sh
  ```

---

## Problemas comuns

<details>
<summary><code>docker compose up</code> inicia apenas o Redis</summary>

Você está executando o `docker-compose.yml` **completo**, cujos serviços de app
são controlados por profile. Para o caminho de um comando, use o arquivo de self-host:

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

Ou, com o compose completo, escolha um profile:
`docker compose --profile base up -d`.
</details>

<details>
<summary>O healthcheck permanece em <code>starting</code> / <code>unhealthy</code></summary>

- Verifique se o Redis está no ar: `docker inspect --format '{{.State.Health.Status}}' omniroute-redis`
- Verifique os logs do app: `docker logs omniroute`
- O healthcheck consulta `/healthz` e permite um período de inicialização de 20 s. Uma
  primeira inicialização lenta (migrations a frio) pode demorar mais — aumente `start_period` no
  arquivo compose se o seu disco for lento.
</details>

<details>
<summary><code>FATAL ERROR: Reached heap limit</code> com coding agents</summary>

Aumente `OMNIROUTE_MEMORY_MB` em `.env` (por exemplo, `4096`) e depois execute
`docker compose -f docker-compose.selfhost.yml up -d`. Consulte
[Dimensionamento do container](#dimensionamento-do-container).
</details>

<details>
<summary>Provedores com web-cookie (Gemini Web, Claude Turnstile) falham com
<code>Executable doesn't exist at .../ms-playwright/chromium</code></summary>

A imagem `base` é distribuída sem Chromium. O compose de self-host usa a imagem
`base` publicada. Para provedores com web-cookie, mude para o compose completo
com o profile `web` (que inclui Playwright/Chromium):

```bash
docker compose --profile web up -d
```

Consulte [DOCKER_GUIDE — Available Profiles](../guides/DOCKER_GUIDE.md#available-profiles).
</details>

<details>
<summary>A porta 20128 já está em uso</summary>

Defina `DASHBOARD_PORT`, `API_PORT`, `LIVE_WS_PORT` em `.env` com portas livres e
execute `up -d` novamente.
</details>

---

## O que isto deliberadamente NÃO é

Conforme a restrição KISS do self-host, este caminho **não** inclui:

- ❌ Cobrança SaaS / medição / níveis de plano
- ❌ Isolamento multi-tenant / namespaces por tenant
- ❌ Uma etapa hospedada de processamento de prompt (seus prompts vão direto para o provedor)
- ❌ Qualquer credencial ou segredo embutido

É uma distribuição de **self-host puramente local** — a coisa mais simples que torna
real a promessa "零月费 + 自托管".

---

## Checklist de segurança (self-host)

Antes de expor além do loopback:

- [ ] `REQUIRE_API_KEY=true` em `.env`
- [ ] `INITIAL_PASSWORD` trocado por um valor forte e único
- [ ] `APP_BIND_HOST` mantido em `127.0.0.1` *a menos que* esteja atrás de um proxy que imponha autenticação
- [ ] TLS terminado por Caddy/Traefik/Cloudflare à frente (nunca HTTP puro na WAN)
- [ ] Redis não publicado no host (o compose de self-host já garante isso)
- [ ] Volume `./data` com backup regular (`bin/snapshot-data.sh`)
- [ ] Chaves de provedor rotacionadas conforme a política do próprio provedor

Para a dimensão completa de auditoria de supply-chain / imagem / dependências, consulte
[SECURITY.md](../../SECURITY.md) e
[SUPPLY_CHAIN](../security/SUPPLY_CHAIN.md).

---

## Relacionados

- [Guia do Docker](../guides/DOCKER_GUIDE.md) — profiles, Caddy HTTPS, túneis, tags de imagem
- [Início Rápido](./QUICK-START.md) — caminho de 3 minutos para quem usa pela primeira vez
- [Guia de Níveis Gratuitos](./FREE-TIERS-GUIDE.md) — 150+ níveis gratuitos de provedores
- [Guia de Provedores](./PROVIDERS-GUIDE.md) — conectar e configurar provedores
- [Solução de problemas](../guides/TROUBLESHOOTING.md) — resolução mais aprofundada de problemas
