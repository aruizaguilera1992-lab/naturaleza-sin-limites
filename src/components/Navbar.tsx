import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
const navLinks = [{
  href: '/',
  label: 'Inicio',
  isRoute: true
}, {
  href: '#actividades',
  label: 'Actividades',
  isRoute: false
}, {
  href: '/vertigo-sapiens',
  label: 'Vértigo Sapiens',
  isRoute: true
}, {
  href: '#nosotros',
  label: 'Quiénes Somos',
  isRoute: false
}, {
  href: '#contacto',
  label: 'Contacto',
  isRoute: false
}];
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <motion.header initial={{
    y: -100
  }} animate={{
    y: 0
  }} transition={{
    duration: 0.5
  }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'nav-scrolled py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img 
              src={logo} 
              alt="Naturaleza Sin Límites" 
              className="h-20 w-auto transition-all duration-300 group-hover:scale-110 group-hover:brightness-110" 
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => <li key={link.href}>
                {link.isRoute ? (
                  <Link to={link.href} className="text-foreground/80 hover:text-primary transition-colors duration-300 font-medium text-sm uppercase tracking-wider">
                    {link.label}
                  </Link>
                ) : (
                  <a href={link.href} className="text-foreground/80 hover:text-primary transition-colors duration-300 font-medium text-sm uppercase tracking-wider">
                    {link.label}
                  </a>
                )}
              </li>)}
          </ul>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="tel:+34685609542" className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              <span className="text-sm font-medium">+34 685 60 95 42</span>
            </a>
            <Button 
              variant="hero" 
              size="default"
              onClick={() => {
                document.getElementById('contacto')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              ¡Reserva Ahora!
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-foreground hover:text-primary transition-colors" aria-label="Toggle menu">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} transition={{
        duration: 0.3
      }} className="lg:hidden bg-background/98 backdrop-blur-lg border-t border-border">
            <div className="container mx-auto px-4 py-6">
              <ul className="flex flex-col gap-4">
                {navLinks.map(link => <li key={link.href}>
                    {link.isRoute ? (
                      <Link to={link.href} onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-foreground/80 hover:text-primary transition-colors font-medium uppercase tracking-wider">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-foreground/80 hover:text-primary transition-colors font-medium uppercase tracking-wider">
                        {link.label}
                      </a>
                    )}
                  </li>)}
              </ul>
              <div className="mt-6 pt-6 border-t border-border">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    document.getElementById('contacto')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                >
                  ¡Reserva Ahora!
                </Button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </motion.header>;
}