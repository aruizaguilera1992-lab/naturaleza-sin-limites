import { z } from "npm:zod@3.23.8";

export const leadSchema = z
  .object({
    nombre: z.string().trim().min(2).max(120),
    contacto: z.string().trim().min(1).max(150),
    interes: z.string().trim().max(120).optional().nullable(),
    mensaje: z.string().trim().max(1000).optional().nullable(),
    personas: z.union([z.literal(""), z.null()]).optional(),
  })
  .strict();

export type LeadRow = {
  nombre: string;
  contacto: string;
  interes: string;
  mensaje: string | null;
  personas: null;
};

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  const len = Math.max(ea.length, eb.length);
  for (let i = 0; i < len; i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

export async function verifySignature(secret: string, body: string, header: string | null) {
  if (!header) return false;
  const expected = await hmacHex(secret, body);
  return constantTimeEqual(expected, header.trim().toLowerCase());
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function handleLead(
  req: Request,
  secret: string | undefined,
  insert: (row: LeadRow) => Promise<{ error: unknown }>,
): Promise<Response> {
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  if (!secret) return json({ ok: false, error: "not_configured" }, 500);

  const raw = await req.text();
  if (!(await verifySignature(secret, raw, req.headers.get("x-lead-signature")))) {
    return json({ ok: false, error: "invalid_signature" }, 401);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  const parsed = leadSchema.safeParse(data);
  if (!parsed.success) {
    return json({ ok: false, error: "invalid_data", issues: parsed.error.issues.map((i) => i.path.join(".")) }, 400);
  }
  const v = parsed.data;
  const { error } = await insert({
    nombre: v.nombre,
    contacto: v.contacto,
    interes: v.interes?.trim() || "Preapertura",
    mensaje: v.mensaje?.trim() || null,
    personas: null,
  });
  if (error) return json({ ok: false, error: "save_failed" }, 500);
  return json({ ok: true }, 200);
}
