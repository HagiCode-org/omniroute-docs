---
title: "CLI Companion — guía de terminal solo para copiar"
version: 3.8.51
lastUpdated: 2026-09-22
---

# CLI Companion

El dashboard de CLI Code incluye un companion solo para copiar, destinado a los
destinos CLI ejecutables compatibles con esta versión de OmniRoute. No inicia ningún
proceso, no escribe configuración, no prueba la inferencia ni envía credenciales al
clipboard.

## La detección del servidor no es detección del navegador

La detección y el estado de runtime y de configuración describen la máquina que ejecuta
el servidor de OmniRoute. Si abre un dashboard remoto desde su portátil, que falte una CLI
en ese servidor no dice nada sobre la CLI instalada en su portátil. La detección
desconocida o fallida se mantiene explícita; no se trata como “no instalado”. Los errores
de diagnóstico sin procesar y los endpoints de configuración no se muestran en este panel.

Copie los comandos en la terminal de la máquina donde quiera usar la CLI.
El companion no bloquea las instrucciones locales cuando falla la detección del servidor.

## Contextos locales o remotos

Empiece inspeccionando los contextos ya configurados en su terminal:

```sh
omniroute contexts list
omniroute contexts current
```

Deje vacío el campo de contexto del companion para usar el contexto activo de la CLI, o
introduzca el nombre de un contexto existente. Un contexto con nombre puede apuntar a un
servidor local o remoto. El dashboard no lee el almacén de contextos de su terminal, no crea un
contexto ni copia sus credenciales. Por ejemplo, si `office` ya existe:

```sh
omniroute configure claude --context office
omniroute run claude --context office --dry-run
```

`configure` es interactivo y escribe la configuración en la máquina donde lo ejecuta. `run --dry-run`
muestra el plan de lanzamiento sin iniciar el destino; no establece que la inferencia de upstream
funcione. Autentíquese en la terminal con el flujo de trabajo de contextos existente de la CLI antes de ejecutar
estos comandos.

Solo se ofrecen las capacidades declaradas por el manifest ejecutable. Si un destino
requiere un modelo, su comando de lanzamiento permanece no disponible hasta que indique un
identificador de modelo real. Los campos de contexto/modelo aceptan un conjunto restringido de
caracteres literales; se rechazan los operadores de shell, los espacios en blanco y la sintaxis de opción inicial.

Si falla el acceso al clipboard, el panel informa del fallo y deja el comando
visible para su selección manual. Copiar nunca lo ejecuta.

## Límite de implementación

El loader solo de servidor en `src/lib/cli-helper/companionTargets.ts` proyecta el
manifest ejecutable en descriptores públicos. El navegador recibe únicamente los ID de
destino, los nombres para mostrar y los indicadores de capacidad, no módulos de Node ni secretos de runtime.
La validación de comandos y el mapeo de estado residen en `src/shared/utils/cliCompanion.ts`.
El panel reutiliza la solicitud de estado por lotes existente del dashboard; no introduce
ninguna API de ejecución ni sondeo de estado adicional.
