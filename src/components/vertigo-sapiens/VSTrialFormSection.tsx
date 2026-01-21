import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, User, Mail, Phone, MessageSquare, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const experienceOptions = [
  { id: 'escalada', label: 'Escalada' },
  { id: 'barranquismo', label: 'Barranquismo' },
  { id: 'espeleologia', label: 'Espeleología' },
  { id: 'ferratas', label: 'Vías Ferratas' },
  { id: 'ninguna', label: 'Ninguna (quiero empezar)' },
];

export function VSTrialFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: [] as string[],
    objetivo: '',
    franja: '',
  });

  const handleExperienceChange = (id: string, checked: boolean) => {
    if (id === 'ninguna' && checked) {
      setFormData(prev => ({ ...prev, experience: ['ninguna'] }));
    } else if (checked) {
      setFormData(prev => ({
        ...prev,
        experience: prev.experience.filter(e => e !== 'ninguna').concat(id)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        experience: prev.experience.filter(e => e !== id)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Por favor, completa los campos obligatorios');
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const experienceText = formData.experience.length > 0 
      ? formData.experience.map(e => experienceOptions.find(o => o.id === e)?.label).join(', ')
      : 'No especificada';

    const dateText = selectedDate 
      ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
      : 'No especificada';

    const message = encodeURIComponent(
      `¡Hola! Me gustaría solicitar una clase de prueba gratuita de Vértigo Sapiens.\n\n` +
      `📝 *Datos de contacto:*\n` +
      `• Nombre: ${formData.name}\n` +
      `• Email: ${formData.email}\n` +
      `• Teléfono: ${formData.phone}\n\n` +
      `🏔️ *Experiencia en:* ${experienceText}\n\n` +
      `🎯 *Objetivo:* ${formData.objetivo || 'No especificado'}\n\n` +
      `📅 *Fecha preferida:* ${dateText}\n` +
      `⏰ *Franja horaria:* ${formData.franja || 'No especificada'}`
    );

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('¡Solicitud enviada! Te contactaremos pronto.');

    window.open(`https://wa.me/34685609542?text=${message}`, '_blank');
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
              ¡Genial! Solicitud Recibida
            </h3>
            <p className="text-muted-foreground mb-6">
              Nos pondremos en contacto contigo en menos de 24h para confirmar tu clase de prueba gratuita.
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
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
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
                { title: 'Valoración inicial incluida', desc: 'Evaluamos tu nivel y objetivos' },
                { title: 'Sin compromiso alguno', desc: 'Decide después sin ninguna presión' },
                { title: 'Material incluido', desc: 'Solo ven con ganas de moverte' },
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
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-foreground mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nombre completo *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre"
                    required
                    className="bg-background/50"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-foreground mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    required
                    className="bg-background/50"
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="text-foreground mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Teléfono *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+34 600 000 000"
                    required
                    className="bg-background/50"
                  />
                </div>

                {/* Experience Checkboxes */}
                <div>
                  <Label className="text-foreground mb-3 block">
                    ¿Tienes experiencia en deportes de aventura?
                  </Label>
                  <div className="space-y-2">
                    {experienceOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={option.id}
                          checked={formData.experience.includes(option.id)}
                          onCheckedChange={(checked) => handleExperienceChange(option.id, checked as boolean)}
                        />
                        <label
                          htmlFor={option.id}
                          className="text-sm text-foreground cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Objetivo */}
                <div>
                  <Label htmlFor="objetivo" className="text-foreground mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    ¿Cuál es tu objetivo principal?
                  </Label>
                  <Textarea
                    id="objetivo"
                    value={formData.objetivo}
                    onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                    placeholder="Mejorar en escalada, prepararme para barrancos..."
                    className="bg-background/50 min-h-[80px]"
                  />
                </div>

                {/* Date Picker */}
                <div>
                  <Label className="text-foreground mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Fecha preferida para la clase
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background/50",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Slot */}
                <div>
                  <Label className="text-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Franja horaria preferida
                  </Label>
                  <RadioGroup
                    value={formData.franja}
                    onValueChange={(value) => setFormData({ ...formData, franja: value })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manana" id="manana" />
                      <label htmlFor="manana" className="text-sm text-foreground cursor-pointer">
                        Mañana (10:00-14:00)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tarde" id="tarde" />
                      <label htmlFor="tarde" className="text-sm text-foreground cursor-pointer">
                        Tarde (17:00-21:00)
                      </label>
                    </div>
                  </RadioGroup>
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
                      Reservar Mi Clase Gratis
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Al enviar este formulario aceptas nuestra política de privacidad.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
