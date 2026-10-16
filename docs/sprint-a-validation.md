# Sprint A — integración y validación

Fecha: 16 de octubre de 2026. Rama: fix/stabilization-capacity-sandbox (PR #1).
Base incorporada: d04930abf68ce196d40eb627d11c168291216504 (main).
Punto de partida del PR: f66484371788f3f511fd2545a78d771fb672dde8.

## Resolución de migraciones sin correcciones automáticas de datos

Se conserva intacta la migración de main 0012_add_booking_discount_percent.sql, su snapshot y su entrada del journal (idx 12, when 1792062004750). La migración del PR se renombra 0013_capacity_max_six.sql, conservando su SQL, con idx 13 y when 1792108800000. Drizzle decide qué aplicar por la marca temporal: cambiar solo el nombre dejando la marca antigua podría omitir capacidad en bases con descuentos ya aplicados.

Se incorpora main mediante merge en la rama del PR, sin reescribir su historial. Se conservan los cambios recientes de reservas, descuentos, autenticación y correos por gateway, junto con el tipado ServerDatabase y los bloqueos de pagos reales y entrega de correo del PR.

La migración 0013 no elimina registros ni reduce plazas. Si existe capacity_total > 6, aborta. Las pruebas verifican que quedan intactos capacidad, plazas reservadas y descuentos; también ejecutan 0012 seguida de 0013, comprueban límites y permisos de la RPC. No equivalen a una migración completa de una copia de producción ni a una prueba de concurrencia entre conexiones reales.

## Revisión limitada de entorno y secretos

- Solo .env.example está rastreado; .env y .env.development locales están ignorados, sin modificación de valores.
- Se inspeccionaron las tres revisiones que cambian esos archivos en el historial local disponible (dos contenidos distintos): identificadores públicos Supabase, JWT con rol anon y clave pública Stripe test. No se encontraron secretos de servidor en ellos.
- Búsqueda de patrones en archivos actuales rastreados: sin coincidencias para claves secretas Stripe, firmas whsec, tokens GitHub, sb_secret o cabeceras de claves privadas. No cubre credenciales arbitrarias, ramas no descargadas, todo el historial de otros archivos ni almacenes remotos. No es una auditoría integral Codex Security.
- No se imprimen valores de credenciales en la documentación. Una clave pública anon exige políticas RLS correctas; su carácter público no certifica dichas políticas.
- CI de PR usa permisos contents:read, sin secretos de aplicación ni pasos de despliegue. El workflow existente build.yml despliega al actualizar main: no fusionar ni actualizar main como parte de este sprint.

## Pruebas

- Instalación limpia: npm ci correcto (610 paquetes instalados).
- Cliente: 65/65 pruebas Vitest, ocho archivos.
- Servidor y PostgreSQL embebido: 81/81 pruebas Deno, sin permisos de red durante ejecución.
- Deno check: siete funciones correctas (depósitos, planes, portal, enlaces manuales, solicitudes, consulta de pago y webhook).
- Compilación Vite correcta; avisos de recurso remoto sin resolver en compilación, Browserslist antiguo y tamaño del paquete.
- ESLint: 69 errores y 12 avisos en el árbol integrado. No se presenta lint como correcto; la limpieza general queda pendiente y no es un paso obligatorio de este CI.
- npm audit: 50 avisos (1 bajo, 12 moderados, 34 altos y 3 críticos). Paquetes con severidad crítica: proxy-addr y tinypool transitivos; vitest directo de desarrollo. El inventario no demuestra explotabilidad en producción. Evaluar cadenas de dependencia y correcciones en un cambio separado antes de publicar; no se ejecuta audit fix.
- CI remoto: se comprobará sobre el SHA final del PR; su resultado y enlace se consignan en la descripción del PR. El workflow ampliado no despliega.

Comandos reproducibles: npm ci; npm test; npm run build; npm run lint; npm audit. Para comprobaciones Deno, usar las listas exactas del workflow .github/workflows/stabilization-checks.yml. Runtime local: Node 24.19.0 y Deno 2.5.4; CI usa Node 22 y Deno 2.5.4. Las dependencias Deno se descargan antes de las pruebas; el código probado no recibe --allow-net.

Ajustes de integración: pruebas de Login usan el nombre accesible actual del botón; prueba de correo simula ambas claves del gateway y verifica URL, cabeceras e idempotencia; fixture de enlace manual exige actividad antes de renderizar. Se amplía CI a los correos/enlaces manuales nuevos de main y a siete funciones del servidor. Se sincroniza package-lock con @testing-library/dom declarado por main (10.4.2), sin actualización general de dependencias.

## Validación posterior antes de cualquier migración o activación

1. Confirmar el SHA revisado y CI correcto. Verificar que main no haya avanzado después de esta integración.
2. En un entorno aislado autorizado, restaurar una copia con respaldo verificable. Consultar en modo solo lectura el historial drizzle.__drizzle_migrations (hash y created_at), la columna bookings.discount_percent y las restricciones de activity_events. No cambiar ni borrar el historial para forzar la ejecución.
3. Ejecutar supabase/tests/capacity_preflight.sql en esa copia. Si hay salidas de más de seis, detenerse y decidir manualmente cómo atender reservas existentes. No recortar participantes ni cancelar reservas automáticamente.
4. Si algún entorno ya aplicó la antigua 0012_capacity_max_six, cotejar su SQL/hash y timestamp con este PR antes de ejecutar nada. La nueva marca está después de ambas 0012; no asumir que renombrar equivale a reparar el historial remoto. Drizzle estándar ejecuta las migraciones pendientes en una transacción: conservar esa garantía.
5. Con autorización separada, probar en la copia ambas migraciones pendientes, conservación de reservas/descuentos y permisos anon/authenticated/service_role; repetir preflight inmediatamente antes de una futura aplicación aprobada.
6. Configurar las variables públicas de compilación fuera de Git. Mantener PAYMENTS_LIVE_ENABLED desactivado y EMAIL_DELIVERY_MODE deshabilitado; no activar live. Validar proveedores solo en sandbox aislado y correo solo a buzones autorizados, con aprobación posterior. Revisar notificaciones pendientes antes de activar entrega.

## Riesgos y límites

- Un cambio de rama del PR y CI no valida producción ni autoriza fusionar. No se ejecutaron migraciones remotas, pagos, correos ni despliegues.
- El SQL de capacidad puede bloquear DDL durante una futura migración; planificar ventana, respaldo y recuperación. El rollback de la base tras una aplicación confirmada requiere un plan separado, no borrar filas del journal.
- El diseñador personalizado CustomPackDesignerModal conserva un selector histórico de hasta 20 participantes. No cambia la RPC de reservas, pero merece revisión comercial/técnica separada; este sprint no afirma que todas las solicitudes personalizadas estén limitadas a seis.
- El aislamiento de proveedores y los bloqueos operativos pendientes descritos en sandbox-readiness.md siguen sin validación remota actual.
