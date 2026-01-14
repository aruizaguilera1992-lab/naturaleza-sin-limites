import { Mountain, Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import logo from '@/assets/logo.jpg';

const navLinks = [
  { href: '#actividades', label: 'Actividades' },
  { href: '#vertigo-sapiens', label: 'Vértigo Sapiens' },
  { href: '#nosotros', label: 'Sobre Nosotros' },
  { href: '#contacto', label: 'Contacto' },
];

const activities = [
  { href: '#', label: 'Espeleología' },
  { href: '#', label: 'Barranquismo' },
  { href: '#', label: 'Escalada' },
  { href: '#', label: 'Vías Ferratas' },
];

const socialLinks = [
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-adventure-dark border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div>
            <a href="#inicio" className="inline-block mb-6">
              <div className="bg-background rounded-xl p-2 shadow-lg inline-block">
                <img src={logo} alt="Naturaleza Sin Límites" className="h-20 w-auto" />
              </div>
            </a>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Turismo activo profesional y entrenamiento especializado en Málaga. 
              Vive la aventura con seguridad y pasión.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Navegación</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Activities */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Actividades</h4>
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li key={activity.label}>
                  <a
                    href={activity.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {activity.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:info@naturalezasinlimites.es"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  info@naturalezasinlimites.es
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <a
                  href="tel:+34600000000"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  +34 600 000 000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-sm">
                  Málaga, Andalucía, España
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2026 Naturaleza Sin Límites - Todos los derechos reservados
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Política de Privacidad</a>
              <a href="#" className="hover:text-primary transition-colors">Términos y Condiciones</a>
              <a href="#" className="hover:text-primary transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
