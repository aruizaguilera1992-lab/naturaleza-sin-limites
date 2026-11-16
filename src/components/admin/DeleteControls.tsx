import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Target = "booking" | "contact" | "event";

const RPC: Record<Target, string> = {
  booking: "admin_delete_booking",
  contact: "admin_delete_contact",
  event: "admin_delete_activity_event",
};

const WARNING: Record<Target, string> = {
  booking: "la reserva",
  contact: "el contacto",
  event: "la salida del calendario público",
};

export function DeleteRecordButton({ target, id, onDeleted, className = "mt-6", label = "Eliminar definitivamente" }: { target: Target; id: string; onDeleted: () => void; className?: string; label?: string }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    const { error } = await supabase.rpc(RPC[target] as never, { _id: id } as never);
    setBusy(false);
    if (error) return toast({ title: "No se pudo eliminar", description: error.message, variant: "destructive" });
    toast({ title: "Eliminado definitivamente" });
    onDeleted();
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className={`${className} min-h-11 gap-2 border-destructive/50 text-destructive hover:bg-destructive/10`}>
          <Trash2 className="h-4 w-4" aria-hidden="true" /> {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar definitivamente?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borrarán {WARNING[target]}
            {target === "event"
              ? " y sus enlaces de reserva ya liberados. Si tiene reservas activas, primero deberás eliminarlas desde Reservas. No se puede deshacer."
              : ", sus enlaces de pago y su historial de correos. No se puede deshacer. Los cobros ya hechos en Stripe no se devuelven."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={busy} onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
