---
title: "CLI-Konfigurationsvorschauen und -Schreibvorgänge"
---

# CLI-Konfigurationsvorschauen und -Schreibvorgänge

Die authentifizierten Routen `/api/cli-tools/config` und `/api/cli-tools/apply` liefern
nicht cachebare, geschwärzte Vorschauen. Sie behalten die bestehenden Authentifizierungs- und
Autorisierungsprüfungen bei. Anfragekörper lehnen unbekannte Felder ab. Eine explizite Basis-URL
muss HTTP(S) ohne eingebettete Benutzernamen/Passwort-Zugangsdaten verwenden; wenn sie fehlt,
wird die konfigurierte Basis-URL des Servers verwendet.

Für eine Batch-Vorschau akzeptiert `GET /api/cli-tools/config` einen optionalen Query-Parameter `baseUrl` und entnimmt die Konfigurations-Zugangsdaten dem Header
`x-omniroute-config-api-key`. Zugangsdaten in der Query-Zeichenfolge werden abgelehnt.
`POST /api/cli-tools/config` akzeptiert `toolId`, `baseUrl`, `apiKey` und optional
`model` in seinem JSON-Body. Antworten verwenden `Cache-Control: no-store` sowohl auf Erfolgs-
als auch auf Fehlerpfaden. Vorschautext ist keine verwendbare, Zugangsdaten enthaltende Konfiguration.

Die Vorschauprojektion schwärzt serialisierte Zugangsdaten des Aufrufers sowie Zugangsdatenfelder,
die bereits in zusammengeführten JSONC-, TOML- oder YAML-profiles vorhanden sind. Die apply-Route schreibt die
ursprüngliche Konfiguration; die Schwärzung der Vorschau verändert die Werte auf dem Datenträger nicht.
Fehlerhaftes JSON wird mit 400 abgelehnt. Öffentliche Fehlerantworten verwenden das standardmäßige
bereinigte Fehler-Envelope.

Das Anwenden einer Konfiguration verwendet eine private temporäre Datei im Zielverzeichnis, schreibt
sie vollständig auf den Datenträger (flush) und benennt sie atomar an ihren Platz um. Dateien und Backups verwenden
den Modus `0600`; die Berechtigungen werden vor dem Umbenennen auf dem eigenen Deskriptor gesetzt.
Symlinks am endgültigen Ziel und nicht reguläre Dateien werden abgelehnt. Auch Lesezugriffe von Codex und OpenCode
lehnen Symlinks am endgültigen Pfad ab, bevor vorhandenes TOML/JSONC zusammengeführt wird. Dies behauptet
keinen Schutz gegen einen Angreifer, der das übergeordnete Verzeichnis kontrolliert.

Der Container-Schreibschutz bleibt aktiv: Ein unsicheres flüchtiges Ziel liefert 422 und verweist den
Betreiber auf den hostseitigen Setup-Befehl. Ein Dry-Run bleibt verfügbar und schreibt keine Dateien. Siehe [CLI-Integrationen](../guides/CLI-INTEGRATIONS.md)
für die unterstützten hostseitigen Setup-Befehle und
[Fehlerbereinigung](./ERROR_SANITIZATION.md) für den öffentlichen Fehlervertrag.
