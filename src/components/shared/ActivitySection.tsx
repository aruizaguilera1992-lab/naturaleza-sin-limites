import { useId, useState, type ReactNode } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Shared, initially closed detail section for public and private outings. */
export function ActivitySection({ title, icon: Icon, children }: { title: string; icon?: LucideIcon; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <section className="min-w-0 border-b border-border">
      <h2>
        <Button type="button" variant="ghost" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}
          className="min-h-14 w-full justify-between rounded-none px-2 py-3 text-left text-sm normal-case tracking-normal active:scale-100 sm:text-base">
          <span className="flex min-w-0 items-center gap-2">
            {Icon && <Icon className="shrink-0 text-primary" aria-hidden="true" />}
            <span className="break-words">{title}</span>
          </span>
          <ChevronDown className={cn('shrink-0 text-primary transition-transform duration-300 motion-reduce:transition-none', open && 'rotate-180')} aria-hidden="true" />
        </Button>
      </h2>
      <div id={id} hidden={!open}>
        {open && <div className="min-w-0 px-2 pb-4 text-sm leading-relaxed text-muted-foreground">{children}</div>}
      </div>
    </section>
  );
}