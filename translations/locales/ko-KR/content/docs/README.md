---
title: "OmniRoute 문서"
version: 3.8.40
lastUpdated: 2026-06-28
---

# OmniRoute 문서

OmniRoute 문서 전체를 탐색할 수 있는 색인입니다. 주제는 목적별로 묶여 있으므로 필요한 내용을 빠르게 찾을 수 있습니다.

> 프로젝트 개요, 설치 절차 또는 릴리스 노트를 찾으신다면 루트의 [README.md](../README.md), [ROADMAP.md](../ROADMAP.md), [CHANGELOG.md](../CHANGELOG.md), [CONTRIBUTING.md](../CONTRIBUTING.md)를 참고하십시오.

---

## 비기술 사용자용

OmniRoute를 사용하기 위한 간단한 안내서이며, 기술 배경 지식이 필요하지 않습니다.

### getting-started/

- [QUICK-START.md](getting-started/QUICK-START.md) — 3분 안에 OmniRoute를 설치하고 실행합니다.
- [AUTO-COMBO-GUIDE.md](getting-started/AUTO-COMBO-GUIDE.md) — OmniRoute가 최적의 AI를 대신 선택하도록 합니다.
- [PROVIDERS-GUIDE.md](getting-started/PROVIDERS-GUIDE.md) — AI 프로바이더를 연결하는 방법입니다.
- [FREE-TIERS-GUIDE.md](getting-started/FREE-TIERS-GUIDE.md) — 신용카드 없이 무료 AI를 사용합니다.
- [WEB-COOKIE-GUIDE.md](getting-started/WEB-COOKIE-GUIDE.md) — 웹 쿠키 프로바이더(세션 자격 증명 설정)입니다.

### guides/

- [SETUP_GUIDE.md](guides/SETUP_GUIDE.md) — OmniRoute 최초 설정입니다.
- [USER_GUIDE.md](guides/USER_GUIDE.md) — dashboard와 API의 일상적인 사용법입니다.
- [THINKING_BUDGET.md](guides/THINKING_BUDGET.md) — thinking/reasoning 예산 모드(passthrough 대 auto-strip)입니다.
- [FEATURES.md](guides/FEATURES.md) — dashboard 기능 갤러리입니다.
- [CHAOS-MODE.md](guides/CHAOS-MODE.md) — 멀티 모델 병렬/협업 실행(설정, 권한, API)입니다.
- [TIERS.md](guides/TIERS.md) — OmniRoute 티어 설명(사용자 가이드)입니다.
- [USAGE_QUOTA_GUIDE.md](guides/USAGE_QUOTA_GUIDE.md) — 사용량, 할당량 및 지출 추적입니다.
- [COST_TRACKING.md](guides/COST_TRACKING.md) — 비용 및 지출 추적입니다.
- [FREE_PROVIDER_RANKINGS.md](guides/FREE_PROVIDER_RANKINGS.md) — 무료 프로바이더 순위(Arena ELO)입니다.
- [DOCKER_GUIDE.md](guides/DOCKER_GUIDE.md) — Docker에서 OmniRoute를 실행하는 방법이며, coding agent용 런타임 RAM을 포함합니다.
- [ELECTRON_GUIDE.md](guides/ELECTRON_GUIDE.md) — 데스크톱(Electron) 빌드입니다.
- [TERMUX_GUIDE.md](guides/TERMUX_GUIDE.md) — Termux를 통해 Android에서 실행하는 방법입니다.
- [PWA_GUIDE.md](guides/PWA_GUIDE.md) — dashboard를 PWA로 설치하는 방법입니다.
- [REMOTE-MODE.md](guides/REMOTE-MODE.md) — OmniRoute를 원격으로 노출하고 범위가 지정된 토큰을 사용하는 방법입니다.
- [CLI-INTEGRATIONS.md](guides/CLI-INTEGRATIONS.md) — `setup-*` CLI 통합의 마스터 표입니다.
- [OPENCODE-V2-PLUGIN.md](guides/OPENCODE-V2-PLUGIN.md) — OpenCode v2 플러그인의 설치 및 설정 방법입니다.
- [CLAUDE-CODE-CONFIGURATION.md](guides/CLAUDE-CODE-CONFIGURATION.md) — OmniRoute와 함께 사용하는 Claude Code CLI입니다.
- [CODEX-CLI-CONFIGURATION.md](guides/CODEX-CLI-CONFIGURATION.md) — OmniRoute와 함께 사용하는 Codex CLI입니다.
- [KIRO_SETUP.md](guides/KIRO_SETUP.md) — Kiro 설정입니다.
- [ANTIGRAVITY-ONBOARDING.md](guides/ANTIGRAVITY-ONBOARDING.md) — Antigravity(Google One AI) 온보딩입니다.
- [MANAGEMENT-AUTH.md](guides/MANAGEMENT-AUTH.md) — 관리 인증입니다.
- [I18N.md](guides/I18N.md) — 번역 및 locale 워크플로입니다.
- [TROUBLESHOOTING.md](guides/TROUBLESHOOTING.md) — 상세 문제 해결 참조 문서입니다.
- [UNINSTALL.md](guides/UNINSTALL.md) — 깔끔한 제거 절차입니다.

---

## 기술 사용자용

개발자와 기여자를 위한 기술 문서입니다.

## architecture/

시스템이 어떻게 구성되어 있는지 설명합니다. 런타임, 코드 구조, 복원력 모델을 이해하려면 이 문서들을 읽으십시오.

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — 상위 수준 시스템 아키텍처(요청 파이프라인, 계층, 모듈)입니다.
- [CODEBASE_DOCUMENTATION.md](architecture/CODEBASE_DOCUMENTATION.md) — 코드베이스 엔지니어링 참조 문서입니다.
- [REPOSITORY_MAP.md](architecture/REPOSITORY_MAP.md) — 디렉터리별 탐색 가이드입니다.
- [AUTHZ_GUIDE.md](architecture/AUTHZ_GUIDE.md) — 인가 파이프라인(라우트 분류기 + 정책 엔진)입니다.
- [RESILIENCE_GUIDE.md](architecture/RESILIENCE_GUIDE.md) — 프로바이더 circuit breaker, connection cooldown, 모델 락아웃입니다.
- [QUALITY_GATES.md](architecture/QUALITY_GATES.md) — 품질 gate 스크립트와 CI 작업 목록입니다.
- [MONITORING_SECTIONS.md](architecture/MONITORING_SECTIONS.md) — 모니터링/비용 dashboard 탐색입니다.
- [cluster-decisions.md](architecture/cluster-decisions.md) — 선택적 sidecar/클러스터 profile 결정 사항입니다.
- [DESIGN_SYSTEM.md](architecture/DESIGN_SYSTEM.md) — 디자인 시스템과 시각적 아이덴티티입니다.
- [ROUTER_BACKENDS.md](architecture/ROUTER_BACKENDS.md) — 라우터 백엔드와 내장 서비스 아키텍처 계약(ADR)입니다.
- [admission-lanes.md](architecture/admission-lanes.md) — 두 가지 진입 레인 시스템과 각각을 제어하는 gate입니다.
- [persistence-backend-boundary.md](architecture/persistence-backend-boundary.md) — 플러그인 가능한 영속성 경계(ADR)입니다.

## reference/

조회용 자료입니다. API 표면, 환경 변수, CLI 플래그, 프로바이더 카탈로그를 다룹니다.

- [API_REFERENCE.md](reference/API_REFERENCE.md) — REST API endpoint와 형식입니다.
- [PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md) — 자동 생성된 프로바이더 카탈로그입니다(직접 편집하지 마십시오).
- [REMOVED_PROVIDERS.md](reference/REMOVED_PROVIDERS.md) — 운영자의 요청으로 제거된 프로바이더이며, 서면 허가 없이는 다시 도입하지 마십시오.
- [PROVIDER_PLUGIN_MANIFEST.md](reference/PROVIDER_PLUGIN_MANIFEST.md) — Bifrost 및 CLIProxyAPI 마이그레이션을 위한 sidecar 안전 프로바이더 플러그인 계약입니다.
- [openapi.yaml](openapi.yaml) — 공개 API용 OpenAPI 명세입니다.
- [ENVIRONMENT.md](reference/ENVIRONMENT.md) — 환경 변수 참조 문서입니다.
- [FEATURE_FLAGS.md](reference/FEATURE_FLAGS.md) — 기능 플래그와 기본값입니다.
- [CLI-TOOLS.md](reference/CLI-TOOLS.md) — 번들된 CLI 명령입니다.
- [FREE_TIERS.md](reference/FREE_TIERS.md) — 무료 티어 LLM 프로바이더 디렉터리입니다.
- [FREE_PROXIES_API.md](reference/FREE_PROXIES_API.md) — 무료 proxy API입니다.
- [RELAY_BACKEND_STRATEGY.md](reference/RELAY_BACKEND_STRATEGY.md) — relay 백엔드 전략입니다.
- [RELAY_TROUBLESHOOTING.md](reference/RELAY_TROUBLESHOOTING.md) — relay 문제 해결입니다.

## frameworks/

클라이언트, agent, 운영자에게 노출되는 플러그형 하위 시스템입니다.

- [MCP-SERVER.md](frameworks/MCP-SERVER.md) — Model Context Protocol 서버입니다.
- [A2A-SERVER.md](frameworks/A2A-SERVER.md) — Agent-to-Agent(A2A) JSON-RPC 서버입니다.
- [ACP.md](frameworks/ACP.md) — Agent Client Protocol입니다.
- [AGENT_PROTOCOLS_GUIDE.md](frameworks/AGENT_PROTOCOLS_GUIDE.md) — A2A / ACP / Cloud agent 개요입니다.
- [AGENTBRIDGE.md](frameworks/AGENTBRIDGE.md) — IDE agent 브리지입니다.
- [AGENT-SKILLS.md](frameworks/AGENT-SKILLS.md) — agent skills 카탈로그입니다.
- [CLOUD_AGENT.md](frameworks/CLOUD_AGENT.md) — cloud agent 런타임과 프로바이더입니다.
- [SKILLS.md](frameworks/SKILLS.md) — Skills 프레임워크(샌드박스 확장)입니다.
- [MEMORY.md](frameworks/MEMORY.md) — 영속 메모리(FTS5 + Qdrant)입니다.
- [WEBHOOKS.md](frameworks/WEBHOOKS.md) — webhook 이벤트와 디스패치입니다.
- [EVALS.md](frameworks/EVALS.md) — 평가 스위트입니다.
- [GAMIFICATION.md](frameworks/GAMIFICATION.md) — 게임화 및 리더보드 시스템입니다.
- [EMBEDDED-SERVICES.md](frameworks/EMBEDDED-SERVICES.md) — 내장 sidecar 서비스(9Router, CLIProxyAPI)입니다.
- [NOTION_CONTEXT.md](frameworks/NOTION_CONTEXT.md) — Notion 컨텍스트 소스입니다.
- [OBSIDIAN_CONTEXT.md](frameworks/OBSIDIAN_CONTEXT.md) — Obsidian 컨텍스트 소스입니다.
- [LOCAL_CORPUS_CONTEXT.md](frameworks/LOCAL_CORPUS_CONTEXT.md) — 로컬 코퍼스 컨텍스트 소스(MCP에 노출된 승인된 디렉터리)입니다.
- [OPENCODE.md](frameworks/OPENCODE.md) — OpenCode 통합입니다.
- [OPEN_SSE_ARCHITECTURE.md](frameworks/OPEN_SSE_ARCHITECTURE.md) — open-sse 스트리밍 엔진 내부 구조입니다.
- [PLAYGROUND_STUDIO.md](frameworks/PLAYGROUND_STUDIO.md) — Playground Studio UI입니다.
- [SEARCH_TOOLS_STUDIO.md](frameworks/SEARCH_TOOLS_STUDIO.md) — Search Tools Studio UI입니다.
- [TRAFFIC_INSPECTOR.md](frameworks/TRAFFIC_INSPECTOR.md) — 트래픽 인스펙터(MITM)입니다.
- [PLUGINS.md](frameworks/PLUGINS.md) — CLI 플러그인 시스템 개요입니다.
- [PLUGIN_SDK.md](frameworks/PLUGIN_SDK.md) — 플러그인 SDK 참조 문서입니다.
- [PLUGIN_MARKETPLACE.md](frameworks/PLUGIN_MARKETPLACE.md) — 플러그인 마켓플레이스입니다.
- [RADAR.md](frameworks/RADAR.md) — Radar 무료 모델 카탈로그 오버레이입니다(선택 사항이며 기본값은 꺼짐).

## routing/

Combo 라우팅, 스코어링, 리플레이입니다.

- [AUTO-COMBO.md](routing/AUTO-COMBO.md) — Auto-Combo(다중 요소 스코어링, 19개 전략)입니다.
- [QUOTA_SHARE.md](routing/QUOTA_SHARE.md) — 할당량 공유 엔진입니다.
- [REASONING_REPLAY.md](routing/REASONING_REPLAY.md) — reasoning 리플레이 캐시입니다.
- [REASONING_ROUTING.md](routing/REASONING_ROUTING.md) — reasoning 라우팅 규칙(effort/budget 규칙 엔진)입니다.

## security/

guardrail, 규정 준수, 스텔스, 그리고 공개 자격 증명과 오류 메시지를 처리하기 위한 필수 패턴입니다.

- [GUARDRAILS.md](security/GUARDRAILS.md) — PII, prompt injection, 비전 guardrail입니다.
- [COMPLIANCE.md](security/COMPLIANCE.md) — 감사 추적과 규정 준수입니다.
- [STEALTH_GUIDE.md](security/STEALTH_GUIDE.md) — TLS / 핑거프린트 스텔스입니다.
- [PUBLIC_CREDS.md](security/PUBLIC_CREDS.md) — 시크릿 스캐너를 작동시키지 않고 공개 upstream OAuth client_id/secret 및 Firebase Web 키를 삽입하기 위한 **필수** 패턴입니다.
- [ERROR_SANITIZATION.md](security/ERROR_SANITIZATION.md) — 스택 트레이스 노출을 방지하기 위해 모든 오류 응답을 `sanitizeErrorMessage`를 통해 처리하는 **필수** 패턴입니다.
- [ROUTE_GUARD_TIERS.md](security/ROUTE_GUARD_TIERS.md) — 라우트 가드 분류 티어입니다.
- [CLI_TOKEN.md](security/CLI_TOKEN.md) — CLI 머신 ID 토큰(HMAC + 레거시 SHA-256) 인증입니다.
- [EGRESS_POLICY.md](security/EGRESS_POLICY.md) — egress IP 계열(IPv4/IPv6) 정책입니다.
- [BAN_DETECTION.md](security/BAN_DETECTION.md) — 계정 차단 / 금지 키워드 탐지입니다.
- [AGENTROUTER_WAF.md](security/AGENTROUTER_WAF.md) — agentrouter.org WAF입니다.
- [CORS.md](security/CORS.md) — CORS 설정 및 보안입니다.
- [MITM-TPROXY-DECRYPT.md](security/MITM-TPROXY-DECRYPT.md) — 투명 MITM 복호화입니다.
- [SUPPLY_CHAIN.md](security/SUPPLY_CHAIN.md) — 공급망 gate(SLSA, SBOM, Trivy, osv-scanner, Scorecard)입니다.
- [SOCKET_DEV_FINDINGS.md](security/SOCKET_DEV_FINDINGS.md) — 공급망 발견 사항 증명입니다.

## compression/

prompt 압축 엔진, 규칙, 언어 팩입니다.

- [COMPRESSION_GUIDE.md](compression/COMPRESSION_GUIDE.md) — 최상위 압축 개요입니다.
- [COMPRESSION_ENGINES.md](compression/COMPRESSION_ENGINES.md) — 사용 가능한 압축 엔진입니다.
- [COMPRESSION_RULES_FORMAT.md](compression/COMPRESSION_RULES_FORMAT.md) — 규칙 파일 형식입니다.
- [COMPRESSION_LANGUAGE_PACKS.md](compression/COMPRESSION_LANGUAGE_PACKS.md) — 언어 팩입니다.
- [RTK_COMPRESSION.md](compression/RTK_COMPRESSION.md) — RTK 엔진 심층 분석입니다.
- [CONTEXT_EDITING.md](compression/CONTEXT_EDITING.md) — 위임된 컨텍스트 편집(Anthropic)입니다.
- [EXTENDING_COMPRESSION.md](compression/EXTENDING_COMPRESSION.md) — 사용자 정의 압축 엔진을 추가하는 방법입니다.

## providers/

프로바이더별 통합 가이드입니다.

- [CLAUDE_WEB.md](providers/CLAUDE_WEB.md) — Claude Web(쿠키 인증) 프로바이더입니다.
- [CHATGPT_WEB.md](providers/CHATGPT_WEB.md) — ChatGPT Web(Codex) 프로바이더 및 일반 프로바이더 폐기 안내입니다.
- [COPILOT-M365.md](providers/COPILOT-M365.md) — Microsoft 365 Copilot(BizChat) 프로바이더입니다.
- [ALIBABA-QWEN-PROVIDER-FAMILIES.md](providers/ALIBABA-QWEN-PROVIDER-FAMILIES.md) — Alibaba 및 Qwen 프로바이더 계열입니다.
- [AGENTROUTER.md](providers/AGENTROUTER.md) — AgentRouter 설정입니다.
- [ZED-DOCKER.md](providers/ZED-DOCKER.md) — Docker 환경의 Zed IDE 통합입니다.
- [CURSOR-DOCKER.md](providers/CURSOR-DOCKER.md) — Docker 환경의 Cursor 모델 목록입니다.

## comparison/

- [OMNIROUTE_VS_ALTERNATIVES.md](comparison/OMNIROUTE_VS_ALTERNATIVES.md) — OmniRoute와 대안의 비교입니다.

## ops/

릴리스, 배포, proxy, 터널, 커버리지, 데이터베이스, 모니터링입니다.

- [RELEASE_CHECKLIST.md](ops/RELEASE_CHECKLIST.md) — 릴리스 절차 체크리스트입니다.
- [RELEASE_GREEN.md](ops/RELEASE_GREEN.md) — PR 큐와 릴리스 브랜치를 green 상태로 유지하는 방법입니다.
- [BRANCHING_MODEL.md](ops/BRANCHING_MODEL.md) — 브랜치 및 릴리스 모델입니다.
- [MERGE_TRAIN.md](ops/MERGE_TRAIN.md) — 머지 큐 및 수동 merge-train 런북입니다.
- [HOMOLOGATION.md](ops/HOMOLOGATION.md) — 적합성 검증 스위트(`npm run homolog`)입니다.
- [QUALITY_GATE_PLAYBOOK.md](ops/QUALITY_GATE_PLAYBOOK.md) — 품질 gate 플레이북입니다.
- [RUNNER_BOX.md](ops/RUNNER_BOX.md) — self-hosted runner box 운영입니다.
- [BRANCH_PROTECTION_MAIN.md](ops/BRANCH_PROTECTION_MAIN.md) — `main` 브랜치 보호입니다.
- [CONTRIBUTION_GOLDEN_PATH.md](ops/CONTRIBUTION_GOLDEN_PATH.md) — 기여 골든 패스(변경 유형별 집중 점검)입니다.
- [COVERAGE_PLAN.md](ops/COVERAGE_PLAN.md) — 테스트 커버리지 계획입니다.
- [DATABASE_GUIDE.md](ops/DATABASE_GUIDE.md) — DB 스키마와 운영입니다.
- [SQLITE_RUNTIME.md](ops/SQLITE_RUNTIME.md) — SQLite 드라이버 해석 체인입니다.
- [REDIS_PRODUCTION_CONFIG.md](ops/REDIS_PRODUCTION_CONFIG.md) — Redis 프로덕션 설정입니다.
- [MONITORING_GUIDE.md](ops/MONITORING_GUIDE.md) — 모니터링 및 관측성입니다.
- [FLY_IO_DEPLOYMENT_GUIDE.md](ops/FLY_IO_DEPLOYMENT_GUIDE.md) — Fly.io 배포입니다.
- [VM_DEPLOYMENT_GUIDE.md](ops/VM_DEPLOYMENT_GUIDE.md) — 일반 VM 배포입니다.
- [PROXY_GUIDE.md](ops/PROXY_GUIDE.md) — upstream proxy 설정입니다.
- [TUNNELS_GUIDE.md](ops/TUNNELS_GUIDE.md) — Cloudflare 터널 등입니다.

## diagrams/

위 문서들에서 참조하는 Mermaid 소스와 내보낸 SVG/PNG 다이어그램입니다. [diagrams/README.md](diagrams/README.md)를 참고하십시오.

## i18n/

66개 locale로 번역된 문서 미러입니다(영어 원본을 포함하면 총 67개 언어). 지원 언어 목록은 [i18n/README.md](i18n/README.md)를 참고하십시오.

## screenshots/

dashboard와 README에서 사용하는 정적 스크린샷입니다. 문서 본문의 일부가 아닙니다.

---

## 자동 생성 산출물

- [reference/PROVIDER_REFERENCE.md](reference/PROVIDER_REFERENCE.md)는 `scripts/docs/gen-provider-reference.ts`가 `src/shared/constants/providers.ts`로부터 생성합니다. 직접 편집하지 마십시오.
- `/docs` UI는 위의 하위 폴더를 기반으로 한 Fumadocs MDX 소스 생성을 바탕으로 합니다.
