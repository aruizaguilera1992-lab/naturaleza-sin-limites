import { useMemo, useState } from "react";
import { activityProfiles, type PublicActivityCategory } from "@/data/activityProfiles";
import { buildProposal, detectCategories, priceLabel, activityUrl, suggestActivities } from "@/lib/crmSuggestions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, MessageCircle, Sparkles } from "lucide-react";

const CATS: [PublicActivityCategory, string][] = [
  ["barranquismo", "Barranquismo"],
  ["escalada", "Escalada"],
  ["vias-ferratas", "Vías ferratas"],
  ["espeleologia", "Espeleología"],
];

export function ContactSuggestions({
  firstName,
  interests,
  interes,
  experience,
  onUseMessage,
}: {
  firstName: string;
  interests?: string[] | null;
  interes?: string | null;
  experience?: string | null;
  onUseMessage: (text: string) => void;
}) {
  const { toast } = useToast();
  const detected = useMemo(() => detectCategories(interests, interes), [interests, interes]);
  const [cats, setCats] = useState<PublicActivityCategory[]>(detected);
  const items = useMemo(() => suggestActivities(activityProfiles, { categories: cats, experience }), [cats, experience]);
  const [proposal, setProposal] = useState("");

  const toggle = (c: PublicActivityCategory) => setCats((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  return (
    <section className="space-y-3 rounded-lg border border-border p-4" aria-labelledby="sugg-title">
      <h3 id="sugg-title" className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Sugerencias del catálogo</h3>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Disciplinas">
        {CATS.map(([c, l]) => (
          <Button key={c} type="button" size="sm" variant={cats.includes(c) ? "default" : "outline"} aria-pressed={cats.includes(c)} onClick={() => toggle(c)}>{l}</Button>
        ))}
      </div>
      {!experience && <p className="text-xs text-muted-foreground">Sin nivel de experiencia guardado: se sugieren actividades de nivel medio o inferior.</p>}
      {cats.length === 0 ? (
        <p className="text-sm text-muted-foreground">Elige una disciplina para ver sugerencias.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay actividades del catálogo para esa disciplina y nivel.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((p) => (
            <li key={p.id} className="rounded-md border border-border bg-muted/30 p-3 text-sm">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.categoryLabel} · {p.zone} · {p.technicalLevel}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-primary">{priceLabel(p)}</span>
                <a href={activityUrl(p)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs underline">Ver ficha <ExternalLink className="h-3 w-3" /></a>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Button type="button" size="sm" variant="secondary" disabled={!items.length} onClick={() => setProposal(buildProposal(firstName, items))}>Crear propuesta</Button>
      {proposal && (
        <div className="space-y-2">
          <Textarea aria-label="Propuesta editable" rows={9} value={proposal} onChange={(e) => setProposal(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => { onUseMessage(proposal); toast({ title: "Propuesta copiada al mensaje de acciones rápidas" }); }}>
              <MessageCircle className="mr-1 h-4 w-4" /> Usar como mensaje
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={async () => { await navigator.clipboard.writeText(proposal); toast({ title: "Propuesta copiada" }); }}>
              <Copy className="mr-1 h-4 w-4" /> Copiar
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
