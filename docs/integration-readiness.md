# Preparación de integración — 17 de octubre de 2026

## Estado y decisión actual

No se autoriza ninguna fusión ni despliegue. main sigue en
d04930abf68ce196d40eb627d11c168291216504 y su workflow vigente publica por FTP
al recibir un push. Esta rama propone retirar ese paso, sin usar sus secretos,
sin añadir una publicación manual y sin modificar datos o servicios externos.
La protección NO estará activa en main hasta que este PR se revise y se fusione
con autorización explícita. Las pruebas no sustituyen esa autorización.

La revisión actual es de preparación: identidad de ramas, relación entre PR,
historial, CI y rutas de publicación en Git. No es una nueva auditoría exhaustiva
del conjunto ni una inspección de las cuentas de hosting, Lovable o GitHub.

## Cadena comprobada

Los seis PR están abiertos, no fusionados y GitHub declara mergeable=true para
cada comparación actual. Se comprobó CI correcto sobre estos heads exactos:

| PR | Base actual | Head revisado | Ejecución correcta |
| --- | --- | --- | --- |
| #1 | main | 8532f6d57eb6b9b862adba531a86bad75a6d77fe | 38879223537 |
| #2 | fix/stabilization-capacity-sandbox | b293344cf20d974145d389612ec1b7dc4a9fe5db | 38882301830 |
| #3 | fix/sprint-b-security | 06c8a35547365a13e57a0cf1a67db561ff4a5096 | 38883926815 |
| #4 | test/sprint-c-isolated-bookings | d35983be7bab639c390376c435e8adb7627ddcd7 | 38886010787 |
| #5 | test/local-schema-baseline | 8a3eacfe8918678284f5b30c6d64f60a1b895dc4 | 39022110818 |
| #6 | test/local-booking-validation | 47f95e110c100ea2d4e74edfec7e67c2ad725ac3 | 39023590210 |

Los resultados anteriores no certifican una futura combinación con otro main.
No son seis cambios intercambiables: cada PR depende del anterior. Ninguno de
ellos modifica build.yml; por eso la protección se propone en un PR independiente
basado directamente en main, que puede revisarse antes de la cadena funcional.

## Barrera propuesta

build.yml conserva push a main y añade pull_request a main y workflow_dispatch,
pero sus únicos pasos son checkout sin credenciales persistentes, Node 22,
npm install, comprobación de política y npm run build. Token contents:read; ningún
paso FTP, credencial de despliegue, subida de artefacto ni trabajo de publicación.
workflow_dispatch también compila únicamente: no ofrece parámetro para publicar.

La política estructural comprueba el YAML real, permite solo esos eventos,
permisos y pasos y rechaza trabajos adicionales, secretos, comandos encadenados,
permisos de escritura y eventos privilegiados. Once pruebas incluyen controles
negativos. Son detección de regresiones, no un mecanismo de autorización que
resista a alguien con permiso para cambiar a la vez el workflow y su comprobación.
El paquete yaml ya está en el lock de main y se instala con npm install; no se añade
ni actualiza ninguna dependencia en este PR.

El primer CI del guard con npm ci falló porque el lock vigente de main no incluye
dependencias declaradas en package.json. Para no introducir aquí la corrección
de dependencias que ya preparan los PR siguientes, se conserva npm install del
workflow original. La instalación no es reproducible y puede resolver versiones
permitidas nuevas dentro del runner; no se presenta como una certificación del
lock ni se incorpora el lock generado por CI. Tras integrar la estabilización,
preparar otro cambio revisado a npm ci. Los checks de estabilización ya lo usan.

Esta barrera se limita a este workflow del repositorio. Antes de autorizar
cualquier futura modificación de main, revisar otras automatizaciones, webhooks,
sincronización Lovable, hosting, reglas de rama y permisos de revisión. No se ha
confirmado que esos canales externos carezcan de publicación automática.

## Secuencia futura, todavía no ejecutada

1. Revisar este PR independiente y los canales externos de publicación. Solicitar
   autorización concreta para integrarlo; el acuerdo de no fusionar sigue vigente.
2. Tras una eventual integración autorizada, comprobar el YAML presente en main
   y la ejecución real: solo instala, prueba la política y compila. No basta que
   el PR tenga CI correcto o que el nombre del workflow diga que no publica.
3. Revisar e integrar, solo con autorización, #1, #2, #3, #4, #5 y #6 en ese orden.
   Preferir commits de merge que conserven la ascendencia de esta cadena; no
   hacer squash/rebase automático ni borrar ramas que aún sean base de otro PR.
4. Después de cada dependencia integrada, actualizar la rama siguiente con main,
   revisar el diff resultante y retargetearla a main solo cuando se autorice.
   Volver a comprobar CI sobre su nuevo SHA y confirmar que build.yml conserva
   la barrera. No reutilizar checks de los SHA de la tabla para ese nuevo estado.
5. Detener ante cualquier conflicto de migraciones, identidad, reservas o
   despliegue. No resolver conflictos aceptando automáticamente una rama.
6. Mantener la publicación detenida hasta terminar las validaciones externas y
   revisar un nuevo procedimiento de despliegue autorizado. No restablecer FTP
   mediante una simple reversión de este PR: eso reactivaría publicaciones.

## Trabajo restante por área

| Área | Puede prepararse ahora | Requisito para el ensayo real |
| --- | --- | --- |
| Avisos de dependencias | Mantener seguimiento de las dos causas y las diez entradas de #6 | Cambio compatible de proveedor/arquitectura; no forzar un override para ocultar audit |
| Stripe | Revisar contrato, importes, idempotencia, webhook y matriz de pruebas con dobles | Cuenta sandbox y secretos de esa cuenta, backend de pruebas aislado, catálogo y fiscalidad verificados; sin claves live |
| Correo | Revisar allowlist, deduplicación y comportamiento de fallos con doble | Buzón propio identificado y autorizado, gateway y claves del entorno de prueba; ningún destinatario cliente |
| Migraciones | Conservar SQL históricos y pruebas de los 15 pasos; preparar comparación de inventarios | Copia aislada representativa sin datos personales, respaldo comprobado y destino aprobado; no copiar producción desde esta tarea |
| Planes/suscripciones | Revisar catálogo y probar contratos con dobles | Precios sandbox disponibles y reglas del plan de seis meses confirmadas |
| OAuth | Revisar callbacks internos, consentimientos y roles; pruebas locales existentes | Proveedor de pruebas y callbacks aprobados para el entorno aislado; sin ampliar permisos en producción |

La comprobación de sandbox del 14 de octubre es histórica, no un estado actual
de la cuenta. Las pruebas locales y simuladas no prueban 3DS, entrega real de
correo, renovaciones, portal ni retorno OAuth de un proveedor externo.

### Catálogo sandbox comprobado de nuevo el 17 de octubre

Consulta exclusivamente de lectura al entorno de pruebas de Naturaleza sin
Limites, livemode=false. Se buscaron las seis lookup keys activas del catálogo;
la respuesta completa (has_more=false) contiene dos precios, ambos en EUR:

| Lookup key | Código actual | Precio activo encontrado |
| --- | --- | --- |
| aventurero_1_semana_mensual | 119 EUR/mes | No encontrado |
| aventurero_2_semana_mensual | 189 EUR/mes | No encontrado |
| entrenador_personal_mensual | 329 EUR/mes | No encontrado |
| entrenador_personal_prepago6 | 285 EUR/mes; modelo mensual por confirmar | No encontrado |
| outdoor_pack_4_actividades | 215 EUR, pago único | 215 EUR, pago único, sandbox |
| outdoor_pack_8_actividades | 380 EUR, pago único | 380 EUR, pago único, sandbox |

Se cotejó el catálogo de cliente/servidor de la rama del PR #6; la rama de este
guard no altera ese catálogo. No se crearon precios, clientes, sesiones ni
notificaciones. La presencia de dos precios no acredita impuestos, disponibilidad
de fechas, credenciales del backend ni un checkout ejecutable. Ambos precios
devuelven tax_behavior=unspecified; no se certifica su configuración fiscal.
Los cuatro planes mensuales y las reglas del plan de seis meses siguen pendientes.

## Revisión de canales de publicación — 18 de octubre

Los planes de entrenamiento y sus precios quedan aparcados por indicación del
promotor. No son un requisito para continuar la validación de reservas de aventura,
migraciones, accesos y correo. El catálogo anterior se conserva como referencia
histórica, sin crear productos ni suscripciones.

Consulta de solo lectura a la API de GitHub con la credencial Git existente:

| Comprobación | Resultado observado | Alcance |
| --- | --- | --- |
| Webhooks del repositorio | HTTP 200, lista vacía | No hay webhooks configurados visibles en este repositorio |
| GitHub Pages | HTTP 404 | No se confirmó un sitio Pages; no equivale a ausencia de alojamiento externo |
| Environments | HTTP 200, lista vacía | No hay entornos de GitHub configurados con barreras de aprobación |
| Protección clásica de main | HTTP 404 | No se obtuvo una protección clásica; no se presupone una barrera activa |
| Rulesets del repositorio | HTTP 200, lista vacía | No hay reglas devueltas por este endpoint |
| Workflows | Build and Deploy y Stabilization checks activos | Estar activo no demuestra que el despliegue tenga credenciales válidas |
| Permisos predeterminados de Actions | read; aprobación de PR por Actions deshabilitada | Configuración leída, sin cambios remotos |

El archivo de origin/main todavía ejecuta FTP al recibir un push a main:
SamKirkland/FTP-Deploy-Action@v4.3.6, protocolo ftp, puerto 21 y destino public_html/.
No se han consultado valores de secretos ni probado conexiones FTP. Por tanto,
existe un canal de publicación configurado cuya ejecución efectiva no está probada.
El PR #7 elimina ese paso, pero su protección no estará activa mientras siga abierto.
El uso de FTP sin cifrado es otro motivo para no reutilizar ese mecanismo en una
futura publicación autorizada.

No se han auditado ajustes internos de Lovable, aplicaciones GitHub instaladas,
paneles del alojamiento ni automatizaciones externas. La lista vacía de webhooks
no descarta integraciones mediante aplicaciones. Antes de cualquier futura
integración en main, revisar esos canales con acceso de lectura a sus paneles.
No se modificaron permisos, reglas, conexiones, secretos ni servicios.

Siguiente validación técnica sin producción: inventario estructural de esquema
local (columnas, restricciones, índices, RLS, permisos y funciones), comparado antes
y después de las migraciones con datos ficticios. Un resultado local correcto no
certificará equivalencia con producción ni autorizará migraciones remotas.

## Retirada operativa de FTP — 18 de octubre

Por autorización expresa del promotor para eliminar el despliegue automático de
GitHub y Hostinger, se desactivó mediante API el workflow build.yml (ID 225238863).
La lectura posterior confirma state=disabled_manually. No había ejecuciones
pendientes. Se eliminaron exclusivamente los secretos del repositorio FTP_SERVER,
FTP_USERNAME y FTP_PASSWORD; la lista posterior no contiene secretos FTP_. No se
leyeron sus valores ni se fusionó ningún PR ni se desplegó la web.

Esta barrera ya está activa en los ajustes de GitHub, aunque main conserve el YAML
histórico. También queda desactivada la compilación de ese workflow; no se ha
desactivado Stabilization checks. El PR #7 sigue abierto para retirar el paso del
código cuando se autorice expresamente su integración. No reactivar build.yml
mientras main contenga FTP ni restaurar los secretos retirados.

Hostinger requiere completar la verificación en dos pasos en el navegador del
promotor. Hasta acceder y comprobar sus ajustes, no se considera revocada la
credencial FTP del alojamiento ni descartada una automatización independiente.
Retirar secretos en GitHub no invalida por sí solo la contraseña en Hostinger.
No se deben borrar archivos del sitio, cuentas de hosting ni datos para completar
esta tarea. Si la revocación requiere cambiar una contraseña, debe introducirla
y guardar el cambio el promotor directamente, sin compartirla en el chat.

## Cierre y recuperación

Este PR no modifica SQL, aplicación, .env ni configuración remota. Revertir la
retirada del paso FTP es una operación de publicación potencial y exige revisión
y autorización nuevas. Ante un fallo de compilación, mantener la barrera y corregir
el fallo; no reactivar FTP como solución rápida. Resultado de CI del guard y SHA
exacto: consultar el PR independiente y sus checks antes de cualquier aprobación.
