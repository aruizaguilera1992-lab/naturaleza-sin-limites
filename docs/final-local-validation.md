# Validación local de reservas — 17 de octubre de 2026

## Resultado y alcance

Flujo de actividades validado con datos ficticios: solicitud, depósito atómico,
recuperación, cupo máximo de seis, checkout con proveedor simulado y confirmación
por webhook. No equivale a certificar Stripe/Resend, OAuth, planes, suscripciones
o el estado de producción. No se han desplegado cambios, ejecutado migraciones
remotas, realizado cargos ni enviado comunicaciones a clientes.

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| Interfaz | 70 pruebas en 11 archivos, correctas |
| Servidor e historial SQL | 88 pruebas, correctas |
| TypeScript cliente y siete entradas de servidor | Correctos |
| Compilación habitual | Correcta; persisten avisos de tamaño y recurso histórico /__l5e |
| Seguridad de Vite en Windows | Loopback, Host/Origin hostiles y archivos sensibles rechazados |
| PostgreSQL 16.14 desde cero | 15 entradas; segundo pase conserva historial; descuentos, privacidad y concurrencia correctos |
| Migración 0014 en PostgreSQL nativo | Permisos privados, reintento concurrente único, precio autoritativo, rechazo de cambio de payload, últimas plazas, caducidad y rollback correctos |
| Supabase local con Auth real y PostgreSQL 17 | Usuario/admin, privacidad, concurrencia, caducidad y rollback correctos |
| Edge Runtime real | CORS/JWT, solicitudes, depósitos, recuperación y webhook firmado/repetido correctos; salida externa bloqueada |
| Pago en navegador | Importe 21 EUR sobre total 70 EUR para dos personas; fallo inicial y reintento conservan una sesión; webhook firmado repetido confirma dos plazas; cero llamadas externas |

La prueba del navegador utiliza Pago.tsx y los handlers originales get-payment y
payments-webhook, con PostgreSQL real. Sustituye explícitamente la interfaz Stripe
y su transporte por dobles locales. No verifica el iframe, 3DS, banco, impuestos,
credenciales ni compatibilidad real del proveedor. El éxito visual se cotejó con
la base: pagado, plazas confirmadas, una sesión y avisos omitidos. Captura local
ignorada: .tools/local-supabase/payment-browser-confirmed.png.

## Seguridad y datos

Revisión formal del snapshot anterior: 42 archivos fuente, un hallazgo bajo/P3
en el adaptador HTTP temporal de Docker. Corregido a named pipe de Windows sin
listener TCP; revisión focal posterior y arranque/Edge comprobados. El informe
sellado conserva el hallazgo original; no debe describirse como un nuevo escaneo
completo del código corregido. Los simuladores añadidos después tienen revisión
focal separada. El límite de confianza sigue siendo el ordenador y sus procesos
locales, que ya tienen acceso al daemon de Docker.

.env, credenciales locales, binarios y salidas compiladas permanecen fuera de Git.
Ninguna clave de servidor llega a la vista aislada. Los servicios publicados están
en 127.0.0.1; Edge solo se conecta a red Docker interna. Las pruebas usan correos
example.test; EMAIL_DELIVERY_MODE=disabled y PAYMENTS_LIVE_ENABLED=false.
La limpieza de la reserva del navegador verifica nombre de fixture y direcciones
sintéticas dentro de una transacción antes de borrar. No limpia datos ajenos.

El inventario npm actualizado mantiene 16 avisos: 7 altos y 9 moderados, cero
críticos. Siguen documentados en sprint-b-security.md;
el análisis de cambios no los da por resueltos ni certifica ausencia de riesgos.

## Repetición local

Desde la raíz del repo, sin copiar .env ni credenciales remotas:

1. Validación sin proveedores: npm test, npm run test:security y npm run build;
   ejecutar también los checks Deno y SQL definidos en stabilization-checks.yml.
2. Base nueva: scripts/rebuild-local-db.mjs --database nsl_rebuild_<nombre_nuevo>;
   después scripts/local-db/check-deposit-intents.mjs con esa misma base. Nunca
   apuntar al despliegue; se rechaza cualquier destino no local o nombre ajeno.
3. Edge: prepare-edge.mjs, start.mjs edge, seal-edge.mjs y check-edge-http.mjs
   bajo scripts/local-supabase. Sellar antes de introducir datos ficticios.
4. Pago simulado: compilar con vite.payment-simulation.config.ts --mode isolated;
   servir preview con esa misma configuración en 127.0.0.1:8082. Arrancar
   serve-payment-simulation.ts con Deno --no-config --no-lock
   --node-modules-dir=none --allow-env
   --allow-read=.tools/local-supabase/status.local.json
   --allow-net=127.0.0.1:54321,127.0.0.1:54327.
   POST JSON a /__local_payment/fixture devuelve la ruta /pago local. Abrirla,
   pagar, comprobar el fallo controlado, reintentar y confirmar la simulación.
   /__local_payment/evidence muestra los contadores, sin secretos.
5. Al terminar: cleanup-payment-simulation.mjs, cerrar el servidor del simulador,
   preview y proceso start.mjs edge; detener solo su contenedor Edge. Conservar
   las bases y servicios locales restantes sin borrar volúmenes.

La configuración de simulación nunca se usa en npm run build ni en el despliegue.
No añadir sus aliases o rutas de fixture a vite.config.ts.

## Revisión e integración futura

- La migración 0014 es aditiva; no modifica los SQL 0012/0013 ni reduce reservas.
  Validar y respaldar el destino antes de cualquier futura migración autorizada.
- El nuevo cliente exige requestId estable y el servidor rechaza clientes antiguos
  sin esa referencia. La futura aplicación de 0014 y actualización de función y
  cliente debe coordinarse; no desplegar solo uno de ellos.
- No revertir borrando deposit_intents o reservas: preservar la evidencia de
  idempotencia. Ante incidente, desactivar nuevas reservas y revisar antes de
  autorizar otra versión; no existe un rollback destructivo automático.
- Un cobro con incidencia de plazas requiere revisión administrativa; nunca
  confirmar plazas por la pantalla de retorno ni prometer reembolso automático.
- Permanecen fuera del alcance: entrega real Resend, prueba bancaria/3DS,
  configuración fiscal del proveedor, catálogo de planes y ensayo sobre una
  copia certificada de producción. Requieren una fase separada y autorización.

CI remoto del cambio final: pendiente de registrar el commit y ejecución exactos.
