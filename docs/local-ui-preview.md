# Vista local aislada de interfaz

Esta fase permite revisar pantallas sin cargar los archivos .env del proyecto.
No equivale a una prueba integral ni conecta la web a PostgreSQL directamente.

Desde la raíz del repositorio:

    node node_modules/vite/bin/vite.js --config vite.isolated.config.ts --mode isolated

Abrir http://127.0.0.1:8081. El puerto es exclusivo: si está ocupado, se rechaza
el arranque. No se carga el plugin del proveedor ni se modifica la configuración
habitual, el proyecto remoto o las variables de producción.

El cliente apunta exclusivamente a http://127.0.0.1:54321 con una clave ficticia.
Actualización: si existe .tools/local-supabase/status.local.json, se valida la URL
local exacta y se carga únicamente PUBLISHABLE_KEY con prefijo sb_publishable_.
El resto del objeto (claves de servidor incluidas) no se define en el cliente.
Sin ese archivo permanece la clave ficticia. No se leen archivos .env.
La política CSP bloquea conexiones, imágenes, fuentes, scripts y marcos externos,
incluidos pagos, analítica y recursos CDN. Los recursos locales siguen disponibles.
Esto puede dejar algunas imágenes vacías. Los enlaces que navegan a otra página
no están bloqueados por CSP: no seguir enlaces externos durante la revisión.

No introducir datos personales, iniciar OAuth, pagar ni enviar formularios.
Sin servicios locales las consultas fallarán; no se simulan usuarios ni permisos.
La vista no proporciona correo, cobros, autenticación ni Edge Functions.
No usar esta configuración para publicar una web: su política requiere el servidor
de desarrollo y está destinada exclusivamente a este ordenador.

## Comprobación del 16 de octubre

### Vista compilada: comprobación superada

El servidor de desarrollo de 8081 sigue sin superar el test por timeout; limitar
optimizeDeps a index.html, ignorar .tools y desactivar preTransformRequests no
acredita corregirlo. Se dispone de una alternativa comprobada: servir la compilación
aislada en 127.0.0.1:8082, con la misma CSP y sin plugins del proveedor.

    node node_modules/vite/bin/vite.js build --config vite.isolated.config.ts --mode isolated
    node scripts/check-isolated-static.mjs
    node node_modules/vite/bin/vite.js preview --config vite.isolated.config.ts --mode isolated

check-isolated-static pasó: HTML y bundle HTTP 200, cabecera CSP presente, endpoint
local y clave pública en el cliente, sin identificador del proyecto remoto. El test
cierra su servidor. La vista previa manual permanece hasta detener su proceso.

En navegador se comprobó portada, rechazo de cookies opcionales, calendario vacío,
calendario con una salida ficticia (Guadalmina, seis plazas, 35 EUR por persona),
enlace al formulario con el evento correcto y selección de seis participantes.
La pantalla calculó total 210 EUR, señal 63 EUR y saldo 147 EUR. No se introdujeron
datos de contacto, no se aceptaron condiciones ni se envió el formulario. Se eliminó
la salida mediante calendar-fixture.mjs remove. No se reservaron plazas.

Se observaron imágenes externas bloqueadas y un aviso Failed to load Stripe.js,
coherentes con la restricción de proveedores; no se autorizó ampliar la CSP.
La cabecera CSP se verificó por HTTP, no mediante un análisis exhaustivo de tráfico.
Los enlaces externos siguen siendo navegables: no se han seguido.

La configuración de Auth todavía tiene site_url y redirects en 8081: antes de probar
redirecciones de correo/OAuth se debe alinear con 8082 y reiniciar el proyecto local.
No habilitar OAuth externo para resolverlo. Las funciones de NSL siguen desactivadas.

La configuración pasa ESLint y Vite anunció el arranque en 127.0.0.1:8081.
Las comprobaciones HTTP desde el entorno del agente fallaron por permisos de socket
y timeout, incluso en el intento elevado. No se acredita navegación ni bloqueo
efectivo en un navegador. El servidor se detuvo tras la comprobación. Los cambios
permanecen locales, sin publicar en GitHub ni ejecutar CI remoto.

## Servicios pendientes

Diagnóstico local: Windows 11 Pro, procesador AMD Ryzen 7 5700X, soporte de
traducción de segundo nivel disponible, pero VirtualizationFirmwareEnabled=False
según Win32_Processor. WSL indica que no está instalado; no se encontró Docker
ni Podman. La consulta de características opcionales requiere una consola de
administrador de Windows; el permiso elevado del agente no la proporciona.

Antes de instalar herramientas, habilitar AMD SVM/virtualización en el firmware
del ordenador y volver a comprobar VirtualizationFirmwareEnabled. Ese cambio
requiere intervención física y reinicio; el agente no lo ha realizado. Seguir la
guía específica del fabricante de la placa base, sin cambiar otras opciones.

Referencias oficiales consultadas:
- https://supabase.com/docs/guides/local-development/docker-and-native-runtimes
  (el runtime nativo sin Docker no admite Windows).
- https://learn.microsoft.com/windows/wsl/install
  (instalación de WSL desde una consola de administrador y reinicio).

Se añadió scripts/check-isolated-preview.mjs para comprobar HTTP, cabecera CSP
y que valores VITE heredados ficticios no sustituyan al endpoint local. El intento
desde el sandbox termina con EACCES al conectar a 127.0.0.1:8081; no es una prueba
superada. Un intento elevado anterior terminó por timeout. El script cierra su
servidor y limita el tiempo total de la prueba. No se acredita el bloqueo en navegador.

La compilación con la configuración aislada terminó correctamente (3167 módulos),
con los avisos existentes de tamaño del bundle y recurso /__l5e pendiente de servir.
El resultado se guarda en .tools/local-ui-dist, ignorado por Git. Compilar no
verifica renderizado, llamadas de red ni CSP: esta última se añade al servir en dev.

Preparar un runtime local de contenedores y un proyecto Supabase separado, con
puertos verificados y sin enlazarlo al proyecto remoto. Verificar los requisitos
de Windows antes de instalarlo. Mantener pagos, correo y OAuth externos desactivados.
Revisar especialmente la separación entre el rol administrador del constructor SQL
y los roles de aplicación; nunca proporcionar credenciales de PostgreSQL al navegador.

Después: validar acceso anónimo y administrador, privacidad de salidas, reserva de
1–6 plazas, concurrencia, caducidad y solicitudes sin fecha. Las pruebas de pagos y
correo requieren dobles locales explícitos o una fase sandbox autorizada y separada.
# Estado vigente — 17 de octubre de 2026

La vista compilada aislada, la autenticación local y el pago con proveedor
simulado ya se han comprobado. Las limitaciones de instalación/virtualización
descritas más arriba son históricas y están superadas. El modo dev en 8081 no
se utiliza como evidencia: la navegación comprobada corresponde a preview en
127.0.0.1:8082. Ver [final-local-validation.md](final-local-validation.md).
