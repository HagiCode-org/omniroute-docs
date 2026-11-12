---
title: "OmniRoute-Dokumentation"
version: 3.8.40
lastUpdated: 2026-06-28
---

# OmniRoute-Dokumentation

Navigierbarer Index der OmniRoute-Dokumentation. Die Themen sind nach Absicht gruppiert, damit Sie schnell finden, was Sie brauchen.

> Suchen Sie die Projektübersicht, die Installationsschritte oder die Release Notes? Siehe das Root-[README.md](../README.md), [ROADMAP.md](../ROADMAP.md), [CHANGELOG.md](../CHANGELOG.md) und [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Für nicht-technische Benutzer

Einfache Anleitungen zur Nutzung von OmniRoute — kein technischer Hintergrund erforderlich.

### getting-started/

- [QUICK-START.md](getting-started/QUICK-START.md) — OmniRoute in 3 Minuten installieren und starten.
- [AUTO-COMBO-GUIDE.md](getting-started/AUTO-COMBO-GUIDE.md) — OmniRoute die beste KI für Sie auswählen lassen.
- [PROVIDERS-GUIDE.md](getting-started/PROVIDERS-GUIDE.md) — KI-Provider anbinden.
- [FREE-TIERS-GUIDE.md](getting-started/FREE-TIERS-GUIDE.md) — kostenlose KI ohne Kreditkarte nutzen.
- [WEB-COOKIE-GUIDE.md](getting-started/WEB-COOKIE-GUIDE.md) — Web-Cookie-Provider (Einrichtung von Sitzungs-Zugangsdaten).

### guides/

- [SETUP_GUIDE.md](guides/SETUP_GUIDE.md) — Ersteinrichtung von OmniRoute.
- [USER_GUIDE.md](guides/USER_GUIDE.md) — tägliche Nutzung des dashboard und der API.
- [THINKING_BUDGET.md](guides/THINKING_BUDGET.md) — Budgetmodi für Thinking/Reasoning (passthrough vs. auto-strip).
- [FEATURES.md](guides/FEATURES.md) — Funktionsgalerie des dashboard.
- [CHAOS-MODE.md](guides/CHAOS-MODE.md) — parallele/kollaborative Ausführung mehrerer Modelle (Einrichtung, Berechtigungen, API).
- [TIERS.md](guides/TIERS.md) — OmniRoute-Stufen erklärt (Benutzerhandbuch).
- [USAGE_QUOTA_GUIDE.md](guides/USAGE_QUOTA_GUIDE.md) — Nutzungs-, Kontingent- und Ausgabenverfolgung.
- [COST_TRACKING.md](guides/COST_TRACKING.md) — Kosten- und Ausgabenverfolgung.
- [FREE_PROVIDER_RANKINGS.md](guides/FREE_PROVIDER_RANKINGS.md) — Rankings kostenloser Provider (Arena ELO).
- [DOCKER_GUIDE.md](guides/DOCKER_GUIDE.md) — OmniRoute unter Docker betreiben, einschließlich Runtime-RAM für coding agents.
- [ELECTRON_GUIDE.md](guides/ELECTRON_GUIDE.md) — Desktop-Builds (Electron).
- [TERMUX_GUIDE.md](guides/TERMUX_GUIDE.md) — Betrieb unter Android über Termux.
- [PWA_GUIDE.md](guides/PWA_GUIDE.md) — das dashboard als PWA installieren.
- [REMOTE-MODE.md](guides/REMOTE-MODE.md) — OmniRoute remote verfügbar machen + Tokens mit begrenztem Geltungsbereich.
- [CLI-INTEGRATIONS.md](guides/CLI-INTEGRATIONS.md) — Master-Tabelle der `setup-*`-CLI-Integrationen.
- [OPENCODE-V2-PLUGIN.md](guides/OPENCODE-V2-PLUGIN.md) — Installation und Konfiguration des OpenCode-v2-Plugins.
- [CLAUDE-CODE-CONFIGURATION.md](guides/CLAUDE-CODE-CONFIGURATION.md) — Claude Code CLI mit OmniRoute.
- [CODEX-CLI-CONFIGURATION.md](guides/CODEX-CLI-CONFIGURATION.md) — Codex CLI mit OmniRoute.
- [KIRO_SETUP.md](guides/KIRO_SETUP.md) — Kiro-Einrichtung.
- [ANTIGRAVITY-ONBOARDING.md](guides/ANTIGRAVITY-ONBOARDING.md) — Antigravity-(Google-One-AI-)Onboarding.
- [MANAGEMENT-AUTH.md](guides/MANAGEMENT-AUTH.md) — Management-Authentifizierung.
- [I18N.md](guides/I18N.md) — Übersetzungs- und locale-Workflow.
- [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md) — ausführliche Referenz zur Fehlerbehebung.
- [UNINSTALL.md](guides/UNINSTALL.md) — Schritte zur sauberen Entfernung.

---

## Für technische Benutzer

Technische Dokumentation für Entwickler und Mitwirkende.

## architecture/

Wie das System aufgebaut ist — lesen Sie diese Dokumente, um die Runtime, die Code-Struktur und das Resilienzmodell zu verstehen.

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — High-level-Systemarchitektur (Anfrage-Pipeline, Schichten, Module).
- [CODEBASE_DOCUMENTATION.md](architecture/CODEBASE_DOCUMENTATION.md) — Engineering-Referenz für die Codebasis.
- [REPOSITORY_MAP.md](architecture/REPOSITORY_MAP.md) — verzeichnisweiser Navigationsleitfaden.
- [AUTHZ_GUIDE.md](architecture/AUTHZ_GUIDE.md) — Autorisierungs-Pipeline (Route-Klassifikator + Policy-Engine).
- [RESILIENCE_GUIDE.md](architecture/RESILIENCE_GUIDE.md) — Provider-circuit breaker, connection cooldown und Modell-Lockout.
- [QUALITY_GATES.md](architecture/QUALITY_GATES.md) — Inventar der quality-gate-Skripte und CI-Jobs.
- [MONITORING_SECTIONS.md](architecture/MONITORING_SECTIONS.md) — Navigation durch das Monitoring-/Kosten-dashboard.
- [cluster-decisions.md](architecture/cluster-decisions.md) — Entscheidungen zum optionalen sidecar-/cluster-profile.
- [DESIGN_SYSTEM.md](architecture/DESIGN_SYSTEM.md) — Design-System und visuelle Identität.
- [ROUTER_BACKENDS.md](architecture/ROUTER_BACKENDS.md) — Architekturvertrag (ADR) für Router-Backends und eingebettete Services.
- [admission-lanes.md](architecture/admission-lanes.md) — die beiden admission-lane-Systeme und welche gates jeweils greifen.
- [persistence-backend-boundary.md](architecture/persistence-backend-boundary.md) — pluggable Persistenzgrenze (ADR).

## reference/

Nachschlagematerial — API-Oberfläche, Umgebungsvariablen, CLI-Flags, Provider-Katalog.

- [API_REFERENCE.md](reference/API_REFERENCE.md) — REST-API-endpoints und ihre Formate.
- [PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) — automatisch generierter Provider-Katalog (nicht von Hand bearbeiten).
- [REMOVED_PROVIDERS.md](reference/REMOVED_PROVIDERS.md) — auf Wunsch ihres Betreibers entfernte Provider; ohne schriftliche Erlaubnis niemals wieder einführen.
- [PROVIDER_PLUGIN_MANIFEST.md](reference/PROVIDER_PLUGIN_MANIFEST.md) — sidecar-sicherer Provider-Plugin-Vertrag für die Migration von Bifrost und CLIProxyAPI.
- [openapi.yaml](openapi.yaml) — OpenAPI-Spezifikation für die öffentliche API.
- [ENVIRONMENT.md](reference/ENVIRONMENT.md) — Referenz der Umgebungsvariablen.
- [FEATURE_FLAGS.md](reference/FEATURE_FLAGS.md) — Feature Flags und ihre Standardwerte.
- [CLI-TOOLS.md](reference/CLI-TOOLS.md) — mitgelieferte CLI-Befehle.
- [FREE_TIERS.md](reference/FREE_TIERS.md) — Verzeichnis von LLM-Providern mit kostenloser Stufe.
- [FREE_PROXIES_API.md](reference/FREE_PROXIES_API.md) — API für kostenlose proxies.
- [RELAY_BACKEND_STRATEGY.md](reference/RELAY_BACKEND_STRATEGY.md) — relay-Backend-Strategie.
- [RELAY_TROUBLESHOOTING.md](reference/RELAY_TROUBLESHOOTING.md) — relay-Fehlerbehebung.

## frameworks/

Einsteckbare Subsysteme, die Clients, agents und Betreibern bereitgestellt werden.

- [MCP-SERVER.md](frameworks/MCP-SERVER.md) — Model-Context-Protocol-Server.
- [A2A-SERVER.md](frameworks/A2A-SERVER.md) — Agent-to-Agent-(A2A-)JSON-RPC-Server.
- [ACP.md](frameworks/ACP.md) — Agent Client Protocol.
- [AGENT_PROTOCOLS_GUIDE.md](frameworks/AGENT_PROTOCOLS_GUIDE.md) — Überblick über A2A / ACP / Cloud agent.
- [AGENTBRIDGE.md](frameworks/AGENTBRIDGE.md) — IDE-agent-Bridge.
- [AGENT-SKILLS.md](frameworks/AGENT-SKILLS.md) — Katalog der agent skills.
- [CLOUD_AGENT.md](frameworks/CLOUD_AGENT.md) — Runtime und Provider des cloud agent.
- [SKILLS.md](frameworks/SKILLS.md) — Skills-Framework (Sandbox-Erweiterung).
- [MEMORY.md](frameworks/MEMORY.md) — persistenter Speicher (FTS5 + Qdrant).
- [WEBHOOKS.md](frameworks/WEBHOOKS.md) — Webhook-Ereignisse und Dispatch.
- [EVALS.md](frameworks/EVALS.md) — Eval-Suites.
- [GAMIFICATION.md](frameworks/GAMIFICATION.md) — Gamification- und Leaderboard-System.
- [EMBEDDED-SERVICES.md](frameworks/EMBEDDED-SERVICES.md) — eingebettete sidecar-Services (9Router, CLIProxyAPI).
- [NOTION_CONTEXT.md](frameworks/NOTION_CONTEXT.md) — Notion-Kontextquelle.
- [OBSIDIAN_CONTEXT.md](frameworks/OBSIDIAN_CONTEXT.md) — Obsidian-Kontextquelle.
- [LOCAL_CORPUS_CONTEXT.md](frameworks/LOCAL_CORPUS_CONTEXT.md) — Kontextquelle für lokale Korpora (freigegebenes Verzeichnis, das über MCP bereitgestellt wird).
- [OPENCODE.md](frameworks/OPENCODE.md) — OpenCode-Integration.
- [OPEN_SSE_ARCHITECTURE.md](frameworks/OPEN_SSE_ARCHITECTURE.md) — Interna der open-sse-Streaming-Engine.
- [PLAYGROUND_STUDIO.md](frameworks/PLAYGROUND_STUDIO.md) — Playground-Studio-Oberfläche.
- [SEARCH_TOOLS_STUDIO.md](frameworks/SEARCH_TOOLS_STUDIO.md) — Search-Tools-Studio-Oberfläche.
- [TRAFFIC_INSPECTOR.md](frameworks/TRAFFIC_INSPECTOR.md) — Traffic-Inspector (MITM).
- [PLUGINS.md](frameworks/PLUGINS.md) — Überblick über das CLI-Plugin-System.
- [PLUGIN_SDK.md](frameworks/PLUGIN_SDK.md) — Referenz des Plugin-SDK.
- [PLUGIN_MARKETPLACE.md](frameworks/PLUGIN_MARKETPLACE.md) — Plugin-Marketplace.
- [RADAR.md](frameworks/RADAR.md) — Radar-Overlay für den Katalog kostenloser Modelle (optional, standardmäßig aus).

## routing/

Combo-Routing, Scoring und Replay.

- [AUTO-COMBO.md](routing/AUTO-COMBO.md) — Auto-Combo (Multi-Faktor-Scoring, 19 Strategien).
- [QUOTA_SHARE.md](routing/QUOTA_SHARE.md) — Engine zur Kontingentteilung.
- [REASONING_REPLAY.md](routing/REASONING_REPLAY.md) — Reasoning-Replay-Cache.
- [REASONING_ROUTING.md](routing/REASONING_ROUTING.md) — Reasoning-Routing-Regeln (Regel-Engine für effort/budget).

## security/

Guardrails, Compliance, Stealth und die verbindlichen Muster für den Umgang mit öffentlichen Zugangsdaten und Fehlermeldungen.

- [GUARDRAILS.md](security/GUARDRAILS.md) — Guardrails für PII, prompt injection und Vision.
- [COMPLIANCE.md](security/COMPLIANCE.md) — Audit-Trails und Compliance.
- [STEALTH_GUIDE.md](security/STEALTH_GUIDE.md) — TLS-/Fingerprint-Stealth.
- [PUBLIC_CREDS.md](security/PUBLIC_CREDS.md) — **verbindliches** Muster zum Einbetten öffentlicher upstream-OAuth-client_id/secret und Firebase-Web-Keys, ohne secret scanners auszulösen.
- [ERROR_SANITIZATION.md](security/ERROR_SANITIZATION.md) — **verbindliches** Muster, jede Fehlerantwort über `sanitizeErrorMessage` zu leiten, um die Offenlegung von Stack-Traces zu verhindern.
- [ROUTE_GUARD_TIERS.md](security/ROUTE_GUARD_TIERS.md) — Klassifizierungsstufen des route-guard.
- [CLI_TOKEN.md](security/CLI_TOKEN.md) — Authentifizierung per CLI-Machine-ID-Token (HMAC + legacy SHA-256).
- [EGRESS_POLICY.md](security/EGRESS_POLICY.md) — Egress-Richtlinie für die IP-Familie (IPv4/IPv6).
- [BAN_DETECTION.md](security/BAN_DETECTION.md) — Erkennung von Account-Sperren / gesperrten Schlüsselwörtern.
- [AGENTROUTER_WAF.md](security/AGENTROUTER_WAF.md) — agentrouter.org-WAF.
- [CORS.md](security/CORS.md) — CORS-Konfiguration und Sicherheit.
- [MITM-TPROXY-DECRYPT.md](security/MITM-TPROXY-DECRYPT.md) — transparente MITM-Entschlüsselung.
- [SUPPLY_CHAIN.md](security/SUPPLY_CHAIN.md) — Lieferketten-gates (SLSA, SBOM, Trivy, osv-scanner, Scorecard).
- [SOCKET_DEV_FINDINGS.md](security/SOCKET_DEV_FINDINGS.md) — Attestierungen zu Lieferkettenbefunden.

## compression/

prompt compression: Engines, Regeln und Sprachpakete.

- [COMPRESSION_GUIDE.md](compression/COMPRESSION_GUIDE.md) — übergeordneter Überblick über die Kompression.
- [COMPRESSION_ENGINES.md](compression/COMPRESSION_ENGINES.md) — verfügbare Kompressions-Engines.
- [COMPRESSION_RULES_FORMAT.md](compression/COMPRESSION_RULES_FORMAT.md) — Format der Regeldateien.
- [COMPRESSION_LANGUAGE_PACKS.md](compression/COMPRESSION_LANGUAGE_PACKS.md) — Sprachpakete.
- [RTK_COMPRESSION.md](compression/RTK_COMPRESSION.md) — RTK-Engine im Detail.
- [CONTEXT_EDITING.md](compression/CONTEXT_EDITING.md) — delegiertes Context Editing (Anthropic).
- [EXTENDING_COMPRESSION.md](compression/EXTENDING_COMPRESSION.md) — Hinzufügen einer eigenen Kompressions-Engine.

## providers/

Provider-spezifische Integrationsleitfäden.

- [CLAUDE_WEB.md](providers/CLAUDE_WEB.md) — Claude-Web-Provider (Cookie-Authentifizierung).
- [CHATGPT_WEB.md](providers/CHATGPT_WEB.md) — ChatGPT-Web-(Codex-)Provider und Hinweis zur Außerbetriebnahme des gängigen Providers.
- [COPILOT-M365.md](providers/COPILOT-M365.md) — Microsoft-365-Copilot-Provider (BizChat).
- [ALIBABA-QWEN-PROVIDER-FAMILIES.md](providers/ALIBABA-QWEN-PROVIDER-FAMILIES.md) — Provider-Familien von Alibaba und Qwen.
- [AGENTROUTER.md](providers/AGENTROUTER.md) — AgentRouter-Einrichtung.
- [ZED-DOCKER.md](providers/ZED-DOCKER.md) — Zed-IDE-Integration unter Docker.
- [CURSOR-DOCKER.md](providers/CURSOR-DOCKER.md) — Cursor-Modellliste unter Docker.

## comparison/

- [OMNIROUTE_VS_ALTERNATIVES.md](comparison/OMNIROUTE_VS_ALTERNATIVES.md) — wie sich OmniRoute im Vergleich zu Alternativen darstellt.

## ops/

Release, Deployment, proxies, Tunnel, Coverage, Datenbank, Monitoring.

- [RELEASE_CHECKLIST.md](ops/RELEASE_CHECKLIST.md) — Checkliste für den Release-Ablauf.
- [RELEASE_GREEN.md](ops/RELEASE_GREEN.md) — PR-Queue und Release-Branch grün halten.
- [BRANCHING_MODEL.md](ops/BRANCHING_MODEL.md) — Branching- und Release-Modell.
- [MERGE_TRAIN.md](ops/MERGE_TRAIN.md) — Merge-Queue und manuelles Merge-Train-Runbook.
- [HOMOLOGATION.md](ops/HOMOLOGATION.md) — Homologationssuite (`npm run homolog`).
- [QUALITY_GATE_PLAYBOOK.md](ops/QUALITY_GATE_PLAYBOOK.md) — quality-gate-Playbook.
- [RUNNER_BOX.md](ops/RUNNER_BOX.md) — Betrieb der self-hosted-Runner-Box.
- [BRANCH_PROTECTION_MAIN.md](ops/BRANCH_PROTECTION_MAIN.md) — Branch-Schutz für `main`.
- [CONTRIBUTION_GOLDEN_PATH.md](ops/CONTRIBUTION_GOLDEN_PATH.md) — Golden Path für Beiträge (gezielte Prüfungen je Änderungsart).
- [COVERAGE_PLAN.md](ops/COVERAGE_PLAN.md) — Plan zur Testabdeckung.
- [DATABASE_GUIDE.md](ops/DATABASE_GUIDE.md) — DB-Schema und Betrieb.
- [SQLITE_RUNTIME.md](ops/SQLITE_RUNTIME.md) — Auflösungskette des SQLite-Treibers.
- [REDIS_PRODUCTION_CONFIG.md](ops/REDIS_PRODUCTION_CONFIG.md) — Redis-Produktionskonfiguration.
- [MONITORING_GUIDE.md](ops/MONITORING_GUIDE.md) — Monitoring und Observability.
- [FLY_IO_DEPLOYMENT_GUIDE.md](ops/FLY_IO_DEPLOYMENT_GUIDE.md) — Fly.io-Deployment.
- [VM_DEPLOYMENT_GUIDE.md](ops/VM_DEPLOYMENT_GUIDE.md) — generisches VM-Deployment.
- [PROXY_GUIDE.md](ops/PROXY_GUIDE.md) — upstream-proxy-Konfiguration.
- [TUNNELS_GUIDE.md](ops/TUNNELS_GUIDE.md) — Cloudflare-Tunnel und Verwandtes.

## diagrams/

Mermaid-Quellen und exportierte SVG-/PNG-Diagramme, auf die die obigen Dokumente verweisen. Siehe [diagrams/README.md](diagrams/README.md).

## i18n/

Übersetzte Spiegelungen der Dokumentation in 66 locales (zusätzlich zu den englischen Originalen — insgesamt 67 Sprachen). Die Liste der unterstützten Sprachen finden Sie in [i18n/README.md](i18n/README.md).

## screenshots/

Statische Screenshots, die vom dashboard und vom README verwendet werden. Nicht Teil des Dokumenttexts.

---

## Automatisch generierte Artefakte

- [reference/PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) wird von `scripts/docs/gen-provider-reference.ts` aus `src/shared/constants/providers.ts` generiert. Nicht von Hand bearbeiten.
- Die `/docs`-Oberfläche basiert auf der Fumadocs-MDX-Quellgenerierung aus den obigen Unterordnern.
