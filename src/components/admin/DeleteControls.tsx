import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function ResetAllButton({ onDone }: { onDone: () => void }) {
  const { toast } = useToast();
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const reset = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("admin_reset_all", { _confirm: word.trim() });
    setBusy(false);
    setWord("");
    if (error) return toast({ title: "No se pudo vaciar", description: error.message, variant: "destructive" });
    toast({ title: "Panel vaciado" });
    onDone();
  };
  return (
    <AlertDialog onOpenChange={(o) => !o && setWord("")}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="min-h-11 w-full justify-start gap-2 text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Vaciar todos los datos
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Vaciar todo el panel</AlertDialogTitle>
          <AlertDialogDescription>
            Se borrarán para siempre todas las reservas, contactos, enlaces de pago, salidas programadas e historial de correos. Escribe BORRAR para confirmar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input value={word} onChange={(e) => setWord(e.target.value)} placeholder="BORRAR" aria-label="Escribe BORRAR para confirmar" />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={busy || word.trim() !== "BORRAR"} onClick={reset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Vaciar todo</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
