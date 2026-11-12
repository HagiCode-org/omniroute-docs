---
title: "Vistas previas y escrituras de configuración de la CLI"
---

# Vistas previas y escrituras de configuración de la CLI

Las rutas autenticadas `/api/cli-tools/config` y `/api/cli-tools/apply` devuelven
vistas previas no almacenables en caché y con las credenciales ocultas. Conservan las comprobaciones
de autenticación y autorización existentes. Los cuerpos de las solicitudes rechazan los campos desconocidos. Una
URL base explícita debe usar HTTP(S) sin nombre de usuario ni contraseña incrustados; si se omite,
se utiliza la URL base configurada en el servidor.

Para una vista previa por lotes, `GET /api/cli-tools/config` acepta un parámetro de consulta `baseUrl`
opcional y toma la credencial de configuración del encabezado
`x-omniroute-config-api-key`. Las credenciales en la cadena de consulta se rechazan.
`POST /api/cli-tools/config` acepta `toolId`, `baseUrl`, `apiKey` y, de forma opcional,
`model` en su cuerpo JSON. Las respuestas usan `Cache-Control: no-store` tanto en las rutas de éxito
como en las de error. El texto de la vista previa no es una configuración utilizable que contenga credenciales.

La proyección de la vista previa oculta las credenciales serializadas del solicitante y los campos de credenciales
ya presentes en los profiles JSONC, TOML o YAML combinados. La ruta de aplicación escribe la
configuración original; la ocultación en la vista previa no altera los valores almacenados en disco.
El JSON mal formado se rechaza con 400. Las respuestas de error públicas usan la envoltura
de error estándar saneada.

Aplicar una configuración utiliza un archivo temporal privado en el directorio de destino,
lo vuelca a disco y lo renombra de forma atómica a su ubicación final. Los archivos y las copias de seguridad usan
el modo `0600`; los permisos se establecen en el descriptor propio antes del renombrado. Se rechazan los enlaces
simbólicos en el destino final y los archivos que no son regulares. Las lecturas de Codex y OpenCode
también rechazan los enlaces simbólicos en la ruta final antes de combinar el TOML/JSONC existente. Esto no
implica protección frente a un adversario que controle el directorio padre.

La protección de escritura del contenedor sigue activa: un destino efímero no seguro devuelve
422 e indica al operador que utilice el comando de configuración del lado del host. Una ejecución en seco sigue
disponible y no escribe archivos. Consulte [integraciones de CLI](../guides/CLI-INTEGRATIONS.md)
para ver los comandos de configuración del lado del host admitidos y
[saneamiento de errores](./ERROR_SANITIZATION.md) para el contrato de errores públicos.
