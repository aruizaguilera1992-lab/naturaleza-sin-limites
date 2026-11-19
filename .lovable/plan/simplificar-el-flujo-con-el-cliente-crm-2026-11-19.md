# Simplificar el flujo con el cliente (CRM)

## Resultado de la auditoría

El recorrido existe completo, pero está repartido entre Contactos, Salidas, Reservas y Dossier, y cada salto pide clics manuales.

```text
Solicitud -> Contacto -> Seguimiento -> Propuesta -> Acepta -> Señal -> Pago -> Dossier -> Actividad
   auto       auto       manual        otro panel    auto     manual    auto    manual
```

Puntos de fricción principales:
1. **El cliente está disperso**: desde su ficha de contacto no se ve ni se abre lo que tiene (propuestas, reservas, pagos, dossier). Las reservas "relacionadas" son solo una estimación.
2. **«Preparar propuesta» en Contactos solo redacta un mensaje**: para crear la propuesta real hay que ir a Salidas → Grupo privado y volver a elegir el cliente.
3. **La etapa comercial no avanza sola**: tras aceptar, pagar o completar el dossier, la etapa sigue igual hasta que la cambias a mano.
4. **Tras aceptar una propuesta privada no queda ninguna tarea pendiente**: tienes que acordarte de enviar el enlace de señal. Lo mismo tras el pago con el dossier.
5. **Pagos de reservas no aparecen en la ficha del contacto** (solo los cobrados directamente al contacto).
6. **Coincidencias dudosas se ignoran en silencio** (mismo email pero otro teléfono).
7. **Fallo**: una propuesta privada admite hasta 20 personas pero el dossier solo deja rellenar 6.

## Mejoras propuestas

### 1. Ficha de cliente única
En la pestaña «Reservas y pagos» del contacto: lista clicable de propuestas, reservas, pagos y dossiers del cliente, cada uno con su estado y un botón «Abrir». Arriba, un aviso con **el siguiente paso** y su botón (p. ej. «Enviar enlace de señal», «Enviar dossier»).

### 2. Propuesta en un clic
«Preparar propuesta» abre directamente una ficha privada nueva ya rellena con el cliente, actividad, fecha y personas. El mensaje redactado se conserva para el envío.

### 3. Etapa automática
La etapa avanza sola cuando ocurre algo real: propuesta enviada → «Propuesta»; aceptada → «Negociación/aceptada»; pago → «Cliente»; nunca retrocede y puedes cambiarla a mano igual que hoy.

### 4. Tareas automáticas en la Agenda
- Propuesta aceptada → seguimiento hoy: «Enviar enlace de señal».
- Pago recibido → seguimiento hoy: «Enviar dossier».
- Dossier completado → se marca como listo para la actividad.
Así nada depende de tu memoria; todo aparece en la Agenda.

### 5. Coincidencias dudosas visibles
Cuando una reserva coincida solo por email o solo por teléfono, aparece en el contacto como «Posible reserva de este cliente» con botón «Vincular». Nunca se juntan fichas sin tu confirmación.

### 6. Dossier hasta 20 personas
Igualar el límite del dossier al de las propuestas privadas.

## Lo que no cambia
Precios, cobros con Stripe, plazas, correos existentes, newsletter y la web pública siguen igual. Grupo abierto mantiene su reserva y pago automáticos.

## Detalles técnicos
- Nueva columna opcional `bookings.contact_id` (rellenada por `sync_booking_contact`, `accept_activity_sheet` con `activity_sheets.contact_id`, y vinculación manual); backfill desde `contact_events.booking_id`.
- `create-payment-link`: guardar `contact_id` también en cobros de reserva; vista de pagos del contacto por `contact_id` o `booking.contact_id`.
- Función `advance_pipeline_stage(contact, stage)` que solo avanza; llamada desde envío de ficha, aceptación, confirmación de pago y envío/completado de dossier, más `next_action/next_action_at` automáticos.
- `ContactCrmPanel` «Preparar propuesta» → navega a Salidas con `sheetFromContact` prellenado.
- `RelatedBookings` pasa a leer vínculos firmes + `crmMatching` para "posibles" con acción vincular.
- `submit_activity_dossier`: límite 6 → 20 y formulario del dossier.
- Pruebas: avance de etapa (no retrocede), tareas de agenda tras aceptar/pagar, límite 20 del dossier.
