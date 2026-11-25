import { Building2, Cpu, MapPin, Phone } from 'lucide-react';
import type { School } from '../../types/garden';

interface EscolasViewProps {
  schools: School[];
}

export function EscolasView({ schools }: EscolasViewProps) {
  return (
    <section className="space-y-6">
      <header>
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#236038]">
          REDE DE HORTAS ESCOLARES
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-[#172b1d]">Escolas</h2>
        <p className="mt-1 text-xs text-stone-500">
          Instituições e dispositivos vinculados no banco de dados.
        </p>
      </header>

      {schools.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
          Nenhuma escola cadastrada. Execute a migração de preparação do banco.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {schools.map((school) => (
            <article
              key={school.id}
              className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d2ecd7] bg-[#eef7f0] text-[#1e5c34]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[#183020]">{school.name}</h3>
                  {school.address && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-stone-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {school.address}
                    </p>
                  )}
                  {school.phone && (
                    <p className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {school.phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5 border-t border-stone-100 pt-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-stone-600">
                  <Cpu className="h-4 w-4 text-emerald-700" />
                  Dispositivos ({school.devices.length})
                </p>
                {school.devices.length ? (
                  <ul className="space-y-1 text-sm text-stone-700">
                    {school.devices.map((device) => (
                      <li key={device.id}>
                        #{device.id} — {device.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-400">Nenhum dispositivo vinculado.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
