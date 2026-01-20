import { useState } from 'react';
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

const bookingSchema = z.object({
  activity: z.string().min(1, { message: 'Selecciona una actividad' }),
  preferredDate: z.string().min(1, { message: 'Indica una fecha preferente' }),
  numberOfPeople: z.string().min(1, { message: 'Indica el número de personas' }),
  experienceLevel: z.string().min(1, { message: 'Selecciona tu nivel de experiencia' }),
  contactMethod: z.string().min(1, { message: 'Indica tu teléfono o email' })
    .refine((val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[+]?[\d\s()-]{9,}$/;
      return emailRegex.test(val) || phoneRegex.test(val);
    }, { message: 'Introduce un email o teléfono válido' }),
  message: z.string().max(500, { message: 'El mensaje no puede superar los 500 caracteres' }).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const activities = [
  { value: 'canyoning', label: 'Barranquismo' },
  { value: 'climbing', label: 'Escalada' },
  { value: 'ferrata', label: 'Vía Ferrata' },
  { value: 'speleology', label: 'Espeleología' },
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
      contactMethod: '',
      message: '',
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: '¡Solicitud enviada!',
      description: 'Nos pondremos en contacto contigo lo antes posible.',
    });
    
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <section id="reserva" className="py-20 bg-gradient-dark">
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
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            placeholder="Ej: 4"
                            className="bg-background/50 border-border"
                            {...field}
                          />
                        </FormControl>
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

                {/* Contact Method */}
                <FormField
                  control={form.control}
                  name="contactMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        <Mail className="h-4 w-4 text-primary" />
                        Teléfono o Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tu teléfono o correo electrónico"
                          className="bg-background/50 border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
