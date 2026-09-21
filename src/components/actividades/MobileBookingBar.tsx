import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface MobileBookingBarProps {
  price: string;
  category: string;
  slug: string;
}

export function MobileBookingBar({ price, category, slug }: MobileBookingBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-card backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 shrink-0"><p className="text-xs text-muted-foreground">Desde</p><p className="text-xl font-extrabold text-primary">{price}</p></div>
        <Button variant="hero" size="default" className="min-h-12 flex-1" asChild><Link to={`/reservar/${category}/${slug}`}>Reservar</Link></Button>
      </div>
    </div>
  );
}