# Revisión visual completa de fotografías

## Objetivo
Sustituir fotografías genéricas, artificiales o poco creíbles por imágenes documentales reales, manteniendo intactos textos, navegación, reservas, funcionalidades e identidad visual. El logotipo actual no se modifica.

## Alcance

1. **Crear un catálogo central de imágenes**
   - Reunir en un único archivo claramente identificado las fotografías principales, sus textos alternativos, procedencia y estado (`stock provisional` o `foto propia pendiente`).
   - Mantener los catálogos técnicos de barrancos, escuelas y ferratas compatibles con esta configuración.
   - Dejar cada ubicación preparada para sustituir una foto provisional por una foto propia sin tocar el diseño.

2. **Sustituir primero las fotografías prioritarias**
   - Portada: grupo real en un cañón, con rápel y agua natural.
   - Tarjetas principales: barranquismo con neopreno y equipo correcto; escalada caliza con escalador y asegurador; vía ferrata con casco, arnés y disipador.
   - Vértigo Sapiens: entrenamiento funcional real, sobrio y sin poses artificiales.
   - Quiénes somos: conservar únicamente una fotografía real confirmada del fundador; si no es fiable, usar temporalmente material o paisaje sin inventar personas.
   - Testimonios: no añadir retratos ficticios; mantener iniciales o usar detalles documentales sin identificar clientes.

3. **Revisar el resto de la web**
   - Corregir fondos de Barranquismo, Escalada, Vías Ferratas, Actividades, Contacto, blog, fichas y galerías que estén repetidos, no correspondan a la actividad o parezcan artificiales.
   - Priorizar fotografías propias ya presentes de barrancos andaluces cuando sean adecuadas.
   - Para huecos temporales, usar solo fotografía de stock editorial con licencia clara y fuente documentada; nunca generar imágenes.
   - Evitar escenas con material dudoso, técnica insegura, anatomía extraña, rostros sintéticos o paisajes alpinos incoherentes con Andalucía.

4. **Legibilidad y rendimiento**
   - Aplicar degradados oscuros sutiles y uniformes donde haya texto sobre fotografía, evitando apagar la imagen.
   - Añadir textos alternativos específicos según actividad y lugar.
   - Mantener la portada como imagen prioritaria para LCP (`fetchPriority="high"`, sin carga diferida).
   - Aplicar `loading="lazy"` y decodificación asíncrona al resto, con dimensiones o proporciones estables para evitar saltos.
   - Solicitar formatos modernos y tamaños adecuados en las URLs de stock; conservar fallbacks compatibles.

5. **Comprobación visual**
   - Revisar portada, actividades, las tres disciplinas, Vértigo Sapiens, Quiénes somos, Contacto y blog en escritorio y móvil.
   - Confirmar que no hay imágenes rotas, textos ilegibles, recortes que oculten equipo/personas ni cambios funcionales.

## Criterio de publicación fotográfica
Toda foto de stock quedará identificada como provisional. Las futuras fotos propias deberán confirmar permiso de uso de las personas visibles antes de reemplazarlas en el catálogo central.

## Detalles técnicos
- Se creará un módulo de datos de medios tipado, reutilizado por los componentes principales.
- Los datos extensos de rutas conservarán su estructura, pero sus fuentes visuales se normalizarán mediante referencias centralizadas o resolutores por categoría/lugar.
- No se incorporará la imagen subida como fotografía de actividad; se considera una pieza de marca y queda fuera de la sustitución fotográfica.
