---
title: "Документация OmniRoute"
version: 3.8.40
lastUpdated: 2026-06-28
---

# Документация OmniRoute

Навигационный указатель по набору документации OmniRoute. Темы сгруппированы по назначению, чтобы вы могли быстро найти нужное.

> Ищете обзор проекта, шаги установки или примечания к выпускам? См. корневые [README.md](../README.md), [ROADMAP.md](../ROADMAP.md), [CHANGELOG.md](../CHANGELOG.md) и [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Для пользователей без технической подготовки

Простые руководства по работе с OmniRoute — технические знания не требуются.

### getting-started/

- [QUICK-START.md](getting-started/QUICK-START.md) — установка и запуск OmniRoute за 3 минуты.
- [AUTO-COMBO-GUIDE.md](getting-started/AUTO-COMBO-GUIDE.md) — пусть OmniRoute сам подберёт для вас лучший ИИ.
- [PROVIDERS-GUIDE.md](getting-started/PROVIDERS-GUIDE.md) — как подключить ИИ-провайдеров.
- [FREE-TIERS-GUIDE.md](getting-started/FREE-TIERS-GUIDE.md) — бесплатный ИИ без банковской карты.
- [WEB-COOKIE-GUIDE.md](getting-started/WEB-COOKIE-GUIDE.md) — веб-провайдеры на cookie (настройка сессионных учётных данных).

### guides/

- [SETUP_GUIDE.md](guides/SETUP_GUIDE.md) — первоначальная настройка OmniRoute.
- [USER_GUIDE.md](guides/USER_GUIDE.md) — повседневная работа с dashboard и API.
- [THINKING_BUDGET.md](guides/THINKING_BUDGET.md) — режимы бюджета рассуждений (passthrough или auto-strip).
- [FEATURES.md](guides/FEATURES.md) — галерея функций dashboard.
- [CHAOS-MODE.md](guides/CHAOS-MODE.md) — параллельное и совместное выполнение несколькими моделями (настройка, разрешения, API).
- [TIERS.md](guides/TIERS.md) — уровни OmniRoute (руководство пользователя).
- [USAGE_QUOTA_GUIDE.md](guides/USAGE_QUOTA_GUIDE.md) — учёт использования, квот и расходов.
- [COST_TRACKING.md](guides/COST_TRACKING.md) — учёт стоимости и расходов.
- [FREE_PROVIDER_RANKINGS.md](guides/FREE_PROVIDER_RANKINGS.md) — рейтинги бесплатных провайдеров (Arena ELO).
- [DOCKER_GUIDE.md](guides/DOCKER_GUIDE.md) — запуск OmniRoute в Docker, включая оперативную память во время работы для coding agent.
- [ELECTRON_GUIDE.md](guides/ELECTRON_GUIDE.md) — сборки для рабочего стола (Electron).
- [TERMUX_GUIDE.md](guides/TERMUX_GUIDE.md) — запуск на Android через Termux.
- [PWA_GUIDE.md](guides/PWA_GUIDE.md) — установка dashboard как PWA.
- [REMOTE-MODE.md](guides/REMOTE-MODE.md) — удалённый доступ к OmniRoute и токены с ограниченной областью действия.
- [CLI-INTEGRATIONS.md](guides/CLI-INTEGRATIONS.md) — сводная таблица интеграций CLI `setup-*`.
- [OPENCODE-V2-PLUGIN.md](guides/OPENCODE-V2-PLUGIN.md) — установка и настройка плагина OpenCode v2.
- [CLAUDE-CODE-CONFIGURATION.md](guides/CLAUDE-CODE-CONFIGURATION.md) — Claude Code CLI с OmniRoute.
- [CODEX-CLI-CONFIGURATION.md](guides/CODEX-CLI-CONFIGURATION.md) — Codex CLI с OmniRoute.
- [KIRO_SETUP.md](guides/KIRO_SETUP.md) — настройка Kiro.
- [ANTIGRAVITY-ONBOARDING.md](guides/ANTIGRAVITY-ONBOARDING.md) — начало работы с Antigravity (Google One AI).
- [MANAGEMENT-AUTH.md](guides/MANAGEMENT-AUTH.md) — аутентификация управления.
- [I18N.md](guides/I18N.md) — процесс перевода и локализации.
- [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md) — подробный справочник по устранению неполадок.
- [UNINSTALL.md](guides/UNINSTALL.md) — шаги полного удаления.

---

## Для технических пользователей

Техническая документация для разработчиков и контрибьюторов.

## architecture/

Как устроена система — прочтите эти документы, чтобы понять среду выполнения, структуру кода и модель отказоустойчивости.

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — общая архитектура системы (конвейер запросов, слои, модули).
- [CODEBASE_DOCUMENTATION.md](architecture/CODEBASE_DOCUMENTATION.md) — инженерный справочник по кодовой базе.
- [REPOSITORY_MAP.md](architecture/REPOSITORY_MAP.md) — навигационный путеводитель по каталогам.
- [AUTHZ_GUIDE.md](architecture/AUTHZ_GUIDE.md) — конвейер авторизации (классификатор маршрутов и policy engine).
- [RESILIENCE_GUIDE.md](architecture/RESILIENCE_GUIDE.md) — circuit breaker провайдера, connection cooldown и блокировка модели.
- [QUALITY_GATES.md](architecture/QUALITY_GATES.md) — перечень скриптов quality-gate и заданий CI.
- [MONITORING_SECTIONS.md](architecture/MONITORING_SECTIONS.md) — навигация по dashboard мониторинга и затрат.
- [cluster-decisions.md](architecture/cluster-decisions.md) — решения по необязательному sidecar/cluster profile.
- [DESIGN_SYSTEM.md](architecture/DESIGN_SYSTEM.md) — дизайн-система и визуальная идентичность.
- [ROUTER_BACKENDS.md](architecture/ROUTER_BACKENDS.md) — контракт архитектуры бэкендов роутера и встроенных сервисов (ADR).
- [admission-lanes.md](architecture/admission-lanes.md) — две системы admission-lane и что управляет каждой из них.
- [persistence-backend-boundary.md](architecture/persistence-backend-boundary.md) — подключаемая граница слоя хранения (ADR).

## reference/

Справочные материалы — API, переменные окружения, флаги CLI, каталог провайдеров.

- [API_REFERENCE.md](reference/API_REFERENCE.md) — REST API: endpoint и их формат.
- [PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) — автоматически сгенерированный каталог провайдеров (не редактировать вручную).
- [REMOVED_PROVIDERS.md](reference/REMOVED_PROVIDERS.md) — провайдеры, удалённые по просьбе их операторов; не возвращать без письменного разрешения.
- [PROVIDER_PLUGIN_MANIFEST.md](reference/PROVIDER_PLUGIN_MANIFEST.md) — безопасный для sidecar контракт плагина провайдера для миграции Bifrost и CLIProxyAPI.
- [openapi.yaml](openapi.yaml) — спецификация OpenAPI для публичного API.
- [ENVIRONMENT.md](reference/ENVIRONMENT.md) — справочник по переменным окружения.
- [FEATURE_FLAGS.md](reference/FEATURE_FLAGS.md) — feature flags и их значения по умолчанию.
- [CLI-TOOLS.md](reference/CLI-TOOLS.md) — встроенные команды CLI.
- [FREE_TIERS.md](reference/FREE_TIERS.md) — каталог провайдеров LLM с бесплатными уровнями.
- [FREE_PROXIES_API.md](reference/FREE_PROXIES_API.md) — API бесплатных proxy.
- [RELAY_BACKEND_STRATEGY.md](reference/RELAY_BACKEND_STRATEGY.md) — стратегия бэкенда relay.
- [RELAY_TROUBLESHOOTING.md](reference/RELAY_TROUBLESHOOTING.md) — устранение неполадок relay.

## frameworks/

Подключаемые подсистемы, доступные клиентам, agent и операторам.

- [MCP-SERVER.md](frameworks/MCP-SERVER.md) — сервер Model Context Protocol.
- [A2A-SERVER.md](frameworks/A2A-SERVER.md) — JSON-RPC-сервер Agent-to-Agent (A2A).
- [ACP.md](frameworks/ACP.md) — Agent Client Protocol.
- [AGENT_PROTOCOLS_GUIDE.md](frameworks/AGENT_PROTOCOLS_GUIDE.md) — обзор A2A / ACP / Cloud agent.
- [AGENTBRIDGE.md](frameworks/AGENTBRIDGE.md) — мост agent для IDE.
- [AGENT-SKILLS.md](frameworks/AGENT-SKILLS.md) — каталог навыков agent.
- [CLOUD_AGENT.md](frameworks/CLOUD_AGENT.md) — среда выполнения и провайдеры cloud agent.
- [SKILLS.md](frameworks/SKILLS.md) — фреймворк Skills (расширение в песочнице).
- [MEMORY.md](frameworks/MEMORY.md) — постоянная память (FTS5 + Qdrant).
- [WEBHOOKS.md](frameworks/WEBHOOKS.md) — события webhook и их отправка.
- [EVALS.md](frameworks/EVALS.md) — наборы eval.
- [GAMIFICATION.md](frameworks/GAMIFICATION.md) — геймификация и система лидерборда.
- [EMBEDDED-SERVICES.md](frameworks/EMBEDDED-SERVICES.md) — встроенные сервисы sidecar (9Router, CLIProxyAPI).
- [NOTION_CONTEXT.md](frameworks/NOTION_CONTEXT.md) — источник контекста Notion.
- [OBSIDIAN_CONTEXT.md](frameworks/OBSIDIAN_CONTEXT.md) — источник контекста Obsidian.
- [LOCAL_CORPUS_CONTEXT.md](frameworks/LOCAL_CORPUS_CONTEXT.md) — источник контекста из локального корпуса (одобренный каталог, доступный через MCP).
- [OPENCODE.md](frameworks/OPENCODE.md) — интеграция с OpenCode.
- [OPEN_SSE_ARCHITECTURE.md](frameworks/OPEN_SSE_ARCHITECTURE.md) — внутреннее устройство потокового движка open-sse.
- [PLAYGROUND_STUDIO.md](frameworks/PLAYGROUND_STUDIO.md) — интерфейс Playground Studio.
- [SEARCH_TOOLS_STUDIO.md](frameworks/SEARCH_TOOLS_STUDIO.md) — интерфейс Search Tools Studio.
- [TRAFFIC_INSPECTOR.md](frameworks/TRAFFIC_INSPECTOR.md) — инспектор трафика (MITM).
- [PLUGINS.md](frameworks/PLUGINS.md) — обзор системы плагинов CLI.
- [PLUGIN_SDK.md](frameworks/PLUGIN_SDK.md) — справочник по SDK плагинов.
- [PLUGIN_MARKETPLACE.md](frameworks/PLUGIN_MARKETPLACE.md) — маркетплейс плагинов.
- [RADAR.md](frameworks/RADAR.md) — наложение каталога бесплатных моделей Radar (необязательно, по умолчанию выключено).

## routing/

Маршрутизация combo, оценка и повторное воспроизведение.

- [AUTO-COMBO.md](routing/AUTO-COMBO.md) — Auto-Combo (многофакторная оценка, 19 стратегий).
- [QUOTA_SHARE.md](routing/QUOTA_SHARE.md) — механизм совместного использования квот.
- [REASONING_REPLAY.md](routing/REASONING_REPLAY.md) — кэш повторного воспроизведения рассуждений.
- [REASONING_ROUTING.md](routing/REASONING_ROUTING.md) — правила маршрутизации рассуждений (движок правил effort/budget).

## security/

Guardrail, соответствие требованиям, stealth и обязательные шаблоны работы с публичными учётными данными и сообщениями об ошибках.

- [GUARDRAILS.md](security/GUARDRAILS.md) — PII, prompt injection, guardrail для vision.
- [COMPLIANCE.md](security/COMPLIANCE.md) — журналы аудита и соответствие требованиям.
- [STEALTH_GUIDE.md](security/STEALTH_GUIDE.md) — TLS / stealth отпечатков.
- [PUBLIC_CREDS.md](security/PUBLIC_CREDS.md) — **обязательный** шаблон встраивания публичных OAuth client_id/secret и Firebase Web-ключей upstream без срабатывания сканеров секретов.
- [ERROR_SANITIZATION.md](security/ERROR_SANITIZATION.md) — **обязательный** шаблон, по которому каждый ответ об ошибке проходит через `sanitizeErrorMessage`, чтобы не раскрывать трассировки стека.
- [ROUTE_GUARD_TIERS.md](security/ROUTE_GUARD_TIERS.md) — уровни классификации route-guard.
- [CLI_TOKEN.md](security/CLI_TOKEN.md) — аутентификация токеном machine-ID для CLI (HMAC и устаревший SHA-256).
- [EGRESS_POLICY.md](security/EGRESS_POLICY.md) — политика семейства egress IP (IPv4/IPv6).
- [BAN_DETECTION.md](security/BAN_DETECTION.md) — обнаружение блокировки учётной записи и запрещённых ключевых слов.
- [AGENTROUTER_WAF.md](security/AGENTROUTER_WAF.md) — WAF agentrouter.org.
- [CORS.md](security/CORS.md) — конфигурация и безопасность CORS.
- [MITM-TPROXY-DECRYPT.md](security/MITM-TPROXY-DECRYPT.md) — прозрачная расшифровка MITM.
- [SUPPLY_CHAIN.md](security/SUPPLY_CHAIN.md) — gate цепочки поставок (SLSA, SBOM, Trivy, osv-scanner, Scorecard).
- [SOCKET_DEV_FINDINGS.md](security/SOCKET_DEV_FINDINGS.md) — аттестации находок по цепочке поставок.

## compression/

Движки сжатия prompt, правила и языковые пакеты.

- [COMPRESSION_GUIDE.md](compression/COMPRESSION_GUIDE.md) — общий обзор сжатия.
- [COMPRESSION_ENGINES.md](compression/COMPRESSION_ENGINES.md) — доступные движки сжатия.
- [COMPRESSION_RULES_FORMAT.md](compression/COMPRESSION_RULES_FORMAT.md) — формат файла правил.
- [COMPRESSION_LANGUAGE_PACKS.md](compression/COMPRESSION_LANGUAGE_PACKS.md) — языковые пакеты.
- [RTK_COMPRESSION.md](compression/RTK_COMPRESSION.md) — подробный разбор движка RTK.
- [CONTEXT_EDITING.md](compression/CONTEXT_EDITING.md) — делегированное редактирование контекста (Anthropic).
- [EXTENDING_COMPRESSION.md](compression/EXTENDING_COMPRESSION.md) — добавление собственного движка сжатия.

## providers/

Руководства по интеграции конкретных провайдеров.

- [CLAUDE_WEB.md](providers/CLAUDE_WEB.md) — провайдер Claude Web (аутентификация через cookie).
- [CHATGPT_WEB.md](providers/CHATGPT_WEB.md) — провайдер ChatGPT Web (Codex) и примечание о выводе из эксплуатации распространённого провайдера.
- [COPILOT-M365.md](providers/COPILOT-M365.md) — провайдер Microsoft 365 Copilot (BizChat).
- [ALIBABA-QWEN-PROVIDER-FAMILIES.md](providers/ALIBABA-QWEN-PROVIDER-FAMILIES.md) — семейства провайдеров Alibaba и Qwen.
- [AGENTROUTER.md](providers/AGENTROUTER.md) — настройка AgentRouter.
- [ZED-DOCKER.md](providers/ZED-DOCKER.md) — интеграция Zed IDE в Docker.
- [CURSOR-DOCKER.md](providers/CURSOR-DOCKER.md) — список моделей Cursor в Docker.

## comparison/

- [OMNIROUTE_VS_ALTERNATIVES.md](comparison/OMNIROUTE_VS_ALTERNATIVES.md) — сравнение OmniRoute с альтернативами.

## ops/

Выпуски, развёртывание, proxy, туннели, покрытие, база данных, мониторинг.

- [RELEASE_CHECKLIST.md](ops/RELEASE_CHECKLIST.md) — контрольный список процесса выпуска.
- [RELEASE_GREEN.md](ops/RELEASE_GREEN.md) — поддержание очереди PR и ветки выпуска в «зелёном» состоянии.
- [BRANCHING_MODEL.md](ops/BRANCHING_MODEL.md) — модель ветвления и выпусков.
- [MERGE_TRAIN.md](ops/MERGE_TRAIN.md) — очередь слияний и ручной runbook merge-train.
- [HOMOLOGATION.md](ops/HOMOLOGATION.md) — набор проверок homologation (`npm run homolog`).
- [QUALITY_GATE_PLAYBOOK.md](ops/QUALITY_GATE_PLAYBOOK.md) — playbook по quality-gate.
- [RUNNER_BOX.md](ops/RUNNER_BOX.md) — эксплуатация self-hosted runner box.
- [BRANCH_PROTECTION_MAIN.md](ops/BRANCH_PROTECTION_MAIN.md) — защита ветки `main`.
- [CONTRIBUTION_GOLDEN_PATH.md](ops/CONTRIBUTION_GOLDEN_PATH.md) — «золотой путь» вклада (целевые проверки для каждого типа изменений).
- [COVERAGE_PLAN.md](ops/COVERAGE_PLAN.md) — план покрытия тестами.
- [DATABASE_GUIDE.md](ops/DATABASE_GUIDE.md) — схема БД и операции.
- [SQLITE_RUNTIME.md](ops/SQLITE_RUNTIME.md) — цепочка выбора драйвера SQLite.
- [REDIS_PRODUCTION_CONFIG.md](ops/REDIS_PRODUCTION_CONFIG.md) — конфигурация Redis для production.
- [MONITORING_GUIDE.md](ops/MONITORING_GUIDE.md) — мониторинг и наблюдаемость.
- [FLY_IO_DEPLOYMENT_GUIDE.md](ops/FLY_IO_DEPLOYMENT_GUIDE.md) — развёртывание на Fly.io.
- [VM_DEPLOYMENT_GUIDE.md](ops/VM_DEPLOYMENT_GUIDE.md) — развёртывание на произвольной ВМ.
- [PROXY_GUIDE.md](ops/PROXY_GUIDE.md) — настройка upstream proxy.
- [TUNNELS_GUIDE.md](ops/TUNNELS_GUIDE.md) — туннель Cloudflare и аналоги.

## diagrams/

Исходники Mermaid и экспортированные диаграммы SVG/PNG, на которые ссылаются документы выше. См. [diagrams/README.md](diagrams/README.md).

## i18n/

Переведённые копии документации на 66 локалях (плюс английские оригиналы — всего 67 языков). Список поддерживаемых языков см. в [i18n/README.md](i18n/README.md).

## screenshots/

Статические скриншоты, используемые в dashboard и README. Не являются частью тела документации.

---

## Автоматически генерируемые артефакты

- [reference/PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) генерируется скриптом `scripts/docs/gen-provider-reference.ts` из `src/shared/constants/providers.ts`. Не редактировать вручную.
- Интерфейс `/docs` опирается на генерацию источников Fumadocs MDX из перечисленных выше подкаталогов.
