---
title: Smoke tests aislados de la CLI
description: Valide los contratos de protocolo de las CLI instaladas con respuestas locales desechables.
version: "3.8.51"
lastUpdated: "2026-09-22"
---

# Smoke tests aislados de la CLI

Ejecute el harness opcional contra los binarios ya instalados de Aider, Goose, OpenCode,
Qwen Code o Codex:

```bash
node scripts/cli/smoke-cli-integrations.mjs --targets qwen,codex --json
```

`--bin-dir /absolute/path` antepone un directorio de binarios existente. El harness no
instala herramientas. Los ejecutables ausentes producen `HOLD-missing-binary`; un tiempo de
espera agotado produce `HOLD-timeout`. Cualquier FAIL hace que el proceso termine con el código
1; un HOLD hace que termine con el código 2. Todos los destinos deben dar PASS para obtener el
código de salida 0.

Cada destino se ejecuta mediante `omniroute run` contra un servidor HTTP desechable enlazado a
`127.0.0.1`, con una credencial sentinel fija y no secreta. HOME, los directorios XDG, los
directorios de configuración de la CLI y el directorio de datos de OmniRoute son temporales. No
se heredan las credenciales de proveedores, las variables de proxy, los indicadores del cargador
de runtime ni las configuraciones existentes. No se requieren ni se aceptan credenciales reales
de upstream.

La opción explícita `--inherit-isolated-env` del harness reenvía `--inherit-env` a
`omniroute run`, lo que permite que los indicadores de supresión de metadatos y actualizaciones
controlados por el harness lleguen al proceso hijo de terceros. Está desactivada por defecto y
aun así reconstruye el entorno externo a partir de la misma lista de permitidos reducida: nunca
hereda los secretos del llamador, `NODE_OPTIONS`, `NODE_PATH`, `LD_PRELOAD`, `PYTHONPATH` ni la
configuración de proxy. El cifrado del almacenamiento usa un sentinel no secreto únicamente
dentro del directorio de datos desechable. El harness también selecciona los metadatos de
modelos empaquetados de LiteLLM y la salida de Python sin búfer; son controles de prueba fijos,
no valores de entorno proporcionados por el llamador. Esta opción requiere una CLI que
implemente `run --inherit-env`; los launchers no compatibles fallan de forma normal y no deben
contarse como un smoke test satisfactorio.

Un PASS requiere una salida correcta del proceso hijo, la ruta de protocolo y el modelo
esperados, el encabezado de autorización sentinel, una respuesta HTTP completada y un marcador
de respuesta impredecible generado por el servidor en stdout. El marcador no aparece en el
prompt, por lo que imprimir el prompt o un diagnóstico no puede satisfacer la prueba. Esto
demuestra el contrato de transporte y de respuesta del binario instalado, no la autenticación
real con el proveedor, la ejecución de herramientas, un despliegue de producción ni todas las
versiones de la CLI.

El runner limita la salida capturada y el tiempo de ejecución. En POSIX crea un grupo de
procesos dedicado y termina los miembros restantes de ese grupo al finalizar; Windows devuelve
actualmente `HOLD-process-isolation` porque aún no se ha implementado una limpieza equivalente
de los descendientes. Los archivos temporales y los sockets del servidor se cierran tras cada
destino. Se trata de aislamiento de configuración y de procesos, **no de un sandbox de red a
nivel de sistema operativo**: los binarios de terceros pueden intentar sus propias solicitudes de
metadatos o de actualización. Ejecute únicamente binarios instalados de confianza y use un
entorno restringido externamente si necesita que no haya ningún tráfico que no sea loopback.

Ejecute las pruebas deterministas del harness sin binarios de terceros:

```bash
node --import tsx/esm --test tests/unit/cli/real-cli-smoke-harness.test.ts tests/unit/cli/real-cli-smoke-safety.test.ts
```

El mock admite JSON/SSE de OpenAI Chat Completions y de la Responses API. Nunca reenvía
solicitudes a un proveedor. Las pruebas de upstream que dependen de credenciales siguen siendo
una validación opt-in independiente y no deben notificarse como cubiertas por este harness.
