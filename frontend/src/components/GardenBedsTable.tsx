import React from 'react';
import { Sprout, ArrowRight, Droplets, Thermometer, Check } from 'lucide-react';
import { GardenBed } from '../types/garden';

interface GardenBedsTableProps {
  beds: GardenBed[];
  onSelectBed?: (bed: GardenBed) => void;
  onViewAll?: () => void;
  showAll?: boolean;
}

export const GardenBedsTable: React.FC<GardenBedsTableProps> = ({
  beds,
  onSelectBed,
  onViewAll,
  showAll = false,
}) => {
  const displayedBeds = showAll ? beds : beds.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
          STATUS DOS CANTEIROS
        </span>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-stone-500 hover:text-[#1e6b39] flex items-center gap-1 transition-colors"
        >
          <span>{showAll ? 'Mostrar menos' : 'Ver todos'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table responsive wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-stone-100 text-stone-400 text-[11px] font-medium select-none">
              <th className="pb-3 font-medium">Canteiro</th>
              <th className="pb-3 font-medium">Planta</th>
              <th className="pb-3 font-medium min-w-[130px]">Umidade</th>
              <th className="pb-3 font-medium">Temperatura</th>
              <th className="pb-3 font-medium text-right sm:text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100/80">
            {displayedBeds.map((bed) => {
              const isDry = bed.status === 'Solo seco';
              return (
                <tr
                  key={bed.id}
                  onClick={() => onSelectBed?.(bed)}
                  className="hover:bg-stone-50/70 cursor-pointer transition-colors group"
                >
                  {/* Canteiro Name with circular icon badge */}
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#ecf5ee] text-[#22673a] flex items-center justify-center shrink-0 border border-[#d6ebd9]">
                        <Sprout className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-stone-800 group-hover:text-[#1b5d32] transition-colors whitespace-nowrap">
                        {bed.name}
                      </span>
                    </div>
                  </td>

                  {/* Plant Type */}
                  <td className="py-3.5 pr-3 text-stone-600 font-medium whitespace-nowrap">
                    {bed.plant}
                  </td>

                  {/* Moisture Progress Bar */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDry
                              ? 'bg-amber-500'
                              : bed.moisture > 70
                              ? 'bg-[#297a44]'
                              : 'bg-[#3b8c56]'
                          }`}
                          style={{ width: `${Math.min(100, bed.moisture)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-stone-700 tabular-nums">
                        {bed.moisture}%
                      </span>
                    </div>
                  </td>

                  {/* Temperature */}
                  <td className="py-3.5 pr-3 text-stone-600 font-medium tabular-nums whitespace-nowrap">
                    {bed.temperature.toFixed(1)}°C
                  </td>

                  {/* Status pill badge */}
                  <td className="py-3.5 text-right sm:text-left whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isDry
                          ? 'bg-[#faeee8] text-[#c2410c]'
                          : 'bg-[#e9f6ec] text-[#1b6b38]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isDry ? 'bg-[#c2410c]' : 'bg-[#1b6b38]'
                        }`}
                      />
                      {bed.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table footer action */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
        <span>{beds.length} canteiros monitorados pela rede LoRa</span>
        <span className="text-stone-400 font-normal">
          Clique no canteiro para irrigar ou inspecionar
        </span>
      </div>
    </div>
  );
};
