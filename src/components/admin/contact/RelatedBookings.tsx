import { Badge } from "@/components/ui/badge";
import { matchBooking } from "@/lib/crmMatching";

type B = { id: string; activity: string; preferred_date: string | null; status: string; email?: string | null; phone?: string | null; contact: string; name: string | null };

/** Read-only: lists bookings that match the contact. Never links or merges records. */
export function RelatedBookings({ contact, bookings }: { contact: { email?: string | null; phone?: string | null; contacto: string }; bookings: B[] }) {
  const person = {
    email: contact.email ?? (contact.contacto.includes("@") ? contact.contacto : null),
    phone: contact.phone ?? (contact.contacto.includes("@") ? null : contact.contacto),
  };
  const rows = bookings
    .map((b) => ({ b, m: matchBooking(person, { email: b.email ?? (b.contact.includes("@") ? b.contact : null), phone: b.phone }) }))
    .filter((r) => r.m.level);
  const sure = rows.filter((r) => r.m.level === "relacionada");
  const maybe = rows.filter((r) => r.m.level === "posible");
  const list = (items: typeof rows) => (
    <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
      {items.map(({ b, m }) => (
        <li key={b.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
          <span className="min-w-0 flex-1 truncate text-foreground">{b.activity}{b.preferred_date ? ` · ${b.preferred_date}` : ""}</span>
          <span className="text-xs text-muted-foreground">{m.reason}</span>
          <Badge variant="outline">Reserva: {b.status}</Badge>
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-labelledby="rel-bookings" className="rounded-lg border border-border bg-background/40 p-4">
      <h3 id="rel-bookings" className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">Reservas relacionadas</h3>
      {rows.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No hay reservas con su email o teléfono.</p>}
      {sure.length > 0 && list(sure)}
      {maybe.length > 0 && (
        <>
          <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Posibles coincidencias (revisar, no se vinculan)</p>
          {list(maybe)}
        </>
      )}
    </section>
  );
}
