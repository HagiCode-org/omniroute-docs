---
title: "Documentation d'OmniRoute"
version: 3.8.40
lastUpdated: 2026-06-28
---

# Documentation d'OmniRoute

Index navigable de l'ensemble de la documentation d'OmniRoute. Les sujets sont regroupés par intention afin que vous trouviez rapidement ce dont vous avez besoin.

> Vous cherchez la présentation du projet, les étapes d'installation ou les notes de version ? Consultez le [README.md](../README.md) racine, ainsi que [ROADMAP.md](../ROADMAP.md), [CHANGELOG.md](../CHANGELOG.md) et [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Pour les utilisateurs non techniques

Des guides simples pour utiliser OmniRoute — aucune connaissance technique requise.

### getting-started/

- [QUICK-START.md](getting-started/QUICK-START.md) — installez et lancez OmniRoute en 3 minutes.
- [AUTO-COMBO-GUIDE.md](getting-started/AUTO-COMBO-GUIDE.md) — laissez OmniRoute choisir la meilleure IA pour vous.
- [PROVIDERS-GUIDE.md](getting-started/PROVIDERS-GUIDE.md) — comment connecter des fournisseurs d'IA.
- [FREE-TIERS-GUIDE.md](getting-started/FREE-TIERS-GUIDE.md) — obtenez de l'IA gratuite sans carte bancaire.
- [WEB-COOKIE-GUIDE.md](getting-started/WEB-COOKIE-GUIDE.md) — fournisseurs par cookie web (configuration des identifiants de session).

### guides/

- [SETUP_GUIDE.md](guides/SETUP_GUIDE.md) — première configuration d'OmniRoute.
- [USER_GUIDE.md](guides/USER_GUIDE.md) — utilisation quotidienne du dashboard et de l'API.
- [THINKING_BUDGET.md](guides/THINKING_BUDGET.md) — modes de budget de réflexion/raisonnement (passthrough ou suppression automatique).
- [FEATURES.md](guides/FEATURES.md) — galerie des fonctionnalités du dashboard.
- [CHAOS-MODE.md](guides/CHAOS-MODE.md) — exécution multi-modèles parallèle/collaborative (configuration, permissions, API).
- [TIERS.md](guides/TIERS.md) — les niveaux d'OmniRoute expliqués (guide utilisateur).
- [USAGE_QUOTA_GUIDE.md](guides/USAGE_QUOTA_GUIDE.md) — suivi de l'usage, des quotas et des dépenses.
- [COST_TRACKING.md](guides/COST_TRACKING.md) — suivi des coûts et des dépenses.
- [FREE_PROVIDER_RANKINGS.md](guides/FREE_PROVIDER_RANKINGS.md) — classement des fournisseurs gratuits (Arena ELO).
- [DOCKER_GUIDE.md](guides/DOCKER_GUIDE.md) — exécution d'OmniRoute sous Docker, y compris la RAM d'exécution pour les coding agents.
- [ELECTRON_GUIDE.md](guides/ELECTRON_GUIDE.md) — builds de bureau (Electron).
- [TERMUX_GUIDE.md](guides/TERMUX_GUIDE.md) — exécution sur Android via Termux.
- [PWA_GUIDE.md](guides/PWA_GUIDE.md) — installation du dashboard en tant que PWA.
- [REMOTE-MODE.md](guides/REMOTE-MODE.md) — exposition d'OmniRoute à distance et jetons à portée limitée.
- [CLI-INTEGRATIONS.md](guides/CLI-INTEGRATIONS.md) — tableau principal des intégrations CLI `setup-*`.
- [OPENCODE-V2-PLUGIN.md](guides/OPENCODE-V2-PLUGIN.md) — installation et configuration du plugin OpenCode v2.
- [CLAUDE-CODE-CONFIGURATION.md](guides/CLAUDE-CODE-CONFIGURATION.md) — la CLI Claude Code avec OmniRoute.
- [CODEX-CLI-CONFIGURATION.md](guides/CODEX-CLI-CONFIGURATION.md) — la CLI Codex avec OmniRoute.
- [KIRO_SETUP.md](guides/KIRO_SETUP.md) — configuration de Kiro.
- [ANTIGRAVITY-ONBOARDING.md](guides/ANTIGRAVITY-ONBOARDING.md) — prise en main d'Antigravity (Google One AI).
- [MANAGEMENT-AUTH.md](guides/MANAGEMENT-AUTH.md) — authentification de gestion.
- [I18N.md](guides/I18N.md) — flux de travail de traduction et de locale.
- [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md) — référence détaillée de dépannage.
- [UNINSTALL.md](guides/UNINSTALL.md) — étapes de suppression complète.

---

## Pour les utilisateurs techniques

Documentation technique destinée aux développeurs et aux contributeurs.

## architecture/

Comment le système est assemblé — lisez ces documents pour comprendre le runtime, l'organisation du code et le modèle de résilience.

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — architecture générale du système (pipeline de requêtes, couches, modules).
- [CODEBASE_DOCUMENTATION.md](architecture/CODEBASE_DOCUMENTATION.md) — référence d'ingénierie de la base de code.
- [REPOSITORY_MAP.md](architecture/REPOSITORY_MAP.md) — guide de navigation répertoire par répertoire.
- [AUTHZ_GUIDE.md](architecture/AUTHZ_GUIDE.md) — pipeline d'autorisation (classificateur de routes et moteur de politiques).
- [RESILIENCE_GUIDE.md](architecture/RESILIENCE_GUIDE.md) — circuit breaker de fournisseur, connection cooldown et verrouillage de modèle.
- [QUALITY_GATES.md](architecture/QUALITY_GATES.md) — inventaire des scripts de quality-gate et des jobs CI.
- [MONITORING_SECTIONS.md](architecture/MONITORING_SECTIONS.md) — navigation du dashboard de supervision et des coûts.
- [cluster-decisions.md](architecture/cluster-decisions.md) — décisions sur les profiles sidecar/cluster facultatifs.
- [DESIGN_SYSTEM.md](architecture/DESIGN_SYSTEM.md) — design system et identité visuelle.
- [ROUTER_BACKENDS.md](architecture/ROUTER_BACKENDS.md) — contrat d'architecture des backends de routeur et des services embarqués (ADR).
- [admission-lanes.md](architecture/admission-lanes.md) — les deux systèmes de voies d'admission et ce qui contrôle chacun.
- [persistence-backend-boundary.md](architecture/persistence-backend-boundary.md) — frontière de persistance modulaire (ADR).

## reference/

Documents de consultation — surface de l'API, variables d'environnement, options de la CLI, catalogue des fournisseurs.

- [API_REFERENCE.md](reference/API_REFERENCE.md) — endpoints de l'API REST et leurs formats.
- [PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) — catalogue des fournisseurs généré automatiquement (ne pas modifier à la main).
- [REMOVED_PROVIDERS.md](reference/REMOVED_PROVIDERS.md) — fournisseurs retirés à la demande de leur opérateur ; ne jamais les réintroduire sans autorisation écrite.
- [PROVIDER_PLUGIN_MANIFEST.md](reference/PROVIDER_PLUGIN_MANIFEST.md) — contrat de plugin de fournisseur compatible sidecar pour la migration de Bifrost et de CLIProxyAPI.
- [openapi.yaml](openapi.yaml) — spécification OpenAPI de l'API publique.
- [ENVIRONMENT.md](reference/ENVIRONMENT.md) — référence des variables d'environnement.
- [FEATURE_FLAGS.md](reference/FEATURE_FLAGS.md) — feature flags et leurs valeurs par défaut.
- [CLI-TOOLS.md](reference/CLI-TOOLS.md) — commandes CLI fournies.
- [FREE_TIERS.md](reference/FREE_TIERS.md) — annuaire des fournisseurs de LLM à niveau gratuit.
- [FREE_PROXIES_API.md](reference/FREE_PROXIES_API.md) — API des proxies gratuits.
- [RELAY_BACKEND_STRATEGY.md](reference/RELAY_BACKEND_STRATEGY.md) — stratégie du backend relay.
- [RELAY_TROUBLESHOOTING.md](reference/RELAY_TROUBLESHOOTING.md) — dépannage de relay.

## frameworks/

Sous-systèmes enfichables exposés aux clients, aux agents et aux opérateurs.

- [MCP-SERVER.md](frameworks/MCP-SERVER.md) — serveur Model Context Protocol.
- [A2A-SERVER.md](frameworks/A2A-SERVER.md) — serveur JSON-RPC Agent-to-Agent (A2A).
- [ACP.md](frameworks/ACP.md) — Agent Client Protocol.
- [AGENT_PROTOCOLS_GUIDE.md](frameworks/AGENT_PROTOCOLS_GUIDE.md) — vue d'ensemble A2A / ACP / Cloud Agent.
- [AGENTBRIDGE.md](frameworks/AGENTBRIDGE.md) — pont d'agent pour IDE.
- [AGENT-SKILLS.md](frameworks/AGENT-SKILLS.md) — catalogue des compétences d'agent.
- [CLOUD_AGENT.md](frameworks/CLOUD_AGENT.md) — runtime et fournisseurs de Cloud Agent.
- [SKILLS.md](frameworks/SKILLS.md) — framework Skills (extension isolée en bac à sable).
- [MEMORY.md](frameworks/MEMORY.md) — mémoire persistante (FTS5 et Qdrant).
- [WEBHOOKS.md](frameworks/WEBHOOKS.md) — événements et distribution des webhooks.
- [EVALS.md](frameworks/EVALS.md) — suites d'évaluation.
- [GAMIFICATION.md](frameworks/GAMIFICATION.md) — système de gamification et de classement.
- [EMBEDDED-SERVICES.md](frameworks/EMBEDDED-SERVICES.md) — services sidecar embarqués (9Router, CLIProxyAPI).
- [NOTION_CONTEXT.md](frameworks/NOTION_CONTEXT.md) — source de contexte Notion.
- [OBSIDIAN_CONTEXT.md](frameworks/OBSIDIAN_CONTEXT.md) — source de contexte Obsidian.
- [LOCAL_CORPUS_CONTEXT.md](frameworks/LOCAL_CORPUS_CONTEXT.md) — source de contexte de corpus local (répertoire approuvé exposé à MCP).
- [OPENCODE.md](frameworks/OPENCODE.md) — intégration d'OpenCode.
- [OPEN_SSE_ARCHITECTURE.md](frameworks/OPEN_SSE_ARCHITECTURE.md) — fonctionnement interne du moteur de streaming open-sse.
- [PLAYGROUND_STUDIO.md](frameworks/PLAYGROUND_STUDIO.md) — interface Playground Studio.
- [SEARCH_TOOLS_STUDIO.md](frameworks/SEARCH_TOOLS_STUDIO.md) — interface Search Tools Studio.
- [TRAFFIC_INSPECTOR.md](frameworks/TRAFFIC_INSPECTOR.md) — inspecteur de trafic (MITM).
- [PLUGINS.md](frameworks/PLUGINS.md) — vue d'ensemble du système de plugins CLI.
- [PLUGIN_SDK.md](frameworks/PLUGIN_SDK.md) — référence du SDK de plugins.
- [PLUGIN_MARKETPLACE.md](frameworks/PLUGIN_MARKETPLACE.md) — marketplace de plugins.
- [RADAR.md](frameworks/RADAR.md) — surcouche de catalogue de modèles gratuits Radar (facultative, désactivée par défaut).

## routing/

Routage des combos, scoring et rejeu.

- [AUTO-COMBO.md](routing/AUTO-COMBO.md) — Auto-Combo (scoring multifactoriel, 19 stratégies).
- [QUOTA_SHARE.md](routing/QUOTA_SHARE.md) — moteur de partage de quota.
- [REASONING_REPLAY.md](routing/REASONING_REPLAY.md) — cache de rejeu du raisonnement.
- [REASONING_ROUTING.md](routing/REASONING_ROUTING.md) — règles de routage du raisonnement (moteur de règles d'effort/budget).

## security/

Guardrails, conformité, furtivité, ainsi que les modèles obligatoires pour la gestion des identifiants publics et des messages d'erreur.

- [GUARDRAILS.md](security/GUARDRAILS.md) — guardrails PII, injection de prompt et vision.
- [COMPLIANCE.md](security/COMPLIANCE.md) — pistes d'audit et conformité.
- [STEALTH_GUIDE.md](security/STEALTH_GUIDE.md) — furtivité TLS / empreinte.
- [PUBLIC_CREDS.md](security/PUBLIC_CREDS.md) — modèle **obligatoire** pour intégrer des client_id/secret OAuth upstream publics et des clés Web Firebase sans déclencher les scanners de secrets.
- [ERROR_SANITIZATION.md](security/ERROR_SANITIZATION.md) — modèle **obligatoire** pour faire passer chaque réponse d'erreur par `sanitizeErrorMessage` afin d'éviter l'exposition des traces de pile.
- [ROUTE_GUARD_TIERS.md](security/ROUTE_GUARD_TIERS.md) — niveaux de classification des protections de routes.
- [CLI_TOKEN.md](security/CLI_TOKEN.md) — authentification par jeton d'identifiant machine de la CLI (HMAC et SHA-256 hérité).
- [EGRESS_POLICY.md](security/EGRESS_POLICY.md) — politique de famille d'IP de sortie (IPv4/IPv6).
- [BAN_DETECTION.md](security/BAN_DETECTION.md) — détection des comptes bannis / des mots-clés bannis.
- [AGENTROUTER_WAF.md](security/AGENTROUTER_WAF.md) — WAF d'agentrouter.org.
- [CORS.md](security/CORS.md) — configuration et sécurité de CORS.
- [MITM-TPROXY-DECRYPT.md](security/MITM-TPROXY-DECRYPT.md) — déchiffrement MITM transparent.
- [SUPPLY_CHAIN.md](security/SUPPLY_CHAIN.md) — gates de chaîne d'approvisionnement (SLSA, SBOM, Trivy, osv-scanner, Scorecard).
- [SOCKET_DEV_FINDINGS.md](security/SOCKET_DEV_FINDINGS.md) — attestations des constats de chaîne d'approvisionnement.

## compression/

Moteurs de prompt compression, règles et packs de langues.

- [COMPRESSION_GUIDE.md](compression/COMPRESSION_GUIDE.md) — vue d'ensemble de la compression.
- [COMPRESSION_ENGINES.md](compression/COMPRESSION_ENGINES.md) — moteurs de compression disponibles.
- [COMPRESSION_RULES_FORMAT.md](compression/COMPRESSION_RULES_FORMAT.md) — format des fichiers de règles.
- [COMPRESSION_LANGUAGE_PACKS.md](compression/COMPRESSION_LANGUAGE_PACKS.md) — packs de langues.
- [RTK_COMPRESSION.md](compression/RTK_COMPRESSION.md) — analyse approfondie du moteur RTK.
- [CONTEXT_EDITING.md](compression/CONTEXT_EDITING.md) — édition de contexte déléguée (Anthropic).
- [EXTENDING_COMPRESSION.md](compression/EXTENDING_COMPRESSION.md) — ajout d'un moteur de compression personnalisé.

## providers/

Guides d'intégration propres à chaque fournisseur.

- [CLAUDE_WEB.md](providers/CLAUDE_WEB.md) — fournisseur Claude Web (authentification par cookie).
- [CHATGPT_WEB.md](providers/CHATGPT_WEB.md) — fournisseur ChatGPT Web (Codex) et note de retrait du fournisseur commun.
- [COPILOT-M365.md](providers/COPILOT-M365.md) — fournisseur Microsoft 365 Copilot (BizChat).
- [ALIBABA-QWEN-PROVIDER-FAMILIES.md](providers/ALIBABA-QWEN-PROVIDER-FAMILIES.md) — familles de fournisseurs Alibaba et Qwen.
- [AGENTROUTER.md](providers/AGENTROUTER.md) — configuration d'AgentRouter.
- [ZED-DOCKER.md](providers/ZED-DOCKER.md) — intégration de l'IDE Zed sous Docker.
- [CURSOR-DOCKER.md](providers/CURSOR-DOCKER.md) — liste des modèles de Cursor sous Docker.

## comparison/

- [OMNIROUTE_VS_ALTERNATIVES.md](comparison/OMNIROUTE_VS_ALTERNATIVES.md) — comparaison d'OmniRoute avec ses alternatives.

## ops/

Publication, déploiement, proxies, tunnels, couverture, base de données, supervision.

- [RELEASE_CHECKLIST.md](ops/RELEASE_CHECKLIST.md) — liste de contrôle du processus de publication.
- [RELEASE_GREEN.md](ops/RELEASE_GREEN.md) — maintien au vert de la file de PR et de la branche de publication.
- [BRANCHING_MODEL.md](ops/BRANCHING_MODEL.md) — modèle de branches et de publication.
- [MERGE_TRAIN.md](ops/MERGE_TRAIN.md) — file de fusion et runbook manuel de merge train.
- [HOMOLOGATION.md](ops/HOMOLOGATION.md) — suite d'homologation (`npm run homolog`).
- [QUALITY_GATE_PLAYBOOK.md](ops/QUALITY_GATE_PLAYBOOK.md) — playbook des quality gates.
- [RUNNER_BOX.md](ops/RUNNER_BOX.md) — exploitation de la machine de runners self-hosted.
- [BRANCH_PROTECTION_MAIN.md](ops/BRANCH_PROTECTION_MAIN.md) — protection de la branche `main`.
- [CONTRIBUTION_GOLDEN_PATH.md](ops/CONTRIBUTION_GOLDEN_PATH.md) — parcours de contribution recommandé (vérifications ciblées par type de changement).
- [COVERAGE_PLAN.md](ops/COVERAGE_PLAN.md) — plan de couverture des tests.
- [DATABASE_GUIDE.md](ops/DATABASE_GUIDE.md) — schéma et opérations de la base de données.
- [SQLITE_RUNTIME.md](ops/SQLITE_RUNTIME.md) — chaîne de résolution du pilote SQLite.
- [REDIS_PRODUCTION_CONFIG.md](ops/REDIS_PRODUCTION_CONFIG.md) — configuration de production de Redis.
- [MONITORING_GUIDE.md](ops/MONITORING_GUIDE.md) — supervision et observabilité.
- [FLY_IO_DEPLOYMENT_GUIDE.md](ops/FLY_IO_DEPLOYMENT_GUIDE.md) — déploiement sur Fly.io.
- [VM_DEPLOYMENT_GUIDE.md](ops/VM_DEPLOYMENT_GUIDE.md) — déploiement générique sur VM.
- [PROXY_GUIDE.md](ops/PROXY_GUIDE.md) — configuration du proxy upstream.
- [TUNNELS_GUIDE.md](ops/TUNNELS_GUIDE.md) — tunnel Cloudflare et alternatives.

## diagrams/

Sources Mermaid et diagrammes SVG/PNG exportés référencés par les documents ci-dessus. Voir [diagrams/README.md](diagrams/README.md).

## i18n/

Miroirs traduits de la documentation en 66 locales (plus les originaux en anglais — 67 langues au total). Voir [i18n/README.md](i18n/README.md) pour la liste des langues prises en charge.

## screenshots/

Captures d'écran statiques utilisées par le dashboard et le README. Elles ne font pas partie du corps de la documentation.

---

## Artefacts générés automatiquement

- [reference/PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) est généré par `scripts/docs/gen-provider-reference.ts` à partir de `src/shared/constants/providers.ts`. Ne le modifiez pas à la main.
- L'interface `/docs` s'appuie sur la génération de sources Fumadocs MDX à partir des sous-dossiers ci-dessus.
