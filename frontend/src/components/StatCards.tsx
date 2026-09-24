import React from 'react';
import { Leaf, Droplet, Thermometer, AlertTriangle } from 'lucide-react';

interface StatCardsProps {
  plantCount?: number;
  avgMoisture?: number;
  avgTemperature?: number;
  alertCount?: number;
  onCardClick?: (type: string) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  plantCount = 42,
  avgMoisture = 61,
  avgTemperature = 27.4,
  alertCount = 2,
  onCardClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Plantas */}
      <div
        onClick={() => onCardClick?.('plantas')}
        className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-stone-300 transition-all duration-150 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-700 group-hover:text-[#215a36] group-hover:bg-[#eaf4ec] transition-colors">
            <Leaf className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e8f6ec] text-[#1e6b39]">
            +7,7%
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-stone-500 block mb-1">
            Plantas
          </span>
          <div className="text-2xl font-bold text-[#172b1d] tracking-tight tabular-nums">
            {plantCount}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">
            3 novas este mês
          </span>
        </div>
      </div>

      {/* 2. Umidade Média */}
      <div
        onClick={() => onCardClick?.('umidade')}
        className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-stone-300 transition-all duration-150 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-700 group-hover:text-sky-700 group-hover:bg-sky-50 transition-colors">
            <Droplet className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e8f6ec] text-[#1e6b39]">
            +4,2%
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-stone-500 block mb-1">
            Umidade média
          </span>
          <div className="text-2xl font-bold text-[#172b1d] tracking-tight tabular-nums">
            {avgMoisture}%
          </div>
          <span className="text-xs text-stone-400 mt-1 block">
            Nível adequado
          </span>
        </div>
      </div>

      {/* 3. Temperatura */}
      <div
        onClick={() => onCardClick?.('temperatura')}
        className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-stone-300 transition-all duration-150 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-700 group-hover:text-amber-700 group-hover:bg-amber-50 transition-colors">
            <Thermometer className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            -1,3%
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-stone-500 block mb-1">
            Temperatura
          </span>
          <div className="text-2xl font-bold text-[#172b1d] tracking-tight tabular-nums">
            {avgTemperature.toFixed(1).replace('.', ',')}°C
          </div>
          <span className="text-xs text-stone-400 mt-1 block">
            Dentro do esperado
          </span>
        </div>
      </div>

      {/* 4. Alertas */}
      <div
        onClick={() => onCardClick?.('alertas')}
        className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-stone-300 transition-all duration-150 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-700 group-hover:text-amber-700 group-hover:bg-amber-50 transition-colors">
            <AlertTriangle className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#fceddf] text-[#b45309]">
            Agora
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-stone-500 block mb-1">
            Alertas
          </span>
          <div className="text-2xl font-bold text-[#172b1d] tracking-tight tabular-nums">
            {alertCount < 10 ? `0${alertCount}` : alertCount}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">
            Requerem atenção
          </span>
        </div>
      </div>
    </div>
  );
};
