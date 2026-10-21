# Auditoría técnica inicial (solo lectura) — Naturaleza Sin Límites

Alcance: inspección de código y configuración. No se ha modificado nada, ni se han ejecutado migraciones, publicaciones o instalaciones. Leyenda: **[H]** hecho comprobado en archivo, **[P]** probado ejecutando algo, **[I]** inferencia, **[SV]** sin verificar.

## 1. Tabla de estado

| Área | Estado | Evidencia | Riesgo | Prioridad |
|---|---|---|---|---|
| Stack (React 18, Vite 6, TS 5.8, Tailwind 3, Supabase JS 2.91, Stripe JS 9.2) | Funcional [H] | package.json:16-128 | Overrides de esbuild/css fuera de rangos oficiales | Baja |
| Rutas públicas (inicio, catálogo, fichas, categorías, blog, legales) | Sin verificar en navegador [H] | src/App.tsx:67-92 | Bajo | Baja |
| Catálogo de actividades y fichas | Funcional con datos estáticos [H] | src/data/* (ferratas.ts 2.188 líneas, caves, crags, barrancos) | Datos editados a mano, sin panel de gestión | Media |
| Calendario de salidas | Parcial [H] | useActivityEvents.ts:70 lee vista pública; hoy no hay salidas publicadas [I] | Sin salidas no hay reserva directa con señal | Alta (negocio) |
| Solicitud de disponibilidad | Implementado, sin prueba real [H] | BookingForm.tsx:127 → submit-request | Correos reales activos | Alta |
| Reserva con señal 30 % | Implementado; corrección de bloqueo caducado sin publicar [H/P] | create-activity-deposit/handler.ts; RPC create_deposit_intent; tests depositIntent y recovery pasan [P] | Web publicada aún con versión anterior | Alta |
| Pago Stripe (página /pago) | Sin verificar con tarjeta real [H] | get-payment, prepare_deposit_checkout, payments-webhook (firma :480) | Cobros reales activos sin prueba de extremo a extremo | Crítica |
| Correos (Resend vía pasarela) | Implementado, sin verificar en producción tras últimos cambios [H] | _shared/email.ts:31-58; EMAIL_DELIVERY_MODE=live | Envío real a clientes | Alta |
| Panel /admin | Implementado, sin verificar en navegador con sesión [H] | Admin.tsx (1.434 líneas), EventsPanel.tsx (728) | Componente muy grande, difícil de mantener | Media |
| Borrado permanente | Implementado [H] | admin_delete_booking / admin_reset_all con has_role y «BORRAR» | Irreversible; sin copia probada | Alta |
| Acceso Google OAuth | Implementado [H] | Login.tsx:29-55, authReturn.ts; tests [H] | Bajo | Baja |
| Vértigo Sapiens / packs | Parcial [H] | create-plan-checkout, planCatalog duplicado en front y back | Fuera del lanzamiento inicial | Baja |
| Newsletter | Defectuosa / simulada [H] | Newsletter.tsx:13 solo hace console.log | El usuario cree suscribirse y no se guarda nada | Media |
| Analítica | Pendiente [H] | AnalyticsLoader.tsx:4,34 con TODO | Sin medición | Baja |
| SEO (logo, título, JSON-LD) | Preparado, sin publicar [H] | src/pages/Index.tsx, public/favicon* | — | Media |
| Web publicada | Sin verificar tras última publicación [SV] | Antes servía bundle roto (supabaseUrl) | Caída si no se republica | Crítica |

## 2. Diagnóstico de arquitectura

- SPA React con contenido editorial estático y lógica transaccional en funciones del servidor y RPC con bloqueo de filas. Diseño sólido para plazas (máximo 6) e idempotencia [H].
- Conceptos duplicados entre navegador y servidor: catálogo de planes y lógica de confirmación de señal (src/lib/depositConfirmation.ts y supabase/functions/_shared/depositConfirmation.ts) [H]. Riesgo de divergencia de importes.
- Componentes grandes (Admin.tsx, CustomPackDesignerModal.tsx, ReservarActividad.tsx) [H].
- La función MCP generada incrusta el catálogo (mcp/index.ts:4504-4959) y puede desincronizarse [I].

## 3. Hallazgos de seguridad

- Siete funciones sin verificación JWT de pasarela (config.toml:3-22). create-payment-link comprueba admin; payments-webhook comprueba firma; el resto depende de tokens de capacidad (token de pago 48 hex, UUID de intención, token de portal) [H]. Aceptable si los tokens no se filtran [I].
- CORS abierto mediante cabeceras compartidas; los orígenes de retorno sí están limitados (siteOrigins.ts:3-18) [H]. Incluye localhost y vistas previas [H].
- Roles en user_roles + has_role; trigger que concede admin a dos emails fijos [H].
- Existe .env.production con claves públicas; comprobar que no es una clave secreta [SV].
- Avisos de dependencias: 10 altos documentados (braces, SDK MCP), no resueltos (docs/build-dependency-hardening.md:32-54) [H].
- Copia de seguridad del 19/10/2026 nunca probada; el borrado permanente es irreversible [H].

## 4. Deuda técnica

- Dividir Admin.tsx y EventsPanel.tsx en piezas.
- Unificar fuente de verdad de precios/confirmación entre navegador y servidor.
- 40 console.log y 80 usos de any en todo el repo (14 en src) [H].
- Vitest solo ejecuta pruebas de src; las 11 de servidor (Deno) y 8 de scripts no corren en esa configuración [H].
- Newsletter simulada y TODO de analítica.
- test/example.test.ts sin valor.

## 5. Pruebas que deben ejecutarse

1. Abrir naturalezasinlimites.es y www en navegador tras republicar: contenido en #root, sin errores.
2. Flujo completo: solicitud → panel → confirmar → correo → pago real con tarjeta propia → recibo → devolución.
3. Reserva directa sobre una salida publicada, incluido bloqueo caducado y reenvío.
4. Suite Deno de funciones del servidor y pruebas de capacidad contra copia aislada.
5. Escaneo de seguridad y auditoría de dependencias actualizados.
6. Restauración de la copia de seguridad en entorno aislado.
7. Revisión en móvil de fichas, reserva y pago.

## 6. Plan de corrección por criticidad (requiere autorización por cada paso)

1. Republicar y verificar la web pública (caída / cambios pendientes).
2. Prueba real de cobro y devolución, y de correos al cliente.
3. Probar restauración de la copia antes de usar el borrado permanente.
4. Crear al menos una salida publicada para habilitar reservas con señal.
5. Sustituir la newsletter simulada por guardado real o retirarla.
6. Ejecutar pruebas de servidor en CI y añadirlas a la configuración.
7. Unificar lógica duplicada de precios/confirmación.
8. Refactorizar Admin.tsx en módulos.
9. Revisar avisos de dependencias y activar analítica con consentimiento.

## 7. Información no accesible o no verificada

- Estado actual del despliegue y su bundle servido.
- Registros de Stripe y Resend; cuenta real y webhooks configurados.
- Ejecución de pruebas Deno y de base de datos (no ejecutadas en esta auditoría).
- Datos reales de la base y estado efectivo de políticas en producción.
- Avisos de dependencias actuales (no se ejecutó audit nuevo).
- Recuperación de la copia de seguridad del proveedor.
