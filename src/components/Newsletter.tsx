import { motion } from 'framer-motion';
import { Mail, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section id="newsletter" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-adventure-dark to-adventure-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6">
            <Mountain className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-section font-heading mb-4">
            ¿Listo para tu <span className="text-gradient">Próxima Aventura</span>?
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Suscríbete a nuestra newsletter y recibe un 10% de descuento en tu primera actividad, 
            además de consejos exclusivos y ofertas especiales.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                required
              />
            </div>
            <Button type="submit" variant="hero" size="lg">
              Suscríbete
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            Al suscribirte aceptas nuestra política de privacidad. Puedes darte de baja en cualquier momento.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
