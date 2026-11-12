---
title: "🚀 Руководство по self-host — OmniRoute (零月费自托管 / self-host без ежемесячной платы)"
version: 3.8.51
lastUpdated: 2026-09-14
---

# 🚀 Руководство по self-host — OmniRoute

> **Кратко** — три команды, один локальный endpoint, никакой ежемесячной платы. Без
> биллинга SaaS, без изоляции multi-tenant, без размещённого промежуточного звена
> обработки prompt. Ваши prompt идут напрямую выбранному вами провайдеру.

```bash
cp .env.selfhost.example .env      # then edit the 2 lines marked "EDIT ME"
docker compose -f docker-compose.selfhost.yml up -d
open http://127.0.0.1:20128
```

Это **готовая реализация self-host** для продуктовой формы OmniRoute «零月费 + 自托管»:
упакованный контейнер/бинарный файл, который вы запускаете на собственной машине за 5 минут.

---

## Зачем нужно это руководство

OmniRoute поставляется со сложным `docker-compose.yml` с profiles
(`base`, `web`, `cli`, `host`, `cliproxyapi`, `memory`, `bifrost`). Каждый сервис
приложения привязан к profile, поэтому обычный `docker compose up -d` запускает только Redis.
Это верно для опытных пользователей, которые выбирают profile, но это *не*
сценарий self-host за 5 минут.

`docker-compose.selfhost.yml` — это KISS-надстройка: **одна команда, опубликованный
образ, только loopback, Redis включён, без выбора profile, без шага сборки.**
Когда её станет недостаточно, переходите к полным profiles из
[DOCKER_GUIDE](../guides/DOCKER_GUIDE.md).

| Аудитория | С чего начать | Куда перейти |
| --- | --- | --- |
| Self-hoster, один пользователь | это руководство | — |
| Опытный пользователь, инструменты CLI / web-cookie провайдеры / sidecars | — | profiles из `docker-compose.yml` |

---

## Требования

- Docker Engine 24+ (или Docker Desktop 4.30+) с плагином Compose v2.
- Около 2 ГБ свободной RAM (см. [Размер контейнера](#размер-контейнера)).
- API-ключ провайдера любого поддерживаемого провайдера (OpenAI, Anthropic, Google
  или один из [150+ бесплатных уровней](./FREE-TIERS-GUIDE.md)).

Не нужны ни набор инструментов сборки, ни Node, ни клонирование git — образ загружается готовым.

---

## Шаг 1 — Настройка (1 мин)

```bash
cp .env.selfhost.example .env
```

Отредактируйте ровно **две** строки в `.env`:

```dotenv
REQUIRE_API_KEY=true          # was false — lock the endpoint down
APP_BIND_HOST=127.0.0.1       # keep loopback; see "Exposing" only if needed
```

`REQUIRE_API_KEY=true` означает, что каждый запрос `/v1` и dashboard требуют
API-ключ / вход в систему. При первом запуске dashboard автоматически генерирует
`INITIAL_PASSWORD` — прочитайте его в логах:

```bash
docker logs omniroute | grep -i password
```

Остальные переменные (`DASHBOARD_PORT`, `API_PORT`, `LIVE_WS_PORT`,
`OMNIROUTE_MEMORY_MB`) уже имеют разумные значения по умолчанию. Оставьте их, если
не знаете, что их нужно менять.

---

## Шаг 2 — Запуск (1 мин)

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

Загружает `diegosouzapw/omniroute:latest` (multi-arch AMD64 + ARM64, ~250 МБ) и
`redis:8.6.5-alpine`, запускает оба и ждёт, пока Redis станет healthy, прежде чем
запустится приложение.

### Шаг 3 — Проверка (30 с)

```bash
# process lifecycle + readiness
curl -fsS http://127.0.0.1:20128/healthz && echo

# container health
docker inspect --format '{{.State.Health.Status}}' omniroute
```

Вы должны увидеть `{"status":"ok"}` и `healthy`. Затем откройте dashboard:

```
http://127.0.0.1:20128
```

В течение примерно 300 с после `up -d` endpoint становится доступен локально, а healthcheck
показывает `healthy` — это критерий приёмки из issue о self-host.

---

## Порты

| Порт | Назначение | Привязка по умолчанию |
| --- | --- | --- |
| `20128` | Dashboard + LLM proxy `/v1` (единая точка входа) | `127.0.0.1` |
| `20129` | API-порт (сервер-сервер) | `127.0.0.1` |
| `20132` | Live WebSocket (обновления dashboard в реальном времени) | `127.0.0.1` |

По умолчанию все три порта привязаны **только к loopback**. Redis вообще **не**
публикуется на хосте — приложение обращается к нему по сети compose. Это сделано
намеренно: публикация Redis без аутентификации на `0.0.0.0` — это ловушка.

---

## Подключение провайдера

1. Откройте dashboard → **Providers**.
2. Добавьте провайдера и вставьте его API-ключ. Ключи шифруются при хранении с помощью
   AES-256-GCM; открытый текст никогда не покидает вашу машину.
3. Направьте свою IDE / agent на единую точку входа:

```
http://127.0.0.1:20128/v1
```

О выборе провайдера см.
[Руководство по бесплатным уровням](./FREE-TIERS-GUIDE.md) — OmniRoute объединяет 150+ бесплатных
уровней в один endpoint, поэтому можно использовать `model: "auto"`, чтобы выбирать лучший бесплатный
вариант для каждого запроса.

---

## Размер контейнера

Образ фиксирует `OMNIROUTE_MEMORY_MB=1024`. Этого достаточно для dashboard
и лёгкого чата. **Coding agents** (`POST /v1/responses` из Claude Code,
Codex, Grok, …) удерживают несколько больших графов контекста во время сжатия
и могут аварийно завершить V8 при ~12 ГиБ old-space при двух перекрывающихся длинных контекстах
([#7849](https://github.com/diegosouzapw/OmniRoute/issues/7849)).

В `.env.selfhost.example` по умолчанию задано `OMNIROUTE_MEMORY_MB=2048` — безопасный
минимум для одного пользователя, запускающего coding agents. Увеличьте значение, если вы запускаете
много моделей параллельно (fusion combos) или сталкиваетесь с `FATAL ERROR: Reached heap limit`:

```dotenv
OMNIROUTE_MEMORY_MB=4096
```

Память — это верхний предел heap V8; нативные буферы (SQLite, ONNX, better-sqlite3)
находятся вне его, поэтому задавайте размер контейнера на несколько сотен МБ больше heap.

---

## Локальная сборка бинарного файла (необязательно)

Предпочитаете бинарный файл вместо Docker? Пакет npm содержит тот же код:

```bash
npm install -g omniroute
omniroute
```

Это запускает автономный сервер Next.js напрямую на вашем хосте — те же порты,
тот же `DATA_DIR` (по умолчанию `./data`). Используйте этот вариант, когда нельзя запустить Docker
(например, в строго ограниченной VM). Путь через контейнер, описанный выше, рекомендуется по умолчанию,
потому что он включает ту же среду выполнения, с которой тестировался образ.

Из исходного кода (только для разработки — не способ развёртывания):

```bash
git clone https://github.com/diegosouzapw/OmniRoute.git
cd OmniRoute
npm install
npm run build && npm start
```

---

## Доступ за пределами localhost

**Не** переключайте `APP_BIND_HOST=0.0.0.0` при `REQUIRE_API_KEY=false`. Это
публикует открытый proxy `/v1` на каждом интерфейсе LAN/WAN — любой в
сети сможет израсходовать квоты ваших провайдеров. Порядок строго определён:

1. Установите `REQUIRE_API_KEY=true` в `.env`.
2. Прочитайте `INITIAL_PASSWORD` в логах и войдите в систему.
3. *Только после этого* установите `APP_BIND_HOST=0.0.0.0` (или поставьте перед приложением
   reverse proxy с принудительной аутентификацией и оставьте loopback).

Для TLS / домена запустите Caddy или Traefik перед приложением и оставьте `APP_BIND_HOST`
равным `127.0.0.1`. Готовые к копированию конфигурации reverse proxy см. в разделах
[DOCKER_GUIDE — Caddy HTTPS](../guides/DOCKER_GUIDE.md#docker-compose-with-caddy-https-auto-tls)
и
[Cloudflare Quick Tunnel](../guides/DOCKER_GUIDE.md#cloudflare-quick-tunnel).

---

## Данные, резервные копии и сбросы

- **Каталог данных**: `./data` (монтируется как bind в `/app/data`). Здесь находятся все базы SQLite,
  миграции, журнал аудита и зашифрованные ключи провайдеров.
- **Резервные копии**: автоматическое резервное копирование SQLite включено по умолчанию
  (`DISABLE_SQLITE_AUTO_BACKUP` не задан → включено). Для ручного снимка:
  ```bash
  ./bin/snapshot-data.sh
  ```
  Восстановление — `./bin/restore-data.sh`.
- **Сброс пароля dashboard**:
  ```bash
  docker exec -it omniroute node bin/reset-password.mjs
  ```
- **Сброс политик** (маршрутизация/failover/квоты к заводским значениям):
  ```bash
  docker exec -it omniroute node bin/restore-policies.sh
  ```

---

## Частые проблемы

<details>
<summary><code>docker compose up</code> запускает только Redis</summary>

Вы запускаете **полный** `docker-compose.yml`, сервисы приложения в котором
привязаны к profile. Для пути в одну команду используйте файл self-host:

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

Или, с полным compose, выберите profile:
`docker compose --profile base up -d`.
</details>

<details>
<summary>Healthcheck остаётся в состоянии <code>starting</code> / <code>unhealthy</code></summary>

- Проверьте, что Redis запущен: `docker inspect --format '{{.State.Health.Status}}' omniroute-redis`
- Проверьте логи приложения: `docker logs omniroute`
- Healthcheck выполняет probe `/healthz` и допускает стартовый период 20 с. Медленный
  первый запуск (холодные миграции) может занять больше времени — увеличьте `start_period` в
  файле compose, если ваш диск медленный.
</details>

<details>
<summary><code>FATAL ERROR: Reached heap limit</code> при работе coding agents</summary>

Увеличьте `OMNIROUTE_MEMORY_MB` в `.env` (например, `4096`), затем выполните
`docker compose -f docker-compose.selfhost.yml up -d`. См.
[Размер контейнера](#размер-контейнера).
</details>

<details>
<summary>Web-cookie провайдеры (Gemini Web, Claude Turnstile) завершаются с ошибкой
<code>Executable doesn't exist at .../ms-playwright/chromium</code></summary>

Образ `base` поставляется без Chromium. Compose для self-host использует
опубликованный образ `base`. Для web-cookie провайдеров переключитесь на полный compose
с profile `web` (в который входят Playwright/Chromium):

```bash
docker compose --profile web up -d
```

См. [DOCKER_GUIDE — Available Profiles](../guides/DOCKER_GUIDE.md#available-profiles).
</details>

<details>
<summary>Порт 20128 уже занят</summary>

Задайте в `.env` свободные порты для `DASHBOARD_PORT`, `API_PORT`, `LIVE_WS_PORT` и
повторно выполните `up -d`.
</details>

---

## Чем это намеренно НЕ является

В соответствии с ограничением KISS для self-host этот путь **не** включает:

- ❌ Биллинг SaaS / учёт потребления / тарифные уровни
- ❌ Изоляцию multi-tenant / пространства имён для каждого tenant
- ❌ Размещённое промежуточное звено обработки prompt (ваши prompt идут напрямую провайдеру)
- ❌ Любые встроенные учётные данные или секреты

Это **чисто локальная реализация self-host** — самое простое, что делает обещание
«零月费 + 自托管» реальным.

---

## Чек-лист безопасности (self-host)

Прежде чем открывать доступ за пределами loopback:

- [ ] `REQUIRE_API_KEY=true` в `.env`
- [ ] `INITIAL_PASSWORD` заменён на надёжное уникальное значение
- [ ] `APP_BIND_HOST` оставлен равным `127.0.0.1`, *если только* перед приложением нет proxy с принудительной аутентификацией
- [ ] TLS терминируется Caddy/Traefik/Cloudflare перед приложением (никогда не открытый HTTP в WAN)
- [ ] Redis не опубликован на хосте (compose для self-host уже это обеспечивает)
- [ ] Том `./data` регулярно копируется в резервную копию (`bin/snapshot-data.sh`)
- [ ] Ключи провайдеров ротируются согласно собственной политике провайдера

Полный аудит цепочки поставок / образов / зависимостей см. в
[SECURITY.md](../../SECURITY.md) и
[SUPPLY_CHAIN](../security/SUPPLY_CHAIN.md).

---

## См. также

- [Руководство по Docker](../guides/DOCKER_GUIDE.md) — profiles, Caddy HTTPS, туннели, теги образов
- [Быстрый старт](./QUICK-START.md) — путь на 3 минуты для новых пользователей
- [Руководство по бесплатным уровням](./FREE-TIERS-GUIDE.md) — 150+ бесплатных уровней провайдеров
- [Руководство по провайдерам](./PROVIDERS-GUIDE.md) — подключение и настройка провайдеров
- [Устранение неполадок](../guides/TROUBLESHOOTING.md) — более глубокое решение проблем
