import { AlertTriangle, Droplet, Leaf, Thermometer } from 'lucide-react';

interface StatCardsProps {
  plantCount: number;
  avgMoisture: number | null;
  avgTemperature: number | null;
  alertCount: number;
  onCardClick?: (type: string) => void;
}

export const StatCards = ({
  plantCount,
  avgMoisture,
  avgTemperature,
  alertCount,
  onCardClick,
}: StatCardsProps) => {
  const cards = [
    {
      label: 'Espécies cadastradas',
      value: String(plantCount),
      description: 'Nos canteiros cadastrados',
      icon: Leaf,
      action: 'plantas',
    },
    {
      label: 'Umidade média',
      value: avgMoisture === null ? '—' : `${avgMoisture}%`,
      description: avgMoisture === null ? 'Sem leituras' : 'Leituras mais recentes',
      icon: Droplet,
      action: 'umidade',
    },
    {
      label: 'Temperatura média',
      value: avgTemperature === null ? '—' : `${avgTemperature.toFixed(1).replace('.', ',')}°C`,
      description: avgTemperature === null ? 'Sem leituras' : 'Leituras mais recentes',
      icon: Thermometer,
      action: 'temperatura',
    },
    {
      label: 'Alertas em aberto',
      value: String(alertCount).padStart(2, '0'),
      description: 'Aguardando resolução',
      icon: AlertTriangle,
      action: 'alertas',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, description, icon: Icon, action }) => (
        <button
          key={label}
          type="button"
          onClick={() => onCardClick?.(action)}
          className="group rounded-2xl border border-stone-200/70 bg-white p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-stone-300"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-100 bg-stone-50 text-stone-700 transition-colors group-hover:bg-[#eaf4ec] group-hover:text-[#215a36]">
              <Icon className="h-5 w-5 stroke-[1.8]" />
            </div>
          </div>
          <span className="mb-1 block text-xs font-medium text-stone-500">{label}</span>
          <div className="text-2xl font-bold tracking-tight text-[#172b1d] tabular-nums">
            {value}
          </div>
          <span className="mt-1 block text-xs text-stone-400">{description}</span>
        </button>
      ))}
    </div>
  );
};
