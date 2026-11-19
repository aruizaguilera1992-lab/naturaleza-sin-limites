import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { matchBooking } from "@/lib/crmMatching";
import { bookingNextStep } from "@/lib/crmNextStep";

type B = { id: string; activity: string; preferred_date: string | null; status: string; email?: string | null; phone?: string | null; contact: string; name: string | null; contact_id?: string | null; paid_amount_cents?: number | null };

/** Reservas vinculadas (firmes, clicables) y posibles coincidencias que solo se unen si el admin pulsa «Vincular». */
export function RelatedBookings({ contact, bookings, onOpen, onLink }: {
  contact: { id: string; email?: string | null; phone?: string | null; contacto: string };
  bookings: B[]; onOpen?: (id: string) => void; onLink?: (id: string) => void;
}) {
  const person = {
    email: contact.email ?? (contact.contacto.includes("@") ? contact.contacto : null),
    phone: contact.phone ?? (contact.contacto.includes("@") ? null : contact.contacto),
  };
  const linked = bookings.filter((b) => b.contact_id === contact.id);
  const maybe = bookings
    .filter((b) => !b.contact_id)
    .map((b) => ({ b, m: matchBooking(person, { email: b.email ?? (b.contact.includes("@") ? b.contact : null), phone: b.phone }) }))
    .filter((r) => r.m.level);
  return (
    <section aria-labelledby="rel-bookings" className="rounded-lg border border-border bg-background/40 p-4">
      <h3 id="rel-bookings" className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">Reservas de este cliente</h3>
      {linked.length === 0 && maybe.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Todavía no tiene reservas.</p>}
      {linked.length > 0 && (
        <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
          {linked.map((b) => { const next = bookingNextStep(b); return (
            <li key={b.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate text-foreground">{b.activity}{b.preferred_date ? ` · ${b.preferred_date}` : ""}</span>
              {next && <Badge variant="secondary">Siguiente: {next}</Badge>}
              <Badge variant="outline">{b.status}</Badge>
              {onOpen && <Button size="sm" variant="outline" onClick={() => onOpen(b.id)}>Abrir</Button>}
            </li>
          ); })}
        </ul>
      )}
      {maybe.length > 0 && (
        <>
          <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">Posibles reservas de este cliente (revisa antes de vincular)</p>
          <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
            {maybe.map(({ b, m }) => (
              <li key={b.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-foreground">{b.activity}{b.preferred_date ? ` · ${b.preferred_date}` : ""}</span>
                <span className="text-xs text-muted-foreground">{m.reason}</span>
                {onLink && <Button size="sm" variant="outline" onClick={() => onLink(b.id)}>Vincular</Button>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
