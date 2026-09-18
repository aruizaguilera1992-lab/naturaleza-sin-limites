# Roadmap

## Hecho
- [x] Punto 2: página de pago /pago/:token + cobros desde el panel admin
- [x] QA: solicitud de prueba desde /contacto -> aparece en /admin y cambio de estado OK
- [x] Permisos de base de datos corregidos (el panel ya carga datos)

## Pendiente
- [ ] Clave de Resend válida (los emails fallan: 'API key is invalid')
- [ ] Verificar dominio remitente en Resend
- [ ] Activar pagos reales (modo actual: sandbox)

## Fichas comerciales y SEO del catálogo
- [x] Crear modelo editorial común para todas las actividades publicadas
- [x] Crear rutas individuales y enlazarlas desde `/actividades`
- [x] Añadir contenido de conversión, FAQ, ficha técnica y SEO local
- [x] Marcar datos operativos no confirmados sin inventarlos
- [ ] Sustituir campos pendientes cuando el negocio confirme ratios, encuentros, material y políticas

## Visual image review
- [x] Inventory every image source and usage
- [x] Centralize image URLs and alt text
- [x] Replace priority hero, activity, training, about, and testimonial imagery
- [x] Add responsive loading and LCP behavior
- [x] Verify desktop and mobile rendering

## Bloque prioritario (fiabilidad de pagos, correo y formularios)
- [x] Confirmación de pago atómica e idempotente (función de base de datos con bloqueo y validación de entorno, importe y moneda)
- [x] Reutilización de la sesión de cobro para no crear cobros duplicados; sin reintento silencioso sin impuestos
- [x] Estado real de los correos (enviado / fallido / omitido) y registro de avisos con reintento desde el panel
- [x] Formularios con nombre, email y teléfono separados; reservas de 1 a 6 personas y consulta para grupos mayores
- [x] Newsletter y promesa de descuento ocultas (código conservado)
- [ ] Clave de Resend válida + remitente verificado (pendiente del usuario)

## Fotografías de fichas
- [x] Fotos reales individuales y metadatos para las 68 actividades publicadas
- [x] Verificación visual responsive del catálogo y las fichas

## Pagos y suscripciones (actualizado)
- [x] Señal del 30% pagable online desde la ficha de actividad (/reservar/:categoria/:slug)
- [x] Pestaña "Altas y planes" en el panel con estado de suscripciones y último cobro
- [x] Portal de gestión para el cliente (/mi-suscripcion/:token) enlazado en el correo de alta
- [x] Webhook registra renovaciones y cobros fallidos (invoice.paid / invoice.payment_failed)
- [ ] Activar cobros reales (pendiente de completar verificación de la cuenta de pagos)
