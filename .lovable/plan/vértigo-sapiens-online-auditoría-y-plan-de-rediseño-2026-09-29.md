# Vértigo Sapiens Online — auditoría y plan de rediseño

## 1. Auditoría (Fase 1)

### Archivos que se modificarán
- `src/pages/VertigoSapiensPage.tsx` — nuevo orden de secciones y SEO (title/description orientados a online).
- Nuevos componentes en `src/components/vertigo-sapiens/online/`: Hero, Problema, ParaQuien, Metodo, Programa (una sola tarjeta), Entrenador, FAQ, SolicitudForm, CTA final.
- `supabase/functions/submit-request/index.ts` — añadir un tipo de solicitud "online" (ver punto 3).
- Textos públicos que quedarían engañosos (solo texto, sin tocar enlaces ni lógica): `src/components/VertigoSapiens.tsx` (portada), `src/components/ValueProposition.tsx`, `src/components/blog/BlogCTA.tsx`, `src/components/quienes-somos/QSPathsSection.tsx`, botón del hero de portada ("Únete a Vértigo Sapiens" se mantiene, destino igual).
- `src/pages/Privacidad.tsx` — una línea sobre la finalidad de la solicitud online.

### Solo presentación vs. cobros/suscripciones
- **Solo presentación (se retiran de la página, no se borran):** VSPlansSection, PlanDetailCard/Sheet, VSCalendarSection, VSFacilitiesSection, VSEnrollmentSection, VSTrialFormSection (clase de prueba presencial por WhatsApp), VSComponentsSection, VSWhatIsSection. Los archivos siguen en el proyecto.
- **Afectan a cobros (NO se tocan):** `/contratar/:priceId`, `create-plan-checkout`, `payments-webhook`, `create-portal-session`, `get-plan-order`, `/gracias`, `/mi-suscripcion/:token`, productos y precios de Stripe, panel /admin. Las rutas siguen activas; simplemente la nueva página deja de enlazar a "Contratar ahora".

### Contratos, clientes o registros que podrían verse afectados
- Suscriptores actuales de los planes presenciales: siguen cobrándose y gestionando su suscripción igual (portal intacto). Solo pierden el acceso visual a la tabla de planes desde /vertigo-sapiens.
- `/gracias` tiene "Volver a Vértigo Sapiens": seguirá funcionando, pero llevará a la oferta online.
- Ningún registro de BD se modifica ni borra.

### Decisiones que no puedo verificar en el código
- Precio 179 € y prestaciones: hipótesis; se muestran como "piloto sujeto a confirmación", sin conexión con Stripe.
- Qué pasa al terminar las 8 semanas, material mínimo, formato de revisión de vídeos (plataforma/canal): se indicará "por confirmar".
- Credenciales del entrenador: uso solo Máster en Entrenamiento Deportivo-Físico y Técnico Deportivo en Espeleología TD2 (ya en el proyecto). Omito "más de 100 clientes mensuales" y "decenas de expediciones" por ser cifras no demostradas.
- Si los suscriptores presenciales actuales deben ser avisados o migrados: decisión tuya.
- Los correos de aviso fallan hoy (clave de Resend inválida); la solicitud se guardará igualmente en la BD y será visible en /admin (Contactos).

## 2. Página nueva (Fases 2–3)
Orden: Hero (etiqueta, H1, texto, CTA "Solicitar evaluación inicial" → formulario, "Cómo funciona" → método, chips Online · 8 semanas · Fuerza + resistencia + movilidad) → Problema → Para quién (3 perfiles) → Método (4 pasos, separando "lo hace la plataforma" / "lo hace Antonio") → Programa 8 semanas (una tarjeta, incluye con frecuencia, exclusiones, "179 € / 8 semanas · pago único propuesto" + nota sin pago ni compromiso) → Entrenador → FAQ (6 preguntas, acordeón) → Formulario + CTA final.

Diseño: fondo oscuro, acento naranja, Montserrat/Open Sans, sin contadores, sin fotos de instalaciones; foco visible, etiquetas, `motion-reduce`.

## 3. Captación
No existe formulario apto (el actual abre WhatsApp para clase presencial). Nuevo formulario sin pago: nombre, email, disciplina, objetivo, disponibilidad semanal, aceptación de privacidad.
- `submit-request` gana un tipo `online_request` que guarda en la tabla de contactos existente con interés "Vértigo Sapiens Online" y el resto en el mensaje (teléfono opcional). No toca reservas ni pagos.
- Solo se muestra "Solicitud recibida" si el guardado responde OK; si falla, error visible con alternativa por WhatsApp.

## 4. Verificación
Carga en 390/1280 px, todos los CTA, envío real de una solicitud de prueba (y borrado), comprobación de que no se crea ningún cobro ni suscripción, compilación y consola limpias. Sin publicar.
