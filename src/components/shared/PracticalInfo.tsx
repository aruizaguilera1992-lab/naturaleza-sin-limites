import { Link } from "react-router-dom";
import { MapPin, Clock, ShieldCheck, Users, CloudRain, Backpack } from "lucide-react";

interface PracticalInfoProps {
  /** Punto de encuentro habitual (ciudad/pueblo de referencia) */
  meetingPoint?: string;
  /** Duración total aproximada, incluyendo desplazamientos */
  totalDuration?: string;
  /** Número mínimo de participantes para confirmar la salida */
  minParticipants?: number;
  /** Qué llevar (lista corta) */
  whatToBring?: string[];
}

const defaultWhatToBring = [
  "Ropa y calzado adecuados a la actividad y al tiempo previsto",
  "Agua, comida ligera y medicación personal si la necesitas",
  "Ropa de recambio cuando el recorrido lo requiera",
  "Consulta la lista específica con el guía antes de la salida",
];

export function PracticalInfo({
  meetingPoint = "Se confirma al reservar (punto accesible en coche, cerca del inicio de la actividad)",
  totalDuration = "Consulta la duración indicada en la ficha de la actividad; el horario definitivo se confirma al reservar",
  minParticipants,
  whatToBring = defaultWhatToBring,
}: PracticalInfoProps) {
  const items = [
    { icon: MapPin, title: "Punto de encuentro", text: meetingPoint },
    { icon: Clock, title: "Duración total", text: totalDuration },
    {
      icon: ShieldCheck,
      title: "Seguros",
      text: "Seguro de accidentes y de responsabilidad civil incluidos en todas las salidas, con guías titulados.",
    },
    {
      icon: Users,
      title: "Grupo mínimo",
      text: minParticipants
        ? `Grupo mínimo de ${minParticipants} personas, sujeto a disponibilidad y confirmación. Con menos participantes, consulta una salida privada u otra fecha.`
        : "El mínimo es el indicado en la ficha de cada actividad. La salida queda sujeta a disponibilidad y confirmación del guía.",
    },
    {
      icon: CloudRain,
      title: "Cancelación y meteorología",
      text: (
        <>
          Las condiciones de cancelación se detallan en los{" "}
          <Link to="/terminos" className="text-primary underline underline-offset-4">
            términos y condiciones
          </Link>{" "}
          y se confirman antes de reservar. Si las condiciones no permiten realizar la actividad con seguridad, el guía
          te comunicará las alternativas.
        </>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold text-foreground">Información práctica</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Backpack className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-foreground">Qué llevar</p>
        </div>
        <ul className="grid gap-1 sm:grid-cols-2">
          {whatToBring.map((item) => (
            <li key={item} className="text-sm text-muted-foreground">
              • {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
