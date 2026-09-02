import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { Send, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const contactSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  contacto: z.string().trim().min(5, 'Introduce un email o teléfono válido').max(100, 'Máximo 100 caracteres'),
  interes: z.string().min(1, 'Selecciona qué buscas'),
  personas: z.string().optional(),
  mensaje: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional(),
  rgpd: z.boolean().refine((v) => v === true, {
    message: 'Debes aceptar la Política de Privacidad para enviar el formulario',
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const interestOptions = [
  { value: 'aventura', label: 'Experiencia de aventura' },
  { value: 'entrenamiento', label: 'Entrenamiento en montaña' },
  { value: 'orientacion', label: 'No lo tengo claro, quiero orientación' },
];

export function ContactFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      nombre: '',
      contacto: '',
      interes: '',
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
          contacto: data.contacto,
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
      <section id="formulario" className="py-20 md:py-28 bg-muted/30">
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
    <section id="formulario" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O envíame un mensaje directo aquí
            </h2>
            <p className="text-muted-foreground">
              Cuéntame qué tienes en mente y te respondo en breve
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card rounded-2xl p-6 md:p-10 border border-border shadow-lg"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Nombre */}
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Tu nombre" 
                          {...field} 
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email o Teléfono */}
                <FormField
                  control={form.control}
                  name="contacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email o Teléfono *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="correo@ejemplo.com o +34 600 000 000" 
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ¿Qué buscas? */}
                <FormField
                  control={form.control}
                  name="interes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿Qué buscas? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Selecciona una opción" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {interestOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nº de personas */}
                <FormField
                  control={form.control}
                  name="personas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº de personas (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="¿Cuántas personas sois?" 
                          min="1"
                          max="50"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mensaje */}
                <FormField
                  control={form.control}
                  name="mensaje"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Cuéntame en 2–3 frases qué tienes en mente: fechas, nivel de experiencia, actividad que te interesa..."
                          rows={4}
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
                    <FormItem className="rounded-lg border border-border bg-background/50 p-4">
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

                {/* Submit button */}
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="sm:hidden">Enviando...</span>
                      <span className="hidden sm:inline">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span className="sm:hidden">Enviar mensaje</span>
                      <span className="hidden sm:inline">Enviar y te respondo pronto</span>
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Help text */}
            <p className="text-sm text-muted-foreground text-center mt-6">
              Cuanta más información me des, mejor podré adaptarme a tu nivel, necesidades y fechas.
            </p>

            {/* WhatsApp alternative */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-3">
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
