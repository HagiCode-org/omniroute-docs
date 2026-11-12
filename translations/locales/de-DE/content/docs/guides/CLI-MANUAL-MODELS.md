---
title: "CLI-Modellkatalog und manuelle Metadaten"
version: "3.8.51"
lastUpdated: "2026-09-21"
---

# CLI-Modellkatalog und manuelle Metadaten

`omniroute models` liest zuerst den öffentlichen Modellkatalog des ausgewählten Servers,
einschließlich seiner benutzerdefinierten und synchronisierten Einträge. `--output json`
und `--output jsonl` geben alle passenden Zeilen zurück, ohne Hinweis auf eine Kürzung der
Tabelle. Interaktive Tabellen zeigen höchstens 50 Zeilen. JSON bewahrt öffentliche
Kontextlimits, Modalitäten, Fähigkeiten, die Modellquelle (sofern vom Server geliefert)
und Metadaten zum API-Format; Zugangsdaten und Kompatibilitäts-Header werden nicht
ausgegeben. Ein veralteter `/api/models`-fallback wird nur verwendet, wenn der öffentliche
endpoint HTTP 404, 405 oder 501 zurückgibt, niemals nach einem Authentifizierungsfehler.
`omniroute completion refresh` verwendet denselben Katalog. Eine fehlgeschlagene
Anfrage an den Modellkatalog liefert einen Exit-Code ungleich null und bewahrt den
vorherigen Completion-Cache. Die Completion-Skripte für Bash, Zsh und Fish bieten die
Unterbefehle für manuelle Modelle an.

## Lebenszyklus manueller Modelle

Diese Operationen verwenden die bestehende authentifizierte Management-API
`/api/provider-models`. Sie berücksichtigen dieselbe globale Auswahl über `--context` und
`--base-url` wie die übrigen CLI-Befehle. Verwenden Sie die kanonische Provider-ID und die
Modell-ID des Providers getrennt; eine Modell-ID mit Schrägstrichen ist gültig. Verwenden
Sie einen konfigurierten Management-Kontext, statt Zugangsdaten in Befehlsargumente zu
schreiben.

```bash
omniroute models openai --output json
omniroute models manual openai
omniroute models add openai my-model --name "My model" --context-window 32768 --dry-run
omniroute models add openai my-model --name "My model" --context-window 32768
omniroute models edit openai my-model --context-window 65536
omniroute models edit openai my-model --clear-context-window
omniroute models remove openai my-model --dry-run
omniroute models remove openai my-model --yes
```

Die Beispiele beschreiben die Syntax; ersetzen Sie Provider- und Modell-IDs durch Einträge
Ihres Servers. Der Befehl add legt keine Provider-Verbindung an.

- `add` lehnt einen bereits vorhandenen benutzerdefinierten Eintrag ab. Das optionale
  `--max-output-tokens` legt beim Anlegen das Ausgabelimit fest; `--api-format` setzt das
  API-Format des Modells und die dazugehörigen endpoint-Metadaten, etwa `embeddings`
  statt `chat`.
- `edit` setzt einen bereits vorhandenen manuellen Eintrag voraus. Sein Kontextlimit
  verwendet die unabhängige manuelle Kontext-Überschreibung des Backends; Zurücksetzen
  entfernt diese Überschreibung, nicht das ursprüngliche Eingabelimit und nicht die
  synchronisierten Metadaten.
- `remove` erfordert `--yes`, außer mit `--dry-run`. Es fordert `resetOverride=true` an
  und bewahrt damit einen synchronisierten Eintrag mit derselben ID. Massenlöschung wird
  nicht angeboten.
- `--dry-run` führt den authentifizierten Lesevorgang vorab aus, aber weder Schreiben noch
  Inferenz.
- Jede tatsächliche Änderung liest den manuellen Katalog anschließend zurück (readback).
  `persistenceVerified: true` bedeutet, dass die angeforderten Metadaten nach dem
  Schreiben beobachtet wurden; es bedeutet nicht, dass das Modell Text erzeugen oder
  Tools aufrufen kann. `inferenceValidation` ist stets `not-run`.
- Ein Fehler beim readback liefert einen Exit-Code ungleich null. Der Schreibvorgang kann
  bereits wirksam geworden sein; prüfen Sie den Server, bevor Sie es erneut versuchen.
  Gleichzeitige Schreiber werden von dieser CLI nicht serialisiert, und die bestehende API
  bietet keine compare-and-swap-Transaktion.

## Test & Add: nicht implementiert

Manuelle Einträge sind ungeprüft. Es gibt kein Flag `--validate`, und diese Befehle
senden keine Inferenzanfragen und führen keine Tools aus. Ein künftiger opt-in-Validierungsablauf muss
Inferenz-Zugangsdaten von der Management-Authentifizierung trennen und feststellen,
welche genaue Provider-Verbindung alle drei Nachweise erbracht hat: Generierung, einen
an einen Nonce gebundenen synthetischen Tool-Aufruf und die Fortsetzung nach einem
synthetischen Tool-Ergebnis. Für diese Nachweise ist keine echte Tool-Ausführung nötig.

Die bestehende Fixierung über `x-omniroute-connection` allein genügt nicht als
Nachweis-receipt: Die Auswahl der Zugangsdaten kann eine Fixierung absichtlich
aufheben, etwa bei cooldown, Kontingent oder ausgeschlossenen Konten, und die
Sitzungsaffinität fließt in die Auswahl ein. Siehe `src/sse/services/auth.ts` und die
Behandlung von `forcedConnectionId` in `src/sse/handlers/chat.ts`. Bevor Test & Add
implementiert wird, ist ein Vertrag für strikte Fixierung oder ein überprüfbares
Verbindungs-receipt festzulegen. Tests müssen dann belegen, dass nach jeder
fehlgeschlagenen, abgeschnittenen, zeitüberschrittenen oder von der falschen Verbindung
stammenden Antwort nichts persistiert wird. Dies ist eine eigene Entscheidung über den
Backend-Vertrag und kein Versprechen des manuellen CRUD.
