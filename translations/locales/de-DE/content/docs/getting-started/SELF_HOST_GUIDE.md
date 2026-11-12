---
title: "🚀 Self-Host-Leitfaden — OmniRoute (零月费自托管 / self-host ohne Monatsgebühr)"
version: 3.8.51
lastUpdated: 2026-09-14
---

# 🚀 Self-Host-Leitfaden — OmniRoute

> **TL;DR** — drei Befehle, ein lokaler endpoint, keine Monatsgebühren. Keine
> SaaS-Abrechnung, keine Mandantenisolation, kein gehosteter prompt-Verarbeitungs-Hop.
> Ihre prompts gehen direkt an den Provider Ihrer Wahl.

```bash
cp .env.selfhost.example .env      # then edit the 2 lines marked "EDIT ME"
docker compose -f docker-compose.selfhost.yml up -d
open http://127.0.0.1:20128
```

Dies ist der **self-host-Träger** für die Produktform "零月费 + 自托管" von OmniRoute:
ein paketierter Container bzw. ein Binary, das Sie in 5 Minuten auf Ihrem eigenen
Rechner ausführen.

---

## Warum es diesen Leitfaden gibt

OmniRoute liefert eine ausgefeilte `docker-compose.yml` mit profiles
(`base`, `web`, `cli`, `host`, `cliproxyapi`, `memory`, `bifrost`) aus. Jeder
App-Dienst wird nur über ein profile aktiviert, daher startet ein einfaches
`docker compose up -d` nur Redis. Das ist für Power-User richtig, die ein profile
wählen — aber es ist *keine* 5-Minuten-self-host-Geschichte.

`docker-compose.selfhost.yml` ist das KISS-Overlay: **ein Befehl, veröffentlichtes
Image, ausschließlich loopback, Redis enthalten, keine profile-Auswahl, kein
Build-Schritt.** Wenn Sie darüber hinauswachsen, steigen Sie auf die vollständigen
profiles des [DOCKER_GUIDE](../guides/DOCKER_GUIDE.md) um.

| Zielgruppe | Hier beginnen | Aufsteigen zu |
| --- | --- | --- |
| Self-Hoster, einzelner Nutzer | dieser Leitfaden | — |
| Power-User, CLI-Tools / web-cookie-Provider / sidecars | — | `docker-compose.yml`-profiles |

---

## Voraussetzungen

- Docker Engine 24+ (oder Docker Desktop 4.30+) mit dem Compose-v2-Plugin.
- ~2 GB freier Arbeitsspeicher (siehe [Dimensionierung](#container-dimensionieren)).
- Ein Provider-API-Schlüssel von einem beliebigen unterstützten Provider (OpenAI, Anthropic, Google
  oder eine der [150+ kostenlosen Stufen](./FREE-TIERS-GUIDE.md)).

Keine Build-Toolchain, kein Node, kein git clone erforderlich — das Image wird heruntergeladen.

---

## Schritt 1 — Konfigurieren (1 Min.)

```bash
cp .env.selfhost.example .env
```

Bearbeiten Sie genau **zwei** Zeilen in `.env`:

```dotenv
REQUIRE_API_KEY=true          # was false — lock the endpoint down
APP_BIND_HOST=127.0.0.1       # keep loopback; see "Exposing" only if needed
```

`REQUIRE_API_KEY=true` sorgt dafür, dass jede `/v1`-Anfrage und das dashboard einen
API-Schlüssel bzw. eine Anmeldung erfordern. Beim ersten Start generiert das dashboard
automatisch ein `INITIAL_PASSWORD` — lesen Sie es aus den Logs aus:

```bash
docker logs omniroute | grep -i password
```

Die übrigen Variablen (`DASHBOARD_PORT`, `API_PORT`, `LIVE_WS_PORT`,
`OMNIROUTE_MEMORY_MB`) haben bereits sinnvolle Standardwerte. Belassen Sie diese, es sei denn,
Sie wissen, dass Sie sie ändern müssen.

---

## Schritt 2 — Starten (1 Min.)

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

Lädt `diegosouzapw/omniroute:latest` (multi-arch AMD64 + ARM64, ~250 MB) und
`redis:8.6.5-alpine` herunter, startet beide und wartet, bis Redis healthy ist, bevor
die App startet.

### Schritt 3 — Prüfen (30 s)

```bash
# process lifecycle + readiness
curl -fsS http://127.0.0.1:20128/healthz && echo

# container health
docker inspect --format '{{.State.Health.Status}}' omniroute
```

Sie sollten `{"status":"ok"}` und `healthy` sehen. Öffnen Sie anschließend das dashboard:

```
http://127.0.0.1:20128
```

Innerhalb von ~300 s nach `up -d` ist der endpoint lokal erreichbar und der Healthcheck
steht auf `healthy` — die Abnahmekriterien aus dem self-host-Issue.

---

## Ports

| Port | Was | Standard-Bind |
| --- | --- | --- |
| `20128` | Dashboard + `/v1` LLM-proxy (einheitlicher Einstieg) | `127.0.0.1` |
| `20129` | API-Port (Server-zu-Server) | `127.0.0.1` |
| `20132` | Live-WebSocket (Echtzeit-Updates des dashboard) | `127.0.0.1` |

Alle drei binden standardmäßig **ausschließlich an loopback**. Redis wird **überhaupt nicht**
auf dem Host veröffentlicht — die App erreicht es über das compose-Netzwerk. Das ist
Absicht: Ein nicht authentifiziertes Redis auf `0.0.0.0` auszuliefern ist eine Fußangel.

---

## Einen Provider verbinden

1. Öffnen Sie das dashboard → **Providers**.
2. Fügen Sie einen Provider hinzu und fügen Sie dessen API-Schlüssel ein. Schlüssel werden im Ruhezustand mit
   AES-256-GCM verschlüsselt; der Klartext verlässt Ihren Rechner nie.
3. Richten Sie Ihre IDE / Ihren agent auf den einheitlichen Einstieg:

```
http://127.0.0.1:20128/v1
```

Zur Auswahl des Providers siehe den
[Leitfaden zu kostenlosen Stufen](./FREE-TIERS-GUIDE.md) — OmniRoute bündelt 150+ kostenlose
Stufen in einem endpoint, sodass Sie `model: "auto"` ausführen können, um pro Anfrage die beste
kostenlose Option auszuwählen.

---

## Container dimensionieren

Das Image legt `OMNIROUTE_MEMORY_MB=1024` fest. Das genügt für das dashboard
und leichten Chat. **Coding agents** (`POST /v1/responses` von Claude Code,
Codex, Grok, …) halten während der Kompression mehrere große Kontextgraphen im Speicher
und können V8 bei ~12 GiB old-space abstürzen lassen, wenn sich zwei lange Kontexte überlappen
([#7849](https://github.com/diegosouzapw/OmniRoute/issues/7849)).

`.env.selfhost.example` setzt standardmäßig `OMNIROUTE_MEMORY_MB=2048` — eine sichere Untergrenze
für einen einzelnen Nutzer, der coding agents ausführt. Erhöhen Sie den Wert, wenn Sie viele Modelle
parallel auffächern (fusion combos) oder auf `FATAL ERROR: Reached heap limit` stoßen:

```dotenv
OMNIROUTE_MEMORY_MB=4096
```

Der Speicher ist eine V8-Heap-Obergrenze; native Puffer (SQLite, ONNX, better-sqlite3)
liegen außerhalb davon, dimensionieren Sie den Container daher einige hundert MB größer als den Heap.

---

## Lokaler Binary-Build (optional)

Sie bevorzugen ein Binary statt Docker? Das npm-Paket enthält denselben Code:

```bash
npm install -g omniroute
omniroute
```

Dies führt den Next.js-standalone-Server direkt auf Ihrem Host aus — dieselben Ports,
dasselbe `DATA_DIR` (standardmäßig `./data`). Verwenden Sie es, wenn Sie Docker nicht ausführen können
(z. B. auf einer stark abgesicherten VM). Der Container-Weg oben ist der empfohlene Standard,
weil er genau die Laufzeitumgebung bündelt, mit der das Image getestet wurde.

Aus dem Quellcode (nur für die Entwicklung — kein Deployment-Weg):

```bash
git clone https://github.com/diegosouzapw/OmniRoute.git
cd OmniRoute
npm install
npm run build && npm start
```

---

## Über localhost hinaus bereitstellen

Setzen Sie `APP_BIND_HOST=0.0.0.0` **nicht**, solange `REQUIRE_API_KEY=false` gilt. Das
veröffentlicht einen offenen `/v1`-proxy auf jeder LAN-/WAN-Schnittstelle — jeder im
Netzwerk kann Ihre Provider-Kontingente verbrauchen. Die Reihenfolge ist fest:

1. Setzen Sie `REQUIRE_API_KEY=true` in `.env`.
2. Lesen Sie `INITIAL_PASSWORD` aus den Logs aus und melden Sie sich an.
3. *Erst dann* setzen Sie `APP_BIND_HOST=0.0.0.0` (oder schalten Sie einen
   reverse proxy mit Authentifizierungszwang davor und belassen Sie loopback).

Für TLS / eine Domain betreiben Sie Caddy oder Traefik davor und belassen `APP_BIND_HOST`
bei `127.0.0.1`. Siehe die Abschnitte
[DOCKER_GUIDE — Caddy HTTPS](../guides/DOCKER_GUIDE.md#docker-compose-with-caddy-https-auto-tls)
und
[Cloudflare Quick Tunnel](../guides/DOCKER_GUIDE.md#cloudflare-quick-tunnel)
für reverse-proxy-Konfigurationen zum Kopieren.

---

## Daten, Backups und Zurücksetzen

- **Datenverzeichnis**: `./data` (per bind mount nach `/app/data` eingebunden). Alle SQLite-DBs,
  Migrationen, der Audit-Trail und verschlüsselte Provider-Schlüssel liegen hier.
- **Backups**: Das SQLite-Auto-Backup ist standardmäßig aktiv
  (`DISABLE_SQLITE_AUTO_BACKUP` ist nicht gesetzt → aktiviert). Für einen manuellen Snapshot:
  ```bash
  ./bin/snapshot-data.sh
  ```
  Wiederherstellen mit `./bin/restore-data.sh`.
- **Das dashboard-Passwort zurücksetzen**:
  ```bash
  docker exec -it omniroute node bin/reset-password.mjs
  ```
- **Richtlinien zurücksetzen** (Routing/Failover/Kontingent auf Werkseinstellungen):
  ```bash
  docker exec -it omniroute node bin/restore-policies.sh
  ```

---

## Häufige Probleme

<details>
<summary><code>docker compose up</code> startet nur Redis</summary>

Sie führen die **vollständige** `docker-compose.yml` aus, deren App-Dienste nur über
profiles aktiviert werden. Für den Ein-Befehl-Weg verwenden Sie die self-host-Datei:

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

Oder wählen Sie bei der vollständigen compose-Datei ein profile:
`docker compose --profile base up -d`.
</details>

<details>
<summary>Der Healthcheck bleibt auf <code>starting</code> / <code>unhealthy</code></summary>

- Prüfen Sie, ob Redis läuft: `docker inspect --format '{{.State.Health.Status}}' omniroute-redis`
- Prüfen Sie die App-Logs: `docker logs omniroute`
- Der Healthcheck sendet probes an `/healthz` und erlaubt eine Startphase von 20 s. Ein langsamer
  erster Start (kalte Migrationen) kann länger dauern — erhöhen Sie `start_period` in der
  compose-Datei, wenn Ihr Datenträger langsam ist.
</details>

<details>
<summary><code>FATAL ERROR: Reached heap limit</code> unter coding agents</summary>

Erhöhen Sie `OMNIROUTE_MEMORY_MB` in `.env` (z. B. `4096`) und führen Sie dann
`docker compose -f docker-compose.selfhost.yml up -d` aus. Siehe
[Container dimensionieren](#container-dimensionieren).
</details>

<details>
<summary>Web-cookie-Provider (Gemini Web, Claude Turnstile) schlagen fehl mit
<code>Executable doesn't exist at .../ms-playwright/chromium</code></summary>

Das `base`-Image wird ohne Chromium ausgeliefert. Die self-host-compose-Datei verwendet das
veröffentlichte `base`-Image. Für web-cookie-Provider wechseln Sie zur vollständigen compose-Datei
mit dem `web`-profile (das Playwright/Chromium bündelt):

```bash
docker compose --profile web up -d
```

Siehe [DOCKER_GUIDE — Verfügbare profiles](../guides/DOCKER_GUIDE.md#available-profiles).
</details>

<details>
<summary>Port 20128 ist bereits belegt</summary>

Setzen Sie `DASHBOARD_PORT`, `API_PORT`, `LIVE_WS_PORT` in `.env` auf freie Ports und
führen Sie `up -d` erneut aus.
</details>

---

## Was dies bewusst NICHT ist

Gemäß der self-host-KISS-Vorgabe enthält dieser Weg **nicht**:

- ❌ SaaS-Abrechnung / Metering / Plan-Stufen
- ❌ Mandantenisolation / namespaces pro Mandant
- ❌ Einen gehosteten prompt-Verarbeitungs-Hop (Ihre prompts gehen direkt an den Provider)
- ❌ Jegliche fest eingebauten Zugangsdaten oder Geheimnisse

Es ist ein **rein lokaler self-host**-Träger — das Einfachste, das das Versprechen
"零月费 + 自托管" einlöst.

---

## Sicherheits-Checkliste (self-host)

Bevor Sie über loopback hinaus bereitstellen:

- [ ] `REQUIRE_API_KEY=true` in `.env`
- [ ] `INITIAL_PASSWORD` auf einen starken, eindeutigen Wert geändert
- [ ] `APP_BIND_HOST` bei `127.0.0.1` belassen, *außer* hinter einem proxy mit Authentifizierungszwang
- [ ] TLS wird davor von Caddy/Traefik/Cloudflare terminiert (niemals reines HTTP im WAN)
- [ ] Redis nicht auf dem Host veröffentlicht (die self-host-compose-Datei erzwingt dies bereits)
- [ ] `./data`-Volume regelmäßig gesichert (`bin/snapshot-data.sh`)
- [ ] Provider-Schlüssel gemäß der eigenen Richtlinie des Providers rotiert

Für die vollständige Audit-Dimension zu Lieferkette / Image / Abhängigkeiten siehe
[SECURITY.md](../../SECURITY.md) und
[SUPPLY_CHAIN](../security/SUPPLY_CHAIN.md).

---

## Siehe auch

- [Docker-Leitfaden](../guides/DOCKER_GUIDE.md) — profiles, Caddy HTTPS, Tunnel, Image-Tags
- [Schnellstart](./QUICK-START.md) — 3-Minuten-Weg für Erstnutzer
- [Leitfaden zu kostenlosen Stufen](./FREE-TIERS-GUIDE.md) — 150+ kostenlose Provider-Stufen
- [Provider-Leitfaden](./PROVIDERS-GUIDE.md) — Provider verbinden und konfigurieren
- [Fehlerbehebung](../guides/TROUBLESHOOTING.md) — ausführlichere Problemlösung
