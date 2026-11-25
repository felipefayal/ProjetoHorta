import { Leaf, Plus } from 'lucide-react';
import type { GardenBed } from '../../types/garden';

interface PlantasViewProps {
  beds: GardenBed[];
  onOpenNewRecord: () => void;
}

export const PlantasView = ({ beds, onOpenNewRecord }: PlantasViewProps) => {
  const plantedBeds = beds.filter((bed) => bed.plant !== 'Não cadastrada');

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#236038]">
            CATÁLOGO BOTÂNICO
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-[#172b1d]">
            Plantas nos canteiros
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Espécies lidas do relacionamento entre canteiros e tipos de planta.
          </p>
        </div>
        <button
          onClick={onOpenNewRecord}
          disabled={beds.length === 0}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-[#1b4d2a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#153f22] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Alterar planta de um canteiro
        </button>
      </header>

      {plantedBeds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
          Não há plantas associadas aos canteiros cadastrados.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plantedBeds.map((bed) => (
            <article
              key={bed.id}
              className="space-y-4 rounded-2xl border border-stone-200/70 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d2edd6] bg-[#ecf5ee] text-[#1e5d34]">
                  <Leaf className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#183020]">{bed.plant}</h3>
                  <p className="text-xs text-stone-500">{bed.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-stone-100 pt-4 text-xs">
                <div>
                  <span className="block text-stone-400">Umidade do solo</span>
                  <strong className="text-stone-800">
                    {bed.status === 'Atenção' ? 'Sem leitura' : `${bed.moisture}%`}
                  </strong>
                </div>
                <div>
                  <span className="block text-stone-400">Status do canteiro</span>
                  <strong className="text-stone-800">{bed.status}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
