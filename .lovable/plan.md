# Barrancos de Andalucía en el catálogo del panel

## Objetivo
Que la sección «Catálogo» de /admin incluya todos los barrancos de Andalucía que aparecen en el mapa de RocJumper, además de los 9 recorridos comerciales actuales, para poder editarlos, añadirles fotos propias y usarlos en fichas privadas. La web pública no cambia: sigue mostrando los tres niveles.

## Qué se hará
1. **Recopilar la lista.** El mapa de RocJumper enlaza unos 360 barrancos de toda España y carga las ubicaciones por separado. Se revisará cada ficha enlazada y solo se quedarán las que RocJumper sitúa en Andalucía (Málaga, Granada, Cádiz, Jaén, Almería, Córdoba, Sevilla, Huelva).
2. **Guardar solo datos básicos** de cada barranco: nombre, población, provincia, grado técnico (v/a/), rápel máximo, duración si figura, y el enlace a la ficha original. No se copian textos, fotos ni vídeos de RocJumper (tienen derechos de autor).
3. **Añadirlos al catálogo del panel** en el apartado Barranquismo, marcados como «Referencia documental, pendiente de revisar»:
   - sin precio («Consultar»), sin fotos (panel «Fotografía pendiente»);
   - nivel Iniciación / Intermedio / Avanzado propuesto a partir del grado, marcado como orientativo y editable;
   - si ya existe uno de los 9 recorridos comerciales con ese nombre, no se duplica: se conserva el comercial.
4. **Filtro por provincia** y buscador sencillo en el catálogo del panel, porque la lista pasa de ~40 a más de 100 recorridos.
5. Nada se publica en la web, ni se tocan precios, reservas, cobros ni la base de datos (los cambios que hagas en el panel se guardan igual que ahora).

## Avisos
- Estar en la lista de RocJumper no significa que el barranco esté abierto, permitido o adecuado para clientes; cada uno queda pendiente de tu validación.
- Si alguna ficha de RocJumper no indica la provincia con claridad, se dejará fuera y te daré la lista para que decidas.

## Detalles técnicos
- Nuevo archivo de datos `src/data/andaluciaCanyonsRef.ts` (generado una vez con un script en /tmp que lee cada ficha y extrae región/provincia y grado; el archivo resultante es estático).
- `baseCatalog()` en `src/lib/adminCatalog.ts` añade estas entradas con clave `barranquismo:ref-<slug>`, deduplicando por nombre normalizado contra `canyonCatalog`. Las ediciones siguen en `catalog_entries` sin cambios de esquema.
- `CatalogPanel.tsx`: filtro provincia + búsqueda + etiqueta «Referencia».
- Pruebas: provincias solo andaluzas, sin duplicados con el catálogo comercial, precio nulo y nivel derivado del grado.
