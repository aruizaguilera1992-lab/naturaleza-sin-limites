# Auditoría pre-publicación · Naturaleza Sin Límites (20/09/2026)

Verificado con recorrido real en vista previa (escritorio 1280 px y móvil 390 px) sobre 14 rutas, revisión de código y estado real de la cuenta de pagos. Sin cambios de código.

## 1. Veredicto

**Publicable con ajustes menores.** La web funciona de punta a punta, sin errores de ejecución, sin desbordes en móvil, sin imágenes rotas y con el dominio correcto en buscadores. Quedan dos cosas que sí conviene resolver antes de abrir al público: los datos legales obligatorios de turismo activo y los testimonios inventados que siguen en el archivo de Vértigo Sapiens. Vender de verdad (cobrar y enviar correos) exige además terminar la verificación de la cuenta de pagos y la clave de correo.

## 2. Bloqueantes antes de publicar

1. **Datos legales obligatorios ausentes.** No aparece en ninguna parte el número de registro de turismo activo de Andalucía, la aseguradora ni el número de póliza de responsabilidad civil. Es exigible para una empresa de turismo activo. Falta el dato real; no se puede inventar.
   Archivos: `src/components/TrustBar.tsx`, `src/components/Footer.tsx`, `src/pages/Terminos.tsx`.
2. **Testimonios y métricas inventadas todavía en el proyecto.** La sección está desconectada de la página, pero el archivo conserva 5 opiniones ficticias y cifras sin base ("+60% resistencia", "85% asisten a salidas outdoor", "4.9/5 satisfacción"). Si alguien la reactiva, se publica publicidad engañosa.
   Archivo: `src/components/vertigo-sapiens/VSTestimonialsSection.tsx` (líneas 31, 57, 58).
3. **Etiquetas de buscadores duplicadas en todas las páginas.** Cada página envía dos descripciones y dos direcciones sociales: la genérica del archivo base y la propia. Google y las redes se quedan con la primera, así que al compartir cualquier página se ve el texto de la portada.
   Archivos: `index.html` (líneas 8, 12-20), `src/components/Seo.tsx`.

## 3. Importantes (primeros 7 días)

- **Cobros reales sin activar.** La cuenta está conectada, pero el formulario de alta en el proveedor de pagos sigue a medias; hasta completarlo no se puede cobrar de verdad. Sin cambios de código.
- **Correos de confirmación sin funcionar.** Falta una clave válida de Resend y el remitente verificado; hoy la reserva se registra pero el cliente no recibe el correo.
- **Analítica sin configurar:** identificador de ejemplo `G-XXXXXXX` en `src/components/AnalyticsLoader.tsx`; no se mide nada.
- **Dos páginas sin dirección canónica propia:** `/reservar/:categoria/:slug` (`src/pages/ReservarActividad.tsx`) y `/cookies` (`src/pages/Cookies.tsx`).
- **Espeleología descuadrada:** fuera del catálogo comercial pero presente en el mapa del sitio (`public/sitemap.xml`, líneas 8, 78-80) y en el listado por `src/hooks/useActivitiesData.ts:232`. Google indexa páginas que no se pueden reservar.
- **Falta la salida "no veo mi fecha"** en ficha y reserva: quien no encuentra su día se va sin dejar contacto (`src/pages/ActivityProfilePage.tsx`, `src/pages/ReservarActividad.tsx`).
- **Política de cancelación poco visible:** existe en términos y en el pago, pero no en la ficha antes de decidir.

## 4. Mejoras posteriores

- Reseñas reales (Google) y ficha del guía con su titulación.
- Datos estructurados por actividad (precio, duración, ubicación) para resultados enriquecidos.
- Página para empresas y grupos; enlazado interno entre fichas de la misma zona.
- Aligerar el paquete de la web (hoy 1,5 MB en un solo archivo) dividiéndolo por páginas.
- Vistas previas sociales por página: hoy solo son exactas para Google; requieren renderizado en servidor.

## 5. Checklist por página

| Ruta | Estado |
| --- | --- |
| Home | OK (sin desborde móvil, vídeo y textos correctos) |
| /actividades | OK (65 fichas con precio, "Máx. 6", Reservar y Ver experiencia visibles) |
| Ficha barranquismo / escalada / ferrata | OK (título, descripción y dirección propios; sin textos pendientes) |
| /reservar/:categoria/:slug | REVISAR (sin dirección canónica) |
| Pago sandbox | OK en pruebas · BLOQUEANTE para cobrar de verdad |
| /contacto | OK |
| /quienes-somos | OK |
| /vertigo-sapiens | REVISAR (archivo de testimonios ficticios sin borrar) |
| /blog y artículo | OK |
| /privacidad · /terminos | REVISAR (faltan registro, aseguradora y póliza) |
| /cookies | REVISAR (sin dirección canónica) |
| 404 | OK (en español, no indexable, con enlaces útiles) |
| Pie y navegación | OK (correo corregido, enlaces legales completos) |
| Móvil 390 px / escritorio 1280-1440 px | OK (0 px de desborde en las 14 rutas) |

## 6. Seguridad, legal y riesgos

- Formularios públicos pasan siempre por funciones de servidor con validación; el importe de la señal se calcula en servidor. Correcto.
- Panel de administración protegido por rol en tabla aparte. Correcto.
- Sin claves secretas en el código del navegador. Correcto.
- Consentimiento de cookies completo (banner, preferencias, bloqueo de scripts). Correcto.
- Riesgo principal de publicar hoy: reclamación administrativa por falta de los datos de turismo activo y seguro.

## 7. Lo que ya está bien y no conviene tocar

Señal del 30 % calculada en servidor, cobro único garantizado, impuestos con código correcto, webhook a prueba de repeticiones, página de retorno con reintento, franja de confianza con afirmaciones verificables, consentimiento RGPD, panel con rol de administrador, mapa del sitio y robots con el dominio correcto, fichas de actividad con metadatos propios, 404 y dominio único centralizado.

## 8. Plan de acción ordenado

**Antes de publicar (rápido)**
1. Dar los datos reales de registro, aseguradora y póliza y publicarlos en pie, términos y franja de confianza.
2. Borrar el archivo de testimonios ficticios de Vértigo Sapiens.
3. Quitar del archivo base las etiquetas duplicadas (descripción y dirección social) para que mande la de cada página.
4. Añadir dirección canónica a reserva y cookies; decidir espeleología (precio y duración, o sacarla del mapa del sitio).

**Primera semana**
5. Completar la verificación de la cuenta de pagos y pasar a cobros reales.
6. Clave de Resend válida con remitente verificado y prueba de correo de confirmación.
7. Identificador real de analítica.
8. Camino "no veo mi fecha" y política de cancelación visible en la ficha.

**Después**
9. Reseñas reales, ficha del guía, datos estructurados por actividad, página de empresas y aligerado de la web.

### Datos que necesito de ti
Registro de turismo activo, aseguradora y número de póliza, referencia de la titulación TD2, identificador de Google Analytics, y precio y duración de las tres salidas de espeleología.
