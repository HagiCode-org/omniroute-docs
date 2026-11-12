---
title: "CLI Companion — Terminal-Hinweise nur zum Kopieren"
version: 3.8.51
lastUpdated: 2026-09-22
---

# CLI Companion

Das CLI-Code-dashboard enthält einen reinen Kopier-Begleiter für die ausführbaren
CLI-Ziele, die von dieser OmniRoute-Version unterstützt werden. Er startet keinen Prozess, schreibt keine
Konfiguration, testet keine Inferenz und sendet keine Zugangsdaten in die clipboard.

## Server-Erkennung ist keine Browser-Erkennung

Erkennungs-, Laufzeit- und Konfigurationsstatus beschreiben die Maschine, auf der der
OmniRoute-Server läuft. Wenn Sie ein entferntes dashboard von Ihrem Laptop aus öffnen, sagt eine auf diesem Server
fehlende CLI nichts über die auf Ihrem Laptop installierte CLI aus. Unbekannte und
fehlgeschlagene Erkennung werden weiterhin ausdrücklich ausgewiesen; sie werden nicht als “nicht installiert” behandelt. Rohe
Diagnosefehler und Konfigurations-endpoints werden in diesem Panel nicht angezeigt.

Kopieren Sie Befehle in das Terminal der Maschine, auf der Sie die CLI verwenden möchten.
Der Begleiter blockiert lokale Anweisungen nicht, wenn die Server-Erkennung fehlschlägt.

## Lokale oder entfernte Kontexte

Beginnen Sie mit der Prüfung der Kontexte, die in Ihrem Terminal bereits konfiguriert sind:

```sh
omniroute contexts list
omniroute contexts current
```

Lassen Sie das Kontextfeld des Begleiters leer, um den aktiven Kontext der CLI zu verwenden, oder
geben Sie den Namen eines vorhandenen Kontexts ein. Ein benannter Kontext kann auf einen lokalen oder entfernten
Server zeigen. Das dashboard liest den Kontextspeicher Ihres Terminals nicht, legt keinen
Kontext an und kopiert dessen Zugangsdaten nicht. Wenn beispielsweise `office` bereits existiert:

```sh
omniroute configure claude --context office
omniroute run claude --context office --dry-run
```

`configure` ist interaktiv und schreibt die Konfiguration auf der Maschine, auf der Sie es
ausführen. `run --dry-run` zeigt den Startplan an, ohne das Ziel zu starten;
es belegt nicht, dass die upstream-Inferenz funktioniert. Authentifizieren Sie das Terminal
über den vorhandenen CLI-Kontext-Workflow, bevor Sie diese Befehle ausführen.

Angeboten werden nur Fähigkeiten, die vom ausführbaren manifest deklariert werden. Wenn ein Ziel
ein Modell benötigt, bleibt sein Startbefehl nicht verfügbar, bis Sie eine echte
Modellkennung angeben. Die Kontext-/Modellfelder akzeptieren einen eingeschränkten Satz literaler
Zeichen; Shell-Operatoren, Leerzeichen und führende Optionssyntax werden abgelehnt.

Schlägt der Zugriff auf die clipboard fehl, meldet das Panel den Fehler und lässt den Befehl
zur manuellen Auswahl sichtbar. Das Kopieren führt ihn nie aus.

## Implementierungsgrenze

Der nur auf dem Server laufende Loader in `src/lib/cli-helper/companionTargets.ts` projiziert das
ausführbare manifest in öffentliche Deskriptoren. Der Browser erhält nur Ziel-IDs,
Anzeigenamen und Fähigkeits-Flags, keine Node-Module oder Laufzeit-Geheimnisse.
Befehlsvalidierung und Statuszuordnung befinden sich in `src/shared/utils/cliCompanion.ts`.
Das Panel verwendet die vorhandene Batch-Status-Anfrage des dashboard wieder; es führt keine
Ausführungs-API und kein zusätzliches Status-Polling ein.
