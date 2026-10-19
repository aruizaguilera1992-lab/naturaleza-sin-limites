import { Link } from 'react-router-dom';
import { MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileBookingBarProps {
  price: string;
  category: string;
  slug: string;
  /** Si se indica, la actividad no tiene precio: CTA de consulta por WhatsApp. */
  whatsappUrl?: string;
}

/** Barra fija inferior en móvil: precio real, grupo máximo y CTA táctil >=44px. */
export function MobileBookingBar({ price, category, slug, whatsappUrl }: MobileBookingBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-card backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 shrink-0">
          <p className="text-xl font-extrabold leading-none text-primary">{whatsappUrl ? 'Precio a consultar' : price}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Users className="h-3 w-3" /> Máx. 6 por grupo</p>
        </div>
        <Button variant="hero" size="default" className="min-h-12 flex-1 text-base" asChild>
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-5 w-5" />Consultar</a>
          ) : (
            <Link to={`/reservar/${category}/${slug}`}>Reservar plaza</Link>
          )}
        </Button>
      </div>
    </div>
  );
}
