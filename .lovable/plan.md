# Auditoría profesional — Naturaleza Sin Límites (6 nov 2026)

Solo lectura. Nada se ha modificado. "Confirmado" = visto en código o base de datos hoy. "Riesgo" = posible, sin prueba.

## 1. Estado por área

| Área | Estado | Riesgo mayor |
|---|---|---|
| Seguridad | Buena base: RLS en todas las tablas, roles en tabla aparte, funciones de cobro/plazas ya cerradas a usuarios | Medio |
| Reservas y pagos | Bloqueo de plazas, máx. 6, señal 30 % en servidor, idempotencia por intención | Medio |
| Rendimiento | Todas las páginas se cargan de golpe; 8,7 MB de fotos locales | Alto |
| SEO | Título, descripción, robots, sitemap y datos estructurados presentes | Medio |
| Conversión | Fichas visuales, CTA claro, barra móvil | Bajo |
| Mantenimiento | 15 ficheros de pruebas (86 tests), 3 flujos de CI | Alto |

## 2. Hallazgos

### Seguridad
- **S1 Confirmado — Medio.** Cualquier usuario con sesión puede llamar a `admin_delete_booking`, `admin_delete_contact` y `admin_reset_all`. Hoy se protegen dentro (comprueban rol admin), pero dependen de una sola barrera. Solución: retirar el permiso a usuarios normales y dejar solo la comprobación de admin. Baja complejidad.
- **S2 Confirmado — Medio.** `admin_reset_all` sigue en la base aunque se quitó del panel. Un borrado total sin copia. Solución: eliminarla. Baja.
- **S3 Confirmado — Bajo.** La vista pública de salidas se marca como "vista privilegiada". Es intencional (oculta puntos de encuentro y notas), pero conviene revisarla. Baja.
- **S4 Confirmado — Bajo.** 16 tablas visibles en el esquema de consultas alternativo (no expone datos, sí nombres). Solución: retirar visibilidad. Baja.
- **S5 Confirmado — Bajo.** Tabla de intenciones de pago sin políticas (bloqueada; correcto, solo documentar).
- **S6 Riesgo.** Dos emails de propietario fijos en el código de la base para dar rol admin. Funciona, pero cambiar de admin requiere una migración.

### Reservas y pagos
- **P1 Confirmado — Medio.** La regla del 30 % aparece en al menos 5 sitios (servidor, panel, correos, reserva pública). Un cambio futuro puede dejar precios distintos. Solución: un único origen compartido + test. Media.
- **P2 Riesgo — Medio.** Sin pruebas automáticas de webhooks repetidos ni de dos clientes reservando la última plaza a la vez. La lógica parece correcta (bloqueos de fila), pero no está demostrada. Media.
- **P3 Riesgo — Bajo.** Las plazas caducadas se liberan solo cuando alguien reserva; el panel puede mostrar plazas ocupadas que ya están libres. Baja.

### Rendimiento
- **R1 Confirmado — Alto.** Ninguna página se carga bajo demanda: el visitante descarga también el panel de gestión (1.456 líneas) y pagos. Solución: carga por páginas. Baja-media.
- **R2 Confirmado — Medio.** 8,7 MB de fotos en formato original. Solución: versiones WebP/AVIF. Media.
- **R3 Sin datos.** No he medido visitas reales; primero consultar métricas reales.

### SEO
- **E1 Confirmado — Medio.** La web se pinta en el navegador: Google ve el título común hasta ejecutar JavaScript; redes sociales ven siempre el mismo. Solución a largo plazo: renderizado en servidor (cambio grande).
- **E2 Riesgo — Medio.** Sitemap puede no incluir las 68 fichas ni actualizarse solo. Verificar y generar en la compilación. Baja.
- **E3 Riesgo — Bajo.** Revisar canonical por página y datos estructurados de cada actividad (TouristTrip/Product sin reseñas inventadas).

### Conversión
- **C1 Riesgo — Bajo.** Fichas sin precio dependen solo de WhatsApp; no queda registro en el panel. Opción: formulario corto que cree contacto.
- **C2 Riesgo — Bajo.** Sin medición de embudo (ficha → solicitud → pago).

### Mantenimiento
- **M1 Confirmado — Alto.** El historial de migraciones del repositorio (11) no coincide con la base real (más cambios aplicados). Reconstruir una base desde cero no daría la actual.
- **M2 Confirmado (dicho por ti) — Alto.** La copia de seguridad nunca se ha probado a recuperar.
- **M3 Confirmado — Medio.** `Admin.tsx` con 1.456 líneas: cualquier cambio arriesga regresiones.
- **M4 Riesgo — Medio.** Las pruebas de funciones del servidor (Deno) no consta que corran en CI.
- **M5 Riesgo — Medio.** Dependencias con avisos conocidos sin revisar desde la auditoría anterior.

## 3. Plan por sprints

- **Sprint 1 — Seguridad y recuperación (1-2 días).** S1, S2, S4, M1, M2.
- **Sprint 2 — Pagos a prueba de fallos.** P1, P2, P3, M4.
- **Sprint 3 — Rendimiento y SEO.** R3 medición, R1, R2, E2, E3.
- **Sprint 4 — Mantenimiento y conversión.** M3 dividir panel, M5, C1, C2. E1 se decide aparte.

## 4. Propuesta de Sprint 1 (no se ejecuta sin tu autorización)

1. Retirar a usuarios normales el permiso de llamar a las tres funciones de borrado; solo admin.
2. Eliminar la función de vaciado total de la base.
3. Ocultar las tablas del esquema de consultas alternativo.
4. Volcar al repositorio las migraciones que faltan para que coincida con la base real (sin cambiar datos).
5. Guía paso a paso para que tú pruebes recuperar la copia en un proyecto aparte (yo no restauro nada).

Fuera del sprint: reservas, pagos, Stripe, correos, catálogo y publicación.

## 5. Pruebas de validación

- S1: llamada a borrado con usuario no admin → rechazada; con admin → funciona en un registro de prueba.
- S2: la función ya no existe.
- S4: linter sin avisos de visibilidad.
- M1: comparar lista de migraciones del repositorio con la de la base → iguales.
- M2: recuperar la copia y contar reservas/contactos igual que el original.
- Regresión: 86 tests actuales en verde y panel abre reservas y contactos.
