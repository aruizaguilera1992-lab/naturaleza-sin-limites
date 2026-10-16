# Línea base local reproducible — NSL

## Alcance

Esta línea base reconstruye una base PostgreSQL nueva para pruebas desde los SQL disponibles del repositorio. No representa un dump de producción, no repara su historial y no es una migración desplegable. Depende de la preparación del Sprint C (PR #3).

Los intentos estrictos desde cero revelaron que faltan dos definiciones anteriores: la creación de contact_submissions y la creación de bookings.discount_cents. Por eso se mantienen fuera de supabase/migrations y drizzle/migrations, en scripts/local-db/before-supabase.sql y before-drizzle.sql. Los SQL históricos conservan sus bytes y orden.

## Contenido explícito

- platform.sql: roles de pruebas preparados por el constructor, pgcrypto, esquemas auth/extensions, tabla auth.users y función auth.uid mínima que lee claims de sesión. No hay servidor Auth, validación JWT ni usuarios reales.
- before-supabase.sql: contact_submissions mínima según los tipos del repositorio, con RLS habilitado; las migraciones posteriores completan columnas y políticas.
- before-drizzle.sql: discount_cents integer NOT NULL DEFAULT 0, preexistencia que presupone 0012. No se infiere que este DDL coincida exactamente con la instalación real.
- Once SQL Supabase por su orden de nombre, seguidos del ejecutor Drizzle nativo y su journal de 14 entradas. La conexión utiliza el search_path public,extensions que esperan esos SQL.

## Uso local

Requiere la instancia PostgreSQL dedicada ya preparada en 127.0.0.1:55432 y sus credenciales locales en .tools/local-postgres/credentials.local.json. Esa carpeta queda excluida por .gitignore, incluidos binarios, cluster, reportes y contraseñas. El constructor no carga .env ni acepta DATABASE_URL o LOVABLE_DB_MIGRATION_URL.

Comandos desde el repositorio:

    node --test scripts/local-db/target.test.mjs
    node scripts/rebuild-local-db.mjs --database nsl_rebuild_nombre_nuevo
    node scripts/local-db/check-existing.mjs --database nsl_rebuild_nombre_nuevo

El destino se restringe a 127.0.0.1:55432, usuario nsl_local_admin y nombres nsl_rebuild_ válidos. Las opciones arbitrarias de conexión no se propagan. Una base existente se rechaza antes de crear roles o ejecutar DDL; no hay reset ni DROP DATABASE. Si falla una reconstrucción, se conserva la base y un informe con la fase del fallo: se inspecciona y se elige otro nombre, sin sobrescribirla.

El constructor crea roles locales NOLOGIN cuando faltan. postgres es un propietario superusuario local sin login para reproducir la vista que exige ese propietario; service_role usa BYPASSRLS. No conectar la web usando el administrador ni convertir estos roles en usuarios de aplicación.

Cada ejecución escribe un informe nuevo sin contraseña en la carpeta local ignorada: archivos/huellas de fixtures y Supabase, hashes/marcas temporales de Drizzle, controles y fallo si lo hay. No se sobreescriben informes previos. No publicar el archivo de credenciales.

## Validación incorporada

1. Reconstrucción completa con el controlador postgres-js y Drizzle instalado en el lock del proyecto.
2. Segundo pase sin duplicar entradas ni cambiar el historial.
3. Comparación de las columnas de las nueve tablas con los tipos generados. No certifica tipos SQL, defaults, índices, triggers ni equivalencia RLS con producción.
4. Regresión existente step1_event_privacy.sql con auth.uid local: anon, authenticated y service_role, vista pública y datos privados.
5. Dos conexiones PostgreSQL distintas compiten por las últimas plazas mientras una transacción mantiene el bloqueo: una gana y otra recibe sin_plazas; no se superan seis.
6. Liberación real de holds caducados y conservación de descuentos ficticios.
7. Preflight de solo lectura y limpieza de reservas de prueba.
8. Rechazo verificable de una base existente conservando recuentos de tablas, historial y reservas.

La prueba de bloqueo usa un retardo de 250 ms y timeout de sentencia de cinco segundos. Es un caso concreto de concurrencia, no una prueba de carga ni certificación de todos los órdenes de bloqueo.

## CI y resultados locales

CI añade PostgreSQL 16.14 desechable en un job separado. Su contraseña fija es solo de fixture efímera, no una credencial de aplicación o producción. La conexión se restringe al puerto local dedicado y no recibe secretos de los proveedores.

En Windows, nsl_rebuild_baseline_20261016 se creó desde cero con la línea base explícita: 14 migraciones, nueve inventarios de columnas, privacidad, concurrencia, expiración y preflight correctos. Un intento posterior sobre el mismo nombre fue rechazado conservando los recuentos. Las pruebas de validación de destino y ESLint de los scripts pasan. El resultado del CI y SHA final se registran en el PR.

## Qué falta para conectar una aplicación aislada

El navegador usa supabase-js, que necesita API HTTP de Supabase, Auth y las Edge Functions; no puede conectarse directamente a PostgreSQL. Esta línea base SQL no añade esas piezas. Las .env actuales y supabase/config.toml siguen sin cambios, por lo que arrancar la web existente no constituye una prueba aislada.

La siguiente fase necesita un stack local de Supabase con runtime de contenedores o un adaptador de pruebas explícito. Docker/WSL no estaban instalados y no se han instalado en esta fase. No simular acceso admin ni desactivar permisos para hacer funcionar la web. Antes de arrancar ese stack: proyecto y puertos locales distintos, variables del navegador locales, proveedores deshabilitados por defecto y verificación de que ningún endpoint pertenece a producción.

Esta preparación cierra la reproducibilidad de la línea base de pruebas, no la validación del esquema real, autenticación, pagos o correo del sitio desplegado. Los PR siguen sin fusionar; main y su despliegue no se tocan.
