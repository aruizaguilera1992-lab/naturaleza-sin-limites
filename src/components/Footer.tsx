import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useCookieConsent } from '@/context/CookieConsentContext';

const navLinks = [
  { href: '/#actividades', label: 'Actividades' },
  { href: '/vertigo-sapiens', label: 'Vértigo Sapiens' },
  { href: '/blog', label: 'Blog' },
  { href: '/#nosotros', label: 'Sobre Nosotros' },
  { href: '/#contacto', label: 'Contacto' },
];

const activities = [
  { href: '/espeleologia', label: 'Espeleología' },
  { href: '/barranquismo', label: 'Barranquismo' },
  { href: '/escalada', label: 'Escalada' },
  { href: '/vias-ferratas', label: 'Vías Ferratas' },
];

const socialLinks = [
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
];

export function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openPreferences } = useCookieConsent();

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const sectionId = href.substring(2);
      if (location.pathname === '/') {
        // Already on home page, just scroll
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigate to home then scroll
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <footer className="bg-adventure-dark border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div>
            <button onClick={handleLogoClick} className="inline-block mb-6 cursor-pointer">
              <img src={logo} alt="Naturaleza Sin Límites" className="h-24 w-auto" />
            </button>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Proyecto de guiado y entrenamiento en deportes de aventura en Málaga. 
              Pasión por la aventura, compromiso con la seguridad.
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
                  {link.href.startsWith('/#') ? (
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm text-left"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  )}
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
                  <Link
                    to={activity.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {activity.label}
                  </Link>
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
                  href="mailto:naturaleza.s.limites@gmail.com"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  naturaleza.s.limites@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <a
                  href="tel:+34685609542"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  +34 685 60 95 42
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
              © 2026 Naturaleza Sin Límites - Proyecto personal
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacidad" className="hover:text-primary transition-colors">Política de Privacidad</Link>
              <Link to="/terminos" className="hover:text-primary transition-colors">Términos y Condiciones</Link>
              <Link to="/cookies" className="hover:text-primary transition-colors">Política de Cookies</Link>
              <button onClick={openPreferences} className="hover:text-primary transition-colors">Configurar cookies</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
