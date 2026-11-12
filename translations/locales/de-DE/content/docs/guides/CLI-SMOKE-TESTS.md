---
title: Isolierte CLI smoke tests
description: Installierte CLI-Protokollverträge mit Wegwerf-Antworten lokal validieren.
version: "3.8.51"
lastUpdated: "2026-09-22"
---

# Isolierte CLI smoke tests

Führen Sie das optionale harness gegen bereits installierte Binärdateien von Aider, Goose,
OpenCode, Qwen Code oder Codex aus:

```bash
node scripts/cli/smoke-cli-integrations.mjs --targets qwen,codex --json
```

`--bin-dir /absolute/path` stellt ein vorhandenes Binärverzeichnis voran. Das harness
installiert keine Tools. Fehlende ausführbare Dateien ergeben `HOLD-missing-binary`; eine
Zeitüberschreitung ergibt `HOLD-timeout`. Jedes FAIL beendet den Prozess mit Exit-Code 1;
HOLD beendet ihn mit Exit-Code 2. Für Exit-Code 0 müssen alle Ziele PASS ergeben.

Jedes Ziel läuft über `omniroute run` gegen einen Wegwerf-HTTP-Server, der an `127.0.0.1`
gebunden ist, und verwendet feste, nicht geheime sentinel-Zugangsdaten. HOME, XDG-Verzeichnisse,
CLI-Konfigurationsverzeichnisse und das OmniRoute-Datenverzeichnis sind temporär.
Provider-Zugangsdaten, proxy-Variablen, Runtime-Loader-Flags und bestehende
Konfigurationen werden nicht geerbt. Echte upstream-Zugangsdaten werden weder benötigt noch
akzeptiert.

Die ausdrückliche harness-Option `--inherit-isolated-env` leitet `--inherit-env` an
`omniroute run` weiter, sodass vom harness gesteuerte Flags zur Unterdrückung von
Metadaten- und Update-Abfragen den Kindprozess des Drittanbieters erreichen. Sie ist standardmäßig
aus und baut die äußere Umgebung weiterhin aus derselben schmalen Allowlist auf: Sie erbt
niemals die Geheimnisse des Aufrufers, `NODE_OPTIONS`, `NODE_PATH`, `LD_PRELOAD`,
`PYTHONPATH` oder proxy-Einstellungen. Die Speicherverschlüsselung verwendet einen nicht
geheimen sentinel ausschließlich innerhalb des Wegwerf-Datenverzeichnisses. Das harness
wählt außerdem die mitgelieferten Modellmetadaten von LiteLLM und ungepufferte
Python-Ausgabe; dies sind feste Testvorgaben, keine vom Aufrufer gelieferten
Umgebungswerte. Diese Option erfordert eine CLI, die `run --inherit-env` implementiert;
nicht unterstützende launcher schlagen regulär fehl und dürfen nicht als erfolgreicher
smoke test gezählt werden.

Ein PASS erfordert einen erfolgreichen Exit des Kindprozesses, den erwarteten Protokollpfad
und das erwartete Modell, den sentinel-Authorization-Header, eine abgeschlossene
HTTP-Antwort und eine unvorhersehbare, vom Server erzeugte Antwortmarkierung in stdout.
Die Markierung kommt im prompt nicht vor, sodass weder die Ausgabe des prompt noch
eine Diagnosemeldung den Test erfüllen kann. Das belegt den Transport- und Antwortvertrag
der installierten Binärdatei, nicht die echte Provider-Authentifizierung, die
Tool-Ausführung, ein Produktivsystem oder jede CLI-Version.

Der Runner begrenzt die erfasste Ausgabe und die Ausführungszeit. Unter POSIX legt er eine
eigene Prozessgruppe an und beendet beim Abbau die verbleibenden Mitglieder dieser Gruppe; Windows
liefert derzeit `HOLD-process-isolation`, weil eine gleichwertige Bereinigung von
Nachkommenprozessen nicht implementiert ist. Temporäre Dateien und Server-Sockets werden
nach jedem Ziel geschlossen. Dies ist Konfigurations- und Prozessisolation, **keine
Netzwerk-Sandbox des Betriebssystems**: Binärdateien von Drittanbietern können eigene
Metadaten- oder Update-Anfragen versuchen. Führen Sie nur vertrauenswürdige installierte
Binärdateien aus und verwenden Sie eine extern eingeschränkte Umgebung, wenn kein
Datenverkehr außerhalb von loopback zulässig ist.

Führen Sie die deterministischen Tests des harness ohne Binärdateien von Drittanbietern aus:

```bash
node --import tsx/esm --test tests/unit/cli/real-cli-smoke-harness.test.ts tests/unit/cli/real-cli-smoke-safety.test.ts
```

Der Mock unterstützt JSON/SSE der OpenAI Chat Completions und der Responses API. Er leitet
Anfragen niemals an einen Provider weiter. Upstream-Tests, die Zugangsdaten benötigen,
bleiben eine separate opt-in-Validierung und dürfen nicht als von diesem harness
abgedeckt gemeldet werden.
