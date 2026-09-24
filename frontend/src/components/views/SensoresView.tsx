import React from 'react';
import { Sliders, BatteryCharging, Wifi, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const SensoresView: React.FC = () => {
  const sensorNodes = [
    {
      id: 'SN-01',
      location: 'Canteiro 01 (Tomate)',
      type: 'Sensor Capacitivo de Solo + NTC',
      battery: '94%',
      signal: '-68 dBm (Forte)',
      lastSync: 'Há 2 min',
      status: 'Operacional',
    },
    {
      id: 'SN-02',
      location: 'Canteiro 02 (Alface)',
      type: 'Sensor Capacitivo de Solo + NTC',
      battery: '88%',
      signal: '-71 dBm (Forte)',
      lastSync: 'Há 4 min',
      status: 'Operacional',
    },
    {
      id: 'SN-03',
      location: 'Canteiro 03 (Cenoura)',
      type: 'Sensor Capacitivo de Solo + NTC',
      battery: '91%',
      signal: '-65 dBm (Forte)',
      lastSync: 'Há 1 min',
      status: 'Alerta de Umidade',
    },
    {
      id: 'SN-04',
      location: 'Estação Central Meteorológica',
      type: 'BME280 + LDR Lux + Pluviômetro',
      battery: '100% (Solar)',
      signal: '-55 dBm (Excelente)',
      lastSync: 'Em tempo real',
      status: 'Operacional',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#236038] uppercase tracking-wider block mb-1">
            TELEMETRIA E REDE IOT
          </span>
          <h2 className="text-2xl font-bold text-[#172b1d] tracking-tight">
            Sensores e Hardware de Campo
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Status de bateria, sinal LoRa/Wi-Fi e calibração dos nós de medição da horta escolar.
          </p>
        </div>

        <button
          onClick={() => alert('Sinal de sincronização enviado aos módulos IoT!')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sincronizar Nós</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/70 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-100 text-stone-400 font-semibold">
                <th className="py-3.5 px-4">Identificador</th>
                <th className="py-3.5 px-4">Localização</th>
                <th className="py-3.5 px-4">Bateria</th>
                <th className="py-3.5 px-4">Sinal</th>
                <th className="py-3.5 px-4">Última Transmissão</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sensorNodes.map((node) => (
                <tr key={node.id} className="hover:bg-stone-50/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                    {node.id}
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 font-medium">
                    {node.location}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <BatteryCharging className="w-4 h-4 text-emerald-600" /> {node.battery}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Wifi className="w-4 h-4 text-sky-600" /> {node.signal}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">{node.lastSync}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold ${
                        node.status === 'Operacional'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {node.status === 'Operacional' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      {node.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
