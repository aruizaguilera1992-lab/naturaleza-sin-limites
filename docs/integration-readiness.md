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
npm ci, comprobación de política y npm run build. Token contents:read; ningún
paso FTP, credencial de despliegue, subida de artefacto ni trabajo de publicación.
workflow_dispatch también compila únicamente: no ofrece parámetro para publicar.

La política estructural comprueba el YAML real, permite solo esos eventos,
permisos y pasos y rechaza trabajos adicionales, secretos, comandos encadenados,
permisos de escritura y eventos privilegiados. Once pruebas incluyen controles
negativos. Son detección de regresiones, no un mecanismo de autorización que
resista a alguien con permiso para cambiar a la vez el workflow y su comprobación.
El paquete yaml ya está en el lock de main y se instala con npm ci; no se añade
ni actualiza ninguna dependencia en este PR.

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

## Cierre y recuperación

Este PR no modifica SQL, aplicación, .env ni configuración remota. Revertir la
retirada del paso FTP es una operación de publicación potencial y exige revisión
y autorización nuevas. Ante un fallo de compilación, mantener la barrera y corregir
el fallo; no reactivar FTP como solución rápida. Resultado de CI del guard y SHA
exacto: consultar el PR independiente y sus checks antes de cualquier aprobación.
