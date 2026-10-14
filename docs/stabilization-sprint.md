# Sprint de estabilización

## Configuración y revisión de secretos

Se revisaron las versiones históricas rastreadas de `.env` y `.env.development`: configuración pública de Supabase (JWT con rol `anon`) y clave pública Stripe de pruebas. No se encontraron claves secretas de servidor en esos archivos. Esta revisión no certifica el resto del historial ni los secretos del proveedor. No se registran valores en este informe.

Los archivos locales dejan de rastrearse; usar `.env.example` como plantilla. Antes de integrar el PR, configurar las variables públicas en el entorno de compilación: la eliminación afecta a instalaciones que dependan de los archivos comprometidos. Los secretos del servidor deben permanecer en el almacén de secretos de Supabase/Lovable.

## Capacidad

Panel y diseñador de packs: máximo seis. La nueva migración Drizzle `0012_capacity_max_six` impone el límite en la tabla y en la RPC de reserva manteniendo los permisos exclusivos de `service_role` y el bloqueo de filas. Si existen salidas con capacidad superior a seis, aborta antes de modificar datos. Revisar esas salidas y sus reservas manualmente; no reducir automáticamente grupos ya reservados. No se ha aplicado ninguna migración remota.

## Stripe y Resend

`PAYMENTS_LIVE_ENABLED` ausente o distinto de `true` bloquea creación de sesiones y solicitudes de depósito reales. Sandbox sigue disponible con las credenciales existentes. No se actualizan SDK ni versión de API en este cambio incremental. Los webhooks siguen procesando eventos firmados existentes y comprueban que `livemode` coincide con el entorno; no se bloquean confirmaciones de pagos anteriores.

`EMAIL_DELIVERY_MODE` ausente deshabilita envíos. En pruebas, configurar `test` y `EMAIL_TEST_RECIPIENTS` como lista de buzones autorizados separados por comas. Si algún destinatario no figura en esa lista, se omite el envío completo. `live` permite envíos y requiere aprobación previa del propietario. No habilitarlo como parte de este sprint. Los resultados omitidos quedan registrados y pueden reintentarse: revisar notificaciones pendientes antes de habilitar envíos. Se mantienen persistencia previa, lease e idempotencia; los errores de Resend ya no guardan ni imprimen el cuerpo de respuesta del proveedor.

## Validación antes de activar servicios

Las pruebas usan simulaciones sin acceder a cuentas, cobrar o enviar correo. Verificar después, con aprobación y en un entorno aislado, credenciales sandbox, firma y reintentos de webhooks, precios existentes, retorno del checkout y un buzón autorizado de Resend. No presentar las pruebas locales como una comprobación completa del entorno desplegado.

## Resultado de comprobaciones

- Vitest: cuatro pruebas correctas.
- Deno: 57 pruebas correctas (depósitos, elegibilidad, checkout, Resend, firma de webhook y capacidad en PostgreSQL embebido). Sin permisos de red durante la ejecución de las pruebas; solo descarga de módulos.
- Compilación Vite correcta; avisos existentes por un recurso remoto y tamaño del paquete.
- Los 28 errores de tipos de Supabase de la versión original se corrigieron al especificar el esquema del cliente del webhook y reflejar la nulabilidad real de la RPC SQL en un tipo local del servidor. La comprobación de las cinco funciones de pagos pasa y se añade como paso obligatorio de CI.
- El análisis de estilo mantiene errores anteriores al sprint.
- `package-lock.json` se alineó con el manifiesto, incorporando las seis dependencias directas que faltaban y sus transitivas. Se conservaron las versiones de las dependencias directas existentes. CI usa `npm ci` para exigir instalaciones reproducibles.
- Las comprobaciones de PR no despliegan ni reciben secretos. El despliegue existente solo se dispara al actualizar `main`; no integrar este PR hasta aprobar la configuración y la migración.

La revisión de solo lectura de los proveedores está en [sandbox-readiness.md](sandbox-readiness.md): faltan precios de pruebas, el código del PR no está desplegado y el aislamiento de la base de datos aún no se ha confirmado.
