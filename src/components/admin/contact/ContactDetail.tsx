import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageCircle, MoreHorizontal, Phone, Sparkles } from "lucide-react";
import { contactChannels, mailtoLink, telLink, whatsappLink } from "@/lib/crmContact";
import { followUpBucket } from "@/lib/crmFollowUp";
import { ProposalPanel, defaultProposalMessage, type CrmContact } from "@/components/admin/ContactCrmPanel";

type Props = {
  contact: CrmContact & { created_at: string; next_action_at?: string | null };
  stageLabel: string;
  receivedLabel: string;
  statusBadge: ReactNode;
  ficha: ReactNode;
  seguimiento: ReactNode;
  reservas: ReactNode;
  notas: ReactNode;
  adminActions: ReactNode;
  onSaved: () => void;
  /** Contenedor del título (p. ej. SheetTitle) para accesibilidad. */
  renderTitle: (name: string) => ReactNode;
};

const TABS = [["ficha", "Ficha"], ["seguimiento", "Seguimiento"], ["reservas", "Reservas y pagos"], ["notas", "Notas"]] as const;

/**
 * Ficha de contacto: cabecera persistente + 4 pestañas con responsabilidad exclusiva.
 * Se monta con key por contacto; el estado editable nunca se resincroniza desde props.
 */
export function ContactDetail(p: Props) {
  const c = p.contact;
  const [proposalOpen, setProposalOpen] = useState(false);
  // Vive aquí (no en el diálogo) para conservar el mensaje al cerrar/abrir.
  const [message, setMessage] = useState(() => defaultProposalMessage(c));
  const ch = contactChannels(c);
  const greet = `Hola ${c.nombre.split(" ")[0]}, soy Antonio de Naturaleza Sin Límites.`;
  const wa = whatsappLink(ch.phone, greet), tel = telLink(ch.phone), mail = mailtoLink(ch.email, "Naturaleza Sin Límites", greet);
  const fu = followUpBucket(c.next_action_at ?? null);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="sticky -top-6 z-10 -mx-6 -mt-6 border-b border-border bg-card/95 px-6 pb-3 pt-6 pr-14 backdrop-blur">
        {p.renderTitle(c.nombre)}
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {c.interes} · {p.receivedLabel}
          {ch.email && <> · {ch.email}</>}
          {ch.phone && <> · {ch.phone}</>}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <Badge className="gap-1">Etapa: {p.stageLabel}</Badge>
          {c.priority && <Badge variant={c.priority === "alta" ? "destructive" : "outline"}>Prioridad {c.priority}</Badge>}
          {fu === "vencido" && <Badge variant="destructive">Seguimiento vencido</Badge>}
          {fu === "hoy" && <Badge variant="secondary">Seguimiento hoy</Badge>}
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />
          <span className="flex items-center gap-1 text-muted-foreground">Reserva/pago: {p.statusBadge}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {wa && <Button asChild size="sm" variant="outline"><a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /><span className="hidden sm:inline">WhatsApp</span></a></Button>}
          {tel && <Button asChild size="sm" variant="outline"><a href={tel} aria-label="Llamar"><Phone className="h-4 w-4" /><span className="hidden sm:inline">Llamar</span></a></Button>}
          {mail && <Button asChild size="sm" variant="outline"><a href={mail} target="_blank" rel="noopener noreferrer" aria-label="Email"><Mail className="h-4 w-4" /><span className="hidden sm:inline">Email</span></a></Button>}
          {!wa && !tel && !mail && <span className="text-xs text-muted-foreground">Sin teléfono ni email válidos</span>}
          <Button size="sm" onClick={() => setProposalOpen(true)}><Sparkles className="h-4 w-4" />Preparar propuesta</Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="ml-auto" aria-label="Opciones administrativas"><MoreHorizontal className="h-4 w-4" /></Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <p className="text-sm font-medium text-foreground">Opciones administrativas</p>
              <p className="mt-1 text-xs text-muted-foreground">Acción irreversible. Se pedirá confirmación.</p>
              {p.adminActions}
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <Tabs defaultValue="ficha" className="mt-4">
        <TabsList className="flex h-auto w-full justify-start overflow-x-auto whitespace-nowrap">
          {TABS.map(([v, l]) => <TabsTrigger key={v} value={v} className="shrink-0">{l}</TabsTrigger>)}
        </TabsList>
        {/* forceMount: las pestañas ocultas no se desmontan, así no se pierden cambios sin guardar. */}
        <TabsContent value="ficha" forceMount className="space-y-5 data-[state=inactive]:hidden">{p.ficha}</TabsContent>
        <TabsContent value="seguimiento" forceMount className="space-y-5 data-[state=inactive]:hidden">{p.seguimiento}</TabsContent>
        <TabsContent value="reservas" forceMount className="space-y-6 data-[state=inactive]:hidden">{p.reservas}</TabsContent>
        <TabsContent value="notas" forceMount className="data-[state=inactive]:hidden">{p.notas}</TabsContent>
      </Tabs>

      <Dialog open={proposalOpen} onOpenChange={setProposalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preparar propuesta</DialogTitle>
            <DialogDescription>Sugerencias del catálogo y mensaje para {c.nombre}.</DialogDescription>
          </DialogHeader>
          <ProposalPanel contact={c} message={message} setMessage={setMessage} onSaved={p.onSaved} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
