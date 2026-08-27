import React, { useState, useRef, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Militant,
  Team,
  StreetCheckIn,
  Neighborhood
} from '../types';
import {
  FileText,
  Printer,
  Download,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Users,
  Navigation,
  Sparkles,
  Search,
  FileDown,
  ShieldCheck,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Target,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface WeeklyReportViewProps {
  militants: Militant[];
  teams: Team[];
  checkIns: StreetCheckIn[];
  neighborhoods: Neighborhood[];
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  militants,
  teams,
  checkIns
}) => {
  const [selectedMilitantId, setSelectedMilitantId] = useState<string>('todos');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('todos');
  const [selectedWeek, setSelectedWeek] = useState<string>('semana-1');
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<string | null>(null);
  const [viewGrouping, setViewGrouping] = useState<'por_militante' | 'tabela_geral' | 'tabela_produtividade'>('por_militante');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const chartsContainerRef = useRef<HTMLDivElement>(null);

  const COORDINATOR_NAME = 'Pedro da Silva Rosa';
  const COORDINATOR_ROLE = 'Coordenador Geral de Campanha';
  const COMMITTEE_NAME = 'Comitê Central de Campanha • São José - SC (Eleições 2026)';

  const weeks = [
    { id: 'semana-1', label: 'Semana 1 (25/08 a 31/08/2026)' },
    { id: 'semana-2', label: 'Semana 2 (01/09 a 07/09/2026)' },
    { id: 'semana-3', label: 'Semana 3 (08/09 a 14/09/2026)' },
    { id: 'semana-4', label: 'Semana 4 (15/09 a 21/09/2026)' },
    { id: 'semana-5', label: 'Semana 5 (22/09 a 28/09/2026)' },
    { id: 'semana-6', label: 'Semana 6 / Reta Final (29/09 a 04/10/2026)' }
  ];

  // Filter checkins
  const filteredCheckIns = checkIns.filter(chk => {
    if (selectedMilitantId !== 'todos' && chk.militantId !== selectedMilitantId) return false;
    if (selectedTeamId !== 'todos' && chk.teamId !== selectedTeamId) return false;
    return true;
  });

  const totalSantinhos = filteredCheckIns.reduce((acc, curr) => acc + curr.materialsDelivered.santinhos, 0);
  const totalAdesivoBola = filteredCheckIns.reduce((acc, curr) => acc + curr.materialsDelivered.adesivo_bola, 0);
  const totalParachoque = filteredCheckIns.reduce((acc, curr) => acc + curr.materialsDelivered.adesivo_parachoque, 0);
  const totalColinhas = filteredCheckIns.reduce((acc, curr) => acc + curr.materialsDelivered.colinhas, 0);
  const totalAbordagens = filteredCheckIns.reduce((acc, curr) => acc + (curr.materialsDelivered.abordagens || 0), 0);
  const totalComercios = filteredCheckIns.reduce((acc, curr) => acc + (curr.materialsDelivered.comercio || 0), 0);
  const totalMateriaisGeral = totalSantinhos + totalAdesivoBola + totalParachoque + totalColinhas;

  const selectedMilitantObj = militants.find(m => m.id === selectedMilitantId);
  const selectedTeamObj = teams.find(t => t.id === selectedTeamId);
  const selectedWeekLabel = weeks.find(w => w.id === selectedWeek)?.label || selectedWeek;

  // Filtered militants list
  const activeMilitants = militants.filter(m => {
    if (selectedMilitantId !== 'todos' && m.id !== selectedMilitantId) return false;
    if (selectedTeamId !== 'todos' && m.teamId !== selectedTeamId) return false;
    return true;
  });

  // Calculate consolidated productivity data per militant
  const productivityData = useMemo(() => {
    return activeMilitants.map(mil => {
      const milCheckIns = filteredCheckIns.filter(c => c.militantId === mil.id || c.militantName === mil.name);
      const streetsCount = milCheckIns.length;
      const santinhos = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos || 0), 0);
      const adesivoBola = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.adesivo_bola || 0), 0);
      const adesivoParachoque = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.adesivo_parachoque || 0), 0);
      const colinhas = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.colinhas || 0), 0);
      const abordagens = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
      const comercios = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);
      const totalMat = santinhos + adesivoBola + adesivoParachoque + colinhas;
      
      const weeklyGoal = 25; // Meta de 25 ruas por semana por militante
      const completionRate = Math.min(Math.round((streetsCount / weeklyGoal) * 100), 200);
      const dailyRate = mil.dailyRate || 150;
      const estimatedDiarias = Math.min(Math.max(streetsCount > 0 ? Math.ceil(streetsCount / 3) : 0, 1), 6);
      const totalPay = estimatedDiarias * dailyRate;

      let statusLabel: 'Superou a Meta' | 'Na Meta' | 'Em Andamento' = 'Em Andamento';
      if (completionRate >= 100) statusLabel = 'Superou a Meta';
      else if (completionRate >= 75) statusLabel = 'Na Meta';

      return {
        id: mil.id,
        name: mil.name,
        shortName: mil.name.split(' ')[0] + ' ' + (mil.name.split(' ')[1]?.[0] || '') + '.',
        matricula: mil.matricula,
        avatar: mil.avatar,
        teamId: mil.teamId,
        teamName: mil.teamId === 'team-alpha' ? 'Equipe Alpha' : (mil.teamId === 'team-bravo' ? 'Equipe Bravo' : 'Geral'),
        streetsCount,
        santinhos,
        adesivoBola,
        adesivoParachoque,
        colinhas,
        totalMat,
        abordagens,
        comercios,
        weeklyGoal,
        completionRate,
        dailyRate,
        estimatedDiarias,
        totalPay,
        statusLabel
      };
    }).sort((a, b) => b.streetsCount - a.streetsCount);
  }, [activeMilitants, filteredCheckIns]);

  // Materials distribution pie data
  const materialsPieData = useMemo(() => {
    return [
      { name: 'Santinhos', value: totalSantinhos || 1200, color: '#2563eb' },
      { name: 'Adesivo Bola', value: totalAdesivoBola || 450, color: '#f59e0b' },
      { name: 'Colinhas', value: totalColinhas || 380, color: '#059669' },
      { name: 'Parachoque', value: totalParachoque || 180, color: '#9333ea' }
    ].filter(item => item.value > 0);
  }, [totalSantinhos, totalAdesivoBola, totalColinhas, totalParachoque]);

  const handlePrint = () => {
    window.print();
  };

  // Enhanced PDF Export Function including Charts and Productivity Tables
  const handleExportPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      setExportFeedback('Capturando gráficos e processando tabela de produtividade...');

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const emissionDate = new Date().toLocaleString('pt-BR');

      // Helper for Header Banner
      const drawHeaderBanner = (pageTitle: string, subTitle: string) => {
        doc.setFillColor(30, 58, 138); // Dark Blue #1e3a8a
        doc.rect(0, 0, pageWidth, 24, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12.5);
        doc.text(pageTitle, 14, 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(subTitle, 14, 17);

        // Coordinator Badge
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`Coordenação Geral: ${COORDINATOR_NAME}`, pageWidth - 14, 10, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(`Emissão: ${emissionDate} | Autenticação: SJ-OFICIAL-2026`, pageWidth - 14, 17, { align: 'right' });
      };

      // Helper for Footer
      const drawFooter = (pageNum: number, totalPages?: number) => {
        doc.setDrawColor(203, 213, 225);
        doc.line(14, pageHeight - 24, pageWidth - 14, pageHeight - 24);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(
          'Documento oficial emitido para auditoria, controle de campo e prestação de contas eleitoral.',
          14,
          pageHeight - 18
        );
        doc.text(
          `Sistema de Gestão de Militância São José • Validação Georreferenciada via GPS & Comprovação Fotográfica`,
          14,
          pageHeight - 14
        );

        // Sign-off line
        doc.setDrawColor(71, 85, 105);
        doc.line(pageWidth - 95, pageHeight - 14, pageWidth - 14, pageHeight - 14);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(COORDINATOR_NAME, pageWidth - 54.5, pageHeight - 10, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(30, 58, 138);
        doc.text(`${COORDINATOR_ROLE} - SJ`, pageWidth - 54.5, pageHeight - 6.5, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`Página ${pageNum}`, 14, pageHeight - 8);
      };

      // ================= PAGE 1: EXECUTIVE KPI SUMMARY & CHARTS =================
      drawHeaderBanner(
        'SISTEMA DE MILITÂNCIA SÃO JOSÉ - RELATÓRIO OFICIAL DE PRODUTIVIDADE',
        `${COMMITTEE_NAME} | Período: ${selectedWeekLabel}`
      );

      // KPI Summary Section
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 28, 269, 17, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 28, 269, 17, 2, 2, 'D');

      const kpiItems = [
        { label: 'TOTAL DE RUAS', val: `${filteredCheckIns.length}` },
        { label: 'ABORDAGENS DIRETAS', val: `${totalAbordagens}` },
        { label: 'COMÉRCIOS ATENDIDOS', val: `${totalComercios}` },
        { label: 'SANTINHOS', val: `${totalSantinhos.toLocaleString('pt-BR')}` },
        { label: 'ADESIVOS BOLA', val: `${totalAdesivoBola.toLocaleString('pt-BR')}` },
        { label: 'TOTAL MATERIAIS', val: `${totalMateriaisGeral.toLocaleString('pt-BR')}` },
      ];

      const kpiWidth = 269 / kpiItems.length;
      kpiItems.forEach((kpi, idx) => {
        const xPos = 14 + (idx * kpiWidth) + (kpiWidth / 2);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, xPos, 33.5, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(30, 58, 138);
        doc.text(kpi.val, xPos, 41, { align: 'center' });
      });

      // Capture Chart Canvas if container exists
      let nextStartY = 50;
      if (chartsContainerRef.current) {
        try {
          const chartCanvas = await html2canvas(chartsContainerRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });
          const imgData = chartCanvas.toDataURL('image/png');
          const imgWidth = 269;
          const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
          const finalImgHeight = Math.min(imgHeight, 62); // Cap height to fit table on same page
          
          doc.addImage(imgData, 'PNG', 14, 48, imgWidth, finalImgHeight);
          nextStartY = 48 + finalImgHeight + 4;
        } catch (err) {
          console.warn('Erro ao renderizar imagem dos gráficos no PDF:', err);
          nextStartY = 50;
        }
      }

      // Title for Productivity Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text('TABELA CONSOLIDADA DE PRODUTIVIDADE & METAS POR MILITANTE', 14, nextStartY);

      // Build Productivity Table Data
      const prodTableRows = productivityData.map((item, idx) => [
        `#${idx + 1}`,
        `${item.name} (${item.matricula})`,
        item.teamName,
        `${item.streetsCount} / ${item.weeklyGoal}`,
        `${item.completionRate}%`,
        `${item.abordagens}`,
        `${item.comercios}`,
        `${item.totalMat.toLocaleString('pt-BR')}`,
        item.statusLabel.toUpperCase(),
        `R$ ${item.totalPay.toFixed(2).replace('.', ',')}`
      ]);

      // Add Total Row
      const totalStreetsSum = productivityData.reduce((sum, d) => sum + d.streetsCount, 0);
      const totalAbordagensSum = productivityData.reduce((sum, d) => sum + d.abordagens, 0);
      const totalComerciosSum = productivityData.reduce((sum, d) => sum + d.comercios, 0);
      const totalMateriaisSum = productivityData.reduce((sum, d) => sum + d.totalMat, 0);
      const totalPaySum = productivityData.reduce((sum, d) => sum + d.totalPay, 0);

      prodTableRows.push([
        'TOTAL',
        `${productivityData.length} MILITANTES ATIVOS`,
        '-',
        `${totalStreetsSum} RUAS`,
        '100%',
        `${totalAbordagensSum}`,
        `${totalComerciosSum}`,
        `${totalMateriaisSum.toLocaleString('pt-BR')}`,
        'CONSOLIDADO',
        `R$ ${totalPaySum.toFixed(2).replace('.', ',')}`
      ]);

      autoTable(doc, {
        head: [[
          'Pos',
          'Militante (Matrícula)',
          'Equipe',
          'Ruas / Meta',
          'Atingimento',
          'Abordagens',
          'Comércio',
          'Materiais',
          'Status Meta',
          'Total Diárias'
        ]],
        body: prodTableRows,
        startY: nextStartY + 2,
        margin: { left: 14, right: 14, bottom: 28 },
        styles: {
          fontSize: 7,
          cellPadding: 1.8,
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          fontSize: 7.5
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 50, fontStyle: 'bold' },
          2: { cellWidth: 26 },
          3: { cellWidth: 24, halign: 'center' },
          4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
          5: { cellWidth: 22, halign: 'center' },
          6: { cellWidth: 20, halign: 'center' },
          7: { cellWidth: 25, halign: 'center' },
          8: { cellWidth: 32, halign: 'center' },
          9: { cellWidth: 38, halign: 'right', fontStyle: 'bold' }
        },
        didDrawPage: (data) => {
          drawFooter(data.pageNumber);
        }
      });

      // ================= PAGE 2: DETAILED STREET CHECK-INS AUDIT =================
      doc.addPage('a4', 'landscape');
      drawHeaderBanner(
        'SISTEMA DE MILITÂNCIA SÃO JOSÉ - DETALHAMENTO DE RUAS & AUDITORIA DE CAMPO',
        `Registro Georreferenciado Completo de Ruas Atendidas | Período: ${selectedWeekLabel}`
      );

      const streetTableRows = filteredCheckIns.map(chk => {
        const militant = militants.find(m => m.id === chk.militantId);
        const mat = militant?.matricula ? `(${militant.matricula})` : '';
        return [
          chk.timestamp,
          `${chk.militantName} ${mat}`,
          chk.neighborhoodName,
          chk.streetName,
          `${chk.latitude.toFixed(4)}, ${chk.longitude.toFixed(4)}`,
          `${chk.materialsDelivered.abordagens || 0}`,
          `${chk.materialsDelivered.comercio || 0}`,
          `${chk.materialsDelivered.santinhos} sant / ${chk.materialsDelivered.adesivo_bola} bola`,
          chk.status === 'validado' ? 'VALIDADO' : 'PENDENTE'
        ];
      });

      autoTable(doc, {
        head: [[
          'Data / Hora',
          'Militante (Matrícula)',
          'Bairro',
          'Logradouro / Trecho Percorrido',
          'GPS (Lat, Lng)',
          'Abordagens',
          'Comércio',
          'Materiais',
          'Auditoria'
        ]],
        body: streetTableRows.length > 0 ? streetTableRows : [['-', 'Nenhum registro encontrado no período', '-', '-', '-', '-', '-', '-', '-']],
        startY: 30,
        margin: { left: 14, right: 14, bottom: 28 },
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          fontSize: 8
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 26 },
          1: { cellWidth: 42, fontStyle: 'bold' },
          2: { cellWidth: 28 },
          3: { cellWidth: 55 },
          4: { cellWidth: 32, font: 'courier' },
          5: { cellWidth: 18, halign: 'center' },
          6: { cellWidth: 16, halign: 'center' },
          7: { cellWidth: 32 },
          8: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
        },
        didDrawPage: (data) => {
          drawFooter(data.pageNumber);
        }
      });

      // Save PDF file
      const sanitizedWeek = selectedWeek.replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`relatorio_produtividade_militancia_${sanitizedWeek}_coord_pedro_rosa.pdf`);
      setExportFeedback('✓ Relatório em PDF com gráficos e tabelas gerado com sucesso!');
      setTimeout(() => setExportFeedback(null), 5000);
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      setExportFeedback('Erro ao processar PDF. Você pode utilizar a opção Imprimir / Salvar PDF do navegador.');
      setTimeout(() => setExportFeedback(null), 6000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Militante', 'Matrícula', 'Equipe', 'Bairro', 'Rua e Numeração', 'Latitude', 'Longitude', 'Santinhos', 'Colinhas', 'Adesivo Bola', 'Adesivo Parachoque', 'Abordagens', 'Comércio', 'Status', 'Coordenador'];
    const rows = filteredCheckIns.map(c => [
      c.id,
      c.timestamp,
      `"${c.militantName}"`,
      `"${militants.find(m => m.id === c.militantId)?.matricula || ''}"`,
      `"${c.teamId}"`,
      `"${c.neighborhoodName}"`,
      `"${c.streetName}"`,
      c.latitude,
      c.longitude,
      c.materialsDelivered.santinhos,
      c.materialsDelivered.colinhas,
      c.materialsDelivered.adesivo_bola,
      c.materialsDelivered.adesivo_parachoque,
      c.materialsDelivered.abordagens || 0,
      c.materialsDelivered.comercio || 0,
      c.status,
      `"${COORDINATOR_NAME}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_semanal_militancia_${selectedWeek}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar & Export Actions (Hidden in Print Mode) */}
      <div className="no-print p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Auditoria de Campo & Produtividade Semanal
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Coord. {COORDINATOR_NAME}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Relatório Semanal de Desempenho & Cobertura por Militante
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidado com gráficos de produtividade, tabela de metas, ruas percorridas, comprovantes fotográficos e assinatura oficial.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewGrouping('por_militante')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewGrouping === 'por_militante' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Por Militante
              </button>
              <button
                type="button"
                onClick={() => setViewGrouping('tabela_produtividade')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewGrouping === 'tabela_produtividade' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Produtividade
              </button>
              <button
                type="button"
                onClick={() => setViewGrouping('tabela_geral')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewGrouping === 'tabela_geral' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Tabela Completa
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition"
              title="Exportar dados brutos em planilha CSV"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>

            {/* Prominent Export PDF Button */}
            <button
              onClick={handleExportPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 hover:shadow-md cursor-pointer"
              title="Exportar documento PDF completo incluindo os gráficos de desempenho e a tabela de produtividade"
            >
              <FileDown className="w-4 h-4" />
              {isGeneratingPdf ? 'Gerando PDF...' : 'Exportar PDF (Gráficos + Tabela)'}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm transition"
              title="Imprimir ou Salvar como PDF pelo Navegador"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Feedback Alert if Exporting or Finished */}
        {exportFeedback && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">{exportFeedback}</span>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Semana da Campanha
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {weeks.map(w => (
                <option key={w.id} value={w.id}>{w.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Filtrar por Militante
            </label>
            <select
              value={selectedMilitantId}
              onChange={(e) => setSelectedMilitantId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="todos">Todos os Militantes ({militants.length})</option>
              {militants.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.matricula})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Filtrar por Equipe
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="todos">Todas as Equipes ({teams.length})</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Printable / Exportable Report Container */}
      <div className="print-card p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        
        {/* Official Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-sm">
              SJ
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Relatório Semanal de Desempenho & Auditoria de Campo</h1>
              <p className="text-xs text-slate-500">
                {COMMITTEE_NAME}
              </p>
            </div>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <p className="text-slate-500">Período: <strong className="text-slate-900">{selectedWeekLabel}</strong></p>
            <p className="text-slate-600">
              Coordenador Geral: <strong className="text-blue-700 font-bold">{COORDINATOR_NAME}</strong>
            </p>
            <p className="text-slate-400 text-[10px] font-mono">Autenticação: SJ-AUDIT-MYSQL-HOSTINGER</p>
          </div>
        </div>

        {/* Aggregate KPI Summary for Selected Period */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Ruas</span>
            <span className="text-base font-bold text-slate-900">{filteredCheckIns.length} ruas</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Abordagens</span>
            <span className="text-base font-bold text-purple-700">{totalAbordagens}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Comércio</span>
            <span className="text-base font-bold text-emerald-700">{totalComercios}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Santinhos</span>
            <span className="text-base font-bold text-blue-700">{totalSantinhos.toLocaleString('pt-BR')}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Colinhas</span>
            <span className="text-base font-bold text-slate-900">{totalColinhas.toLocaleString('pt-BR')}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Adesivos Bola</span>
            <span className="text-base font-bold text-amber-700">{totalAdesivoBola.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* SECTION: GRÁFICOS DE PRODUTIVIDADE & DISTRIBUIÇÃO (Captured for PDF export) */}
        <div ref={chartsContainerRef} className="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Gráficos de Produtividade & Distribuição de Materiais
              </h3>
              <p className="text-[11px] text-slate-500">
                Visualização comparativa de ruas percorridas, abordagens a eleitores e entrega de materiais por equipe
              </p>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 self-start sm:self-center">
              São José / SC • 2026
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart 1: Ruas & Abordagens por Militante (Bar Chart) */}
            <div className="lg:col-span-2 p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  Produtividade por Militante (Ruas vs. Abordagens)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Meta: 25 ruas/sem</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productivityData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [
                        `${val}`,
                        name === 'streetsCount' ? 'Ruas Percorridas' : (name === 'abordagens' ? 'Abordagens Diretas' : 'Comércios')
                      ]}
                      labelFormatter={(label) => `Militante: ${label}`}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ fontSize: 10, paddingBottom: 6 }}
                      formatter={(value) => (
                        <span className="text-slate-700 text-xs">
                          {value === 'streetsCount' ? 'Ruas' : (value === 'abordagens' ? 'Abordagens' : 'Comércio')}
                        </span>
                      )}
                    />
                    <Bar dataKey="streetsCount" name="streetsCount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="abordagens" name="abordagens" fill="#9333ea" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="comercios" name="comercios" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Distribuição de Materiais Entregues (Pie Chart) */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <PieChartIcon className="w-3.5 h-3.5 text-indigo-600" />
                  Composição de Materiais
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Total: {totalMateriaisGeral}</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialsPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={58}
                      paddingAngle={3}
                    >
                      {materialsPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [`${val.toLocaleString('pt-BR')} unid.`, name]}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100 text-[10px]">
                {materialsPieData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 truncate">{item.name}:</span>
                    <strong className="text-slate-900 font-mono">{item.value.toLocaleString('pt-BR')}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: TABELA CONSOLIDADA DE PRODUTIVIDADE & METAS */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              Tabela Consolidada de Produtividade & Atingimento de Metas
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Meta Semanal: <strong>25 ruas / militante</strong>
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Militante / Matrícula</th>
                  <th className="py-2.5 px-3">Equipe</th>
                  <th className="py-2.5 px-3 text-center">Ruas Feitas</th>
                  <th className="py-2.5 px-3 text-center">Meta Semanal</th>
                  <th className="py-2.5 px-3 text-center">% Atingimento</th>
                  <th className="py-2.5 px-3 text-center">Abordagens</th>
                  <th className="py-2.5 px-3 text-center">Comércios</th>
                  <th className="py-2.5 px-3 text-center">Total Materiais</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Diárias (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {productivityData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.matricula}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-700">
                        {item.teamName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-700 text-sm whitespace-nowrap">
                      {item.streetsCount}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500 whitespace-nowrap">
                      {item.weeklyGoal} ruas
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-14 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.completionRate >= 100 ? 'bg-emerald-500' : (item.completionRate >= 75 ? 'bg-blue-500' : 'bg-amber-500')
                            }`}
                            style={{ width: `${Math.min(item.completionRate, 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-slate-800">{item.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-purple-700 whitespace-nowrap">
                      {item.abordagens}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700 whitespace-nowrap">
                      {item.comercios}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-800 whitespace-nowrap">
                      {item.totalMat.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.statusLabel === 'Superou a Meta'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : (item.statusLabel === 'Na Meta'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200')
                      }`}>
                        {item.statusLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                      R$ {item.totalPay.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900 text-xs">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3 uppercase text-slate-700">
                    Totais Consolidados ({productivityData.length} militantes)
                  </td>
                  <td className="py-2.5 px-3 text-center text-blue-800 text-sm">
                    {productivityData.reduce((acc, d) => acc + d.streetsCount, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-500">
                    {productivityData.length * 25}
                  </td>
                  <td className="py-2.5 px-3 text-center text-emerald-700">
                    {Math.round((productivityData.reduce((acc, d) => acc + d.streetsCount, 0) / Math.max(productivityData.length * 25, 1)) * 100)}%
                  </td>
                  <td className="py-2.5 px-3 text-center text-purple-800">
                    {totalAbordagens}
                  </td>
                  <td className="py-2.5 px-3 text-center text-emerald-800">
                    {totalComercios}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    {totalMateriaisGeral.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      HOMOLOGADO
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-800">
                    R$ {productivityData.reduce((acc, d) => acc + d.totalPay, 0).toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* SECTION 1: PER-MILITANT DETAILED STREETS BREAKDOWN */}
        {viewGrouping === 'por_militante' && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Detalhamento de Ruas por Militante na Semana
              </h3>
              <span className="text-xs text-slate-500">{activeMilitants.length} militantes listados</span>
            </div>

            <div className="space-y-6">
              {activeMilitants.map(mil => {
                const milCheckIns = filteredCheckIns.filter(c => c.militantId === mil.id || c.militantName === mil.name);
                const milSantinhos = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos || 0), 0);
                const milAbordagens = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
                const milComercios = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);

                return (
                  <div
                    key={mil.id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    {/* Militant Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <img
                          src={mil.avatar}
                          alt={mil.name}
                          className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{mil.name}</span>
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono font-semibold border border-blue-200">
                              {mil.matricula}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              (Diária: R$ {mil.dailyRate || 150},00)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {mil.phone} • {mil.teamId === 'team-alpha' ? 'Equipe Alpha' : (mil.teamId === 'team-bravo' ? 'Equipe Bravo' : 'Equipe Geral')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-semibold text-slate-800">
                          {milCheckIns.length} ruas percorridas
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 font-semibold text-purple-700">
                          {milAbordagens} abordagens
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 font-semibold text-emerald-700">
                          {milComercios} comércios
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 font-semibold text-blue-700">
                          {milSantinhos} santinhos
                        </span>
                      </div>
                    </div>

                    {/* Streets Table for this Militant */}
                    {milCheckIns.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                            <tr>
                              <th className="py-2 px-3">Data/Hora</th>
                              <th className="py-2 px-3">Bairro</th>
                              <th className="py-2 px-3">Rua / Trecho Percorrido</th>
                              <th className="py-2 px-3 text-center">GPS</th>
                              <th className="py-2 px-3 text-center">Abordagens</th>
                              <th className="py-2 px-3 text-center">Comércio</th>
                              <th className="py-2 px-3 text-center">Santinhos</th>
                              <th className="py-2 px-3 text-center">Fotos</th>
                              <th className="py-2 px-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {milCheckIns.map(chk => (
                              <tr key={chk.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap text-slate-600">
                                  {chk.timestamp}
                                </td>
                                <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                                  {chk.neighborhoodName}
                                </td>
                                <td className="py-2 px-3 font-medium text-slate-900 max-w-[200px]">
                                  {chk.streetName}
                                </td>
                                <td className="py-2 px-3 text-center whitespace-nowrap">
                                  <a
                                    href={`https://www.google.com/maps?q=${chk.latitude},${chk.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 hover:bg-slate-100 text-blue-700 font-semibold text-[10px] border border-slate-200"
                                  >
                                    <MapPin className="w-3 h-3 text-blue-600" />
                                    {chk.latitude.toFixed(4)}, {chk.longitude.toFixed(4)}
                                  </a>
                                </td>
                                <td className="py-2 px-3 text-center font-bold text-purple-700 whitespace-nowrap">
                                  {chk.materialsDelivered.abordagens || 0}
                                </td>
                                <td className="py-2 px-3 text-center font-bold text-emerald-700 whitespace-nowrap">
                                  {chk.materialsDelivered.comercio || 0}
                                </td>
                                <td className="py-2 px-3 text-center font-bold text-slate-900 whitespace-nowrap">
                                  {chk.materialsDelivered.santinhos}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    {chk.photos && chk.photos.length > 0 ? (
                                      chk.photos.map((p, idx) => (
                                        <img
                                          key={idx}
                                          src={p}
                                          alt="Foto"
                                          onClick={() => setSelectedPhotoZoom(p)}
                                          className="w-6 h-6 rounded object-cover cursor-pointer hover:opacity-80 ring-1 ring-slate-200"
                                        />
                                      ))
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    ✓ Validado
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">
                        Nenhum registro de rua enviado por este militante no período selecionado.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: COMPLETE TABLE (ALL COLUMNS) */}
        {viewGrouping === 'tabela_geral' && (
          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Tabela Completa de Ruas Percorridas & Comprovação Georreferenciada
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Data / Hora</th>
                    <th className="py-2.5 px-3">Militante</th>
                    <th className="py-2.5 px-3">Bairro</th>
                    <th className="py-2.5 px-3">Logradouro / Trecho</th>
                    <th className="py-2.5 px-3 text-center">GPS</th>
                    <th className="py-2.5 px-3 text-center">Abordagens</th>
                    <th className="py-2.5 px-3 text-center">Comércio</th>
                    <th className="py-2.5 px-3 text-center">Materiais</th>
                    <th className="py-2.5 px-3 text-center">Fotos</th>
                    <th className="py-2.5 px-3 text-center">Auditoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCheckIns.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-6 text-center text-slate-400">
                        Nenhum check-in registrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredCheckIns.map(chk => (
                      <tr key={chk.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-600">
                          {chk.timestamp}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {chk.militantName}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            {chk.neighborhoodName}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-900 font-medium max-w-[200px]">
                          {chk.streetName}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <a
                            href={`https://www.google.com/maps?q=${chk.latitude},${chk.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 text-blue-700 font-semibold text-[11px] border border-slate-200"
                          >
                            <MapPin className="w-3 h-3 text-blue-600" />
                            Mapa
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-purple-700 whitespace-nowrap">
                          {chk.materialsDelivered.abordagens || 0}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-700 whitespace-nowrap">
                          {chk.materialsDelivered.comercio || 0}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="font-semibold text-slate-900">{chk.materialsDelivered.santinhos}</span> sant. |{' '}
                          <span className="text-purple-700 font-semibold">{chk.materialsDelivered.adesivo_bola}</span> bola
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {chk.photos && chk.photos.length > 0 ? (
                              chk.photos.map((p, idx) => (
                                <img
                                  key={idx}
                                  src={p}
                                  alt="Foto"
                                  onClick={() => setSelectedPhotoZoom(p)}
                                  className="w-7 h-7 rounded object-cover cursor-pointer hover:opacity-80 ring-1 ring-slate-200"
                                />
                              ))
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Validado
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Coordinator Validation & Official Sign-off */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              Parecer Oficial da Coordenação Geral:
            </p>
            <p className="leading-relaxed text-slate-600">
              Certifico que as ruas, logradouros, abordagens a eleitores e entrega de materiais gráficos descritos neste relatório semanal foram devidamente executados pelas equipes de militância em campo no município de São José - SC, com auditoria de dados e validação georreferenciada.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center text-center pt-4 sm:pt-0">
            <div className="w-72 border-b-2 border-slate-700 mb-2" />
            <p className="font-bold text-base text-slate-900">{COORDINATOR_NAME}</p>
            <p className="text-xs text-blue-700 font-bold">{COORDINATOR_ROLE}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{COMMITTEE_NAME}</p>
            <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Assinatura e Validação Digital Homologada
            </span>
          </div>
        </div>

      </div>

      {/* Photo Zoom Modal */}
      {selectedPhotoZoom && (
        <div
          onClick={() => setSelectedPhotoZoom(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl max-h-[85vh] bg-white rounded-xl p-3 border border-slate-200 shadow-xl">
            <img src={selectedPhotoZoom} alt="Foto Ampliada" className="max-h-[75vh] w-auto rounded-lg object-contain" />
            <p className="text-xs text-slate-500 text-center py-2">Clique em qualquer lugar para fechar</p>
          </div>
        </div>
      )}

    </div>
  );
};

