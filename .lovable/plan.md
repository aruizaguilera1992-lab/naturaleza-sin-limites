# Auditoría competitiva: Naturaleza Sin Límites vs TUUR Adventure

Auditoría del estado actual del proyecto. No incluye cambios de código.

## 1. Home (`/`, `src/pages/Index.tsx`)

| # | Página/componente | Qué existe hoy | Carencia frente al benchmark | Mejora propuesta | Prioridad | Esfuerzo | Objetivo |
|---|---|---|---|---|---|---|---|
| 1.1 | `HeroSection.tsx` | Vídeo, H1 "Naturaleza Sin Límites / Vive la Aventura, Entrena Como un Pro", CTA "¡Reserva tu Aventura!" que hace scroll a una sección | El H1 no dice qué se vende ni dónde; el CTA no lleva al catálogo real (`/actividades`) | H1 orientado a búsqueda y venta ("Barranquismo, escalada y vías ferratas guiados en Málaga") y CTA directo a `/actividades` | ALTA | S | Más entradas al catálogo |
| 1.2 | `ActivitiesGrid.tsx` (home) | 4 tarjetas de disciplina | Sin actividades concretas destacadas con precio/duración | Bloque "Más reservadas" con 3-4 fichas reales (precio desde, duración, nivel, zona) | ALTA | M | Acortar el camino a la reserva |
| 1.3 | `WhyChooseUs.tsx` | Testimonios con nombres genéricos (María García, Carlos Rodríguez, Laura Martínez) y stats "50+ rutas / 10+ años" | Sin reseñas verificables ni fuente | Sustituir por reseñas reales de Google con enlace al perfil, o retirarlas hasta tenerlas | ALTA | S | Confianza: reseñas falsas restan más de lo que suman |
| 1.4 | Home completa | Bloque de seguridad solo como texto genérico | Sin registro de turismo activo ni póliza de RC visibles (TUUR los muestra) | Franja de confianza con nº de registro de turismo activo de Andalucía, aseguradora y nº de póliza, titulación TD2 y ratio máx. 6 | BLOQUEANTE | S | Requisito legal y palanca de confianza |
| 1.5 | Home | No hay FAQs en portada | TUUR resuelve dudas antes del clic | Bloque de 6 FAQs transversales (nivel necesario, qué llevar, menores, meteorología, cancelación, pago) | MEDIA | S | Menos abandono |
| 1.6 | `VertigoSapiens.tsx` | Sección presente | Compite en atención con la venta de actividades | Situarla tras el bloque de confianza, con CTA secundario | BAJA | S | Claridad de embudo |

## 2. Catálogo (`/actividades`, `src/pages/Actividades.tsx`)

| # | Qué existe | Carencia | Mejora | Prio | Esf. | Objetivo |
|---|---|---|---|---|---|---|
| 2.1 | Filtros por tipo, nivel, duración, provincia, características y precio; vistas grid/lista; comparador y favoritos | Falta filtro por edad mínima y por "apto para principiantes" | Añadir esos dos filtros con los datos ya presentes en las fichas | MEDIA | M | Autoselección del cliente |
| 2.2 | Tarjetas con tipo, zona, duración, nivel | Precio no siempre visible y sin "Reservar" en tarjeta | Mostrar "Desde X€/persona" y botón de reserva directa cuando hay precio | ALTA | S | Menos clics hasta el pago |
| 2.3 | Sin ninguna señal de disponibilidad | TUUR muestra disponibilidad/fechas | Etiqueta simple "Salidas bajo petición · respuesta en 24 h" o fechas abiertas del mes | ALTA | M | Expectativa realista y urgencia |
| 2.4 | `src/data/espeleologia.ts` y varias fichas con precio/duración "Consultar disponibilidad" y `[PENDIENTE DE CONFIRMAR]` | Datos incompletos visibles al cliente | Completar los campos reales; mientras tanto, no listar esas actividades en el catálogo comercial | BLOQUEANTE | M | Credibilidad y conversión |
| 2.5 | `/actividades` sin `<Helmet>` | Sin title/description propios ni canonical | Metadatos propios para la página de catálogo | ALTA | S | SEO |

## 3. Fichas individuales (`/actividades/:categoria/:slug`)

| # | Qué existe | Carencia | Mejora | Prio | Esf. | Objetivo |
|---|---|---|---|---|---|---|
| 3.1 | 19 secciones completas: highlights, seguridad, incluye, qué llevar, punto de encuentro, itinerario, ficha técnica, 8 FAQs, SEO local, JSON-LD Product+FAQ+LocalBusiness, relacionadas | Muy buen nivel, por encima del benchmark en profundidad | Mantener | — | — | — |
| 3.2 | Texto generado por plantilla (`buildEditorial`) casi idéntico entre fichas | Riesgo de contenido duplicado a ojos de Google; lectura impersonal | Reescribir manualmente descripción + 2 párrafos SEO de las 10-15 actividades estrella | ALTA | L | Posicionamiento por actividad |
| 3.3 | Aviso "los campos pendientes se confirmarán" y `[PENDIENTE DE CONFIRMAR]` en highlights, ratio y salida privada | TUUR publica datos cerrados | Rellenar ratio guía-participante, punto de encuentro y precio de privada | BLOQUEANTE | M | Confianza en el momento de decidir |
| 3.4 | CTA "Solicitar salida privada" por WhatsApp | Sin página ni precio de experiencia privada | Precio de privada por actividad y formulario propio | MEDIA | M | Ticket medio |
| 3.5 | `SITE_URL = 'https://vertigo-adventures-hub.lovable.app'` en canonical y JSON-LD | El dominio real es naturalezasinlimites.es | Corregir la URL base en canonical, og:url y schema | BLOQUEANTE | S | SEO: hoy se canonicaliza al dominio equivocado |
| 3.6 | Cross-selling: 3 relacionadas por categoría | Sin packs ni "combina con" | Sugerir pack de 2 actividades del mismo fin de semana | MEDIA | M | Ticket medio |

## 4. Flujo de reserva (`/reservar/:categoria/:slug`, `ReservarActividad.tsx`)

| # | Qué existe | Carencia | Mejora | Prio | Esf. | Objetivo |
|---|---|---|---|---|---|---|
| 4.1 | Formulario en un paso: fecha, participantes (1-6), nombre, email, teléfono, comentarios, RGPD; señal 30% y pago Stripe | Fecha libre sin comprobación de disponibilidad: el cliente paga sin saber si hay hueco | Calendario con fechas no disponibles bloqueadas, o confirmación previa antes del cobro | ALTA | L | Menos devoluciones y fricción |
| 4.2 | Si la fecha no encaja, no hay salida alternativa | TUUR recupera al cliente con formulario de lista de espera | Bloque "¿No ves tu fecha?" con captura de email/fecha deseada | ALTA | M | Recuperación de leads |
| 4.3 | Página de reserva sin cabecera ni pie | El cliente pierde contexto y señales de confianza en el paso de pago | Añadir resumen de seguridad, contacto y política de devolución al lateral | MEDIA | S | Confianza en el pago |
| 4.4 | Solo un error de texto plano en validación | Sin feedback campo a campo | Validación inline por campo | BAJA | S | Menos abandono en móvil |
| 4.5 | Modo pruebas de Stripe activo | Sin cobros reales | Activar cobros reales | BLOQUEANTE | S | Vender |

## 5. Móvil y accesibilidad

| # | Qué existe | Carencia | Mejora | Prio | Esf. | Objetivo |
|---|---|---|---|---|---|---|
| 5.1 | Diseño responsive revisado, targets de 44 px en fichas | Sin CTA fijo de reserva en móvil en la ficha | Barra inferior fija con precio + "Reservar" | ALTA | S | Conversión móvil |
| 5.2 | Vídeo hero con `preload="metadata"` y respeto a movimiento reducido | Peso del hero en 4G | Servir el vídeo solo en escritorio y poster en móvil | MEDIA | S | Velocidad y posicionamiento |
| 5.3 | Emojis en las etiquetas de tipo de actividad | Lectores de pantalla los verbalizan | Marcarlos como decorativos | BAJA | S | Accesibilidad |

## 6. SEO

| # | Qué existe | Carencia | Mejora | Prio | Esf. | Objetivo |
|---|---|---|---|---|---|---|
| 6.1 | `index.html` con title/description/OG/schema Organization | og:url y @id apuntan al dominio lovable.app | Cambiar a naturalezasinlimites.es | BLOQUEANTE | S | SEO |
| 6.2 | `public/sitemap.xml` y `robots.txt` | Todas las URLs con el dominio lovable.app | Regenerar con el dominio real | BLOQUEANTE | S | Indexación |
| 6.3 | Solo las fichas y páginas legales usan `<Helmet>`; `/`, `/actividades`, `/barranquismo`, `/escalada`, `/vias-ferratas`, `/espeleologia`, `/vertigo-sapiens`, `/quienes-somos`, `/contacto` no tienen metadatos propios | Todas comparten el title genérico | Title, description y canonical por página | ALTA | M | Tráfico orgánico |
| 6.4 | Páginas de disciplina con cuestionario | Sin contenido SEO local por zona (El Chorro, Ronda, Sierra de las Nieves) | Páginas de zona que enlacen a sus actividades | MEDIA | L | Búsquedas "barranquismo Ronda" |
| 6.5 | Blog con 3 artículos | Poco volumen y enlazado débil | Enlazar cada artículo a 2-3 fichas y publicar 1 artículo/mes de intención local | MEDIA | M | Captación orgánica |
| 6.6 | Schema en fichas | Sin `AggregateRating` ni breadcrumbs | Breadcrumbs (`BreadcrumbList`) y valoraciones cuando haya reseñas reales | MEDIA | S | Resultados enriquecidos |

## 7. B2B

| # | Qué existe | Carencia | Mejora | Prio | Esf. | Objetivo |
|---|---|---|---|---|---|---|
| 7.1 | Nada: no hay ruta ni sección de empresas | TUUR tiene página específica de team building | Página `/empresas` con propuesta, formato de jornada, capacidades, casos y formulario de presupuesto | ALTA | M | Ticket alto y entre semana |
| 7.2 | Reservas limitadas a 6 personas; grupos mayores derivados a contacto | Sin oferta explícita a hoteles, casas rurales y centros educativos | Bloque de colaboración para alojamientos (comisión) y programas escolares | MEDIA | M | Canal de prescripción |
| 7.3 | `BookingForm.tsx` y `/contacto` | No segmentan particular vs empresa | Selector de tipo de cliente en el formulario | BAJA | S | Cualificación de leads |

## 8. Diferenciación propia

| # | Qué existe | Carencia | Mejora | Prio | Esf. | Objetivo |
|---|---|---|---|---|---|---|
| 8.1 | "Máximo 6 personas" solo aparece en `WhyChooseUs` | No se repite donde se decide (catálogo, ficha, reserva) | Etiqueta "Grupos de máximo 6" en tarjeta, ficha y checkout | ALTA | S | Diferencial frente al volumen de TUUR |
| 8.2 | Titulación TD2 no aparece en el sitio | TUUR presenta a su equipo | Sección de guía con foto, titulación TD2, años y disciplinas | ALTA | S | Confianza |
| 8.3 | Protocolos y material homologado en una frase | Sin detalle | Página o bloque "Cómo trabajamos la seguridad": material, revisiones, protocolos, seguros | MEDIA | M | Confianza |
| 8.4 | Vértigo Sapiens desarrollado | Sin puente comercial desde las actividades | En cada ficha, enlace "Entrena para esta actividad" | BAJA | S | Recurrencia |

## Top 10 priorizado por impacto en reservas

1. Corregir el dominio en canonical, og:url, schema, sitemap y robots (hoy todo apunta a lovable.app). BLOQUEANTE / S
2. Activar cobros reales en la pasarela. BLOQUEANTE / S
3. Publicar registro de turismo activo, seguro de RC y titulación TD2 en home, fichas y checkout. BLOQUEANTE / S
4. Eliminar o completar los datos `[PENDIENTE DE CONFIRMAR]` de las fichas comerciales. BLOQUEANTE / M
5. Disponibilidad real en la reserva (calendario con fechas bloqueadas) + formulario "no veo mi fecha". ALTA / L
6. Precio visible y botón de reserva en la tarjeta del catálogo. ALTA / S
7. Barra fija de precio + "Reservar" en móvil en la ficha. ALTA / S
8. Metadatos propios en las 9 páginas que hoy no los tienen. ALTA / M
9. Página `/empresas` de team building con formulario de presupuesto. ALTA / M
10. Sustituir los testimonios genéricos por reseñas reales de Google y añadir la ficha del guía. ALTA / S

## Notas técnicas

- `SITE_URL` está fijado en `src/pages/ActivityProfilePage.tsx:14`; conviene centralizarlo en una constante compartida con `index.html`, `public/sitemap.xml` y `public/robots.txt`.
- El contenido editorial de las 68 fichas se genera en `buildEditorial()` (`src/data/activityProfiles.ts`), lo que permite sobreescribir texto por actividad sin rehacer la estructura.
- Solo 14 páginas usan `<Helmet>`; el resto hereda el `<head>` de `index.html`.
- El flujo de pago ya es sólido (señal 30 % calculada en servidor, idempotencia, webhook, correos); la carencia es de producto (disponibilidad), no de infraestructura.
