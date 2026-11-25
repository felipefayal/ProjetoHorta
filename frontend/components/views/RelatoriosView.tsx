import { useState } from 'react';
import { BarChart3, Download, FileText, Loader2, TriangleAlert } from 'lucide-react';
import type { EnvironmentMetric, GardenAlert, GardenBed } from '../../types/garden';
import { exportReportByType } from '../../utils/generatePdfReport';

interface RelatoriosViewProps {
  beds?: GardenBed[];
  alerts?: GardenAlert[];
  metrics?: EnvironmentMetric[];
  author?: string;
  schoolNames?: string[];
  onExportSuccess?: (message: string) => void;
}

const reports = [
  {
    id: 'geral' as const,
    title: 'Relatório consolidado da horta',
    category: 'Canteiros, medições e alertas',
  },
  {
    id: 'clima' as const,
    title: 'Boletim de umidade do solo',
    category: 'Medições registradas',
  },
  {
    id: 'irrigacao' as const,
    title: 'Resumo de irrigação',
    category: 'Última irrigação por canteiro',
  },
];

export const RelatoriosView = ({
  beds = [],
  alerts = [],
  metrics = [],
  author = 'Usuário da plataforma',
  schoolNames = [],
  onExportSuccess,
}: RelatoriosViewProps) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const openAlerts = alerts.filter((alert) => !alert.read).length;

  async function handleExport(
    type: (typeof reports)[number]['id'],
    reportTitle: string,
  ) {
    setDownloadingId(type);
    setReportError(null);
    try {
      await exportReportByType(type, beds, alerts, metrics, author, schoolNames);
      onExportSuccess?.(`Relatório "${reportTitle}" exportado em PDF.`);
    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'Não foi possível gerar o relatório.');
    } finally {
      setDownloadingId(null);
    }
  }

  const stats = [
    { title: 'Canteiros cadastrados', value: beds.length, icon: BarChart3 },
    { title: 'Alertas em aberto', value: openAlerts, icon: TriangleAlert },
    { title: 'Métricas recentes', value: metrics.length, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#236038]">
            DOCUMENTAÇÃO DA HORTA
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-[#172b1d]">
            Relatórios e dados
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Exporte um PDF com os dados atualmente persistidos no banco.
          </p>
        </div>
        <button
          onClick={() => handleExport('geral', reports[0].title)}
          disabled={downloadingId !== null}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-[#1b4d2a] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#153f22] disabled:opacity-60 sm:self-auto"
        >
          {downloadingId === 'geral'
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Download className="h-4 w-4" />}
          Exportar relatório geral
        </button>
      </header>

      {reportError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-white p-3 text-sm text-red-700">
          {reportError}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ title, value, icon: Icon }) => (
          <div key={title} className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-xs">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[11px] text-stone-400">{title}</span>
                <h3 className="text-lg font-bold tabular-nums text-stone-900">{value}</h3>
              </div>
            </div>
            <p className="text-[11px] text-stone-500">Valores lidos da plataforma.</p>
          </div>
        ))}
      </div>

      <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200/70 bg-white shadow-sm">
        {reports.map((report) => (
          <div key={report.id} className="flex items-center justify-between gap-4 p-4 hover:bg-stone-50/70">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef6f0] text-[#1b4d2a]">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-stone-900">{report.title}</h3>
                <p className="mt-0.5 text-[11px] text-stone-500">{report.category}</p>
              </div>
            </div>
            <button
              onClick={() => handleExport(report.id, report.title)}
              disabled={downloadingId !== null}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-stone-200/80 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-[#eef6f0] disabled:opacity-50"
            >
              {downloadingId === report.id
                ? <Loader2 className="h-4 w-4 animate-spin text-[#1b4d2a]" />
                : <Download className="h-4 w-4 text-[#1b4d2a]" />}
              <span className="hidden sm:inline">Gerar PDF</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
