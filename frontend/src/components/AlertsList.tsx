import React from 'react';
import { Droplet, Thermometer, PlusCircle, Check, ArrowRight } from 'lucide-react';
import { GardenAlert } from '../types/garden';

interface AlertsListProps {
  alerts: GardenAlert[];
  onViewAll?: () => void;
  onSelectAlert?: (alert: GardenAlert) => void;
  onDismissAlert?: (alertId: string) => void;
}

export const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  onViewAll,
  onSelectAlert,
  onDismissAlert,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
          ALERTAS RECENTES
        </span>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-stone-500 hover:text-[#1e6b39] transition-colors"
        >
          Ver todos
        </button>
      </div>

      {/* Alert items list */}
      <div className="space-y-4">
        {alerts.slice(0, 3).map((alert) => {
          const isMoisture = alert.type === 'moisture';
          const isTemp = alert.type === 'temperature';

          return (
            <div
              key={alert.id}
              onClick={() => onSelectAlert?.(alert)}
              className="group flex items-start gap-3.5 p-2 rounded-xl hover:bg-stone-50/80 transition-colors cursor-pointer"
            >
              {/* Icon Container matching screenshot colors */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${isMoisture
                    ? 'bg-[#fdf0e9] text-[#e0653f]'
                    : isTemp
                      ? 'bg-[#fef7e6] text-[#d97706]'
                      : 'bg-[#eaf5ee] text-[#227a42]'
                  }`}
              >
                {isMoisture && <Droplet className="w-4 h-4 stroke-[2]" />}
                {isTemp && <Thermometer className="w-4 h-4 stroke-[2]" />}
                {!isMoisture && !isTemp && <PlusCircle className="w-4 h-4 stroke-[2]" />}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#182d1e] truncate group-hover:text-[#21673b] transition-colors">
                    {alert.title}
                  </h4>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                  {alert.description}
                </p>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  {alert.timeAgo}
                </span>
              </div>

              {/* Optional dismiss or view arrow */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#21673b]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer subtle tip */}
      <div className="pt-3 border-t border-stone-100 mt-2 flex items-center justify-between text-[11px] text-stone-400">
        <span>Monitoramento contínuo via telemetria</span>
        <span className="flex items-center gap-1 text-emerald-600 font-medium">
          <Check className="w-3 h-3" /> Conectado
        </span>
      </div>
    </div>
  );
};
