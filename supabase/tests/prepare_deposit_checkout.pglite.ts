import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "fs";
const db = new PGlite();
const q = async (s: string) => (await db.query(s)).rows as any[];
const sh = async (s: string) => db.exec(s);
await sh(`
create role anon; create role authenticated; create role service_role;
create table activity_events(id uuid primary key default gen_random_uuid(), starts_at timestamptz, status text);
create table activity_event_bookings(id uuid primary key default gen_random_uuid(), event_id uuid, booking_id uuid unique, participants int, state text, hold_expires_at timestamptz, updated_at timestamptz);
create table payment_requests(id uuid primary key default gen_random_uuid(), token text unique, kind text, status text, booking_id uuid, checkout_generation int default 0, stripe_session_id text);
`);
await sh(readFileSync("drizzle/migrations/0011_prepare_deposit_checkout.sql", "utf8"));
let fails = 0;
const check = (name: string, cond: boolean, info?: unknown) => { console.log((cond ? "ok  " : "FAIL") + " " + name, cond ? "" : JSON.stringify(info)); if (!cond) fails++; };
async function setup(tok: string, hold: string, state = "bloqueada", ev = "publicada", kind = "senal", starts = "now() + interval '10 days'") {
  const [e] = await q(`insert into activity_events(starts_at,status) values (${starts},'${ev}') returning id`);
  const b = crypto.randomUUID();
  await q(`insert into activity_event_bookings(event_id,booking_id,participants,state,hold_expires_at) values ('${e.id}','${b}',2,'${state}',${hold})`);
  await q(`insert into payment_requests(token,kind,status,booking_id) values ('${tok}','${kind}','pendiente','${b}')`);
  return b;
}
const call = async (tok: string, gen = 0) => (await q(`select public.prepare_deposit_checkout('${tok}', ${gen}, 1860, 300) r`))[0].r;
const hold = async (b: string) => (await q(`select extract(epoch from hold_expires_at)::bigint h from activity_event_bookings where booking_id='${b}'`))[0].h;

const b1 = await setup("t1", "now() + interval '20 minutes'");
const r1 = await call("t1"); const h1 = await hold(b1);
check("vigente: ok y extiende", r1.ok && !r1.reused && Number(h1) === r1.expires_at + 300, { r1, h1 });
check("expires_at redondeado a minuto y >= 31 min", r1.expires_at % 60 === 0 && r1.expires_at - Date.now() / 1000 >= 1859, r1);
const r1b = await call("t1"); const h1b = await hold(b1);
check("reintento: mismo expires_at, sin segunda extensión", r1b.ok && r1b.reused && r1b.expires_at === r1.expires_at && h1b === h1, { r1b, h1b });
await q(`update payment_requests set checkout_generation=1 where token='t1'`);
const r1c = await call("t1", 1);
check("nueva generación tras extensión: rechazada", !r1c.ok && r1c.reason === "hold_already_extended", r1c);
check("generación obsoleta", (await call("t1", 0)).reason === "stale_generation");

await setup("t2", "now() - interval '1 minute'");
check("caducado: no reactiva", (await call("t2")).reason === "hold_expired");
await setup("t3", "now() + interval '20 minutes'", "liberada");
check("liberada", (await call("t3")).reason === "hold_released");
await setup("t4", "now() + interval '20 minutes'", "bloqueada", "cancelada");
check("salida cancelada", (await call("t4")).reason === "event_not_bookable");
await setup("t5", "now() + interval '20 minutes'", "bloqueada", "publicada", "manual");
check("manual rechazado", (await call("t5")).reason === "not_deposit");
await setup("t6", "now() + interval '20 minutes'", "bloqueada", "publicada", "senal", "now() + interval '20 minutes'");
check("salida demasiado próxima", (await call("t6")).reason === "event_too_close");
const b7 = await setup("t7", "now() + interval '2 hours'");
const r7 = await call("t7");
check("bloqueo más largo no se acorta", r7.ok && Number(await hold(b7)) > r7.expires_at + 300, r7);
await q(`update payment_requests set stripe_session_id='cs' where token='t1'`);
check("con sesión ya guardada", (await call("t1", 1)).reason === "session_exists");
check("parámetros fuera de rango", (await q(`select public.prepare_deposit_checkout('t7',0,60,300) r`))[0].r.reason === "invalid_parameters");
const grants = await q(`select grantee from information_schema.routine_privileges where routine_name='prepare_deposit_checkout'`);
const g = grants.map((x) => x.grantee);
check("permisos: solo service_role (y propietario)", g.includes("service_role") && !g.includes("anon") && !g.includes("authenticated") && !g.includes("PUBLIC"), g);
console.log(fails ? `${fails} FALLOS` : "TODAS OK");
process.exit(fails ? 1 : 0);
