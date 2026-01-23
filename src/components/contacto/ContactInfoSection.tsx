import { motion } from 'framer-motion';
import { Mail, Phone, Instagram, MapPin, Clock } from 'lucide-react';

const contactItems = [
  {
    icon: Mail,
    label: 'Correo electrónico',
    value: 'naturaleza.s.limites@gmail.com',
    href: 'mailto:naturaleza.s.limites@gmail.com',
  },
  {
    icon: Phone,
    label: 'WhatsApp / Teléfono',
    value: '+34 685 60 95 42',
    href: 'https://wa.me/34685609542',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@naturaleza.sinlimites',
    href: 'https://instagram.com/naturaleza.sinlimites',
  },
  {
    icon: MapPin,
    label: 'Zona principal',
    value: 'Málaga y entorno',
    href: null,
  },
];

export function ContactInfoSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Cómo y cuándo te respondo
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Respondo personalmente a todos los mensajes y consultas. Suelo contestar 
              en menos de 24 horas en días laborables. Si tienes dudas sobre qué actividad 
              o nivel elegir, cuéntame tu experiencia previa y te orientaré sin compromiso.
            </p>
          </motion.div>

          {/* Response time badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Respuesta en menos de 24h</span>
            </div>
          </motion.div>

          {/* Contact cards */}
          <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
            {contactItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.value}
                      </p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Map embed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 rounded-xl overflow-hidden border border-border shadow-lg"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d204152.78854284!2d-4.628936!3d36.7212737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7be3a8f8e0f%3A0x2d0efbba2bc2bb9e!2zTcOhbGFnYSwgRXNwYcOxYQ!5e0!3m2!1ses!2ses!4v1690000000000!5m2!1ses!2ses"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación - Málaga y entorno"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
