---
title: "Self-Hosted OpenAI-kompatibler Einstiegspunkt"
---

# Self-hosted einheitlicher OpenAI-kompatibler Einstiegspunkt

Wenn aktiviert, wird das bestehende `/v1/chat/completions` von OmniRoute (und der
OpenAI-kompatible Vertrag, den es bedient) zu einem **self-hosted gateway**: eine
OpenAI-kompatible Anfrage kommt herein, wird über die Provider-Adapter automatisch an den
Provider Ihrer Wahl geroutet, und heraus kommt eine Standard-OpenAI-Fehlerstruktur.
Der Client-Code ändert sich nicht.

Dies ist das Unterscheidungsmerkmal D4 (接入即用) aus dem Entwurf RIC-697: derselbe
`/v1`-Pfad, den das OpenAI-SDK bereits anspricht, gestützt auf Ihre eigenen Provider statt
auf einen einzelnen mitgelieferten Katalog.

## Aktivieren

Setzen Sie eine der beiden Umgebungsvariablen (beide siehe `.env.example`):

- `OMNIROUTE_SELF_HOSTED_PROVIDERS` — Inline-YAML-Dokument (nur zur Laufzeit, wird nicht protokolliert).
- `OMNIROUTE_SELF_HOSTED_PROVIDERS_FILE` — Pfad zu einer YAML-Datei.

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

Wenn **eine von beiden** Variablen gesetzt ist, ist der einheitliche Einstiegspunkt für
jede Anfrage an `/v1/chat/completions` aktiv. Eine vorhandene, aber nicht parsbare
Konfiguration liefert `500` (sie fällt nie stillschweigend auf das Cloud-Routing zurück).
Ist keine von beiden gesetzt, verhält sich die Route exakt wie zuvor.

## Automatisches Provider-Routing

Rangfolge (deterministisch, kein Vorhersagemodell):

1. Header `x-omniroute-provider: <id>` — exakte Provider-ID.
2. `model`-Präfix: `provider/model` (Schrägstrich) oder `provider::model` (doppelter Doppelpunkt).
3. Erster konfigurierter Provider.

Das Routing-Präfix wird vor der Weiterleitung entfernt — der upstream erhält das reine
Modell (`claude-sonnet`, nicht `claude/claude-sonnet`).

```bash
# via header
curl http://localhost:20128/v1/chat/completions \
  -H "x-omniroute-provider: claude" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet","messages":[{"role":"user","content":"hi"}]}'

# or via model prefix
curl ... -d '{"model":"claude/claude-sonnet","messages":[...]}'
```

## Auth-Gerüst (D5 reserviert)

Optional `OMNIROUTE_SELF_HOSTED_API_KEY`. Wenn gesetzt, müssen Anfragen
`Authorization: Bearer <key>` mitführen. Nicht gesetzt = offene Route (loopback /
vertrauenswürdiges Netzwerk), analog zur Arbeitsweise der bestehenden lokalen Provider von
OmniRoute. Das D5-Schlüsselsystem für Kontingent/quota-自治 soll diesen Header künftig
übernehmen.

## Fehlervertrag

- Ein non-2xx-Body des upstream wird über `parseUpstreamError` + `buildErrorBody` in die
  Standardstruktur `error` von OpenAI normalisiert (Harte Regel #12 — nie roher upstream-Text).
- Fehler auf Netzwerkebene (Verbindung verweigert / DNS / TLS) liefern ein normalisiertes
  `502` mit `error.message: "Upstream provider unreachable: …"`.
- An den upstream weitergereichte Zugangsdaten- und Sitzungs-Header werden aus jeder
  Antwort entfernt.

## Tests

`tests/unit/self-hosted-entry.test.ts` deckt Provider-Auswahl, Weiterleitung des
Modellpräfixes, Header-Hygiene, Authentifizierung, Normalisierung von upstream-Fehlern,
SSE-Streaming-Durchleitung sowie die Fall-through- und Fehlkonfigurationspfade ab — alles über
echtes HTTP gegen einen lokalen upstream.

## Hinweise

- Self-hosted Modelle umgehen bewusst die reine Cloud-Mechanik für Außerbetriebnahme und
  Aliase: Die Umleitung erfolgt vor diesen Cloud-Prüfungen, sodass IDs wie `local/llama3`
  nie Cloud-Peer-410er oder Alias-Umschreibungen auslösen.
- Deterministische Routing-Strategien (fallback / cooldown / Kosten / Latenz / blacklist)
  gehören zum Umfang von M2 (`RIC-740`) und werden hier in die gateway-Schicht eingehängt.
  Konfigurieren Sie sie mit einem `strategy:`-Block — siehe [DETERMINISTIC_ROUTING.md](./DETERMINISTIC_ROUTING.md).
