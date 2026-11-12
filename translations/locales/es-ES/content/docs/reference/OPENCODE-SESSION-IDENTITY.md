---
title: "Identidad de conversación de OpenCode"
version: 3.8.51
lastUpdated: 2026-09-21
---

# Identidad de conversación de OpenCode

OpenCode y OpenCode Go reutilizan ID de conversación explícitos entre turnos. El
resolutor comprueba `x-opencode-session`, los encabezados de afinidad o de sesión ya existentes, los
encabezados nativos de sesión/hilo de la CLI, los metadatos de la solicitud y, por último, los campos
de sesión/hilo de nivel superior. El `metadata.user_id` de Claude, codificado en JSON, se inspecciona
en busca de un ID de sesión; un ID opaco de cuenta/usuario por sí solo nunca se trata como ID de conversación.

Se ignoran los valores que contienen caracteres de control, los ID vacíos y los ID de más de 256
caracteres. El análisis de los metadatos JSON está acotado. Antes de la traducción,
el normalizador de encabezados del ejecutor conserva esta identidad únicamente para los proveedores
de OpenCode; no inyecta encabezados de OpenCode para otros proveedores.

La codificación canónica `ses_` existente y el fallback de huella digital de la conversación
permanecen sin cambios. Sin un ID explícito, el primer mensaje del usuario y el resto de las
entradas de huella digital existentes siguen determinando la continuidad. Esto no es un nuevo
límite de autorización ni una prueba de aislamiento del contenido en el upstream.

La implementación reside en `open-sse/utils/opencodeSessionIdentity.ts`,
`open-sse/utils/opencodeHeaders.ts` y
`open-sse/handlers/chatCore/executorClientHeaders.ts`. Las pruebas de regresión cubren
los ID nativos, los metadatos de Claude, la precedencia, los valores no válidos y el comportamiento
de huella digital existente, sin llamadas de pago al upstream.
