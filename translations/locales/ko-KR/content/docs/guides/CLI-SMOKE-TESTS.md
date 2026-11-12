---
title: 격리된 CLI smoke test
description: 일회용 로컬 응답으로 설치된 CLI의 프로토콜 계약을 검증합니다.
version: "3.8.51"
lastUpdated: "2026-09-22"
---

# 격리된 CLI smoke test

이미 설치된 Aider, Goose, OpenCode, Qwen Code 또는 Codex 바이너리를 대상으로
선택적 harness를 실행합니다:

```bash
node scripts/cli/smoke-cli-integrations.mjs --targets qwen,codex --json
```

`--bin-dir /absolute/path`는 기존 바이너리 디렉터리를 앞에 추가합니다. harness는 도구를
설치하지 않습니다. 실행 파일이 없으면 `HOLD-missing-binary`가 생성되고, 타임아웃이
발생하면 `HOLD-timeout`이 생성됩니다. FAIL이 하나라도 있으면 프로세스는 종료 코드 1로
종료되고, HOLD가 있으면 종료 코드 2로 종료됩니다. 종료 코드 0이 되려면 모든 대상이
PASS여야 합니다.

각 대상은 `omniroute run`을 통해 `127.0.0.1`에 바인딩된 일회용 HTTP 서버를 상대로
실행되며, 비밀이 아닌 고정 sentinel 자격 증명을 사용합니다. HOME, XDG 디렉터리, CLI
구성 홈, OmniRoute 데이터 디렉터리는 임시 경로입니다. 프로바이더 자격 증명, proxy
변수, 런타임 로더 플래그, 기존 구성은 상속되지 않습니다. 실제 upstream 자격 증명은
필요하지 않으며 허용되지도 않습니다.

명시적인 `--inherit-isolated-env` harness 옵션은 `omniroute run`에 `--inherit-env`를
전달하여, harness가 제어하는 메타데이터/업데이트 억제 플래그가 서드파티 자식 프로세스에
도달하도록 허용합니다. 기본값은 꺼짐이며, 켜더라도 동일한 좁은 허용 목록으로 외부
환경을 다시 구성합니다. 호출자의 비밀 값, `NODE_OPTIONS`, `NODE_PATH`, `LD_PRELOAD`,
`PYTHONPATH`, proxy 설정은 절대 상속하지 않습니다. 스토리지 암호화는 일회용 데이터
디렉터리 안에서만 비밀이 아닌 sentinel을 사용합니다. harness는 또한 LiteLLM의 패키지된
모델 메타데이터와 버퍼링 없는 Python 출력을 선택합니다. 이는 고정된 테스트 제어이며
호출자가 제공하는 환경 값이 아닙니다. 이 옵션에는 `run --inherit-env`를 구현한 CLI가
필요합니다. 지원하지 않는 launcher는 정상적으로 실패하며 성공한 smoke test로 집계해서는
안 됩니다.

PASS가 되려면 자식 프로세스의 정상 종료, 예상한 프로토콜 경로와 모델, sentinel 인증
헤더, 완료된 HTTP 응답, 그리고 stdout에 서버가 생성한 예측 불가능한 응답 마커가
있어야 합니다. 이 마커는 prompt에 나타나지 않으므로, prompt나 진단 메시지를 출력하는
것만으로는 테스트를 통과할 수 없습니다. 이는 설치된 바이너리의 전송/응답 계약을
증명할 뿐, 실제 프로바이더 인증, 도구 실행, 프로덕션 배포, 모든 CLI 버전을 증명하지는
않습니다.

runner는 캡처하는 출력과 실행 시간에 상한을 둡니다. POSIX에서는 전용 프로세스 그룹을
만들고 정리 시점에 해당 그룹의 남은 구성원을 종료합니다. Windows에서는 동등한 하위
프로세스 정리가 구현되어 있지 않으므로 현재 `HOLD-process-isolation`을 반환합니다.
임시 파일과 서버 소켓은 각 대상이 끝난 뒤 닫힙니다. 이는 구성과 프로세스의 격리이며,
**운영 체제 수준의 네트워크 sandbox가 아닙니다**. 서드파티 바이너리는 자체적으로
메타데이터나 업데이트 요청을 시도할 수 있습니다. 신뢰할 수 있는 설치된 바이너리만
실행하고, loopback이 아닌 트래픽이 전혀 없어야 한다면 외부에서 제한된 환경을
사용하십시오.

서드파티 바이너리 없이 harness의 결정적 테스트를 실행합니다:

```bash
node --import tsx/esm --test tests/unit/cli/real-cli-smoke-harness.test.ts tests/unit/cli/real-cli-smoke-safety.test.ts
```

mock은 OpenAI Chat Completions와 Responses API의 JSON/SSE를 지원합니다. 요청을
프로바이더로 전달하는 일은 없습니다. 자격 증명에 의존하는 upstream 테스트는 별도의
opt-in 검증으로 남으며, 이 harness가 다루는 범위로 보고해서는 안 됩니다.
