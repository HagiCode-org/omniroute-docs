---
title: "다이어그램"
version: 3.8.49
lastUpdated: 2026-07-17
---

# 다이어그램

OmniRoute v3.8.0 아키텍처 흐름을 위한 Mermaid 소스(`.mmd`)와 내보낸 SVG입니다.

## 정식 다이어그램

| 소스 | 내보낸 파일 | 사용처 |
| --- | --- | --- |
| [request-pipeline.mmd](./request-pipeline.mmd) | [SVG](./exported/request-pipeline.svg) | docs/architecture/ARCHITECTURE.md, docs/architecture/CODEBASE_DOCUMENTATION.md |
| [auto-combo-scoring.mmd](./auto-combo-scoring.mmd) | [SVG](./exported/auto-combo-scoring.svg) | docs/routing/AUTO-COMBO.md |
| [resilience-3layers.mmd](./resilience-3layers.mmd) | [SVG](./exported/resilience-3layers.svg) | docs/architecture/RESILIENCE_GUIDE.md, CLAUDE.md |
| [i18n-flow.mmd](./i18n-flow.mmd) | [SVG](./exported/i18n-flow.svg) | docs/guides/I18N.md |
| [mcp-tools.mmd](./mcp-tools.mmd) | [SVG](./exported/mcp-tools.svg) | docs/frameworks/MCP-SERVER.md |
| [cloud-agent-flow.mmd](./cloud-agent-flow.mmd) | [SVG](./exported/cloud-agent-flow.svg) | docs/frameworks/CLOUD_AGENT.md |
| [authz-pipeline.mmd](./authz-pipeline.mmd) | [SVG](./exported/authz-pipeline.svg) | docs/architecture/AUTHZ_GUIDE.md |
| [db-schema-overview.mmd](./db-schema-overview.mmd) | [SVG](./exported/db-schema-overview.svg) | docs/architecture/CODEBASE_DOCUMENTATION.md |

## 수작업으로 작성한 애니메이션 다이어그램

모든 다이어그램이 `.mmd` 소스에서 만들어지는 것은 아닙니다. 수작업으로 작성한 SVG는 이 디렉터리의 루트에 있으며 SMIL만으로 애니메이션을 구현하므로(JS 없음, 외부 폰트 없음) GitHub의 `<img>` sandbox 안에서도 재생됩니다:

| 파일 | 사용처 | 비고 |
| --- | --- | --- |
| [tier-cascade.svg](./tier-cascade.svg) | README.md (루트) | 애니메이션이 적용된 4티어 auto-fallback 캐스케이드(16초 반복, 4막). SVG를 직접 편집하십시오. `.mmd` 소스는 없습니다. |
| [pool-fair-share.svg](./pool-fair-share.svg) | — (사용되지 않음) | 애니메이션이 적용된 키 풀 공정 분배 할당량(관대 → 엄격, 16초 반복). SVG를 직접 편집하십시오. `.mmd` 소스는 없습니다. |
| [combo-always-on.svg](./combo-always-on.svg) | 스타일 참조 | 애니메이션이 적용된 priority-combo fallback(4개 계층, 16초 반복). SVG를 직접 편집하십시오. `.mmd` 소스는 없습니다. |
| [cli-terminal.svg](./cli-terminal.svg) | README.md (루트) | 절반 높이의 컴팩트한 애니메이션 터미널(1200×350): 실제 CLI 명령 3개가 타자기 효과와 스크롤되는 하위 명령 티커와 함께 순환하며, 첫 프레임은 완성된 프로바이더 화면입니다. SVG를 직접 편집하십시오. `.mmd` 소스는 없습니다. |
| [compression-pipeline.svg](./compression-pipeline.svg) | README.md (루트) | 애니메이션이 적용된 12개 엔진 압축 깔때기(8초 반복). SVG를 직접 편집하십시오. `.mmd` 소스는 없습니다. |
| [free-tier-budget.svg](./free-tier-budget.svg) | README.md (루트) | 애니메이션이 적용된 무료 티어 예산 카드(~1.62B/mo로 수치화한 헤드라인, 17개 풀 + Groq 상한 예산 막대, 풀별 그리드, 가입 크레딧, 10초 반복). SVG를 직접 편집하십시오. `.mmd` 소스는 없습니다. |
| [readme-hero.svg](./readme-hero.svg) | README.md (루트) | 애니메이션이 적용된 hero 카드(태그라인, 실시간 프로바이더/무료 접근 헤드라인, 전체 너비 압축 막대 데모, 통계 칩 6개). SVG를 직접 편집하십시오. `.mmd` 소스는 없습니다. |
| [promise-pillars.svg](./promise-pillars.svg) | README.md (루트) | 애니메이션이 적용된 "The Promise" 6개 기둥 카드(12초 주기의 테두리 강조 스윕). SVG를 직접 편집하십시오. `.mmd` 소스는 없습니다. |
| [why-pain-fix.svg](./why-pain-fix.svg) | README.md (루트) | 애니메이션이 적용된 "Why OmniRoute" 10행 pain-vs-fix 원장(15초 주기의 녹색 행 스윕). SVG를 직접 편집하십시오. `.mmd` 소스는 없습니다. |
| [strategies-grid.svg](./strategies-grid.svg) | README.md (루트) | 19개 라우팅 전략 중 18개를 보여 주는 애니메이션 그리드. `cache-optimized`는 인접한 표에 계속 문서화되어 있습니다. SVG를 직접 편집하십시오. `.mmd` 소스는 없습니다. |
| [privacy-local.svg](./privacy-local.svg) | README.md (루트) | 애니메이션이 적용된 "Private & Local-First" 11행 보장 원장과 receipt 칩(16초 주기의 녹색 행 스윕). SVG를 직접 편집하십시오. `.mmd` 소스는 없습니다. |
| [resilience-layers.svg](./resilience-layers.svg) | README.md (루트) | 애니메이션이 적용된 3계층 복원력 카드(breaker 상태 CLOSED→OPEN→HALF-OPEN, ×2 backoff가 적용된 키 cooldown, 모델 lockout — 18초 반복). SVG를 직접 편집하십시오. `.mmd` 소스는 없습니다. |

## 업데이트 방법

1. `*.mmd`를 편집합니다.
2. 다시 렌더링합니다: `npm run docs:render-diagrams` (`@mermaid-js/mermaid-cli`를 사용합니다).
3. `.mmd`와 `.svg`를 함께 커밋합니다.

`@mermaid-js/mermaid-cli`를 로컬에서 사용할 수 없다면 한 번만 설치하십시오:

```bash
npm install -g @mermaid-js/mermaid-cli
```

이 스크립트는 `docs/diagrams/`의 모든 `.mmd`를 흰색 배경으로 `docs/diagrams/exported/*.svg`에 렌더링하며, 어두운 테마와 밝은 테마 모두에 적합합니다.

## 문서에서 링크하기

`docs/<subfolder>/`에 있는 문서에서는 상대 경로가 `../diagrams/...`가 됩니다:

```markdown
![Request pipeline](../diagrams/exported/request-pipeline.svg)

> Source: [../diagrams/request-pipeline.mmd](../diagrams/request-pipeline.mmd)
```

저장소 루트(예: `CLAUDE.md`)에서는 다음과 같이 합니다:

```markdown
![Resilience layers](./exported/resilience-3layers.svg)
```

## 규칙

- 다이어그램 하나에는 개념 하나만 담습니다. 플랫폼 전체를 하나의 차트에 넣으려 하지 마십시오.
- 노드 레이블은 짧게(3-6단어) 유지합니다. 노드 안에서 줄을 바꿀 때는 `<br/>`를 사용합니다.
- 파이프라인에는 `flowchart LR`을, 계층형 모델에는 `flowchart TB`를 권장합니다.
- 대화형(요청/응답) 흐름에는 `sequenceDiagram`을 사용합니다.
- 데이터베이스 스키마 개요에는 `erDiagram`을 사용합니다.
- `.mmd`와 `.svg`를 같은 커밋에서 함께 업데이트하십시오. 둘이 항상 일치하도록 유지합니다.
