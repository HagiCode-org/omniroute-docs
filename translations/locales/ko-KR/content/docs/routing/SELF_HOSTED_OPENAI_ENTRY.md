---
title: "Self-Hosted OpenAI 호환 진입점"
---

# Self-hosted 통합 OpenAI 호환 진입점

활성화하면 OmniRoute의 기존 `/v1/chat/completions`(및 이 경로가 제공하는 OpenAI 호환
계약)가 **self-hosted gateway**가 됩니다. OpenAI 호환 요청 하나가 들어오면 프로바이더
어댑터를 통해 사용자가 선택한 프로바이더로 자동 라우팅되고, 표준 OpenAI 오류 형식으로
응답이 나갑니다. 클라이언트 코드는 변경되지 않습니다.

이것은 RIC-697 설계의 D4(接入即用) 차별점입니다. OpenAI SDK가 이미 대상으로 삼는 동일한
`/v1` 경로이며, 단일 번들 카탈로그 대신 사용자의 자체 프로바이더가 뒷받침합니다.

## 활성화

다음 환경 변수 중 하나를 설정하십시오(두 변수 모두 `.env.example`을 참조하십시오):

- `OMNIROUTE_SELF_HOSTED_PROVIDERS` — 인라인 YAML 문서(런타임 전용, 로그에 기록되지 않음).
- `OMNIROUTE_SELF_HOSTED_PROVIDERS_FILE` — YAML 파일의 경로.

```yaml
# providers.yaml
providers:
  - id: local
    kind: openai # openai | anthropic | local
    baseUrl: http://127.0.0.1:11434/v1
    model: llama3
    # apiKey: sk-...       # optional, runtime-only
  - id: claude
    kind: anthropic
    baseUrl: http://127.0.0.1:8080
    model: claude-sonnet
```

**어느 한쪽이라도** 설정되면 통합 진입점이 `/v1/chat/completions`로 들어오는 모든 요청에
대해 활성화됩니다. 구성이 존재하지만 파싱할 수 없으면 `500`을 반환합니다(클라우드
라우팅으로 조용히 넘어가지 않습니다). 둘 다 설정되지 않으면 이 경로는 이전과 똑같이
동작합니다.

## 프로바이더 자동 라우팅

우선순위(결정적이며 예측 모델을 사용하지 않음):

1. `x-omniroute-provider: <id>` 헤더 — 정확한 프로바이더 id.
2. `model` 접두사: `provider/model`(슬래시) 또는 `provider::model`(이중 콜론).
3. 처음 구성된 프로바이더.

라우팅 접두사는 전달 전에 제거됩니다. upstream은 접두사가 없는 모델(`claude/claude-sonnet`이
아닌 `claude-sonnet`)을 받습니다.

```bash
# via header
curl http://localhost:20128/v1/chat/completions \
  -H "x-omniroute-provider: claude" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet","messages":[{"role":"user","content":"hi"}]}'

# or via model prefix
curl ... -d '{"model":"claude/claude-sonnet","messages":[...]}'
```

## 인증 스캐폴드(D5 예약)

선택 사항인 `OMNIROUTE_SELF_HOSTED_API_KEY`입니다. 설정하면 요청에
`Authorization: Bearer <key>`가 포함되어야 합니다. 설정하지 않으면 열린 경로입니다
(loopback / 신뢰할 수 있는 네트워크). 이는 OmniRoute의 기존 로컬 프로바이더가 동작하는
방식과 같습니다. D5 할당량/quota-自治 키 시스템이 이 헤더를 이어받을 것으로 예상됩니다.

## 실패 계약

- upstream의 2xx가 아닌 응답 본문은 `parseUpstreamError` + `buildErrorBody`를 거쳐 표준
  OpenAI `error` 형식으로 정규화됩니다(Hard Rule #12 — upstream 원문은 절대 그대로
  노출하지 않음).
- 네트워크 수준 실패(연결 거부 / DNS / TLS)는 정규화된 `502`를 반환하며
  `error.message: "Upstream provider unreachable: …"`가 포함됩니다.
- upstream에서 그대로 되돌아온 자격 증명 / 세션 헤더는 모든 응답에서 제거됩니다.

## 테스트

`tests/unit/self-hosted-entry.test.ts`는 프로바이더 선택, 모델 접두사 전달, 헤더 위생,
인증, upstream 오류 정규화, SSE 스트리밍 passthrough, fall-through / 구성 오류 경로를
다루며, 모두 로컬 upstream을 대상으로 한 실제 HTTP로 수행됩니다.

## 참고 사항

- Self-hosted 모델은 설계상 클라우드 전용 지원 종료(retirement) / alias 처리 구조를 우회합니다. 우회는
  해당 클라우드 검사보다 먼저 일어나므로 `local/llama3` 같은 id가 cloud-peer 410이나
  alias 재작성에 걸리는 일은 없습니다.
- 결정적 라우팅 전략(fallback / cooldown / cost / latency / blacklist)은 M2의
  범위(`RIC-740`)이며 여기의 gateway 계층에 주입됩니다. `strategy:` 블록으로 구성하십시오 —
  [DETERMINISTIC_ROUTING.md](./DETERMINISTIC_ROUTING.md)를 참조하십시오.
