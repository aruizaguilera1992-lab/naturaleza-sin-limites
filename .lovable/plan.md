# Fichas SEO y comerciales para todo el catálogo

## Objetivo
Convertir cada actividad publicada en una página individual responsive y orientada a reserva, empezando por barranquismo y extendiendo el mismo sistema a escalada, vías ferratas y espeleología. Se conservarán el orden del catálogo, filtros, favoritos, comparador y flujo de reserva.

## Alcance
- Crear una URL estable por actividad con el formato `/actividades/{categoria}/{slug}`.
- Enlazar “Más info” desde cada tarjeta a su ficha individual; mantener “Reservar”, favoritos y comparación sin cambios.
- Mantener los datos actuales cuando estén respaldados por la fuente enlazada.
- Contrastar primero barranquismo con fuentes técnicas u oficiales; después aplicar el mismo criterio al resto.
- Mostrar `[PENDIENTE DE CONFIRMAR]` para ratios, punto de encuentro, material del cliente, permisos, políticas u otros datos operativos que no estén confirmados.

## Contenido de cada ficha
1. H1 con actividad y destino.
2. Subtítulo breve y resumen de decisión.
3. Descripción comercial de 100–140 palabras.
4. Seis puntos destacados verificables.
5. Seguridad y requisitos.
6. Qué incluye y qué debe traer el cliente.
7. Punto de encuentro.
8. Itinerario de siete pasos.
9. Tabla técnica completa.
10. Ocho preguntas frecuentes específicas.
11. Dos llamadas a la acción: grupo abierto y salida privada.
12. Texto SEO local de 500–700 palabras con H2 y H3 útiles.
13. Actividades relacionadas de la misma zona, categoría o nivel.

## Diseño
- Página oscura coherente con Naturaleza Sin Límites, sin alterar la identidad actual.
- Cabecera fotográfica, resumen de decisión escaneable, secciones sin tarjetas anidadas y ficha técnica legible.
- Una columna en móvil y distribución editorial con columna auxiliar en escritorio.
- Acciones de reserva visibles y táctiles, sin scroll horizontal.

## SEO
- `title` único de máximo 60 caracteres y descripción única de máximo 155.
- Canonical autorreferente bajo `https://vertigo-adventures-hub.lovable.app`.
- Open Graph por ruta para rastreadores que ejecutan JavaScript.
- JSON-LD `Product` + `Offer` solo cuando exista precio válido, `FAQPage` y referencia a `LocalBusiness`.
- No añadir `Event` sin fecha concreta.
- Slugs legibles basados en categoría, nombre y destino.

## Modelo de datos y fuentes
- Ampliar los tipos actuales con campos editoriales y operativos opcionales, sin inventar datos antiguos.
- Centralizar la transformación a ficha en una única capa de contenido reutilizable para las cuatro categorías.
- Registrar fuente y estado de verificación por actividad.
- Tratar precios, seguros, titulaciones, ratios y condiciones comerciales como datos propios: si no están confirmados, quedarán pendientes aunque una fuente externa describa el recorrido.

## Implementación técnica
- Añadir un buscador de actividad por categoría/slug y una página dinámica de detalle.
- Crear componentes reutilizables para resumen, ficha técnica, FAQ, contenido local, relacionados y CTAs.
- Integrar `react-helmet-async` ya existente para metadatos por ruta.
- Conservar imágenes centralizadas, `alt` específico, carga prioritaria en cabecera y diferida fuera del primer bloque.
- Mantener compatibilidad con el catálogo unificado y el servidor MCP existente.

## Verificación
- Validar que todas las actividades publicadas generan una URL única y resoluble.
- Comprobar navegación desde `/actividades`, retorno al catálogo y CTAs.
- Revisar una muestra representativa de cada categoría y todos los barrancos.
- Probar 320, 375, 768, 1024 y 1440 px sin desbordamiento.
- Ejecutar comprobación de tipos y pruebas de rutas, metadatos, datos estructurados y campos pendientes.

## Límites honestos
- Las redes sociales que no ejecutan JavaScript verán los metadatos generales de la web, no los específicos de cada ficha, mientras el proyecto siga siendo una aplicación estática.
- Ningún dato comercial u operativo no confirmado se presentará como definitivo.
