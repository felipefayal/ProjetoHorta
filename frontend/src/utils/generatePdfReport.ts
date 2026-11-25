import { GardenBed, GardenAlert, EnvironmentMetric } from '../types/garden';

interface GenerateReportOptions {
  title?: string;
  subtitle?: string;
  category?: string;
  author?: string;
  schoolNames?: string[];
  beds: GardenBed[];
  alerts?: GardenAlert[];
  metrics?: EnvironmentMetric[];
}

function escapeHtml(value: string | number | null | undefined): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(value ?? '').replace(/[&<>"']/g, (character) => entities[character]);
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar script ${src}`));
    document.head.appendChild(script);
  });
}

function loadLogoImage(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/planta.png';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

async function getJsPDF(): Promise<{ jsPDF: any; autoTable: any }> {
  if ((window as any).jspdf?.jsPDF) {
    return {
      jsPDF: (window as any).jspdf.jsPDF,
      autoTable: (window as any).jspdf?.autoTable || (window as any).autoTable,
    };
  }

  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');

  const jsPDF = (window as any).jspdf?.jsPDF;
  const autoTable = (window as any).jspdf?.autoTable || (window as any).autoTable;
  return { jsPDF, autoTable };
}

export function printReportFallback({
  title = 'RELATÓRIO TÉCNICO DE MONITORAMENTO DA HORTA',
  subtitle = 'Boletim Consolidado de Dados Microclimáticos, Solo e Irrigação',
  author = 'Usuário da plataforma',
  schoolNames = [],
  beds,
  alerts = [],
  metrics = [],
}: GenerateReportOptions) {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR');
  const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const measuredBeds = beds.filter((bed) => bed.status !== 'Atenção');
  const avgMoisture = measuredBeds.length
    ? `${Math.round(measuredBeds.reduce((acc, bed) => acc + bed.moisture, 0) / measuredBeds.length)}%`
    : 'Sem leitura';
  const avgTemp = measuredBeds.length
    ? `${(measuredBeds.reduce((acc, bed) => acc + bed.temperature, 0) / measuredBeds.length).toFixed(1)} °C`
    : 'Sem leitura';
  const bedsNeedingAttention = beds.filter((bed) => bed.status !== 'Normal').length;
  const institutionNames = schoolNames.length ? schoolNames.join(', ') : 'Nenhuma escola cadastrada';
  const effectiveAlerts = alerts.map((alert) => ({
    title: alert.title,
    severity: alert.severity === 'critical' ? 'CRÍTICO' : alert.severity === 'warning' ? 'ATENÇÃO' : 'REGULAR',
    description: alert.description,
    timeAgo: alert.timeAgo,
  }));

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 18mm 18mm 18mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #000000;
      background-color: #ffffff;
      line-height: 1.35;
      font-size: 10pt;
      padding: 8px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .doc-header {
      text-align: center;
      margin-bottom: 14px;
      border-bottom: 2px solid #000000;
      padding-bottom: 10px;
    }

    .logo-container {
      margin-bottom: 4px;
      text-align: center;
    }
    .doc-logo {
      height: 32px;
      max-height: 32px;
      width: auto;
      object-fit: contain;
      display: inline-block;
    }

    .doc-institution {
      font-size: 9.5pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 3px;
    }
    .doc-title {
      font-size: 12.5pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 4px 0 2px 0;
    }
    .doc-subtitle {
      font-size: 9.5pt;
      font-style: italic;
      color: #333333;
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .info-table td {
      border: 1px solid #000000;
      padding: 4px 7px;
      font-size: 9.5pt;
      vertical-align: top;
    }
    .info-table .label {
      font-weight: bold;
      width: 25%;
      background-color: #f2f2f2;
    }

    .section-heading {
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 13px;
      margin-bottom: 5px;
    }

    .word-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .word-table th,
    .word-table td {
      border: 1px solid #000000;
      padding: 4px 6px;
      font-size: 9.5pt;
      text-align: left;
    }
    .word-table th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: center;
    }
    .text-center {
      text-align: center !important;
    }
    .font-bold {
      font-weight: bold;
    }

    .paragraph-text {
      font-size: 10pt;
      text-align: justify;
      text-indent: 1.25cm;
      margin-bottom: 10px;
      line-height: 1.35;
    }

    .signature-section {
      margin-top: 28px;
      page-break-inside: avoid;
      text-align: center;
    }
    .signature-line {
      width: 320px;
      margin: 0 auto;
      border-top: 1px solid #000000;
      padding-top: 5px;
      font-size: 10pt;
      font-weight: bold;
    }
    .signature-title {
      font-size: 9pt;
      font-weight: normal;
      color: #333333;
    }

    .doc-footer {
      margin-top: 20px;
      border-top: 1px solid #666666;
      padding-top: 5px;
      font-size: 8.5pt;
      color: #555555;
      display: flex;
      justify-content: space-between;
    }

    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>

  <div class="doc-header">
    <div class="logo-container">
      <img src="/planta.png" alt="Logo" class="doc-logo" onerror="this.style.display='none'" />
    </div>
    <div class="doc-title">${escapeHtml(title)}</div>
    <div class="doc-subtitle">${escapeHtml(subtitle)}</div>
  </div>

  <table class="info-table">
    <tr>
      <td class="label">Responsável Técnico:</td>
      <td>${escapeHtml(author)}</td>
      <td class="label">Data de Emissão:</td>
      <td>${dateFormatted} às ${timeFormatted}</td>
    </tr>
    <tr>
      <td class="label">Unidade de Ensino:</td>
      <td>${escapeHtml(institutionNames)}</td>
      <td class="label">Total de Canteiros:</td>
      <td>${beds.length} unidades cadastradas</td>
    </tr>
    <tr>
      <td class="label">Média de Umidade do Solo:</td>
      <td>${avgMoisture}</td>
      <td class="label">Canteiros em Atenção:</td>
      <td>${bedsNeedingAttention} canteiro(s) em atenção</td>
    </tr>
  </table>

  <div class="section-heading">1. RESUMO OPERACIONAL E CONDIÇÕES GERAIS</div>
  <p class="paragraph-text">
    Este relatório apresenta os dados atualmente disponíveis no sistema para ${beds.length} canteiro(s).
    Umidade média registrada: ${avgMoisture}; temperatura média registrada: ${avgTemp}.
    Os dados refletem somente as medições recebidas e persistidas no banco até a emissão deste documento.
  </p>

  <div class="section-heading">2. REGISTRO E MONITORAMENTO DOS CANTEIROS</div>
  <table class="word-table">
    <thead>
      <tr>
        <th style="width: 14%;">Identificação</th>
        <th style="width: 20%;">Cultura / Espécie</th>
        <th style="width: 14%;">Umidade (%)</th>
        <th style="width: 15%;">Temperatura</th>
        <th style="width: 17%;">Situação Atual</th>
        <th style="width: 20%;">Última Intervenção</th>
      </tr>
    </thead>
    <tbody>
      ${beds.map((b) => `
        <tr>
          <td class="font-bold">${escapeHtml(b.name)}</td>
          <td>${escapeHtml(b.plantType)}</td>
          <td class="text-center">${escapeHtml(b.status === 'Atenção' ? 'Sem leitura' : `${b.moisture}%`)}</td>
          <td class="text-center">${escapeHtml(b.status === 'Atenção' ? 'Sem leitura' : `${b.temperature} °C`)}</td>
          <td>${escapeHtml(b.status)}</td>
          <td style="font-size: 8.5pt;">${escapeHtml(b.lastWatered ?? 'Sem registro')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="section-heading">3. TELEMETRIA E PARÂMETROS MICROCLIMÁTICOS</div>
  <table class="word-table">
    <thead>
      <tr>
        <th style="width: 30%;">Grandeza Meteorológica</th>
        <th style="width: 20%;">Valor Registrado</th>
        <th style="width: 50%;">Diagnóstico Técnico / Condição Operacional</th>
      </tr>
    </thead>
    <tbody>
      ${metrics.length ? metrics.map((m) => `
        <tr>
          <td class="font-bold">${escapeHtml(m.title)}</td>
          <td class="text-center">${escapeHtml(m.value)}</td>
          <td>${escapeHtml(m.status)}</td>
        </tr>
      `).join('') : '<tr><td colspan="3">Nenhuma medição registrada.</td></tr>'}
    </tbody>
  </table>

  <div class="section-heading">4. REGISTRO DE EVENTOS E OCORRÊNCIAS TÉCNICAS</div>
  <table class="word-table">
    <thead>
      <tr>
        <th style="width: 25%;">Evento Registrado</th>
        <th style="width: 15%;">Gravidade</th>
        <th style="width: 45%;">Descrição Detalhada</th>
        <th style="width: 15%;">Registro</th>
      </tr>
    </thead>
    <tbody>
      ${effectiveAlerts.length ? effectiveAlerts.map((a) => `
        <tr>
          <td class="font-bold">${escapeHtml(a.title)}</td>
          <td class="text-center font-bold">${escapeHtml(a.severity)}</td>
          <td>${escapeHtml(a.description)}</td>
          <td class="text-center" style="font-size: 8.5pt;">${escapeHtml(a.timeAgo)}</td>
        </tr>
      `).join('') : '<tr><td colspan="4">Nenhum alerta registrado.</td></tr>'}
    </tbody>
  </table>

  <div class="section-heading">5. DESPACHO E OBSERVAÇÕES FINAIS</div>
  <p class="paragraph-text">
    Este documento não substitui a inspeção física da horta. Ações de manejo devem ser avaliadas pela equipe responsável
    considerando as condições observadas na instituição.
  </p>

  <div class="signature-section">
    <div class="signature-line">
      ${escapeHtml(author)}<br>
    </div>
  </div>

  <div class="doc-footer">
    <span>Documento Técnico Emitido em ${dateFormatted} às ${timeFormatted}</span>
    <span>Sistema Gerenciador de Horta Inteligente • Página 1 de 1</span>
  </div>
</body>
</html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow?.print();
      } catch {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(htmlContent);
          win.document.close();
        }
      }
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);
    }, 400);
  }
}

export async function generateGardenPDF({
  title = 'RELATÓRIO TÉCNICO DE MONITORAMENTO DA HORTA',
  subtitle = 'Boletim de Dados Solo e Irrigação',
  author = 'Usuário da plataforma',
  schoolNames = [],
  beds,
  alerts = [],
  metrics = [],
}: GenerateReportOptions) {
  try {
    const { jsPDF, autoTable } = await getJsPDF();
    if (jsPDF) {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let currentY = 14;

      const now = new Date();
      const dateFormatted = now.toLocaleDateString('pt-BR');
      const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // LOGO PEQUENINA /planta.png
      try {
        const logoImg = await loadLogoImage();
        if (logoImg) {
          const aspect = (logoImg.width || 1) / (logoImg.height || 1);
          const logoHeight = 9;
          const logoWidth = Math.min(logoHeight * aspect, 22);
          const logoX = (pageWidth - logoWidth) / 2;
          doc.addImage(logoImg, 'PNG', logoX, currentY, logoWidth, logoHeight);
          currentY += logoHeight + 2.5;
        }
      } catch {
        // Fallback silencioso se a imagem não carregar
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      currentY += 5;

      doc.setFontSize(12);
      doc.text(title.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
      currentY += 4.5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(subtitle, pageWidth / 2, currentY, { align: 'center' });
      currentY += 4.5;

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.35);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 4.5;

      const measuredBeds = beds.filter((bed) => bed.status !== 'Atenção');
      const avgMoisture = measuredBeds.length
        ? `${Math.round(measuredBeds.reduce((acc, bed) => acc + bed.moisture, 0) / measuredBeds.length)}%`
        : 'Sem leitura';
      const bedsNeedingAttention = beds.filter((bed) => bed.status !== 'Normal').length;
      const institutionNames = schoolNames.length ? schoolNames.join(', ') : 'Nenhuma escola cadastrada';

      const metaTableOptions = {
        startY: currentY,
        margin: { left: margin, right: margin },
        body: [
          [
            { content: 'Responsável Técnico:', styles: { fontStyle: 'bold', fillColor: [242, 242, 242] } },
            author,
            { content: 'Data de Emissão:', styles: { fontStyle: 'bold', fillColor: [242, 242, 242] } },
            `${dateFormatted} às ${timeFormatted}`,
          ],
          [
            { content: 'Unidade de Ensino:', styles: { fontStyle: 'bold', fillColor: [242, 242, 242] } },
            institutionNames,
            { content: 'Total de Canteiros:', styles: { fontStyle: 'bold', fillColor: [242, 242, 242] } },
            `${beds.length} canteiros cadastrados`,
          ],
          [
            { content: 'Média de Umidade:', styles: { fontStyle: 'bold', fillColor: [242, 242, 242] } },
            avgMoisture,
            { content: 'Canteiros em Atenção:', styles: { fontStyle: 'bold', fillColor: [242, 242, 242] } },
            `${bedsNeedingAttention} unidade(s) em atenção`,
          ],
        ],
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 1.6,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 38 },
          1: { cellWidth: 49 },
          2: { cellWidth: 38 },
          3: { cellWidth: 49 },
        },
      };

      if (typeof (doc as any).autoTable === 'function') {
        (doc as any).autoTable(metaTableOptions);
      } else if (typeof autoTable === 'function') {
        autoTable(doc, metaTableOptions);
      }

      currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 5 : currentY + 23;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(0, 0, 0);
      doc.text('1. RESUMO OPERACIONAL E CONDIÇÕES GERAIS', margin, currentY);
      currentY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const summaryText = `Este relatório apresenta os dados atualmente disponíveis para ${beds.length} canteiro(s). Umidade média registrada: ${avgMoisture}. Os dados refletem somente as medições recebidas e persistidas no banco até a emissão deste documento.`;
      const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
      doc.text(splitSummary, margin, currentY);
      currentY += splitSummary.length * 3.8 + 3.5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('2. REGISTRO E MONITORAMENTO DOS CANTEIROS', margin, currentY);
      currentY += 2.8;

      const bedRows = beds.map((b) => [
        b.name,
        b.plantType,
        b.status === 'Atenção' ? 'Sem leitura' : `${b.moisture}%`,
        b.status === 'Atenção' ? 'Sem leitura' : `${b.temperature} °C`,
        b.status,
        b.lastWatered ?? 'Sem registro',
      ]);

      const bedTableOptions = {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['Canteiro', 'Cultura / Espécie', 'Umidade', 'Temperatura', 'Situação', 'Última Irrigação']],
        body: bedRows,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 7.8,
          cellPadding: 1.6,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [242, 242, 242],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          lineColor: [0, 0, 0],
          lineWidth: 0.25,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 26 },
          1: { cellWidth: 38 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'center', cellWidth: 24 },
          4: { cellWidth: 32 },
          5: { cellWidth: 'auto' },
        },
      };

      if (typeof (doc as any).autoTable === 'function') {
        (doc as any).autoTable(bedTableOptions);
      } else if (typeof autoTable === 'function') {
        autoTable(doc, bedTableOptions);
      }

      currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : currentY + 28;

      if (currentY > pageHeight - 32) {
        doc.addPage();
        currentY = 22;
      }

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line((pageWidth - 85) / 2, currentY, (pageWidth + 85) / 2, currentY);
      currentY += 4;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(author, pageWidth / 2, currentY, { align: 'center' });
      currentY += 3.8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Coordenação do Projeto Horta Escolar Sustentável', pageWidth / 2, currentY, { align: 'center' });

      doc.save(`relatorio_horta_${now.toISOString().slice(0, 10)}.pdf`);
      return;
    }
  } catch (err) {
    console.warn('Fallback acionado:', err);
  }

  printReportFallback({ title, subtitle, author, schoolNames, beds, alerts, metrics });
}

export function exportReportByType(
  type: 'geral' | 'clima' | 'diario' | 'irrigacao',
  beds: GardenBed[],
  alerts: GardenAlert[] = [],
  metrics: EnvironmentMetric[] = [],
  author = 'Usuário da plataforma',
  schoolNames: string[] = [],
): Promise<void> {
  switch (type) {
    case 'clima':
      return generateGardenPDF({
        title: 'BOLETIM TÉCNICO DE UMIDADE DO SOLO',
        author,
        schoolNames,
        beds,
        alerts,
        metrics,
      });
      break;

    case 'diario':
      return generateGardenPDF({
        title: 'DIÁRIO DE CAMPO PEDAGÓGICO - 5º ANO',
        author,
        schoolNames,
        beds,
        alerts,
        metrics,
      });
      break;

    case 'irrigacao':
      return generateGardenPDF({
        title: 'RELATÓRIO TÉCNICO DE IRRIGAÇÃO E EFICIÊNCIA HÍDRICA',
        author,
        schoolNames,
        beds,
        alerts,
        metrics,
      });
      break;

    case 'geral':
    default:
      return generateGardenPDF({
        title: 'RELATÓRIO CONSOLIDADO DA HORTA ESCOLAR',
        author,
        schoolNames,
        beds,
        alerts,
        metrics,
      });
      break;
  }
}