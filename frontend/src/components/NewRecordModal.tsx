import React, { useState } from 'react';
import { X, Sprout, Droplets, Check, Thermometer, Calendar } from 'lucide-react';
import { GardenBed } from '../types/garden';

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  beds: GardenBed[];
  onSubmitRecord: (record: {
    bedId: string;
    type: string;
    moisture: number;
    temperature: number;
    notes: string;
    plantName?: string;
  }) => void;
}

export const NewRecordModal: React.FC<NewRecordModalProps> = ({
  isOpen,
  onClose,
  beds,
  onSubmitRecord,
}) => {
  const [selectedBedId, setSelectedBedId] = useState(beds[0]?.id || 'c1');
  const [recordType, setRecordType] = useState('irrigacao');
  const [moisture, setMoisture] = useState(65);
  const [temperature, setTemperature] = useState(26.5);
  const [notes, setNotes] = useState('');
  const [newPlantName, setNewPlantName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRecord({
      bedId: selectedBedId,
      type: recordType,
      moisture,
      temperature,
      notes,
      plantName: newPlantName.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-[#fbfdfa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eef7f0] text-[#1b5d32] flex items-center justify-center border border-[#d2ecd7]">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#183020]">Novo Registro na Horta</h2>
              <p className="text-xs text-stone-500">
                Adicione medições, regas ou novos plantios
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action Type */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Tipo de Atividade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'irrigacao', label: 'Irrigação' },
                { id: 'plantio', label: 'Novo Plantio' },
                { id: 'leitura', label: 'Medição Manual' },
              ].map((t) => (
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

          {/* Canteiro Selector */}
          <div>
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
          </div>

          {recordType === 'plantio' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Nome da Nova Planta / Cultura
              </label>
              <input
                type="text"
                placeholder="Ex: Rabanete, Hortelã, Alecrim..."
                value={newPlantName}
                onChange={(e) => setNewPlantName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e5833]/20"
                required
              />
            </div>
          )}

          {/* Dual Sliders: Moisture & Temperature */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" /> Umidade
                </span>
                <span className="font-bold text-stone-900 tabular-nums">{moisture}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={moisture}
                onChange={(e) => setMoisture(Number(e.target.value))}
                className="w-full accent-[#1e5833] cursor-pointer"
              />
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-600" /> Temperatura
                </span>
                <span className="font-bold text-stone-900 tabular-nums">
                  {temperature.toFixed(1)}°C
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="38"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-[#1e5833] cursor-pointer"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Observações Pedagógicas / Manutenção
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Turma do 5º ano participou da adubação orgânica e remoção de ervas daninhas..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e5833]/20"
            />
          </div>

          {/* Buttons */}
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
              className="px-5 py-2.5 bg-[#1b4d2a] hover:bg-[#153f22] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
