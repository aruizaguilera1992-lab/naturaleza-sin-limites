import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteRecordButton({ target, id, onDeleted }: { target: "booking" | "contact"; id: string; onDeleted: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    const { error } = target === "booking"
      ? await supabase.rpc("admin_delete_booking", { _id: id })
      : await supabase.rpc("admin_delete_contact", { _id: id });
    setBusy(false);
    if (error) return toast({ title: "No se pudo eliminar", description: error.message, variant: "destructive" });
    toast({ title: "Eliminado definitivamente" });
    onDeleted();
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="mt-6 min-h-11 gap-2 border-destructive/50 text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar definitivamente
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar definitivamente?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borrarán {target === "booking" ? "la reserva" : "el contacto"}, sus enlaces de pago y su historial de correos. No se puede deshacer. Los cobros ya hechos en Stripe no se devuelven.
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
