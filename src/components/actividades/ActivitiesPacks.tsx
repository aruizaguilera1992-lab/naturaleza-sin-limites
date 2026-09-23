import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Mountain, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PackDesignerModal, packConfigs } from "./pack-designer/PackDesignerModal";
import { CustomPackDesignerModal } from "./pack-designer/CustomPackDesignerModal";

const packIcons: Record<string, React.ElementType> = {
  "aventura-completa": Sparkles,
  "vertical-integral": Mountain,
  "experto-total": Trophy,
};
const packs = packConfigs.map((pack) => ({ ...pack, icon: packIcons[pack.id] || Sparkles }));

export function ActivitiesPacks() {
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [customPackOpen, setCustomPackOpen] = useState(false);

  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-primary text-sm font-semibold">PACKS ESPECIALES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
            Ahorra con Nuestros <span className="text-gradient">Packs</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Combina varias actividades y obtén descuentos exclusivos. Ideal para grupos y aventureros que quieren
            probarlo todo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack, index) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl group"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${pack.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-3">
                  <pack.icon className="h-8 w-8" />
                  <Badge className="bg-white/20 text-white border-0">Ahorras {pack.savings}</Badge>
                </div>
                <h3 className="text-xl font-heading font-bold mb-1">{pack.name}</h3>
                <p className="text-white/80 text-sm">{pack.subtitle}</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-muted-foreground text-sm mb-4">{pack.description}</p>

                {/* Activities included */}
                <div className="mb-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {pack.activities} actividades incluidas:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pack.types.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {pack.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Pricing */}
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-heading font-bold text-foreground">{pack.price}</span>
                  <span className="text-muted-foreground line-through text-sm mb-1">{pack.originalPrice}</span>
                </div>

                <Button variant="hero" className="w-full" onClick={() => setSelectedPackId(pack.id)}>
                  Ver Pack
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">¿Necesitas un pack personalizado para tu grupo?</p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCustomPackOpen(true)}
            className="max-w-full whitespace-normal h-auto min-h-[44px] py-3 text-center"
          >
            <Zap className="h-4 w-4 mr-2" />
            Crear Pack Personalizado
          </Button>
        </motion.div>
      </div>

      {/* Pack Designer Modal */}
      <PackDesignerModal
        open={!!selectedPackId}
        onOpenChange={(open) => !open && setSelectedPackId(null)}
        packId={selectedPackId || ""}
      />

      {/* Custom Pack Designer Modal */}
      <CustomPackDesignerModal open={customPackOpen} onOpenChange={setCustomPackOpen} />
    </section>
  );
}
