import React, { useEffect, useState } from 'react';
import { X, Sprout, Check } from 'lucide-react';
import type { GardenBed, GardenRecordDraft } from '../types/garden';

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  beds: GardenBed[];
  onSubmitRecord: (record: GardenRecordDraft) => Promise<boolean>;
}

const RECORD_TYPES: { id: GardenRecordDraft['type']; label: string }[] = [
  { id: 'irrigacao', label: 'Registrar Irrigação' },
  { id: 'plantio', label: 'Alterar Planta' },
];

export const NewRecordModal: React.FC<NewRecordModalProps> = ({
  isOpen,
  onClose,
  beds,
  onSubmitRecord,
}) => {
  const [selectedBedId, setSelectedBedId] = useState<string>(beds[0]?.id || '');
  const [recordType, setRecordType] = useState<GardenRecordDraft['type']>('irrigacao');
  const [newPlantName, setNewPlantName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedBedId && beds.length > 0) setSelectedBedId(beds[0].id);
  }, [beds, selectedBedId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const saved = await onSubmitRecord({
        bedId: selectedBedId,
        type: recordType,
        plantName: newPlantName.trim() || undefined,
      });
      if (saved) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-[#fbfdfa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eef7f0] text-[#1b5d32] flex items-center justify-center border border-[#d2ecd7]">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#183020]">Novo Registro Operacional</h2>
              <p className="text-xs text-stone-500">
                Registre irrigações ou atualize a cultura do canteiro
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Tipo de Ação
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RECORD_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setRecordType(t.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                    recordType === t.id
                      ? 'bg-[#1e5833] text-white border-[#1e5833] shadow-xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {beds.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              Cadastre um canteiro no banco antes de registrar uma ação.
            </p>
          ) : <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Canteiro
            </label>
            <select
              value={selectedBedId}
              onChange={(e) => setSelectedBedId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e5833]/20"
            >
              {beds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.plant} ({b.status})
                </option>
              ))}
            </select>
          </div>}

          {recordType === 'plantio' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Nome da Nova Planta
              </label>
              <input
                type="text"
                placeholder="Ex: Tomate, Alface, Cenoura..."
                value={newPlantName}
                onChange={(e) => setNewPlantName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e5833]/20"
                required
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || beds.length === 0}
              className="px-5 py-2.5 bg-[#1b4d2a] hover:bg-[#153f22] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};