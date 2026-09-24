import React from 'react';
import { Sprout, Droplets, Thermometer, Sun, Plus, ArrowUpRight } from 'lucide-react';
import { GardenBed } from '../../types/garden';

interface CanteirosViewProps {
  beds: GardenBed[];
  onSelectBed: (bed: GardenBed) => void;
  onOpenNewRecord: () => void;
  onIrrigate: (bedId: string) => void;
}

export const CanteirosView: React.FC<CanteirosViewProps> = ({
  beds,
  onSelectBed,
  onOpenNewRecord,
  onIrrigate,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#236038] uppercase tracking-wider block mb-1">
            CANTEIROS DA ESCOLA
          </span>
          <h2 className="text-2xl font-bold text-[#172b1d] tracking-tight">
            Gerenciamento de Canteiros
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Monitore a umidade, insolação e status de cada lote agrícola escolar.
          </p>
        </div>

        <button
          onClick={onOpenNewRecord}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1b4d2a] hover:bg-[#153f22] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Canteiro / Registro</span>
        </button>
      </div>

      {/* Grid of Bed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {beds.map((bed) => {
          const isDry = bed.status === 'Solo seco';
          return (
            <div
              key={bed.id}
              className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-stone-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#eef7f0] text-[#1e5c34] flex items-center justify-center border border-[#d2ecd7]">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#183020]">{bed.name}</h3>
                      <p className="text-xs text-stone-500">{bed.plant}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
                </div>

                <div className="space-y-3 py-3 border-y border-stone-100 my-2">
                  {/* Moisture Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-sky-600" /> Umidade do Solo
                      </span>
                      <span className="font-bold text-stone-900 tabular-nums">
                        {bed.moisture}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
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
                  </div>

                  {/* Dual stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-xl bg-stone-50 flex items-center gap-2">
                      <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                      <div>
                        <span className="text-[10px] text-stone-400 block">Temperatura</span>
                        <span className="font-bold text-stone-800 tabular-nums">
                          {bed.temperature.toFixed(1)}°C
                        </span>
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50 flex items-center gap-2">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <div>
                        <span className="text-[10px] text-stone-400 block">Insolação</span>
                        <span className="font-medium text-stone-800 text-[11px] truncate">
                          {bed.solarExposure || 'Sol Pleno'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onSelectBed(bed)}
                  className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <span>Detalhes</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onIrrigate(bed.id)}
                  className="py-2 px-3 bg-[#e8f5ec] hover:bg-[#d5ebd9] text-[#1e6136] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                  title="Acionar gotejador"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Regar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
