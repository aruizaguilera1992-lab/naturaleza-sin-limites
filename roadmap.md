# Roadmap

## Hecho
- [x] Punto 2: página de pago /pago/:token + cobros desde el panel admin
- [x] QA: solicitud de prueba desde /contacto -> aparece en /admin y cambio de estado OK
- [x] Permisos de base de datos corregidos (el panel ya carga datos)

## Pendiente
- [ ] Clave de Resend válida (los emails fallan: 'API key is invalid')
- [ ] Verificar dominio remitente en Resend
- [ ] Activar pagos reales (modo actual: sandbox)

## Rediseño comercial visual (21/09/2026)
- [x] Hero orientado a turismo activo guiado, grupos reducidos y CTA de catálogo/consulta
- [x] Experiencias reales destacadas en Home y acceso secundario por disciplinas
- [x] TrustBar premium y bloque de autoridad del guía con datos existentes
- [x] Tarjetas del catálogo con jerarquía comercial y salidas bajo petición
- [x] Cabecera y reserva móvil de las fichas
- [ ] Verificación visual a 390, 1280 y 1440 px

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

## Sprint 1 (auditoría competitiva)
- [x] Dominio canónico único https://naturalezasinlimites.es (src/lib/site.ts, sitemap.xml, robots.txt, index.html, fichas)
- [x] Franja de confianza verificable (TrustBar: TD2, máx. 6 personas, material homologado, seguro RC) en Home, ficha y reserva
- [x] Eliminados los textos "[PENDIENTE DE CONFIRMAR]" visibles (campos ocultos o "se confirma al reservar")
- [x] Tarjetas de catálogo con precio visible, "Máx. 6 personas", CTA "Reservar" y "Ver experiencia"
- [x] Catálogo comercial limitado a actividades con precio real (espeleología queda fuera del listado; su dataset y su ficha se conservan)
- [ ] Publicar número de registro de turismo activo, número de póliza de RC y aseguradora (falta el dato real)
- [ ] Confirmar precio y duración de las 3 propuestas de espeleología para devolverlas al catálogo

## Auditoría pre-publicación (20/09/2026)
- [x] Dominio .com corregido en blog, artículos, privacidad y términos (`absoluteUrl`)
- [x] Correo del pie corregido a naturaleza.s.limites@gmail.com
- [x] Componente `src/components/Seo.tsx` y metadatos propios en portada, actividades,
      contacto, quiénes somos, vértigo sapiens, barranquismo, escalada, ferratas y espeleología
- [x] 404 en español, con enlaces útiles y marcada como no indexable
- [x] Testimonios ficticios retirados (portada y sección de Vértigo Sapiens)
- [x] Aviso de modo de prueba de pagos oculto en el dominio público
- [x] Desborde horizontal de la portada en móvil corregido
- [x] Eliminado el archivo de testimonios ficticios de Vértigo Sapiens
- [x] Etiquetas duplicadas quitadas de `index.html` (manda el componente `Seo` de cada página)
- [x] Dirección canónica en `/cookies`; `/reservar/...` marcada `noindex, follow`
- [x] Fichas de espeleología fuera del mapa del sitio (se mantiene `/espeleologia`)
- [ ] Registro de turismo activo, aseguradora y póliza de RC (falta el dato real)
- [ ] Identificador real de Google Analytics (`src/components/AnalyticsLoader.tsx`)
- [ ] Decidir espeleología: precio y duración, o retirarla también del mapa del sitio
- [ ] Camino "no veo mi fecha" en ficha y reserva
- Nota: las imágenes del almacén de recursos (`/__l5e/assets-v1/...`) no se sirven en el
  servidor de desarrollo local; en la vista previa y en producción responden correctamente.

### Estado de Stripe (interno, no mostrar al cliente)
- Modo actual: SANDBOX/test. Checkout embebido, señal del 30 % calculada en servidor,
  idempotencia por (solicitud, generación, importe, moneda, origen), `automatic_tax`
  con `tax_code` txcd_20030000 y webhook idempotente: todo verificado y correcto.
- Para pasar a producción falta: completar la verificación de la cuenta de pagos
  (go-live), que genera STRIPE_LIVE_API_KEY, PAYMENTS_LIVE_WEBHOOK_SECRET y el token
  público live. No requiere cambios de código: el entorno se deriva del prefijo del token.
- También pendiente: clave de Resend válida y remitente verificado para los correos.
