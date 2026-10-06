# Rediseño visual de `/pago/:token`

## Alcance
- Rediseñar únicamente la presentación de la página de pago, sin cambiar consultas, estados, importes ni apertura de Stripe.
- Mantener el aviso de pruebas, textos legales, ayuda y todos los estados funcionales existentes.

## Diseño
- Crear una composición premium en carbón y naranja: fotografía local vinculada por coincidencia exacta con la actividad o fondo abstracto sobrio.
- Usar dos columnas en escritorio y una portada compacta sobre la tarjeta en móvil.
- Dar protagonismo a actividad, datos reales disponibles, importe y una única acción de pago.
- Al abrir Stripe, retirar la acción inicial y mostrar solo `EmbeddedCheckout`, sin modificar su iframe.
- Unificar carga, error, caducado, procesamiento y pagado con el mismo lenguaje visual y controles accesibles.

## Vista de demostración
- Habilitar solo en desarrollo/vista previa `/pago/demo` con datos visuales aislados.
- Identificarla como `Vista de diseño · sin pago`, desactivar el pago y no consultar ni escribir datos ni crear sesiones Stripe.

## Validación
- Comprobar compilación y revisar visualmente `/pago/demo` en escritorio y móvil, incluida una captura de cada tamaño.
- No publicar.
