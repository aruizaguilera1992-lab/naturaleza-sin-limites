import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Calendar, Users, Phone, Mail, MessageSquare, Mountain } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const MAX_STANDARD_GROUP = 6;

const bookingSchema = z.object({
  activity: z.string().min(1, { message: 'Selecciona una actividad' }),
  preferredDate: z.string().min(1, { message: 'Indica una fecha preferente' }),
  numberOfPeople: z.string().min(1, { message: 'Indica el número de personas' })
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= MAX_STANDARD_GROUP;
    }, { message: `Las reservas estándar son de 1 a ${MAX_STANDARD_GROUP} personas. Para grupos mayores, consúltanos.` }),
  experienceLevel: z.string().min(1, { message: 'Selecciona tu nivel de experiencia' }),
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
  { value: 'canyoning', label: 'Barranquismo' },
  { value: 'climbing', label: 'Escalada' },
  { value: 'ferrata', label: 'Vía Ferrata' },
  { value: 'caving', label: 'Espeleología' },
];

const experienceLevels = [
  { value: 'beginner', label: 'Principiante - Sin experiencia previa' },
  { value: 'intermediate', label: 'Intermedio - Algo de experiencia' },
  { value: 'advanced', label: 'Avanzado - Experiencia consolidada' },
];

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

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('submit-request', {
        body: {
          type: 'booking',
          activity: activities.find(a => a.value === data.activity)?.label || data.activity,
          preferredDate: data.preferredDate,
          numberOfPeople: Number(data.numberOfPeople),
          experienceLevel: experienceLevels.find(l => l.value === data.experienceLevel)?.label || data.experienceLevel,
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
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Reserva tu <span className="text-gradient">Aventura</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Completa el formulario y nos pondremos en contacto contigo para organizar tu experiencia perfecta.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 shadow-card">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Activity Select */}
                  <FormField
                    control={form.control}
                    name="activity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-foreground">
                          <Mountain className="h-4 w-4 text-primary" />
                          Actividad
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-border">
                              <SelectValue placeholder="Selecciona actividad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {activities.map((activity) => (
                              <SelectItem key={activity.value} value={activity.value}>
                                {activity.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preferred Date */}
                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          Fecha preferente
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-background/50 border-border"
                            min={new Date().toISOString().split('T')[0]}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Number of People */}
                  <FormField
                    control={form.control}
                    name="numberOfPeople"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-foreground">
                          <Users className="h-4 w-4 text-primary" />
                          Nº de personas
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-border">
                              <SelectValue placeholder="Selecciona (1-6)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: MAX_STANDARD_GROUP }, (_, i) => String(i + 1)).map((n) => (
                              <SelectItem key={n} value={n}>
                                {n} {n === '1' ? 'persona' : 'personas'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          ¿Sois más de {MAX_STANDARD_GROUP}?{' '}
                          <Link to="/contacto" className="text-primary hover:underline">
                            Consúltanos el grupo
                          </Link>{' '}
                          y te preparamos una propuesta a medida.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Experience Level */}
                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-foreground">
                          <Mountain className="h-4 w-4 text-primary" />
                          Nivel de experiencia
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-border">
                              <SelectValue placeholder="Selecciona nivel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {experienceLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Nombre, email y teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-foreground">
                          <Users className="h-4 w-4 text-primary" />
                          Nombre
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tu nombre"
                            autoComplete="name"
                            className="bg-background/50 border-border"
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
                        <FormLabel className="flex items-center gap-2 text-foreground">
                          <Mail className="h-4 w-4 text-primary" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="correo@ejemplo.com"
                            className="bg-background/50 border-border"
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
                        <FormLabel className="flex items-center gap-2 text-foreground">
                          <Phone className="h-4 w-4 text-primary" />
                          Teléfono
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="+34 600 000 000"
                            className="bg-background/50 border-border"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Message */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Mensaje (opcional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Cuéntanos más sobre lo que buscas..."
                          className="bg-background/50 border-border min-h-[100px] resize-none"
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
                    <FormItem className="rounded-lg border border-border bg-background/40 p-4">
                      <div className="flex items-start gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-normal leading-relaxed text-muted-foreground">
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

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar Información'}
                </Button>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
