import { MapPin, Clock, ShieldCheck, Users, CloudRain, Backpack } from 'lucide-react';

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
  'Bañador y ropa de recambio',
  'Calzado deportivo que se pueda mojar',
  'Toalla, agua y comida ligera',
  'Protección solar y gorra',
];

export function PracticalInfo({
  meetingPoint = 'Se confirma al reservar (punto accesible en coche, cerca del inicio de la actividad)',
  totalDuration = 'Jornada aproximada de 5-7 h incluyendo aproximación y regreso',
  minParticipants = 4,
  whatToBring = defaultWhatToBring,
}: PracticalInfoProps) {
  const items = [
    { icon: MapPin, title: 'Punto de encuentro', text: meetingPoint },
    { icon: Clock, title: 'Duración total', text: totalDuration },
    {
      icon: ShieldCheck,
      title: 'Seguros',
      text: 'Seguro de accidentes y de responsabilidad civil incluidos en todas las salidas, con guías titulados.',
    },
    {
      icon: Users,
      title: 'Grupo mínimo',
      text: `A partir de ${minParticipants} personas se confirma la salida. Con menos participantes te proponemos otra fecha o una salida privada.`,
    },
    {
      icon: CloudRain,
      title: 'Cancelación y meteorología',
      text: 'Cancelación gratuita hasta 48 h antes. Si la meteorología o el caudal no son seguros, cambiamos de fecha, de actividad o devolvemos el importe.',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold text-foreground">
        Información práctica
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3"
          >
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
