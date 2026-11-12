---
title: "결정론적 라우팅 전략"
---

# 결정론적 라우팅 전략

OmniRoute의 self-hosted gateway 진입점(`/v1/chat/completions`, RIC-738)은 기본적으로 단일 프로바이더로 라우팅합니다. `strategy:` 블록을 구성하면 라우팅 결정이 **결정론적이고 설명 가능한 정책**이 됩니다. 이는 NotDiamond/Martian의 "예측" 방식 블랙박스 라우팅과 구별되는 OmniRoute만의 차별점입니다.

모든 결정은 다음 성질을 가집니다.

- **결정론적** — 같은 구성과 같은 런타임 상태에서는 같은 프로바이더가 선택됩니다.
- **구성으로 표현** — 규칙은 한 줄에 하나이며, "一体化智能体"도 학습된 모델도 없습니다.
- **설명 가능** — 모든 응답에는 "왜 이 모델인가?"(그리고 "왜 저 모델은 아닌가")에 대한 한 줄짜리 답인 `x-omniroute-route-decision`이 포함됩니다.

이것은 RIC-697 차별화 계획의 M2(D3 可审计路由)입니다. **예측 / ML 의존성은 없습니다.** 전략은 관찰 가능한 신호(연속 실패 횟수, 선언된 비용, 측정된 지연 시간)에 대한 순수한 규칙입니다.

## 활성화

`providers:`와 같은 YAML 문서에 `strategy:` 블록을 추가하거나, `OMNIROUTE_SELF_HOSTED_STRATEGY`(인라인 YAML) / `OMNIROUTE_SELF_HOSTED_STRATEGY_FILE`(파일)이 독립된 `strategy:` 문서를 가리키도록 설정합니다. 명시적인 env 전략은 인라인 블록 위에 키 단위로 병합됩니다.

```yaml
# providers.yaml
providers:
  - id: cheap
    kind: openai
    baseUrl: http://127.0.0.1:11434/v1
    model: llama3
    costPer1MInput: 0.2 # USD per 1M input tokens — used by cost-priority
  - id: fast
    kind: openai
    baseUrl: http://127.0.0.1:8080/v1
    model: gpt-4o-mini
    costPer1MInput: 0.6
  - id: premium
    kind: anthropic
    baseUrl: http://127.0.0.1:8081
    model: claude-sonnet
    costPer1MInput: 3.0

strategy:
  blacklist: [] # provider ids never used
  whitelist: [cheap, fast, premium] # when non-empty, ONLY these are used
  costPriority: true # cheapest eligible candidate first
  latencyAware:
    enabled: true # fastest recent-average candidate first
  cooldown:
    consecutiveFailures: 2 # breaker trips after this many in a row
    cooldownMs: 30000 # …and the provider stays excluded this long
  fallbackChain: [cheap, fast, premium] # explicit fallback order
```

## 다섯 가지 전략

| 전략 | 구성 | 효과 |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Blacklist | `blacklist: [id, ...]` | 나열된 프로바이더는 후보가 되지 않습니다. |
| Whitelist | `whitelist: [id, ...]` | 비어 있지 않으면 나열된 프로바이더만 후보가 됩니다. |
| Cooldown/breaker | `cooldown: {consecutiveFailures, cooldownMs}` | 연속 N회 실패하면 해당 프로바이더는 지정된 시간 동안 제외됩니다. 성공하면 카운터가 초기화됩니다. |
| 비용 우선 | `costPriority: true` | 적격 후보를 `costPer1MInput` 오름차순으로 정렬합니다(선언된 값만 사용하며, 임의로 만들어내지 않습니다). |
| 지연 시간 기반 | `latencyAware.enabled: true` | 적격 후보를 최근 평균 요청 지연 시간 오름차순으로 정렬합니다. 샘플이 없는 프로바이더는 마지막에 놓입니다. |
| fallback 체인 | `fallbackChain: [id, ...]` | 기본 프로바이더에서 백업 프로바이더로 이어지는 명시적 순서입니다. 비용/지연 시간 순서보다 우선합니다. |

필터(blacklist / whitelist / cooldown)가 먼저 실행되어 후보를 제거합니다. 그다음 정렬 단계가 남은 후보를 정렬합니다. 명시적인 `fallbackChain`이 우선하며, 그렇지 않으면 `costPriority`, `latencyAware` 순으로 적용됩니다.

## 고정된 프로바이더

`x-omniroute-provider` 헤더와 `provider/model` 모델 접두사는 선호가 아니라 **명시적 고정**입니다. 고정된 프로바이더가 하드 필터(blacklist / whitelist / 활성 cooldown)에 의해 제외되면, 요청은 `400`과 고정 사유로 실패합니다. gateway는 특정 프로바이더를 요청한 클라이언트를 조용히 다른 곳으로 라우팅하지 않습니다. 고정된 프로바이더가 필터를 통과하면 첫 번째 후보가 되며, 나머지 후보는 그 프로바이더의 fallback 체인으로 사용됩니다.

## 실패 시 fallback

정렬된 후보 목록이 곧 fallback 체인입니다. 첫 번째 프로바이더가 실패하면(네트워크 연결 불가, 연결 거부, DNS/TLS 오류, 또는 2xx가 아닌 모든 응답) gateway는 다음 후보로 넘어가며, 이를 반복합니다. 각 실패는 cooldown breaker에 기록되고 각 시도는 지연 시간이 샘플링되므로, 고장 난 기본 프로바이더는 _이후_ 요청에서도 cooldown 상태가 됩니다. 모든 후보가 실패하면 마지막으로 정규화된 오류(OpenAI 형식)가 반환됩니다. 적격 후보가 전혀 없으면, 설명 가능한 전체 결정 내용과 함께 `503`이 반환됩니다.

## 설명 가능성

전략 엔진을 거쳐 라우팅된 모든 응답에는 다음이 포함됩니다.

```
x-omniroute-route-decision: cheap(cost-priority: cheap #1) -> fast(cost-priority: fast #2); premium excluded: blacklist: premium forbidden
```

이 값은 정렬된 후보 목록과 모든 제외 사유로 이루어져 있으며, "왜 이 모델이고 왜 저 모델은 아닌가"에 대한 감사 기록입니다.

## 실패 계약 (RIC-738과 동일)

- upstream의 2xx가 아닌 응답 본문은 `parseUpstreamError`와 `buildErrorBody`를 거쳐 표준 OpenAI `error` 형식으로 정규화됩니다(Hard Rule #12).
- 네트워크 수준 실패는 정규화된 `502`를 반환하며, 전체 체인이 소진된 뒤에는 마지막으로 정규화된 오류가 노출됩니다.
- upstream으로 되돌아온 자격 증명 / 세션 헤더는 모든 응답에서 제거됩니다.
- 형식이 잘못된 `strategy:` 블록이 있는 프로바이더 구성은 `500`을 반환합니다. 잘못 구성된 정책이 조용히 아무 동작도 하지 않는 상태가 되는 일은 없습니다.

## 테스트

- `tests/unit/routing-strategies.test.ts` — 순수 전략 엔진에 대한 25개의 단위 테스트: 파싱, blacklist/whitelist, cooldown breaker, 비용 우선, 지연 시간 기반, fallback 체인, 결합 파이프라인, 설명 가능성.
- `tests/unit/self-hosted-entry.test.ts` — 실제 HTTP 위에서의 장애 주입: 기본 프로바이더 중단 → fallback 성공, 전체 중단 → 마지막 오류, 고정된 프로바이더가 blacklist에 있음 → 400, cooldown이 다음 요청에서 실패하는 프로바이더를 제외, 적격 후보 없음 → 설명 가능한 결정과 함께 503.
