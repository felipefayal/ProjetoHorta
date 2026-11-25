import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  Database,
  Save,
  School,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import type { School as SchoolType, SensorDevice, UserProfile } from '../../types/garden';

interface SensoresViewProps {
  user: UserProfile;
  devices: SensorDevice[];
  schools: SchoolType[];
  onAssignDevice: (deviceId: number, schoolId: number) => Promise<void>;
}

export const SensoresView = ({
  user,
  devices,
  schools,
  onAssignDevice,
}: SensoresViewProps) => {
  const isAdmin = user.profile === 'admin';
  const [schoolChoices, setSchoolChoices] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function saveAssignment(device: SensorDevice) {
    const schoolId = Number(schoolChoices[device.id]);
    if (!schoolId) return;
    setSavingId(device.id);
    setMessage(null);
    try {
      await onAssignDevice(device.id, schoolId);
      setSchoolChoices((current) => ({ ...current, [device.id]: '' }));
      setMessage(`Dispositivo #${device.id} vinculado à escola selecionada.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível vincular o dispositivo.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#236038]">
          TELEMETRIA E REDE IOT
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-[#172b1d]">
          Sensores e dispositivos
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Estado e escolas vinculadas aos dispositivos cadastrados no banco.
        </p>
      </header>

      {isAdmin && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#cde6d3] bg-[#eef7f0] p-4 text-xs text-[#194729]">
          <ShieldCheck className="h-5 w-5 shrink-0 text-[#1e6b39]" />
          <div>
            <strong className="block">Modo Administrador</strong>
            <span>Você pode vincular um dispositivo a mais de uma escola.</span>
          </div>
        </div>
      )}

      {message && (
        <p role="status" className="rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-700">
          {message}
        </p>
      )}

      <section aria-labelledby="sensor-data-heading" className="space-y-3">
        <div>
          <h3 id="sensor-data-heading" className="text-sm font-bold text-[#172b1d]">
            Como os dados do sensor funcionam
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            Cada dispositivo é identificado uma única vez; as medições guardam o histórico desse dispositivo.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-stone-200/70 bg-white p-4">
            <h4 className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <Database className="h-4 w-4 text-emerald-700" />
              Tabela dispositivo
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              Guarda o cadastro do sensor. <code>id_dispositivo</code> identifica o equipamento;
              nome e localização ajudam a reconhecê-lo; status indica se está ativo; bateria é
              exibida em porcentagem; e sinal registra a intensidade da conexão.
            </p>
          </article>
          <article className="rounded-2xl border border-stone-200/70 bg-white p-4">
            <h4 className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <Activity className="h-4 w-4 text-sky-700" />
              Tabela medicao
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              Cada linha é uma leitura no horário registrado em <code>data_hora</code> e aponta
              para o sensor por <code>id_dispositivo</code>. Umidade do solo e do ar são mostradas
              em %, temperatura em °C e luminosidade conforme o valor recebido.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-800">
              <Sun className="h-3.5 w-3.5" />
              Neste sensor, luminosidade 0 significa Com Luz; 1 significa Sem Luz.
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
              Outros valores de luminosidade são apresentados como recebidos, sem conversão de
              unidade, pois a calibração do sensor não foi informada.
            </p>
          </article>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 font-semibold text-stone-500">
                <th className="px-4 py-3.5">Dispositivo</th>
                <th className="px-4 py-3.5">Escolas vinculadas</th>
                <th className="px-4 py-3.5">Localização</th>
                <th className="px-4 py-3.5">Bateria</th>
                <th className="px-4 py-3.5">Status</th>
                {isAdmin && <th className="px-4 py-3.5 text-right">Vincular escola</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {devices.map((device) => (
                <tr key={device.id} className="hover:bg-stone-50/50">
                  <td className="px-4 py-3.5 font-mono font-bold text-stone-800">
                    #{device.id} • {device.nome}
                  </td>
                  <td className="px-4 py-3.5 text-stone-700">
                    {device.schools.length
                      ? device.schools.map((school) => school.name).join(', ')
                      : 'Sem escola vinculada'}
                  </td>
                  <td className="px-4 py-3.5 text-stone-600">{device.localizacao || '—'}</td>
                  <td className="px-4 py-3.5 text-stone-600">
                    {device.bateria == null ? '—' : (
                      <span className="inline-flex items-center gap-1.5">
                        <BatteryCharging className="h-3.5 w-3.5 text-emerald-600" />
                        {device.bateria}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold ${device.status ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {device.status
                        ? <><CheckCircle2 className="h-3.5 w-3.5" /> Ativo</>
                        : <><AlertTriangle className="h-3.5 w-3.5" /> Offline</>}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-2">
                        <select
                          aria-label={`Escola para o dispositivo ${device.id}`}
                          value={schoolChoices[device.id] ?? ''}
                          onChange={(event) => setSchoolChoices((current) => ({
                            ...current,
                            [device.id]: event.target.value,
                          }))}
                          className="max-w-48 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs"
                        >
                          <option value="">Selecione uma escola</option>
                          {schools.map((school) => (
                            <option key={school.id} value={school.id}>
                              {school.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => saveAssignment(device)}
                          disabled={!schoolChoices[device.id] || savingId === device.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1b4d2a] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {savingId === device.id ? 'Salvando...' : 'Vincular'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {devices.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-stone-500">
                    Nenhum dispositivo cadastrado no banco de dados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs text-stone-500">
        <School className="mt-0.5 h-4 w-4 shrink-0" />
        Um dispositivo físico pode estar vinculado a várias escolas; a vinculação não duplica seu ID.
      </p>
    </div>
  );
};
