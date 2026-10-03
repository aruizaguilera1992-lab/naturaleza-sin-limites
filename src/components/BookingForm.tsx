import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Phone,
  Mail,
  MessageSquare,
  Waves,
  Mountain,
  MountainSnow,
  Flashlight,
  Sparkles,
} from 'lucide-react';
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

export const MAX_STANDARD_GROUP = 6;

const bookingSchema = z.object({
  activity: z.string().min(1, { message: 'Selecciona una actividad' }),
  preferredDate: z.string().optional(),
  numberOfPeople: z.string().min(1, { message: 'Indica el número de personas' })
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= MAX_STANDARD_GROUP;
    }, { message: `Las reservas estándar son de 1 a ${MAX_STANDARD_GROUP} personas. Para grupos mayores, consúltanos.` }),
  experienceLevel: z.string().optional(),
  name: z.string().trim().min(2, { message: 'Indica tu nombre' }).max(120),
  email: z.string().trim().email({ message: 'Introduce un email válido' }).max(150),
  phone: z.string().trim().regex(/^[+]?[\d\s()./-]{9,20}$/, { message: 'Introduce un teléfono válido' }),
  message: z.string().max(500, { message: 'El mensaje no puede superar los 500 caracteres' }).optional(),
  rgpd: z.boolean().refine((v) => v === true, {
    message: 'Debes aceptar la Política de Privacidad para enviar el formulario',
  }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const activities = [
  { value: 'canyoning', label: 'Barranquismo', icon: Waves },
  { value: 'climbing', label: 'Escalada', icon: Mountain },
  { value: 'ferrata', label: 'Vía Ferrata', icon: MountainSnow },
  { value: 'caving', label: 'Espeleología', icon: Flashlight },
];

const experienceLevels = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

const peopleOptions = Array.from({ length: MAX_STANDARD_GROUP }, (_, i) => String(i + 1));

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

export const BookingForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      activity: '',
      preferredDate: '',
      numberOfPeople: '',
      experienceLevel: '',
      name: '',
      email: '',
      phone: '',
      message: '',
      rgpd: false,
    },
  });

  // El calendario de la portada puede pedir rellenar una fecha libre.
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const date = (e as CustomEvent<string>).detail;
      if (date) form.setValue('preferredDate', date, { shouldValidate: true });
    };
    window.addEventListener('nsl:prefill-date', onPrefill);
    return () => window.removeEventListener('nsl:prefill-date', onPrefill);
  }, [form]);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-request', {
        body: {
          type: 'booking',
          activity: activities.find(a => a.value === data.activity)?.label || data.activity,
          preferredDate: data.preferredDate || null,
          numberOfPeople: Number(data.numberOfPeople),
          experienceLevel: experienceLevels.find(l => l.value === data.experienceLevel)?.label || null,
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message || null,
          rgpd: true,
        },
      });

      if (error) throw error;

      toast({
        title: '¡Solicitud enviada!',
        description: 'Nos pondremos en contacto contigo lo antes posible.',
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

  return (
    <section id="contacto" className="py-20 bg-gradient-dark">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-foreground mb-4">
            Reserva tu <span className="text-gradient">Aventura</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige la actividad, dinos quién sois y te contactamos. Sin compromiso.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-10 shadow-card">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                {/* Paso 1: Tu aventura */}
                <div className="space-y-6">
                  <StepTitle step="1">Tu aventura</StepTitle>

                  <FormField
                    control={form.control}
                    name="activity"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel>¿Qué actividad quieres hacer?</FieldLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="radiogroup" aria-label="Actividad">
                          {activities.map((activity) => {
                            const selected = field.value === activity.value;
                            return (
                              <button
                                key={activity.value}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => field.onChange(activity.value)}
                                className={cn(
                                  'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-300 active:scale-95',
                                  selected
                                    ? 'border-primary bg-primary/15 text-primary shadow-elegant'
                                    : 'border-border bg-background/50 text-foreground hover:border-primary/50'
                                )}
                              >
                                <activity.icon className="h-7 w-7" aria-hidden="true" />
                                <span className="text-sm sm:text-base font-semibold leading-tight">{activity.label}</span>
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
                    name="numberOfPeople"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel icon={Users}>¿Cuántos sois?</FieldLabel>
                        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Número de personas">
                          {peopleOptions.map((n) => {
                            const selected = field.value === n;
                            return (
                              <button
                                key={n}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => field.onChange(n)}
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
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ¿Sois más de {MAX_STANDARD_GROUP}?{' '}
                          <Link to="/contacto" className="text-primary hover:underline font-medium">
                            Consúltanos el grupo
                          </Link>{' '}
                          y te preparamos una propuesta a medida.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Paso 2: Cuándo y nivel (opcional) */}
                <div className="space-y-6">
                  <StepTitle step="2">Cuándo y nivel</StepTitle>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="preferredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            <FieldLabel icon={Calendar} optional>Fecha preferente</FieldLabel>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className={inputClasses}
                              min={new Date().toISOString().split('T')[0]}
                              {...field}
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">Si aún no sabes la fecha, la decidimos juntos.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">
                            <FieldLabel icon={Sparkles} optional>Nivel de experiencia</FieldLabel>
                          </FormLabel>
                          <div className="flex flex-wrap gap-3 h-12 items-start" role="radiogroup" aria-label="Nivel de experiencia">
                            {experienceLevels.map((level) => {
                              const selected = field.value === level.value;
                              return (
                                <button
                                  key={level.value}
                                  type="button"
                                  role="radio"
                                  aria-checked={selected}
                                  onClick={() => field.onChange(selected ? '' : level.value)}
                                  className={cn(
                                    'h-12 rounded-xl border px-4 text-sm sm:text-base font-semibold transition-all duration-300 active:scale-95',
                                    selected
                                      ? 'border-primary bg-primary text-primary-foreground shadow-elegant'
                                      : 'border-border bg-background/50 text-foreground hover:border-primary/50'
                                  )}
                                >
                                  {level.label}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-sm text-muted-foreground">Si no lo sabes, lo valoramos contigo.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Paso 3: Tus datos */}
                <div className="space-y-6">
                  <StepTitle step="3">Tus datos</StepTitle>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
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
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          <FieldLabel icon={MessageSquare} optional>Mensaje</FieldLabel>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="¿Algo que debamos saber? Cuéntanoslo aquí..."
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
                            . Responsable: Naturaleza Sin Límites. Finalidad: gestionar tu solicitud de
                            reserva y responderte. Legitimación: tu consentimiento. No cedemos tus
                            datos a terceros salvo obligación legal. Derechos: acceso, rectificación y
                            supresión en{' '}
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
                  {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                </Button>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
