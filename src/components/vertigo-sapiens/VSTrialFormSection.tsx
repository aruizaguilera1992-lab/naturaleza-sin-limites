import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function VSTrialFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real app, you'd send this to your backend or WhatsApp
    const message = encodeURIComponent(
      `¡Hola! Me gustaría solicitar una clase de prueba gratuita de Vértigo Sapiens.\n\nNombre: ${formData.name}\nEmail: ${formData.email}\nTeléfono: ${formData.phone}\nExperiencia: ${formData.experience}\nMensaje: ${formData.message}`
    );

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('¡Solicitud enviada! Te contactaremos pronto.');

    // Open WhatsApp with the message
    window.open(`https://wa.me/34685609542?text=${message}`, '_blank');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isSubmitted) {
    return (
      <section id="prueba-gratis" className="py-24 relative overflow-hidden bg-adventure-dark">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center bg-card/50 backdrop-blur-sm border border-primary/50 rounded-2xl p-12"
          >
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              ¡Solicitud Recibida!
            </h3>
            <p className="text-muted-foreground mb-6">
              Te contactaremos en las próximas 24 horas para confirmar tu clase de prueba gratuita.
            </p>
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>
              Enviar otra solicitud
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="prueba-gratis" className="py-24 relative overflow-hidden bg-adventure-dark">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-section font-heading mb-6">
              Clase de <span className="text-gradient">Prueba Gratis</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Ven a conocernos sin compromiso. Entrena con el grupo, conoce nuestra metodología
              y descubre si Vértigo Sapiens es para ti.
            </p>

            <div className="space-y-6">
              {[
                { title: 'Sesión completa de 90 minutos', desc: 'Entrena con un grupo real' },
                { title: 'Valoración inicial', desc: 'Evaluamos tu nivel y objetivos' },
                { title: 'Sin compromiso', desc: 'Decide después sin presión' },
                { title: 'Material incluido', desc: 'Solo ven con ganas' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
              <h3 className="font-heading text-xl font-semibold text-foreground mb-6">
                Reserva tu clase gratuita
              </h3>

              <div className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-foreground mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nombre completo *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                    required
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    required
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-foreground mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Teléfono *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+34 600 000 000"
                    required
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-foreground mb-2">
                    ¿Tienes experiencia en deportes de aventura?
                  </Label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-md border border-border bg-background/50 text-foreground"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="ninguna">Ninguna, soy principiante</option>
                    <option value="poca">Poca experiencia (1-5 salidas)</option>
                    <option value="intermedia">Experiencia intermedia</option>
                    <option value="avanzada">Experiencia avanzada</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-foreground mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    ¿Algo que quieras contarnos?
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tus objetivos, disponibilidad..."
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Solicitar Clase Gratuita
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Al enviar este formulario aceptas nuestra política de privacidad.
                  Te contactaremos por WhatsApp o email.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
