import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { Send, MessageCircle, CheckCircle, Loader2, Users, Waves, Flashlight, Dumbbell, Compass, MessageSquare, Mail, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const contactSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  email: z.string().trim().email('Introduce un email válido').max(150, 'Máximo 150 caracteres'),
  phone: z.string().trim().regex(/^[+]?[\d\s()./-]{9,20}$/, 'Introduce un teléfono válido'),
  interes: z.string().min(1, 'Selecciona qué buscas'),
  personas: z.string().optional(),
  mensaje: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional(),
  rgpd: z.boolean().refine((v) => v === true, {
    message: 'Debes aceptar la Política de Privacidad para enviar el formulario',
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const interestOptions = [
  { value: 'aventura', label: 'Experiencia de aventura', icon: Waves },
  { value: 'espeleologia', label: 'Espeleología', icon: Flashlight },
  { value: 'entrenamiento', label: 'Entrenamiento en montaña', icon: Dumbbell },
  { value: 'orientacion', label: 'No lo tengo claro, quiero orientación', icon: Compass },
];

const peopleOptions = Array.from({ length: 6 }, (_, i) => String(i + 1));

const inputClasses = 'bg-background/50 border-border text-base h-12 placeholder:text-muted-foreground/70';

const FieldLabel = ({ icon: Icon, children, optional }: { icon?: React.ElementType; children: React.ReactNode; optional?: boolean }) => (
  <span className="flex items-center gap-2 text-base font-semibold text-foreground">
    {Icon && <Icon className="h-5 w-5 text-primary" aria-hidden="true" />}
    {children}
    {optional && (
      <span className="text-xs font-normal uppercase tracking-wide text-muted-foreground">(opcional)</span>
    )}
  </span>
);

const StepTitle = ({ step, children }: { step: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {step}
    </span>
    <h3 className="text-lg sm:text-xl font-heading font-bold text-foreground">{children}</h3>
    <span className="h-px flex-1 bg-border" />
  </div>
);

export function ContactFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const presetInterest = searchParams.get('interes') || '';
  const initialInterest = interestOptions.some((o) => o.value === presetInterest) ? presetInterest : '';

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      nombre: '',
      email: '',
      phone: '',
      interes: initialInterest,
      personas: '',
      mensaje: '',
      rgpd: false,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-request', {
        body: {
          type: 'contact',
          nombre: data.nombre,
          email: data.email,
          phone: data.phone,
          interes: interestOptions.find(o => o.value === data.interes)?.label || data.interes,
          personas: data.personas || null,
          mensaje: data.mensaje || null,
          rgpd: true,
        },
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: '¡Mensaje enviado!',
        description: 'Te responderé en menos de 24 horas.',
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'Error al enviar',
        description: 'Por favor, inténtalo de nuevo o contacta por WhatsApp.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const phone = '+34685609542';
  const whatsappUrl = `https://wa.me/${phone.replace(/\s/g, '')}?text=${encodeURIComponent('Hola, quiero más información sobre vuestras actividades.')}`;

  if (isSubmitted) {
    return (
      <section id="formulario" className="py-20 md:py-28 bg-background">

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center bg-card rounded-2xl p-10 border border-border shadow-lg"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">¡Gracias por tu mensaje!</h3>
            <p className="text-muted-foreground mb-6">
              Te responderé personalmente en menos de 24 horas.
              Si necesitas una respuesta más rápida, puedes escribirme por WhatsApp.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="gap-2"
            >
              Enviar otro mensaje
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="formulario" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-primary font-heading font-bold uppercase tracking-[0.2em] text-base sm:text-lg mb-3">
              Escríbenos
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-foreground mb-4">
              ¿Cómo te escribo?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Elige qué buscas, dinos quién eres y te respondo en breve. Sin compromiso.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card p-6 md:p-10 border-t-8 border-primary shadow-2xl rounded-2xl"
          >

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                {/* Paso 1: Tu consulta */}
                <div className="space-y-6">
                  <StepTitle step="1">Tu consulta</StepTitle>

                  <FormField
                    control={form.control}
                    name="interes"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel>¿Qué buscas?</FieldLabel>
                        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Qué buscas">
                          {interestOptions.map((option) => {
                            const selected = field.value === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-300 active:scale-95',
                                  selected
                                    ? 'border-primary bg-primary/15 text-primary shadow-elegant'
                                    : 'border-border bg-background/50 text-foreground hover:border-primary/50'
                                )}
                              >
                                <option.icon className="h-7 w-7" aria-hidden="true" />
                                <span className="text-sm sm:text-base font-semibold leading-tight">{option.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="personas"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel icon={Users} optional>¿Cuántos sois?</FieldLabel>
                        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Número de personas">
                          {peopleOptions.map((n) => {
                            const selected = field.value === n;
                            return (
                              <button
                                key={n}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => field.onChange(selected ? '' : n)}
                                className={cn(
                                  'h-12 w-12 rounded-xl border text-base font-bold transition-all duration-300 active:scale-95',
                                  selected
                                    ? 'border-primary bg-primary text-primary-foreground shadow-elegant'
                                    : 'border-border bg-background/50 text-foreground hover:border-primary/50'
                                )}
                              >
                                {n}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            role="radio"
                            aria-checked={field.value === 'Más de 6'}
                            onClick={() => field.onChange(field.value === 'Más de 6' ? '' : 'Más de 6')}
                            className={cn(
                              'h-12 rounded-xl border px-5 text-sm font-semibold transition-all duration-300 active:scale-95',
                              field.value === 'Más de 6'
                                ? 'border-primary bg-primary text-primary-foreground shadow-elegant'
                                : 'border-border bg-background/50 text-foreground hover:border-primary/50'
                            )}
                          >
                            Grupo (+6)
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Paso 2: Tus datos */}
                <div className="space-y-6">
                  <StepTitle step="2">Tus datos</StepTitle>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            <FieldLabel icon={Users}>Nombre</FieldLabel>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tu nombre"
                              autoComplete="name"
                              className={inputClasses}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            <FieldLabel icon={Mail}>Email</FieldLabel>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              inputMode="email"
                              autoComplete="email"
                              placeholder="correo@ejemplo.com"
                              className={inputClasses}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            <FieldLabel icon={Phone}>Teléfono</FieldLabel>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="+34 600 000 000"
                              className={inputClasses}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="mensaje"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          <FieldLabel icon={MessageSquare} optional>Mensaje</FieldLabel>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Fechas, nivel, lo que te interesa..."
                            className="bg-background/50 border-border text-base min-h-[80px] resize-none placeholder:text-muted-foreground/70"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Consentimiento RGPD */}
                  <FormField
                    control={form.control}
                    name="rgpd"
                    render={({ field }) => (
                      <FormItem className="rounded-xl border border-border bg-background/40 p-4">
                        <div className="flex items-start gap-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-0.5"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal leading-relaxed text-muted-foreground">
                            He leído y acepto la{' '}
                            <Link to="/privacidad" className="text-primary hover:underline">
                              Política de Privacidad
                            </Link>
                            . Responsable: Naturaleza Sin Límites. Finalidad: responder a tu consulta y
                            gestionar tu reserva. Legitimación: tu consentimiento. No cedemos tus datos
                            a terceros salvo obligación legal. Puedes ejercer tus derechos de acceso,
                            rectificación y supresión escribiendo a{' '}
                            <a
                              href="mailto:naturaleza.s.limites@gmail.com"
                              className="text-primary hover:underline"
                            >
                              naturaleza.s.limites@gmail.com
                            </a>
                            .
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full text-lg font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar solicitud
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* WhatsApp alternative */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-base text-muted-foreground mb-3">
                Si prefieres, puedes escribirme directamente por WhatsApp
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Abrir WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
