import React from 'react';
import { Sun, Droplets, Thermometer, CloudRain, Moon } from 'lucide-react';
import type { EnvironmentMetric } from '../types/garden';

interface EnvironmentGridProps {
  metrics: EnvironmentMetric[];
}

export const EnvironmentGrid: React.FC<EnvironmentGridProps> = ({ metrics }) => {
  const formatMetricDisplay = (item: EnvironmentMetric) => {
    if (item.icon === 'sun' || item.title.toLowerCase().includes('luminosidade')) {
      const value = String(item.value).trim().toLowerCase();
      const numericVal = Number(value.replace('%', '').replace(',', '.'));
      const isBooleanLightReading =
        value === 'true' || value === 'false' || numericVal === 0 || numericVal === 1;
      if (!isBooleanLightReading || Number.isNaN(numericVal)) {
        return {
          displayValue: item.value,
          displayStatus: item.status,
          isLightOn: true,
        };
      }
      const hasLight = value === 'true' || numericVal === 0;
      return {
        displayValue: hasLight ? 'Com Luz' : 'Sem Luz',
        displayStatus: hasLight ? 'Incidência ativa' : 'Ambiente escuro',
        isLightOn: hasLight,
      };
    }
    return {
      displayValue: item.value,
      displayStatus: item.status,
      isLightOn: true,
    };
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
          AMBIENTE
        </span>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1e6b39]">
          <span className={`relative inline-flex h-2 w-2 rounded-full ${metrics.length ? 'bg-[#208447]' : 'bg-stone-300'}`} />
          <span>{metrics.length ? 'Com medições' : 'Sem medições'}</span>
        </div>
      </div>

      {metrics.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8 text-center text-sm text-stone-500">
          Nenhuma leitura de sensor foi registrada ainda.
        </div>
      ) : (
      <div className="grid grid-cols-2 gap-3 flex-1">
        {metrics.map((item, idx) => {
          const { displayValue, displayStatus, isLightOn } = formatMetricDisplay(item);

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-100 flex items-start gap-3 hover:bg-stone-50 transition-colors"
            >
              <div className="text-stone-500 mt-0.5 shrink-0">
                {item.icon === 'sun' &&
                  (isLightOn ? (
                    <Sun className="w-5 h-5 stroke-[1.8] text-amber-500" />
                  ) : (
                    <Moon className="w-5 h-5 stroke-[1.8] text-slate-500" />
                  ))}
                {item.icon === 'droplet' && (
                  <Droplets className="w-5 h-5 stroke-[1.8] text-sky-600" />
                )}
                {item.icon === 'thermometer' && (
                  <Thermometer className="w-5 h-5 stroke-[1.8] text-emerald-600" />
                )}
                {item.icon === 'cloud-rain' && (
                  <CloudRain className="w-5 h-5 stroke-[1.8] text-indigo-500" />
                )}
              </div>

              <div className="min-w-0">
                <span className="text-[11px] text-stone-500 block truncate">
                  {item.title}
                </span>
                <div className="text-base font-bold text-[#172b1d] tracking-tight tabular-nums mt-0.5">
                  {displayValue}
                </div>
                <span className="text-[11px] text-stone-400 font-medium block">
                  {displayStatus}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      )}

      <div className="pt-3 border-t border-stone-100 mt-3 flex items-center justify-between text-[11px] text-stone-400">
        <span>Telemetria</span>
        <span className="font-medium">{metrics.length ? 'Últimas leituras' : 'Aguardando leituras'}</span>
      </div>
    </div>
  );
};