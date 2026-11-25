import React from 'react';
import { X, Sprout, Droplets, Thermometer, Clock, AlertCircle, Cpu } from 'lucide-react';
import type { GardenBed } from '../types/garden';

interface BedDetailModalProps {
  bed: GardenBed | null;
  onClose: () => void;
  onIrrigate: (bedId: string) => void | Promise<void>;
}

export const BedDetailModal: React.FC<BedDetailModalProps> = ({
  bed,
  onClose,
  onIrrigate,
}) => {
  if (!bed) return null;

  const isDry = bed.status === 'Solo seco';
  const noReading = bed.status === 'Atenção';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                      : noReading
                      ? 'bg-stone-100 text-stone-600'
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

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100/80 text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-stone-500 font-medium">Umidade do Solo</span>
              <div className="text-2xl font-bold text-stone-900 tabular-nums my-0.5">
                {noReading ? '—' : `${bed.moisture}%`}
              </div>
              <span className="text-[10px] text-stone-400">
                {noReading ? 'Sem leitura' : bed.moisture < 40 ? 'Necessita de rega' : 'Leitura atual'}
              </span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100/80 text-center">
              <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-stone-500 font-medium">Temperatura</span>
              <div className="text-2xl font-bold text-stone-900 tabular-nums my-0.5">
                {noReading ? '—' : `${bed.temperature.toFixed(1)}°C`}
              </div>
              <span className="text-[10px] text-stone-400">Leitura do sensor</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#f6f9f6] rounded-2xl border border-[#e2efe4] space-y-2 text-xs">
            <div className="flex items-center justify-between text-stone-600">
              <span className="flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-700" /> Cultura
              </span>
              <span className="font-semibold text-stone-800">{bed.plantType || bed.plant}</span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-700" /> Dispositivo Associado
              </span>
              <span className="font-medium text-stone-700">
                {bed.deviceId ? `Dispositivo #${bed.deviceId}` : 'Nenhum'}
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" /> Última Irrigação
              </span>
              <span className="font-medium text-stone-700">{bed.lastWatered || 'Sem registro'}</span>
            </div>
          </div>

          {isDry && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Atenção:</strong> A umidade está em {bed.moisture}%, abaixo do limiar recomendado para {bed.plant}.
              </span>
            </div>
          )}

          <button
            onClick={() => {
              onIrrigate(bed.id);
              onClose();
            }}
            className="w-full py-3 bg-[#1d542e] hover:bg-[#154223] text-white text-xs font-semibold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Droplets className="w-4 h-4" />
            Registrar Irrigação Agora
          </button>
        </div>
      </div>
    </div>
  );
};