# Prioridad para la versión comercial 1

La línea con más prioridad es **el embudo de reserva y captación de leads de extremo a extremo**. Todo lo demás (contenido, catálogos, diseño) ya está muy avanzado; lo que hoy limita facturar es que una petición de reserva depende de un formulario externo (Formspree) sin registro, sin confirmación al cliente y sin panel para gestionarla.

## Orden recomendado

### 1. Reservas y leads sobre backend propio (bloqueante)
- Tabla `bookings` y `leads` en el backend, con RLS y grants.
- Los dos formularios actuales (`BookingForm` y `ContactFormSection`) guardan en base de datos en vez de Formspree.
- Función de servidor que envía email de aviso al negocio y email de confirmación al cliente.
- Panel privado `/admin` con login para ver y cambiar el estado de cada solicitud (nueva, contactada, confirmada, cancelada).

### 2. Coherencia comercial del catálogo (rápido, alto impacto)
- Espeleología sigue apareciendo en la meta descripción del `index.html`, en `ValueProposition`, en el formulario de prueba de Vértigo Sapiens, en el calendario y en el blog, aunque no es actividad comercial. Depurar todas esas apariciones fuera del contexto formativo de Vértigo Sapiens.
- Revisar que cada actividad muestre precio o rango y CTA visible en la ficha.

### 3. SEO local y confianza (para que llegue tráfico)
- Metadatos por página, JSON-LD de `LocalBusiness` y de actividades, sitemap y canonicals.
- Testimonios reales y datos fiscales/legales visibles.

### 4. Analítica activa
- `AnalyticsLoader` está listo pero con el ID de medición de ejemplo `G-XXXXXXX`; hay que poner el real y marcar eventos de conversión (envío de formulario, clic WhatsApp).

## Detalles técnicos
- Backend: Lovable Cloud (base de datos + funciones + auth por email para el panel).
- Emails: función de servidor con proveedor de email; hace falta dominio verificado o se usa remitente de pruebas al inicio.
- Los formularios conservan el consentimiento RGPD actual y se almacena la marca temporal del consentimiento.

## Qué haría primero
Empezar por el punto 1 (reservas en base de datos + emails + panel) y el punto 2 en la misma tanda, porque juntos convierten la web de folleto a canal de venta.
