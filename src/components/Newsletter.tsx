import { motion } from 'framer-motion';
import { Mail, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SEGMENTS = [['barranquismo', 'Barranquismo'], ['ferratas', 'Vías ferratas'], ['espeleologia', 'Espeleología']] as const;

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [segments, setSegments] = useState<string[]>([]);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setState('sending');
    const { error } = await supabase.functions.invoke('newsletter', { body: { action: 'subscribe', email, consent: true, segments } });
    setState(error ? 'error' : 'done');
    if (!error) setEmail('');
  };
  const toggle = (v: string) => setSegments((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));

  return (
    <section id="newsletter" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-adventure-dark to-adventure-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6">
            <Mountain className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-section font-heading mb-4">
            ¿Listo para tu <span className="text-gradient">Próxima Aventura</span>?
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Suscríbete a nuestra newsletter y recibe un 10% de descuento en tu primera actividad, 
            además de consejos exclusivos y ofertas especiales.
          </p>

          {state === 'done' ? (
            <p role="status" className="mx-auto max-w-md rounded-xl border border-primary/40 bg-primary/10 p-4 text-foreground">
              Revisa tu correo y pulsa «Confirmar suscripción». Al confirmar recibirás tu código del 10 %.
            </p>
          ) : (
          <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 text-left">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Tu email"
                  aria-label="Tu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                  required
                  maxLength={254}
                />
              </div>
              <Button type="submit" variant="hero" size="lg" disabled={!consent || state === 'sending'}>
                {state === 'sending' ? 'Enviando…' : 'Suscríbete'}
              </Button>
            </div>
            <fieldset className="flex flex-wrap gap-2">
              <legend className="mb-2 text-sm text-muted-foreground">¿Qué te interesa? (opcional)</legend>
              {SEGMENTS.map(([v, l]) => (
                <button key={v} type="button" aria-pressed={segments.includes(v)} onClick={() => toggle(v)}
                  className={`rounded-full border px-3 py-1 text-sm transition-all duration-300 active:scale-95 ${segments.includes(v) ? 'border-primary bg-primary/20 text-foreground' : 'border-border text-muted-foreground hover:border-primary/60'}`}>
                  {l}
                </button>
              ))}
            </fieldset>
            <label className="flex items-start gap-2 text-sm text-foreground">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" required />
              <span>Acepto recibir la newsletter de Naturaleza Sin Límites con novedades, salidas y ofertas. Puedo darme de baja en cualquier momento. <Link to="/privacidad" className="text-primary underline">Política de privacidad</Link></span>
            </label>
            {state === 'error' && <p role="alert" className="text-sm text-destructive">No se ha podido enviar. Inténtalo de nuevo en unos minutos.</p>}
          </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
