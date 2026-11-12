---
title: "Documentação do OmniRoute"
version: 3.8.40
lastUpdated: 2026-06-28
---

# Documentação do OmniRoute

Índice navegável do conjunto de documentação do OmniRoute. Os tópicos são agrupados por finalidade para que você encontre rapidamente o que precisa.

> Procurando a visão geral do projeto, as etapas de instalação ou as notas de versão? Consulte o [README.md](../README.md) da raiz, o [ROADMAP.md](../ROADMAP.md), o [CHANGELOG.md](../CHANGELOG.md) e o [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Para usuários não técnicos

Guias simples para usar o OmniRoute, sem necessidade de conhecimento técnico.

### getting-started/

- [QUICK-START.md](getting-started/QUICK-START.md) — instale e execute o OmniRoute em 3 minutos.
- [AUTO-COMBO-GUIDE.md](getting-started/AUTO-COMBO-GUIDE.md) — deixe o OmniRoute escolher a melhor IA para você.
- [PROVIDERS-GUIDE.md](getting-started/PROVIDERS-GUIDE.md) — como conectar provedores de IA.
- [FREE-TIERS-GUIDE.md](getting-started/FREE-TIERS-GUIDE.md) — use IA gratuita sem cartão de crédito.
- [WEB-COOKIE-GUIDE.md](getting-started/WEB-COOKIE-GUIDE.md) — provedores de cookie web (configuração de credenciais de sessão).

### guides/

- [SETUP_GUIDE.md](guides/SETUP_GUIDE.md) — primeira configuração do OmniRoute.
- [USER_GUIDE.md](guides/USER_GUIDE.md) — uso diário do dashboard e da API.
- [THINKING_BUDGET.md](guides/THINKING_BUDGET.md) — modos de orçamento de thinking/reasoning (passthrough vs auto-strip).
- [FEATURES.md](guides/FEATURES.md) — galeria de recursos do dashboard.
- [CHAOS-MODE.md](guides/CHAOS-MODE.md) — execução paralela/colaborativa com vários modelos (configuração, permissões, API).
- [TIERS.md](guides/TIERS.md) — os níveis do OmniRoute explicados (guia do usuário).
- [USAGE_QUOTA_GUIDE.md](guides/USAGE_QUOTA_GUIDE.md) — acompanhamento de uso, cota e gastos.
- [COST_TRACKING.md](guides/COST_TRACKING.md) — acompanhamento de custos e gastos.
- [FREE_PROVIDER_RANKINGS.md](guides/FREE_PROVIDER_RANKINGS.md) — rankings de provedores gratuitos (Arena ELO).
- [DOCKER_GUIDE.md](guides/DOCKER_GUIDE.md) — execução do OmniRoute no Docker, incluindo a RAM de runtime para coding agents.
- [ELECTRON_GUIDE.md](guides/ELECTRON_GUIDE.md) — builds desktop (Electron).
- [TERMUX_GUIDE.md](guides/TERMUX_GUIDE.md) — execução no Android via Termux.
- [PWA_GUIDE.md](guides/PWA_GUIDE.md) — instalação do dashboard como PWA.
- [REMOTE-MODE.md](guides/REMOTE-MODE.md) — exposição remota do OmniRoute + tokens com escopo.
- [CLI-INTEGRATIONS.md](guides/CLI-INTEGRATIONS.md) — tabela principal das integrações de CLI `setup-*`.
- [OPENCODE-V2-PLUGIN.md](guides/OPENCODE-V2-PLUGIN.md) — instalação e configuração do plugin OpenCode v2.
- [CLAUDE-CODE-CONFIGURATION.md](guides/CLAUDE-CODE-CONFIGURATION.md) — a CLI do Claude Code com o OmniRoute.
- [CODEX-CLI-CONFIGURATION.md](guides/CODEX-CLI-CONFIGURATION.md) — a CLI do Codex com o OmniRoute.
- [KIRO_SETUP.md](guides/KIRO_SETUP.md) — configuração do Kiro.
- [ANTIGRAVITY-ONBOARDING.md](guides/ANTIGRAVITY-ONBOARDING.md) — onboarding do Antigravity (Google One AI).
- [MANAGEMENT-AUTH.md](guides/MANAGEMENT-AUTH.md) — autenticação de gerenciamento.
- [I18N.md](guides/I18N.md) — fluxo de tradução e de locale.
- [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md) — referência detalhada de solução de problemas.
- [UNINSTALL.md](guides/UNINSTALL.md) — etapas de remoção completa.

---

## Para usuários técnicos

Documentação técnica para desenvolvedores e colaboradores.

## architecture/

Como o sistema é montado — leia estes documentos para entender o runtime, a organização do código e o modelo de resiliência.

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — arquitetura geral do sistema (pipeline de requisição, camadas, módulos).
- [CODEBASE_DOCUMENTATION.md](architecture/CODEBASE_DOCUMENTATION.md) — referência de engenharia do código.
- [REPOSITORY_MAP.md](architecture/REPOSITORY_MAP.md) — guia de navegação diretório por diretório.
- [AUTHZ_GUIDE.md](architecture/AUTHZ_GUIDE.md) — pipeline de autorização (classificador de rotas + mecanismo de políticas).
- [RESILIENCE_GUIDE.md](architecture/RESILIENCE_GUIDE.md) — circuit breaker do provedor, connection cooldown e bloqueio de modelo.
- [QUALITY_GATES.md](architecture/QUALITY_GATES.md) — inventário de scripts de quality-gate e jobs de CI.
- [MONITORING_SECTIONS.md](architecture/MONITORING_SECTIONS.md) — navegação do dashboard de monitoramento/custos.
- [cluster-decisions.md](architecture/cluster-decisions.md) — decisões sobre o profile opcional de sidecar/cluster.
- [DESIGN_SYSTEM.md](architecture/DESIGN_SYSTEM.md) — design system e identidade visual.
- [ROUTER_BACKENDS.md](architecture/ROUTER_BACKENDS.md) — contrato de arquitetura de backends de roteador e serviços embarcados (ADR).
- [admission-lanes.md](architecture/admission-lanes.md) — os dois sistemas de admission-lane e o que faz o gate de cada um.
- [persistence-backend-boundary.md](architecture/persistence-backend-boundary.md) — limite de persistência plugável (ADR).

## reference/

Material de consulta — superfície da API, variáveis de ambiente, flags da CLI, catálogo de provedores.

- [API_REFERENCE.md](reference/API_REFERENCE.md) — endpoints REST e seus formatos.
- [PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) — catálogo de provedores gerado automaticamente (não edite manualmente).
- [REMOVED_PROVIDERS.md](reference/REMOVED_PROVIDERS.md) — provedores removidos a pedido de seu operador; nunca os reintroduza sem permissão por escrito.
- [PROVIDER_PLUGIN_MANIFEST.md](reference/PROVIDER_PLUGIN_MANIFEST.md) — contrato de plugin de provedor seguro para sidecar, para a migração do Bifrost e do CLIProxyAPI.
- [openapi.yaml](openapi.yaml) — especificação OpenAPI da API pública.
- [ENVIRONMENT.md](reference/ENVIRONMENT.md) — referência das variáveis de ambiente.
- [FEATURE_FLAGS.md](reference/FEATURE_FLAGS.md) — feature flags e seus valores padrão.
- [CLI-TOOLS.md](reference/CLI-TOOLS.md) — comandos de CLI incluídos.
- [FREE_TIERS.md](reference/FREE_TIERS.md) — diretório de provedores de LLM com nível gratuito.
- [FREE_PROXIES_API.md](reference/FREE_PROXIES_API.md) — API de proxies gratuitos.
- [RELAY_BACKEND_STRATEGY.md](reference/RELAY_BACKEND_STRATEGY.md) — estratégia de backend de relay.
- [RELAY_TROUBLESHOOTING.md](reference/RELAY_TROUBLESHOOTING.md) — solução de problemas de relay.

## frameworks/

Subsistemas plugáveis expostos a clientes, agents e operadores.

- [MCP-SERVER.md](frameworks/MCP-SERVER.md) — servidor do Model Context Protocol.
- [A2A-SERVER.md](frameworks/A2A-SERVER.md) — servidor JSON-RPC do Agent-to-Agent (A2A).
- [ACP.md](frameworks/ACP.md) — Agent Client Protocol.
- [AGENT_PROTOCOLS_GUIDE.md](frameworks/AGENT_PROTOCOLS_GUIDE.md) — visão geral de A2A / ACP / Cloud agent.
- [AGENTBRIDGE.md](frameworks/AGENTBRIDGE.md) — bridge de agent para IDE.
- [AGENT-SKILLS.md](frameworks/AGENT-SKILLS.md) — catálogo de agent skills.
- [CLOUD_AGENT.md](frameworks/CLOUD_AGENT.md) — runtime e provedores de cloud agent.
- [SKILLS.md](frameworks/SKILLS.md) — framework de Skills (extensão em sandbox).
- [MEMORY.md](frameworks/MEMORY.md) — memória persistente (FTS5 + Qdrant).
- [WEBHOOKS.md](frameworks/WEBHOOKS.md) — eventos e despacho de webhooks.
- [EVALS.md](frameworks/EVALS.md) — suítes de eval.
- [GAMIFICATION.md](frameworks/GAMIFICATION.md) — sistema de gamificação e leaderboard.
- [EMBEDDED-SERVICES.md](frameworks/EMBEDDED-SERVICES.md) — serviços sidecar embarcados (9Router, CLIProxyAPI).
- [NOTION_CONTEXT.md](frameworks/NOTION_CONTEXT.md) — fonte de contexto do Notion.
- [OBSIDIAN_CONTEXT.md](frameworks/OBSIDIAN_CONTEXT.md) — fonte de contexto do Obsidian.
- [LOCAL_CORPUS_CONTEXT.md](frameworks/LOCAL_CORPUS_CONTEXT.md) — fonte de contexto de corpus local (diretório aprovado exposto ao MCP).
- [OPENCODE.md](frameworks/OPENCODE.md) — integração com o OpenCode.
- [OPEN_SSE_ARCHITECTURE.md](frameworks/OPEN_SSE_ARCHITECTURE.md) — detalhes internos do mecanismo de streaming open-sse.
- [PLAYGROUND_STUDIO.md](frameworks/PLAYGROUND_STUDIO.md) — UI do Playground Studio.
- [SEARCH_TOOLS_STUDIO.md](frameworks/SEARCH_TOOLS_STUDIO.md) — UI do Search Tools Studio.
- [TRAFFIC_INSPECTOR.md](frameworks/TRAFFIC_INSPECTOR.md) — inspetor de tráfego (MITM).
- [PLUGINS.md](frameworks/PLUGINS.md) — visão geral do sistema de plugins da CLI.
- [PLUGIN_SDK.md](frameworks/PLUGIN_SDK.md) — referência do SDK de plugins.
- [PLUGIN_MARKETPLACE.md](frameworks/PLUGIN_MARKETPLACE.md) — marketplace de plugins.
- [RADAR.md](frameworks/RADAR.md) — sobreposição do catálogo de modelos gratuitos do Radar (opcional, desativada por padrão).

## routing/

Roteamento de combos, pontuação e replay.

- [AUTO-COMBO.md](routing/AUTO-COMBO.md) — Auto-Combo (pontuação multifator, 19 estratégias).
- [QUOTA_SHARE.md](routing/QUOTA_SHARE.md) — mecanismo de compartilhamento de cota.
- [REASONING_REPLAY.md](routing/REASONING_REPLAY.md) — cache de replay de reasoning.
- [REASONING_ROUTING.md](routing/REASONING_ROUTING.md) — regras de roteamento de reasoning (mecanismo de regras de effort/orçamento).

## security/

Guardrails, conformidade, stealth e os padrões obrigatórios para lidar com credenciais públicas e mensagens de erro.

- [GUARDRAILS.md](security/GUARDRAILS.md) — guardrails de PII, de prompt injection e de visão.
- [COMPLIANCE.md](security/COMPLIANCE.md) — trilhas de auditoria e conformidade.
- [STEALTH_GUIDE.md](security/STEALTH_GUIDE.md) — stealth de TLS / fingerprint.
- [PUBLIC_CREDS.md](security/PUBLIC_CREDS.md) — padrão **obrigatório** para incorporar client_id/secret OAuth públicos de upstream e chaves Firebase Web sem acionar scanners de segredos.
- [ERROR_SANITIZATION.md](security/ERROR_SANITIZATION.md) — padrão **obrigatório** para encaminhar toda resposta de erro por `sanitizeErrorMessage` e evitar a exposição de stack traces.
- [ROUTE_GUARD_TIERS.md](security/ROUTE_GUARD_TIERS.md) — níveis de classificação do route-guard.
- [CLI_TOKEN.md](security/CLI_TOKEN.md) — autenticação por token de machine-ID da CLI (HMAC + SHA-256 legado).
- [EGRESS_POLICY.md](security/EGRESS_POLICY.md) — política de família de IP de saída (IPv4/IPv6).
- [BAN_DETECTION.md](security/BAN_DETECTION.md) — detecção de banimento de conta / de palavras-chave banidas.
- [AGENTROUTER_WAF.md](security/AGENTROUTER_WAF.md) — WAF do agentrouter.org.
- [CORS.md](security/CORS.md) — configuração e segurança de CORS.
- [MITM-TPROXY-DECRYPT.md](security/MITM-TPROXY-DECRYPT.md) — descriptografia MITM transparente.
- [SUPPLY_CHAIN.md](security/SUPPLY_CHAIN.md) — gates de cadeia de suprimentos (SLSA, SBOM, Trivy, osv-scanner, Scorecard).
- [SOCKET_DEV_FINDINGS.md](security/SOCKET_DEV_FINDINGS.md) — atestações de achados da cadeia de suprimentos.

## compression/

Mecanismos de compressão de prompt, regras e language packs.

- [COMPRESSION_GUIDE.md](compression/COMPRESSION_GUIDE.md) — visão geral de alto nível da compressão.
- [COMPRESSION_ENGINES.md](compression/COMPRESSION_ENGINES.md) — mecanismos de compressão disponíveis.
- [COMPRESSION_RULES_FORMAT.md](compression/COMPRESSION_RULES_FORMAT.md) — formato do arquivo de regras.
- [COMPRESSION_LANGUAGE_PACKS.md](compression/COMPRESSION_LANGUAGE_PACKS.md) — language packs.
- [RTK_COMPRESSION.md](compression/RTK_COMPRESSION.md) — análise aprofundada do mecanismo RTK.
- [CONTEXT_EDITING.md](compression/CONTEXT_EDITING.md) — edição de contexto delegada (Anthropic).
- [EXTENDING_COMPRESSION.md](compression/EXTENDING_COMPRESSION.md) — como adicionar um mecanismo de compressão personalizado.

## providers/

Guias de integração específicos de cada provedor.

- [CLAUDE_WEB.md](providers/CLAUDE_WEB.md) — provedor Claude Web (autenticação por cookie).
- [CHATGPT_WEB.md](providers/CHATGPT_WEB.md) — provedor ChatGPT Web (Codex) e nota de descontinuação do provedor comum.
- [COPILOT-M365.md](providers/COPILOT-M365.md) — provedor Microsoft 365 Copilot (BizChat).
- [ALIBABA-QWEN-PROVIDER-FAMILIES.md](providers/ALIBABA-QWEN-PROVIDER-FAMILIES.md) — famílias de provedores Alibaba e Qwen.
- [AGENTROUTER.md](providers/AGENTROUTER.md) — configuração do AgentRouter.
- [ZED-DOCKER.md](providers/ZED-DOCKER.md) — integração com o Zed IDE no Docker.
- [CURSOR-DOCKER.md](providers/CURSOR-DOCKER.md) — listagem de modelos do Cursor no Docker.

## comparison/

- [OMNIROUTE_VS_ALTERNATIVES.md](comparison/OMNIROUTE_VS_ALTERNATIVES.md) — como o OmniRoute se compara às alternativas.

## ops/

Release, implantação, proxies, túneis, cobertura, banco de dados, monitoramento.

- [RELEASE_CHECKLIST.md](ops/RELEASE_CHECKLIST.md) — checklist do fluxo de release.
- [RELEASE_GREEN.md](ops/RELEASE_GREEN.md) — como manter a fila de PRs e o branch de release verdes.
- [BRANCHING_MODEL.md](ops/BRANCHING_MODEL.md) — modelo de branches e de release.
- [MERGE_TRAIN.md](ops/MERGE_TRAIN.md) — fila de merge e runbook manual de merge-train.
- [HOMOLOGATION.md](ops/HOMOLOGATION.md) — suíte de homologação (`npm run homolog`).
- [QUALITY_GATE_PLAYBOOK.md](ops/QUALITY_GATE_PLAYBOOK.md) — playbook de quality-gate.
- [RUNNER_BOX.md](ops/RUNNER_BOX.md) — operações da runner box self-hosted.
- [BRANCH_PROTECTION_MAIN.md](ops/BRANCH_PROTECTION_MAIN.md) — proteção do branch `main`.
- [CONTRIBUTION_GOLDEN_PATH.md](ops/CONTRIBUTION_GOLDEN_PATH.md) — golden path de contribuição (verificações focadas por tipo de mudança).
- [COVERAGE_PLAN.md](ops/COVERAGE_PLAN.md) — plano de cobertura de testes.
- [DATABASE_GUIDE.md](ops/DATABASE_GUIDE.md) — esquema e operações do banco de dados.
- [SQLITE_RUNTIME.md](ops/SQLITE_RUNTIME.md) — cadeia de resolução do driver SQLite.
- [REDIS_PRODUCTION_CONFIG.md](ops/REDIS_PRODUCTION_CONFIG.md) — configuração de produção do Redis.
- [MONITORING_GUIDE.md](ops/MONITORING_GUIDE.md) — monitoramento e observabilidade.
- [FLY_IO_DEPLOYMENT_GUIDE.md](ops/FLY_IO_DEPLOYMENT_GUIDE.md) — implantação no Fly.io.
- [VM_DEPLOYMENT_GUIDE.md](ops/VM_DEPLOYMENT_GUIDE.md) — implantação genérica em VM.
- [PROXY_GUIDE.md](ops/PROXY_GUIDE.md) — configuração de proxy upstream.
- [TUNNELS_GUIDE.md](ops/TUNNELS_GUIDE.md) — túnel Cloudflare e afins.

## diagrams/

Fontes Mermaid e diagramas SVG/PNG exportados, referenciados nos documentos acima. Consulte [diagrams/README.md](diagrams/README.md).

## i18n/

Espelhos traduzidos da documentação em 66 locales (mais os originais em inglês — 67 idiomas no total). Consulte [i18n/README.md](i18n/README.md) para ver a lista de idiomas compatíveis.

## screenshots/

Capturas de tela estáticas usadas pelo dashboard e pelo README. Não fazem parte do corpo do documento.

---

## Artefatos gerados automaticamente

- [reference/PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) é gerado por `scripts/docs/gen-provider-reference.ts` a partir de `src/shared/constants/providers.ts`. Não edite manualmente.
- A UI de `/docs` é sustentada pela geração de fonte MDX do Fumadocs a partir das subpastas acima.
