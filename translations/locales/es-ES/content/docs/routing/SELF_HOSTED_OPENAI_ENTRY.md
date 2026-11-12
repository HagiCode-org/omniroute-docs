---
title: "Entrada unificada compatible con OpenAI self-hosted"
---

# Entrada unificada compatible con OpenAI self-hosted

Cuando está activada, el `/v1/chat/completions` ya existente de OmniRoute (y el contrato
compatible con OpenAI que sirve) se convierte en un **gateway self-hosted**: una solicitud
compatible con OpenAI entra, se enruta automáticamente al proveedor de su elección mediante los
adaptadores de proveedor, y sale con la forma de error estándar de OpenAI. El código del cliente
no cambia.

Este es el diferenciador D4 (接入即用) del diseño RIC-697: la misma ruta `/v1` a la que ya apunta
el SDK de OpenAI, respaldada por sus propios proveedores en lugar de un único catálogo
incorporado.

## Activación

Establezca cualquiera de las dos variables de entorno (consulte `.env.example` para ambas):

- `OMNIROUTE_SELF_HOSTED_PROVIDERS` — documento YAML en línea (solo en runtime, no se registra).
- `OMNIROUTE_SELF_HOSTED_PROVIDERS_FILE` — ruta a un archivo YAML.

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

Cuando **cualquiera** de las variables está establecida, la entrada unificada queda activa para
cada solicitud a `/v1/chat/completions`. Si la configuración existe pero no se puede analizar,
se devuelve `500` (nunca recurre silenciosamente al enrutamiento en la nube). Cuando no hay
ninguna establecida, la ruta se comporta exactamente como antes.

## Enrutamiento automático al proveedor

Precedencia (determinista, sin modelo predictivo):

1. Encabezado `x-omniroute-provider: <id>` — ID de proveedor exacto.
2. Prefijo de `model`: `provider/model` (barra) o `provider::model` (doble dos puntos).
3. El primer proveedor configurado.

El prefijo de enrutamiento se elimina antes de reenviar: el upstream recibe el modelo sin
prefijo (`claude-sonnet`, no `claude/claude-sonnet`).

```bash
# via header
curl http://localhost:20128/v1/chat/completions \
  -H "x-omniroute-provider: claude" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet","messages":[{"role":"user","content":"hi"}]}'

# or via model prefix
curl ... -d '{"model":"claude/claude-sonnet","messages":[...]}'
```

## Andamiaje de autenticación (D5 reservado)

`OMNIROUTE_SELF_HOSTED_API_KEY` opcional. Cuando está establecida, las solicitudes deben incluir
`Authorization: Bearer <key>`. Sin establecer = ruta abierta (loopback / red de confianza), igual
que funcionan los proveedores locales ya existentes de OmniRoute. Se espera que el sistema de
claves de cuota/cuota-自治 de D5 se haga cargo de este encabezado.

## Contrato de fallo

- El cuerpo de una respuesta no 2xx del upstream se normaliza mediante `parseUpstreamError` +
  `buildErrorBody` a la forma de `error` estándar de OpenAI (Hard Rule #12: nunca texto bruto
  del upstream).
- Los fallos a nivel de red (conexión rechazada / DNS / TLS) devuelven un `502` normalizado con
  `error.message: "Upstream provider unreachable: …"`.
- Los encabezados de credenciales y de sesión devueltos en eco por el upstream se eliminan de toda
  respuesta.

## Pruebas

`tests/unit/self-hosted-entry.test.ts` cubre la selección de proveedor, el reenvío del prefijo
de modelo, la higiene de encabezados, la autenticación, la normalización de errores del upstream,
el passthrough del streaming SSE y las rutas de fall-through y de configuración errónea, todo
ello sobre HTTP real contra un upstream local.

## Notas

- Los modelos self-hosted omiten por diseño la maquinaria de retirada y de alias exclusiva de la
  nube: el desvío ocurre antes de esas comprobaciones de la nube, de modo que ID como
  `local/llama3` nunca activan los 410 de pares de la nube ni las reescrituras de alias.
- Las estrategias de enrutamiento deterministas (fallback / cooldown / coste / latencia /
  blacklist) son responsabilidad de M2 (`RIC-740`) y se inyectan aquí en la capa del gateway.
  Configúrelas con un bloque `strategy:` — véase
  [DETERMINISTIC_ROUTING.md](./DETERMINISTIC_ROUTING.md).
