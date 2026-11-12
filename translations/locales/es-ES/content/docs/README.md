---
title: "Documentación de OmniRoute"
version: 3.8.40
lastUpdated: 2026-06-28
---

# Documentación de OmniRoute

Índice navegable del conjunto de documentación de OmniRoute. Los temas se agrupan por finalidad para que pueda encontrar con rapidez lo que necesita.

> ¿Busca la visión general del proyecto, los pasos de instalación o las notas de versión? Consulte los archivos raíz [README.md](../README.md), [ROADMAP.md](../ROADMAP.md), [CHANGELOG.md](../CHANGELOG.md) y [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Para usuarios no técnicos

Guías sencillas para usar OmniRoute, sin necesidad de conocimientos técnicos.

### getting-started/

- [QUICK-START.md](getting-started/QUICK-START.md) — instale y ejecute OmniRoute en 3 minutos.
- [AUTO-COMBO-GUIDE.md](getting-started/AUTO-COMBO-GUIDE.md) — deje que OmniRoute elija la mejor IA por usted.
- [PROVIDERS-GUIDE.md](getting-started/PROVIDERS-GUIDE.md) — cómo conectar proveedores de IA.
- [FREE-TIERS-GUIDE.md](getting-started/FREE-TIERS-GUIDE.md) — obtenga IA gratuita sin tarjeta de crédito.
- [WEB-COOKIE-GUIDE.md](getting-started/WEB-COOKIE-GUIDE.md) — proveedores con cookie web (configuración de credenciales de sesión).

### guides/

- [SETUP_GUIDE.md](guides/SETUP_GUIDE.md) — primera configuración de OmniRoute.
- [USER_GUIDE.md](guides/USER_GUIDE.md) — uso diario del dashboard y de la API.
- [THINKING_BUDGET.md](guides/THINKING_BUDGET.md) — modos de presupuesto de razonamiento (passthrough frente a eliminación automática).
- [FEATURES.md](guides/FEATURES.md) — galería de funciones del dashboard.
- [CHAOS-MODE.md](guides/CHAOS-MODE.md) — ejecución paralela/colaborativa de varios modelos (configuración, permisos, API).
- [TIERS.md](guides/TIERS.md) — los niveles de OmniRoute explicados (guía de usuario).
- [USAGE_QUOTA_GUIDE.md](guides/USAGE_QUOTA_GUIDE.md) — seguimiento de uso, cuota y gasto.
- [COST_TRACKING.md](guides/COST_TRACKING.md) — seguimiento de costes y gasto.
- [FREE_PROVIDER_RANKINGS.md](guides/FREE_PROVIDER_RANKINGS.md) — clasificación de proveedores gratuitos (Arena ELO).
- [DOCKER_GUIDE.md](guides/DOCKER_GUIDE.md) — ejecución de OmniRoute con Docker, incluida la RAM en tiempo de ejecución para coding agents.
- [ELECTRON_GUIDE.md](guides/ELECTRON_GUIDE.md) — compilaciones de escritorio (Electron).
- [TERMUX_GUIDE.md](guides/TERMUX_GUIDE.md) — ejecución en Android mediante Termux.
- [PWA_GUIDE.md](guides/PWA_GUIDE.md) — instalación del dashboard como PWA.
- [REMOTE-MODE.md](guides/REMOTE-MODE.md) — exposición remota de OmniRoute y tokens con alcance limitado.
- [CLI-INTEGRATIONS.md](guides/CLI-INTEGRATIONS.md) — tabla maestra de las integraciones de CLI `setup-*`.
- [OPENCODE-V2-PLUGIN.md](guides/OPENCODE-V2-PLUGIN.md) — instalación y configuración del plugin OpenCode v2.
- [CLAUDE-CODE-CONFIGURATION.md](guides/CLAUDE-CODE-CONFIGURATION.md) — la CLI de Claude Code con OmniRoute.
- [CODEX-CLI-CONFIGURATION.md](guides/CODEX-CLI-CONFIGURATION.md) — la CLI de Codex con OmniRoute.
- [KIRO_SETUP.md](guides/KIRO_SETUP.md) — configuración de Kiro.
- [ANTIGRAVITY-ONBOARDING.md](guides/ANTIGRAVITY-ONBOARDING.md) — incorporación de Antigravity (Google One AI).
- [MANAGEMENT-AUTH.md](guides/MANAGEMENT-AUTH.md) — autenticación de gestión.
- [I18N.md](guides/I18N.md) — flujo de traducción y de locale.
- [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md) — referencia detallada de solución de problemas.
- [UNINSTALL.md](guides/UNINSTALL.md) — pasos para una desinstalación limpia.

---

## Para usuarios técnicos

Documentación técnica para desarrolladores y colaboradores.

## architecture/

Cómo está construido el sistema: lea estos documentos para comprender el entorno de ejecución, la organización del código y el modelo de resiliencia.

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — arquitectura general del sistema (pipeline de solicitudes, capas, módulos).
- [CODEBASE_DOCUMENTATION.md](architecture/CODEBASE_DOCUMENTATION.md) — referencia de ingeniería del código base.
- [REPOSITORY_MAP.md](architecture/REPOSITORY_MAP.md) — guía de navegación directorio por directorio.
- [AUTHZ_GUIDE.md](architecture/AUTHZ_GUIDE.md) — pipeline de autorización (clasificador de rutas y motor de políticas).
- [RESILIENCE_GUIDE.md](architecture/RESILIENCE_GUIDE.md) — circuit breaker de proveedores, connection cooldown y bloqueo de modelos.
- [QUALITY_GATES.md](architecture/QUALITY_GATES.md) — inventario de scripts de quality gate y de trabajos de CI.
- [MONITORING_SECTIONS.md](architecture/MONITORING_SECTIONS.md) — navegación del dashboard de monitorización y costes.
- [cluster-decisions.md](architecture/cluster-decisions.md) — decisiones sobre el profile opcional de sidecar/clúster.
- [DESIGN_SYSTEM.md](architecture/DESIGN_SYSTEM.md) — sistema de diseño e identidad visual.
- [ROUTER_BACKENDS.md](architecture/ROUTER_BACKENDS.md) — contrato de arquitectura de los backends del router y de los servicios integrados (ADR).
- [admission-lanes.md](architecture/admission-lanes.md) — los dos sistemas de carriles de admisión y qué gates controlan cada uno.
- [persistence-backend-boundary.md](architecture/persistence-backend-boundary.md) — límite de persistencia conectable (ADR).

## reference/

Material de consulta: superficie de la API, variables de entorno, opciones de la CLI y catálogo de proveedores.

- [API_REFERENCE.md](reference/API_REFERENCE.md) — endpoints y formatos de la API REST.
- [PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) — catálogo de proveedores generado automáticamente (no editar a mano).
- [REMOVED_PROVIDERS.md](reference/REMOVED_PROVIDERS.md) — proveedores retirados a petición de su operador; no se deben reintroducir sin permiso por escrito.
- [PROVIDER_PLUGIN_MANIFEST.md](reference/PROVIDER_PLUGIN_MANIFEST.md) — contrato de plugin de proveedor seguro para sidecar, para la migración de Bifrost y CLIProxyAPI.
- [openapi.yaml](openapi.yaml) — especificación OpenAPI de la API pública.
- [ENVIRONMENT.md](reference/ENVIRONMENT.md) — referencia de variables de entorno.
- [FEATURE_FLAGS.md](reference/FEATURE_FLAGS.md) — feature flags y sus valores predeterminados.
- [CLI-TOOLS.md](reference/CLI-TOOLS.md) — comandos de CLI incluidos.
- [FREE_TIERS.md](reference/FREE_TIERS.md) — directorio de proveedores de LLM de nivel gratuito.
- [FREE_PROXIES_API.md](reference/FREE_PROXIES_API.md) — API de proxies gratuitos.
- [RELAY_BACKEND_STRATEGY.md](reference/RELAY_BACKEND_STRATEGY.md) — estrategia de backend de relay.
- [RELAY_TROUBLESHOOTING.md](reference/RELAY_TROUBLESHOOTING.md) — solución de problemas de relay.

## frameworks/

Subsistemas conectables expuestos a clientes, agents y operadores.

- [MCP-SERVER.md](frameworks/MCP-SERVER.md) — servidor de Model Context Protocol.
- [A2A-SERVER.md](frameworks/A2A-SERVER.md) — servidor JSON-RPC de Agent-to-Agent (A2A).
- [ACP.md](frameworks/ACP.md) — Agent Client Protocol.
- [AGENT_PROTOCOLS_GUIDE.md](frameworks/AGENT_PROTOCOLS_GUIDE.md) — visión general de A2A / ACP / cloud agent.
- [AGENTBRIDGE.md](frameworks/AGENTBRIDGE.md) — puente de agent para IDE.
- [AGENT-SKILLS.md](frameworks/AGENT-SKILLS.md) — catálogo de skills de agent.
- [CLOUD_AGENT.md](frameworks/CLOUD_AGENT.md) — entorno de ejecución y proveedores de cloud agent.
- [SKILLS.md](frameworks/SKILLS.md) — framework de Skills (extensión en sandbox).
- [MEMORY.md](frameworks/MEMORY.md) — memoria persistente (FTS5 + Qdrant).
- [WEBHOOKS.md](frameworks/WEBHOOKS.md) — eventos y envío de webhooks.
- [EVALS.md](frameworks/EVALS.md) — conjuntos de evaluación.
- [GAMIFICATION.md](frameworks/GAMIFICATION.md) — sistema de gamificación y tabla de clasificación.
- [EMBEDDED-SERVICES.md](frameworks/EMBEDDED-SERVICES.md) — servicios sidecar integrados (9Router, CLIProxyAPI).
- [NOTION_CONTEXT.md](frameworks/NOTION_CONTEXT.md) — fuente de contexto de Notion.
- [OBSIDIAN_CONTEXT.md](frameworks/OBSIDIAN_CONTEXT.md) — fuente de contexto de Obsidian.
- [LOCAL_CORPUS_CONTEXT.md](frameworks/LOCAL_CORPUS_CONTEXT.md) — fuente de contexto de corpus local (directorio aprobado expuesto a MCP).
- [OPENCODE.md](frameworks/OPENCODE.md) — integración con OpenCode.
- [OPEN_SSE_ARCHITECTURE.md](frameworks/OPEN_SSE_ARCHITECTURE.md) — internos del motor de streaming open-sse.
- [PLAYGROUND_STUDIO.md](frameworks/PLAYGROUND_STUDIO.md) — interfaz de Playground Studio.
- [SEARCH_TOOLS_STUDIO.md](frameworks/SEARCH_TOOLS_STUDIO.md) — interfaz de Search Tools Studio.
- [TRAFFIC_INSPECTOR.md](frameworks/TRAFFIC_INSPECTOR.md) — inspector de tráfico (MITM).
- [PLUGINS.md](frameworks/PLUGINS.md) — visión general del sistema de plugins de la CLI.
- [PLUGIN_SDK.md](frameworks/PLUGIN_SDK.md) — referencia del SDK de plugins.
- [PLUGIN_MARKETPLACE.md](frameworks/PLUGIN_MARKETPLACE.md) — marketplace de plugins.
- [RADAR.md](frameworks/RADAR.md) — superposición del catálogo de modelos gratuitos de Radar (opcional, desactivada de forma predeterminada).

## routing/

Enrutamiento de combos, puntuación y reproducción.

- [AUTO-COMBO.md](routing/AUTO-COMBO.md) — Auto-Combo (puntuación multifactor, 19 estrategias).
- [QUOTA_SHARE.md](routing/QUOTA_SHARE.md) — motor de reparto de cuota.
- [REASONING_REPLAY.md](routing/REASONING_REPLAY.md) — caché de reproducción de razonamiento.
- [REASONING_ROUTING.md](routing/REASONING_ROUTING.md) — reglas de enrutamiento de razonamiento (motor de reglas de esfuerzo/presupuesto).

## security/

Guardrails, cumplimiento normativo, stealth y los patrones obligatorios para el manejo de credenciales públicas y mensajes de error.

- [GUARDRAILS.md](security/GUARDRAILS.md) — guardrails de PII, de prompt injection y de visión.
- [COMPLIANCE.md](security/COMPLIANCE.md) — pistas de auditoría y cumplimiento normativo.
- [STEALTH_GUIDE.md](security/STEALTH_GUIDE.md) — stealth de TLS / huella digital.
- [PUBLIC_CREDS.md](security/PUBLIC_CREDS.md) — patrón **obligatorio** para incrustar client_id/secret de OAuth del upstream y claves web de Firebase públicos sin activar los escáneres de secretos.
- [ERROR_SANITIZATION.md](security/ERROR_SANITIZATION.md) — patrón **obligatorio** para canalizar cada respuesta de error a través de `sanitizeErrorMessage` y evitar la exposición de trazas de pila.
- [ROUTE_GUARD_TIERS.md](security/ROUTE_GUARD_TIERS.md) — niveles de clasificación de route-guard.
- [CLI_TOKEN.md](security/CLI_TOKEN.md) — autenticación con el token de ID de máquina de la CLI (HMAC + SHA-256 heredado).
- [EGRESS_POLICY.md](security/EGRESS_POLICY.md) — política de familia de IP de salida (IPv4/IPv6).
- [BAN_DETECTION.md](security/BAN_DETECTION.md) — detección de bloqueo de cuentas y de palabras clave bloqueadas.
- [AGENTROUTER_WAF.md](security/AGENTROUTER_WAF.md) — WAF de agentrouter.org.
- [CORS.md](security/CORS.md) — configuración y seguridad de CORS.
- [MITM-TPROXY-DECRYPT.md](security/MITM-TPROXY-DECRYPT.md) — descifrado MITM transparente.
- [SUPPLY_CHAIN.md](security/SUPPLY_CHAIN.md) — gates de cadena de suministro (SLSA, SBOM, Trivy, osv-scanner, Scorecard).
- [SOCKET_DEV_FINDINGS.md](security/SOCKET_DEV_FINDINGS.md) — atestaciones de hallazgos de cadena de suministro.

## compression/

Motores, reglas y paquetes de idioma de prompt compression.

- [COMPRESSION_GUIDE.md](compression/COMPRESSION_GUIDE.md) — visión general de la compresión.
- [COMPRESSION_ENGINES.md](compression/COMPRESSION_ENGINES.md) — motores de compresión disponibles.
- [COMPRESSION_RULES_FORMAT.md](compression/COMPRESSION_RULES_FORMAT.md) — formato de los archivos de reglas.
- [COMPRESSION_LANGUAGE_PACKS.md](compression/COMPRESSION_LANGUAGE_PACKS.md) — paquetes de idioma.
- [RTK_COMPRESSION.md](compression/RTK_COMPRESSION.md) — análisis en profundidad del motor RTK.
- [CONTEXT_EDITING.md](compression/CONTEXT_EDITING.md) — edición de contexto delegada (Anthropic).
- [EXTENDING_COMPRESSION.md](compression/EXTENDING_COMPRESSION.md) — cómo añadir un motor de compresión personalizado.

## providers/

Guías de integración específicas de cada proveedor.

- [CLAUDE_WEB.md](providers/CLAUDE_WEB.md) — proveedor Claude Web (autenticación por cookie).
- [CHATGPT_WEB.md](providers/CHATGPT_WEB.md) — proveedor ChatGPT Web (Codex) y nota de retirada del proveedor común.
- [COPILOT-M365.md](providers/COPILOT-M365.md) — proveedor Microsoft 365 Copilot (BizChat).
- [ALIBABA-QWEN-PROVIDER-FAMILIES.md](providers/ALIBABA-QWEN-PROVIDER-FAMILIES.md) — familias de proveedores de Alibaba y Qwen.
- [AGENTROUTER.md](providers/AGENTROUTER.md) — configuración de AgentRouter.
- [ZED-DOCKER.md](providers/ZED-DOCKER.md) — integración del IDE Zed con Docker.
- [CURSOR-DOCKER.md](providers/CURSOR-DOCKER.md) — listado de modelos de Cursor con Docker.

## comparison/

- [OMNIROUTE_VS_ALTERNATIVES.md](comparison/OMNIROUTE_VS_ALTERNATIVES.md) — comparación de OmniRoute con sus alternativas.

## ops/

Versiones, despliegue, proxies, túneles, cobertura, base de datos y monitorización.

- [RELEASE_CHECKLIST.md](ops/RELEASE_CHECKLIST.md) — lista de verificación del flujo de versiones.
- [RELEASE_GREEN.md](ops/RELEASE_GREEN.md) — cómo mantener en verde la cola de PR y la rama de versión.
- [BRANCHING_MODEL.md](ops/BRANCHING_MODEL.md) — modelo de ramas y versiones.
- [MERGE_TRAIN.md](ops/MERGE_TRAIN.md) — cola de fusión y guía operativa manual de merge-train.
- [HOMOLOGATION.md](ops/HOMOLOGATION.md) — suite de homologación (`npm run homolog`).
- [QUALITY_GATE_PLAYBOOK.md](ops/QUALITY_GATE_PLAYBOOK.md) — playbook de quality gate.
- [RUNNER_BOX.md](ops/RUNNER_BOX.md) — operación de la máquina de runners self-hosted.
- [BRANCH_PROTECTION_MAIN.md](ops/BRANCH_PROTECTION_MAIN.md) — protección de la rama `main`.
- [CONTRIBUTION_GOLDEN_PATH.md](ops/CONTRIBUTION_GOLDEN_PATH.md) — golden path de contribución (comprobaciones específicas por tipo de cambio).
- [COVERAGE_PLAN.md](ops/COVERAGE_PLAN.md) — plan de cobertura de pruebas.
- [DATABASE_GUIDE.md](ops/DATABASE_GUIDE.md) — esquema y operaciones de la base de datos.
- [SQLITE_RUNTIME.md](ops/SQLITE_RUNTIME.md) — cadena de resolución del controlador de SQLite.
- [REDIS_PRODUCTION_CONFIG.md](ops/REDIS_PRODUCTION_CONFIG.md) — configuración de Redis en producción.
- [MONITORING_GUIDE.md](ops/MONITORING_GUIDE.md) — monitorización y observabilidad.
- [FLY_IO_DEPLOYMENT_GUIDE.md](ops/FLY_IO_DEPLOYMENT_GUIDE.md) — despliegue en Fly.io.
- [VM_DEPLOYMENT_GUIDE.md](ops/VM_DEPLOYMENT_GUIDE.md) — despliegue genérico en una VM.
- [PROXY_GUIDE.md](ops/PROXY_GUIDE.md) — configuración del proxy upstream.
- [TUNNELS_GUIDE.md](ops/TUNNELS_GUIDE.md) — túnel de Cloudflare y similares.

## diagrams/

Fuentes Mermaid y diagramas SVG/PNG exportados a los que hacen referencia los documentos anteriores. Consulte [diagrams/README.md](diagrams/README.md).

## i18n/

Réplicas traducidas de la documentación en 66 locales (más los originales en inglés: 67 idiomas en total). Consulte [i18n/README.md](i18n/README.md) para ver la lista de idiomas admitidos.

## screenshots/

Capturas de pantalla estáticas utilizadas por el dashboard y el README. No forman parte del cuerpo de la documentación.

---

## Artefactos generados automáticamente

- [reference/PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) se genera con `scripts/docs/gen-provider-reference.ts` a partir de `src/shared/constants/providers.ts`. No lo edite a mano.
- La interfaz `/docs` se basa en la generación de código fuente MDX de Fumadocs a partir de las subcarpetas anteriores.
