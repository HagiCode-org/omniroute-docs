---
title: "Postura de autenticación de inferencia"
---

# Postura de autenticación de inferencia

## Descripción general

`GET /v1/models` y los endpoints de inferencia están controlados por **ajustes distintos**. Por
tanto, el probe más natural que ejecuta un operador para responder a "¿está protegida mi API?"
puede devolver una respuesta equivocada.

| Endpoint                                                                           | Controlado por                                                                                                                                                     |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /v1/models`                                                                   | La postura de inicio de sesión del dashboard — `isAuthRequired()`, que se puede anular por instancia con `requireAuthForModels` (`src/app/api/v1/models/catalogRequest.ts`) |
| `POST /v1/chat/completions`, `POST /v1/responses`, y las demás rutas de API de cliente | `REQUIRE_API_KEY` (`src/server/authz/policies/clientApi.ts`)                                                                                                       |

En una instancia que tiene una contraseña de administrador establecida y `REQUIRE_API_KEY=false`,
`/v1/models` responde `401` mientras que la inferencia está abierta a cualquiera que pueda
alcanzar el puerto.

> **Advertencia sobre los probes:** un `401` de `/v1/models` **no** verifica que la inferencia
> esté protegida. Solo indica que el dashboard requiere iniciar sesión.

Esto no es hipotético. En la discusión #13310, una instancia self-hosted detrás de Traefik vio
cómo su cuota de Codex era consumida por tráfico anónimo de `POST /v1/responses` mientras
`/v1/models` devolvía `401`, lo que, en palabras del autor del informe, "dio inicialmente
la impresión de que toda la API estaba protegida" y le hizo investigar el componente
equivocado.

## Cómo comprobarlo realmente

Ejecute un probe contra una ruta de inferencia, no contra el catálogo:

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST http://<host>:<api-port>/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"model":"<any-model>","messages":[{"role":"user","content":"ping"}]}'
```

Un `401` significa que `REQUIRE_API_KEY` se está aplicando. Cualquier respuesta que llegue al
enrutamiento (incluido un error de modelo no encontrado) significa que se acepta tráfico
anónimo.

Tenga en cuenta que con `REQUIRE_API_KEY=false` un bearer **no válido** degrada a anónimo en
lugar de ser rechazado (#2257), por lo que enviar una clave basura tampoco es un probe válido.

## Advertencia de inicio

Cuando `REQUIRE_API_KEY` está desactivado y un servidor se enlaza a una interfaz que no es
loopback, OmniRoute registra una advertencia en el arranque
(`src/lib/startup/nonLoopbackApiKeyGuard.ts`). Esto abarca tres superficies:

- el servidor del Dashboard/API que sirve la inferencia de `/v1` — `HOST`, por defecto `0.0.0.0`
- el puente de API — `API_HOST`, por defecto `127.0.0.1`
- el WebSocket del dashboard en vivo — su propio host

La advertencia nunca bloquea el arranque: un reverse proxy situado delante de OmniRoute puede
estar aplicando ya su propia autenticación.

## Relacionado

- `REQUIRE_API_KEY` en [ENVIRONMENT.md](../reference/ENVIRONMENT.md)
- `APP_BIND_HOST` y los valores por defecto de loopback de compose (#12568)
- #2257 — un bearer no válido degrada a anónimo cuando `REQUIRE_API_KEY` está desactivado
- #13695 — este documento
