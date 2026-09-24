import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Calendar, BarChart3, Users, Loader2 } from 'lucide-react';
import { GardenBed, GardenAlert, EnvironmentMetric } from '../../types/garden';
import { exportReportByType } from '../../utils/generatePdfReport';

interface RelatoriosViewProps {
  beds?: GardenBed[];
  alerts?: GardenAlert[];
  metrics?: EnvironmentMetric[];
  onExportSuccess?: (message: string) => void;
}

export const RelatoriosView: React.FC<RelatoriosViewProps> = ({
  beds = [],
  alerts = [],
  metrics = [],
  onExportSuccess,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleExport = (
    type: 'geral' | 'clima' | 'diario' | 'irrigacao',
    reportTitle: string
  ) => {
    setDownloadingId(type);
    try {
      exportReportByType(type, beds, alerts, metrics);
      if (onExportSuccess) {
        onExportSuccess(`Relatório "${reportTitle}" exportado em PDF com sucesso!`);
      }
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setTimeout(() => {
        setDownloadingId(null);
      }, 1000);
    }
  };

  const reports: Array<{
    id: 'clima' | 'diario' | 'irrigacao';
    title: string;
    category: string;
    date: string;
    size: string;
    status: string;
  }> = [
    {
      id: 'clima',
      title: 'Boletim Semanal de Umidade e Clima - 24/09',
      category: 'Monitoramento IoT',
      date: '24 de Setembro, 2026',
      size: 'PDF Formatado',
      status: 'Gerado automaticamente',
    },
    {
      id: 'diario',
      title: 'Diário de Campo Pedagógico - Turmas do 5º Ano',
      category: 'Atividades Práticas',
      date: '20 de Setembro, 2026',
      size: 'PDF Formatado',
      status: 'Anotações da Professora Fernanda',
    },
    {
      id: 'irrigacao',
      title: 'Histórico de Irrigação e Economia Hídrica (Agosto/Setembro)',
      category: 'Sustentabilidade',
      date: '15 de Setembro, 2026',
      size: 'PDF Formatado',
      status: 'Consumo de 420L poupados',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#236038] uppercase tracking-wider block mb-1">
            DOCUMENTAÇÃO PEDAGÓGICA
          </span>
          <h2 className="text-2xl font-bold text-[#172b1d] tracking-tight">
            Relatórios e Dados da Horta
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Exporte séries históricas de medição e diários escolares para apresentações e feiras de ciências.
          </p>
        </div>

        <button
          onClick={() => handleExport('geral', 'Relatório Consolidado Geral')}
          disabled={downloadingId === 'geral'}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1b4d2a] hover:bg-[#153f22] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer active:scale-95 disabled:opacity-75"
        >
          {downloadingId === 'geral' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>
            {downloadingId === 'geral' ? 'Gerando PDF...' : 'Exportar Relatório Geral'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-stone-200/70 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-400">Leituras Registradas</span>
              <h4 className="text-lg font-bold text-stone-900 tabular-nums">4.820 amostras</h4>
            </div>
          </div>
          <p className="text-[11px] text-stone-500">
            99.8% de uptime da rede de sensores nos últimos 30 dias.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200/70 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-400">Eficiência de Rega</span>
              <h4 className="text-lg font-bold text-stone-900 tabular-nums">92% ideal</h4>
            </div>
          </div>
          <p className="text-[11px] text-stone-500">
            Gotejamento automatizado reduziu desperdício em 38%.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200/70 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-400">Participação Escolar</span>
              <h4 className="text-lg font-bold text-stone-900 tabular-nums">120 alunos</h4>
            </div>
          </div>
          <p className="text-[11px] text-stone-500">
            4 turmas envolvidas na medição e manejo semanal da horta.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] divide-y divide-stone-100">
        {reports.map((report) => {
          const isDownloading = downloadingId === report.id;
          return (
            <div
              key={report.id}
              className="p-4 flex items-center justify-between hover:bg-stone-50/70 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#eef6f0] text-[#1b4d2a] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{report.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                    <span>{report.category}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                    <span>•</span>
                    <span className="text-[#236038] font-medium">{report.size}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleExport(report.id, report.title)}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-[#1b4d2a] hover:bg-[#eef6f0] rounded-xl transition-all border border-stone-200/80 cursor-pointer active:scale-95 disabled:opacity-50"
                title={`Baixar PDF de: ${report.title}`}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1b4d2a]" />
                ) : (
                  <Download className="w-4 h-4 text-[#1b4d2a]" />
                )}
                <span className="hidden sm:inline">Baixar PDF</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

