import React from 'react';
import { X, BookOpen, Droplets, Thermometer, Sun, CheckCircle2 } from 'lucide-react';

interface GardenGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GardenGuideModal: React.FC<GardenGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const plantGuides = [
    {
      name: 'Tomate (Solanum lycopersicum)',
      idealMoisture: '65% - 75%',
      idealTemp: '20°C - 27°C',
      sun: 'Sol Pleno (6h+ diárias)',
      tips: 'Mantenha regas regulares pela manhã na base da planta, evitando molhar as folhas para prevenir fungos.',
    },
    {
      name: 'Alface (Lactuca sativa)',
      idealMoisture: '60% - 70%',
      idealTemp: '16°C - 24°C',
      sun: 'Meia Sombra / Sol Suave',
      tips: 'Sensível a altas temperaturas (acima de 28°C floresce precocemente). Solo sempre levemente úmido.',
    },
    {
      name: 'Cenoura (Daucus carota)',
      idealMoisture: '50% - 60%',
      idealTemp: '16°C - 22°C',
      sun: 'Sol Pleno',
      tips: 'Requer solo profundo e descompactado. Evite excesso de água perto da colheita para não rachar as raízes.',
    },
    {
      name: 'Manjericão (Ocimum basilicum)',
      idealMoisture: '55% - 65%',
      idealTemp: '22°C - 30°C',
      sun: 'Sol Pleno',
      tips: 'Retire as inflorescências para incentivar a brotação contínua de folhas aromáticas.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-[#fbfdfa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ecf5ee] text-[#1e5c34] flex items-center justify-center border border-[#d3ebd7]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#193220]">Guia da Horta Escolar</h2>
              <p className="text-xs text-stone-500">
                Parâmetros botânicos recomendados para cultivo e sensores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 bg-[#f4f8f4] rounded-2xl border border-[#ddead1] text-xs text-[#204928]">
            <h4 className="font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#206932]" /> Boas Práticas Pedagógicas
            </h4>
            <p>
              Incentive os alunos a checarem a umidade física no solo antes de comparar com a leitura dos sensores IoT. Horários ideais para manejo com as turmas: 08:00 às 09:30 ou 16:30 às 17:30.
            </p>
          </div>

          <div className="space-y-3">
            {plantGuides.map((guide, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-stone-900">{guide.name}</h3>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div className="p-2 rounded-xl bg-white border border-stone-200/60">
                    <span className="text-[10px] text-stone-400 block flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-sky-500" /> Umidade Ideal
                    </span>
                    <span className="font-bold text-stone-800">{guide.idealMoisture}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-stone-200/60">
                    <span className="text-[10px] text-stone-400 block flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-500" /> Temperatura
                    </span>
                    <span className="font-bold text-stone-800">{guide.idealTemp}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-stone-200/60">
                    <span className="text-[10px] text-stone-400 block flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-600" /> Luminosidade
                    </span>
                    <span className="font-bold text-stone-800">{guide.sun}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  <strong>Dica de cultivo:</strong> {guide.tips}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-[#fbfdfa] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#1b4d2a] hover:bg-[#153f22] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
