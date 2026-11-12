---
title: "Deterministische Routing-Strategien"
---

# Deterministische Routing-Strategien

Der self-hosted gateway-Einstieg von OmniRoute (`/v1/chat/completions`, RIC-738) leitet
standardmäßig an einen einzelnen Provider weiter. Wenn Sie einen `strategy:`-Block konfigurieren,
wird die Routing-Entscheidung zu einer **deterministischen, erklärbaren Richtlinie** — dem
Unterscheidungsmerkmal von OmniRoute gegenüber dem "predict"-Black-Box-Routing von NotDiamond/Martian.

Jede Entscheidung ist:

- **Deterministisch** — dieselbe Konfiguration + derselbe Laufzeitzustand ergibt denselben Provider.
- **Konfigurationsbasiert** — eine Regel pro Zeile; kein "一体化智能体", kein gelerntes Modell.
- **Erklärbar** — jede Antwort trägt `x-omniroute-route-decision`, eine einzeilige
  Antwort auf "warum dieses Modell?" (und "warum NICHT jenes").

Dies ist M2 der RIC-697-Differenzierung (D3 可审计路由). Es gibt **keine prädiktive /
ML-Abhängigkeit** — die Strategien sind reine Regeln über beobachtbare Signale
(aufeinanderfolgende Fehler, deklarierte Kosten, gemessene Latenz).

## Aktivieren

Fügen Sie einen `strategy:`-Block demselben YAML-Dokument hinzu wie `providers:`, oder richten Sie
`OMNIROUTE_SELF_HOSTED_STRATEGY` (inline YAML) / `OMNIROUTE_SELF_HOSTED_STRATEGY_FILE`
(eine Datei) auf ein eigenständiges `strategy:`-Dokument. Eine explizite env-Strategie überlagert
den Inline-Block schlüsselweise.

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

## Die fünf Strategien

| Strategie        | Konfiguration                                 | Wirkung                                                                                                |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Blacklist        | `blacklist: [id, ...]`                        | Aufgelistete Provider kommen nie als Kandidaten infrage.                                               |
| Whitelist        | `whitelist: [id, ...]`                        | Nicht leer → nur aufgelistete Provider sind Kandidaten.                                                |
| Cooldown/breaker | `cooldown: {consecutiveFailures, cooldownMs}` | Nach N aufeinanderfolgenden Fehlern wird ein Provider für das Zeitfenster ausgeschlossen. Ein Erfolg setzt den Zähler zurück. |
| Cost-priority    | `costPriority: true`                          | Geeignete Kandidaten aufsteigend nach `costPer1MInput` sortiert (deklariert, nie erfunden).            |
| Latency-aware    | `latencyAware.enabled: true`                  | Geeignete Kandidaten aufsteigend nach der jüngsten durchschnittlichen Anfragelatenz sortiert. Provider ohne Messwerte werden zuletzt eingeordnet. |
| Fallback-Kette   | `fallbackChain: [id, ...]`                    | Explizite Reihenfolge primär→Backup. Hat Vorrang vor der Sortierung nach Kosten/Latenz.                |

Filter (blacklist / whitelist / cooldown) laufen zuerst und entfernen Kandidaten. Danach
sortiert die Sortierstufe die verbleibenden Kandidaten: eine explizite `fallbackChain` hat Vorrang; andernfalls
gelten `costPriority` und dann `latencyAware` in dieser Reihenfolge.

## Fixierte Provider

Der Header `x-omniroute-provider` und das Modell-Präfix `provider/model` sind **explizite
Festlegungen**, keine Präferenzen. Wird ein fixierter Provider durch einen harten Filter (blacklist /
whitelist / aktiver cooldown) ausgeschlossen, schlägt die Anfrage mit `400` und dem Grund der Festlegung fehl — das
gateway leitet einen Client, der einen bestimmten Provider angefordert hat, niemals stillschweigend um. Übersteht die
Festlegung die Filter, ist sie der erste Kandidat, und die übrigen Kandidaten dienen als
ihre Fallback-Kette.

## Fallback bei Fehlern

Die geordnete Kandidatenliste ist die Fallback-Kette. Fällt der erste Provider aus
(Netzwerk nicht erreichbar, Verbindung abgelehnt, DNS/TLS oder ein beliebiges Nicht-2xx), geht das gateway
zum nächsten Kandidaten über und so weiter. Jeder Fehler wird im cooldown-breaker erfasst, und
jeder Versuch wird hinsichtlich der Latenz gemessen — durchläuft ein defekter primärer Provider daher auch für _nachfolgende_
Anfragen einen cooldown. Schlagen alle Kandidaten fehl, wird der zuletzt normalisierte Fehler (OpenAI-Format)
zurückgegeben. Ist überhaupt kein Kandidat zulässig, wird ein `503` mit der vollständigen erklärbaren
Entscheidung zurückgegeben.

## Erklärbarkeit

Jede Antwort, die über die Strategie-Engine geroutet wird, trägt:

```
x-omniroute-route-decision: cheap(cost-priority: cheap #1) -> fast(cost-priority: fast #2); premium excluded: blacklist: premium forbidden
```

Der Wert ist die geordnete Kandidatenliste plus jeder Ausschlussgrund — der Audit-Trail
für "warum dieses Modell, warum nicht jenes".

## Fehlervertrag (unverändert gegenüber RIC-738)

- Ein upstream-Body mit Nicht-2xx wird über `parseUpstreamError` + `buildErrorBody`
  in die standardmäßige OpenAI-`error`-Form normalisiert (Harte Regel #12).
- Fehler auf Netzwerkebene liefern ein normalisiertes `502`; nachdem die gesamte Kette erschöpft ist,
  wird der zuletzt normalisierte Fehler ausgegeben.
- Zugangsdaten- / Sitzungs-Header, die an den upstream zurückgespiegelt wurden, werden aus jeder Antwort entfernt.
- Eine Provider-Konfiguration mit fehlerhaftem `strategy:`-Block liefert `500` — eine falsch konfigurierte
  Richtlinie wird nie stillschweigend zu einem No-op.

## Tests

- `tests/unit/routing-strategies.test.ts` — 25 Unit-Tests über die reine Strategie-Engine:
  Parsen, blacklist/whitelist, cooldown-breaker, cost-priority, latency-aware, Fallback-Kette,
  kombinierte Pipeline, Erklärbarkeit.
- `tests/unit/self-hosted-entry.test.ts` — Fehlerinjektion über echtes HTTP: primärer Provider ausgefallen
  → Fallback erfolgreich; alle ausgefallen → letzter Fehler; fixierter Provider auf der blacklist → 400; cooldown
  schließt einen fehlschlagenden Provider bei der nächsten Anfrage aus; kein zulässiger Kandidat → 503 mit erklärbarer
  Entscheidung.
