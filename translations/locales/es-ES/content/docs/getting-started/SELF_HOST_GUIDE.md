---
title: "🚀 Guía de self-host — OmniRoute (零月费自托管 / self-host sin coste mensual)"
version: 3.8.51
lastUpdated: 2026-09-14
---

# 🚀 Guía de self-host — OmniRoute

> **En resumen** — tres comandos, un endpoint local, cero costes mensuales. Sin
> facturación SaaS, sin aislamiento multi-tenant, sin salto de procesamiento de
> prompts alojado. Sus prompts van directamente al proveedor que usted elija.

```bash
cp .env.selfhost.example .env      # then edit the 2 lines marked "EDIT ME"
docker compose -f docker-compose.selfhost.yml up -d
open http://127.0.0.1:20128
```

Este es el **vehículo de self-host** para la forma de producto "零月费 + 自托管" de
OmniRoute: un contenedor/binario empaquetado que usted ejecuta en su propia
máquina en 5 minutos.

---

## Por qué existe esta guía

OmniRoute incluye un `docker-compose.yml` sofisticado con profiles
(`base`, `web`, `cli`, `host`, `cliproxyapi`, `memory`, `bifrost`). Cada servicio
de aplicación está condicionado por un profile, de modo que un simple
`docker compose up -d` solo inicia Redis. Eso es correcto para usuarios avanzados
que eligen un profile, pero *no* es una historia de self-host de 5 minutos.

`docker-compose.selfhost.yml` es la capa KISS: **un comando, imagen publicada,
solo loopback, Redis incluido, sin elegir profile, sin paso de compilación.**
Cuando se le quede corta, pase a los profiles completos de la
[DOCKER_GUIDE](../guides/DOCKER_GUIDE.md).

| Público | Punto de partida | Siguiente paso |
| --- | --- | --- |
| Usuario de self-host, un solo usuario | esta guía | — |
| Usuario avanzado, herramientas CLI / proveedores web-cookie / sidecars | — | profiles de `docker-compose.yml` |

---

## Requisitos previos

- Docker Engine 24+ (o Docker Desktop 4.30+) con el plugin Compose v2.
- ~2 GB de RAM libres (consulte [Dimensionado del contenedor](#dimensionado-del-contenedor)).
- Una clave de API de cualquier proveedor compatible (OpenAI, Anthropic, Google
  o uno de los [más de 150 niveles gratuitos](./FREE-TIERS-GUIDE.md)).

No se necesita toolchain de compilación, ni Node, ni clonar git: la imagen se descarga.

---

## Paso 1 — Configuración (1 min)

```bash
cp .env.selfhost.example .env
```

Edite exactamente **dos** líneas en `.env`:

```dotenv
REQUIRE_API_KEY=true          # was false — lock the endpoint down
APP_BIND_HOST=127.0.0.1       # keep loopback; see "Exposing" only if needed
```

`REQUIRE_API_KEY=true` hace que cada solicitud a `/v1` y el dashboard exijan una
clave de API / inicio de sesión. En el primer arranque el dashboard genera
automáticamente un `INITIAL_PASSWORD`: léalo en los logs:

```bash
docker logs omniroute | grep -i password
```

Las demás variables (`DASHBOARD_PORT`, `API_PORT`, `LIVE_WS_PORT`,
`OMNIROUTE_MEMORY_MB`) ya tienen valores predeterminados razonables. Déjelas
como están, salvo que sepa que necesita cambiarlas.

---

## Paso 2 — Inicio (1 min)

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

Descarga `diegosouzapw/omniroute:latest` (multi-arquitectura AMD64 + ARM64, ~250 MB) y
`redis:8.6.5-alpine`, inicia ambos y espera a que Redis esté en buen estado antes
de que arranque la aplicación.

### Paso 3 — Verificación (30 s)

```bash
# process lifecycle + readiness
curl -fsS http://127.0.0.1:20128/healthz && echo

# container health
docker inspect --format '{{.State.Health.Status}}' omniroute
```

Debería ver `{"status":"ok"}` y `healthy`. Después abra el dashboard:

```
http://127.0.0.1:20128
```

En un máximo de ~300 s desde `up -d` el endpoint es accesible localmente y el healthcheck
está en `healthy`: el umbral de aceptación del issue de self-host.

---

## Puertos

| Puerto | Qué es | Bind predeterminado |
| --- | --- | --- |
| `20128` | Dashboard + proxy LLM `/v1` (entrada unificada) | `127.0.0.1` |
| `20129` | Puerto de API (servidor a servidor) | `127.0.0.1` |
| `20132` | WebSocket en vivo (actualizaciones del dashboard en tiempo real) | `127.0.0.1` |

Los tres hacen bind **solo a loopback** de forma predeterminada. Redis **no** se
publica en el host en absoluto: la aplicación llega a él a través de la red de
compose. Es deliberado: publicar un Redis sin autenticación en `0.0.0.0` es una
trampa.

---

## Conexión de un proveedor

1. Abra el dashboard → **Providers**.
2. Añada un proveedor y pegue su clave de API. Las claves se cifran en reposo con
   AES-256-GCM; el texto en claro nunca sale de su máquina.
3. Apunte su IDE / agent a la entrada unificada:

```
http://127.0.0.1:20128/v1
```

Para elegir proveedor, consulte la
[Guía de niveles gratuitos](./FREE-TIERS-GUIDE.md): OmniRoute agrega más de 150
niveles gratuitos en un único endpoint, de modo que puede usar `model: "auto"` para
elegir la mejor opción gratuita por solicitud.

---

## Dimensionado del contenedor

La imagen fija `OMNIROUTE_MEMORY_MB=1024`. Es suficiente para el dashboard
y un chat ligero. Los **coding agents** (`POST /v1/responses` desde Claude Code,
Codex, Grok, …) retienen varios grafos de contexto grandes durante la compresión
y pueden abortar V8 en torno a los ~12 GiB de old-space con dos contextos largos
superpuestos
([#7849](https://github.com/diegosouzapw/OmniRoute/issues/7849)).

`.env.selfhost.example` usa por defecto `OMNIROUTE_MEMORY_MB=2048`: un mínimo
seguro para un solo usuario que ejecuta coding agents. Auméntelo si reparte muchos
modelos en paralelo (combos de fusion) o si aparece `FATAL ERROR: Reached heap limit`:

```dotenv
OMNIROUTE_MEMORY_MB=4096
```

La memoria es un techo del heap de V8; los buffers nativos (SQLite, ONNX,
better-sqlite3) quedan fuera de él, así que dimensione el contenedor unos cientos
de MB por encima del heap.

---

## Compilación de binario local (opcional)

¿Prefiere un binario a Docker? El paquete npm es el mismo código:

```bash
npm install -g omniroute
omniroute
```

Esto ejecuta el servidor standalone de Next.js directamente en su host: mismos
puertos, mismo `DATA_DIR` (`./data` por defecto). Úselo cuando no pueda ejecutar
Docker (por ejemplo, una VM restringida). La vía del contenedor descrita arriba es
la opción predeterminada recomendada porque incluye el runtime exacto con el que se
probó la imagen.

Desde el código fuente (solo desarrollo; no es una vía de despliegue):

```bash
git clone https://github.com/diegosouzapw/OmniRoute.git
cd OmniRoute
npm install
npm run build && npm start
```

---

## Exposición más allá de localhost

**No** cambie `APP_BIND_HOST=0.0.0.0` mientras `REQUIRE_API_KEY=false`. Eso
publica un proxy `/v1` abierto en todas las interfaces LAN/WAN: cualquiera en la
red puede consumir las cuotas de sus proveedores. El orden es fijo:

1. Establezca `REQUIRE_API_KEY=true` en `.env`.
2. Lea `INITIAL_PASSWORD` en los logs e inicie sesión.
3. *Solo entonces* establezca `APP_BIND_HOST=0.0.0.0` (o ponga delante un reverse
   proxy que exija autenticación y mantenga loopback).

Para TLS / un dominio, ejecute Caddy o Traefik delante y deje `APP_BIND_HOST`
en `127.0.0.1`. Consulte las secciones
[DOCKER_GUIDE — Caddy HTTPS](../guides/DOCKER_GUIDE.md#docker-compose-with-caddy-https-auto-tls)
y
[Cloudflare Quick Tunnel](../guides/DOCKER_GUIDE.md#cloudflare-quick-tunnel)
para configuraciones de reverse proxy listas para copiar y pegar.

---

## Datos, copias de seguridad y restablecimientos

- **Directorio de datos**: `./data` (montado con bind en `/app/data`). Todas las
  bases de datos SQLite, migraciones, el rastro de auditoría y las claves cifradas
  de los proveedores residen aquí.
- **Copias de seguridad**: la copia automática de SQLite está activada por defecto
  (`DISABLE_SQLITE_AUTO_BACKUP` sin definir → activada). Para una instantánea manual:
  ```bash
  ./bin/snapshot-data.sh
  ```
  Restaure con `./bin/restore-data.sh`.
- **Restablecer la contraseña del dashboard**:
  ```bash
  docker exec -it omniroute node bin/reset-password.mjs
  ```
- **Restablecer las políticas** (enrutamiento/failover/cuota a los valores de fábrica):
  ```bash
  docker exec -it omniroute node bin/restore-policies.sh
  ```

---

## Problemas comunes

<details>
<summary><code>docker compose up</code> solo inicia Redis</summary>

Está ejecutando el `docker-compose.yml` **completo**, cuyos servicios de aplicación
están condicionados por profiles. Para la vía de un solo comando use el archivo de self-host:

```bash
docker compose -f docker-compose.selfhost.yml up -d
```

O, con el compose completo, elija un profile:
`docker compose --profile base up -d`.
</details>

<details>
<summary>El healthcheck se queda en <code>starting</code> / <code>unhealthy</code></summary>

- Compruebe que Redis esté activo: `docker inspect --format '{{.State.Health.Status}}' omniroute-redis`
- Compruebe los logs de la aplicación: `docker logs omniroute`
- El healthcheck envía un probe a `/healthz` y admite un periodo de arranque de 20 s. Un
  primer arranque lento (migraciones en frío) puede tardar más: aumente `start_period` en el
  archivo compose si su disco es lento.
</details>

<details>
<summary><code>FATAL ERROR: Reached heap limit</code> con coding agents</summary>

Aumente `OMNIROUTE_MEMORY_MB` en `.env` (p. ej. `4096`) y después ejecute
`docker compose -f docker-compose.selfhost.yml up -d`. Consulte
[Dimensionado del contenedor](#dimensionado-del-contenedor).
</details>

<details>
<summary>Los proveedores web-cookie (Gemini Web, Claude Turnstile) fallan con
<code>Executable doesn't exist at .../ms-playwright/chromium</code></summary>

La imagen `base` se entrega sin Chromium. El compose de self-host usa la imagen
`base` publicada. Para los proveedores web-cookie, cambie al compose completo
con el profile `web` (que incluye Playwright/Chromium):

```bash
docker compose --profile web up -d
```

Consulte [DOCKER_GUIDE — Available Profiles](../guides/DOCKER_GUIDE.md#available-profiles).
</details>

<details>
<summary>El puerto 20128 ya está en uso</summary>

Establezca `DASHBOARD_PORT`, `API_PORT`, `LIVE_WS_PORT` en `.env` a puertos libres y
vuelva a ejecutar `up -d`.
</details>

---

## Lo que esto deliberadamente NO es

Conforme a la restricción KISS de self-host, esta vía **no** incluye:

- ❌ Facturación SaaS / medición / niveles de plan
- ❌ Aislamiento multi-tenant / namespaces por tenant
- ❌ Un salto de procesamiento de prompts alojado (sus prompts van directamente al proveedor)
- ❌ Credenciales o secretos incorporados

Es un vehículo de **self-host puramente local**: lo más simple que hace real la
promesa "零月费 + 自托管".

---

## Lista de comprobación de seguridad (self-host)

Antes de exponerlo más allá de loopback:

- [ ] `REQUIRE_API_KEY=true` en `.env`
- [ ] `INITIAL_PASSWORD` rotado a un valor robusto y único
- [ ] `APP_BIND_HOST` dejado en `127.0.0.1` *salvo* detrás de un proxy que exija autenticación
- [ ] TLS terminado por Caddy/Traefik/Cloudflare delante (nunca HTTP plano en WAN)
- [ ] Redis no publicado en el host (el compose de self-host ya lo garantiza)
- [ ] Volumen `./data` con copia de seguridad periódica (`bin/snapshot-data.sh`)
- [ ] Claves de los proveedores rotadas según la política del propio proveedor

Para la dimensión completa de auditoría de cadena de suministro / imagen / dependencias, consulte
[SECURITY.md](../../SECURITY.md) y
[SUPPLY_CHAIN](../security/SUPPLY_CHAIN.md).

---

## Relacionado

- [Docker Guide](../guides/DOCKER_GUIDE.md) — profiles, Caddy HTTPS, túneles, etiquetas de imagen
- [Quick Start](./QUICK-START.md) — vía de 3 minutos para quienes empiezan
- [Free Tiers Guide](./FREE-TIERS-GUIDE.md) — más de 150 niveles gratuitos de proveedores
- [Providers Guide](./PROVIDERS-GUIDE.md) — conexión y configuración de proveedores
- [Troubleshooting](../guides/TROUBLESHOOTING.md) — resolución de problemas en profundidad
