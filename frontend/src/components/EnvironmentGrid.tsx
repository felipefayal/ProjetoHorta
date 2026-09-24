import React from 'react';
import { Sun, Droplets, Thermometer, CloudRain } from 'lucide-react';
import { EnvironmentMetric } from '../types/garden';

interface EnvironmentGridProps {
  metrics: EnvironmentMetric[];
}

export const EnvironmentGrid: React.FC<EnvironmentGridProps> = ({ metrics }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
          AMBIENTE
        </span>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1e6b39]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#208447]"></span>
          </span>
          <span>Ao vivo</span>
        </div>
      </div>

      {/* 2x2 Metric Grid matching screenshot */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {metrics.map((item, idx) => {
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-100 flex items-start gap-3 hover:bg-stone-50 transition-colors"
            >
              <div className="text-stone-500 mt-0.5 shrink-0">
                {item.icon === 'sun' && <Sun className="w-5 h-5 stroke-[1.8] text-amber-500" />}
                {item.icon === 'droplet' && <Droplets className="w-5 h-5 stroke-[1.8] text-sky-600" />}
                {item.icon === 'thermometer' && <Thermometer className="w-5 h-5 stroke-[1.8] text-emerald-600" />}
                {item.icon === 'cloud-rain' && <CloudRain className="w-5 h-5 stroke-[1.8] text-indigo-500" />}
              </div>

              <div className="min-w-0">
                <span className="text-[11px] text-stone-500 block truncate">
                  {item.title}
                </span>
                <div className="text-base font-bold text-[#172b1d] tracking-tight tabular-nums mt-0.5">
                  {item.value}
                </div>
                <span className="text-[11px] text-stone-400 font-medium block">
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer weather note */}
      <div className="pt-3 border-t border-stone-100 mt-3 flex items-center justify-between text-[11px] text-stone-400">
        <span>Estação Meteorológica da Escola</span>
        <span className="text-emerald-700 font-medium">Condições ideais</span>
      </div>
    </div>
  );
};
