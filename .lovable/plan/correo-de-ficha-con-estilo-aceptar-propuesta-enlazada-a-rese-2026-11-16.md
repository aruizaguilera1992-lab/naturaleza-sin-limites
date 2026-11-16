# Correo de ficha con estilo + aceptar propuesta enlazada a reservas

## 1. Correo de la ficha con diseño de marca
Rediseñar el correo «Tu ficha: …» (hoy solo texto y botón):
- Cabecera con el logo y una franja oscura con acento naranja.
- Tarjeta resumen: actividad y nivel, fecha, duración, lugar, personas y precio por persona/total (o «Precio a consultar»).
- Botón principal «Ver mi propuesta» y enlace de respaldo corto, no la URL entera.
- Pie con WhatsApp, email y aviso de que el enlace es personal y caduca.
- Fondo blanco, se ve bien en móvil y en Gmail/Outlook.

## 2. Aceptar la propuesta desde la ficha (sin pago)
- Nuevo botón «Aceptar propuesta» en la ficha privada, junto a WhatsApp.
- El cliente confirma en un pequeño diálogo (nombre, email y teléfono ya rellenos si existen; casilla de privacidad).
- Al aceptar:
  - Se crea una reserva «pendiente» con la actividad, la fecha, las personas y la referencia de la ficha, vinculada al contacto del CRM.
  - La ficha pasa a «aceptada»: el botón no se puede volver a pulsar y se ve el mensaje «Propuesta aceptada, te enviaremos el enlace de la señal».
  - Te llega el aviso de nuevo lead como ahora y queda anotado en el historial del contacto.
- No se cobra nada. Desde el panel envías el enlace de señal del 30 % con el flujo actual: confirmación, pago, recibo y correos de confirmación. No cambia nada de ese flujo.

## 3. Panel
- En «Salidas → Grupo privado», cada ficha muestra su estado (enviada, vista, aceptada) y un acceso a la reserva creada.

## Detalles técnicos
- La plantilla HTML del correo va en `_shared`, con los datos escapados; se reutiliza `sendTrackedNotification`. Redesplegar `send-activity-sheet`.
- Migración: estado `aceptada` en `activity_sheets` y columna `booking_id`. Nueva RPC `accept_activity_sheet(_token, _contact)` con security definer: comprueba que la ficha esté enviada y sin caducar, crea la reserva y un `contact_events` de forma atómica y es idempotente.
- Nueva función de aviso o reutilización de la de `submit-request` para avisar al administrador. Sin Stripe ni reserva de plazas.
- Pruebas: aceptar dos veces crea una sola reserva; una ficha caducada o desactivada no se puede aceptar; las personas se mantienen en ≤6.
- No se publica.
