# Punto 2: página de pago y confirmación automática de reservas

## Objetivo

El administrador revisa la disponibilidad de una reserva, fija el importe y genera un enlace de pago único. El cliente paga desde una página propia de la web y, al completarse el pago, la reserva pasa automáticamente a **confirmada** sin intervención manual.

## Flujo previsto

```text
Cliente envía formulario  ->  reserva "nueva"
Admin revisa y fija importe (ej. 120 €)  ->  reserva "pendiente de pago" + enlace de pago
Cliente recibe email con el enlace  ->  /pago/:token
Cliente paga  ->  webhook del proveedor  ->  reserva "confirmada" + email de confirmación
```

## Qué se construirá

### 1. Activar pagos
Se activarán los pagos integrados de Lovable (Stripe), sin necesidad de que crees una cuenta previa: se genera primero un entorno de pruebas para validar todo el flujo con tarjetas de test, y el cobro real se habilita después con la verificación de la cuenta. Al tratarse de servicios con guía presencial, se configurará el cálculo y cobro de impuestos en el checkout (registro y presentación siguen siendo responsabilidad del negocio).

Como no hay precios cerrados por actividad, no se creará un catálogo de productos fijos: cada cobro usa un importe puntual definido por el admin.

### 2. Panel de administración
En cada reserva y contacto del panel `/admin`:
- Campo para introducir el importe y un concepto corto.
- Botón "Generar enlace de pago" que crea el cobro y muestra el enlace copiable.
- Botón "Enviar enlace por email" al cliente (si el contacto es un email válido).
- Nuevo estado visible: **pendiente de pago**, además de los actuales.
- Indicador de pago: importe, fecha de pago y referencia de la transacción.

### 3. Página de pago del cliente
Nueva ruta `/pago/:token`, con la estética oscura de la web:
- Resumen de la actividad, fecha, número de personas e importe.
- Aviso de condiciones y política de cancelación (enlazando a `/terminos`).
- Botón de pago que abre el checkout seguro del proveedor.
- Estados claros: enlace válido, ya pagado, caducado o cancelado.
- Páginas de retorno: pago correcto y pago cancelado.

### 4. Confirmación automática
- Webhook de pagos que, al recibir el pago completado, marca la reserva como **confirmada** y guarda importe, fecha y referencia.
- Email automático al cliente con la confirmación definitiva y los datos prácticos de la actividad.
- Email de aviso al negocio (`naturaleza.s.limites@gmail.com`).
- Doble comprobación al volver a la web tras pagar, por si el webhook llega con retraso.

## Detalles técnicos

- Migración: nueva tabla `payment_requests` (reserva o contacto asociado, importe en céntimos, moneda, concepto, token público, estado, id de sesión del proveedor, fechas) con RLS: lectura pública **solo** por token vía función de servidor, escritura restringida a admin y `service_role`. Se añaden a `bookings` y `contact_submissions` los campos `paid_amount_cents`, `paid_at` y `payment_reference`, y el estado `pendiente_pago`.
- Funciones de servidor nuevas: `create-payment-link` (valida rol admin, crea el cobro y devuelve el enlace), `get-payment` (datos públicos mínimos a partir del token) y `payments-webhook` (verifica la firma, marca pagado y confirma la reserva de forma idempotente).
- `submit-request` se reutiliza para el envío de emails; se añaden plantillas de "enlace de pago" y "reserva confirmada".
- Frontend: `src/pages/Pago.tsx` + rutas de retorno, y ampliación de `src/pages/Admin.tsx`. Sin claves de pago en el cliente.

## Fuera de alcance

- Precios fijos por actividad y compra directa desde el catálogo (se puede añadir después, cuando cierres tarifas).
- Reembolsos automáticos: se gestionarán desde el panel del proveedor.

## Primer paso al aprobar

Activar los pagos integrados en el proyecto (entorno de pruebas) y crear la migración de base de datos.
