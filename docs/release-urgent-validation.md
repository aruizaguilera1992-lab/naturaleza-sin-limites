# Validación urgente previa al lanzamiento — 18 de octubre de 2026

## Autorización y límites

El promotor autorizó expresamente integrar #7 y #1–#6, en orden y con CI correcto
en cada paso. No autoriza despliegues, migraciones remotas, pagos reales ni correo
a clientes. El PR de inventario y recuperación #8 queda para revisión; no está
incluido en esa autorización de fusión. Los planes de entrenamiento quedan aparcados.

## Recuperación de base ficticia

Se reconstruyó nsl_rebuild_release_20261018 en PostgreSQL local: quince migraciones,
segunda pasada sin cambios, descuentos conservados, privacidad y carrera por las
últimas plazas correctas. El instalador rechaza bases existentes.

El nuevo ensayo de recuperación pasó en el CI 39119774363, commit
70e9818d0b246bb9b65fd42e50affbcc44cf6ee0, con los tres trabajos correctos.
Compara columnas, restricciones, índices, políticas RLS, permisos de relaciones
y funciones, vistas, triggers, permisos por defecto e historial. Compara también
los recuentos de todas las tablas inventariadas y comprueba que el origen no cambió.
No compara el contenido individual de todas las filas ni certifica propietarios,
usuarios y configuración global de otra instalación.

El ensayo usa pg_dump y pg_restore, destino nuevo y transacción de restauración.
El primer intento reveló que pg_dump sin --create no incluye los ajustes de la
base. Se exige y restaura expresamente search_path=public, extensions para esta
base ficticia, antes de comparar. No se silenció la diferencia del inventario.

Repetición en una máquina con clientes PostgreSQL compatibles:

```text
node scripts/rebuild-local-db.mjs --database nsl_rebuild_nombre_nuevo
node scripts/local-db/check-backup-restore.mjs --database nsl_rebuild_nombre_nuevo
```

Ambos comandos solo aceptan la instancia dedicada 127.0.0.1:55432 y nombres
nsl_rebuild_. El ensayo exige el marcador de base ficticia y rechaza un destino
de restauración existente. Informes y respaldo quedan bajo .tools/local-postgres,
ignorado por Git. Windows portátil no incluye pg_dump/pg_restore; allí no se
presenta como un ensayo completado. CI Linux sí ejecutó ambos programas.

## Condiciones pendientes para una base representativa

Antes de cualquier actualización real, obtener un inventario de solo lectura del
destino y una copia aislada sin datos personales, bajo autorización del titular.
Comparar tipos, defaults, RLS, permisos, funciones e historial con la reconstrucción;
investigar cada diferencia antes de DDL. Verificar restauración en otra base nueva
y documentar dónde está el respaldo, quién puede recuperarlo y cuánto tarda.
Ninguna prueba ficticia permite afirmar que producción coincide con el repositorio.

No renumerar una migración ya aplicada en un destino real sin revisar su historial.
Mantener 0012 de descuentos y 0013 de aforo: si existen grupos mayores de seis,
el preflight debe detenerse; no reducir reservas ni borrar datos automáticamente.
Coordinar el futuro despliegue de 0014, funciones y cliente que usa requestId.

## Revisión de configuración y dependencias

La comprobación local de secretos pasó sobre 607 rutas versionables: no detectó
credenciales locales conocidas ni PEM privados. Es una comprobación acotada, no
una certificación de todo el historial o de todos los posibles secretos.
Un cambio concurrente de main había añadido .env.production; el PR #2 lo retira
del versionado conservando la configuración local. El cliente usa una clave
publicable Stripe; no se trata como una clave secreta de servidor ni se inventa una
rotación remota. Las claves privadas deben permanecer en el backend autorizado.

npm audit sobre el lock de #6 devuelve diez entradas altas, cero moderadas y cero
críticas. Las causas directas son braces (GHSA-vfj7-8cjw-p6xm) y el cliente OAuth
de @modelcontextprotocol/sdk (GHSA-6qxp-vccf-f47h). No hay una actualización segura
automática indicada para el SDK; la sugerencia de npm para braces cambia la rama
mayor del paquete padre. No ejecutar audit fix --force para declarar el cierre.
Mantener la evaluación de alcance y compatibilidad de build-dependency-hardening.md;
las diez entradas no se presentan como diez vulnerabilidades públicas distintas
ni como resueltas. No habilitar nuevas rutas de entrada a esos componentes sin revisión.

## Publicación

build.yml permanece disabled_manually en GitHub, sin secretos FTP ni webhooks
activos observados. La retirada del paso FTP ya se integró mediante #7. Su CI de
prueba independiente compila sin publicar. No reactivar el workflow por conveniencia.
En Hostinger el registro confirmó cambio de contraseña FTP y eliminación de la
cuenta adicional. La cuenta principal sigue disponible con contraseña renovada.
Existe todavía una conexión GIT y un webhook de Hostinger: no invocarlo ni pulsar
Implementar. Su eliminación debe garantizar que no borra el contenido publicado.

El procedimiento comercial futuro debe publicar un artefacto aprobado y asociado
a un SHA, con revisión de configuración, ensayo de reserva/pago/correo y plan de
recuperación probado. Esta documentación no habilita publicación ni proveedores.
