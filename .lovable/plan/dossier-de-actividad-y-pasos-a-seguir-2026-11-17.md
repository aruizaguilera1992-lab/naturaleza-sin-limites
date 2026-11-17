# Dossier de actividad y «Pasos a seguir»

## Qué cambia para el cliente
- En la página de pago confirmado y en el correo de confirmación, «Preparar mi actividad» pasa a llamarse **«Pasos a seguir»**.
- Mientras no le hayas enviado el dossier, el botón le explica que lo recibirá por email o WhatsApp (sin enlace a WhatsApp genérico).
- Cuando lo envías, recibe un **enlace privado** (igual que las fichas) con:
  1. **Cronograma** del día: horas y actividad de cada paso (quedada, aproximación, actividad, regreso...).
  2. **Qué necesitas**: material y ropa que debe llevar.
  3. **Normas de participación**, que debe aceptar.
  4. **Registro para el seguro de responsabilidad**, por cada participante: nombre y apellidos, DNI, fecha de nacimiento, teléfono, contacto de emergencia (nombre y teléfono) e información de salud relevante (opcional).
  5. **Solo barranquismo:** medidas para neopreno y escarpines (altura, peso, pecho, cintura, cadera, nº de pie) y talla SELAND sugerida según la tabla oficial.
- Envía el formulario una vez; puede corregirlo mientras no esté cerrado.

## Qué cambia en el panel (Reservas)
- En una reserva **pagada**, nuevo bloque **«Dossier»**: crear, editar cronograma/material/normas (precargadas desde las normas y pasos de la salida o ficha), y enviar por **email** o **WhatsApp**.
- Estados: Borrador → Enviado → Completado por el cliente, con fecha.
- Vista de los participantes registrados y sus tallas, para preparar el seguro y el material.

## Lo que necesito de ti
- **La tabla oficial de tallas SELAND** (neopreno y escarpines). Hasta tenerla, el formulario recoge las medidas y la talla sugerida queda vacía; no se inventa ninguna talla.

## Privacidad
- DNI y datos de salud solo los ve el administrador. El enlace del cliente es único, caduca y no muestra datos de otras reservas. Se pide aceptación RGPD específica para el seguro.

## Detalles técnicos
- Tabla `activity_dossiers` (booking_id, token, content jsonb con cronograma/material/normas, status, sent_at, completed_at, expires_at) y `dossier_participants` (datos seguro + medidas + talla). RLS solo admin; grants a service_role.
- RPC security definer `get_activity_dossier(_token)` y `submit_activity_dossier(_token, _participants, _rgpd)` con validación (1–6 participantes, longitudes, DNI/NIE formato).
- `src/lib/selandSizes.ts`: función pura `suggestSelandSize(medidas, tabla)` con pruebas, rellenada al recibir la tabla.
- Función `send-activity-dossier` con el remitente actual vía gateway Resend y `notification_log`; WhatsApp con mensaje prellenado y enlace.
- Página pública `/dossier/:token`. Cambios en `Pago.tsx` y `bookingEmail.ts` (texto del botón/enlace). Aviso al admin cuando el cliente completa el registro.
- Sin tocar cobros, Stripe ni plazas. No se publica.
