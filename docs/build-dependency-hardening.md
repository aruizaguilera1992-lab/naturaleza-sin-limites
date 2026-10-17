# Parches de herramientas de compilación — 17 de octubre de 2026

Base: PR #5, 8a3eacfe8918678284f5b30c6d64f60a1b895dc4.
Esta fase modifica herramientas y el lock npm; no cambia reservas, cobros,
migraciones históricas, configuración remota ni proveedores.

## Cambio delimitado

| Dependencia | Antes | Después | Alcance |
| --- | --- | --- | --- |
| postcss-selector-parser | 6.1.4 y copia 6.0.10 | 7.1.6 | Parser usado por Tailwind, typography y postcss-nested |
| esbuild bajo @esbuild-kit/core-utils | 0.18.20 | 0.25.12 | Transformación TS heredada de las herramientas Drizzle |
| esbuild bajo @lovable.dev/mcp-js | 0.27.7 | 0.28.2 | Empaquetador del plugin de compilación MCP |

Los tres overrides son explícitos y cruzan los rangos declarados por sus
consumidores. No son actualizaciones semver compatibles avaladas por esos
proveedores; se aceptan para esta aplicación únicamente con las comprobaciones
de integración indicadas. Tailwind 3.4.19, el SDK MCP y Drizzle Kit conservan sus
versiones. No se ejecuta audit fix --force ni se migra la aplicación a Tailwind 4.

El resolvedor conservaba inicialmente esbuild 0.18.20 en el lock. Se resolvió en
una carpeta aislada partiendo del lock original, retirando solo las entradas
obsoletas del subárbol core-utils y dejando que npm reconstruyera esa parte.
Se comprobó la instalación final con npm ci 10.9.4 y resolución efectiva desde
cada consumidor. Se retiró una referencia local sobrante introducida por la
resolución con --prefix; CI verifica que el lock coincide con el manifiesto y
no contiene enlaces locales ni rutas fuera del checkout.
Fuera de esbuild y sus binarios, el único cambio de versión en
una ruta ya presente es postcss-selector-parser. La resolución completa sin el
lock original actualizaba paquetes ajenos y no se incorporó.

## Resultado de audit

16 entradas (7 altas, 9 moderadas) pasan a 10 entradas altas, cero moderadas y
cero críticas. Desaparecen las cadenas de esbuild vulnerable y del parser CSS.
El número de entradas altas sube por la recalificación de tres dependientes
de Tailwind, ahora atribuidos exclusivamente a la cadena braces; no representa
tres vulnerabilidades raíz nuevas. El cambio no elimina todos los riesgos.

Quedan dos causas raíz, con propagación a diez paquetes:

- braces 3.0.3: agotamiento de pila con patrones profundamente anidados. No hay
  versión parcheada publicada en el advisory consultado. Los patrones actuales
  son archivos/configuración del repositorio; no se identificó una entrada de
  formularios públicos al parser. No compilar fuentes o patrones no confiables.
- SDK MCP 1.28.0, fijado por @lovable.dev/mcp-js: advisory del cliente OAuth HTTP.
  La web declara un servidor MCP, excluido por el propio advisory. Cambiar solo
  el override npm tampoco actualizaría las dependencias npm resueltas por el
  artefacto Deno desplegado. No se afirma que esta fase lo remedie; revisar si se
  añade un cliente OAuth saliente y actualizar el proveedor de forma coordinada.

Paquetes que audit mantiene: @lovable.dev/mcp-js, @modelcontextprotocol/sdk,
@tailwindcss/typography, braces, chokidar, fast-glob, lovable-tagger, micromatch,
tailwindcss y tailwindcss-animate. Inventario dependiente de la fecha del registro.

## Pruebas y límites

- npm ci correcto; versiones efectivas esbuild 0.25.12/0.28.2 comprobadas.
- 70 pruebas cliente y comprobación TypeScript correctas.
- Compilación habitual con plugin MCP y compilación aislada correctas.
- CSS anterior/posterior idéntico: 124416 bytes, SHA-256
  175a23e383021dd34c805abed85011ea7971fc11d2d24ee97c8f88490ef5c48a.
- El JavaScript de las dos compilaciones aisladas conserva el mismo nombre/hash
  de salida. No equivale a probar todos los consumidores futuros del parser.
- check-build-dependency-compat.mjs ejecuta TypeScript mediante transformaciones
  síncrona/asíncrona, empaqueta con esbuild del plugin MCP y genera una tabla SQL
  con Drizzle Kit en una carpeta local nueva. No conecta a ninguna base; el
  subproceso recibe solo variables básicas del sistema, sin claves de aplicación.
- test:security conserva rechazo de Host/Origin y archivos sensibles en Windows.
- CI añade la compatibilidad del generador/empaquetador en Linux y Windows,
  además de los 88 tests de servidor y reconstrucción PostgreSQL existentes.

El plugin reescribe el archivo generado supabase/functions/mcp/index.ts al
compilar; se restaura el artefacto versionado antes de preparar el commit. Esa
reescritura no forma parte de este cambio y CI no despliega ese archivo.
Persisten los avisos previos de tamaño del bundle y recurso /__l5e pendiente.
No se presenta el lint global histórico como correcto ni se certifican entornos
remotos. Los lockfiles históricos Bun/pnpm no se sincronizan ni se certifican.

Repetir: npm ci; npm test; npm run build;
node scripts/check-build-dependency-compat.mjs; npm run test:security.
Para repetir la comparación CSS, compilar la base y el candidato con la misma
configuración aislada y usar --compare-css <anterior.css> <posterior.css>.
No mantener una prueba que congele los estilos para futuros cambios de diseño.

Recuperación: revertir este commit y ejecutar npm ci. No hay cambios de esquema,
datos persistentes de negocio ni operaciones remotas que deshacer. La evidencia
exacta de CI y el SHA revisado se registran en el PR de esta fase, dependiente de
#5. No fusionar, retargetear automáticamente, desplegar ni activar proveedores.

## Referencias consultadas

- https://github.com/advisories/GHSA-rj75-hqrm-r3gf
- https://github.com/advisories/GHSA-67mh-4wv8-2f99
- https://github.com/advisories/GHSA-g7r4-m6w7-qqqr
- https://github.com/evanw/esbuild/releases/tag/v0.25.0
- https://github.com/evanw/esbuild/releases/tag/v0.28.1
- https://github.com/postcss/postcss-selector-parser/releases/tag/v7.0.0
- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- https://github.com/advisories/GHSA-6qxp-vccf-f47h
