# Sprint B — seguridad y compatibilidad

Base: PR #1, commit 8532f6d57eb6b9b862adba531a86bad75a6d77fe. Fecha: 16/10/2026. Rama fix/sprint-b-security.

## Cambios

Vite 6.4.4, Vitest 4.1.12 y React Router DOM 7.18.4. Se actualizan las dependencias señaladas por audit dentro de sus rangos compatibles; no se ejecuta audit fix --force ni se fuerzan overrides mayores. Tinypool deja de formar parte del árbol de pruebas. El servidor de desarrollo y preview escucha por defecto en 127.0.0.1. Una opción de lanzamiento --host puede cambiar ese valor: no exponer el servidor de desarrollo a redes no autorizadas.

El diseñador personalizado limita participantes a 1–6, valida el intervalo al avanzar y al confirmar y conserva el descuento existente para seis. El test de recorrido simula window.open: no envía mensajes.

## Validación

- npm ci correcto con npm 10.9.4 (601 paquetes). Para resolver el lock se usó npm 11.21.0 debido a un error interno edgesOut de npm 10; el lock resultante se instala con npm 10 sin opciones de omisión de peers.
- Vitest: 66/66 pruebas correctas en nueve archivos, incluidas las 65 originales y la nueva prueba de recorrido del pack. Se limita el pool a dos workers para evitar agotamiento de recursos en equipos con muchos núcleos.
- TypeScript cliente: correcto.
- Deno check: siete funciones correctas; Deno test: 81/81, sin permisos de red para el código probado.
- Vite build correcto con los avisos existentes de recurso remoto y tamaño de bundle. Se restaura el archivo generado MCP que el plugin reescribe durante build; no se incluye ningún import local de Windows en el PR.
- test:security: verifica binding real loopback, cliente Vite disponible, ausencia de CORS para un origen externo, Host externo rechazado y ficheros sintéticos .env bloqueados también mediante el stream NTFS por defecto. Una ruta de stream inexistente puede devolver fallback HTML, pero nunca el marcador del archivo. Los plugins de aplicación se excluyen en esta prueba aislada: no certifica el gateway ni el entorno desplegado.
- ESLint mantiene 69 errores y 12 avisos; los dos archivos nuevos de pruebas no añaden incidencias. No se presenta lint como correcto.
- Revisión independiente de compatibilidad y revisión final estática sin hallazgos accionables en el cambio intencionado.

## Inventario de los 50 avisos originales

Se coteja cada entrada con el lock y la nueva auditoría. “No reaparece” significa que la auditoría nueva no señala ese paquete; no es una certificación universal de seguridad ni prueba de ausencia de riesgo remoto. Los avisos pueden propagarse entre paquetes de una misma cadena. La clasificación de superficie se apoya en manifiestos, configuración, importaciones y despliegue estático; no certifica la configuración remota.

| Paquete original | Versión actual según lock | Superficie | Resultado audit |
|---|---|---|---|
| @esbuild-kit/core-utils | 3.3.2 | Compilación, pruebas, lint o migraciones | Permanece: moderate |
| @esbuild-kit/esm-loader | 2.6.5 | Compilación, pruebas, lint o migraciones | Permanece: moderate |
| @humanfs/node | 0.16.8 | Compilación, pruebas, lint o migraciones | No reaparece |
| @lovable.dev/mcp-js | 0.26.2 | MCP / transitiva de SDK | Permanece: high |
| @modelcontextprotocol/sdk | 1.28.0 | MCP / transitiva de SDK | Permanece: high |
| @remix-run/router | Retirado del árbol | Navegador | No reaparece |
| @tailwindcss/typography | 0.5.20 | Compilación, pruebas, lint o migraciones | Permanece: moderate |
| @tootallnate/once | 2.0.1 | Compilación, pruebas, lint o migraciones | No reaparece |
| @typescript-eslint/eslint-plugin | 8.71.2 | Compilación, pruebas, lint o migraciones | No reaparece |
| @typescript-eslint/parser | 8.71.2 | Compilación, pruebas, lint o migraciones | No reaparece |
| @typescript-eslint/type-utils | 8.71.2 | Compilación, pruebas, lint o migraciones | No reaparece |
| @typescript-eslint/typescript-estree | 8.71.2 | Compilación, pruebas, lint o migraciones | No reaparece |
| @typescript-eslint/utils | 8.71.2 | Compilación, pruebas, lint o migraciones | No reaparece |
| @vitest/mocker | 4.1.12 | Compilación, pruebas, lint o migraciones | No reaparece |
| ajv | 6.15.0 | Compilación, pruebas, lint o migraciones | No reaparece |
| brace-expansion | 5.0.12, 1.1.21, 2.1.7 | Compilación, pruebas, lint o migraciones | No reaparece |
| braces | 3.0.3 | Compilación, pruebas, lint o migraciones | Permanece: high |
| browserslist | 4.29.3 | Compilación, pruebas, lint o migraciones | No reaparece |
| chokidar | 3.6.0 | Compilación, pruebas, lint o migraciones | Permanece: high |
| drizzle-kit | 0.31.11 | Compilación, pruebas, lint o migraciones | Permanece: moderate |
| esbuild | 0.18.20, 0.27.7, 0.25.12 | Compilación, pruebas, lint o migraciones | Permanece: moderate |
| fast-glob | 3.3.3 | Compilación, pruebas, lint o migraciones | Permanece: high |
| fast-uri | 3.1.8 | MCP / transitiva de SDK | No reaparece |
| flatted | 3.4.4 | Compilación, pruebas, lint o migraciones | No reaparece |
| form-data | 4.0.6 | Compilación, pruebas, lint o migraciones | No reaparece |
| glob | 10.5.0 | Compilación, pruebas, lint o migraciones | No reaparece |
| hono | 4.13.13 | MCP / transitiva de SDK | No reaparece |
| ip-address | 10.7.4 | MCP / transitiva de SDK | No reaparece |
| js-yaml | 4.3.2 | Compilación, pruebas, lint o migraciones | No reaparece |
| lodash | 4.18.1 | Navegador | No reaparece |
| lovable-tagger | 1.3.5 | Compilación, pruebas, lint o migraciones | Permanece: moderate |
| micromatch | 4.0.8 | Compilación, pruebas, lint o migraciones | Permanece: high |
| minimatch | 10.2.6, 9.0.9, 3.1.5 | Compilación, pruebas, lint o migraciones | No reaparece |
| nanoid | 3.3.20 | Compilación, pruebas, lint o migraciones | No reaparece |
| postcss | 8.5.30 | Compilación, pruebas, lint o migraciones | No reaparece |
| postcss-selector-parser | 6.0.10, 6.1.4 | Compilación, pruebas, lint o migraciones | Permanece: moderate |
| proxy-addr | 2.0.8 | MCP / transitiva de SDK | No reaparece |
| qs | 6.16.1 | MCP / transitiva de SDK | No reaparece |
| react-router | 7.18.4 | Navegador | No reaparece |
| react-router-dom | 7.18.4 | Navegador | No reaparece |
| rollup | 4.64.7 | Compilación, pruebas, lint o migraciones | No reaparece |
| source-map-js | 1.2.2 | Compilación, pruebas, lint o migraciones | No reaparece |
| tailwindcss | 3.4.19 | Compilación, pruebas, lint o migraciones | Permanece: high |
| tailwindcss-animate | 1.0.7 | Compilación, pruebas, lint o migraciones | Permanece: moderate |
| tinypool | Retirado del árbol | Compilación, pruebas, lint o migraciones | No reaparece |
| typescript-eslint | 8.71.2 | Compilación, pruebas, lint o migraciones | No reaparece |
| vite | 6.4.4 | Compilación, pruebas, lint o migraciones | No reaparece |
| vitest | 4.1.12 | Compilación, pruebas, lint o migraciones | No reaparece |
| ws | 8.22.0 | SDK Supabase / pruebas | No reaparece |
| yaml | 2.9.1 | Compilación, pruebas, lint o migraciones | No reaparece |

Resultado: 50 avisos originales (3 críticos) → 16 avisos actuales (0 críticos, 7 altos, 9 moderados). Se incorpora una entrada nueva propagada: postcss-nested; queda evaluada con la cadena de estilos.

## Evaluación de los 16 restantes

1. **braces → chokidar / micromatch → fast-glob → tailwindcss → typography / lovable-tagger / tailwindcss-animate**: varios avisos altos/propagados según la combinación instalada. El advisory GHSA-vfj7-8cjw-p6xm no tiene parche publicado. Requiere patrones profundamente anidados controlados por atacante. tailwind.config.ts usa patrones de archivos del repositorio, no datos de reservas ni formularios. No se ha identificado una ruta de un visitante a ese parser; no se considera demostrado un DoS remoto. No degradar paquetes a versiones antiguas sugeridas automáticamente. Mantener compilación sobre fuentes de confianza y planificar migración de Tailwind con prueba visual separada.
2. **postcss-selector-parser → postcss-nested / tailwindcss / typography**: tres entradas directas/propagadas, con solapamiento en la cadena anterior. El parche del parser es 7.1.6; los consumidores actuales piden 6.x. No forzar un major transitivo sin comprobar compatibilidad. El CSS de entrada es código del repositorio; no se acepta CSS de usuarios. Falta una validación independiente para cualquier futura compilación de temas externos.
3. **@modelcontextprotocol/sdk → @lovable.dev/mcp-js**: dos entradas altas propagadas por GHSA-6qxp-vccf-f47h. El SDK está fijado por el proveedor a 1.28.0; el advisory afecta al cliente OAuth HTTP que conecta a servidores no confiables. La aplicación declara un servidor con issuer y transporte WebStandard; esa ruta está excluida por el advisory. No se cambia de familia mayor del proveedor para silenciar audit. Reabrir si se añade un cliente MCP saliente o cambian los adaptadores.
4. **esbuild → @esbuild-kit/core-utils → @esbuild-kit/esm-loader → drizzle-kit**: cuatro entradas moderadas/propagadas. Drizzle 0.31.11 conserva un esbuild 0.18.20 en su loader; el aviso principal requiere esbuild.serve. Los comandos de la web usan Vite y no ese servidor, y no se ha identificado un serve/Studio público. Mantener estas herramientas locales; no ejecutar Studio sobre datos reales desde una interfaz pública. La copia de esbuild del SDK también tiene un aviso bajo de servidor Windows; aquí se usa para empaquetado, sin un servidor de ese tipo identificado.

Las enumeraciones anteriores describen cadenas solapadas: no deben sumarse. Lista exacta actual de paquetes: @esbuild-kit/core-utils, @esbuild-kit/esm-loader, @lovable.dev/mcp-js, @modelcontextprotocol/sdk, @tailwindcss/typography, braces, chokidar, drizzle-kit, esbuild, fast-glob, lovable-tagger, micromatch, postcss-nested, postcss-selector-parser, tailwindcss, tailwindcss-animate.

Fuentes: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm ; https://github.com/advisories/GHSA-rj75-hqrm-r3gf ; https://github.com/advisories/GHSA-6qxp-vccf-f47h ; https://github.com/advisories/GHSA-67mh-4wv8-2f99 .

## Revisión e integración

Este cambio depende del PR #1 y debe revisarse contra su rama para aislar el Sprint B. CI de PR admite esa base y main; no incluye despliegue. npm/package-lock son la ruta comprobada en CI; los lockfiles históricos de Bun/pnpm no se sincronizan ni se certifican.

No fusionar ni retargetear automáticamente. main conserva el workflow FTP con npm install; seguridad del despliegue, validación de migraciones en copia aislada y proveedores sandbox pertenecen a la siguiente fase y siguen pendientes. No se han desplegado cambios, aplicado migraciones remotas, activado pagos reales ni enviado comunicaciones.

CI incluye además un job Windows para comprobar NTFS en su plataforma real. En Linux, las rutas de streams inexistentes pueden usar el fallback HTML; en ambas plataformas se exige que nunca expongan el marcador sintético. La petición normal al archivo .env siempre debe fallar.
