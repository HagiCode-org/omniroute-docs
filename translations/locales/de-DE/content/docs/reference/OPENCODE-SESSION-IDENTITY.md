---
title: "OpenCode-Konversationsidentität"
version: 3.8.51
lastUpdated: 2026-09-21
---

# OpenCode-Konversationsidentität

OpenCode und OpenCode Go verwenden explizite Konversations-IDs über mehrere Turns hinweg
wieder. Der Resolver prüft `x-opencode-session`, vorhandene Affinitäts-/Sitzungs-Header,
native CLI-Sitzungs-/Thread-Header, Anfrage-Metadaten und anschließend Sitzungs-/Thread-Felder
auf oberster Ebene. Das JSON-kodierte `metadata.user_id` von Claude wird auf eine Sitzungs-ID
untersucht; eine opake Konto-/Benutzer-ID allein wird nie als Konversations-ID behandelt.

Werte mit Steuerzeichen, leere IDs und IDs mit mehr als 256 Zeichen werden ignoriert. Das Parsen
von JSON-Metadaten ist begrenzt. Vor der Übersetzung bewahrt der Executor-Header-Normalizer diese
Identität nur für die OpenCode-Provider; für andere Provider fügt er keine OpenCode-Header ein.

Die bestehende kanonische `ses_`-Kodierung und der Konversations-Fingerprint-fallback bleiben
unverändert. Ohne explizite ID bestimmen weiterhin die erste Benutzernachricht und die übrigen
bestehenden Fingerprint-Eingaben die Kontinuität. Dies ist weder eine neue Autorisierungsgrenze
noch ein Nachweis für die Isolation von upstream-Inhalten.

Die Implementierung befindet sich in `open-sse/utils/opencodeSessionIdentity.ts`,
`open-sse/utils/opencodeHeaders.ts` und
`open-sse/handlers/chatCore/executorClientHeaders.ts`. Regressionstests decken native IDs,
Claude-Metadaten, Vorrang, ungültige Werte und das bestehende Fingerprint-Verhalten ab, ohne
kostenpflichtige upstream-Aufrufe.
