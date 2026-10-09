# Roadmap

## Hecho
- [x] Punto 2: página de pago /pago/:token + cobros desde el panel admin
- [x] QA: solicitud de prueba desde /contacto -> aparece en /admin y cambio de estado OK
- [x] Permisos de base de datos corregidos (el panel ya carga datos)
- [x] Botones unificados con tamaños táctiles y comportamiento responsive en toda la web

## Pendiente
- [x] Rediseñar fichas individuales y añadir vídeos oficiales verificados al Blog (sin publicar)
- [ ] Clave de Resend válida (los emails fallan: 'API key is invalid')
- [ ] Verificar dominio remitente en Resend
- [ ] Activar pagos reales (modo actual: sandbox)

## Rediseño comercial visual (21/09/2026)
- [x] Hero orientado a turismo activo guiado, grupos reducidos y CTA de catálogo/consulta
- [x] Experiencias reales destacadas en Home y acceso secundario por disciplinas
- [x] TrustBar premium y bloque de autoridad del guía con datos existentes
- [x] Tarjetas del catálogo con jerarquía comercial y salidas bajo petición
- [x] Cabecera y reserva móvil de las fichas
- [x] Verificación visual a 390, 1280 y 1440 px

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

## Calendario real de salidas (fases 1-5)
- [x] Fase 1: tablas `activity_events` y `activity_event_bookings`, `event_id` en reservas, permisos y RLS
- [x] Fase 1: funciones de plazas `reserve_event_seats`, `confirm_event_seats`, `release_expired_event_holds` (solo service_role)
- [x] Fase 1: pestaña "Salidas" en el panel admin (alta, zona pública, punto de encuentro privado, estados)
- [x] Fase 2: página pública `/calendario` y calendario del catálogo con datos reales (sin datos de ejemplo)
- [x] Fase 3: mapa de zona aproximada (sin punto exacto) con `VITE_GOOGLE_MAPS_API_KEY`
- [x] Fase 4: selector de fechas reales en ficha y reserva, con enlace `?evento=<id>` desde el calendario
- [x] Fase 5: bloqueo transaccional de plazas (retención de 30 min) y confirmación al cobrar la señal
- [ ] Fase 6 (QA con datos reales): dar de alta salidas reales y probar el flujo completo de pago

### Google Maps
- Variable de entorno: `VITE_GOOGLE_MAPS_API_KEY` (no se guarda en el código).
- Restricciones recomendadas en Google Cloud: restricción por referente HTTP a
  `https://naturalezasinlimites.es/*`, `https://www.naturalezasinlimites.es/*` y el dominio de vista previa.
- APIs a habilitar: Maps Embed API (y Maps JavaScript API si se amplía el mapa).
- Sin clave o sin coordenadas cargadas por el admin, se muestra solo el nombre de la zona: nunca se inventan coordenadas.

## Estabilización (01/10/2026)
- [x] Paso 1: RPC de plazas solo backend (service_role) y lectura pública de salidas mediante vista `activity_events_public` sin campos privados; regresión SQL en `supabase/tests/step1_event_privacy.sql`
- [ ] Paso 2: pendiente (no iniciado)

## Ajustes hero y tarjetas (03/10/2026)
- [x] Quitar badge «Deportes de aventura…» del hero y quitar el punto de «costa del Sol»
- [x] Badges de confianza del hero más grandes, estilo chips con icono (v1 aprobada)
- [x] Imagen de tarjetas abre la ficha (barranquismo/escalada/ferratas: modal; espeleología: ficha)
- [ ] Quitar TrustBar (Guía TD2, Máx. 6, material, seguro, registro) de la página /calendario
- [x] Quitar los detalles del seguro (vigencia, cobertura, formulario, «Datos del seguro») de la tarjeta de seguro en portada y TrustBar
- [x] Quitar tarjeta FAE de la sección de confianza de la portada
- [x] Aumentar tamaño del eyebrow «Por qué Naturaleza Sin Límites» (WhyChooseUs)
- [x] Mejorar teaser Vértigo Sapiens con CTA y nueva imagen de atleta (dirección Commercial conversion split)
- [x] Pie de página: «Turismo activo sostenible y entrenamiento funcional en deportes de aventura»

## Hero contacto integrado + cabecera (03/10/2026)
- [x] Hero /contacto: retrato del guía recortado e integrado en la escena del Caminito (dirección v3 elegida)
- [ ] Cabecera: al bajar, transparente (que se vea el fondo y no tape las secciones)

## Cabecera auto-ocultable (03/10/2026)
- [x] Hero de contacto integrado con el guía en la escena
- [x] Menú de navegación: se oculta al hacer scroll (escritorio) y reaparece al acercar el ratón a la cabecera

## Rediseño Vértigo Sapiens (05/10/2026)
- [x] Landing visual orientada a preparación física para montaña y deportes verticales
- [x] Test Vértigo interactivo conectado con el formulario existente
- [x] Método, transferencia, disciplinas, seguimiento, oferta, entrenador y FAQ renovados
- [x] Verificación TypeScript, build y navegador a 1280 px y 390 px, sin enviar solicitudes

## Reserva y pago visual (06/10/2026)
- [x] Corregir el acceso a `/pago/demo` en la vista previa sin habilitarlo en producción
- [x] Aplicar el lenguaje visual premium de pago a `/reservar/:category/:slug`
- [x] Verificar reserva y pago de demostración en móvil y escritorio sin enviar datos ni iniciar cobros
- [x] Mostrar un calendario mensual desplegable al pulsar el campo de fecha de la reserva
- [x] Botones de disciplinas del hero abren la página desde arriba (scroll al inicio global + enlaces sin ancla)
- [x] Eliminado el logotipo de fondo (marca de agua) del panel de reserva

## Auditoría prioridad alta (07/10/2026)
- [x] Guadalmina edad mínima 14
- [x] Solicitud sin pago vs salida programada con señal
- [x] Backend exige salida válida para señal; get-payment bloquea señales antiguas sin salida
- [x] Términos y FAQ con los dos caminos de reserva
- [x] Vía Ferrata El Chorro K3 y artículo de ferratas sin Caminito

## Remates revisión b66ba5c7 (08/10/2026)
- [x] Mensajes honestos y try/finally en reservas; salida inválida limpia fecha
- [x] get-payment: cobro de señal solo con bloqueo vigente; sesión 31 min
- [x] Limpieza segura si falla liberar plazas; solo salidas open_group
- [x] Desplegar create-activity-deposit y get-payment (08/10/2026)

## Cobro de señal ligado al bloqueo (08/10/2026)
- [x] RPC prepare_deposit_checkout (migración 0011 aplicada 08/10/2026) + checkout.ts con expires_at persistido
- [x] Texto plaza_liberada sin afirmar ausencia de cargo
- [x] Migración aplicada y get-payment + create-activity-deposit desplegadas (08/10/2026)
- [ ] Publicar la web (lo hace el usuario)

## Bloque «¿Qué estás buscando ahora mismo?» (08/10/2026)
- [x] Fichas con foto grande, titular sobre la imagen y listado corto de 4 beneficios por servicio
- [x] Texto largo eliminado y CTA naranja a ancho completo; verificado en 1280 y 390 px (sin publicar)

## Barra de filtros del catálogo (09/10/2026)
- [x] Unificado el criterio de tipo: las pestañas de disciplina son el único filtro de actividad
- [x] Todos los apartados con el mismo formato de píldora (icono + nombre + contador), letra más grande
- [x] Filtros activos mostrados como chips quitables uno a uno + botón «Limpiar filtros»
- [x] Verificado en 1280 y 390 px, build y tipos limpios (sin publicar)
