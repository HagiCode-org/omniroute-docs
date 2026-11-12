---
title: "Catálogo de modelos de la CLI y metadatos manuales"
version: "3.8.51"
lastUpdated: "2026-09-21"
---

# Catálogo de modelos de la CLI y metadatos manuales

`omniroute models` lee primero el catálogo público de modelos del servidor seleccionado,
incluidas sus entradas personalizadas y sincronizadas. `--output json` y `--output jsonl`
devuelven todas las filas coincidentes, sin mensaje de truncamiento de tabla. Las tablas
interactivas muestran como máximo 50 filas. JSON conserva los límites de contexto públicos,
las modalidades, las capacidades, el origen del modelo cuando el servidor lo proporciona y
los metadatos del formato de API; no se emiten credenciales ni encabezados de compatibilidad.
Solo se usa un fallback heredado a `/api/models` cuando el endpoint público devuelve HTTP 404,
405 o 501, nunca después de un fallo de autenticación.
`omniroute completion refresh` utiliza ese mismo catálogo. Una solicitud fallida del catálogo
de modelos devuelve un código de salida distinto de cero y conserva la caché de completado
anterior. Los scripts de completado de Bash, Zsh y Fish anuncian los subcomandos de modelos
manuales.

## Ciclo de vida de los modelos manuales

Estas operaciones usan la API de gestión autenticada `/api/provider-models` ya existente.
Respetan la misma selección global de `--context` y `--base-url` que el resto de los comandos
de la CLI. Use el ID canónico del proveedor y el ID del modelo del proveedor por separado; un
ID de modelo que contenga barras es válido. Use un contexto de gestión configurado en lugar
de poner credenciales en los argumentos del comando.

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

Los ejemplos describen la sintaxis; sustituya los ID de proveedor y de modelo por entradas
que pertenezcan a su servidor. La operación de adición no crea una conexión con el proveedor.

- `add` rechaza una entrada personalizada existente. La opción `--max-output-tokens` fija,
  de forma opcional, el límite de salida en el momento de la creación; `--api-format` fija el
  formato de API del modelo y los metadatos de endpoint correspondientes, como `embeddings`
  en lugar de `chat`.
- `edit` requiere una entrada manual existente. Su límite de contexto usa la anulación manual
  de contexto independiente del backend; al borrarlo se elimina esa anulación, no el límite de
  entrada original ni los metadatos sincronizados.
- `remove` requiere `--yes`, salvo con `--dry-run`. Solicita `resetOverride=true`, lo que
  conserva una entrada sincronizada con el mismo ID. No se expone el borrado masivo.
- `--dry-run` realiza la lectura previa autenticada, pero ninguna escritura ni inferencia.
- Cada mutación real vuelve a leer el catálogo manual (readback). `persistenceVerified: true`
  significa que los metadatos solicitados se observaron tras la escritura; no significa que el
  modelo pueda generar texto ni llamar a herramientas. `inferenceValidation` es siempre
  `not-run`.
- Un fallo del readback devuelve un código de salida distinto de cero. Es posible que la
  escritura ya haya surtido efecto; inspeccione el servidor antes de reintentar. Esta CLI no
  serializa los escritores concurrentes, y la API existente no ofrece una transacción de
  compare-and-swap.

## Test & Add: no implementado

Las entradas manuales no están verificadas. No existe ninguna opción `--validate` y estos
comandos no emiten solicitudes de inferencia ni ejecutan herramientas. Un futuro flujo de
validación opt-in deberá separar las credenciales de inferencia de la autenticación de gestión
y establecer qué conexión exacta del proveedor produjo las tres pruebas: la generación, una
llamada sintética a herramienta vinculada a un nonce y la continuación tras un resultado
sintético de herramienta. Para esas pruebas no es necesaria ninguna ejecución real de
herramientas.

El pin `x-omniroute-connection` ya existente no basta por sí solo como receipt de prueba:
la selección de credenciales puede liberar intencionadamente un pin en casos de cooldown, cuota
o cuenta excluida, y la afinidad de sesión participa en la selección. Véanse
`src/sse/services/auth.ts` y el tratamiento de `forcedConnectionId` en
`src/sse/handlers/chat.ts`. Antes de implementar Test & Add, hay que decidir un contrato de
pin estricto o de receipt de conexión verificable. Después, las pruebas deben demostrar que
no hay persistencia tras ninguna respuesta fallida, truncada, con tiempo de espera agotado o de
una conexión incorrecta. Se trata de una decisión de contrato de backend independiente, no de
una promesa hecha por el CRUD manual.
