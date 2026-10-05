# Rediseño de Vértigo Sapiens

## Resultado
Convertir `/vertigo-sapiens` en una landing editorial y visual que posicione el programa como preparación física para montaña y deportes verticales, manteniendo la oferta online de 8 semanas, el precio propuesto de 179 € y la solicitud actual sin pago.

## Implementación
- Crear un hero fotográfico de gran formato con el nuevo mensaje, dos llamadas a la acción y los tres atributos clave.
- Sustituir los bloques genéricos por una secuencia de conversión: limitaciones habituales, Test Vértigo interactivo, método en cuatro pasos y transferencia del gimnasio a la montaña.
- Añadir selector accesible por disciplinas, un perfil visual de seguimiento claramente marcado como ejemplo y una oferta única más compacta.
- Rehacer el bloque de Antonio Ruiz con fotografía real y únicamente las credenciales existentes.
- Acortar las preguntas frecuentes y cerrar con el formulario actual, preservando su envío a `submit-request`.
- Pasar las respuestas del Test Vértigo al formulario mediante estado local del navegador, sin modificar la base de datos ni la lógica de clientes.

## Alcance técnico
- Refactorizar `OnlineSections.tsx` en componentes más pequeños cuando ayude a mantener la página.
- Ampliar las opciones visibles del formulario para las cinco disciplinas solicitadas, conservando exactamente su contrato de envío.
- Mantener Navbar, Footer, WhatsApp, SEO, accesibilidad, navegación por anclas y reducción de movimiento.
- No tocar pagos, suscripciones, contratación, rutas de clientes ni componentes heredados.

## Verificación
- Comprobar TypeScript y compilación con código de salida real.
- Validar en navegador a 1280 px y 390 px: composición, ausencia de desbordes, tabs, Test Vértigo, traspaso al formulario, anclas, foco y reducción de movimiento.
- No enviar solicitudes reales y no publicar.
