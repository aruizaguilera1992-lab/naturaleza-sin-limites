import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2, Loader2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const disciplinas = ['Barranquismo', 'Espeleología', 'Escalada', 'Vías ferratas', 'Montaña'] as const;
const limitaciones = ['Resistencia', 'Agarre y brazos', 'Piernas y desnivel', 'Movilidad', 'Core y estabilidad', 'No lo tengo claro'];
const disponibilidades = ['2 días por semana', '3 días por semana', '4 o más días por semana', 'Aún no lo sé'];
const WHATSAPP = 'https://wa.me/34685609542?text=' + encodeURIComponent('Hola, me interesa Vértigo Sapiens Online.');

function ChoiceGroup({ legend, value, options, onChange }: { legend: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            variant={value === option ? 'default' : 'secondary'}
            size="sm"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className="normal-case tracking-normal"
          >
            {value === option && <Check className="h-4 w-4" />}{option}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}

export function OnlineRequestForm() {
  const [form, setForm] = useState({ nombre: '', email: '', disciplina: '', limitacion: '', objetivo: '', disponibilidad: '' });
  const [rgpd, setRgpd] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.nombre.trim() || !form.email.trim() || !form.disciplina || !form.limitacion || !form.disponibilidad) {
      setError('Completa todos los campos para enviar la solicitud.');
      return;
    }
    if (!rgpd) {
      setError('Debes aceptar la política de privacidad.');
      return;
    }
    setStatus('sending');
    const objetivo = form.objetivo.trim().length >= 3
      ? `Quiero mejorar: ${form.limitacion}. ${form.objetivo.trim()}`
      : `Quiero mejorar: ${form.limitacion}.`;
    const { data, error: fnError } = await supabase.functions.invoke('submit-request', {
      body: { type: 'online_request', nombre: form.nombre, email: form.email, disciplina: form.disciplina, objetivo, disponibilidad: form.disponibilidad, rgpd: true },
    });
    if (fnError || !data?.ok) {
      setStatus('error');
      setError('No hemos podido guardar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.');
      return;
    }
    setStatus('ok');
  };

  if (status === 'ok') {
    return (
      <div role="status" className="rounded-lg border border-primary/40 bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden />
        <h3 className="mt-4 text-2xl font-bold">Solicitud recibida</h3>
        <p className="mt-2 text-muted-foreground">
          Hemos guardado tus datos. Te contactaremos por email para la evaluación inicial. No se ha realizado ningún cobro ni contratación.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6 border border-border border-t-4 border-t-primary bg-background p-6 shadow-card sm:p-8">
      <ChoiceGroup legend="Disciplina principal" value={form.disciplina} options={disciplinas} onChange={set('disciplina')} />
      <ChoiceGroup legend="Qué quieres mejorar" value={form.limitacion} options={limitaciones} onChange={set('limitacion')} />
      <ChoiceGroup legend="Días disponibles por semana" value={form.disponibilidad} options={disponibilidades} onChange={set('disponibilidad')} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vs-nombre">Nombre</Label>
          <Input id="vs-nombre" autoComplete="name" value={form.nombre} onChange={(e) => set('nombre')(e.target.value)} maxLength={120} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vs-email">Email</Label>
          <Input id="vs-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email')(e.target.value)} maxLength={150} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="vs-objetivo">Tu objetivo <span className="font-normal text-muted-foreground">(opcional)</span></Label>
        <Textarea id="vs-objetivo" rows={3} maxLength={600} placeholder="Ej.: llegar con más fuerza a un descenso largo este verano" value={form.objetivo} onChange={(e) => set('objetivo')(e.target.value)} />
      </div>
      <div className="flex items-start gap-3">
        <Checkbox id="vs-rgpd" checked={rgpd} onCheckedChange={(v) => setRgpd(v === true)} className="mt-0.5" />
        <Label htmlFor="vs-rgpd" className="text-sm font-normal leading-relaxed text-muted-foreground">
          Acepto la <Link to="/privacidad" className="text-primary underline underline-offset-2">política de privacidad</Link> para que gestionéis mi solicitud.
        </Label>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error} {status === 'error' && <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="underline">Abrir WhatsApp</a>}
        </p>
      )}
      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={status === 'sending'}>
        {status === 'sending' ? <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" /> : <Send className="h-5 w-5" />}
        Solicitar mi evaluación
      </Button>
      <p className="text-center text-xs text-muted-foreground">Solicitud de información sin pago ni compromiso. No es una prueba física ni un diagnóstico médico, ni una reserva o contratación.</p>
    </form>
  );
}
