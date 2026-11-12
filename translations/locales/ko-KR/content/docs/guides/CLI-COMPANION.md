---
title: "CLI Companion — 복사 전용 터미널 안내"
version: 3.8.51
lastUpdated: 2026-09-22
---

# CLI Companion

CLI Code dashboard에는 이 OmniRoute 버전이 지원하는 실행 가능한 CLI 대상을 위한 복사 전용 companion이 포함되어 있습니다. 이 companion은 프로세스를 시작하거나, 구성을 기록하거나, 추론을 테스트하거나, 자격 증명을 clipboard로 전송하지 않습니다.

## 서버 감지는 브라우저 감지가 아닙니다

감지, 런타임, 구성 상태는 OmniRoute 서버가 실행 중인 컴퓨터에 대한 정보입니다. 노트북에서 원격 dashboard를 여는 경우, 해당 서버에 CLI가 없다는 사실은 노트북에 설치된 CLI에 대해 아무것도 알려 주지 않습니다. 알 수 없음과 감지 실패는 명시적으로 구분되어 표시되며, "설치되지 않음"으로 취급되지 않습니다. 원시 진단 오류와 구성 endpoint는 이 패널에 표시되지 않습니다.

CLI를 사용하려는 컴퓨터의 터미널에 명령을 복사하십시오. 서버 감지에 실패하더라도 companion은 로컬 안내를 차단하지 않습니다.

## 로컬 또는 원격 컨텍스트

먼저 터미널에 이미 구성된 컨텍스트를 확인합니다.

```sh
omniroute contexts list
omniroute contexts current
```

companion의 컨텍스트 필드를 비워 두면 CLI의 활성 컨텍스트를 사용하며, 기존 컨텍스트 이름을 입력할 수도 있습니다. 이름이 지정된 컨텍스트는 로컬 서버 또는 원격 서버를 가리킬 수 있습니다. dashboard는 터미널의 컨텍스트 저장소를 읽지 않으며, 컨텍스트를 만들거나 그 자격 증명을 복사하지도 않습니다. 예를 들어 `office`가 이미 존재하는 경우는 다음과 같습니다.

```sh
omniroute configure claude --context office
omniroute run claude --context office --dry-run
```

`configure`는 대화형이며, 실행하는 컴퓨터에 구성을 기록합니다. `run --dry-run`은 대상을 시작하지 않고 실행 계획을 표시하며, upstream 추론이 동작한다는 사실을 보증하지는 않습니다. 이 명령을 실행하기 전에 기존 CLI 컨텍스트 워크플로를 사용하여 터미널을 인증하십시오.

실행 가능한 manifest에 선언된 기능만 제공됩니다. 대상이 모델을 요구하는 경우, 실제 모델 식별자를 제공할 때까지 실행 명령은 사용할 수 없는 상태로 유지됩니다. 컨텍스트/모델 필드는 제한된 리터럴 문자 집합만 허용하며, 셸 연산자, 공백, 앞쪽의 옵션 구문은 거부됩니다.

clipboard 접근에 실패하면 패널이 실패를 알리고, 수동으로 선택할 수 있도록 명령을 계속 표시합니다. 복사는 명령을 실행하지 않습니다.

## 구현 경계

`src/lib/cli-helper/companionTargets.ts`의 서버 전용 로더는 실행 가능한 manifest를 공개 디스크립터로 변환합니다. 브라우저는 대상 ID, 표시 이름, 기능 플래그만 받으며, Node 모듈이나 런타임 시크릿은 받지 않습니다. 명령 검증과 상태 매핑은 `src/shared/utils/cliCompanion.ts`에 있습니다. 패널은 dashboard의 기존 일괄 상태 요청을 재사용하며, 실행 API나 추가 상태 폴링을 도입하지 않습니다.
