---
title: "CLI 모델 카탈로그와 수동 메타데이터"
version: "3.8.51"
lastUpdated: "2026-09-21"
---

# CLI 모델 카탈로그와 수동 메타데이터

`omniroute models`는 선택한 서버의 공개 모델 카탈로그를 먼저 읽으며, 여기에는 서버의
커스텀 항목과 동기화된 항목이 포함됩니다. `--output json`과 `--output jsonl`은 조건에
맞는 모든 행을 표 잘림 메시지 없이 반환합니다. 대화형 표는 최대 50행을 표시합니다.
JSON은 공개 컨텍스트 한도, 모달리티, 기능, 서버가 제공한 경우의 모델 출처, API 형식
메타데이터를 보존하며, 자격 증명과 호환성 헤더는 출력하지 않습니다. 레거시
`/api/models` fallback은 공개 endpoint가 HTTP 404, 405 또는 501을 반환할 때만
사용되고, 인증 실패 이후에는 사용되지 않습니다. `omniroute completion refresh`는
동일한 카탈로그를 사용합니다. 모델 카탈로그 요청이 실패하면 0이 아닌 종료 코드를
반환하고 이전 completion 캐시를 보존합니다. Bash, Zsh, Fish completion 스크립트는
수동 모델 하위 명령을 안내합니다.

## 수동 모델 수명 주기

이 작업들은 기존의 인증된 `/api/provider-models` 관리 API를 사용합니다. 다른 CLI
명령과 동일한 전역 `--context` 및 `--base-url` 선택을 따릅니다. 정식 프로바이더 ID와
프로바이더의 모델 ID를 따로 사용하십시오. 슬래시가 포함된 모델 ID도 유효합니다.
자격 증명을 명령 인자에 넣지 말고 구성된 관리 컨텍스트를 사용하십시오.

```bash
omniroute models openai --output json
omniroute models manual openai
omniroute models add openai my-model --name "My model" --context-window 32768 --dry-run
omniroute models add openai my-model --name "My model" --context-window 32768
omniroute models edit openai my-model --context-window 65536
omniroute models edit openai my-model --clear-context-window
omniroute models remove openai my-model --dry-run
omniroute models remove openai my-model --yes
```

예시는 구문을 설명합니다. 프로바이더/모델 ID는 사용 중인 서버에 속한 항목으로
바꾸십시오. add 작업은 프로바이더 연결을 생성하지 않습니다.

- `add`는 이미 존재하는 커스텀 항목을 거부합니다. 선택 사항인 `--max-output-tokens`는
  생성 시 출력 한도를 설정하고, `--api-format`은 모델의 API 형식과 이에 대응하는
  endpoint 메타데이터를 설정합니다. 예를 들어 `chat`이 아닌 `embeddings`입니다.
- `edit`는 기존 수동 항목이 필요합니다. 컨텍스트 한도는 백엔드의 독립적인 수동
  컨텍스트 재정의를 사용하며, 이를 지우면 그 재정의만 제거되고 원래의 입력 한도나
  동기화된 메타데이터는 제거되지 않습니다.
- `remove`는 `--dry-run`을 사용하는 경우를 제외하고 `--yes`가 필요합니다.
  `resetOverride=true`를 요청하여 동일한 ID의 동기화된 항목을 보존합니다. 일괄 삭제는
  제공되지 않습니다.
- `--dry-run`은 인증된 사전 읽기만 수행하며 쓰기나 추론은 수행하지 않습니다.
- 실제로 변경이 일어나는 모든 작업은 수동 카탈로그를 다시 읽어 확인합니다.
  `persistenceVerified: true`는 요청한 메타데이터가 쓰기 이후에 확인되었다는 뜻이며,
  모델이 텍스트를 생성하거나 도구를 호출할 수 있다는 뜻은 아닙니다.
  `inferenceValidation`은 항상 `not-run`입니다.
- readback이 실패하면 0이 아닌 종료 코드를 반환합니다. 쓰기는 이미 반영되었을 수
  있으므로 재시도하기 전에 서버를 확인하십시오. 동시에 쓰기를 수행하는 클라이언트는 이 CLI에서
  직렬화되지 않으며, 기존 API는 compare-and-swap 트랜잭션을 제공하지 않습니다.

## Test & Add: 미구현

수동 항목은 검증되지 않습니다. `--validate` 플래그는 없으며 이 명령들은 추론 요청을
보내거나 도구를 실행하지 않습니다. 향후의 opt-in 검증 흐름은 추론 자격 증명과 관리
인증을 분리해야 하며, 세 가지 증명(생성, nonce에 바인딩된 합성 도구 호출, 합성 도구
결과 이후의 이어가기)을 모두 정확히 어느 프로바이더 연결이 만들어 냈는지 확립해야
합니다. 이 증명에는 실제 도구 실행이 필요하지 않습니다.

기존의 `x-omniroute-connection` pin만으로는 증명 receipt로 충분하지 않습니다.
자격 증명 선택은 cooldown, 할당량 또는 제외된 계정의 경우에 의도적으로 pin을 해제할
수 있고, 세션 어피니티도 선택에 관여하기 때문입니다. `src/sse/services/auth.ts`와
`src/sse/handlers/chat.ts`의 `forcedConnectionId` 처리를 참조하십시오. Test & Add를
구현하기 전에 엄격한 pin 또는 검증 가능한 연결 receipt 계약을 결정해야 합니다. 그런
다음 테스트는 실패했거나, 잘렸거나, 시간 초과되었거나, 잘못된 연결의 응답 이후에는
어떤 것도 저장되지 않음을 증명해야 합니다. 이는 별도의 백엔드 계약 결정이며, 수동
CRUD가 약속하는 사항이 아닙니다.
