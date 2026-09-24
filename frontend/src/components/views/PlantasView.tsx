import React from 'react';
import { Leaf, Calendar, Droplets, Sun, CheckCircle2 } from 'lucide-react';
import { GardenBed } from '../../types/garden';

interface PlantasViewProps {
  beds: GardenBed[];
  onOpenNewRecord: () => void;
}

export const PlantasView: React.FC<PlantasViewProps> = ({ beds, onOpenNewRecord }) => {
  const plantsData = [
    {
      name: 'Tomate Cereja',
      scientific: 'Solanum lycopersicum var. cerasiforme',
      bed: 'Canteiro 01',
      stage: 'Frutificação',
      planted: '12 de Agosto, 2026',
      daysToHarvest: '18 dias restantes',
      waterFreq: '1x ao dia pela manhã',
      health: 'Excelente',
      color: 'bg-rose-50 text-rose-700',
    },
    {
      name: 'Alface Crespa',
      scientific: 'Lactuca sativa',
      bed: 'Canteiro 02',
      stage: 'Desenvolvimento foliar',
      planted: '01 de Setembro, 2026',
      daysToHarvest: '10 dias restantes',
      waterFreq: '2x ao dia em dias quentes',
      health: 'Excelente',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      name: 'Cenoura Brasília',
      scientific: 'Daucus carota',
      bed: 'Canteiro 03',
      stage: 'Engrossamento de raiz',
      planted: '20 de Julho, 2026',
      daysToHarvest: '25 dias restantes',
      waterFreq: 'Solo mantido a 55%',
      health: 'Solo ressecado (requer rega)',
      color: 'bg-amber-50 text-amber-700',
    },
    {
      name: 'Manjericão Italiano',
      scientific: 'Ocimum basilicum',
      bed: 'Canteiro 04',
      stage: 'Colheita contínua',
      planted: '15 de Agosto, 2026',
      daysToHarvest: 'Pronto para colheita',
      waterFreq: 'Moderada',
      health: 'Excelente',
      color: 'bg-teal-50 text-teal-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#236038] uppercase tracking-wider block mb-1">
            CATÁLOGO BOTÂNICO
          </span>
          <h2 className="text-2xl font-bold text-[#172b1d] tracking-tight">
            Culturas e Plantas Ativas
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Espécies cultivadas pelos alunos com ciclo biológico e datas de colheita.
          </p>
        </div>

        <button
          onClick={onOpenNewRecord}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1b4d2a] hover:bg-[#153f22] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Leaf className="w-4 h-4" />
          <span>Cadastrar Nova Cultura</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plantsData.map((plant, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ecf5ee] text-[#1e5d34] flex items-center justify-center border border-[#d2edd6]">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#183020]">{plant.name}</h3>
                  <p className="text-[11px] text-stone-400 italic">{plant.scientific}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${plant.color}`}>
                {plant.bed}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50">
                <span className="text-[10px] text-stone-400 block">Estágio Fenológico</span>
                <span className="font-bold text-stone-800">{plant.stage}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50">
                <span className="text-[10px] text-stone-400 block">Previsão de Colheita</span>
                <span className="font-bold text-emerald-800">{plant.daysToHarvest}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" /> Plantado em {plant.planted}
              </span>
              <span className="font-semibold text-stone-700">{plant.health}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
