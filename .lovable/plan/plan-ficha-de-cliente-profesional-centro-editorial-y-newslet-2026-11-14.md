# Plan: ficha de cliente profesional + centro editorial y newsletter

Solo planificación. No se toca código, datos, reservas, pagos, correos ni publicación hasta que lo apruebes.

## Qué hay hoy (comprobado)

- **Ficha de contacto**: está dentro de `src/pages/Admin.tsx` (1.456 líneas). El panel a pantalla completa encadena `ContactCrmPanel` (clasificación), `ContactTimeline` / `ContactFollowUp` (historial y seguimiento), `ContactSuggestions`, `NotesField` y `PaymentPanel`, uno debajo de otro. Los paneles editables ya conservan lo no guardado al refrescar porque se montan con una clave por contacto (regla de `AGENTS.md`).
- **Newsletter** (`src/components/Newsletter.tsx`): **es solo visual**. Al enviar, escribe el email en la consola y vacía el campo. No guarda nada ni pide consentimiento. Además promete «un 10 % de descuento en tu primera actividad», y eso no existe en ningún sitio: hay que confirmarlo o quitarlo.
- **Blog**: los artículos están en el código (`src/data/blogPosts.ts`, con slug, categoría, tags y SEO). `BlogPost.tsx` genera la URL canónica `/blog/:slug` y los datos estructurados `BlogPosting`.
- **Consentimiento**: existe la columna `contact_submissions.marketing_consent_at`, pero ningún formulario la rellena. Por eso hoy **ningún contacto del CRM tiene consentimiento comercial comprobable**.
- **Correo**: se envía desde el servidor por el gateway de Resend, con `notification_log` y las funciones `claim_notification` / `finish_notification` (bloqueo temporal e idempotencia).

---

## Parte 1 — Rediseño de la ficha de cliente

### Estructura

```text
+--------------------------------------------------------------+
| Nombre · tipo cliente · origen      [Etapa comercial v] [Prioridad v] |
| Email · Teléfono · Canal preferido                           |
| [WhatsApp] [Llamar] [Email] [Registrar contacto] [Enlace pago]|
| Próxima acción: ... (vencida/hoy)   Avisos: posible duplicado |
+--------------------------------------------------------------+
| Resumen | Actividad e historial | Reservas y pagos | Notas    |
+--------------------------------------------------------------+
```

- **Cabecera fija**: identidad, etapa comercial (`pipeline_stage`) y prioridad editables en línea, más las acciones rápidas actuales.
- **Resumen**: interés, personas, fechas deseadas, experiencia, propuesta y sugerencias (`ContactSuggestions`), y seguimiento.
- **Actividad e historial**: `ContactTimeline` sin cambios funcionales y con filtros por tipo.
- **Reservas y pagos**: muestra el estado de la reserva o del pago (`status`) con su propia insignia, separado de la etapa comercial. Incluye `PaymentPanel` y los enlaces de pago existentes.
- **Notas**: `NotesField`.
- **Pestañas sin desmontar**: el contenido de cada pestaña sigue montado al cambiar de pestaña (`forceMount` + ocultar). Así nunca se pierde una edición, y un aviso de «cambios sin guardar» marca la pestaña afectada.

### Reservas relacionadas sin fusionar contactos

- Solo se muestran como **relacionadas con certeza**:
  - las vinculadas de forma explícita: los pagos y eventos con `contact_id`;
  - las reservas con el mismo email normalizado **y** el mismo teléfono normalizado.
- Si solo coincide el email o solo el teléfono, aparecen en «Posibles coincidencias», en solo lectura y con el motivo. No se escribe nada ni se fusiona.
- Más adelante, de forma opcional (requiere base de datos), un vínculo manual confirmado por el admin, que se puede deshacer y queda en el historial.

### Sprint 1A — solo visual (sin base de datos)
- Sacar la ficha de `Admin.tsx` a `src/components/admin/contact/ContactDetail.tsx`, junto con `ContactHeader.tsx`, `ContactQuickActions.tsx`, `ContactSummaryTab.tsx`, `ContactBookingsTab.tsx` y `StatusBadges.tsx`.
- Mover `PaymentPanel` y `NotesField` a sus propios archivos, sin cambiar su lógica.
- Las coincidencias de reservas se calculan en el navegador con los datos que ya se cargan, en `src/lib/crmMatching.ts`.
- Pruebas:
  - Etapa comercial y estado nunca comparten control ni valor.
  - Las ediciones sin guardar sobreviven a un refresco de la lista y al cambio de pestaña (se amplía `ContactCrmPanel.test.tsx`).
  - Si solo coincide el email, sale «posible», no «relacionada».
  - Si coinciden email y teléfono, sale «relacionada».
- Criterios de aceptación:
  - Siguen disponibles todas las funciones actuales.
  - No cambia ninguna consulta de escritura.
  - Se ve bien en móvil.

### Sprint 1B — opcional, con base de datos
- Tabla `contact_booking_links` (contact_id, booking_id, linked_by, created_at, único por par):
  - permisos: solo `authenticated` + `service_role`;
  - RLS: solo administradores, con `has_role`;
  - cada vínculo añade un evento en `contact_events`.

---

## Parte 2 — Centro editorial + newsletter

### Principios
- Una **pieza editorial** con dos salidas independientes: el **artículo del blog** y la **edición newsletter**. Cada una tiene su propio estado.
- Los artículos actuales de `blogPosts.ts` mantienen su slug, URL, metadatos y datos estructurados. El blog combina los artículos del código con los publicados desde la base de datos, y los del código ganan si se repite un slug.
- **Marketing solo con doble confirmación**: alta, correo de confirmación y clic. Se guardan la fecha, la IP, el navegador, el texto legal aceptado y su versión. Los contactos del CRM **no** se importan como suscriptores.
- Los envíos salen solo del servidor (funciones Edge) por el gateway de Resend, con registro e idempotencia.

### Tablas nuevas (migraciones; permisos antes de RLS)
| Tabla | Uso | Acceso |
|---|---|---|
| `editorial_pieces` | título, slug único, extracto, cuerpo en markdown, imagen (solo URL aportada por ti), categoría, tags, campos SEO, autor | solo admin |
| `blog_publications` | pieza, estado (borrador/programado/publicado/retirado), `published_at` | admin; lectura pública mediante una vista `blog_posts_public` con lista cerrada de columnas y solo publicados |
| `newsletter_subscribers` | email normalizado único, estado (pendiente/confirmado/baja), token de confirmación y de baja, segmentos, `contact_id` opcional | solo admin + `service_role`; sin acceso anónimo directo |
| `consent_records` | suscriptor, acción (alta/confirmación/baja), texto legal y versión, IP, navegador, fecha; **solo se añaden filas** | admin lectura, `service_role` escritura |
| `newsletter_segments` | nombre y regla (por intereses: barranquismo, ferratas, espeleología…) | solo admin |
| `newsletter_campaigns` | pieza, asunto, preheader, segmento, estado (borrador/prueba/enviando/enviada/cancelada), recuento | solo admin |
| `newsletter_deliveries` | campaña, suscriptor, `notification_log_id`, estado; único (campaña, suscriptor) | solo admin + `service_role` |

- Reutilizar `notification_log` con `dedupe_key = campaign:<id>:sub:<id>` y `kind = 'newsletter'`.
- Una función `snapshot_campaign_audience` (security definer, solo `service_role`) congela los destinatarios confirmados en el momento del envío.

### Funciones Edge
- `newsletter-subscribe` (pública): valida datos, exige la casilla de consentimiento (separada de la de contacto), crea o reactiva al suscriptor como pendiente y envía el correo de confirmación. Siempre da la misma respuesta, para no revelar qué emails existen.
- `newsletter-confirm` y `newsletter-unsubscribe` (públicas, con token): cambian el estado y registran el consentimiento. La baja funciona con un clic y con la cabecera `List-Unsubscribe`.
- `newsletter-send` (solo admin, con la sesión verificada en el servidor):
  - modos «prueba a mí» y «envío»;
  - envía por lotes con `claim_notification` / `finish_notification` y su reintento;
  - cada correo incluye su enlace de baja.
- `blog-revalidate`: no hace falta, porque el blog lee la vista en tiempo real. El sitemap se actualiza en un sprint posterior.

### Panel (`/admin` → «Editorial»)
- `src/components/admin/editorial/`:
  - `EditorialList.tsx`;
  - `PieceEditor.tsx` (markdown + vista previa con el mismo renderizado que `BlogPost`);
  - `SeoFields.tsx` (contadores de caracteres);
  - `BlogPublishPanel.tsx`;
  - `NewsletterComposer.tsx` (vista previa del correo con la plantilla de marca de `bookingEmail.ts`);
  - `CampaignHistory.tsx` (enviados, fallidos y bajas).
- `SubscribersPanel.tsx`: estado, segmentos e historial de consentimiento en solo lectura. No se puede marcar a nadie como «confirmado» a mano.

### Sprints
- **Sprint 2 — suscripción real y legal** (base de datos + Edge):
  - tablas de suscriptores y consentimiento;
  - subscribe, confirm y unsubscribe;
  - `Newsletter.tsx` conectado, con casilla y enlace a privacidad;
  - quitar o confirmar el 10 %;
  - opción de consentimiento comercial separada en el formulario de contacto: si se marca, abre el mismo flujo de doble confirmación.
- **Sprint 3 — editor y blog**:
  - `editorial_pieces`, `blog_publications` y la vista pública;
  - editor con vista previa;
  - `Blog.tsx` y `BlogPost.tsx` combinan los dos orígenes manteniendo el SEO;
  - `sitemap.xml` sigue fijo: los artículos nuevos se añaden al sitemap en un paso posterior acordado.
- **Sprint 4 — campañas**: segmentos, compositor, envío de prueba, envío real idempotente, historial y bajas.
- **Sprint 5 (opcional)**: vínculo manual de reservas (1B) y métricas básicas.

### Pruebas clave
- No se envía a nadie pendiente, dado de baja ni que solo sea contacto del CRM.
- Si se repite `newsletter-send`, no se duplica ningún correo, porque `dedupe_key` es único.
- Un token de baja inválido no cambia nada, y uno válido da de baja y registra el consentimiento.
- La vista pública nunca devuelve borradores.
- Un slug de la base de datos que choca con uno de `blogPosts.ts` se rechaza en el editor.
- Las URLs existentes del blog siguen respondiendo igual: misma canónica y mismos datos estructurados.
- RLS: un usuario con sesión pero sin rol de admin no puede leer suscriptores, consentimientos ni campañas.

### Criterios de aceptación generales
- Las reservas, los pagos, los enlaces de pago y los correos actuales no cambian.
- Todos los envíos de marketing salen del servidor y quedan registrados en `notification_log`.
- Cada suscriptor tiene una prueba de consentimiento que se puede consultar.

---

## Resumen: visual frente a base de datos
- **Solo visual**: Sprint 1A completo y la casilla y textos de la newsletter (sin guardar nada todavía).
- **Requiere base de datos o funciones**: 1B, y los sprints 2, 3 y 4.

## Decisiones que necesito de ti
1. ¿Se mantiene la oferta del 10 % por suscribirse? Si sí, ¿cómo se aplica?
2. Segmentos iniciales: ¿por disciplina, por nivel, o los dos?
3. ¿Se pueden programar envíos para una hora concreta o basta con enviar ya?
4. ¿Qué dirección de remitente usará la newsletter? Puede ser la misma que la de los correos actuales.
