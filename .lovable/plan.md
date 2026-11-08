# Catálogo centrado en Barranquismo, Ferratas y Espeleología

## Qué cambia para el visitante
- El catálogo (/actividades), los filtros, el calendario y la portada muestran solo tres disciplinas: Barranquismo, Vías ferratas y Espeleología.
- Las fichas de sectores de escalada (Chorro, Torcal, Gaitanes, Padul, Alfacar, etc.) dejan de ofrecerse y de aparecer en búsquedas y filtros.
- /escalada pasa a ser una página sencilla: «Iniciación a la escalada deportiva», con los contenidos reales que ya existen del nivel E1 (16 h, 2 jornadas, sin experiencia previa, qué aprenderás). Sin escuelas ni cuestionario de sectores. Al no haber precio definido: «Precio a consultar» y botón de WhatsApp.
- Quien entre a una antigua dirección de sector es llevado a /escalada (no ve un error).
- Menú y pie: la escalada se mantiene como enlace secundario «Iniciación a la escalada».

## Qué no cambia
- Reservas, pagos, señal del 30 %, correos y panel de gestión.
- Los datos de los sectores se conservan en el código (no se borran), solo se dejan de publicar, por si se recuperan más adelante.
- No se inventan precios, fechas ni fotos: se usan las imágenes y textos ya existentes.

## Detalles técnicos
- `activityProfiles.ts`: excluir `crags` del listado público; `getActivityProfile` para escalada devuelve vacío → redirección a /escalada en `ActivityProfilePage`.
- `useActivitiesData.ts`, `ActivitiesFilters`, calendario y contadores: quitar la categoría escalada.
- `lib/mcp/catalog.ts`: quitar sectores del catálogo expuesto.
- `Escalada.tsx`: retirar `ClimbingQuestionnaire`/`CragResults`; mostrar solo E1 a partir de `climbingTraining.ts`.
- `public/sitemap.xml`: eliminar URLs `/actividades/escalada/*`; ajustar SEO/metadatos y textos de portada que citen sectores.
- Actualizar memorias del catálogo de escalada y ejecutar las pruebas existentes.
- No se publica sin autorización.
