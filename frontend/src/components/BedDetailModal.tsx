import React from 'react';
import { X, Sprout, Droplets, Thermometer, Sun, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { GardenBed } from '../types/garden';

interface BedDetailModalProps {
  bed: GardenBed | null;
  onClose: () => void;
  onIrrigate: (bedId: string) => void;
}

export const BedDetailModal: React.FC<BedDetailModalProps> = ({
  bed,
  onClose,
  onIrrigate,
}) => {
  if (!bed) return null;

  const isDry = bed.status === 'Solo seco';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-[#fbfdfa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ecf5ee] text-[#1e5c34] flex items-center justify-center border border-[#d3ebd7]">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#193220]">{bed.name}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDry
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {bed.status}
                </span>
              </div>
              <p className="text-xs text-stone-500">{bed.plant}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Gauges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100/80 text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-stone-500 font-medium">Umidade do Solo</span>
              <div className="text-2xl font-bold text-stone-900 tabular-nums my-0.5">
                {bed.moisture}%
              </div>
              <span className="text-[10px] text-stone-400">
                {bed.moisture < 40 ? 'Necessita de rega' : 'Nível satisfatório'}
              </span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100/80 text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-stone-500 font-medium">Temperatura</span>
              <div className="text-2xl font-bold text-stone-900 tabular-nums my-0.5">
                {bed.temperature.toFixed(1)}°C
              </div>
              <span className="text-[10px] text-stone-400">Ambiente do substrato</span>
            </div>
          </div>

          {/* Plant & bed specifics */}
          <div className="p-3.5 bg-[#f6f9f6] rounded-2xl border border-[#e2efe4] space-y-2 text-xs">
            <div className="flex items-center justify-between text-stone-600">
              <span className="flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-700" /> Variedade Botânica
              </span>
              <span className="font-semibold text-stone-800">{bed.plantType}</span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-600" /> Insolação
              </span>
              <span className="font-medium text-stone-700">{bed.solarExposure || 'Sol Pleno'}</span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" /> Última Rega
              </span>
              <span className="font-medium text-stone-700">{bed.lastWatered || 'Hoje'}</span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" /> Plantado em
              </span>
              <span className="font-medium text-stone-700">{bed.plantedDate || 'Recente'}</span>
            </div>
          </div>

          {/* Educational notice */}
          {isDry && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Atenção:</strong> A umidade está em {bed.moisture}%, abaixo do limiar de 40% recomendado para o desenvolvimento saudável da raiz de {bed.plant}.
              </span>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={() => {
              onIrrigate(bed.id);
              onClose();
            }}
            className="w-full py-3 bg-[#1d542e] hover:bg-[#154223] text-white text-xs font-semibold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Droplets className="w-4 h-4" />
            Ativar Irrigação por Gotejamento Agora
          </button>
        </div>
      </div>
    </div>
  );
};
