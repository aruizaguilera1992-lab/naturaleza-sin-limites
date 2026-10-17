# Supabase local independiente

**Estado actual: 17 de octubre de 2026.** El informe vigente está en
[final-local-validation.md](final-local-validation.md). Las secciones de arranque
inicial de este documento son históricas: Auth, API y Edge Runtime locales ya
han sido validados, con datos ficticios y proveedores bloqueados. El adaptador
Docker ahora utiliza exclusivamente una named pipe de Windows, sin listener TCP.

Preparación del 16 de octubre de 2026. Docker Engine 29.8.2 responde en el contexto
local desktop-linux. Supabase CLI oficial v2.121.0 se descargó de GitHub y su ZIP
se comprobó contra checksums.txt (SHA256
2606459be86e12e03fb6f6b9aa12a02aa00cfe21374857ec837a09c70b837eca).

El proyecto está en .tools/local-supabase/project, ignorado por Git, separado del
supabase/config.toml habitual. No se ejecuta login, link, db push ni deploy.
La copia sin secretos de configuración está en scripts/local-supabase/config.toml.

La red Docker nsl-isolated-local se creó con la opción
com.docker.network.bridge.host_binding_ipv4=127.0.0.1. Antes de conectar la web,
comprobar con docker inspect que todos los puertos publicados usan 127.0.0.1.
No dar por probado el aislamiento de puertos únicamente por crear la red.

Servicios previstos: PostgreSQL 17 nuevo en 54322, API 54321, Auth y buzón de
pruebas local 54324. Este PostgreSQL difiere del fixture portable 16.14 previo;
sus resultados no son intercambiables sin repetir las comprobaciones.
Studio, Realtime, Storage, Edge Runtime y analítica están desactivados.
No se copiaron .env, claves de proveedores, funciones ni datos personales.
Las confirmaciones de Auth requieren el buzón local; no se configuró SMTP externo.

## Arranque y parada

Desde la raíz, con docker.exe en PATH:

    node scripts/local-supabase/start.mjs
    .tools/local-supabase/bin/supabase.exe stop --workdir .tools/local-supabase/project

La salida de start/status puede contener claves locales; no publicarla. El registro
del primer arranque se guarda únicamente en la carpeta ignorada. No usar --all ni
operaciones de borrado: podrían afectar otros proyectos.

## Resultado del primer arranque

La descarga terminó y se observaron PostgreSQL, Auth y el buzón local sanos, con
PostgREST y gateway en ejecución. Sin embargo, docker ps mostró publicaciones
0.0.0.0 y :: para 54321, 54322 y 54324. La opción de red recomendada por la
documentación no restringió estas publicaciones en esta combinación de CLI y
Docker Desktop. Se detuvieron primero los tres contenedores con puertos y luego
todo el proyecto mediante stop, conservando los volúmenes. Una comprobación final
no mostró contenedores en ejecución de nsl-isolated-local.

No se cargaron las migraciones de NSL, datos de clientes, claves de proveedores ni
funciones. No conectar la web ni repetir start hasta corregir y verificar el enlace
de los puertos. El arranque parcial no se considera validación integral superada.

## Trabajo siguiente

### Edge Runtime real: comprobación superada para el flujo de actividades

prepare-edge.mjs copia solo TS/JSON necesarios (sin tests ni .env) al proyecto local:
submit-request, create-activity-deposit, retry-notification, payments-webhook y
get-payment, más _shared y los tipos generados. No enlaza ni despliega. Genera un
secreto de firma ficticio y ajustes de correo deshabilitado/pagos live=false.
El config habitual permanece intacto; el config del proyecto local habilita Edge.

    node scripts/local-supabase/prepare-edge.mjs
    node scripts/local-supabase/start.mjs edge

El segundo comando permanece activo. Desde otra terminal:

    node scripts/local-supabase/seal-edge.mjs
    node scripts/local-supabase/check-edge-http.mjs

seal-edge calienta dependencias con OPTIONS (webhook GET/405), sin datos, antes de
retirar la salida de red. Crea nsl-edge-internal con internal=true, conecta gateway
y runtime, desconecta runtime de otras redes y comprueba ausencia de puertos
publicados y de claves API de Stripe/Resend/Lovable. Una función canario que intenta
contactar example.com acredita fallo de salida; no se prueba contra producción.
Al cambiar redes, Kong conservaba la dirección DNS anterior: reiniciarlo y esperar
su salud corrigió el timeout. El script incorpora ese reinicio si cambia la red.

Resultado real por HTTP a /functions/v1: CORS/OPTIONS, rechazo sin credenciales,
validación de datos, clave pública del navegador aceptada, solicitud recibida con
avisos omitidos, depósito de seis plazas/63 EUR, reintento y recuperación del mismo
token. La llamada anónima a retry-notification devuelve 401. Webhook sin JWT pero
con HMAC ficticio: firma incorrecta 400, correcta 200, pago pagado y seis plazas
confirmadas; repetición sin duplicar notificaciones ni plazas. Fixtures eliminados.

El primer test esperaba 401 al omitir Authorization pero mantenía apikey: Kong
deriva su credencial anónima de esa clave. Se corrigió el caso para omitir AMBAS
credenciales y entonces se verificó 401; no se rebajó la configuración del gateway.

El proxy de preview ahora remite todas las rutas Supabase al gateway 54321. Ya no
usa los servidores Deno alternativos 54325/54326. La UI no se ha revalidado de extremo
a extremo con checkout embebido. get-payment solo pasó arranque/OPTIONS: no se da
por validado el acceso al proveedor ni cobro. OAuth externo, planes y portal quedan
fuera de estas pruebas. No se afirma equivalencia completa con la plataforma remota.

El adaptador Docker temporal de start.mjs permanece mientras functions serve corre;
al terminar la validación se detiene ese proceso y el contenedor runtime dedicado.
El resto de la base local y sus volúmenes se conservan. Para repetir, arrancar y
sellar de nuevo antes de enviar fixtures. No usar funciones locales sin sellar.

### Recuperación visual con las seis plazas retenidas

El endpoint create-activity-deposit admite action=recover con UUID estricto. Busca
únicamente la intención privada asociada a esa referencia aleatoria y comprueba el
entorno del pago y el hold vigente; no crea registros, no envía correo ni recupera
por email/nombre. Una referencia desconocida devuelve 404 y una caducada 409. La
referencia actúa como capacidad secreta; no publicarla ni registrarla en analítica.

ReservarActividad consulta la referencia guardada cuando llega con ?evento= y
presenta Retoma tu reserva/Retomar mi reserva aunque la salida ya esté completa o
fuera de la lista. Si recupera token no presenta un formulario nuevo ni cantidades
predeterminadas engañosas. Solo navega al mismo pago; allí debe revalidarse su estado.
La recuperación también puede acceder a un pago ya pagado, sin crear otro depósito.

Prueba manual: /__local_recovery (solo middleware preview) creó seis plazas mediante
HTTP al entrypoint Deno local y descartó el token de la respuesta. Después navegó al
formulario con solo la referencia en sessionStorage. La pantalla recuperó la reserva,
no mostró otro formulario y el botón abrió /pago/<token existente>. El servicio de
get-payment no está servido localmente: no se acredita pago completo ni su pantalla.

check-browser-recovery.mjs comprobó una reserva, un pago, una intención y seis plazas.
Se eliminaron notificaciones, pago, intención por cascada, reserva y evento ficticios.
La prueba API pasó para referencia vigente/desconocida/caducada. La regresión de
ReservarActividad.recovery.test.tsx pasó para salida ausente, consulta de recuperación
sin crear intención y navegación al pago existente. Build aislado y TypeScript pasan.

serve-deposit.ts escucha solo 127.0.0.1:54326, con acceso de red limitado a ese puerto
y 54321, correo deshabilitado y pagos live desactivados. El proxy preview remite
solo create-activity-deposit a ese servicio. No equivale a Edge Runtime/JWT gateway.

### Corrección del reenvío inicial: validada localmente

0014_atomic_deposit_intents es una migración aditiva: tabla privada con RLS,
sin permisos anon/authenticated, y RPC ejecutable solo por service_role. No se
modificaron SQL históricos. El navegador exige UUID aleatorio, persiste ID y SHA256
del cuerpo en sessionStorage (sin contactos), y reutiliza la clave para datos iguales.
Si no puede persistirla no envía. Cambiar el cuerpo crea una intención distinta.

El handler valida el cuerpo, origen, entorno y catálogo, y delega reserva/hold/pago
a una operación de base atómica. La RPC serializa una misma clave bajo bloqueo,
compara huella, y devuelve el mismo token si el hold sigue vigente o el pago ya está
pagado. No reactiva una intención caducada. No deduplica por datos personales.
Los importes y fecha reales se calculan dentro de la RPC con la salida bloqueada.
Los avisos usan las claves durables existentes. La RPC no llama a proveedores.

Resultados: reenvío tras respuesta perdida y reintentos simultáneos conservan token,
una reserva y dos plazas. Dos peticiones iniciales simultáneas también conservan
un único token. Cambiar participantes con misma clave devuelve intent_mismatch;
otra clave permite una reserva legítima si hay plazas. Se verificó precio propio
de la salida y rechazo intent_expired. Fallo inyectado al insertar payment_requests:
rollback de booking, hold, contador e intención. Se retiró el constraint de fallo y
todas las filas ficticias. Se conservaron las primeras 14 entradas del journal local.

La migración se aplicó SOLO al PostgreSQL local (15 entradas). El primer verificador
de historial comparó Array con Result de postgres-js y falló por prototipo; se
normalizó la comparación y pasó. No se reescribió el historial para resolverlo.
La prueba histórica PGlite mantiene su alcance de 0012/0013; la nueva RPC se valida
en PostgreSQL real. Las antiguas pruebas de compensación multietapa se sustituyeron
por pruebas del contrato RPC y rollback real, pues ya no existe ese flujo multietapa.

Verificación: 69 pruebas cliente, 18 de handler, seis integraciones locales, ocho
históricas de migraciones, TypeScript y build aislado correctos. ESLint de helper y
scripts nuevos y git diff --check correctos. Todo permanece sin commit/push/CI remoto.

Este resultado sustituye el diagnóstico BLOQUEANTE anterior para el contrato con
requestId. No se admite el contrato antiguo sin clave (400). Despliegue futuro requiere
primero migración, luego función y cliente coordinados; no hacerlo automáticamente.
Quedan la recuperación visual si el primer hold ocupa todo el aforo y la salida
desaparece de la lista, pruebas HTTP/Edge Runtime y checkout completo en navegador.
El backend impide duplicación; no se certifican todavía todos esos recorridos UI.

### BLOQUEANTE: reenvío de la creación inicial del depósito

deposit-replay.test.ts reprodujo el fallo con PostgreSQL y REST locales reales:
primera petición para dos participantes finaliza, su respuesta se descarta y se
reenvía el mismo cuerpo. Resultado: dos bookings, dos tokens de pago diferentes y
cuatro plazas retenidas. No se produjo cargo ni llamada de proveedor. Se eliminaron
todas las filas de prueba. El aforo de seis no se excedió, pero se consumió capacidad
duplicada para una sola intención de reserva.

El test es un DIAGNÓSTICO que confirma el defecto, no una aceptación superada ni un
incremento de cobertura aprobada. El bloque de errores iniciales sigue ABIERTO.
La idempotencia de openCheckout no protege handleDeposit, que crea otra reserva.
Se ajustaron los mensajes para evitar recomendar el reenvío ante una respuesta
incierta; esto es mitigación informativa, no resuelve la duplicación.

Corrección pendiente: identificador de intención generado por el navegador y
persistido durante reintentos; creación atómica/única de reserva, hold y solicitud
de pago en servidor, con validación de igualdad de payload. No deduplicar por email
o fecha (podría unir reservas legítimas). No aceptar simplemente un booking_id del
cliente ni exponer un token existente por coincidencia de datos personales.

Aceptación: respuesta perdida/reintento y llamadas concurrentes con la misma clave
devuelven el mismo token, una reserva, un hold y una solicitud; cambio de payload
con la misma clave se rechaza; una intención distinta permite otra reserva si hay
plazas. Validar expiración y limpieza antes de integrar. Requiere una migración
aditiva y pruebas; no modificar el historial SQL ya validado ni aplicar cambios remotos.

### Cierre de la comprobación del panel de incidencias

El webhook ahora guarda bookings.status=incidencia_plazas si falla la confirmación
de plazas tras pago. Si un reintento consigue plazas, restaura confirmada únicamente
desde incidencia_plazas y limpia solo errores last_error con prefijo plazas:.
Los fallos de escritura del estado provocan error para permitir reintento del webhook.
webhook.test.ts pasó con falta de plazas, repetición y posterior recuperación real.

El panel interpreta las reservas antiguas confirmadas con pago pagado y error plazas:
como incidencia; no modifica los datos históricos al leer. Añade etiqueta y filtro,
contador en Resumen y prioridad en Por atender. Una incidencia ya no deja el resumen
en Nada pendiente. Todo al día. No se altera la cantidad cobrada ni se reembolsa.

Validación en navegador con Auth local real y una reserva antigua ficticia:
contador Incidencias de plazas 1, lista Por atender, filtro y detalle con estado
Incidencia de plazas y advertencia Pago recibido sin plaza confirmada. El usuario
admin, su rol, pago, reserva y salida ficticios se eliminaron al terminar.

El acceso habitual usa Google. Para no habilitar OAuth externo, /__local_login existe
solo como middleware de preview en vite.isolated.config.ts; autentica usuarios reales
del Supabase local por contraseña y guarda su sesión local. No forma parte del build
de producción ni concede roles. login.html y panel-fixture.mjs usan datos sintéticos;
la cuenta está eliminada. No usar este acceso para usuarios reales.

Comprobaciones: build aislado y TypeScript pasan; suite cliente previa 66/66; nueva
regresión en Admin.access.test.tsx pasa con los tres casos del archivo. La regresión
verifica contador, prioridad pendiente, filtro, detalle y ausencia de Confirmada.
El primer intento de esa nueva prueba falló por faltar gte en el doble de consultas;
corregido el doble, pasa. No se modifica una consulta real para acomodar el test.

Este cierre sustituye las limitaciones anteriores sobre panel no comprobado y
estado confirmado contradictorio. Aún pendientes: checkout completo en navegador,
errores de red del depósito inicial, Edge Runtime y revisión/CI para GitHub.

### Panel y autorización del reintento

La revisión detectó que PaymentPanel no presentaba last_error del pago. Ahora añade
una advertencia con role=alert junto a los pagos pagados cuyo last_error empieza
por plazas:. Muestra Pago recibido sin plaza confirmada y pide resolver la incidencia;
no imprime mensajes técnicos internos. No modifica estados, plazas ni dinero.
El estado de la reserva puede seguir figurando confirmada en otras superficies:
este aviso no sustituye una reconciliación del modelo ni un filtro global de incidencias.
La suite cliente completa pasó: nueve archivos y 66 pruebas. El primer intento
no llegó a ejecutar pruebas por EPERM en el temporal del sandbox; al repetir con
permisos adecuados pasaron las 66. No fue una regresión de la aplicación.
El cambio pasó TypeScript; aún falta validación visual con un fixture en el panel.

retry-auth.test.ts pasó usando Auth local real: anónimo 401, usuario ordinario 403,
admin con ID inválido 400, admin con aviso válido 200/status omitido/ok=false al estar
el correo deshabilitado. No se confunde una respuesta HTTP correcta con correo enviado.
Captura el handler del entrypoint; no valida el gateway ni la pantalla de reintento.
El cliente administrativo de retry-notification desactiva persistencia y refresco
de sesión; la prueba conserva la detección de fugas. Usuarios, roles y aviso ficticios
se eliminaron en teardown. Nada desplegado ni fusionado.

### Incidencias y recuperación de notificaciones

Se amplió webhook.test.ts con una reserva cuyo hold se libera y cuyas seis plazas
se adjudican a otra reserva. El webhook válido conserva el pago pagado, el enlace
original sigue liberado, el contador permanece en seis y last_error contiene plazas.
Se registra incidencia_plazas_negocio y no pago_confirmado_cliente. Repetir el
evento no duplica avisos. Los registros ficticios se eliminaron. El estado de pago
no se revierte ni se ejecuta reembolso; requiere reconciliación manual y revisar
cómo presenta esa incidencia el panel (esta prueba no certifica esa interfaz).

notification-recovery.test.ts usa claim_notification/finish_notification reales y
un doble en memoria del gateway de correo. Intercepta exclusivamente su URL exacta;
las demás URLs externas se rechazan y Deno solo permite red al Supabase local.
Las claves son cadenas dummy. Primer intento: error 500 simulado después de que
el doble acepte el mensaje. Dos reintentos concurrentes: una entrega registrada,
misma clave de idempotencia y una sola aceptación en el doble. Tras enviado, otro
intento devuelve ya_enviado sin llamar al doble. El registro local fue eliminado.

No se envió correo. El estado enviado de esta prueba significa aceptación del doble,
no entrega por Resend. No se valida el endpoint administrativo retry-notification,
autorización admin de ese endpoint, backoff automático ni entrega en un buzón real.

### Webhook firmado local y confirmación repetida

webhook.test.ts pasó con el entrypoint real payments-webhook y RPC/base reales.
Captura Deno.serve y entrega Request, por lo que no es una prueba del transporte
de Edge Runtime o de entrega desde Stripe. Los eventos se firman con HMAC SHA256
y un secreto aleatorio ficticio del proceso. Solo se permite red a la API local.

Se rechazaron firma incorrecta y timestamp de hace diez minutos (400). Eventos
firmados con importe distinto, moneda USD, livemode=true o payment_status=unpaid
no cambiaron el pago pendiente ni el hold. Las discrepancias de importe/moneda
se reconocen con respuesta 200 del webhook pero sin aplicar el pago: no se debe
confundir el código HTTP con una confirmación.

Un evento válido marcó pagado y confirmó dos plazas; repetir exactamente el mismo
evento conservó el total de dos y las mismas filas de notificación (sin duplicados).
Ambos avisos quedaron omitidos por falta de credenciales de correo. Se eliminaron
las filas ficticias. El cliente administrativo del webhook ahora desactiva sesión
persistente y refresco automático, igual que submit-request; la prueba pasa con
detección de fugas activa. Cambios sin desplegar.

La suite conjunta submit-request.test.ts, deposit-checkout.test.ts y webhook.test.ts
se ejecuta con Deno y los permisos locales antes descritos. Falta integración con
Edge Runtime, el checkout completo en navegador, recuperación de errores de
notificaciones y reconciliación de pagos sin plazas. No se certifica Stripe real.

### Depósito y checkout con proveedor simulado

deposit-checkout.test.ts pasó contra Supabase/PostgreSQL local. Ejecuta handleDeposit
y openCheckout reales, reserva dos plazas, calcula 7000 céntimos de total y 2100 de
señal, y usa begin_checkout_generation/prepare_deposit_checkout/record_checkout_session
reales. El proveedor de sesiones está sustituido por un Map en memoria; no hay SDK
ni llamada Stripe. La red permitida es únicamente 127.0.0.1:54321.

Escenarios superados:
- Creación de sesión seguida de respuesta perdida: primer intento falla; el segundo
  usa la misma clave y parámetros, recibe la misma sesión y la registra. Una sesión
  simulada, dos intentos, sin cancelar la sesión recuperada.
- Fallo simulado al registrar sesión: se solicita su expiración al doble y no se
  devuelve clientSecret. Esto acredita la intención de cancelar, no una cancelación
  real de Stripe. Tampoco se valida persistencia de last_error (doble sin escritura).
- Hold vencido antes de checkout: se rechaza sin llamar al proveedor.

Cada escenario eliminó reservas, solicitudes de pago, enlaces de plazas y evento
ficticios. Se ejecutó con --no-check, detección de fugas activa y sin ampliar red:

    .tools/deno.exe test --no-check --no-lock --no-config --node-modules-dir=none --allow-read=.tools/local-supabase/status.local.json --allow-net=127.0.0.1:54321 scripts/local-supabase/deposit-checkout.test.ts

No valida el webhook, dinero real, checkout embebido desde navegador, respuesta
perdida del endpoint inicial de depósito ni idempotencia de esa creación inicial.
No se han fusionado, publicado ni desplegado estos cambios locales.

### Plazas, concurrencia y reintentos en PostgreSQL 17 local

    node scripts/local-supabase/check-seats.mjs

Resultado: las cinco comprobaciones pasaron. Se rechazan siete participantes sin
cambiar plazas; repetir la reserva de cuatro no duplica plazas (el reintento devuelve
un rechazo, no una respuesta de éxito idempotente). Dos conexiones nativas diferentes
compiten por las últimas dos: una transacción mantiene el bloqueo 250 ms, una gana y
la otra recibe sin_plazas. El total permanece en seis.

Confirmar dos veces y liberar dos veces no cambia dos veces el contador. Caducar un
hold libera sus plazas. Después de adjudicarlas a otra reserva, una confirmación
tardía devuelve sin_plazas y no excede seis. La llamada RPC desde REST anónimo es
rechazada (401/403). Las reservas se ejecutan con SET LOCAL ROLE service_role; las
confirmaciones/liberaciones y preparación de fixtures usan la conexión local de
administración. Se eliminaron el evento y las cuatro reservas ficticias al terminar.
El informe sin claves está en .tools/local-supabase/seats-report.json. ESLint y
git diff --check pasaron.

Es una prueba acotada, no de carga ni de todos los órdenes de bloqueo. No verifica
un webhook de pago ni checkout o reembolsos. No se ha demostrado todavía el recorrido
completo del depósito desde navegador con un proveedor simulado y fallos de red.

### Solicitud desde navegador: transporte local comprobado

serve-request.ts sirve el entrypoint submit-request mediante Deno nativo en
127.0.0.1:54325; no es Supabase Edge Runtime. Carga solo las claves del proyecto
local, borra claves de correo y fija EMAIL_DELIVERY_MODE=disabled. El permiso de
red Deno se limita a 127.0.0.1:54321 y 127.0.0.1:54325.

    .tools/deno.exe run --no-check --no-lock --no-config --node-modules-dir=none --allow-env --allow-read=.tools/local-supabase/status.local.json --allow-net=127.0.0.1:54321,127.0.0.1:54325 scripts/local-supabase/serve-request.ts

La configuración de vista compilada usa http://127.0.0.1:8082/local-supabase como
URL del SDK. El proxy de preview reenvía solo submit-request a 54325; REST y Auth
siguen en 54321. Las otras funciones siguen sin estar disponibles. La configuración
habitual y .env no cambian. Esta ruta proxy es exclusiva de preview en 8082.

Prueba manual: formulario de Guadalmina sin salida programada, 25 de octubre,
seis personas y datos inventados example.test. Tras enviar, el navegador mostró
Solicitud recibida. check-browser-request.mjs verificó exactamente una solicitud,
dos notificaciones omitidas, cero payment_requests y cero activity_event_bookings
para ella. Después eliminó esa solicitud y sus notificaciones. No hubo pago ni
comunicación a clientes. ESLint de los scripts JS/config y diff --check pasaron.

Esto cierra el flujo de solicitud de disponibilidad local. No valida la reserva de
plazas ni checkout, el gateway JWT de Edge Runtime, duplicados por reenvío, errores
de red o correos reales. El aviso al usuario sobre posibles duplicados se conserva.

### Validación de solicitud sin pago

scripts/local-supabase/submit-request.test.ts pasó contra REST/PostgreSQL local:
rechaza siete personas y rgpd=false (400), acepta seis (200), crea exactamente una
fila y persiste las notificaciones como omitido. El teardown elimina las filas
de prueba y sus notificaciones. Deno solo tiene red permitida a 127.0.0.1:54321;
no dispone de acceso de red a proveedores. Las claves de correo se eliminan del
proceso y EMAIL_DELIVERY_MODE se fija a disabled.

La prueba captura el registro Deno.serve del entrypoint real y le entrega Request;
no despliega Edge Runtime ni verifica proxy, JWT de gateway o transporte HTTP de la
función. Se ejecutó con --no-check: este resultado es de ejecución, no de tipado.

Se detectaron temporizadores de refresco de sesión innecesarios en el cliente de
servicio. submit-request ahora configura persistSession=false y autoRefreshToken=false;
la prueba pasó con detección de fugas activa, sin ocultarlas. Cambio solo local.

Comando reproducible desde el repo:

    .tools/deno.exe test --no-check --no-lock --no-config --node-modules-dir=none --allow-env --allow-read=.tools/local-supabase/status.local.json --allow-net=127.0.0.1:54321 scripts/local-supabase/submit-request.test.ts

Esto valida una solicitud pendiente de confirmación, no una reserva con plazas ni
un depósito. Quedan el envío desde navegador a una función servida localmente,
la reserva de plazas, los fallos/reintentos y el pago con dobles locales explícitos.

La vista compilada en 8082 ya superó comprobación HTTP y navegación manual hasta
el formulario de reserva, con una salida ficticia obtenida desde la API local.
Se comprobó el cálculo para seis participantes sin enviar datos ni activar pago;
la salida fue retirada. Véase docs/local-ui-preview.md para evidencia y límites.

### Comprobación posterior de Auth real

scripts/local-supabase/check-auth.mjs crea usuarios ficticios en Auth local, confirma
sus emails mediante la API administrativa local (sin enviar correo), inicia sesión
con contraseña y valida la sesión mediante /auth/v1/user. Solo al segundo usuario
se le asigna admin desde la conexión SQL local de pruebas. Con una salida ficticia
existente, el usuario normal no puede leerla desde la tabla privada y admin sí.
La consulta de roles no muestra admin para el usuario normal. Las pruebas pasaron
y el bloque finally eliminó los usuarios, sus roles y la salida de prueba.

La configuración Vite aislada ya carga solo la clave pública del archivo local,
validando host, puerto y prefijo. No se cambiaron las .env habituales. La compilación
aislada pasa y ESLint de los cambios pasa. La comprobación HTTP de Vite sigue
terminando por timeout; no se acredita navegación real ni CSP efectiva en navegador.

### Segundo arranque: aislamiento corregido y comprobado

scripts/local-supabase/start.mjs usa un adaptador de la API Docker sobre una
named pipe temporal de Windows, que reenvía a la pipe local de desktop-linux. No
abre un puerto HTTP/TCP accesible desde el navegador. En creación de contenedores solo admite
crear contenedores cuyo nombre termina en _nsl-isolated-local; cambia HostIp a
127.0.0.1 para cada publicación. El adaptador se cierra al terminar el arranque y
no modifica el daemon global. Se verificaron tres publicaciones restringidas:
API 54321, PostgreSQL 54322 y buzón 54324. Si la comprobación final encuentra una
publicación distinta, detiene los servicios del proyecto. No usar start directamente.

Resultado observado: cinco contenedores en ejecución, Auth y REST devolvieron HTTP
200. El bootstrap local aplicó 11 SQL Supabase y 14 entradas Drizzle con Auth real;
el segundo pase Drizzle conservó el historial. No se sustituyó auth.uid ni auth.users.
El constructor rechaza un esquema public ya poblado y no realiza reset.

Privacidad inicial por REST con clave pública local: activity_events_public devolvió
200 y activity_events devolvió 401 al usuario anónimo. No equivale a probar todas las
políticas ni usuarios autenticados. ESLint de ambos scripts y git diff --check pasan.
Los informes y claves solo están bajo .tools/local-supabase, ignorado por Git.

La web sigue usando una clave ficticia en su configuración aislada. Falta conectar
esa vista con claves públicas locales, probar usuarios ficticios, asignación legítima
de roles y repetir concurrencia/capacidad en este PostgreSQL 17. Las Edge Functions
siguen desactivadas: no se han validado reservas completas, pagos ni correos de NSL.

1. Confirmar servicios sanos y puertos loopback.
2. Aplicar solo al contenedor local las dos preexistencias explícitas y las
   migraciones del repo; no aplicar platform.sql, porque Auth es real y ya existe.
3. Repetir privacidad, historial, descuentos y capacidad con PostgreSQL 17.
4. Probar Auth y API con usuarios ficticios y sus roles normales, sin credenciales
   administrativas en el navegador.
5. Sustituir la clave ficticia de la vista aislada por configuración local validada.
   No confundir una compilación correcta con una prueba integral superada.
6. Preparar funciones locales con proveedores bloqueados antes de probar reservas
   completas, correo y pagos. No activar los proveedores reales.
# Estado verificado el 16 de octubre de 2026

Esta sección sustituye los estados pendientes históricos descritos más arriba.

- Suite de interfaz: 11 archivos y 70 pruebas superadas.
- Edge Runtime real: comprobación HTTP superada de CORS, autenticación, clave
  pública del navegador, solicitud, depósito, reintento y recuperación.
- Webhook: firma incorrecta rechazada; evento válido y repetición comprobados
  sin duplicar plazas ni avisos. Proveedores externos no utilizados.
- Aislamiento: runtime conectado exclusivamente a una red Docker interna,
  sin puertos publicados; intento de salida a Internet bloqueado.
- Los servicios API, base de datos y buzón se publican únicamente en 127.0.0.1.

Repetición local: preparar con scripts/local-supabase/prepare-edge.mjs, arrancar
con start.mjs edge, sellar con seal-edge.mjs y ejecutar check-edge-http.mjs.
El sellado reinicia el gateway si cambia la red para renovar la resolución DNS.
Los datos ficticios de la comprobación HTTP se eliminan al finalizar.
Cerrar después el proceso start.mjs edge y detener únicamente su contenedor
supabase_edge_runtime_nsl-isolated-local para cerrar el adaptador Docker temporal.

Actualización del 17 de octubre: recorrido del pago en navegador con proveedor
simulado superado. La revisión formal detectó un hallazgo bajo en el adaptador
HTTP de Docker; se corrigió sustituyéndolo por named pipe, con revisión focal y
pruebas de arranque y Edge Runtime posteriores. Ver informe vigente para CI.
No se han aplicado migraciones remotas, desplegado, fusionado, activado pagos
reales ni enviado comunicaciones a clientes.
