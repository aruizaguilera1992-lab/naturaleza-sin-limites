# Estado del proyecto y plan hacia la versión comercial 1

## Estado actual

- Backend (Lovable Cloud): activo y respondiendo correctamente.
- Tabla `bookings` creada con RLS y grants.
- Función de servidor `submit-request` desplegada y conectada a Resend; envía aviso al negocio.
- Panel `/admin` protegido por login y rol `admin`.
- Emails de administrador configurados: `naturaleza.s.limites@gmail.com` y `a.ruizaguilera.1992@gmail.com`.
- Formularios de contacto y reserva ya envían datos al backend en lugar de Formspree.
- Consentimiento de cookies y páginas legales implementados.

## Lo que falta para la versión comercial 1

### 1. Cierre del embudo de reservas (bloqueante)
- Email de confirmación automático al cliente tras enviar una solicitud.
- Estados de solicitud en el panel admin: nueva, contactada, confirmada, cancelada.
- Posibilidad de añadir notas internas en cada reserva.

### 2. Coherencia comercial del catálogo
- Revisar que no queden referencias comerciales a espeleología fuera de Vértigo Sapiens.
- Verificar que cada actividad muestre precio/rango y CTA visible.

### 3. SEO local y confianza
- Metadatos por página, JSON-LD de `LocalBusiness` y actividades.
- Sitemap y canonicals.
- Datos fiscales/legales visibles.

### 4. Analítica activa
- Configurar ID real de Google Analytics en `AnalyticsLoader`.
- Marcar eventos de conversión: envío de formulario, clic WhatsApp.

## Propuesta de siguiente paso

Terminar el punto 1 (confirmación al cliente + gestión de estados en admin) para que el flujo de reserva sea completo y operativo.