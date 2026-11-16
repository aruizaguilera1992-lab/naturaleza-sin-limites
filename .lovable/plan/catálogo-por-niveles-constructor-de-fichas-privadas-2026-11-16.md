# Catálogo por niveles + constructor de fichas privadas

## 1. Página «Actividades» (pública)
- Ocultar el buscador del encabezado, la barra de filtros (disciplinas, calendario, nivel, duración, precio, provincia, características) y la barra «Mostrando X · Recomendados · Comparar · Favoritos».
- Mostrar directamente el catálogo agrupado por disciplina: Barranquismo, Vías ferratas y Espeleología, cada una con sus 3 niveles (Iniciación, Intermedio, Avanzado) y enlace a la ficha del nivel.
- Se mantiene la tarjeta de formación de escalada E1.
- Los componentes ocultos no se borran (se pueden recuperar).

## 2. Constructor de fichas en el panel /admin
Nueva sección «Fichas» en el menú lateral y móvil:
- Lista de fichas creadas con estado (borrador / enviada / vista / caducada) y cliente asociado.
- Editor con vista previa en directo:
  - Disciplina y nivel de partida (rellena por defecto texto, indicadores, incluye y edad desde la oferta de nivel).
  - Título, recorrido/lugar, fecha propuesta, duración, punto de encuentro, nº de personas (máx. 6), precio por persona y total (opcional, «Precio a consultar» si vacío).
  - Descripción breve, qué incluye, qué llevar, requisitos, notas para el cliente.
  - Foto: elegir entre las fotos de uso libre ya existentes (con su crédito) o sin foto; no se suben imágenes no verificadas.
  - Contacto vinculado del CRM (opcional) para rellenar nombre, email y teléfono.
  - Caducidad del enlace.
- Acciones: Guardar borrador, Copiar enlace, Enviar por email, Abrir WhatsApp con mensaje y enlace prellenados, Desactivar enlace.
- El envío queda registrado en el historial del contacto.

## 3. Ficha privada para el cliente
- Página `/ficha/:token` con el mismo estilo que las fichas de nivel (indicadores visuales, mínimo texto).
- Solo accesible con el enlace único (token largo e imposible de adivinar); no aparece en el catálogo, ni en el sitemap y lleva `noindex`.
- Botones «Confirmar / Consultar» (WhatsApp y formulario de contacto con la referencia de la ficha). El cobro sigue el flujo actual: el admin genera el enlace de pago manual; no se cobra desde la ficha.
- Si el enlace está desactivado o caducado, mensaje claro con contacto por WhatsApp.

## Detalles técnicos
- Tabla nueva `activity_sheets` (contenido, token, estado, expires_at, contact_id, sent_at, first_viewed_at) con RLS: solo admin lee/escribe; el público no accede a la tabla.
- Lectura pública mediante función `get_activity_sheet(_token)` (security definer) que devuelve solo los campos visibles si el enlace está activo y no caducado, y anota la primera visita.
- Envío por email con una función Edge que usa el gateway Resend existente y el remitente actual (correo transaccional a un solo destinatario, nunca desde el navegador); registra en notification_log con dedupe y crea un evento en contact_events.
- WhatsApp: enlace `wa.me` con el teléfono normalizado del contacto y mensaje prellenado.
- Pruebas: validación del token/caducidad, construcción del mensaje de WhatsApp, máximo 6 personas, precio total.
- No se toca reservas, pagos, Stripe, newsletter ni las ofertas por nivel.
