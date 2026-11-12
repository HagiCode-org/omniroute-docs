---
title: "Authentifizierungsstatus der Inferenz"
---

# Authentifizierungsstatus der Inferenz

## Überblick

`GET /v1/models` und die Inferenz-endpoints werden durch **unterschiedliche
Einstellungen** abgesichert. Die naheliegendste probe, die ein Operator auf die Frage
"Ist meine API geschützt?" ausführt, kann daher die falsche Antwort liefern.

| Endpoint                                                                           | Abgesichert durch                                                                                                                                                 |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/models`                                                                   | Den Anmeldestatus des dashboard — `isAuthRequired()`, pro Instanz überschreibbar mit `requireAuthForModels` (`src/app/api/v1/models/catalogRequest.ts`)          |
| `POST /v1/chat/completions`, `POST /v1/responses` und die übrigen Client-API-Routen | `REQUIRE_API_KEY` (`src/server/authz/policies/clientApi.ts`)                                                                                                      |

Auf einer Instanz mit gesetztem Admin-Passwort und `REQUIRE_API_KEY=false` antwortet
`/v1/models` mit `401`, während die Inferenz für jeden offen ist, der den Port erreichen
kann.

> **Hinweis zur probe:** Ein `401` von `/v1/models` belegt **nicht**, dass die Inferenz
> geschützt ist. Es zeigt lediglich, dass das dashboard eine Anmeldung verlangt.

Das ist nicht hypothetisch. In der Diskussion #13310 wurde das Codex-Kontingent einer
self-hosted Instanz hinter Traefik durch anonymen `POST /v1/responses`-Datenverkehr
aufgebraucht, während `/v1/models` `401` zurückgab — was, in den Worten des Melders,
"zunächst den Eindruck erweckte, die gesamte API sei geschützt" und ihn dazu brachte,
die falsche Komponente zu untersuchen.

## So prüfen Sie es richtig

Setzen Sie die probe auf eine Inferenz-Route an, nicht auf den Katalog:

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST http://<host>:<api-port>/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"<any-model>","messages":[{"role":"user","content":"ping"}]}'
```

Ein `401` bedeutet, dass `REQUIRE_API_KEY` durchgesetzt wird. Alles, was das Routing
erreicht (auch ein Fehler "Modell nicht gefunden"), bedeutet, dass anonymer Datenverkehr
akzeptiert wird.

Beachten Sie, dass bei `REQUIRE_API_KEY=false` ein **ungültiges** Bearer-Token zu
anonymem Zugriff herabgestuft statt abgelehnt wird (#2257); das Senden eines
Unsinnsschlüssels ist daher ebenfalls keine gültige probe.

## Startwarnung

Wenn `REQUIRE_API_KEY` deaktiviert ist und ein Server eine Nicht-loopback-Schnittstelle
bindet, protokolliert OmniRoute beim Start eine Warnung
(`src/lib/startup/nonLoopbackApiKeyGuard.ts`). Das betrifft drei Oberflächen:

- den Dashboard/API-Server, der die `/v1`-Inferenz bereitstellt — `HOST`, Standard `0.0.0.0`
- die API-Bridge — `API_HOST`, Standard `127.0.0.1`
- den Live-WebSocket des dashboard — mit eigenem Host

Die Warnung blockiert den Start nie: Ein reverse proxy vor OmniRoute kann bereits eine
eigene Authentifizierung durchsetzen.

## Verwandte Themen

- `REQUIRE_API_KEY` in [ENVIRONMENT.md](../reference/ENVIRONMENT.md)
- `APP_BIND_HOST` und die loopback-Standardwerte der Compose-Konfiguration (#12568)
- #2257 — ungültiges Bearer-Token wird zu anonym herabgestuft, wenn `REQUIRE_API_KEY` aus ist
- #13695 — dieses Dokument
