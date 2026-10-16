# Comprobación previa de sandbox — 14 de octubre de 2026

Se realizaron consultas de solo lectura a la cuenta conectada «Entorno de prueba de Naturaleza sin Limites» (`livemode=false`) y al proyecto Lovable existente. No se generaron sesiones, cargos, reservas ni emails, ni se modificó configuración remota.

## Resultados

| Elemento | Evidencia | Estado |
| --- | --- | --- |
| Código Lovable | Último commit del proyecto: `d6a6b0439304c810f1da56db92d84b4c66b23e1a`, anterior al PR | Las correcciones aún no están en la vista previa existente |
| Salidas | Una salida; capacidad máxima 6; ninguna superior a 6 | No se detectan datos que bloqueen la migración en el momento de la consulta |
| Restricción de capacidad | `activity_events_capacity_positive` todavía admite hasta 20 | Migración 0013 pendiente; repetir preflight justo antes de aplicarla |
| Precios Stripe de pruebas | Cero precios activos y cero coincidencias para las seis lookup keys del catálogo | Bloquea checkout de planes y packs (`Precio no encontrado`) |
| Webhooks Stripe de pruebas | Dos endpoints habilitados: ruta Lovable `/payments-webhook/sandbox` y función Supabase `payments-webhook?env=sandbox` | Configuración visible; entrega, firmas y encaminamiento aún sin probar |
| Resend | Sin conector de Resend ni secretos de servidor configurados en este entorno local | No se puede verificar entrega aquí |
| Aislamiento | La URL facilitada corresponde a producción; no se ha confirmado una base de datos independiente para pruebas | No realizar pruebas que escriban reservas o notificaciones en ese proyecto |

La existencia de dos webhooks no demuestra envíos duplicados: pueden tener funciones de encaminamiento distintas. No eliminar ninguno sin verificar su función. Las consultas no permiten confirmar que las claves del servidor correspondan a la cuenta conectada; debe comprobarse en el entorno aislado.

## Catálogo de pruebas que falta configurar

Importes informativos tomados de `src/data/planCatalog.ts`; antes de crear precios, confirmar que son la oferta comercial deseada. La creación se limitaría a sandbox y no habilitaría pagos reales.

| Lookup key | Importe EUR | Modalidad prevista |
| --- | ---: | --- |
| `aventurero_1_semana_mensual` | 119 | Mensual |
| `aventurero_2_semana_mensual` | 189 | Mensual |
| `entrenador_personal_mensual` | 329 | Mensual |
| `entrenador_personal_prepago6` | 285 | El código lo trata como suscripción mensual; la permanencia de seis meses requiere confirmar condiciones y comportamiento |
| `outdoor_pack_4_actividades` | 215 | Pago único |
| `outdoor_pack_8_actividades` | 380 | Pago único |

No crear el precio `entrenador_personal_prepago6` como pago único de seis meses sin cambiar el contrato de producto: la web muestra 285 €/mes y el catálogo del servidor lo clasifica como suscripción.

## Secuencia pendiente

1. Confirmar o preparar una copia con base de datos y secretos de pruebas independientes; desplegar allí el código del PR tras aprobación. No basta una URL de vista previa que comparta la base de producción.
2. Confirmar catálogo y cuenta sandbox; configurar allí productos/precios que faltan. No alterar el catálogo live.
3. Configurar en el almacén de secretos del entorno aislado: `PAYMENTS_LIVE_ENABLED=false`, `EMAIL_DELIVERY_MODE=test`, y únicamente el buzón del propietario autorizado en `EMAIL_TEST_RECIPIENTS`. Claves de gateway Lovable y firma de webhook deben pertenecer a ese entorno. No pegar secretos en chat, archivos versionados ni informes.
4. Aplicar las migraciones en la copia y comprobar una salida sintética de seis plazas. Probar reserva, expiración, conflicto de cupo y reintento del checkout.
5. Completar pagos sandbox con datos ficticios; verificar confirmación por webhook y reentrega idempotente. Verificar que el camino Lovable/Supabase no produce efectos repetidos.
6. Verificar entrega Resend exclusivamente al buzón autorizado y que cualquier destinatario ajeno se bloquea. No reutilizar ni reintentar notificaciones de clientes de producción.
7. Registrar resultados y revisar antes de autorizar integración o despliegue de producción.
