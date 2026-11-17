# Roadmap

## Carrusel lateral de vídeos en el blog
- [x] Convertir la sección «Vídeos de Naturaleza Sin Límites» en un carrusel lateral con flechas y enlace al canal; 1 tarjeta en móvil, 3 en escritorio, comprobado con sesión sin aviso de cookies, sin publicar.

## Artículo de vías ferratas (17/11/2026)
- [x] Sustituir «3 Vías Ferratas Espectaculares de Andalucía» por un post sencillo que define qué es una vía ferrata, misma dirección web, sin publicar.

## Imágenes de tarjetas de capacidades (17/11/2026)
- [x] Añadir fotografía de fondo a las tarjetas 03 «Movilidad y estabilidad» y 04 «Progreso con criterio» de «Lo que la montaña te pide» en /vertigo-sapiens, con fotos ya licenciadas del proyecto; comprobado en escritorio y móvil sin publicar.

## Motivos visuales de capacidades físicas
- [x] Añadir cuatro motivos lineales naranjas: ascenso continuo, tensión/agarre, articulación estable y progresión escalonada; escritorio y móvil comprobados, compilación OK, sin publicar.

## Completar barrancos del catálogo admin (17/11/2026)
- [x] Incorporar Mina y Raja de Alicún; conservar Magdalena completa, recorridos originales, Zarzalones integral y superior distintos de los tramos comerciales.
- [x] Revisar grados avanzados de Aguilera/Castillejos contra el mapa; 5 pruebas y compilación OK, 44 barrancos visibles con sesión admin y editor integral comprobado sin escrituras ni publicación. Las referencias siguen pendientes de validación comercial y sin precios/fotos nuevos; no supone inventario exhaustivo de todos los barrancos de Andalucía.

## Asistente IA de fichas
- [x] Propuestas editables en salidas privadas y abiertas, sin guardar/enviar automáticamente ni modificar datos operativos.
- [x] Generación real y aplicación manual comprobadas con sesión admin en ambos editores; precio/plazas intactos, diálogo móvil comprobado, 141 pruebas y compilación OK. Función desplegada; sin guardar fichas, enviar correos ni publicar web. Detener implementado; cancelación durante una generación no probada.

## Recibo final de pagos (17/11/2026)
- [x] Corregir confirmación de fecha en reservas privadas pagadas, mantener incidencias reales de plazas.
- [x] Mostrar total acordado, pagado acumulado y saldo en recibo y página de pago; felicitación y próximos pasos.
- [x] Enlazar suscripción voluntaria con doble confirmación; 20 pruebas de recibos y 139 del proyecto pasan, enlace real de Jorox verificado en escritorio/móvil (90 € total, 1 € pagado, 89 € pendiente); get-payment, payments-webhook y create-payment-link desplegadas. Sin nuevos cobros, envíos ni publicación web; los correos ya enviados no se modifican.

## Normas y pasos de salidas
- [x] Añadir campos editables y listados visibles al cliente en salidas privadas y abiertas; guardado/reapertura de ambos y enlace privado en móvil comprobados, pruebas temporales eliminadas; 139 pruebas y compilación OK, sin alterar pagos ni publicar.

## Aclaración comercial de correos (15/10/2026)
- [x] Distinguir señales administrativas confirmadas de solicitudes y pagos genéricos con evidencia fiable
- [x] Actualizar economía/resto, pruebas y muestras ficticias; revisar escritorio/móvil sin envíos ni despliegue
- Límite actual: create-payment-link crea kind=manual por defecto; solo señales ya identificadas kind=senal pueden usar confirmación comercial. No se reclasificaron pagos ni registros. notification_log registra aceptación del envío, no una fecha histórica confirmada independiente.

## Acceso a gestión (15/10/2026)
- [x] Rediseñar login, entrada en footer y estados sin acceso del panel
- [x] Probar destinos seguros, retorno, errores/cancelación y vistas móvil/escritorio sin OAuth real

## Correos de reservas y pagos (15/10/2026)
- [x] Rediseñar solicitud, enlace, recibo, aviso administrativo y confirmación con el renderer compartido
- [x] Verificar estados, escape, importes, ausentes y vistas HTML ficticias en escritorio/móvil
- [ ] Desplegar funciones de correo (bloqueado: requiere petición adicional del usuario; no desplegar en esta tarea)

## Hecho
- [x] Punto 2: página de pago /pago/:token + cobros desde el panel admin
- [x] QA: solicitud de prueba desde /contacto -> aparece en /admin y cambio de estado OK
- [x] Permisos de base de datos corregidos (el panel ya carga datos)
- [x] Botones unificados con tamaños táctiles y comportamiento responsive en toda la web

## Pendiente
- [x] Rediseñar fichas individuales y añadir vídeos oficiales verificados al Blog (sin publicar)
- [x] Clave de Resend válida (conexión conectada el 15/10/2026; envíos verificados)
- [x] Dominio remitente verificado en Resend (naturalezasinlimites.es, los 3 registros en verde)
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
- [x] Clave de Resend válida + remitente verificado (comprobado el 15/10/2026: correo de prueba entregado)

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
- Correos: remitente verificado y envíos comprobados el 15/10/2026.

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

## Registros DNS de Resend (15/10/2026)
- [x] Comprobado en Resend: naturalezasinlimites.es está **verificado** (alta 17/09/2026, región eu-west-1, envío activo)
- [x] Los 3 registros (DKIM TXT `resend._domainkey`, SPF CNAME `rsend` y `send`) aparecen como verificados: nada que añadir en Hostinger
- [x] Remitente real ya en uso: `reservas@naturalezasinlimites.es`, con respuesta a `naturaleza.s.limites@gmail.com`
- [x] Envío de prueba enviado y entregado con el nuevo canal
- [x] El backend envía ahora a través del gateway de la conexión (antes llamaba a la API de Resend de forma directa)
- [x] Detalle de reserva en pantalla principal de /admin (lista + detalle, sin panel lateral) con descuento aplicado que recalcula total, senal y saldo
- [x] /admin: el menú lateral solo en escritorio (lg); en tableta y móvil se abre con el botón ☰
- [x] Descuentos por porcentaje (migración 0012: bookings.discount_percent 0-100); el importe fijo discount_cents queda como legado
- [ ] Publicar la web (lo hace el usuario)

## Etiquetas de sección y logros (09/11/2026)
- [x] Quitar la etiqueta tipo pastilla de todos los títulos de sección (blog, cookies, privacidad, packs; componentes de Vértigo Sapiens no usados)
- [x] Añadir al palmarés: 2º de España y Andalucía · Open de Travesía de Velocidad en Cueva · Sima de Villaluenga del Rosario · 2026

## Ficha de cliente + editorial/newsletter (plan aprobado 14-nov-2026)
- [x] Regla de coincidencias de reservas (crmMatching) con pruebas
- [x] Sprint 1A: ficha de contacto con cabecera y pestañas
- [x] Sprint 2: suscripción real con doble confirmación + 10 %
- [x] Sprint 3: editor con vista previa y SEO, guardado/publicación/retirada atómicos solo admin, blog combinado conservando artículos y URLs. 95 pruebas OK; borrador guardado y reabierto con sesión real, no visible públicamente. No se publicó ningún artículo de prueba ni la web; sitemap de nuevos artículos pendiente del paso acordado posterior.
- [x] Sprint 4: campañas por disciplina, compositor compartido con vista previa, prueba al administrador, envío inmediato/programado, historial y consentimiento. Guardado/reapertura/programación/cancelación verificados con sesión admin y callback autorizado 200; sin envíos comerciales ni publicación de la web.
- [ ] Verificar aceptación del correo de prueba y entrega comercial del sprint 4 (requiere autorización para enviar; no se enviaron correos durante esta implementación).
- Quitar los dos botones del inicio (hecho)
- Centrar texto de la portada sin tapar el vídeo (hecho)

- [x] Vídeo de portada completo
- [x] Barrancos de Andalucía en catálogo admin
- [x] Enter en campos de listado de fichas (Incluye/Qué llevar/Requisitos) — corregido con texto en bruto por campo
- [x] Fotos del guía sustituidas por la nueva foto natural (retrato + recorte del hero de contacto)
- [x] Subir fotos desde el PC en el editor de fichas (botón junto al selector de foto)
- [x] Retrato de Contacto recolocado en tablet para que no tape la cara (márgenes negativos + título text-6xl en md-lg)
- [x] Borrar salidas de grupo abierto desde Salidas (RPC admin_delete_activity_event; rechaza si hay reservas activas)
- [x] Cambiar imágenes de tarjetas en Contacto (ContactPathsSection)
