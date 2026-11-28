# Validación urgente previa al lanzamiento — 18 de octubre de 2026

Actualización del 19 de octubre: cadena de integración autorizada completada.

| PR | Resultado de fusión | CI previo correcto |
| --- | --- | --- |
| #7 | fd6824eb32378e8a6c77129f2b470ed6b01dc63b | 39119570347 |
| #1 | 16e44b07a7a8d57bffdd17cc15a15a44ecbfce5f | 39119728284 |
| #2 | f3abe6a768cef55ee7be045377acbf0789a2f817 | 39119997507 |
| #3 | 6af2d4f06e594fd7767fef7a4ac92d59826adc9b | 39120098804 |
| #4 | 7c8c49f260b398ca66f533e38e9f7acfea000bf0 | 39120238543 |
| #5 | a455b32b438661703e12e1fad06c21ab3269d577 | 39120362235 |
| #6 | 4e12e2e1384b37f1d1c8556c5b08d048e4631075 | 39235734219 |

Se actualizaron las ramas con main, se conservaron los cambios concurrentes de
Lovable y se usaron commits de merge. No se borraron ramas. El CI de #6 corresponde
al head 522e465acfd1bf31e5d0732183ffee531dd75ac6 que ya incorpora los cambios de
main disponibles antes de la fusión. No se reutiliza el CI histórico de #6 para
justificar esa combinación. El PR #8 permanece sin fusionar.

Las once pruebas locales del guard de publicación pasaron; el control de secretos
pasó sobre 611 rutas versionables. No se ejecutaron despliegues, migraciones remotas,
pagos ni comunicaciones de clientes durante la integración.

## Decisiones y trabajo externo que siguen abiertos

- Main no tiene una nueva regla de protección impuesta por esta tarea. Exigir PR
  para todo push podría bloquear el flujo de edición directa de Lovable observado
  durante la integración. Definir primero el flujo de trabajo y cualquier excepción
  limitada de la aplicación; no conceder bypass indiscriminado ni activar reglas
  incompatibles silenciosamente. Los checks en PR existen, pero no son aún una
  obligación impuesta por protección de rama.
- La conexión GIT/webhook de Hostinger sigue pendiente de retirada o desactivación
  verificada sin pérdida de archivos. No se invocó su URL de despliegue.
- Antes de publicar faltan copia aislada representativa, respaldo recuperable del
  destino real y autorización separada para 0013/0014. La comparación de metadatos
  remotos del 18 de octubre no sustituye ese respaldo ni un preflight nuevo.
- Revisar acceso al conector Resend y probar correo solo a un buzón propio autorizado.
- Completar prueba real de Stripe sandbox de extremo a extremo con plazas, fallos,
  retorno y webhook; los proveedores simulados no certifican el servicio integrado.
- Las dependencias residuales siguen documentadas, sin declarar audit limpio.

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

## Servicios integrados de Lovable: lectura del panel real

Se consultó el proyecto existente e8067521-0f87-494a-b789-e89c9f7b9922 en el
navegador, sin enviar instrucciones al agente de Lovable ni publicar:

- Cloud muestra Database, Users, Storage, Emails, Secrets, Jobs y Edge functions.
  Esto confirma disponibilidad de servicios, no prueba cada regla o dato remoto.
- Cloud / Emails ofrece Get started. Es una función diferente del conector Resend
  que utiliza el código. No iniciar otro servicio para duplicar los correos actuales.
- Conectores muestra la conexión privada Resend del titular y el aviso
  «Este espacio de trabajo no tiene acceso a esta conexión», con botón Conceder acceso.
  No se pulsó: ampliar permisos requiere revisar destinatario, alcance y autorización.
  El aviso no prueba por sí solo el estado de credenciales en funciones ya desplegadas;
  impide dar por verificada una conexión utilizable desde este espacio de trabajo.
- Pagos tiene vistas Live y Test. Se consultó Test y coincide con la cuenta sandbox
  anteriormente revisada. Las cuentas de ambas vistas son diferentes, lo cual se
  confirmó como separación de prueba/real; no se creó ninguna operación ni se
  activaron cobros. Ver Live en un panel no acredita que checkout comercial funcione.
- Seguridad muestra No active issues y un hallazgo ignorado informativo sobre
  teléfonos en business_settings. Revisar que sean solo contactos empresariales
  destinados a publicación antes de considerarlo aceptado. No se cambió su estado.
  El panel también informa avisos de dependencias; su fuente puede diferir del lock
  auditado. No confundir «sin incidencias activas» con «sin avisos ignorados/dependencias».

Se conserva Lovable como plataforma de servicios de la aplicación. PostgreSQL local
y los proveedores simulados son herramientas de ensayo, no una sustitución de Cloud.

## Inventario remoto de solo lectura

La API de Lovable confirmó enabled=true, stack=supabase, y proyecto sin publicar.
Se ejecutaron únicamente SELECT de metadatos y un recuento agregado, sin mostrar
reservas, contactos, tokens ni valores de secretos y sin ejecutar funciones de negocio.

La base real registra trece migraciones Drizzle, hasta 0012_add_booking_discount_percent.
Los trece timestamps y hashes coinciden con los archivos del repositorio en formato
LF. La primera comparación con el checkout Windows difería por CRLF, no por SQL
distinto. Se añade .gitattributes para conservar LF en SQL Drizzle en ambas plataformas;
no se edita el SQL histórico ni se reescribe el historial de la base.

Todavía no existen deposit_intents/create_deposit_intent en el inventario consultado;
0013 y 0014 están pendientes de aplicación remota. La restricción antigua de aforo
permite hasta veinte. El recuento de salidas con aforo/ocupación superior a seis o
con ocupación superior al aforo fue cero. Esto permite preparar el siguiente ensayo,
pero no sustituye repetir el preflight inmediatamente antes de una migración autorizada.

Las nueve tablas públicas consultadas tienen RLS activado. Los RPC de preparación
de checkout y reserva no permiten ejecución a anon; anon solo tiene SELECT sobre
la vista pública en el conjunto de tablas de reservas/pagos/eventos revisado. No se
certifican todas las políticas ni se presenta como un nuevo escaneo exhaustivo.
La copia representativa sin datos personales y su recuperación siguen pendientes;
no se copió producción ni se aplicó ninguna de las dos migraciones pendientes.
