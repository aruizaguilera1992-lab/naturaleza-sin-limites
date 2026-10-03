import { useCookieConsent } from "@/context/CookieConsentContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Phone, Instagram, MapPin, Clock } from "lucide-react";

const contactItems = [
  {
    icon: Mail,
    label: "Correo electrónico",
    value: "naturaleza.s.limites@gmail.com",
    href: "mailto:naturaleza.s.limites@gmail.com",
  },
  {
    icon: Phone,
    label: "WhatsApp / Teléfono",
    value: "+34 685 60 95 42",
    href: "https://wa.me/34685609542",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@naturaleza.sinlimites",
    href: "https://instagram.com/naturaleza.sinlimites",
  },
  {
    icon: MapPin,
    label: "Zona principal",
    value: "Málaga y entorno",
    href: null,
  },
];

export function ContactInfoSection() {
  const { consent, openPreferences } = useCookieConsent();
  return (
    <section className="py-20 md:py-28 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left column: heading + contact cards */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <p className="text-primary font-heading font-bold uppercase tracking-[0.2em] text-base sm:text-lg mb-3">
                Contacto directo
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-foreground mb-6 leading-tight">
                ¿En cuánto me contestas?
              </h2>
              <p className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-4">
                En 24–48 h laborables, personalmente.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Contesto yo mismo a todos los mensajes. Si no sabes qué actividad elegir, cuéntame tu
                experiencia y te oriento sin compromiso.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
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
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="block bg-card p-6 border-l-4 border-primary hover:bg-card/80 transition-all duration-300 group h-full"
                    >
                      <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors break-words">
                        {item.value}
                      </p>
                    </a>
                  ) : (
                    <div className="block bg-card p-6 border-l-4 border-primary h-full">
                      <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right column: cookie-gated map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative bg-card min-h-[400px] flex items-center justify-center text-center overflow-hidden border border-dashed border-primary/30"
          >
            {consent.marketing ? (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d204152.78854284!2d-4.628936!3d36.7212737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f7be3a8f8e0f%3A0x2d0efbba2bc2bb9e!2zTcOhbGFnYSwgRXNwYcOxYQ!5e0!3m2!1ses!2ses!4v1690000000000!5m2!1ses!2ses"
                width="100%"
                height="100%"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación - Málaga y entorno"
              />
            ) : (
              <div className="p-10">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" aria-hidden="true" />
                <p className="font-heading font-bold text-lg uppercase mb-4 text-foreground">
                  Mapa de la zona
                </p>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                  El mapa de Google se carga al aceptar las cookies de contenido externo (marketing).
                </p>
                <Button type="button" variant="outline" onClick={openPreferences}>
                  Configurar cookies para ver el mapa
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
