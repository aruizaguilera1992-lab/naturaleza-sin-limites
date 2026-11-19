import { supabase } from "@/integrations/supabase/client";
import { addDays } from "@/lib/commercialAgenda";

/** Propuesta privada enviada que el cliente aún no ha confirmado ni reservado. */
export type PendingProposal = { id: string; title: string; customerName: string; contact_id: string | null; sent_at: string | null; view_count: number; expires_at: string | null };

type Row = { id: string; status: string; accepted_at: string | null; booking_id: string | null; contact_id: string | null; sent_at: string | null; view_count?: number | null; expires_at: string | null; content: { title?: string; customerName?: string } | null };

export function pendingProposals(rows: Row[], now = new Date()): PendingProposal[] {
  return rows
    .filter((r) => r.status === "enviada" && !r.accepted_at && !r.booking_id && !(r.expires_at && new Date(r.expires_at) < now))
    .map((r) => ({ id: r.id, title: r.content?.title?.trim() || "Propuesta de actividad", customerName: r.content?.customerName?.trim() || "", contact_id: r.contact_id, sent_at: r.sent_at, view_count: r.view_count ?? 0, expires_at: r.expires_at }))
    .sort((a, b) => (b.sent_at ?? "").localeCompare(a.sent_at ?? ""));
}

/** Datos del contacto que se crea para una propuesta sin perfil (seguimiento en 3 días). */
export function proposalContactDraft(p: { title: string; customerName: string; email?: string | null; phone?: string | null }, now = new Date()) {
  const email = p.email?.trim() || null, phone = p.phone?.trim() || null;
  const today = now.toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  return {
    nombre: (p.customerName.trim() || "Cliente de propuesta").slice(0, 120),
    contacto: email ?? phone ?? "Sin datos de contacto",
    email, phone,
    interes: p.title.trim().slice(0, 120) || "Propuesta de actividad",
    source: "manual" as const,
    pipeline_stage: "propuesta",
    next_action: `Confirmar propuesta: ${p.title.trim()}`.slice(0, 200),
    next_action_at: `${addDays(today, 3)}T10:00:00+01:00`,
  };
}

/** Crea el perfil de contacto y lo vincula a la ficha. Devuelve el id o un error. */
export async function createContactForSheet(sheetId: string, p: { title: string; customerName: string; email?: string | null; phone?: string | null }): Promise<{ id?: string; error?: string }> {
  const { data: u } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("contact_submissions").insert({ ...proposalContactDraft(p), created_by: u.user?.id ?? null }).select("id").single();
  if (error || !data) return { error: error?.message ?? "No se pudo crear el contacto" };
  const link = await supabase.from("activity_sheets").update({ contact_id: data.id }).eq("id", sheetId);
  if (link.error) return { id: data.id, error: link.error.message };
  await supabase.from("contact_events").insert({ contact_id: data.id, kind: "seguimiento", body: `Contacto creado desde la propuesta enviada: ${p.title}`, origin: "manual", author_id: u.user?.id ?? null });
  return { id: data.id };
}
