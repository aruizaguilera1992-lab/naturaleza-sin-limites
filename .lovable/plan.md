# Calendario real de salidas conectado con catálogo, reservas y pagos

Hoy el calendario de `/actividades` muestra salidas generadas artificialmente (`generateSampleActivities` en `src/components/actividades/ActivitiesCalendar.tsx`) y la reserva pide una fecha libre al cliente, sin control de plazas. El objetivo es que las salidas reales vivan en la base de datos del proyecto y manden sobre todo lo demás.

## 1. Modelo de datos

**`activity_events`** (una salida programada)
- `id` uuid PK
- `category` text + `slug` text (misma clave que el catálogo: `barranquismo/guadalmina`)
- `title` text, `starts_at` timestamptz, `ends_at` timestamptz null
- `meeting_point_public` text (zona aproximada, visible), `meeting_point_private` text (dirección exacta, solo admin y cliente confirmado)
- `latitude` / `longitude` numeric null (aproximadas, solo si el admin las introduce; nunca inventadas)
- `capacity_total` int (por defecto 6), `seats_reserved` int default 0
- `price_cents` int null (si es null se usa el precio de catálogo)
- `status` text: `borrador` | `publicada` | `completa` | `cancelada`
- `notes` text, `created_at`, `updated_at`

**`activity_event_bookings`** (enlace salida ↔ reserva existente)
- `id` uuid PK, `event_id` → `activity_events.id`, `booking_id` → `bookings.id`
- `participants` int, `state` text: `bloqueada` | `confirmada` | `liberada`
- `hold_expires_at` timestamptz (las plazas sin pago se liberan)
- único por `booking_id`

`bookings` y `payment_requests` no cambian de estructura; solo se añade `event_id` nullable a `bookings` para trazabilidad.

Espeleología queda fuera porque el calendario solo muestra salidas cuyo `category/slug` existe en el catálogo comercial con precio real.

## 2. Flujo completo

```text
Admin crea salida (fecha, plazas, zona, precio)
      -> Calendario público y listado de próximas salidas
      -> Ficha de actividad muestra sus fechas reales
      -> Cliente elige fecha + nº personas
      -> RPC bloquea plazas (hold 30 min) y crea booking + payment_request
      -> Pago de la señal 30% en Stripe (flujo actual intacto)
      -> Webhook confirma: plazas pasan a confirmadas, salida a "completa" si se llena
      -> Si no se paga, el hold caduca y las plazas vuelven a estar libres
```

## 3. Nuevo

- `src/pages/Calendario.tsx` — página pública `/calendario` con vistas mes/semana/lista.
- `src/components/calendario/EventCard.tsx` — tarjeta de salida (fecha, zona, nivel, precio, plazas libres, CTA reservar).
- `src/components/calendario/EventMap.tsx` — mapa de zona aproximada.
- `src/components/actividades/ActivityEventPicker.tsx` — selector de fechas reales en ficha y reserva.
- `src/components/admin/EventsPanel.tsx` — alta/edición/cancelación de salidas y ocupación.
- `src/hooks/useActivityEvents.ts` — lectura de salidas publicadas.

## 4. Reutilizado sin tocar lógica

`ActivitiesCalendar.tsx` (se le cambia la fuente de datos), `ActivitiesGrid`, `ActivityProfilePage`, `ReservarActividad`, `MobileBookingBar`, `TrustBar`, `Admin.tsx`, `Pago.tsx`, `create-activity-deposit`, `payments-webhook`, `_shared/activityPrices.ts`, cliente de base de datos y roles admin existentes.

## 5. Google Maps

- Solo Maps/geolocalización; sin Google Calendar.
- Clave en variable de entorno `VITE_GOOGLE_MAPS_API_KEY`, documentada en `roadmap.md` con restricción por referente HTTP a `naturalezasinlimites.es`, `www.naturalezasinlimites.es` y la vista previa, y con las APIs limitadas a Maps JavaScript + Static Maps.
- El mapa público solo pinta el punto aproximado (o el municipio) con un radio; el punto de encuentro exacto se envía por correo tras confirmar.
- Sin clave o sin coordenadas: se muestra el nombre de la zona, nunca un marcador inventado.

## 6. Control de plazas sin overbooking

Todo el control ocurre en servidor, nunca en el navegador:
- RPC `reserve_event_seats(event_id, participants, ...)` con `SELECT ... FOR UPDATE` sobre la salida, comprueba `seats_reserved + participants <= capacity_total`, incrementa y crea el enlace con `hold_expires_at`. Si no caben, devuelve `sin_plazas`.
- RPC `release_expired_holds()` devuelve plazas de holds caducados.
- RPC `confirm_event_seats(booking_id)` llamada desde la confirmación de pago existente: pasa el enlace a `confirmada` y marca la salida como `completa` al llenarse.
- Restricción en base de datos: `seats_reserved` nunca puede superar `capacity_total`, de modo que incluso una carrera concurrente falla en lugar de sobrevender.

## 7. Migraciones y funciones

- Migración 1: tablas `activity_events` y `activity_event_bookings`, columna `event_id` en `bookings`, permisos y políticas (lectura pública solo de salidas publicadas y sin el punto exacto; escritura solo admin).
- Migración 2: las tres RPC transaccionales.
- `create-activity-deposit`: acepta `eventId` opcional, bloquea plazas antes de crear la reserva y usa la fecha de la salida.
- `payments-webhook` / `confirm_payment_request`: confirma las plazas al marcar pagado.
- Sin cambios en importes: la señal del 30% se sigue calculando en servidor.

## 8. Fases

1. **Base de datos + administración** — tablas, permisos, RPC y panel de salidas en Admin.
2. **Calendario público + listado** — `/calendario`, sustitución de datos de ejemplo, próximas salidas en el catálogo.
3. **Google Maps** — clave por entorno, mapa de zona aproximada, respaldo sin clave.
4. **Ficha → fecha → reserva** — selector de fechas reales en ficha y formulario de reserva, con modo "fecha a medida" cuando no hay salidas.
5. **Control transaccional + Stripe** — holds, confirmación por pago, liberación de caducados, salida completa.
6. **QA** — pruebas de concurrencia (dos reservas simultáneas a la última plaza), pago de prueba de principio a fin, móvil 390px y escritorio 1440px, sin publicar.

## 9. Riesgos y datos que faltan

- **Fechas reales**: no se cargará ninguna salida de ejemplo; el calendario saldrá vacío hasta que se den de alta salidas reales.
- **Coordenadas**: no se inventan; hace falta decidir qué zona aproximada se muestra por actividad.
- **Clave de Google Maps**: se necesita una clave con facturación activa y restricciones; sin ella, el mapa se degrada a texto.
- **Duración del bloqueo de plazas**: propuesta de 30 minutos, a confirmar.
- **Plazas mayores de 6**: se mantiene el máximo habitual de 6; grupos mayores siguen yendo por contacto.
- Riesgo menor: solapes de salidas del mismo guía el mismo día; se avisará en el panel, sin bloquear.

Nada se publica ni se despliega en ninguna fase.
