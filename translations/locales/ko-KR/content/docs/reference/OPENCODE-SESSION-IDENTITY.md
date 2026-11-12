---
title: "OpenCode 대화 식별"
version: 3.8.51
lastUpdated: 2026-09-21
---

# OpenCode 대화 식별

OpenCode와 OpenCode Go는 여러 턴에 걸쳐 명시적인 대화 ID를 재사용합니다. 리졸버는 `x-opencode-session`, 기존 어피니티/세션 헤더, 네이티브 CLI 세션/스레드 헤더, 요청 메타데이터, 그리고 최상위 세션/스레드 필드를 순서대로 확인합니다. Claude의 JSON으로 인코딩된 `metadata.user_id`에서 세션 ID를 검사하며, 불투명한 계정/사용자 ID만으로는 대화 ID로 취급하지 않습니다.

제어 문자를 포함한 값, 빈 ID, 256자를 초과하는 ID는 무시됩니다. JSON 메타데이터 파싱에는 상한이 있습니다. 변환 전에 실행기 헤더 정규화기는 이 식별 정보를 OpenCode 프로바이더에 대해서만 보존하며, 다른 프로바이더에는 OpenCode 헤더를 주입하지 않습니다.

기존의 정식 `ses_` 인코딩과 대화 핑거프린트 fallback은 변경되지 않습니다. 명시적인 ID가 없으면 첫 번째 사용자 메시지와 기존의 다른 핑거프린트 입력이 계속 연속성을 결정합니다. 이것은 새로운 인가 경계가 아니며, upstream 콘텐츠가 격리된다는 증거도 아닙니다.

구현은 `open-sse/utils/opencodeSessionIdentity.ts`, `open-sse/utils/opencodeHeaders.ts`, `open-sse/handlers/chatCore/executorClientHeaders.ts`에 있습니다. 회귀 테스트는 네이티브 ID, Claude 메타데이터, 우선순위, 잘못된 값, 기존 핑거프린트 동작을 다루며, 유료 upstream 호출은 사용하지 않습니다.
