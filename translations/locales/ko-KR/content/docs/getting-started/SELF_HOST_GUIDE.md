---
title: "🚀 Self-Host 가이드 — OmniRoute (零月费自托管 / zero-fee self-host)"
version: 3.8.51
lastUpdated: 2026-09-14
---

# 🚀 Self-Host 가이드 — OmniRoute

> **요약** — 명령 세 개, 로컬 endpoint 하나, 월 사용료 0원. SaaS 과금도, 멀티 테넌트 격리도, 호스팅되는 prompt 처리 경유 지점도 없습니다. prompt는 사용자가 고른 프로바이더로 곧바로 전달됩니다.

```bash
cp .env.selfhost.example .env      # then edit the 2 lines marked "EDIT ME"
docker compose -f docker-compose.selfhost.yml up -d
open http://127.0.0.1:20128
```

이 문서는 OmniRoute의 "零月费 + 自托管" 제품 형태를 위한 **self-host 배포본**을 다룹니다. 사용자의 컴퓨터에서 5분 안에 실행할 수 있도록 패키징된 컨테이너/바이너리입니다.

---

## 이 가이드가 존재하는 이유

OmniRoute는 profile(`base`, `web`, `cli`, `host`, `cliproxyapi`, `memory`, `bifrost`)이 포함된 정교한 `docker-compose.yml`을 제공합니다. 각 앱 서비스는 profile로 제한되어 있으므로, 아무 옵션 없이 `docker compose up -d`를 실행하면 Redis만 시작됩니다. profile을 직접 고르는 고급 사용자에게는 올바른 동작이지만, 5분 안에 끝나는 self-host 방식은 *아닙니다*.

`docker-compose.selfhost.yml`은 KISS 원칙을 따르는 오버레이입니다. **명령 하나, 게시된 이미지, loopback 전용, Redis 포함, profile 선택 없음, 빌드 단계 없음.** 이것으로 부족해지면 전체 [DOCKER_GUIDE](../guides/DOCKER_GUIDE.md)의 profile로 넘어가십시오.

| 대상 | 시작 위치 | 이후 이동할 곳 |
| --- | --- | --- |
| self-host 사용자, 단일 사용자 | 이 가이드 | — |
| 고급 사용자, CLI 도구 / 웹 쿠키 프로바이더 / sidecar | — | `docker-compose.yml` profile |

---

## 사전 요구 사항

- Compose v2 플러그인이 포함된 Docker Engine 24 이상(또는 Docker Desktop 4.30 이상).
- 여유 RAM 약 2 GB([컨테이너 크기 산정](#컨테이너-크기-산정) 참고).
- 지원되는 프로바이더의 API 키(OpenAI, Anthropic, Google 중 하나 또는 [150개 이상의 무료 티어](./FREE-TIERS-GUIDE.md) 중 하나).

빌드 툴체인도, Node도, git clone도 필요하지 않습니다. 이미지를 가져와서 사용합니다.

---

## 1단계 — 구성 (1분)

```bash
cp .env.selfhost.example .env
```

`.env`에서 **두** 줄만 편집합니다.

```dotenv
REQUIRE_API_KEY=true          # was false — lock the endpoint down
APP_BIND_HOST=127.0.0.1       # keep loopback; see "Exposing" only if needed
```

`REQUIRE_API_KEY=true`로 설정하면 모든 `/v1` 요청과 dashboard에 API 키 또는 로그인이 필요해집니다. 최초 부팅 시 dashboard가 `INITIAL_PASSWORD`를 자동으로 생성하며, 로그에서 확인할 수 있습니다.

```bash
docker logs omniroute | grep -i password
```

나머지 변수(`DASHBOARD_PORT`, `API_PORT`, `LIVE_WS_PORT`, `OMNIROUTE_MEMORY_MB`)에는 이미 적절한 기본값이 설정되어 있습니다. 변경이 필요하다고 확신하지 않는 한 그대로 두십시오.

---

## 2단계 — 시작 (1분)

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

`diegosouzapw/omniroute:latest`(multi-arch AMD64 + ARM64, 약 250 MB)와 `redis:8.6.5-alpine`을 가져와 둘 다 시작하고, 앱이 부팅되기 전에 Redis가 정상(healthy) 상태가 될 때까지 기다립니다.

### 3단계 — 확인 (30초)

```bash
# process lifecycle + readiness
curl -fsS http://127.0.0.1:20128/healthz && echo

# container health
docker inspect --format '{{.State.Health.Status}}' omniroute
```

`{"status":"ok"}`와 `healthy`가 표시되어야 합니다. 그런 다음 dashboard를 엽니다.

```
http://127.0.0.1:20128
```

`up -d` 실행 후 약 300초 이내에 endpoint에 로컬로 접속할 수 있고 healthcheck가 `healthy` 상태가 됩니다. 이것이 self-host 이슈의 수용 기준입니다.

---

## 포트

| 포트 | 용도 | 기본 바인드 |
| --- | --- | --- |
| `20128` | Dashboard + `/v1` LLM proxy (통합 진입점) | `127.0.0.1` |
| `20129` | API 포트 (서버 간 통신) | `127.0.0.1` |
| `20132` | Live WebSocket (실시간 dashboard 업데이트) | `127.0.0.1` |

세 포트 모두 기본적으로 **loopback에만** 바인드됩니다. Redis는 호스트에 전혀 게시되지 않으며, 앱은 compose 네트워크를 통해 Redis에 접근합니다. 이는 의도된 설계입니다. 인증 없는 Redis를 `0.0.0.0`에 노출하는 것은 사고의 원인이 됩니다.

---

## 프로바이더 연결

1. dashboard를 열고 **Providers**로 이동합니다.
2. 프로바이더를 추가하고 해당 API 키를 붙여 넣습니다. 키는 AES-256-GCM으로 암호화되어 저장되며, 평문은 사용자의 컴퓨터를 벗어나지 않습니다.
3. IDE / agent가 통합 진입점을 바라보도록 설정합니다.

```
http://127.0.0.1:20128/v1
```

프로바이더 선택에 대해서는 [무료 티어 가이드](./FREE-TIERS-GUIDE.md)를 참고하십시오. OmniRoute는 150개 이상의 무료 티어를 하나의 endpoint로 통합하므로, `model: "auto"`를 사용하면 요청마다 가장 적합한 무료 옵션이 선택됩니다.

---

## 컨테이너 크기 산정

이미지는 `OMNIROUTE_MEMORY_MB=1024`로 고정되어 있습니다. dashboard와 가벼운 채팅에는 충분한 값입니다. **coding agent**(Claude Code, Codex, Grok 등에서 보내는 `POST /v1/responses`)는 압축 중에 큰 컨텍스트 그래프를 여러 개 유지하므로, 긴 컨텍스트 두 개가 겹치면 약 12 GiB old-space에서 V8이 중단될 수 있습니다([#7849](https://github.com/diegosouzapw/OmniRoute/issues/7849)).

`.env.selfhost.example`의 기본값은 `OMNIROUTE_MEMORY_MB=2048`이며, coding agent를 실행하는 단일 사용자에게 안전한 최소치입니다. 여러 모델을 병렬로 분산 호출하거나(fusion combo) `FATAL ERROR: Reached heap limit`이 발생하면 이 값을 높이십시오.

```dotenv
OMNIROUTE_MEMORY_MB=4096
```

메모리 값은 V8 heap의 상한입니다. 네이티브 버퍼(SQLite, ONNX, better-sqlite3)는 이 한도 밖에 있으므로, 컨테이너 크기는 heap보다 수백 MB 더 크게 잡으십시오.

---

## 로컬 바이너리 빌드 (선택 사항)

Docker 대신 바이너리를 선호하십니까? npm 패키지는 동일한 코드입니다.

```bash
npm install -g omniroute
omniroute
```

이 방식은 Next.js standalone 서버를 호스트에서 직접 실행합니다. 포트도, `DATA_DIR`(기본값은 `./data`)도 동일합니다. Docker를 실행할 수 없는 경우(예: 제한이 엄격한 VM)에 사용하십시오. 위의 컨테이너 방식은 이미지가 테스트된 런타임을 그대로 포함하므로 권장 기본값입니다.

소스에서 빌드하는 방법(개발 전용이며 배포 경로가 아닙니다):

```bash
git clone https://github.com/diegosouzapw/OmniRoute.git
cd OmniRoute
npm install
npm run build && npm start
```

---

## localhost 밖으로 노출

`REQUIRE_API_KEY=false` 상태에서 `APP_BIND_HOST=0.0.0.0`으로 **바꾸지 마십시오**. 모든 LAN/WAN 인터페이스에 열린 `/v1` proxy가 게시되어, 네트워크의 누구나 프로바이더 할당량을 소진할 수 있습니다. 순서는 고정되어 있습니다.

1. `.env`에서 `REQUIRE_API_KEY=true`로 설정합니다.
2. 로그에서 `INITIAL_PASSWORD`를 확인하고 로그인합니다.
3. *그런 다음에만* `APP_BIND_HOST=0.0.0.0`으로 설정합니다(또는 인증을 강제하는 reverse proxy를 앞에 두고 loopback을 유지합니다).

TLS나 도메인이 필요하면 Caddy 또는 Traefik을 앞에 두고 `APP_BIND_HOST`는 `127.0.0.1`로 유지하십시오. 복사해서 바로 쓸 수 있는 reverse proxy 구성은 [DOCKER_GUIDE — Caddy HTTPS](../guides/DOCKER_GUIDE.md#docker-compose-with-caddy-https-auto-tls)와 [Cloudflare Quick Tunnel](../guides/DOCKER_GUIDE.md#cloudflare-quick-tunnel) 섹션을 참고하십시오.

---

## 데이터, 백업, 초기화

- **데이터 디렉터리**: `./data`(`/app/data`에 bind mount). 모든 SQLite DB, 마이그레이션, 감사 기록, 암호화된 프로바이더 키가 이곳에 있습니다.
- **백업**: SQLite 자동 백업은 기본적으로 켜져 있습니다(`DISABLE_SQLITE_AUTO_BACKUP`이 설정되지 않음 → 활성화). 수동 스냅숏은 다음과 같이 만듭니다.
  ```bash
  ./bin/snapshot-data.sh
  ```
  복원은 `./bin/restore-data.sh`로 합니다.
- **dashboard 비밀번호 초기화**:
  ```bash
  docker exec -it omniroute node bin/reset-password.mjs
  ```
- **정책 초기화**(라우팅/failover/할당량을 공장 기본값으로):
  ```bash
  docker exec -it omniroute node bin/restore-policies.sh
  ```

---

## 자주 발생하는 문제

<details>
<summary><code>docker compose up</code>이 Redis만 시작합니다</summary>

앱 서비스가 profile로 제한된 **전체** `docker-compose.yml`을 실행하고 계십니다. 명령 하나로 끝내려면 self-host 파일을 사용하십시오.

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

또는 전체 compose를 사용하면서 profile을 지정합니다.
`docker compose --profile base up -d`.
</details>

<details>
<summary>Healthcheck가 <code>starting</code> / <code>unhealthy</code> 상태로 유지됩니다</summary>

- Redis가 실행 중인지 확인합니다: `docker inspect --format '{{.State.Health.Status}}' omniroute-redis`
- 앱 로그를 확인합니다: `docker logs omniroute`
- healthcheck는 `/healthz`를 probe하며 20초의 시작 유예 시간을 허용합니다. 첫 부팅이 느린 경우(초기 마이그레이션) 더 오래 걸릴 수 있습니다. 디스크가 느리다면 compose 파일의 `start_period`를 늘리십시오.
</details>

<details>
<summary>coding agent 사용 중 <code>FATAL ERROR: Reached heap limit</code>이 발생합니다</summary>

`.env`의 `OMNIROUTE_MEMORY_MB`를 높인(예: `4096`) 뒤 `docker compose -f docker-compose.selfhost.yml up -d`를 실행하십시오. [컨테이너 크기 산정](#컨테이너-크기-산정)을 참고하십시오.
</details>

<details>
<summary>웹 쿠키 프로바이더(Gemini Web, Claude Turnstile)가
<code>Executable doesn't exist at .../ms-playwright/chromium</code> 오류로 실패합니다</summary>

`base` 이미지에는 Chromium이 포함되어 있지 않으며, self-host compose는 게시된 `base` 이미지를 사용합니다. 웹 쿠키 프로바이더를 사용하려면 `web` profile이 포함된 전체 compose로 전환하십시오(Playwright/Chromium이 번들되어 있습니다).

```bash
docker compose --profile web up -d
```

[DOCKER_GUIDE — Available Profiles](../guides/DOCKER_GUIDE.md#available-profiles)를 참고하십시오.
</details>

<details>
<summary>포트 20128이 이미 사용 중입니다</summary>

`.env`의 `DASHBOARD_PORT`, `API_PORT`, `LIVE_WS_PORT`를 사용 가능한 포트로 설정한 뒤 `up -d`를 다시 실행하십시오.
</details>

---

## 이것이 의도적으로 제공하지 않는 것

self-host KISS 제약에 따라 이 경로에는 다음이 **포함되지 않습니다**.

- ❌ SaaS 과금 / 사용량 측정 / 요금제 티어
- ❌ 멀티 테넌트 격리 / 테넌트별 네임스페이스
- ❌ 호스팅되는 prompt 처리 경유 지점(prompt는 프로바이더로 곧바로 전달됩니다)
- ❌ 미리 내장된 자격 증명이나 시크릿

이것은 **순수한 로컬 self-host** 배포본으로, "零月费 + 自托管"이라는 약속을 현실로 만드는 가장 단순한 방법입니다.

---

## 보안 체크리스트 (self-host)

loopback 밖으로 노출하기 전에 확인하십시오.

- [ ] `.env`에 `REQUIRE_API_KEY=true`
- [ ] `INITIAL_PASSWORD`를 강력하고 고유한 값으로 교체
- [ ] 인증을 강제하는 proxy 뒤에 있지 않다면 `APP_BIND_HOST`를 `127.0.0.1`로 유지
- [ ] 앞단의 Caddy/Traefik/Cloudflare에서 TLS 종료(WAN에서 평문 HTTP 금지)
- [ ] Redis가 호스트에 게시되지 않음(self-host compose가 이미 이를 강제합니다)
- [ ] `./data` 볼륨을 정기적으로 백업(`bin/snapshot-data.sh`)
- [ ] 프로바이더 키를 각 프로바이더의 자체 정책에 따라 교체

공급망 / 이미지 / 의존성 감사 전반에 대해서는 [SECURITY.md](../../SECURITY.md)와 [SUPPLY_CHAIN](../security/SUPPLY_CHAIN.md)을 참고하십시오.

---

## 관련 문서

- [Docker 가이드](../guides/DOCKER_GUIDE.md) — profile, Caddy HTTPS, 터널, 이미지 태그
- [빠른 시작](./QUICK-START.md) — 처음 사용하는 사용자를 위한 3분 가이드
- [무료 티어 가이드](./FREE-TIERS-GUIDE.md) — 150개 이상의 무료 프로바이더 티어
- [프로바이더 가이드](./PROVIDERS-GUIDE.md) — 프로바이더 연결 및 구성
- [문제 해결](../guides/TROUBLESHOOTING.md) — 심화 문제 해결
