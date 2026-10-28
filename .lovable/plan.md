# Auditoría y evolución de Contactos hacia un CRM ligero — Naturaleza Sin Límites

Fase actual: solo auditoría y plan. Aprobar este plan NO inicia ningún sprint; cada sprint necesita tu autorización expresa.

## 1. Inventario actual (verificado en el código y la base)

- Panel `/admin` en un único archivo grande (`src/pages/Admin.tsx`, ~1.430 líneas) con pestañas: resumen, reservas, contactos, correos, salidas, ajustes, planes.
- Contactos: lista compacta con búsqueda (nombre, contacto, interés) y filtro por estado; ficha lateral con datos, selector de estado, notas internas, enlaces de pago ligados y borrado definitivo.
- Tabla `contact_submissions`: nombre, contacto, interes, personas, mensaje, email, phone, status, admin_notes, rgpd_accepted_at, campos de pago, fechas. Solo administradores pueden ver/editar/borrar; nadie puede insertar desde la web directamente.
- Entradas de leads: función `submit-request` (formulario web principal, envía correos) y función `preapertura-lead` (firma HMAC, sin correos).
- Estados de contacto compartidos con reservas: nueva, contactada, pendiente_pago, incidencia_plazas, confirmada, cancelada.

## 2. Problemas demostrados

1. Los estados comerciales se mezclan con estados de reserva/pago (un contacto puede quedar "pendiente_pago").
2. No consta el origen del lead (web, preapertura, manual).
3. Email y teléfono no se normalizan: duplicados posibles entre web y preapertura.
4. No se pueden crear contactos a mano ni etiquetarlos.
5. Sin historial: solo existe un campo de notas que se sobrescribe.
6. Sin seguimiento (próxima acción/fecha) ni avisos de vencidos.
7. Sin acciones rápidas (WhatsApp, llamar, email, copiar).
8. Consentimiento comercial no diferenciado del aceptado para responder la solicitud.

## 3. Propuesta visual

- Cabecera de Contactos con 4 cifras: leads nuevos, seguimientos de hoy, vencidos, oportunidades abiertas.
- Filtros en píldoras combinables: estado del embudo, prioridad, actividad, origen, tipo de cliente.
- Lista compacta con nombre, actividad, origen, prioridad (punto de color) y próxima acción.
- Ficha lateral con pestañas: Resumen · Clasificación · Historial · Propuesta, y barra fija de acciones rápidas (WhatsApp, Llamar, Email, Copiar, Registrar nota).
- Kanban opcional al final (solo si lo pides): no aporta mucho a una persona con pocos leads.
- Interfaz oscura NSL, naranja de acento, objetivos táctiles grandes en móvil.

## 4. Modelo de datos (aditivo, sin tocar lo existente)

- `contact_submissions`: columnas nuevas opcionales — source, client_type, activities_interest (lista), goal, experience_level, participants, desired_dates, contact_preference, priority, pipeline_stage, next_action, next_action_at, recommended_service, tags, email_normalized, phone_normalized, marketing_consent_at, created_by. El estado actual se conserva tal cual.
- Tabla nueva `contact_events` (historial): tipo (formulario, cambio_estado, nota, llamada, whatsapp_registrado, propuesta, seguimiento), texto, fecha, autor, enlaces opcionales a reserva/pago. Solo administradores.
- Índices en email/teléfono normalizados y en next_action_at.
- Relleno inicial: source = "web" o "preapertura" deducido solo cuando sea inequívoco; si no, "desconocido".

## 5. Flujo

```text
Llega lead (web / preapertura / manual)
  -> se normaliza email y teléfono, se avisa si hay posible duplicado
  -> Nuevo -> Contactado -> Propuesta enviada -> Negociación -> Ganado / Perdido
  -> Ganado enlaza con una reserva existente (la reserva sigue su propio flujo de pago)
```

Turismo activo puntual y Vértigo Sapiens se distinguen por el tipo de servicio recomendado.

## 6. Sprints (cada uno con tu autorización)

- **Sprint 1 — Datos base:** columnas nuevas, tabla de historial, permisos solo administrador, normalización y origen en ambas funciones de entrada (sin cambiar sus respuestas ni correos).
  Aceptación: contactos existentes visibles igual; preapertura sigue devolviendo 200/401; web principal sigue enviando sus correos.
- **Sprint 2 — Ficha y acciones rápidas:** ficha con clasificación editable, WhatsApp/llamada/email con mensaje editable (solo abren la app, nada se envía solo), copiar, registrar comunicación manualmente.
  Aceptación: teléfonos inválidos no generan enlace; nada se marca como enviado sin que lo confirmes tú.
- **Sprint 3 — Historial y seguimientos:** línea temporal, próxima acción, cifras de vencidos/hoy, alta manual y aviso de duplicados.
  Aceptación: cambios de estado quedan anotados con fecha y autor; vencidos se cuentan bien.
- **Sprint 4 — Recomendación y propuesta:** sugerencias desde el catálogo real según disciplina y nivel, propuesta editable con enlaces a las fichas; sin precios ni fechas inventados.
  Aceptación: solo aparecen actividades existentes; sin precio se muestra "Precio a consultar".
- **Sprint 5 (opcional) — Separar Contactos del archivo grande del panel y vista Kanban.**

## 7. Riesgos y medidas

- Romper reservas/pagos: no se cambian sus estados, tablas ni funciones; los estados comerciales van en una columna aparte.
- Romper preapertura: cambios solo aditivos, pruebas automáticas existentes de firma y validación se amplían.
- Datos personales: nada nuevo accesible al público; nada de datos personales en registros.
- Consentimiento: comunicaciones comerciales solo si hay consentimiento registrado; responder a una solicitud no lo requiere.
- Panel grande: el código de Contactos se mueve a archivos propios para no tocar el resto.

## Detalles técnicos

- Migraciones aditivas con GRANT a authenticated/service_role y RLS `has_role(auth.uid(),'admin')`; reversión = dejar de usar columnas (comentario DEPRECATED), sin borrados.
- Normalización de teléfono a E.164 con prefijo +34 por defecto, validada antes de generar `wa.me`/`tel:`.
- Pruebas: Vitest para normalización, duplicados y enlaces; Deno para `preapertura-lead` y `submit-request`; regresión de `Admin.access.test.tsx`.
