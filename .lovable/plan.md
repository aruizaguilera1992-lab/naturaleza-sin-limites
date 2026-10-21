# Auditoría de robustez y calidad — Naturaleza Sin Límites

Solo lectura. No se ha cambiado código, base de datos, pagos, correos ni publicación. Aprobar este plan no ejecuta nada: cada sprint necesita autorización aparte.

## 1. Lo ya probado por el propietario frente a lo que falta

| Ya probado manualmente por Antonio | Comprobación técnica que aún falta |
|---|---|
| Reserva, correo y pago real funcionan en el camino normal | Dos clientes pagando la última plaza a la vez |
| Correos llegan a clientes y negocio | Aviso de Stripe repetido o fuera de orden; correo enviado una sola vez |
| Cobro real con tarjeta | Devolución, pago tardío tras caducar el bloqueo, señal con descuento |
| Panel de gestión operativo | Que un usuario no administrador no pueda llamar funciones internas |
| — | Recuperación real desde la copia de seguridad (nunca probada) |

## 2. Riesgos por gravedad

### Alta
**A1. Funciones internas de base de datos ejecutables por usuarios con sesión.** El revisor automático marca 4 funciones con privilegios elevados ejecutables por cualquier usuario autenticado, y una vista con privilegios del creador. Evidencia: linter (lint 0029 x4, 0010 x1). Las funciones de asientos/cobro (`reserve_event_seats`, `release_event_seats`, `confirm_payment_request`, `claim_notification`…) no comprueban rol; solo deberían ser llamables por el servidor.
- Solución: revocar EXECUTE a `anon`/`authenticated` en todas las RPC internas, dejar solo service_role; confirmar que la vista pública es intencionada (lista de columnas fija) o pasarla a `security_invoker`.
- Impacto: impide bloquear/liberar plazas o marcar pagos desde fuera. Riesgo de regresión: medio (si el panel llama alguna directamente). Aceptación: con sesión de usuario normal, cada RPC devuelve permiso denegado; el panel y el webhook siguen funcionando.

**A2. Historial de migraciones desincronizado.** Solo 11 archivos en `supabase/migrations`, mientras la base real tiene funciones posteriores (`admin_delete_*`, `admin_reset_all`, `create_deposit_intent`, descuentos). Una reconstrucción desde Git no reproduce producción.
- Solución: exportar el esquema actual a una migración de referencia revisada; test que compare funciones/políticas esperadas.
- Impacto: recuperación fiable. Regresión: baja (no toca datos). Aceptación: reconstrucción en base vacía igual al esquema real (diff vacío).

**A3. Copia de seguridad nunca restaurada.** Existe copia del 19/10/2026, sin ensayo de recuperación; la vista previa usa la base real.
- Solución: procedimiento documentado de restauración en entorno aislado, con objetivo de tiempo y pérdida máxima, y exportación periódica de reservas/pagos.
- Aceptación: restauración de ensayo con conteos coincidentes, sin datos personales fuera.

**A4. `admin_reset_all` borra todo con una palabra.** Un error humano o una sesión de admin robada vacía reservas y pagos sin copia previa.
- Solución: exigir copia exportada reciente, registro de auditoría y, preferiblemente, borrado lógico con papelera de 30 días.
- Regresión: baja. Aceptación: tras «vaciar», los datos siguen recuperables durante el plazo.

### Media
**M1. Regla del 30 % duplicada en 5 sitios.** `src/lib/deposit.ts`, `_shared/activityPrices.ts`, `ReservarActividad.tsx:145`, `Admin.tsx:936`, `bookingEmailContext.ts:67` y en SQL `create_deposit_intent` (`round(total * 0.30)` fijo). Además el redondeo difiere: frontend redondea en euros, servidor en céntimos.
- Solución: una única fuente en servidor (SQL o tabla de ajustes) y el frontend solo muestra lo que devuelve; test de paridad que falle si los valores divergen.
- Aceptación: tests con totales impares (p. ej. 35,50 €) dan la misma señal en web, panel, correo y cobro.

**M2. Precio por unidad aceptado desde el payload.** `create_deposit_intent` usa `catalogueUnitCents` del payload cuando la salida no tiene precio. Pendiente confirmar que `create-activity-deposit/handler.ts` lo calcula siempre en servidor y nunca del navegador.
- Aceptación: test que envía un precio manipulado y comprueba que se ignora.

**M3. Webhook: idempotencia por intención, no por evento.** Los correos usan `dedupe_key` y el pago usa bloqueo de fila (`confirm_payment_request` … `FOR UPDATE`), lo que es correcto; pero no hay registro de `event.id` de Stripe ni prueba de eventos fuera de orden (p. ej. `expired` después de `completed`).
- Solución: tabla de eventos procesados + tests de repetición y desorden.
- Aceptación: mismo evento 3 veces → 1 pago, 1 correo; desorden → estado final correcto.

**M4. Pago que llega tras liberar la plaza.** `confirm_event_seats` re-toma plazas si quedan; si no, el cliente ha pagado sin plaza. Existe aviso al negocio (`seat_incident_business`), pero no devolución ni prueba automática.
- Aceptación: test que simula pago tardío con salida llena → incidencia registrada y reserva en revisión.

**M5. Dependencias vulnerables.** 1 crítica y ~10 altas, casi todas vía `@lovable.dev/mcp-js` (proxy-addr, MCP SDK, fast-uri, hono); `ws` vía el cliente de base de datos; `lodash` vía `recharts`.
- Solución: actualizar mcp-js cuando haya versión, o usar overrides de las transitivas; confirmar que mcp-js solo se usa en la función MCP del servidor.
- Aceptación: escaneo sin críticas/altas; build y función MCP siguen respondiendo.

**M6. CI no ejecuta las pruebas en la rama principal.** Las pruebas Deno y de base de datos solo están en `stabilization-checks.yml` para PR; `build.yml` en push a main ejecuta solo build y guard. 11 pruebas Deno y las de `scripts/local-supabase/*.test.ts` quedan fuera del flujo normal.
- Solución en sección 4.

**M7. Componentes grandes.** `Admin.tsx` 64 KB, `ReservarActividad.tsx` 28 KB, `EventsPanel.tsx` 27 KB, `Pago.tsx` 21 KB, `payments-webhook` 20 KB, función MCP 186 KB.
- Solución en Sprint 3. Riesgo de regresión: alto si se hace sin tests previos.

### Baja
- **B1.** Tablas/vistas visibles en el esquema GraphQL a anónimos (4) y autenticados (10): no expone filas (RLS activo), pero revela estructura. Revocar si no se usa GraphQL.
- **B2.** Una tabla con RLS sin políticas (`deposit_intents`, intencionado: solo servidor). Documentar.
- **B3.** Formulario de noticias sin almacenamiento (detectado en auditoría previa).
- **B4.** Correos de admin y lista de administradores fijados en el trigger `grant_admin_to_owner_emails`: cambiar de email requiere migración.
- **B5.** Orígenes permitidos de retorno de pago fijados en `get-payment/index.ts` (incluye `*.lovable.app`): restringir al dominio propio y la vista previa del proyecto.

## 3. Cobertura de pruebas actual

- 30 archivos de prueba: Vitest (frontend: authReturn, adminBooking, depositIntent, paymentSafety, Login, Admin.access…) y Deno (handlers de depósito, enlace de pago, eligibility, checkout, correos, stripe, capacidad 6, migraciones, prepare_deposit_checkout).
- Cubierto: lógica de señal y correos, elegibilidad de checkout, capacidad máxima, retorno seguro del login.
- Sin cubrir: concurrencia real en base de datos, repetición/desorden de webhooks, permisos de RPC por rol, paridad de precios entre capas, borrado permanente, edición de reservas en panel.

## 4. Integración de Deno y Vitest en CI (diseño)

```text
push/PR a main
 ├─ job web:   npm ci → vitest run → lint → build → guard de bundle (URL/clave pública)
 ├─ job deno:  deno check (todas las funciones) → deno test (lista única en deno.json)
 └─ job db:    Postgres efímero → reconstruir esquema → tests SQL de concurrencia y permisos
```
- Lista de tests Deno en un solo archivo (`deno.json` tasks) para que no se olvide ninguno nuevo; test que falle si un `*.test.ts` no está incluido.
- Ningún job usa secretos reales ni Stripe/Resend reales (simuladores existentes).
- `build.yml` y su guard deben actualizarse juntos (el guard valida los pasos exactos).

## 5. Plan por sprints

**Sprint 1 — Seguridad y recuperación (prioridad máxima)**
A1 permisos de RPC, A3 ensayo de restauración, A4 protección del vaciado, B5 orígenes. Aceptación: tests de permiso denegado por rol; restauración verificada.

**Sprint 2 — Pagos y reservas a prueba de fallos**
M1 fuente única del 30 %, M2 precio solo de servidor, M3 registro de eventos Stripe, M4 pago tardío. Aceptación: tests de paridad, repetición, desorden y 2 reservas simultáneas por la última plaza (solo una gana).

**Sprint 3 — CI y migraciones**
A2 migración de referencia, M6 pipeline de la sección 4, M5 dependencias. Aceptación: CI verde en main con todos los tests; escaneo sin críticas.

**Sprint 4 — Refactor seguro (solo con Sprint 3 terminado)**
`Admin.tsx` en módulos (lista, detalle, economía, acciones, borrado) y un hook de datos; `ReservarActividad` separando formulario y recuperación de intento; webhook en manejadores por evento. Sin cambiar comportamiento: tests de humo de panel y reserva antes y después.

## 6. Riesgos de regresión en futuras actualizaciones
- Cambiar el porcentaje o el redondeo en un solo sitio (M1).
- Añadir una RPC nueva sin revocar permisos (A1): añadir test que liste funciones ejecutables por `authenticated`.
- Cambios en la versión de la API de Stripe (fijada a `2026-03-25.dahlia`).
- Editar `.env`/configuración pública y volver a publicar un bundle sin URL (ya hay guard en build).
- Tocar `build.yml` sin actualizar `deployment-guard`.
- Refactorizar Admin sin tests de humo.

## Detalles técnicos
Fuentes: linter de base de datos (20 avisos, 5 tipos), escaneo de dependencias (bun.lock, 56 paquetes), definiciones de funciones SQL, `get-payment/index.ts`, `payments-webhook/index.ts`, workflows de `.github`, tamaños de archivo. Pendiente de confirmar antes del Sprint 2: lectura completa de `create-activity-deposit/handler.ts` (M2) y qué 4 funciones exactas marca lint 0029.
