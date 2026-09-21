# Rediseño visual de fichas y vídeos oficiales en el Blog

## Objetivo
Transformar las fichas comerciales en páginas mucho más visuales y compactas, conservando toda la información actual para SEO y accesibilidad. Añadir una galería de vídeos verificados del canal oficial al Blog sin tocar pagos, reservas, calendario, base de datos ni reglas comerciales.

## Fichas individuales
- Reordenar cada ficha: portada multimedia, métricas rápidas, próximas salidas reales, galería, destacados, ficha técnica visual, seguridad/equipo, itinerario, encuentro, preguntas frecuentes, información local, relacionadas y cierre de reserva.
- Mantener la foto principal a ancho completo, título, categoría, zona, precio y reserva. Conservar la barra fija de reserva móvil.
- Mostrar métricas esenciales mediante iconos: duración, niveles técnico y físico, grupo máximo, edad, temporada y ubicación.
- Reducir “La experiencia” a una introducción breve con “Ver más”; limitar destacados a cuatro elementos visuales.
- Sustituir la tabla técnica visible por una cuadrícula compacta. El contenido completo seguirá en el DOM dentro de un acordeón.
- Agrupar Seguridad, Incluye y Qué llevar en pestañas accesibles; convertir el itinerario en una línea temporal breve.
- Mantener preguntas frecuentes e información local en acordeones, sin eliminar contenido ni datos estructurados.
- Mostrar solo la zona o el texto público ya existente; nunca revelar un punto privado del calendario.

## Galería y vídeos de actividad
- Crear una fuente centralizada que admita varias imágenes y vídeos por `category + slug`, conservando alt, fuente y licencia.
- Crear `ActivityMediaGallery` adaptable a 1, 2, 3 o más imágenes, con mosaico y visor mediante el diálogo existente.
- No mezclar fotografías de lugares distintos. La auditoría inicial indica que la mayoría de actividades tienen una única imagen individual fiable; esas fichas mostrarán una composición cuidada de una sola foto.
- Asociar únicamente vídeos inequívocos del canal oficial. Inicialmente son seguros para ficha:
  - Zarzalones Superior: `https://www.youtube.com/watch?v=0s0imVjb-zE`
  - Barranco Jorox: `https://www.youtube.com/watch?v=xd9qKdM16xQ`
- Reproducir bajo demanda con miniatura, relación 16:9 y `youtube-nocookie.com`. Si no existe consentimiento de marketing, no cargar el iframe y ofrecer configurar cookies o abrir YouTube.

## Blog y artículos
- Crear datos centralizados con hasta nueve vídeos recientes verificados del canal oficial, usando títulos e IDs reales obtenidos de YouTube.
- Añadir “Vídeos de Naturaleza Sin Límites” sin sustituir los artículos: tarjetas visuales, miniaturas diferidas, reproducción en diálogo y enlace al vídeo y al canal exacto.
- Incluir Shorts solo si aparecen entre los vídeos verificados y adaptar su proporción.
- Añadir “Vídeo relacionado” únicamente a artículos cuya temática coincida claramente; por ejemplo, el vídeo de iniciación al descenso de cañones en el artículo introductorio de barranquismo. No alterar el texto editorial.

## Rendimiento, accesibilidad y alcance protegido
- Mantener la imagen principal como carga prioritaria y diferir galerías, miniaturas e iframes.
- Añadir nombres accesibles, foco correcto, navegación por teclado, pies de fuente discretos y alternativas de enlace.
- No incorporar librerías pesadas; reutilizar Dialog, Tabs, Accordion y Button existentes.
- No modificar cobros, reservas, calendario, administración, base de datos, permisos, seguridad ni SEO técnico.
- No publicar ni desplegar.

## Verificación
- Revisar una ficha de barranquismo, una de escalada y una vía ferrata, además del Blog y un artículo relacionado.
- Validar a 390, 1280 y 1440 px: sin desbordes, medios sin deformación, texto plegable accesible, enlaces e IDs correctos y ausencia de bloques vacíos.
- Confirmar que ningún iframe de YouTube se carga antes de la interacción/consentimiento.
- Ejecutar pruebas y comprobación de tipos disponibles; el entorno realizará además su validación automática.
