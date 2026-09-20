# Auditoría pre-publicación — Naturaleza Sin Límites

Diagnóstico verificado el 20/09/2026 sobre el estado actual, con revisión de código y pruebas reales en la vista previa (escritorio 1280 px y móvil 390 px). No se ha modificado nada.

## 1) Veredicto de lanzamiento

**No publicar todavía.** Hay tres fallos verificados que dañan la imagen y el posicionamiento desde el primer día: las fotografías no se cargan, cuatro páginas declaran un dominio equivocado (.com) y la mayoría de páginas comparten el mismo título y descripción. Son arreglos de pocas horas; una vez hechos, el sitio queda publicable.

## 2) Bloqueantes antes de publicar

1. **Las imágenes no se cargan.** Todas las fotos servidas desde el almacén de recursos (logotipo, 68 fotos de actividad, fotos editoriales, póster del vídeo) devuelven una página HTML en lugar de una imagen. Comprobado: la petición al archivo del logotipo responde `Content-Type: text/html`, y el navegador reporta ancho 0 en portada, catálogo, ficha, contacto y quiénes somos. *Dónde:* `src/assets/**/*.asset.json`, `src/data/activityMedia.ts`, `src/data/media.ts`, `src/components/HeroSection.tsx` (póster), `src/components/Navbar.tsx` y `src/components/Footer.tsx` (logotipo).
2. **Dominio equivocado en páginas indexables.** Cuatro páginas declaran `naturalezasinlimites.com` (no existe) como dirección canónica y de compartición: `src/pages/Blog.tsx:69`, `src/pages/BlogPost.tsx:39,57,73`, `src/pages/Privacidad.tsx:212,219`, `src/pages/Terminos.tsx:201,208`.
3. **Correo de contacto inexistente en el pie.** `info@naturalezasinlimites.com` en `src/components/Footer.tsx:27`; el correo real del negocio es `naturaleza.s.limites@gmail.com`. Un cliente que escriba ahí no llega a nadie.
4. **Títulos y descripciones duplicados.** Portada, `/actividades`, `/contacto`, `/quienes-somos`, `/vertigo-sapiens`, `/barranquismo`, `/escalada`, `/vias-ferratas`, `/espeleologia` y la página 404 muestran todas el mismo título y la misma descripción, y ninguna declara dirección canónica propia (verificado en navegador). Solo 14 páginas usan metadatos propios.
5. **Testimonios inventados.** "María García", "Carlos Rodríguez" y "Laura Martínez" con 5 estrellas en `src/components/WhyChooseUs.tsx:35-56` son ficticios. Publicar reseñas falsas es un riesgo legal (práctica comercial engañosa) además de reputacional.
6. **Datos legales obligatorios ausentes.** Sigue sin publicarse el número de registro de turismo activo de Andalucía, la aseguradora y el número de póliza de RC. Son exigibles a una empresa de turismo activo y hoy no aparecen en ninguna página.
7. **Página 404 sin indicación a buscadores.** `/ruta-inexistente-xyz` devuelve la portada en cuanto a título y metadatos. *Dónde:* `src/pages/NotFound.tsx`.

## 3) Importantes (primeros 7 días)

- **Cobros reales sin activar.** Todo el circuito está en modo de pruebas: `.env.development` usa una clave `pk_test_`. Falta únicamente completar la verificación de la cuenta de pagos; no requiere cambios de código. Mientras tanto, cualquier visitante que llegue a `/pago/...` ve el aviso "Modo de prueba: los pagos realizados aquí no son reales" (`src/components/PaymentTestModeBanner.tsx`), que **no debe verse en producción**.
- **Correos de confirmación sin funcionar.** La clave de Resend sigue marcada como inválida en la hoja de ruta y el remitente `reservas@naturalezasinlimites.es` no está verificado. Resultado: se cobra la señal pero el cliente no recibe confirmación.
- **Analítica sin configurar.** `GA_ID = 'G-XXXXXXX'` en `src/components/AnalyticsLoader.tsx:5`. Se publicaría sin medir nada.
- **Desborde horizontal en la portada en móvil (390 px).** Verificado: varios elementos llegan a 397-415 px sobre un ancho de 390. Afecta a una tarjeta y a sus etiquetas superpuestas.
- **Espeleología aparece en el catálogo y en el mapa del sitio.** Se dijo retirada por falta de precio, pero `src/hooks/useActivitiesData.ts:232` la sigue incorporando y `public/sitemap.xml` publica sus tres fichas. Decidir: ponerle precio o retirarla también del mapa del sitio.
- **Los botones "Reservar" y "Ver experiencia" no son legibles en el listado.** Existen en `src/components/actividades/ActivitiesGrid.tsx:122-126,270-274`, pero en la prueba en escritorio no aparecen como texto visible sin interacción, mientras "Máx. 6" y "Desde X €" sí. Hay que confirmar si quedan ocultos tras un efecto de hover: si es así, en móvil no hay CTA de reserva en la tarjeta.
- **Dirección canónica duplicada en las fichas.** La ficha de actividad emite dos `og:url` (la general de la portada y la suya). Conviene dejar solo la propia.
- **Recuperación cuando no hay fecha.** No existe un camino claro "no veo mi fecha" desde la ficha o la reserva; hoy el usuario solo tiene WhatsApp.

## 4) Mejoras posteriores

- Reseñas reales verificables (Google) sustituyendo el carrusel actual.
- Ficha pública del guía con su titulación y experiencia enlazada desde cada actividad.
- Política de cancelación y meteorología visible en la ficha y antes del pago, no solo en Términos.
- Datos estructurados por actividad (producto/oferta con precio) además del actual de organización.
- Enlazado interno entre fichas de la misma zona y entre blog y actividades.
- Página para empresas y grupos.
- Reducir el peso del paquete inicial (la compilación avisa de bloques >500 kB).

## 5) Checklist por página

| Ruta | Estado | Motivo |
|---|---|---|
| `/` | BLOQUEANTE | Imágenes rotas, metadatos duplicados, testimonios ficticios, desborde en móvil |
| `/actividades` | REVISAR | Fotos rotas, metadatos duplicados, CTA no visible sin interacción, espeleología sin precio |
| Ficha barranquismo (Buitreras) | REVISAR | Foto rota y `og:url` duplicado; el resto (título, descripción, canónica, H1, precio) correcto |
| Ficha escalada / vía ferrata | REVISAR | Mismo patrón que la anterior |
| `/reservar/:categoría/:slug` | OK | Título propio, sin desborde en móvil, franja de confianza presente |
| Pago `/pago/:token` | REVISAR | Funciona en pruebas; el aviso de modo de prueba no debe verse en producción |
| `/contacto` | REVISAR | Metadatos duplicados, imágenes rotas |
| `/quienes-somos` | REVISAR | Metadatos duplicados, imágenes rotas |
| `/vertigo-sapiens` | REVISAR | Metadatos duplicados |
| `/blog` y post | BLOQUEANTE | Dirección canónica a un dominio inexistente |
| Pie, legales y navegación | BLOQUEANTE | Correo inexistente; canónicas .com en privacidad y términos |
| 404 | REVISAR | Sin metadatos propios |
| Móvil 390 px | REVISAR | Desborde en portada; el resto correcto |
| Escritorio 1280 px | OK | Sin desbordes |

## 6) Archivos donde está cada problema

- Dominio .com: `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`, `src/pages/Privacidad.tsx`, `src/pages/Terminos.tsx`
- Correo falso: `src/components/Footer.tsx:27`
- Metadatos ausentes: `src/pages/Index.tsx`, `Actividades.tsx`, `Contacto.tsx`, `QuienesSomos.tsx`, `VertigoSapiensPage.tsx`, `Barranquismo.tsx`, `Escalada.tsx`, `ViasFerratas.tsx`, `Espeleologia.tsx`, `NotFound.tsx`
- `og:url` duplicado: `index.html:15` + `src/pages/ActivityProfilePage.tsx`
- Imágenes: `src/assets/**/*.asset.json`, `src/data/activityMedia.ts`, `src/data/media.ts`, `src/components/HeroSection.tsx`
- Testimonios: `src/components/WhyChooseUs.tsx:35-56`
- Analítica: `src/components/AnalyticsLoader.tsx:5`
- Espeleología en catálogo: `src/hooks/useActivitiesData.ts:232`, `public/sitemap.xml`
- CTA de tarjetas: `src/components/actividades/ActivitiesGrid.tsx`
- Aviso de modo de prueba: `src/components/PaymentTestModeBanner.tsx`
- Pagos y correos: `supabase/functions/get-payment`, `create-activity-deposit`, `payments-webhook`, `_shared/email.ts`

## 7) Lo que ya está bien y no conviene tocar

- Señal del 30 % calculada en el servidor, nunca en el navegador (`create-activity-deposit`), con validación estricta de los datos del formulario.
- Cobro único garantizado: clave de idempotencia por solicitud/importe/moneda y confirmación atómica en base de datos; el webhook no duplica reservas.
- Impuestos resueltos con el código fiscal correcto tras el error anterior.
- Página de retorno del pago con reintento de confirmación y mensajes claros de enlace caducado o ya pagado.
- Franja de confianza con afirmaciones verificables y sin números inventados (`src/components/TrustBar.tsx`).
- Consentimiento de cookies completo: banner, preferencias y bloqueo real de scripts hasta aceptar.
- Formularios públicos sin acceso directo a la base de datos; el rol anónimo ya no tiene permisos sobre tablas y el panel exige rol de administrador.
- Mapa del sitio y robots ya apuntan al dominio correcto; no queda ninguna dirección de vista previa en los datos públicos.
- Fichas de actividad: título, descripción, canónica y H1 propios y bien formados.
- Sin errores de ejecución en ninguna ruta probada (solo un aviso interno de React, inofensivo).

## 8) Plan de acción ordenado por impacto y esfuerzo

**Bloque 1 — antes de publicar (medio día)**
1. Reparar la entrega de imágenes y verificar que cargan en portada, catálogo y fichas.
2. Cambiar las direcciones .com por naturalezasinlimites.es usando el helper ya existente `src/lib/site.ts`.
3. Corregir el correo del pie.
4. Dar título, descripción y canónica propios a las 10 páginas que no los tienen, y marcar la 404 como no indexable.
5. Retirar o sustituir los testimonios ficticios.
6. Publicar registro de turismo activo, aseguradora y póliza (necesito los datos reales).
7. Ocultar el aviso de modo de prueba en producción.

**Bloque 2 — primera semana**
8. Completar la verificación de la cuenta de pagos y pasar a cobros reales.
9. Clave de Resend válida y remitente verificado; probar el correo de confirmación de punta a punta.
10. Identificador real de analítica.
11. Corregir el desborde de la portada en móvil.
12. Decidir el caso de espeleología (precio o retirada también del mapa del sitio).
13. Hacer visibles los botones "Reservar" y "Ver experiencia" en el listado, también en móvil.
14. Añadir el camino "no veo mi fecha" en ficha y reserva.

**Bloque 3 — después**
15. Reseñas reales, ficha del guía, política de cancelación destacada, datos estructurados por actividad, enlazado interno, página de empresas y aligerado del paquete.

## Datos que necesito de ti

- Número de registro de turismo activo de Andalucía.
- Aseguradora y número de póliza de responsabilidad civil.
- Número o referencia de la titulación TD2 del guía.
- Identificador de Google Analytics.
- Precio y duración de las tres propuestas de espeleología, si quieres venderlas.
