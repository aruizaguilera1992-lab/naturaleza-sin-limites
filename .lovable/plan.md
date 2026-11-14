# Rediseño de la ficha de contacto (/admin)

Solo interfaz y organización. Sin cambios de esquema, RLS, funciones Edge, escrituras, datos, reservas, pagos, correos, newsletter ni permisos. No se publica.

## Auditoría (estado actual)

- `src/pages/Admin.tsx` (~1.490 líneas) monta la ficha dentro de un `Sheet`: cabecera sticky (nombre, interés, etapa, prioridad, estado reserva/pago, aviso de seguimiento, WhatsApp/Llamar/Email) y 4 pestañas: «Resumen y seguimiento», «Reservas y pagos», «Notas», «Gestión».
- «Resumen y seguimiento» mezcla: datos originales + mensaje, `ContactFollowUp` (próxima acción **y** línea temporal, en `ContactTimeline.tsx`) y `ContactCrmPanel`.
- `ContactCrmPanel.tsx` (233 líneas) concentra 4 responsabilidades con un único estado: sugerencias del catálogo (`ContactSuggestions`), mensaje editable + acciones rápidas duplicadas con la cabecera + confirmación «¿Has enviado…? Sí, registrar», «Registrar comunicación» manual y «Clasificación» (formulario + guardar).
- `ContactFollowUp` se remonta con key `fu-${id}-${next_action_at}` y recarga la línea temporal con `refreshKey={crmTick}`.
- `NotesField`, `PaymentPanel` y `StatusSelect` viven dentro de `Admin.tsx`; `RelatedBookings` ya está extraído y usa `crmMatching`.
- «Gestión» solo contiene `DeleteRecordButton`.

## Nueva estructura

```text
Cabecera compacta (sticky)
  Nombre · interés · email/teléfono (copiables)
  [Etapa comercial]  (chip relleno)   | Reserva/pago: [estado] (chip contorno, separado por divisor)
  Prioridad · aviso seguimiento vencido/hoy
  WhatsApp  Llamar  Email   [Preparar propuesta]   [⋯ menú: Eliminar contacto]
Pestañas: Ficha | Seguimiento | Reservas y pagos | Notas
```

- **Ficha**: datos originales (contacto, interés, personas, pagado), mensaje recibido y formulario de clasificación (etapa, prioridad, tipo, experiencia, preferencia, participantes, fechas, servicio, objetivo, etiquetas) con su botón Guardar. Sin historial ni próxima acción.
- **Seguimiento**: próxima acción + fecha (guardar / marcar hecha), registrar comunicación manual y línea temporal. Único lugar para consultar y registrar seguimiento.
- **Reservas y pagos**: estado de reserva/pago, reservas relacionadas / posibles coincidencias (solo lectura, sin cambios en la regla email+teléfono) y PaymentPanel.
- **Notas**: notas internas.
- **Eliminar**: sale de las pestañas; va a un menú «⋯» de la cabecera con texto en rojo y la confirmación actual de `DeleteRecordButton`.
- **Preparar propuesta**: botón de la cabecera que abre un panel secundario (Dialog en escritorio, Drawer inferior en móvil) con `ContactSuggestions` tal cual, el mensaje editable, Copiar, abrir WhatsApp/Email con el mensaje y la confirmación «¿Lo has enviado? Sí, registrar». Sin actividades ni precios nuevos.
- Menos tarjetas: secciones con título y separador, no cajas anidadas. En móvil, la barra de pestañas es una fila con scroll horizontal (sin wrap), etiquetas cortas y la cabecera reduce acciones a iconos con texto accesible.

## Archivos

Nuevos en `src/components/admin/contact/`:
- `ContactHeader.tsx` — cabecera, chips separados, acciones, botón propuesta y menú administrativo.
- `ContactClassificationForm.tsx` — formulario de clasificación extraído de ContactCrmPanel (misma escritura `update` actual).
- `ContactCommunicationLog.tsx` — «Registrar comunicación» + función `register` actual (insert en contact_events sin cambios).
- `ProposalDialog.tsx` — sugerencias + mensaje + copiar/abrir + confirmación de envío (reutiliza `register`).
- `ContactNextAction.tsx` y `ContactTimelineList.tsx` — separación de lo que hoy hay en `ContactTimeline.tsx` (mismas consultas).
- `ContactDetail.tsx` — orquesta cabecera + 4 pestañas; recibe `contact`, `bookings`, callbacks.

Modificados:
- `src/pages/Admin.tsx` — el Sheet solo renderiza `<ContactDetail key={c.id} …/>`; `NotesField`, `PaymentPanel`, `StatusSelect` se pasan o se extraen sin cambiar su lógica.
- `ContactCrmPanel.tsx` — se retira o queda como reexportación fina; su prueba se adapta a los nuevos componentes.
- `ContactTimeline.tsx` — reexporta las piezas nuevas o se elimina tras mover los imports.

## Riesgos de pérdida de estado

- Hoy mensaje, clasificación y registro comparten estado en un solo componente: al separarlos, cada uno se inicializa del contacto con key por `c.id` y nunca se resincroniza desde props (regla AGENTS.md).
- El mensaje de propuesta debe sobrevivir al cerrar/abrir el diálogo: su estado vive en `ContactDetail` (no dentro del Dialog, que se desmonta al cerrar).
- Las 4 pestañas siguen con `forceMount` + `data-[state=inactive]:hidden`.
- La key de próxima acción incluye `next_action_at` (remonta tras guardar); se conserva solo en ese bloque para no reiniciar el registro de comunicación.
- La línea temporal sigue refrescándose con `crmTick` tras registrar desde Seguimiento o desde el diálogo.
- Cambiar etapa en Ficha no debe tocar `status`; el chip de cabecera refleja el valor guardado, no el borrador.

## Orden de ejecución

1. Extraer `ContactClassificationForm`, `ContactCommunicationLog`, `ProposalDialog` desde ContactCrmPanel sin cambiar escrituras; adaptar prueba existente.
2. Separar próxima acción y línea temporal.
3. Crear `ContactHeader` (chips separados, menú «⋯» con eliminar, botón propuesta).
4. Crear `ContactDetail` con las 4 pestañas y conectarlo en Admin.tsx.
5. Ajuste visual: menos cajas, pestañas con scroll horizontal en móvil.
6. Pruebas y verificación en vista previa.

## Pruebas de regresión

- Unitarias (vitest + Testing Library):
  - Clasificación: editar un campo, re-renderizar con nuevo objeto contacto del mismo id → el valor sin guardar se conserva; guardar envía las mismas columnas que hoy y nunca `status`.
  - Propuesta: escribir mensaje, cerrar y reabrir el diálogo → mensaje conservado; «Sí, registrar» inserta en contact_events con el canal correcto.
  - Registro manual: botón deshabilitado sin texto; inserta con el canal elegido.
  - Ficha no contiene «Próxima acción» ni historial; Seguimiento sí.
  - Eliminar no aparece como pestaña.
  - Pruebas existentes de `crmMatching` y ContactCrmPanel siguen pasando (adaptadas).
- Playwright con sesión admin (escritorio 1280 y móvil 390): abrir contacto real, escribir en clasificación y notas, cambiar entre las 4 pestañas y abrir/cerrar propuesta → nada se pierde; pestañas en una fila sin wrap en móvil; sin desbordamiento horizontal. Sin guardar ni borrar datos reales.

## Criterios de aceptación

- Cada función actual sigue accesible exactamente en un sitio: datos y clasificación en Ficha; seguimiento solo en Seguimiento; reservas/pagos en su pestaña; notas en Notas; eliminar en el menú «⋯».
- Etapa comercial y estado de reserva/pago se distinguen visualmente y no se editan juntos.
- «Preparar propuesta» abre un panel secundario con las sugerencias actuales y permite copiar y registrar el mensaje.
- Ningún cambio sin guardar se pierde al cambiar de pestaña, abrir/cerrar la propuesta o refrescar la lista.
- Coincidencias de reservas idénticas a hoy (ambos = relacionada, uno = posible, solo lectura).
- Sin cambios en base de datos, funciones, correos ni pagos; build OK y pruebas pasando.
