---
title: "Estrategias de enrutamiento determinista"
---

# Estrategias de enrutamiento determinista

La entrada de self-hosted gateway de OmniRoute (`/v1/chat/completions`, RIC-738) enruta a
un único proveedor de forma predeterminada. Cuando configura un bloque `strategy:`, la decisión
de ruta pasa a ser una **política determinista y explicable**: el diferenciador de OmniRoute
frente al enrutamiento de caja negra "predict" de NotDiamond/Martian.

Cada decisión es:

- **Determinista** — la misma configuración y el mismo estado de ejecución producen el mismo proveedor.
- **Expresada en configuración** — una regla por línea; sin "一体化智能体", sin modelo aprendido.
- **Explicable** — cada respuesta lleva `x-omniroute-route-decision`, una respuesta de una
  línea a "¿por qué este modelo?" (y "¿por qué NO aquel?").

Este es el M2 de la diferenciación RIC-697 (D3 可审计路由). **No hay dependencia
predictiva / de ML**: las estrategias son reglas puras sobre señales observables
(fallos consecutivos, coste declarado, latencia medida).

## Activación

Añada un bloque `strategy:` al mismo documento YAML que `providers:`, o apunte
`OMNIROUTE_SELF_HOSTED_STRATEGY` (YAML en línea) / `OMNIROUTE_SELF_HOSTED_STRATEGY_FILE`
(un archivo) a un documento `strategy:` independiente. Una estrategia explícita de entorno
se fusiona sobre el bloque en línea clave por clave.

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

## Las cinco estrategias

| Estrategia | Configuración | Efecto |
| --- | --- | --- |
| Blacklist | `blacklist: [id, ...]` | Los proveedores listados nunca son candidatos. |
| Whitelist | `whitelist: [id, ...]` | Si no está vacía, solo los proveedores listados son candidatos. |
| Cooldown/breaker | `cooldown: {consecutiveFailures, cooldownMs}` | Tras N fallos consecutivos un proveedor queda excluido durante la ventana. Un éxito reinicia el contador. |
| Prioridad de coste | `costPriority: true` | Los candidatos elegibles se ordenan por `costPer1MInput` ascendente (declarado, nunca inventado). |
| Sensible a la latencia | `latencyAware.enabled: true` | Los candidatos elegibles se ordenan por latencia media reciente de solicitud ascendente. Los proveedores sin muestras van al final. |
| Cadena de fallback | `fallbackChain: [id, ...]` | Orden explícito principal→respaldo. Prevalece sobre el orden por coste/latencia. |

Los filtros (blacklist / whitelist / cooldown) se ejecutan primero y eliminan candidatos. Después,
la etapa de ordenación ordena los supervivientes: prevalece un `fallbackChain` explícito; en caso
contrario se aplican `costPriority` y luego `latencyAware`, en ese orden.

## Proveedores fijados

El encabezado `x-omniroute-provider` y el prefijo de modelo `provider/model` son **fijaciones
explícitas**, no preferencias. Si un proveedor fijado queda excluido por un filtro estricto (blacklist /
whitelist / cooldown activo), la solicitud falla con `400` y el motivo de la fijación: el gateway
nunca reenruta en silencio a un cliente que pidió un proveedor concreto. Si la fijación supera
los filtros, es el primer candidato, y los demás candidatos sirven como su cadena de fallback.

## Fallback ante fallos

La lista ordenada de candidatos es la cadena de fallback. Cuando falla el primer proveedor
(red inalcanzable, conexión rechazada, DNS/TLS o cualquier respuesta distinta de 2xx), el gateway
recorre el siguiente candidato, y así sucesivamente. Cada fallo se registra en el breaker de cooldown y
de cada intento se muestrea la latencia, de modo que un principal averiado también entra en cooldown para las
solicitudes _posteriores_. Cuando fallan todos los candidatos, se devuelve el último error normalizado (forma de
OpenAI). Cuando no hay ningún candidato elegible, se devuelve un `503` con la decisión
explicable completa.

## Explicabilidad

Cada respuesta enrutada por el motor de estrategias lleva:

```
x-omniroute-route-decision: cheap(cost-priority: cheap #1) -> fast(cost-priority: fast #2); premium excluded: blacklist: premium forbidden
```

El valor es la lista ordenada de candidatos más cada motivo de exclusión: el rastro de auditoría
de "por qué este modelo, por qué no aquel".

## Contrato de fallos (sin cambios respecto a RIC-738)

- El cuerpo de upstream distinto de 2xx se normaliza mediante `parseUpstreamError` + `buildErrorBody`
  a la forma estándar `error` de OpenAI (Hard Rule #12).
- Los fallos a nivel de red devuelven un `502` normalizado; una vez agotada toda la cadena,
  se muestra el último error normalizado.
- Los encabezados de credenciales / sesión devueltos en eco por el upstream se eliminan de cada respuesta.
- Una configuración de proveedor con un bloque `strategy:` mal formado devuelve `500`: una política
  mal configurada nunca se convierte en silencio en una operación nula.

## Pruebas

- `tests/unit/routing-strategies.test.ts` — 25 pruebas unitarias sobre el motor de estrategias puro:
  análisis, blacklist/whitelist, breaker de cooldown, prioridad de coste, sensible a la latencia, cadena de
  fallback, pipeline combinado, explicabilidad.
- `tests/unit/self-hosted-entry.test.ts` — inyección de fallos sobre HTTP real: principal caído
  → el fallback tiene éxito; todos caídos → último error; fijado y en blacklist → 400; el cooldown
  excluye a un proveedor que falla en la siguiente solicitud; sin elegibles → 503 con decisión
  explicable.
