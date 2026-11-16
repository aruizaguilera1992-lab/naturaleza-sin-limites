import { useEffect, useRef, useState } from 'react';
import { Sparkles, Square, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { allowedDraft, assistantFields, type AssistantField, type OutingDraft } from '@/lib/outingAssistant';

export function OutingAssistant({ context, fields, onApply }: { context: Record<string, unknown>; fields: AssistantField[]; onApply: (draft: OutingDraft) => void }) {
  const [open, setOpen] = useState(false);
  const [instructions, setInstructions] = useState('Completa y mejora la redacción con los datos disponibles. Señala lo que falte.');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<OutingDraft | null>(null);
  const [selected, setSelected] = useState<AssistantField[]>([]);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const generate = async () => {
    setError(''); setDraft(null); setBusy(true);
    const controller = new AbortController(); abort.current = controller;
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('Inicia sesión para usar el asistente.');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/outing-assistant`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ instructions, context }), signal: controller.signal });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error ?? 'No se pudo generar la propuesta.'); }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('La IA no devolvió respuesta.');
      const decoder = new TextDecoder(); let buffer = ''; let final: OutingDraft | null = null;
      while (true) {
        const chunk = await reader.read(); if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const lines = buffer.split('\n'); buffer = lines.pop() ?? '';
        for (const line of lines) { if (!line.trim()) continue; const event = JSON.parse(line); if (event.error) throw new Error(event.error); if (event.done) final = allowedDraft(event.done, fields); }
      }
      if (!final) throw new Error('La IA no devolvió una propuesta válida.');
      setDraft(final); setSelected(fields.filter(f => typeof final?.[f] === 'string' && !!final[f]));
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'No se pudo generar.'); }
    finally { setBusy(false); abort.current = null; }
  };
  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (!value) abort.current?.abort(); }}>
    <DialogTrigger asChild><Button type="button" variant="outline"><Sparkles className="mr-2 h-4 w-4" />Asistente con IA</Button></DialogTrigger>
    <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>Completar ficha · Lovable AI</DialogTitle></DialogHeader>
      <Label htmlFor="ai-instructions">¿Qué quieres completar?</Label>
      <Textarea id="ai-instructions" value={instructions} maxLength={2000} onChange={e => setInstructions(e.target.value)} rows={3} disabled={busy} />
      <p className="text-xs text-muted-foreground">No se guardará ni enviará nada automáticamente. Revisa los textos; precios, fechas, plazas y fotos no se modifican. El uso de Lovable AI consume créditos del espacio de trabajo.</p>
      <div className="flex gap-2"><Button type="button" disabled={busy || !instructions.trim()} onClick={generate}><Sparkles className="mr-2 h-4 w-4" />{busy ? 'Preparando propuesta…' : 'Generar propuesta'}</Button>{busy && <Button type="button" variant="outline" onClick={() => abort.current?.abort()}><Square className="mr-2 h-4 w-4" />Detener</Button>}</div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {draft && <div className="space-y-4">{draft.missing.length > 0 && <div className="border-l-2 border-primary pl-3"><p className="font-semibold text-foreground">Datos pendientes</p><ul className="list-disc pl-5 text-sm text-muted-foreground">{draft.missing.map((m,i) => <li key={i}>{m}</li>)}</ul></div>}
        {fields.filter(f => typeof draft[f] === 'string' && !!draft[f]).map(f => <div key={f} className="space-y-2"><label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={selected.includes(f)} onChange={e => setSelected(s => e.target.checked ? [...s,f] : s.filter(x => x !== f))} />{assistantFields[f]}</label><Textarea aria-label={`Propuesta: ${assistantFields[f]}`} rows={3} value={draft[f] ?? ''} onChange={e => setDraft(d => d ? { ...d, [f]: e.target.value } : d)} /></div>)}
        <Button type="button" disabled={!selected.length} onClick={() => { onApply(allowedDraft(draft, selected)); setOpen(false); }}><Check className="mr-2 h-4 w-4" />Aplicar campos seleccionados</Button>
      </div>}
    </DialogContent>
  </Dialog>;
}