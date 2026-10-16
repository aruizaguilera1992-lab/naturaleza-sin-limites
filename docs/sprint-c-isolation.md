# Sprint C — procedimiento de aislamiento y validación

Fecha: 16 de octubre de 2026. Base: PR #2, b293344cf20d974145d389612ec1b7dc4a9fe5db. Este cambio prepara la validación; no declara completado el Sprint C contra una copia real.

Antonio ha indicado que todavía no existe una copia anonimizada ni un entorno de pruebas separado. No se ha conectado a producción. En este equipo no se han encontrado Docker, psql, pg_dump ni PostgreSQL como comandos disponibles; no se han instalado ni provisionado servicios.

## Qué queda disponible ahora

- PostgreSQL embebido en memoria, con tablas mínimas y datos completamente ficticios. Cada caso crea y destruye su propia base; no lee URL de conexión ni credenciales de proveedor.
- Cinco casos para historial/rollback/preflight y un caso con 14 comprobaciones SQL del checkout, incorporados a CI.
- Preflight en supabase/tests/sprint_c_preflight.sql: transacción READ ONLY terminada con ROLLBACK. Devuelve presencia de objetos, historial de hashes/marcas temporales, metadatos de columnas, restricciones y recuentos agregados de capacidad. No selecciona nombres, contactos, IDs de clientes, tokens de pago ni secretos. Una tabla de historial ausente se comunica; nunca se crea para ocultar el problema.

## Procedimiento cuando se prepare el entorno aislado

### 1. Identificar el destino antes de conectarlo

Registrar en una ficha interna: nombre del entorno, identificador del proyecto o instancia, responsable y fecha. Debe tener base, claves y almacenamiento separados de producción. No basta con una nueva rama Git, otro dominio o activar Stripe test mientras la URL de la base sigue siendo la real.

Usar una instancia local o un entorno de pruebas separado del proyecto existente; la elección y puesta en marcha se harán después. No copiar archivos .env de producción a la web de pruebas. Guardar credenciales de servidor fuera de Git y fuera de variables VITE_. El trabajo actual no necesita ninguna.

### 2. Aislar efectos externos

Antes de arrancar funciones, dejar PAYMENTS_LIVE_ENABLED=false y EMAIL_DELIVERY_MODE=disabled, sin claves de pagos reales ni destinatarios reales. No programar tareas, reintentos de notificación ni webhooks hacia producción. Usar registros ficticios y buzones de ejemplo; los tests actuales simulan Stripe/Resend y window.open.

No copiar colas de notificaciones, objetos de autenticación, buckets, secretos del sistema ni sesiones de pago reales. La base aislada no debe tener salida operativa que pueda cobrar o contactar a nadie.

### 3. Preparar una línea base verificable

Primera opción: restaurar únicamente el esquema necesario de una exportación autorizada y añadir datos ficticios. Si se necesita reproducir una incidencia histórica, preparar primero una copia anonimizada controlada, sin publicar dumps ni adjuntarlos al PR. No copiar datos de clientes al repositorio.

Mantener un registro de origen/fecha, versión PostgreSQL, extensiones, esquema y método de exportación/restauración. Conservar un punto restaurable y comprobar la restauración en el entorno aislado antes de probar migraciones. La preparación de esa exportación y del destino no se ha ejecutado en este sprint.

### 4. Ejecutar el preflight en el destino identificado

Revisar el resultado de sprint_c_preflight.sql y cotejarlo con drizzle/migrations/meta/_journal.json y los SQL revisados. El archivo es para un destino elegido expresamente; no se ejecuta automáticamente al abrir la web ni en bases remotas desde CI.

Detener la validación si falta la línea base, no se reconoce el runner/historial, hay hashes inesperados o marcas temporales posteriores/desordenadas, o existen salidas de más de seis. Los recuentos no identifican qué reserva resolver: cualquier decisión sobre grupos existentes requiere revisión interna sin exponer datos personales.

Drizzle usa la última marca temporal para decidir qué ejecutar; la mera existencia de una fila/hash no certifica equivalencia de esquema. No borrar ni editar el historial para forzar el resultado. Los hashes dependen de los bytes/fin de línea del SQL aplicado: conservar la evidencia del archivo usado, no normalizar un historial remoto a ciegas.

### 5. Ensayar con el runner y controlador reales

Sobre el respaldo restaurable aislado, ejecutar únicamente las migraciones pendientes que corresponden al historial comprobado. Conservar la transacción y el orden 0012 descuentos → 0013 capacidad. Comparar antes/después: número de reservas y enlaces, participantes, plazas reservadas, descuentos y permisos RPC. Repetir sin cambios debe dejar estable el historial.

En una segunda base ficticia con capacidad 20, verificar que la ejecución falla por Oversize outings exist y no modifica datos ni añade entradas al historial. No recortar plazas ni cancelar reservas como parte de la migración. Verificar además permisos anon/authenticated/service_role.

El comando concreto del runner para esa instancia se cerrará cuando se identifique la herramienta real y el destino. No se ofrece un comando con LOVABLE_DB_MIGRATION_URL heredada: drizzle.config.ts acepta esa variable y podría apuntar a producción.

### 6. Validar el recorrido completo solo en sandbox

Tras confirmar el aislamiento, comprobar salida publicada → bloqueo de plazas → checkout sandbox → webhook firmado de pruebas → confirmación de reserva → reintento sin duplicado. Casos de control: falta de plazas, bloqueo caducado, cancelación de salida, nueva generación tras extensión, firma/entorno incorrectos y retorno de autenticación.

Comprobar con dos conexiones PostgreSQL reales las últimas plazas concurrentes. PGlite no certifica concurrencia entre conexiones ni bloqueos en el despliegue. Los proveedores reales, incluso de pruebas, no se han usado en esta preparación. Antes de cualquier envío posterior, usar solo buzones expresamente autorizados.

## Resultado de pruebas locales

- migration_history.test.ts: casos anterior a 0012, descuentos ya aplicados, antigua capacidad con timestamp anterior, rollback transaccional ante capacidad 20 y preflight en base vacía/existente. Conserva descuentos fijos/porcentuales, plazas, enlaces confirmados y permisos. Un segundo pase no duplica historial.
- prepare_deposit_checkout.test.ts: convierte el antiguo script aislado en prueba Deno con cierre de base, sin process.exit; sus 14 comprobaciones cubren expiración estable, una sola extensión, reintentos, caducidad, liberación, cancelación, proximidad de salida, sesión existente, rangos y permisos.
- La prueba de historial usa readMigrationFiles/PgDialect de Drizzle 0.45.2 con el SQL exacto. El adaptador preparado nativo de PGlite rechaza los archivos existentes con varias sentencias sin breakpoints. Para no alterar migraciones previas, el test usa un puente de consulta simple conservando la planificación, hashes y transacción de Drizzle. No valida el transporte del controlador de producción ni una restauración completa desde cero.
- El esquema de prueba es mínimo y release_expired_event_holds es un stub explícito en los casos de historial. Las pruebas existentes del servidor cubren otros caminos; este test no valida por sí solo toda la liberación ni pagos.
- No se modifica ninguna migración, RPC de producción ni configuración de pagos en este PR.

## Criterio de salida y próximos datos necesarios

La preparación local puede revisarse con CI correcto. Para declarar Sprint C validado faltan: destino aislado identificado, esquema/historial de línea base comprobados, respaldo/restauración verificados, runner real, prueba de concurrencia y recorrido sandbox autorizado. No fusionar los PR #1/#2 ni este cambio para conseguirlo: main activa despliegue.

Para reproducir las pruebas locales, usar las listas Deno de .github/workflows/stabilization-checks.yml. CI nunca recibe una URL de base de datos. Este PR se revisa contra fix/sprint-b-security y no se fusiona ni retargetea automáticamente.

Validación local final: batería ampliada de servidor/base de datos 87/87 correcta. Los nuevos escenarios son adicionales a las 81 pruebas del Sprint B. El CI completo y su SHA final se registran en la descripción del PR.
