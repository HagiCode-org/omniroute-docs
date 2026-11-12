---
title: "추론 인증 태세"
---

# 추론 인증 태세

## 개요

`GET /v1/models`와 추론 endpoint는 **서로 다른 설정**으로 제어됩니다. 따라서 운영자가
"내 API는 보호되고 있는가?"라는 질문에 답하기 위해 가장 자연스럽게 실행하는 probe가
잘못된 답을 줄 수 있습니다.

| Endpoint | 적용되는 설정 |
| --- | --- |
| `GET /v1/models` | dashboard 로그인 태세 — `isAuthRequired()`이며, 인스턴스별로 `requireAuthForModels`로 재정의할 수 있습니다 (`src/app/api/v1/models/catalogRequest.ts`) |
| `POST /v1/chat/completions`, `POST /v1/responses` 및 기타 클라이언트 API 경로 | `REQUIRE_API_KEY` (`src/server/authz/policies/clientApi.ts`) |

관리자 비밀번호가 설정되어 있고 `REQUIRE_API_KEY=false`인 인스턴스에서는 `/v1/models`가
`401`로 응답하지만, 추론은 포트에 접근할 수 있는 누구에게나 열려 있습니다.

> **probe 시 주의 사항:** `/v1/models`의 `401`은 추론이 보호되고 있음을 확인해 주지
> **않습니다**. dashboard에 로그인이 필요하다는 것만 알려 줍니다.

이는 가상의 이야기가 아닙니다. discussion #13310에서는 Traefik 뒤에 있는 self-hosted
인스턴스의 Codex 할당량이 익명 `POST /v1/responses` 트래픽으로 소진되었는데, 그동안
`/v1/models`는 `401`을 반환했습니다. 이는 제보자의 표현대로 "처음에는 API 전체가
보호되고 있다는 인상을 주었고", 엉뚱한 구성 요소를 조사하게 만들었습니다.

## 실제로 확인하는 방법

카탈로그가 아니라 추론 경로를 probe하십시오:

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST http://<host>:<api-port>/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"<any-model>","messages":[{"role":"user","content":"ping"}]}'
```

`401`은 `REQUIRE_API_KEY`가 적용되고 있다는 뜻입니다. 라우팅에 도달하는 모든 응답(모델을
찾을 수 없다는 오류 포함)은 익명 트래픽이 허용된다는 뜻입니다.

`REQUIRE_API_KEY=false`일 때는 **유효하지 않은** bearer가 거부되지 않고 익명으로
강등됩니다(#2257). 따라서 의미 없는 키를 보내는 것도 유효한 probe가 아닙니다.

## 시작 시 경고

`REQUIRE_API_KEY`가 비활성화되어 있고 서버가 non-loopback 인터페이스에 바인딩되면
OmniRoute는 부팅 시 경고를 기록합니다(`src/lib/startup/nonLoopbackApiKeyGuard.ts`).
이 경고는 세 가지 대상을 다룹니다:

- `/v1` 추론을 제공하는 Dashboard/API 서버 — `HOST`, 기본값 `0.0.0.0`
- API bridge — `API_HOST`, 기본값 `127.0.0.1`
- 실시간 dashboard WebSocket — 자체 호스트

이 경고는 부팅을 막지 않습니다. OmniRoute 앞단의 reverse proxy가 이미 자체 인증을
적용하고 있을 수 있기 때문입니다.

## 관련 항목

- [ENVIRONMENT.md](../reference/ENVIRONMENT.md)의 `REQUIRE_API_KEY`
- `APP_BIND_HOST`와 compose loopback 기본값 (#12568)
- #2257 — `REQUIRE_API_KEY`가 꺼져 있을 때 유효하지 않은 bearer는 익명으로 강등됩니다
- #13695 — 이 문서
