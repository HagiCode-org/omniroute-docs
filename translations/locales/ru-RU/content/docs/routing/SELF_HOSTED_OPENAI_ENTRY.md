---
title: "Self-hosted OpenAI-совместимая точка входа"
---

# Self-hosted единая OpenAI-совместимая точка входа

При включении существующий `/v1/chat/completions` OmniRoute (и OpenAI-совместимый
контракт, который он обслуживает) становится **self-hosted gateway**: один OpenAI-совместимый запрос
на входе, автоматическая маршрутизация к выбранному вами провайдеру через адаптеры провайдеров и
стандартный формат ошибки OpenAI на выходе. Клиентский код не меняется.

Это отличительная особенность D4 (接入即用) из дизайна RIC-697: тот же путь `/v1`,
на который уже нацелен OpenAI SDK, но поверх ваших собственных провайдеров, а не одного
встроенного каталога.

## Включение

Задайте любую из переменных окружения (обе показаны в `.env.example`):

- `OMNIROUTE_SELF_HOSTED_PROVIDERS` — встроенный документ YAML (только в runtime, не логируется).
- `OMNIROUTE_SELF_HOSTED_PROVIDERS_FILE` — путь к файлу YAML.

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

Если задана **любая** из переменных, единая точка входа активна для каждого запроса к
`/v1/chat/completions`. Если конфигурация есть, но не разбирается, возвращается `500` (запрос никогда
молча не уходит в облачную маршрутизацию). Если не задана ни одна, маршрут ведёт себя
точно так же, как раньше.

## Автомаршрутизация к провайдеру

Приоритет (детерминированный, без предиктивной модели):

1. Заголовок `x-omniroute-provider: <id>` — точный ID провайдера.
2. Префикс `model`: `provider/model` (косая черта) или `provider::model` (двойное двоеточие).
3. Первый настроенный провайдер.

Префикс маршрутизации удаляется перед пересылкой — upstream получает чистое имя модели
(`claude-sonnet`, а не `claude/claude-sonnet`).

```bash
# via header
curl http://localhost:20128/v1/chat/completions \
  -H "x-omniroute-provider: claude" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet","messages":[{"role":"user","content":"hi"}]}'

# or via model prefix
curl ... -d '{"model":"claude/claude-sonnet","messages":[...]}'
```

## Заготовка аутентификации (зарезервировано под D5)

Необязательная переменная `OMNIROUTE_SELF_HOSTED_API_KEY`. Если она задана, запросы должны содержать
`Authorization: Bearer <key>`. Если не задана — открытый маршрут (loopback / доверенная сеть),
как работают существующие локальные провайдеры OmniRoute. Ожидается, что этот заголовок перейдёт под управление
системы ключей D5 quota/quota-自治.

## Контракт при сбоях

- Тело ответа upstream с кодом не 2xx нормализуется через `parseUpstreamError` + `buildErrorBody`
  в стандартный формат `error` OpenAI (Hard Rule #12 — никогда не сырой текст upstream).
- Сбои на сетевом уровне (отказ соединения / DNS / TLS) возвращают нормализованный `502`
  с `error.message: "Upstream provider unreachable: …"`.
- Заголовки учётных данных и сессии, возвращаемые upstream, удаляются из каждого ответа.

## Тесты

`tests/unit/self-hosted-entry.test.ts` охватывает выбор провайдера, пересылку
префикса модели, гигиену заголовков, аутентификацию, нормализацию ошибок upstream, сквозную передачу потока SSE
и пути fall-through / неверной конфигурации — всё по реальному HTTP к
локальному upstream.

## Примечания

- Self-hosted модели намеренно обходят механизмы снятия с поддержки и алиасов, действующие только в облаке:
  переключение происходит до этих облачных проверок, поэтому идентификаторы вроде `local/llama3` никогда
  не вызывают ответы 410 облачных peer и не подвергаются переписыванию алиасов.
- Детерминированные стратегии маршрутизации (fallback / cooldown / стоимость / задержка / blacklist)
  относятся к области M2 (`RIC-740`) и подключаются здесь к слою gateway. Настройте
  их блоком `strategy:` — см. [DETERMINISTIC_ROUTING.md](./DETERMINISTIC_ROUTING.md).
