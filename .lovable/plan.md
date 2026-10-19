# Checklist de lanzamiento comercial — Naturaleza Sin Límites (sincronizado 19/10/2026)

Esto es solo un documento de coordinación. Aprobarlo NO pone en marcha ninguna tarea: cada tarea pendiente necesita una autorización propia y aparte. Vértigo Sapiens y los planes de entrenamiento no entran en el lanzamiento inicial.

Leyenda: [T] confirmado por el titular (Antonio) · [E] hay prueba técnica · [?] sin verificar o por confirmar

## A. Hecho

- [E] PR #1–#7 integrados, con las comprobaciones automáticas en verde. main = 4e12e2e1384b37f1d1c8556c5b08d048e4631075, que es la versión que tiene Lovable. Web sin publicar.
- [T] Automatismo FTP de GitHub desactivado y sus secretos retirados. Contraseña FTP de Hostinger cambiada y cuenta adicional eliminada.
- [T] Pruebas de seguridad y de Stripe correctas, pagos activos y Resend funcionando dentro de Lovable. Esto lo ha validado el titular; no es una auditoría independiente y no se repite. Un aviso de acceso al conector no significa que fallen los envíos.
- [T] Hay una copia de seguridad a la vista, del 19/10/2026 04:39:45 UTC. Nunca se ha probado a recuperarla.
- [E] Última lectura de la base real: 13 migraciones, hasta 0012_add_booking_discount_percent, que coinciden con el repositorio. Ninguna salida tenía más de seis plazas de aforo u ocupación en ese momento. No se aplicó ninguna migración remota.
- [E] PR #8: su CI 39236121280 pasó, incluida una copia y restauración sobre una base ficticia. Eso no demuestra que la copia de la base real se pueda recuperar.

## B. Pendientes técnicos, por orden (ninguno empezado)

1. [?] Copia de seguridad: comprobar que existe, su fecha y lo que incluye. Preparar cómo se recuperaría y una copia de ensayo aislada sin datos personales. La vista previa usa la base real, así que no sirve como copia aislada. Nunca restaurar sobre el proyecto actual.
2. [?] Probar 0013_capacity_max_six y 0014_atomic_deposit_intents en esa copia aislada. Comprobar que se conservan reservas y descuentos, que el aforo máximo es seis, y que todo aguanta reservas simultáneas y reintentos sin duplicados. Coordinar migración, funciones y web, sin reescribir el historial ni el SQL ya aplicado.
3. [?] Terminar la revisión del PR #8 (head 15aa5e6, sin fusionar). Fusionarlo requiere autorización aparte.
4. [?] Actualizar la base real solo después de una copia y un ensayo correctos, y con autorización expresa. Ahora está PROHIBIDO.
5. [T] Seguridad, Stripe y correo se dan por buenos. Solo se proponen comprobaciones nuevas si un cambio posterior toca esos flujos o falta una prueba concreta, y siempre sin cobros reales ni envíos automáticos.
6. [?] Revisar o desactivar la conexión GIT/webhook de Hostinger sin borrar archivos. Dejar Lovable como destino de publicación, con un plan para volver atrás.
7. [?] Normas de protección de main: definir un flujo que funcione con la edición directa de Lovable antes de obligar a usar PR.
8. [?] Avisos de dependencias (braces y el SDK de MCP) documentados y abiertos: no decir que la revisión está limpia y no forzar actualizaciones.
9. [?] Publicación final y apertura comercial: necesitan autorización aparte. No publicar ahora.

## C. Por confirmar con el titular (no se da por hecho que falten o estén mal)

- Qué actividades se ofrecen de verdad, con sus fechas, precios y contenido.
- Mínimo de participantes y máximo de seis.
- Con cuánta antelación se reserva y cuándo se cierran las reservas.
- Cancelación, devolución, mal tiempo y qué pasa si alguien no se presenta.
- Requisitos, material, duración y dificultad de cada actividad.
- Cómo se atiende a los clientes y cómo se preparan las salidas.
- Qué hacer ante problemas de pago, de plazas o de correo.
- Datos del titular, textos legales, privacidad, cookies y documentación aplicable.
- Justificantes, facturación y cobro del saldo pendiente.
- Dominio definitivo, HTTPS y www.
- Revisión en móvil de fichas, calendario, formulario y contacto.
- SEO local, indexación y enlaces a los perfiles.
- Quién vigila reservas, pagos, correos y errores durante la apertura.
