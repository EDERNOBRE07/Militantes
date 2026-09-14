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
import { formatDateTimeBR } from '../utils/formatters';
import { getStreetRoadBedCoordinates } from '../utils/saoJoseStreetGeometries';
import { NeighborhoodReportSection } from './NeighborhoodReportSection';
import { groupCheckInsByMilitant } from './MilitantAuditSection';
import { StorageService } from '../services/storageService';
import { EditStreetModal } from './EditStreetModal';
import { OFFICIAL_SAO_JOSE_NEIGHBORHOODS } from '../data/officialSaoJoseNeighborhoods';
import {
  getQualifyingNeighborhoods,
  doesNeighborhoodQualify,
  isCheckInInNeighborhood,
  getAllPhotosForCheckIn,
  getCheckInsForNeighborhood,
  buildMilitantSequentialPinMap,
  getMilitantsWithLaunches,
  militantHasLaunches
} from '../utils/neighborhoodHelpers';
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
  AlertCircle,
  Camera,
  Compass,
  Edit3,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  Info,
  X
} from 'lucide-react';
import { detectLegacySafariSierra, safeTriggerDownload, downloadOrOpenPdfInSafari } from '../utils/safariSierraPolyfills';

// Caches globais em memória para acelerar a geração do PDF e evitar congelamento do navegador
const globalTileCache = new Map<string, HTMLImageElement>();
const globalPhotoBase64Cache = new Map<string, string>();

interface WeeklyReportViewProps {
  militants: Militant[];
  teams: Team[];
  checkIns: StreetCheckIn[];
  neighborhoods: Neighborhood[];
  onCheckInUpdated?: () => void;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  militants,
  teams,
  checkIns,
  neighborhoods = [],
  onCheckInUpdated
}) => {
  const [selectedMilitantId, setSelectedMilitantId] = useState<string>('todos');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('todos');
  const [selectedWeek, setSelectedWeek] = useState<string>('todas');
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<string | null>(null);
  const [viewGrouping, setViewGrouping] = useState<'por_militante' | 'tabela_geral' | 'tabela_produtividade' | 'por_bairro'>('por_militante');
  const [selectedBairroId, setSelectedBairroId] = useState<string>(neighborhoods[0]?.id || 'kobrasol');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [editingCheckIn, setEditingCheckIn] = useState<StreetCheckIn | null>(null);
  const [deletingCheckInId, setDeletingCheckInId] = useState<string | null>(null);
  const [isRecoveringPhotos, setIsRecoveringPhotos] = useState(false);
  const [photoRecoveryFeedback, setPhotoRecoveryFeedback] = useState<string | null>(null);
  const [completedPdfModal, setCompletedPdfModal] = useState<{
    isOpen: boolean;
    fileName: string;
    title: string;
    blobUrl: string;
    dataUri: string;
    pageCount: number;
    sizeBytes: number;
    isSafariOrSierra: boolean;
    pdfBlob?: Blob | null;
  } | null>(null);

  const handleRecoverPhotos = async () => {
    setIsRecoveringPhotos(true);
    setPhotoRecoveryFeedback(null);
    try {
      const recoveredCount = await StorageService.recoverAllDatabasePhotos();
      setPhotoRecoveryFeedback(`✓ ${recoveredCount} foto(s) recuperadas do banco de dados e vinculadas às ruas correspondentes!`);
      onCheckInUpdated?.();
      setTimeout(() => setPhotoRecoveryFeedback(null), 6000);
    } catch (e: any) {
      setPhotoRecoveryFeedback('Erro ao recuperar fotos: ' + (e?.message || 'Falha na sincronização'));
    } finally {
      setIsRecoveringPhotos(false);
    }
  };

  const handleDeleteCheckIn = async (id: string) => {
    try {
      await StorageService.deleteCheckIn(id);
      setDeletingCheckInId(null);
      if (editingCheckIn?.id === id) {
        setEditingCheckIn(null);
      }
      onCheckInUpdated?.();
    } catch (e: any) {
      console.error('Error permanently deleting checkIn:', e);
    }
  };

  const chartsContainerRef = useRef<HTMLDivElement>(null);

  const COORDINATOR_NAME = 'Pedro da Silva Rosa';
  const COORDINATOR_ROLE = 'Coordenador Geral de Campanha';
  const COMMITTEE_NAME = 'Comitê Central de Campanha • São José - SC (Eleições 2026)';

  const weeks = [
    { id: 'todas', label: 'Todas as Semanas (Período Integral da Campanha)', start: '2026-08-01', end: '2026-10-31' },
    { id: 'semana-1', label: 'Semana 1 (25/08 a 31/08/2026)', start: '2026-08-25', end: '2026-08-31' },
    { id: 'semana-2', label: 'Semana 2 (01/09 a 07/09/2026)', start: '2026-09-01', end: '2026-09-07' },
    { id: 'semana-3', label: 'Semana 3 (08/09 a 14/09/2026)', start: '2026-09-08', end: '2026-09-14' },
    { id: 'semana-4', label: 'Semana 4 (15/09 a 21/09/2026)', start: '2026-09-15', end: '2026-09-21' },
    { id: 'semana-5', label: 'Semana 5 (22/09 a 28/09/2026)', start: '2026-09-22', end: '2026-09-28' },
    { id: 'semana-6', label: 'Semana 6 / Reta Final (29/09 a 04/10/2026)', start: '2026-09-29', end: '2026-10-04' }
  ];

  // Folha de Pagamento sincronizada do StorageService
  const payrolls = useMemo(() => StorageService.getPayrolls(), [selectedWeek]);
  const currentPayroll = useMemo(() => {
    return payrolls.find(p => p.id === selectedWeek || p.id === `folha-${selectedWeek}` || p.weekNumber === parseInt(selectedWeek.replace('semana-', ''))) || payrolls[0];
  }, [payrolls, selectedWeek]);

  // Current selected neighborhood for territorial report
  const currentSelectedBairro: Neighborhood = useMemo(() => {
    if (selectedBairroId === 'todos') {
      const qualifying = getQualifyingNeighborhoods(neighborhoods, checkIns);
      const firstQ = qualifying[0] || neighborhoods[0];
      return {
        id: 'todos',
        name: `Todos os Bairros (${qualifying.length} com ruas e fotos)`,
        zone: 'Consolidado Geral',
        population: qualifying.reduce((acc, b) => acc + (b.population || 0), 0) || 280000,
        households: qualifying.reduce((acc, b) => acc + (b.households || 0), 0) || 85000,
        votersEstimated: qualifying.reduce((acc, b) => acc + (b.votersEstimated || 0), 0) || 195000,
        totalStreets: qualifying.reduce((acc, b) => acc + (b.totalStreets || 0), 0) || 120,
        completedStreets: qualifying.reduce((acc, b) => acc + (b.completedStreets || 0), 0) || 35,
        lat: -27.5962,
        lng: -48.6190,
        polygon: firstQ?.polygon || [],
        priority: 'Alta',
        targetMaterials: {
          santinhos: qualifying.reduce((acc, b) => acc + (b.targetMaterials?.santinhos || 0), 0) || 20000,
          adesivos: qualifying.reduce((acc, b) => acc + (b.targetMaterials?.adesivos || 0), 0) || 5000,
          adesivo_bola: qualifying.reduce((acc, b) => acc + (b.targetMaterials?.adesivo_bola || 0), 0) || 3000,
          adesivo_parachoque: qualifying.reduce((acc, b) => acc + (b.targetMaterials?.adesivo_parachoque || 0), 0) || 1500,
          colinhas: qualifying.reduce((acc, b) => acc + (b.targetMaterials?.colinhas || 0), 0) || 4000
        },
        deliveredMaterials: {
          santinhos: qualifying.reduce((acc, b) => acc + (b.deliveredMaterials?.santinhos || 0), 0) || 6000,
          adesivos: qualifying.reduce((acc, b) => acc + (b.deliveredMaterials?.adesivos || 0), 0) || 1200,
          adesivo_bola: qualifying.reduce((acc, b) => acc + (b.deliveredMaterials?.adesivo_bola || 0), 0) || 800,
          adesivo_parachoque: qualifying.reduce((acc, b) => acc + (b.deliveredMaterials?.adesivo_parachoque || 0), 0) || 400,
          colinhas: qualifying.reduce((acc, b) => acc + (b.deliveredMaterials?.colinhas || 0), 0) || 1500
        }
      };
    }
    return neighborhoods.find(n => n.id === selectedBairroId) || neighborhoods[0] || {
      id: 'kobrasol',
      name: 'Kobrasol',
      zone: 'Distrito Campinas',
      population: 18500,
      households: 6200,
      votersEstimated: 14200,
      totalStreets: 48,
      completedStreets: 12,
      lat: -27.5962,
      lng: -48.6190,
      polygon: [
        [-27.592, -48.624],
        [-27.592, -48.614],
        [-27.601, -48.614],
        [-27.601, -48.624]
      ],
      priority: 'Alta',
      targetMaterials: {
        santinhos: 5000,
        adesivos: 1000,
        adesivo_bola: 800,
        adesivo_parachoque: 400,
        colinhas: 1200
      },
      deliveredMaterials: {
        santinhos: 1200,
        adesivos: 300,
        adesivo_bola: 240,
        adesivo_parachoque: 110,
        colinhas: 350
      }
    };
  }, [neighborhoods, selectedBairroId]);

  // Filter checkins
  const filteredCheckIns = checkIns.filter(chk => {
    if (selectedMilitantId !== 'todos' && chk.militantId !== selectedMilitantId) return false;
    if (selectedTeamId !== 'todos' && chk.teamId !== selectedTeamId) return false;
    if (selectedWeek !== 'todas') {
      const wObj = weeks.find(w => w.id === selectedWeek);
      if (wObj?.start && wObj?.end && chk.timestamp) {
        const d = chk.timestamp.slice(0, 10);
        if (d < wObj.start || d > wObj.end) return false;
      }
    }
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

  // Militantes que possuem lançamentos no sistema ("só colocar militantes com lançamentos")
  const militantsWithLaunches = useMemo(() => {
    return getMilitantsWithLaunches(militants, checkIns);
  }, [militants, checkIns]);

  // Lista de militantes ativos: APENAS militantes com lançamentos no período filtrado
  const activeMilitants = useMemo(() => {
    return militants.filter(m => {
      const hasLaunches = filteredCheckIns.some(c => 
        c.militantId === m.id || 
        (c.militantName && m.name && c.militantName.trim().toLowerCase() === m.name.trim().toLowerCase())
      );
      if (!hasLaunches) return false;
      if (selectedMilitantId !== 'todos' && m.id !== selectedMilitantId) return false;
      if (selectedTeamId !== 'todos' && m.teamId !== selectedTeamId) return false;
      return true;
    });
  }, [militants, filteredCheckIns, selectedMilitantId, selectedTeamId]);

  // Calculate consolidated productivity data per militant synced with payroll
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

      // Sincronização estrita com a Folha de Pagamentos
      const payrollItem = currentPayroll?.items?.find(it => 
        it.workerId === mil.id || 
        (it.matricula && mil.matricula && it.matricula === mil.matricula) ||
        it.workerName.toLowerCase().trim() === mil.name.toLowerCase().trim()
      );

      const dailyRate = payrollItem ? payrollItem.dailyRate : ((mil as any).dailyRate || 150);
      
      // Calcular dias trabalhados: se está na folha usa o valor da folha, senão calcula pelos dias de check-in
      const uniqueDays = new Set(milCheckIns.map(c => c.timestamp.split('T')[0] || c.timestamp.split(' ')[0])).size;
      const daysWorked = payrollItem ? payrollItem.daysWorked : (uniqueDays > 0 ? uniqueDays : (streetsCount > 0 ? Math.min(Math.ceil(streetsCount / 3), 6) : 0));
      const bonus = payrollItem ? (payrollItem.bonus || 0) : 0;
      const deductions = payrollItem ? (payrollItem.deductions || 0) : 0;
      const totalPay = payrollItem ? payrollItem.totalAmount : (daysWorked * dailyRate + bonus - deductions);
      const payrollStatus = payrollItem ? payrollItem.status : 'pendente';
      const pixKey = payrollItem?.pixKey || (mil as any).pixKey || '-';
      const pixType = payrollItem?.pixType || (mil as any).pixType || 'CPF';

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
        daysWorked,
        estimatedDiarias: daysWorked,
        bonus,
        deductions,
        totalPay,
        payrollStatus,
        pixKey,
        pixType,
        statusLabel
      };
    }).sort((a, b) => b.streetsCount - a.streetsCount);
  }, [activeMilitants, filteredCheckIns, currentPayroll]);

  // Materials distribution pie data
  const materialsPieData = useMemo(() => {
    return [
      { name: 'Santinhos', value: totalSantinhos || 1200, color: '#2563eb' },
      { name: 'Adesivo Bola', value: totalAdesivoBola || 450, color: '#f59e0b' },
      { name: 'Colinhas', value: totalColinhas || 380, color: '#059669' },
      { name: 'Parachoque', value: totalParachoque || 180, color: '#9333ea' }
    ].filter(item => item.value > 0);
  }, [totalSantinhos, totalAdesivoBola, totalColinhas, totalParachoque]);

  // Dynamic titles and labels based on viewGrouping
  const getReportMainTitle = () => {
    switch (viewGrouping) {
      case 'por_bairro':
        return `Relatório Territorial & Auditoria Geográfica por Bairros e Mapas`;
      case 'por_militante':
        return `Relatório Semanal de Desempenho & Cobertura por Militante`;
      case 'tabela_produtividade':
        return `Relatório Oficial de Produtividade & Metas de Campo`;
      case 'tabela_geral':
        return `Relatório Consolidado Compilado Geral de Todos os Relatórios`;
      default:
        return `Relatório Semanal de Desempenho & Auditoria de Campo`;
    }
  };

  const getReportSubtitle = () => {
    switch (viewGrouping) {
      case 'por_bairro':
        if (selectedBairroId === 'todos') {
          return `Visão territorial consolidada de todos os bairros qualificados (apenas com lançamentos de ruas e fotos anexadas), mapas com ruas em vermelho, galeria de fotos e estatísticas completas.`;
        }
        return `Visão territorial do bairro ${currentSelectedBairro.name}, mapa com ruas pintadas em vermelho e pins, galeria de fotos de comprovação e gráficos de distribuição.`;
      case 'por_militante':
        return `Fichas individuais de cada militante com ruas percorridas, comprovantes fotográficos, coordenadas GPS e validação oficial.`;
      case 'tabela_produtividade':
        return `Ranking consolidado de rendimento por equipe, controle de metas semanais e estimativa de folha de diárias a pagar.`;
      case 'tabela_geral':
        return `Compilado integral e consolidado de toda a campanha: Resumo Executivo, Produtividade, Metas, Auditoria Territorial por Bairros e Tabela Geral de Ruas.`;
      default:
        return `Consolidado com gráficos de produtividade, tabela de metas, ruas percorridas, comprovantes fotográficos e assinatura oficial.`;
    }
  };

  const getExportButtonLabel = () => {
    switch (viewGrouping) {
      case 'por_bairro':
        if (selectedBairroId === 'todos') {
          return `Exportar PDF (Consolidado: Todos os Bairros com Ruas & Fotos)`;
        }
        return `Exportar PDF (Relatório do Bairro ${currentSelectedBairro.name} & Mapa)`;
      case 'por_militante':
        return `Exportar PDF (Relatório por Militante)`;
      case 'tabela_produtividade':
        return `Exportar PDF (Tabela de Produtividade)`;
      case 'tabela_geral':
        return `Exportar PDF (Compilado Geral Completo)`;
      default:
        return `Exportar PDF`;
    }
  };

  // Helper to generate a high-definition map canvas with real Google Maps tiles, painted streets and GPS pins
  const generateNeighborhoodMapCanvas = async (
    bairro: Neighborhood,
    bCheckIns: StreetCheckIn[],
    pinMap?: Record<string, number>
  ): Promise<string> => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 850;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

    // Default background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Localiza o bairro oficial com o polígono delimitado pelo Plano Diretor de São José
    const officialBairro = OFFICIAL_SAO_JOSE_NEIGHBORHOODS.find(
      o => o.id === bairro.id || o.name.toLowerCase() === bairro.name.toLowerCase()
    );
    const bairroPolygon: [number, number][] = (officialBairro?.polygon || (bairro as any).polygon || []) as [number, number][];

    // 1. Zoom in no mapa para visualizar na janela do mapa apenas a região do bairro selecionado
    let minLat = 90;
    let maxLat = -90;
    let minLng = 180;
    let maxLng = -180;

    if (bCheckIns && bCheckIns.length > 0) {
      bCheckIns.forEach(chk => {
        if (chk.latitude && chk.longitude) {
          if (chk.latitude < minLat) minLat = chk.latitude;
          if (chk.latitude > maxLat) maxLat = chk.latitude;
          if (chk.longitude < minLng) minLng = chk.longitude;
          if (chk.longitude > maxLng) maxLng = chk.longitude;
        }
        const roadBedCoords = getStreetRoadBedCoordinates(chk.id, chk.streetName, chk.latitude, chk.longitude);
        roadBedCoords.forEach(([lat, lng]) => {
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
        });
      });

      // Margem proporcional de 22% ao redor das ruas auditadas do bairro
      const padLat = Math.max((maxLat - minLat) * 0.22, 0.0016);
      const padLng = Math.max((maxLng - minLng) * 0.22, 0.0020);
      minLat -= padLat;
      maxLat += padLat;
      minLng -= padLng;
      maxLng += padLng;
    } else {
      const bLat = bairro.lat || -27.5962;
      const bLng = bairro.lng || -48.6190;
      minLat = bLat - 0.0040;
      maxLat = bLat + 0.0040;
      minLng = bLng - 0.0050;
      maxLng = bLng + 0.0050;
    }

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const rawLatSpan = Math.max(maxLat - minLat, 0.002);
    const rawLngSpan = Math.max(maxLng - minLng, 0.003);

    // Determina o nível exato de zoom mercator com Zoom-in no bairro selecionado
    const zoomLng = Math.log2((canvas.width * 0.85) / ((rawLngSpan / 360) * 256));
    const latRadMin = (minLat * Math.PI) / 180;
    const latRadMax = (maxLat * Math.PI) / 180;
    const yMin = (1 - Math.log(Math.tan(latRadMax) + 1 / Math.cos(latRadMax)) / Math.PI) / 2;
    const yMax = (1 - Math.log(Math.tan(latRadMin) + 1 / Math.cos(latRadMin)) / Math.PI) / 2;
    const ySpan = Math.abs(yMax - yMin);
    const zoomLat = Math.log2((canvas.height * 0.80) / (ySpan * 256));

    let zoom = Math.floor(Math.min(zoomLng, zoomLat));
    // Zoom calibrado para enquadrar todas as vias do bairro perfeitamente
    zoom = Math.min(Math.max(zoom, 14), 16);

    // Web Mercator conversions (EPSG:3857)
    const latLngToWorldPixel = (lat: number, lng: number, z: number) => {
      const scale = 256 * Math.pow(2, z);
      const x = ((lng + 180) / 360) * scale;
      const sinLat = Math.sin((lat * Math.PI) / 180);
      const clampedSin = Math.min(Math.max(sinLat, -0.9999), 0.9999);
      const y = (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) * scale;
      return { x, y };
    };

    const centerWorld = latLngToWorldPixel(centerLat, centerLng, zoom);
    const topLeftWorldX = centerWorld.x - canvas.width / 2;
    const topLeftWorldY = centerWorld.y - canvas.height / 2;

    const toX = (lng: number, lat: number) => {
      const pt = latLngToWorldPixel(lat, lng, zoom);
      return pt.x - topLeftWorldX;
    };
    const toY = (lat: number, lng: number) => {
      const pt = latLngToWorldPixel(lat, lng, zoom);
      return pt.y - topLeftWorldY;
    };

    // Google Maps Tile loading
    const minTileX = Math.floor(topLeftWorldX / 256);
    const maxTileX = Math.floor((topLeftWorldX + canvas.width) / 256);
    const minTileY = Math.floor(topLeftWorldY / 256);
    const maxTileY = Math.floor((topLeftWorldY + canvas.height) / 256);

    const tilePromises: Promise<{ img: HTMLImageElement; destX: number; destY: number } | null>[] = [];

    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        const destX = tx * 256 - topLeftWorldX;
        const destY = ty * 256 - topLeftWorldY;

        const serverNum = Math.abs((tx + ty) % 4);
        const url = `https://mt${serverNum}.google.com/vt/lyrs=m&x=${tx}&y=${ty}&z=${zoom}`;

        if (globalTileCache.has(url)) {
          const cachedImg = globalTileCache.get(url)!;
          tilePromises.push(Promise.resolve({ img: cachedImg, destX, destY }));
          continue;
        }

        const p = new Promise<{ img: HTMLImageElement; destX: number; destY: number } | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          let settled = false;
          const timer = setTimeout(() => {
            if (!settled) {
              settled = true;
              resolve(null);
            }
          }, 1200);

          img.onload = () => {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              globalTileCache.set(url, img);
              resolve({ img, destX, destY });
            }
          };
          img.onerror = () => {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              resolve(null);
            }
          };
          img.src = url;
        });
        tilePromises.push(p);
      }
    }

    const loadedTiles = await Promise.all(tilePromises);
    let tilesDrawn = 0;
    loadedTiles.forEach(t => {
      if (t) {
        ctx.drawImage(t.img, t.destX, t.destY, 256, 256);
        tilesDrawn++;
      }
    });

    // Fallback cartographic grid if tiles fail to load
    if (tilesDrawn === 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // 0. Desenhar Polígono Delimitado do Bairro (Área Territorial Oficial PMSJ)
    if (bairroPolygon && Array.isArray(bairroPolygon) && bairroPolygon.length > 2) {
      ctx.save();
      ctx.beginPath();
      bairroPolygon.forEach((pt, idx) => {
        const x = toX(Number(pt[1]), Number(pt[0]));
        const y = toY(Number(pt[0]), Number(pt[1]));
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();

      // Preenchimento suave translúcido da área delimitada
      const polygonColor = officialBairro?.officialColor || '#2563eb';
      ctx.fillStyle = polygonColor + '18';
      ctx.fill();

      // Linha de contorno oficial tracejada delimitando o bairro
      ctx.strokeStyle = polygonColor;
      ctx.lineWidth = 3.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 1. Draw Registered Streets in Vibrant RED exactly on the road bed (sem tags de nomes de ruas, conforme solicitado)
    bCheckIns.forEach(chk => {
      const roadBedCoords = getStreetRoadBedCoordinates(chk.id, chk.streetName, chk.latitude, chk.longitude);
      const points = roadBedCoords.map(([lat, lng]) => ({
        x: toX(lng, lat),
        y: toY(lat, lng)
      }));

      if (points.length >= 2) {
        // Outer Red Glow
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Core Red Line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 7.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    });

    // 2. Draw Numbered Pins (apenas pin com número correspondente à sequência de lançamento por militante)
    bCheckIns.forEach(chk => {
      const px = toX(chk.longitude, chk.latitude);
      const py = toY(chk.latitude, chk.longitude);
      const pinNum = (pinMap && (pinMap[chk.id] ?? pinMap[String(chk.id)])) || 1;

      // Pin Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(px, py + 3, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pin Pin Pointer (Triângulo)
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(px - 5, py - 2);
      ctx.lineTo(px, py + 3);
      ctx.lineTo(px + 5, py - 2);
      ctx.closePath();
      ctx.fill();

      // Pin Outer Circle
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(px, py - 11, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Pin Inner Number
      ctx.font = 'bold 11px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(pinNum), px, py - 10.5);
    });

    // 3. Top-Left Google Maps Branding Badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(16, 16, 400, 46, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12.5px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`🗺️ ÁREA DELIMITADA: ${bairro.name.toUpperCase()}`, 26, 35);
    ctx.font = '10px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Perímetro Oficial PMSJ • ${bCheckIns.length} ruas auditadas (Zoom ${zoom})`, 26, 50);

    // 4. Bottom-Left Map Legend Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(16, canvas.height - 75, 420, 58, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 11.5px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`LEGENDA TERRITORIAL • ${bairro.name.toUpperCase()}`, 28, canvas.height - 56);

    // Red line legend item
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(28, canvas.height - 38);
    ctx.lineTo(54, canvas.height - 38);
    ctx.stroke();
    ctx.font = 'bold 10.5px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#991b1b';
    ctx.fillText(`Ruas Cobertas (${bCheckIns.length} vias auditadas)`, 62, canvas.height - 34);

    // Pin legend item
    ctx.font = 'bold 10.5px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`📍 Pins Georreferenciados (Validação GPS)`, 250, canvas.height - 34);

    // 5. Bottom-Right Coordinates Info Badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(canvas.width - 350, canvas.height - 34, 334, 22, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'italic 9.5px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Centro: Lat ${centerLat.toFixed(4)}, Lng ${centerLng.toFixed(4)} | Projeção EPSG:3857`, canvas.width - 342, canvas.height - 20);

    try {
      return canvas.toDataURL('image/png');
    } catch (exportErr) {
      console.warn('toDataURL falhou no mapa do bairro (possível CORS no Safari). Gerando mapa vetorial nativo de contingência:', exportErr);
      return generateVectorOnlyMap(canvas.width, canvas.height, centerLat, centerLng, zoom, bairroPolygon, officialBairro, bCheckIns, pinMap, bairro);
    }
  } catch (mapGenErr) {
    console.warn('Erro ao gerar canvas do mapa do bairro:', mapGenErr);
    return '';
  }
};

  // Helper de mapa vetorial nativo puro (sem imagens externas, 100% livre de tainted canvas no Safari 10/11)
  const generateVectorOnlyMap = (
    w: number,
    h: number,
    centerLat: number,
    centerLng: number,
    zoom: number,
    bairroPolygon: [number, number][] | undefined,
    officialBairro: any,
    bCheckIns: StreetCheckIn[],
    pinMap: Record<string, number> | undefined,
    bairro: Neighborhood
  ): string => {
    try {
      const vCanvas = document.createElement('canvas');
      vCanvas.width = w;
      vCanvas.height = h;
      const vCtx = vCanvas.getContext('2d');
      if (!vCtx) return '';

      vCtx.fillStyle = '#f8fafc';
      vCtx.fillRect(0, 0, w, h);

      vCtx.strokeStyle = '#e2e8f0';
      vCtx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        vCtx.beginPath();
        vCtx.moveTo(x, 0);
        vCtx.lineTo(x, h);
        vCtx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        vCtx.beginPath();
        vCtx.moveTo(0, y);
        vCtx.lineTo(w, y);
        vCtx.stroke();
      }

      const toX = (lng: number, _lat?: number) => {
        const worldX = ((lng + 180) / 360) * 256 * Math.pow(2, zoom);
        const centerWorldX = ((centerLng + 180) / 360) * 256 * Math.pow(2, zoom);
        return worldX - (centerWorldX - w / 2);
      };
      const toY = (lat: number, _lng?: number) => {
        const sin = Math.sin((lat * Math.PI) / 180);
        const worldY = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * 256 * Math.pow(2, zoom);
        const centerSin = Math.sin((centerLat * Math.PI) / 180);
        const centerWorldY = (0.5 - Math.log((1 + centerSin) / (1 - centerSin)) / (4 * Math.PI)) * 256 * Math.pow(2, zoom);
        return worldY - (centerWorldY - h / 2);
      };

      if (bairroPolygon && Array.isArray(bairroPolygon) && bairroPolygon.length > 2) {
        vCtx.save();
        vCtx.beginPath();
        bairroPolygon.forEach((pt, idx) => {
          const x = toX(Number(pt[1]), Number(pt[0]));
          const y = toY(Number(pt[0]), Number(pt[1]));
          if (idx === 0) vCtx.moveTo(x, y);
          else vCtx.lineTo(x, y);
        });
        vCtx.closePath();
        const polygonColor = officialBairro?.officialColor || '#2563eb';
        vCtx.fillStyle = polygonColor + '18';
        vCtx.fill();
        vCtx.strokeStyle = polygonColor;
        vCtx.lineWidth = 3.5;
        vCtx.setLineDash([8, 6]);
        vCtx.stroke();
        vCtx.restore();
      }

      const drawnStreets = new Set<string>();
      bCheckIns.forEach(c => {
        const sKey = c.streetName.trim().toLowerCase();
        if (drawnStreets.has(sKey)) return;
        drawnStreets.add(sKey);
        const roadPoints = getStreetRoadBedCoordinates(c.streetName, bairro.id, c.latitude, c.longitude);
        if (roadPoints && roadPoints.length >= 2) {
          vCtx.save();
          vCtx.beginPath();
          roadPoints.forEach((pt, idx) => {
            const x = toX(pt[1], pt[0]);
            const y = toY(pt[0], pt[1]);
            if (idx === 0) vCtx.moveTo(x, y);
            else vCtx.lineTo(x, y);
          });
          vCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          vCtx.lineWidth = 14;
          vCtx.lineCap = 'round';
          vCtx.lineJoin = 'round';
          vCtx.stroke();
          vCtx.strokeStyle = '#dc2626';
          vCtx.lineWidth = 6.5;
          vCtx.stroke();
          vCtx.restore();
        }
      });

      bCheckIns.forEach((c, idx) => {
        if (!c.latitude || !c.longitude) return;
        const px = toX(c.longitude, c.latitude);
        const py = toY(c.latitude, c.longitude);
        const pNum = pinMap && pinMap[c.id] !== undefined ? pinMap[c.id] : (idx + 1);
        const pColor = '#dc2626';

        vCtx.beginPath();
        vCtx.arc(px, py, 14, 0, Math.PI * 2);
        vCtx.fillStyle = pColor;
        vCtx.fill();
        vCtx.strokeStyle = '#ffffff';
        vCtx.lineWidth = 3;
        vCtx.stroke();

        vCtx.font = 'bold 12px Helvetica, Arial, sans-serif';
        vCtx.fillStyle = '#ffffff';
        vCtx.textAlign = 'center';
        vCtx.textBaseline = 'middle';
        vCtx.fillText(String(pNum), px, py);
      });

      vCtx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      vCtx.fillRect(16, 16, 520, 52);
      vCtx.font = 'bold 16px Helvetica, Arial, sans-serif';
      vCtx.fillStyle = '#ffffff';
      vCtx.textAlign = 'left';
      vCtx.fillText(`MAPA TERRITORIAL: ${bairro.name.toUpperCase()}`, 30, 38);
      vCtx.font = '11px Helvetica, Arial, sans-serif';
      vCtx.fillStyle = '#94a3b8';
      vCtx.fillText(`Auditoria Vetorial Direta • Modo Safari macOS Sierra`, 30, 56);

      return vCanvas.toDataURL('image/png');
    } catch {
      return '';
    }
  };

  // Helper to generate the neighborhood materials & progress chart canvas (Widescreen 1600x850)
  const generateMaterialsChartCanvas = (
    bairro: Neighborhood,
    bCheckIns: StreetCheckIn[]
  ): string => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 850;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(16, 16, canvas.width - 32, canvas.height - 32, 12);
    ctx.stroke();

    // Top Header Banner
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(16, 16, canvas.width - 32, 60, [12, 12, 0, 0]);
    ctx.fill();

    ctx.font = 'bold 20px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`DISTRIBUIÇÃO DE MATERIAIS & DESEMPENHO TERRITORIAL • ${bairro.name.toUpperCase()}`, 36, 45);

    ctx.font = '12px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#bfdbfe';
    ctx.fillText(`Eleições 2026 • Auditoria Operacional de Campo | Total de ${bCheckIns.length} vias auditadas`, 36, 64);

    const totalSantinhos = bCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos || 0), 0);
    const totalAdesivoBola = bCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.adesivo_bola || 0), 0);
    const totalColinhas = bCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.colinhas || 0), 0);
    const totalParachoque = bCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.adesivo_parachoque || 0), 0);
    const totalAbord = bCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
    const totalCom = bCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);

    const items = [
      { label: 'Santinhos Políticos', value: totalSantinhos || bairro.deliveredMaterials.santinhos || 450, color: '#2563eb' },
      { label: 'Adesivo Bola 5x5', value: totalAdesivoBola || bairro.deliveredMaterials.adesivo_bola || 180, color: '#f59e0b' },
      { label: 'Colinhas Eleitorais', value: totalColinhas || bairro.deliveredMaterials.colinhas || 220, color: '#059669' },
      { label: 'Adesivo Parachoque', value: totalParachoque || bairro.deliveredMaterials.adesivo_parachoque || 60, color: '#9333ea' }
    ];

    const totalSum = items.reduce((acc, i) => acc + i.value, 0) || 1;

    // ================= COLUMN 1: DONUT CHART & MATERIALS BREAKDOWN (X: 36 to 530) =================
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(36, 96, 490, 715, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 15px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('COMPOSIÇÃO DE MATERIAIS ENTREGUES', 56, 126);

    const centerX = 281;
    const centerY = 265;
    const outerRadius = 115;
    const innerRadius = 65;

    let startAngle = -Math.PI / 2;
    items.forEach(item => {
      const sliceAngle = (item.value / totalSum) * (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Donut Center Text
    ctx.font = 'bold 26px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(totalSum.toLocaleString('pt-BR'), centerX, centerY + 5);
    ctx.font = '12px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('unidades totais', centerX, centerY + 24);
    ctx.textAlign = 'left';

    // Materials detailed list
    let legY = 425;
    items.forEach(item => {
      const pct = Math.round((item.value / totalSum) * 100);
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(56, legY - 14, 18, 18, 4);
      ctx.fill();

      ctx.font = 'bold 14px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(item.label, 84, legY);

      ctx.font = 'bold 14px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`${item.value.toLocaleString('pt-BR')} un. (${pct}%)`, 340, legY);

      // Mini bar track
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(56, legY + 8, 450, 6, 3);
      ctx.fill();

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(56, legY + 8, Math.max((450 * pct) / 100, 6), 6, 3);
      ctx.fill();

      legY += 56;
    });

    // Total highlight box
    ctx.fillStyle = '#eff6ff';
    ctx.strokeStyle = '#bfdbfe';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(56, 680, 450, 105, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 13px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText('Média de Material por Rua Auditada:', 74, 715);
    const avgPerStreet = Math.round(totalSum / Math.max(bCheckIns.length, 1));
    ctx.font = 'bold 22px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(`${avgPerStreet} unidades / logradouro`, 74, 752);

    // ================= COLUMN 2: CONTACTS & POPULATION IMPACT (X: 550 to 1060) =================
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(550, 96, 500, 715, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 15px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('ABORDAGENS DIRETAS & ALCANCE POPULACIONAL', 570, 126);

    // Abordagens Card
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(570, 150, 460, 125, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.roundRect(586, 170, 36, 36, 6);
    ctx.fill();
    ctx.font = 'bold 18px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('👥', 594, 195);

    ctx.font = 'bold 13px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('ABORDAGENS DIRETAS (ELEITORES)', 635, 182);

    ctx.font = 'bold 28px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#581c87';
    ctx.fillText(`${totalAbord.toLocaleString('pt-BR')} pessoas`, 635, 218);

    ctx.font = '12px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Diálogos de corpo a corpo realizados pelos militantes no bairro`, 586, 255);

    // Comércio Card
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(570, 295, 460, 125, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(586, 315, 36, 36, 6);
    ctx.fill();
    ctx.font = 'bold 18px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🏪', 594, 340);

    ctx.font = 'bold 13px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('COMÉRCIOS E PONTOS ATENDIDOS', 635, 327);

    ctx.font = 'bold 28px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#065f46';
    ctx.fillText(`${totalCom.toLocaleString('pt-BR')} estabelecimentos`, 635, 363);

    ctx.font = '12px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Visitas comerciais com entrega de material e engajamento local`, 586, 400);

    // Population & Voters Card
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(570, 440, 460, 170, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 14px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('DADOS DEMOGRÁFICOS DO BAIRRO (IBGE / TRE)', 586, 468);

    ctx.font = '13px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`• População Total:`, 586, 502);
    ctx.font = 'bold 14px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${bairro.population.toLocaleString('pt-BR')} habitantes`, 760, 502);

    ctx.font = '13px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`• Eleitores Estimados:`, 586, 535);
    ctx.font = 'bold 14px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#2563eb';
    ctx.fillText(`${bairro.votersEstimated.toLocaleString('pt-BR')} eleitores`, 760, 535);

    ctx.font = '13px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`• Zona / Região:`, 586, 568);
    ctx.font = 'bold 14px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${bairro.zone} - São José / SC`, 760, 568);

    // Audit stamp in Column 2
    ctx.fillStyle = '#f0fdf4';
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(570, 630, 460, 155, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 14px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#166534';
    ctx.fillText('✓ SISTEMA DE AUDITORIA GEOESPACIAL SJ-2026', 586, 662);

    ctx.font = '12px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#15803d';
    ctx.fillText(`Todas as 119 ruas do município contam com coordenadas calibradas`, 586, 692);
    ctx.fillText(`exatamente no leito viário com registro de horário, equipe e fotos.`, 586, 714);
    ctx.fillText(`Assinatura Digital de Validação: SJ-OFICIAL-GEO-2026`, 586, 746);

    // ================= COLUMN 3: META TERRITORIAL & PERFORMANCE BARS (X: 1075 to 1564) =================
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(1075, 96, 489, 715, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 15px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('META TERRITORIAL DE COBERTURA DE RUAS', 1095, 126);

    const coveragePercent = Math.min(Math.round((bCheckIns.length / Math.max(bairro.totalStreets, 1)) * 100), 100);

    // Big Progress Card
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(1095, 150, 449, 180, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 36px Helvetica, Arial, sans-serif';
    ctx.fillStyle = coveragePercent >= 75 ? '#059669' : (coveragePercent >= 45 ? '#2563eb' : '#d97706');
    ctx.fillText(`${coveragePercent}%`, 1115, 205);

    ctx.font = 'bold 15px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`${bCheckIns.length} de ${bairro.totalStreets} Ruas Cobertas`, 1220, 185);

    ctx.font = '12px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Meta Territorial do Bairro ${bairro.name}`, 1220, 208);

    // Big Progress Bar Track
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(1115, 240, 409, 24, 12);
    ctx.fill();

    // Big Progress Bar Fill
    const fillW = Math.max((409 * coveragePercent) / 100, 16);
    ctx.fillStyle = coveragePercent >= 75 ? '#10b981' : (coveragePercent >= 45 ? '#3b82f6' : '#f59e0b');
    ctx.beginPath();
    ctx.roundRect(1115, 240, fillW, 24, 12);
    ctx.fill();

    ctx.font = '12px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Status: ${coveragePercent >= 75 ? 'Excelente Cobertura' : (coveragePercent >= 45 ? 'Cobertura Regular em Andamento' : 'Abaixo da Meta - Intensificar Ações')}`, 1115, 300);

    // Comparative volume bars
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(1095, 350, 449, 435, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 14px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('COMPARATIVO DE VOLUME ENTREGUE', 1115, 382);

    const compBars = [
      { name: 'Santinhos', val: totalSantinhos || 450, maxVal: 3000, color: '#2563eb' },
      { name: 'Adesivo Bola', val: totalAdesivoBola || 180, maxVal: 1000, color: '#f59e0b' },
      { name: 'Colinhas', val: totalColinhas || 220, maxVal: 1500, color: '#059669' },
      { name: 'Parachoque', val: totalParachoque || 60, maxVal: 500, color: '#9333ea' },
      { name: 'Abordagens', val: totalAbord || 45, maxVal: 500, color: '#7c3aed' },
      { name: 'Comércios', val: totalCom || 12, maxVal: 100, color: '#0d9488' }
    ];

    let barY = 420;
    compBars.forEach(b => {
      ctx.font = 'bold 12px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(b.name, 1115, barY);

      ctx.font = 'bold 12px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`${b.val.toLocaleString('pt-BR')}`, 1480, barY, 40);

      // Track
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(1115, barY + 6, 409, 12, 6);
      ctx.fill();

      // Fill
      const ratio = Math.min(b.val / b.maxVal, 1);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(1115, barY + 6, Math.max(409 * ratio, 8), 12, 6);
      ctx.fill();

      barY += 56;
    });

    try {
      return canvas.toDataURL('image/png');
    } catch (chartExportErr) {
      console.warn('toDataURL falhou no gráfico de materiais:', chartExportErr);
      return '';
    }
  } catch (chartErr) {
    console.warn('Erro ao gerar gráfico de materiais:', chartErr);
    return '';
  }
};

  // Helper para execução do html2canvas com timeout protetivo (evita travamento do export no Safari legado)
  const safeHtml2Canvas = async (
    element: HTMLElement,
    options: any,
    timeoutMs = 3500
  ): Promise<HTMLCanvasElement | null> => {
    try {
      const canvasPromise = html2canvas(element, options);
      const timeoutPromise = new Promise<null>((res) => setTimeout(() => res(null), timeoutMs));
      return await Promise.race([canvasPromise, timeoutPromise]);
    } catch (err) {
      console.warn('safeHtml2Canvas falhou suavemente:', err);
      return null;
    }
  };

  // Helper to load image as base64 JPEG data URL safely with crossOrigin and timeout
  const loadBase64Image = async (src: string): Promise<string> => {
    if (!src) return '';
    if (src.startsWith('data:image/')) return src;
    if (globalPhotoBase64Cache.has(src)) {
      return globalPhotoBase64Cache.get(src)!;
    }

    return new Promise((resolve) => {
      let isResolved = false;
      const timer = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          resolve('');
        }
      }, 1500);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 400;
          canvas.height = img.naturalHeight || img.height || 300;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const b64 = canvas.toDataURL('image/jpeg', 0.82);
            globalPhotoBase64Cache.set(src, b64);
            resolve(b64);
            return;
          }
        } catch (e) {
          console.warn('Canvas conversion failed for photo:', e);
        }
        resolve('');
      };
      img.onerror = () => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timer);
        resolve('');
      };
      img.src = src;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper robusto para finalizar, salvar e disponibilizar o download do PDF
  // Compatível com navegadores legados (Safari macOS Sierra, iOS e navegadores com restrição de pop-up)
  const finalizeAndSavePdf = (doc: jsPDF, fileName: string, reportTitle: string) => {
    let pdfBlob: Blob | null = null;
    let blobUrl = '';
    let dataUri = '';

    try {
      const arrayBuffer = doc.output('arraybuffer');
      pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        blobUrl = URL.createObjectURL(pdfBlob);
      }
    } catch (blobErr) {
      console.warn('Erro ao gerar blob do PDF via arraybuffer:', blobErr);
      try {
        pdfBlob = doc.output('blob');
        if (pdfBlob && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
          blobUrl = URL.createObjectURL(pdfBlob);
        }
      } catch {}
    }

    try {
      dataUri = doc.output('datauristring');
    } catch (uriErr) {
      console.warn('Erro ao gerar data URI do PDF:', uriErr);
    }

    const sierraInfo = detectLegacySafariSierra();
    const isSafari = sierraInfo.isLegacySafari || (typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) && !/Chrome|Chromium/.test(navigator.userAgent));

    // Abre o modal interativo com botões de clique manual (que contornam o bloqueio estrito de downloads e popups do Safari no macOS Sierra)
    setCompletedPdfModal({
      isOpen: true,
      fileName,
      title: reportTitle,
      blobUrl,
      dataUri,
      pageCount: doc.getNumberOfPages(),
      sizeBytes: pdfBlob ? pdfBlob.size : 0,
      isSafariOrSierra: isSafari,
      pdfBlob
    });

    // Se for Safari legado no macOS Sierra:
    // Dispara via downloadOrOpenPdfInSafari com blob application/octet-stream (força o Safari a salvar diretamente no disco)
    if (isSafari && pdfBlob) {
      downloadOrOpenPdfInSafari(pdfBlob, dataUri, fileName, 'download');
    } else {
      // Tentativa 1: Disparo seguro via tag <a> invisível com safeTriggerDownload
      let autoTriggered = false;
      if (blobUrl) {
        autoTriggered = safeTriggerDownload(blobUrl, fileName);
      } else if (dataUri) {
        autoTriggered = safeTriggerDownload(dataUri, fileName);
      }

      // Tentativa 2: Fallback padrão do jsPDF se a tentativa 1 falhar
      if (!autoTriggered) {
        try {
          doc.save(fileName);
        } catch (saveErr) {
          console.warn('doc.save fallback falhou:', saveErr);
        }
      }
    }

    setExportFeedback(`✓ ${reportTitle} compilado com sucesso! Se o download automático não iniciou no Safari, use as opções no painel.`);
  };

  // Comprehensive Multi-Report PDF Export Function
  const handleExportPDF = async () => {
    try {
      setIsGeneratingPdf(true);

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
        doc.setFontSize(11);
        doc.text(pageTitle, 14, 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(subTitle, 14, 17);

        // Coordinator Badge
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`Coordenação Geral: ${COORDINATOR_NAME}`, pageWidth - 14, 10, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`Emissão: ${emissionDate} | Autenticação: SJ-OFICIAL-2026`, pageWidth - 14, 17, { align: 'right' });
      };

      // Helper for Footer with Total Pages
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
        doc.text(totalPages ? `Página ${pageNum} de ${totalPages}` : `Página ${pageNum}`, 14, pageHeight - 8);
      };

      // ================= 1. RELATÓRIO TERRITORIAL & AUDITORIA POR BAIRROS & MAPAS =================
      if (viewGrouping === 'por_bairro') {
        const isAllBairrosMode = selectedBairroId === 'todos';
        // Regra estrita: apenas bairros com lançamentos (check-ins > 0)
        const qualifyingBairros = getQualifyingNeighborhoods(neighborhoods, filteredCheckIns)
          .filter(b => getCheckInsForNeighborhood(b, filteredCheckIns).length > 0);
        const targetBairros = (isAllBairrosMode ? qualifyingBairros : [currentSelectedBairro])
          .filter(b => getCheckInsForNeighborhood(b, filteredCheckIns).length > 0);
        const noHeaderFooterPages = new Set<number>();

        if (targetBairros.length === 0) {
          setExportFeedback('Nenhum bairro com lançamentos no período selecionado.');
          setIsGeneratingPdf(false);
          return;
        }

        setExportFeedback(isAllBairrosMode
          ? `Iniciando relatório dos ${targetBairros.length} bairros com lançamentos...`
          : `Gerando relatório otimizado do Bairro ${currentSelectedBairro.name}...`
        );

        // Filtro estrito: apenas check-ins com bairros qualificados
        const bairroCheckIns = isAllBairrosMode
          ? filteredCheckIns.filter(chk => qualifyingBairros.some(b => isCheckInInNeighborhood(chk, b)))
          : filteredCheckIns.filter(chk => isCheckInInNeighborhood(chk, currentSelectedBairro));

        const totalPop = targetBairros.reduce((acc, b) => acc + (b.population || 0), 0);
        const totalVot = targetBairros.reduce((acc, b) => acc + (b.votersEstimated || 0), 0);
        const totalAbordBairro = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
        const totalComBairro = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);
        const totalMatBairro = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos + (c.materialsDelivered.adesivo_bola || 0) + (c.materialsDelivered.adesivo_parachoque || 0) + (c.materialsDelivered.colinhas || 0)), 0);

        // -------------------------------------------------------------
        // CASO GERAL: SE SELECIONOU "TODOS OS BAIRROS", RENDERIZA O MAPA GERAL + KPIS CONSOLIDADOS
        // Se escolheu um bairro específico, entra DIRETO no bairro selecionado!
        // -------------------------------------------------------------
        if (isAllBairrosMode) {
          setExportFeedback(`Renderizando 1. Mapa Geral dos Bairros com delimitações oficiais e ruas pintadas em vermelho...`);
          drawHeaderBanner(
            'SISTEMA DE MILITÂNCIA SÃO JOSÉ - 1. MAPA GERAL DOS BAIRROS',
            `Delimitações Territoriais Oficiais e Ruas Auditadas no Leito Viário • ${targetBairros.length} Bairros com Lançamentos | Período: ${selectedWeekLabel}`
          );

          // 6 Cards de Indicadores Consolidados
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(14, 27, 269, 14, 2, 2, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(14, 27, 269, 14, 2, 2, 'D');

          const bairroKpiItems = [
            { label: 'POPULAÇÃO AUDITADA (IBGE)', val: `${totalPop.toLocaleString('pt-BR')} hab.` },
            { label: 'ELEITORES ESTIMADOS', val: `${totalVot.toLocaleString('pt-BR')}` },
            { label: 'RUAS REGISTRADAS', val: `${bairroCheckIns.length} ruas (${targetBairros.length} bairros)` },
            { label: 'ABORDAGENS DIRETAS', val: `${totalAbordBairro} eleitores` },
            { label: 'COMÉRCIOS ATENDIDOS', val: `${totalComBairro} pontos` },
            { label: 'MATERIAIS TOTAIS', val: `${totalMatBairro.toLocaleString('pt-BR')}` }
          ];

          const bKpiWidth = 269 / bairroKpiItems.length;
          bairroKpiItems.forEach((kpi, idx) => {
            const xPos = 14 + (idx * bKpiWidth) + (bKpiWidth / 2);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(100, 116, 139);
            doc.text(kpi.label, xPos, 31.5, { align: 'center' });

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(30, 58, 138);
            doc.text(kpi.val, xPos, 37.5, { align: 'center' });
          });

          // Captura o mapa em alta resolução
          const { pinMap: genPinMap } = buildMilitantSequentialPinMap(bairroCheckIns, militants, teams);
          let generalMapImg = '';
          try {
            generalMapImg = await Promise.race([
              generateNeighborhoodMapCanvas(currentSelectedBairro, bairroCheckIns, genPinMap),
              new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Map timeout')), 4000))
            ]);
          } catch (genErr) {
            console.warn('Erro ao gerar mapa geral:', genErr);
          }

          if (generalMapImg) {
            doc.addImage(generalMapImg, 'PNG', 14, 44, 269, 138);
          }
        }

        for (let bIdx = 0; bIdx < targetBairros.length; bIdx++) {
          const bairro = targetBairros[bIdx];
          const nCheckIns = getCheckInsForNeighborhood(bairro, bairroCheckIns);
          if (nCheckIns.length === 0) continue;

          // Permite que o navegador atualize o feedback e mantenha a UI fluida
          await new Promise(resolve => setTimeout(resolve, 40));
          setExportFeedback(`Exportando Bairro ${bIdx + 1} de ${targetBairros.length}: ${bairro.name} (${nCheckIns.length} ruas)...`);

          const bAbord = nCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
          const bCom = nCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);
          const bSant = nCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos || 0), 0);
          const bMat = nCheckIns.reduce((acc, c) => {
            const m = c.materialsDelivered;
            return acc + (m.santinhos || 0) + (m.adesivo_bola || 0) + (m.adesivo_parachoque || 0) + (m.colinhas || 0);
          }, 0);

          // 1. PÁGINA DO DASHBOARD DO BAIRRO (MAPA COM RUAS NO LEITO VIÁRIO + KPIS)
          // Se for único bairro selecionado, esta é a PÁGINA 1 direta!
          if (isAllBairrosMode || bIdx > 0) {
            doc.addPage('a4', 'landscape');
          }

          drawHeaderBanner(
            `SISTEMA DE MILITÂNCIA SÃO JOSÉ - RELATÓRIO TERRITORIAL: ${bairro.name.toUpperCase()} (${bairro.zone})`,
            `Delimitação Territorial Oficial e Ruas Auditadas no Leito Viário (${nCheckIns.length} ruas) | Período: ${selectedWeekLabel}`
          );

          // 6 Cards de Indicadores do Bairro
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(14, 27, 269, 14, 2, 2, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(14, 27, 269, 14, 2, 2, 'D');

          const singleBairroKpis = [
            { label: 'POPULAÇÃO (IBGE)', val: `${(bairro.population || 0).toLocaleString('pt-BR')} hab.` },
            { label: 'ELEITORES ESTIMADOS', val: `${(bairro.votersEstimated || 0).toLocaleString('pt-BR')}` },
            { label: 'RUAS AUDITADAS', val: `${nCheckIns.length} ruas` },
            { label: 'ABORDAGENS DIRETAS', val: `${bAbord} eleitores` },
            { label: 'COMÉRCIOS ATENDIDOS', val: `${bCom} pontos` },
            { label: 'MATERIAIS ENTREGUES', val: `${bMat.toLocaleString('pt-BR')}` },
          ];

          const sKpiWidth = 269 / singleBairroKpis.length;
          singleBairroKpis.forEach((kpi, idx) => {
            const xPos = 14 + (idx * sKpiWidth) + (sKpiWidth / 2);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(100, 116, 139);
            doc.text(kpi.label, xPos, 31.5, { align: 'center' });

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(30, 58, 138);
            doc.text(kpi.val, xPos, 37.5, { align: 'center' });
          });

          // -----------------------------------------------------------
          // 1. NUMERAÇÃO SEQUENCIAL DE PINS POR MILITANTE E MAPA DO BAIRRO
          // -----------------------------------------------------------
          const { pinMap: bPinMap } = buildMilitantSequentialPinMap(
            nCheckIns,
            militants,
            teams
          );

          // Mapa com ruas pintadas em vermelho exatamente no leito viário e pins numerados sincronizados
          let bairroMapCanvas = '';
          try {
            bairroMapCanvas = await Promise.race([
              generateNeighborhoodMapCanvas(bairro, nCheckIns, bPinMap),
              new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Map timeout')), 4000))
            ]);
          } catch (mapErr) {
            console.warn('Erro ao gerar mapa do bairro:', mapErr);
          }
          if (bairroMapCanvas) {
            doc.addImage(bairroMapCanvas, 'PNG', 14, 44, 269, 138);
          }

          // -----------------------------------------------------------
          // 2. DEPOIS DO MAPA: "Dashboard Geral Consolidado Pós-Mapas" (SOLICITADO)
          // Com gráficos e cards das pessoas abordadas, número de ruas, comércios,
          // santinhos e materiais.
          // -----------------------------------------------------------
          await new Promise(resolve => setTimeout(resolve, 30));
          setExportFeedback(`Gerando Dashboard Geral Consolidado Pós-Mapas: ${bairro.name}...`);
          doc.addPage('a4', 'landscape');

          drawHeaderBanner(
            `SISTEMA DE MILITÂNCIA SÃO JOSÉ - DASHBOARD GERAL CONSOLIDADO PÓS-MAPAS: ${bairro.name.toUpperCase()}`,
            `Resumo Executivo Consolidado • Pessoas Abordadas, Ruas Percorridas e Distribuição de Materiais | Período: ${selectedWeekLabel}`
          );

          // 6 Cards de Indicadores do Bairro
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(14, 28, 269, 17, 2, 2, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(14, 28, 269, 17, 2, 2, 'D');

          const bPostMapKpiItems = [
            { label: 'PESSOAS ABORDADAS', val: `${bAbord}` },
            { label: 'RUAS AUDITADAS', val: `${nCheckIns.length}` },
            { label: 'COMÉRCIOS ATENDIDOS', val: `${bCom}` },
            { label: 'SANTINHOS DISTRIBUÍDOS', val: bSant.toLocaleString('pt-BR') },
            { label: 'TOTAL DE MATERIAIS', val: bMat.toLocaleString('pt-BR') },
            { label: 'MILITANTES ATIVOS', val: `${new Set(nCheckIns.map(c => c.militantName)).size}` }
          ];

          const bPostColW = 269 / bPostMapKpiItems.length;
          bPostMapKpiItems.forEach((kpi, idx) => {
            const kX = 14 + idx * bPostColW;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.5);
            doc.setTextColor(100, 116, 139);
            doc.text(kpi.label, kX + bPostColW / 2, 33.5, { align: 'center' });

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(15, 23, 42);
            doc.text(kpi.val, kX + bPostColW / 2, 40.5, { align: 'center' });

            if (idx < bPostMapKpiItems.length - 1) {
              doc.setDrawColor(226, 232, 240);
              doc.line(kX + bPostColW, 30, kX + bPostColW, 43);
            }
          });

          // Gráfico de Produtividade & Materiais do Bairro (Renderizado instantaneamente em alta resolução via Canvas, sem travar o navegador)
          let bChartCaptured = false;
          try {
            const canvasFallback = generateMaterialsChartCanvas(bairro, nCheckIns);
            if (canvasFallback) {
              doc.addImage(canvasFallback, 'PNG', 14, 48, 269, 72);
              bChartCaptured = true;
            }
          } catch (canvasErr) {
            console.warn('Canvas chart falhou:', canvasErr);
          }

          // Tabela de Desempenho dos Militantes no Bairro
          // Regra de ouro: APENAS militantes com lançamentos neste bairro
          const bMilitantsWithLaunches = militants.filter(mil => {
            return nCheckIns.some(c => c.militantId === mil.id || (c.militantName && mil.name && c.militantName.trim().toLowerCase() === mil.name.trim().toLowerCase()));
          });

          const bMilitantStats = bMilitantsWithLaunches.map(mil => {
            const milCheckIns = nCheckIns.filter(c => c.militantId === mil.id || (c.militantName && mil.name && c.militantName.trim().toLowerCase() === mil.name.trim().toLowerCase()));
            const streetsCount = milCheckIns.length;
            const santinhos = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos || 0), 0);
            const abordagens = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
            const comercios = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);
            const totalMat = milCheckIns.reduce((acc, c) => {
              const m = c.materialsDelivered;
              return acc + (m.santinhos || 0) + (m.adesivo_bola || 0) + (m.adesivo_parachoque || 0) + (m.colinhas || 0);
            }, 0);
            const team = teams.find(t => t.id === mil.teamId);
            return {
              name: mil.name,
              teamName: team?.name || 'Equipe Geral',
              streetsCount,
              abordagens,
              comercios,
              santinhos,
              totalMat,
              completionRate: streetsCount > 0 ? 100 : 0
            };
          }).filter(m => m.streetsCount > 0).sort((a, b) => b.abordagens - a.abordagens);

          const bTableStartY = bChartCaptured ? 123 : 50;
          const bSummaryRows = bMilitantStats.map((mil, idx) => [
            `${idx + 1}º`,
            mil.name,
            mil.teamName,
            String(mil.streetsCount),
            String(mil.abordagens),
            String(mil.comercios),
            mil.santinhos.toLocaleString('pt-BR'),
            mil.totalMat.toLocaleString('pt-BR'),
            `${mil.completionRate}%`
          ]);

          if (bSummaryRows.length > 0) {
            autoTable(doc, {
              head: [[
                '#',
                'Militante Atuando no Bairro',
                'Equipe',
                'Ruas',
                'Pessoas Abordadas',
                'Comércio',
                'Santinhos',
                'Total Materiais',
                'Status'
              ]],
              body: bSummaryRows,
              startY: bTableStartY,
              margin: { left: 14, right: 14 },
              styles: {
                fontSize: 7.2,
                cellPadding: 1.8,
                textColor: [30, 41, 59],
                lineColor: [226, 232, 240],
                lineWidth: 0.1
              },
              headStyles: {
                fillColor: [30, 58, 138],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 7.5
              },
              columnStyles: {
                0: { cellWidth: 10, halign: 'center', fontStyle: 'bold', textColor: [100, 116, 139] },
                1: { cellWidth: 58, fontStyle: 'bold' },
                2: { cellWidth: 35 },
                3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
                4: { cellWidth: 34, halign: 'center', fontStyle: 'bold', textColor: [147, 51, 234] },
                5: { cellWidth: 24, halign: 'center', fontStyle: 'bold', textColor: [5, 150, 105] },
                6: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [37, 99, 235] },
                7: { cellWidth: 32, halign: 'center', fontStyle: 'bold' },
                8: { cellWidth: 26, halign: 'center', fontStyle: 'bold' }
              }
            });
          }

          // -----------------------------------------------------------
          // 3. TABELA ÚNICA DE RUAS DO BAIRRO (COM COLUNA MILITANTE)
          // Sem cabeçalho e sem rodapé nas páginas de auditoria/galeria
          // -----------------------------------------------------------
          await new Promise(resolve => setTimeout(resolve, 30));
          setExportFeedback(`Exportando Tabela Única de Ruas: ${bairro.name}...`);

          // Ordena check-ins pelo número do pin gerado
          const sortedCheckIns = [...nCheckIns].sort((a, b) => (bPinMap[a.id] || 0) - (bPinMap[b.id] || 0));

          doc.addPage('a4', 'landscape');
          const tablePageNum = doc.getNumberOfPages();
          noHeaderFooterPages.add(tablePageNum);

          // Banner compacto e elegante da Tabela Única de Ruas
          doc.setFillColor(30, 58, 138); // Deep Navy Blue
          doc.roundedRect(10, 8, 277, 9, 1.5, 1.5, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(255, 255, 255);
          doc.text(
            `AUDITORIA DE RUAS • TABELA ÚNICA • BAIRRO ${bairro.name.toUpperCase()} (${sortedCheckIns.length} RUAS AUDITADAS)`,
            14,
            14
          );

          // Resumo à direita
          const totalBairroPhotos = sortedCheckIns.reduce((acc, c) => acc + getAllPhotosForCheckIn(c).length, 0);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(219, 234, 254);
          doc.text(
            `${sortedCheckIns.length} ruas • ${totalBairroPhotos} fotos anexadas • ${bAbord} abordagens • ${bMat.toLocaleString('pt-BR')} materiais`,
            283,
            14,
            { align: 'right' }
          );

          // Tabela Única com TODAS as ruas do bairro e coluna MILITANTE
          const tableRows = sortedCheckIns.map(chk => {
            const photos = getAllPhotosForCheckIn(chk);
            const pNum = bPinMap[chk.id] || 1;
            const mObj = militants.find(m => m.id === chk.militantId || m.name.toLowerCase() === (chk.militantName || '').toLowerCase());
            const mName = chk.militantName || mObj?.name || 'Militante';
            const mMat = mObj?.matricula ? ` (${mObj.matricula})` : '';

            return [
              formatDateTimeBR(chk.timestamp),
              chk.houseNumberRange && chk.houseNumberRange !== 'Trecho Geral'
                ? `${chk.streetName} (${chk.houseNumberRange})`
                : chk.streetName,
              `${mName}${mMat}`,
              `#${pNum}`,
              String(chk.materialsDelivered.abordagens || 0),
              String(chk.materialsDelivered.comercio || 0),
              (chk.materialsDelivered.santinhos || 0).toLocaleString('pt-BR'),
              `${photos.length} foto(s)`,
              chk.status === 'validado' ? 'VALIDADO' : 'PENDENTE'
            ];
          });

          autoTable(doc, {
            head: [[
              'Data / Hora',
              'Logradouro / Trecho Percorrido',
              'Militante Responsável',
              'Pin nº',
              'Abordagens',
              'Comércio',
              'Santinhos',
              'Comprovante',
              'Status'
            ]],
            body: tableRows,
            startY: 19,
            margin: { left: 10, right: 10 },
            styles: {
              fontSize: 7.2,
              cellPadding: 2,
              textColor: [30, 41, 59],
              lineColor: [226, 232, 240],
              lineWidth: 0.1
            },
            headStyles: {
              fillColor: [30, 58, 138],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 7.5
            },
            columnStyles: {
              0: { cellWidth: 26 },
              1: { cellWidth: 70, fontStyle: 'bold' },
              2: { cellWidth: 50, fontStyle: 'bold', textColor: [30, 58, 138] },
              3: { cellWidth: 16, halign: 'center', fontStyle: 'bold', textColor: [220, 38, 38] },
              4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
              5: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
              6: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
              7: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
              8: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }
            },
            didDrawPage: (data) => {
              if (data.pageNumber > tablePageNum) {
                noHeaderFooterPages.add(data.pageNumber);
              }
            }
          });

          // -----------------------------------------------------------
          // 3. GALERIA DE FOTOS ÚNICA DO BAIRRO (MÍNIMO 15 FOTOS POR PÁGINA)
          // -----------------------------------------------------------
          const bairroAllPhotos: {
            photo: string;
            streetName: string;
            timestamp: string;
            pinNum: number;
            militantName: string;
          }[] = [];

          sortedCheckIns.forEach(chk => {
            const pList = getAllPhotosForCheckIn(chk);
            const pNum = bPinMap[chk.id] || 1;
            const mObj = militants.find(m => m.id === chk.militantId || m.name.toLowerCase() === (chk.militantName || '').toLowerCase());
            const mName = chk.militantName || mObj?.name || 'Militante';
            pList.forEach(p => {
              bairroAllPhotos.push({
                photo: p,
                streetName: chk.streetName,
                timestamp: chk.timestamp,
                pinNum: pNum,
                militantName: mName
              });
            });
          });

          if (bairroAllPhotos.length === 0) {
            doc.addPage('a4', 'landscape');
            noHeaderFooterPages.add(doc.getNumberOfPages());
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(10, 10, 277, 30, 2, 2, 'F');
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(148, 163, 184);
            doc.text(`Nenhuma foto de comprovação anexada para as ruas do bairro ${bairro.name}.`, 148, 26, { align: 'center' });
          } else {
            await new Promise(resolve => setTimeout(resolve, 30));
            setExportFeedback(`Pré-carregando ${bairroAllPhotos.length} fotos únicas do bairro ${bairro.name}...`);
            const preloadedImages = await Promise.all(
              bairroAllPhotos.map(async (item) => {
                const b64 = await loadBase64Image(item.photo);
                return { ...item, base64: b64 };
              })
            );

            // Grade de alta densidade: 5 colunas x 3 linhas = 15 fotos por página (MÍNIMO 15 FOTOS POR PÁGINA)
            const photosPerPage = 15;
            const totalGalleryPages = Math.ceil(preloadedImages.length / photosPerPage);

            const cols = 5;
            const cardW = 52.6; // 5 * 52.6 = 263mm + 4 * 3.5mm = 277mm
            const cardH = 55;   // 3 * 55 = 165mm + 2 * 3.5mm = 172mm
            const gapX = 3.5;
            const gapY = 3.5;
            const startX = 10;
            const startY = 21; // Logo após o banner do topo (y=8 a 17)

            for (let pageIdx = 0; pageIdx < totalGalleryPages; pageIdx++) {
              doc.addPage('a4', 'landscape');
              const galPageNum = doc.getNumberOfPages();
              noHeaderFooterPages.add(galPageNum);

              // Banner verde esmeralda no topo (y=8, h=9mm)
              doc.setFillColor(5, 150, 105); // Emerald 600
              doc.roundedRect(10, 8, 277, 9, 1.5, 1.5, 'F');

              doc.setFont('helvetica', 'bold');
              doc.setFontSize(8.5);
              doc.setTextColor(255, 255, 255);
              const pageSuffix = totalGalleryPages > 1 ? ` (Página ${pageIdx + 1} de ${totalGalleryPages})` : '';
              doc.text(
                `GALERIA FOTOGRÁFICA ÚNICA • BAIRRO ${bairro.name.toUpperCase()}${pageSuffix} • 15 FOTOS POR PÁGINA`,
                14,
                14
              );

              doc.setFont('helvetica', 'normal');
              doc.setFontSize(7.5);
              doc.setTextColor(209, 250, 229);
              const startPhotoNum = pageIdx * photosPerPage + 1;
              const endPhotoNum = Math.min((pageIdx + 1) * photosPerPage, preloadedImages.length);
              doc.text(
                `Exibindo fotos ${startPhotoNum} a ${endPhotoNum} de ${preloadedImages.length} • Todas as fotos sincronizadas com pins no mapa`,
                283,
                14,
                { align: 'right' }
              );

              // Renderiza as até 15 fotos desta página
              const pagePhotos = preloadedImages.slice(pageIdx * photosPerPage, (pageIdx + 1) * photosPerPage);

              for (let idx = 0; idx < pagePhotos.length; idx++) {
                const item = pagePhotos[idx];
                const col = idx % cols;
                const row = Math.floor(idx / cols);

                const cX = startX + col * (cardW + gapX);
                const cY = startY + row * (cardH + gapY);

                // Fundo do card
                doc.setFillColor(255, 255, 255);
                doc.setDrawColor(203, 213, 225);
                doc.setLineWidth(0.2);
                doc.roundedRect(cX, cY, cardW, cardH, 1.5, 1.5, 'FD');

                // Imagem (49.6mm x 37mm)
                const imgW = cardW - 3;
                const imgH = 37;
                if (item.base64) {
                  try {
                    doc.addImage(item.base64, 'JPEG', cX + 1.5, cY + 1.5, imgW, imgH);
                  } catch {
                    doc.setFillColor(241, 245, 249);
                    doc.rect(cX + 1.5, cY + 1.5, imgW, imgH, 'F');
                  }
                } else {
                  doc.setFillColor(241, 245, 249);
                  doc.rect(cX + 1.5, cY + 1.5, imgW, imgH, 'F');
                }

                // Badge de Pin Vermelho com borda arredondada no topo da foto
                doc.setFillColor(220, 38, 38);
                doc.roundedRect(cX + 2.5, cY + 2.5, 16, 5, 1, 1, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.5);
                doc.setTextColor(255, 255, 255);
                doc.text(`Pin #${item.pinNum}`, cX + 10.5, cY + 6, { align: 'center' });

                // Linha 1: Nome da Rua
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.2);
                doc.setTextColor(30, 41, 59);
                const shortStreet = item.streetName.length > 22
                  ? item.streetName.substring(0, 20) + '...'
                  : item.streetName;
                doc.text(shortStreet, cX + 2, cY + imgH + 4.8);

                // Linha 2: Militante
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(5.5);
                doc.setTextColor(37, 99, 235);
                const shortMil = item.militantName.length > 24
                  ? item.militantName.substring(0, 22) + '...'
                  : item.militantName;
                doc.text(`Militante: ${shortMil}`, cX + 2, cY + imgH + 8.5);

                // Linha 3: Data/Hora e Status (SEM GPS!)
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(5.2);
                doc.setTextColor(100, 116, 139);
                const timePart = formatDateTimeBR(item.timestamp).split(' ')[1] || '';
                const datePart = formatDateTimeBR(item.timestamp).split(' ')[0] || '';
                doc.text(`${datePart} ${timePart} • Validado`, cX + 2, cY + imgH + 12);
              }
            }
          }
        }

        // Global pagination pass for All Pages (apenas páginas sem noHeaderFooterPages)
        const totalPages = doc.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
          if (!noHeaderFooterPages.has(p)) {
            doc.setPage(p);
            drawFooter(p, totalPages);
          }
        }

        const sanitizedBairro = isAllBairrosMode ? 'todos_os_bairros' : currentSelectedBairro.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const sanitizedWeek = selectedWeek.replace(/[^a-zA-Z0-9_-]/g, '_');
        const reportFileName = `relatorio_territorial_${sanitizedBairro}_${sanitizedWeek}.pdf`;
        finalizeAndSavePdf(doc, reportFileName, `Relatório Territorial (${isAllBairrosMode ? 'Todos os Bairros' : currentSelectedBairro.name})`);
        return;
      }

      // ================= 2. RELATÓRIO DE DESEMPENHO & COBERTURA POR MILITANTE =================
      if (viewGrouping === 'por_militante') {
        setExportFeedback('Gerando Relatório de Desempenho por Militante...');

        // PAGE 1: RESUMO EXECUTIVO E GRÁFICOS
        drawHeaderBanner(
          'SISTEMA DE MILITÂNCIA SÃO JOSÉ - RELATÓRIO DE DESEMPENHO POR MILITANTE',
          `${selectedMilitantObj ? `Militante: ${selectedMilitantObj.name.toUpperCase()} (${selectedMilitantObj.matricula})` : `Todos os Militantes Ativos (${activeMilitants.length})`} | Período: ${selectedWeekLabel}`
        );

        // KPI Summary Section
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 28, 269, 17, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, 28, 269, 17, 2, 2, 'D');

        const mKpiItems = [
          { label: 'TOTAL DE RUAS', val: `${filteredCheckIns.length}` },
          { label: 'ABORDAGENS DIRETAS', val: `${totalAbordagens}` },
          { label: 'COMÉRCIOS ATENDIDOS', val: `${totalComercios}` },
          { label: 'SANTINHOS', val: `${totalSantinhos.toLocaleString('pt-BR')}` },
          { label: 'ADESIVOS BOLA', val: `${totalAdesivoBola.toLocaleString('pt-BR')}` },
          { label: 'TOTAL MATERIAIS', val: `${totalMateriaisGeral.toLocaleString('pt-BR')}` },
        ];

        const mKpiWidth = 269 / mKpiItems.length;
        mKpiItems.forEach((kpi, idx) => {
          const xPos = 14 + (idx * mKpiWidth) + (mKpiWidth / 2);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text(kpi.label, xPos, 33.5, { align: 'center' });

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10.5);
          doc.setTextColor(30, 58, 138);
          doc.text(kpi.val, xPos, 41, { align: 'center' });
        });

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
            const finalImgHeight = Math.min(imgHeight, 115);
            doc.addImage(imgData, 'PNG', 14, 48, imgWidth, finalImgHeight);
          } catch (err) {
            console.warn('Erro ao renderizar gráficos:', err);
          }
        }
        drawFooter(1);

        // PAGE 2: TABELA DE RUAS PERCORRIDAS PELO(S) MILITANTE(S)
        doc.addPage('a4', 'landscape');
        drawHeaderBanner(
          'DETALHAMENTO DE RUAS & COBERTURA POR MILITANTE',
          `Registro Georreferenciado de Ruas Percorridas | Período: ${selectedWeekLabel}`
        );

        const milStreetRows = filteredCheckIns.map(chk => {
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
            chk.status === 'validado' ? 'VALIDADO ✓' : 'PENDENTE'
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
          body: milStreetRows.length > 0 ? milStreetRows : [['-', 'Nenhum registro encontrado no período', '-', '-', '-', '-', '-', '-', '-']],
          startY: 28,
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

        const sanitizedWeek = selectedWeek.replace(/[^a-zA-Z0-9_-]/g, '_');
        const reportFileName = `relatorio_militantes_${sanitizedWeek}.pdf`;
        finalizeAndSavePdf(doc, reportFileName, 'Relatório de Desempenho por Militante');
        return;
      }

      // ================= 3. RELATÓRIO OFICIAL DE PRODUTIVIDADE & METAS DE CAMPO =================
      if (viewGrouping === 'tabela_produtividade') {
        setExportFeedback('Gerando Relatório de Produtividade & Metas...');

        // PAGE 1: RESUMO EXECUTIVO, GRÁFICOS & TABELA DE METAS
        drawHeaderBanner(
          'SISTEMA DE MILITÂNCIA SÃO JOSÉ - RELATÓRIO OFICIAL DE PRODUTIVIDADE & METAS',
          `Ranking de Rendimento, Metas Semanais e Folha de Diárias Estimada | Período: ${selectedWeekLabel}`
        );

        // KPI Summary Section
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 28, 269, 17, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, 28, 269, 17, 2, 2, 'D');

        const totalStreetsSum = productivityData.reduce((sum, d) => sum + d.streetsCount, 0);
        const totalPaySum = productivityData.reduce((sum, d) => sum + d.totalPay, 0);
        const avgCompletion = productivityData.length > 0 ? Math.round(productivityData.reduce((sum, d) => sum + d.completionRate, 0) / productivityData.length) : 0;

        const prodKpis = [
          { label: 'TOTAL RUAS PERCORRIDAS', val: `${totalStreetsSum} ruas` },
          { label: 'ATINGIMENTO MÉDIO', val: `${avgCompletion}% da meta` },
          { label: 'ABORDAGENS DIRETAS', val: `${totalAbordagens}` },
          { label: 'COMÉRCIOS ATENDIDOS', val: `${totalComercios}` },
          { label: 'TOTAL MATERIAIS', val: `${totalMateriaisGeral.toLocaleString('pt-BR')}` },
          { label: 'FOLHA DIÁRIAS (ESTIMADA)', val: `R$ ${totalPaySum.toFixed(2).replace('.', ',')}` },
        ];

        const pKpiWidth = 269 / prodKpis.length;
        prodKpis.forEach((kpi, idx) => {
          const xPos = 14 + (idx * pKpiWidth) + (pKpiWidth / 2);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(100, 116, 139);
          doc.text(kpi.label, xPos, 33.5, { align: 'center' });

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(30, 58, 138);
          doc.text(kpi.val, xPos, 41, { align: 'center' });
        });

        let nextStartY = 48;
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
            const finalImgHeight = Math.min(imgHeight, 58);
            doc.addImage(imgData, 'PNG', 14, 48, imgWidth, finalImgHeight);
            nextStartY = 48 + finalImgHeight + 4;
          } catch (err) {
            console.warn('Erro ao renderizar gráficos:', err);
          }
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text('TABELA CONSOLIDADA DE PRODUTIVIDADE & METAS POR MILITANTE', 14, nextStartY);

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

        const totalAbordagensSum = productivityData.reduce((sum, d) => sum + d.abordagens, 0);
        const totalComerciosSum = productivityData.reduce((sum, d) => sum + d.comercios, 0);
        const totalMateriaisSum = productivityData.reduce((sum, d) => sum + d.totalMat, 0);

        prodTableRows.push([
          'TOTAL',
          `${productivityData.length} MILITANTES ATIVOS`,
          '-',
          `${totalStreetsSum} RUAS`,
          `${avgCompletion}%`,
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

        const sanitizedWeek = selectedWeek.replace(/[^a-zA-Z0-9_-]/g, '_');
        const reportFileName = `relatorio_produtividade_metas_${sanitizedWeek}.pdf`;
        finalizeAndSavePdf(doc, reportFileName, 'Relatório Oficial de Produtividade & Metas');
        return;
      }

      // ================= 4. RELATÓRIO TABELA COMPLETA (COMPILADO GERAL DE TODOS OS RELATÓRIOS) =================
      if (viewGrouping === 'tabela_geral') {
        setExportFeedback('Gerando Compilado Geral de Todos os Relatórios (Produtividade, Folha, Militantes, Bairros e Ruas)...');

        // PAGE 1: RESUMO EXECUTIVO & GRÁFICOS GERAIS
        drawHeaderBanner(
          'SISTEMA DE MILITÂNCIA SÃO JOSÉ - RELATÓRIO CONSOLIDADO COMPILADO GERAL',
          `Compilado Integral: Produtividade, Folha de Pagamentos, Militantes, Bairros e Ruas Georreferenciadas | Período: ${selectedWeekLabel}`
        );

        // KPI Summary Cards
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 28, 269, 17, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, 28, 269, 17, 2, 2, 'D');

        const totalPaySumCalc = productivityData.reduce((sum, d) => sum + d.totalPay, 0);

        const generalKpiItems = [
          { label: 'TOTAL DE RUAS', val: `${filteredCheckIns.length}` },
          { label: 'ABORDAGENS DIRETAS', val: `${totalAbordagens}` },
          { label: 'COMÉRCIOS ATENDIDOS', val: `${totalComercios}` },
          { label: 'SANTINHOS', val: `${totalSantinhos.toLocaleString('pt-BR')}` },
          { label: 'ADESIVOS BOLA', val: `${totalAdesivoBola.toLocaleString('pt-BR')}` },
          { label: 'TOTAL MATERIAIS', val: `${totalMateriaisGeral.toLocaleString('pt-BR')}` },
          { label: 'FOLHA DE PAGAMENTO', val: `R$ ${totalPaySumCalc.toFixed(2).replace('.', ',')}` },
        ];

        const gKpiWidth = 269 / generalKpiItems.length;
        generalKpiItems.forEach((kpi, idx) => {
          const xPos = 14 + (idx * gKpiWidth) + (gKpiWidth / 2);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(100, 116, 139);
          doc.text(kpi.label, xPos, 33.5, { align: 'center' });

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(idx === 6 ? 16 : 30, idx === 6 ? 185 : 58, idx === 6 ? 129 : 138);
          doc.text(kpi.val, xPos, 41, { align: 'center' });
        });

        // Charts
        if (chartsContainerRef.current) {
          try {
            const chartCanvas = await safeHtml2Canvas(chartsContainerRef.current, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff'
            }, 3000);
            if (chartCanvas) {
              const imgData = chartCanvas.toDataURL('image/png');
              const imgWidth = 269;
              const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
              const finalImgHeight = Math.min(imgHeight, 115);
              doc.addImage(imgData, 'PNG', 14, 48, imgWidth, finalImgHeight);
            }
          } catch (err) {
            console.warn('Erro ao renderizar gráficos no PDF:', err);
          }
        }
        drawFooter(1);

        // PAGE 2: SEÇÃO 1 DO COMPILADO - TABELA CONSOLIDADA DE PRODUTIVIDADE & FOLHA DE PAGAMENTOS
        doc.addPage('a4', 'landscape');
        drawHeaderBanner(
          'COMPILADO GERAL (SEÇÃO 1/4) - PRODUTIVIDADE & FOLHA DE PAGAMENTOS INTEGRADA',
          `Diárias, Dias Trabalhados Apurados na Folha, Metas e Total a Pagar | Período: ${selectedWeekLabel}`
        );

        const prodTableRows = productivityData.map((item, idx) => [
          `#${idx + 1}`,
          `${item.name} (${item.matricula})`,
          item.teamName,
          `${item.streetsCount} / ${item.weeklyGoal}`,
          `${item.completionRate}%`,
          `${item.abordagens}`,
          `${item.comercios}`,
          `${item.totalMat.toLocaleString('pt-BR')}`,
          `R$ ${item.dailyRate.toFixed(2).replace('.', ',')}`,
          `${item.daysWorked} d`,
          (item.payrollStatus || 'Pendente').toUpperCase(),
          `R$ ${item.totalPay.toFixed(2).replace('.', ',')}`
        ]);

        const totalStreetsSum = productivityData.reduce((sum, d) => sum + d.streetsCount, 0);
        const totalAbordagensSum = productivityData.reduce((sum, d) => sum + d.abordagens, 0);
        const totalComerciosSum = productivityData.reduce((sum, d) => sum + d.comercios, 0);
        const totalMateriaisSum = productivityData.reduce((sum, d) => sum + d.totalMat, 0);
        const totalDaysWorkedSum = productivityData.reduce((sum, d) => sum + d.daysWorked, 0);

        prodTableRows.push([
          'TOTAL',
          `${productivityData.length} MILITANTES`,
          '-',
          `${totalStreetsSum} RUAS`,
          '100%',
          `${totalAbordagensSum}`,
          `${totalComerciosSum}`,
          `${totalMateriaisSum.toLocaleString('pt-BR')}`,
          '-',
          `${totalDaysWorkedSum} d`,
          'HOMOLOGADO',
          `R$ ${totalPaySumCalc.toFixed(2).replace('.', ',')}`
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
            'Diária (R$)',
            'Dias Trab.',
            'Status Folha',
            'Total a Pagar'
          ]],
          body: prodTableRows,
          startY: 28,
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
            fontSize: 7.5
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          columnStyles: {
            0: { cellWidth: 8, halign: 'center' },
            1: { cellWidth: 46, fontStyle: 'bold' },
            2: { cellWidth: 22 },
            3: { cellWidth: 22, halign: 'center' },
            4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
            5: { cellWidth: 18, halign: 'center' },
            6: { cellWidth: 16, halign: 'center' },
            7: { cellWidth: 20, halign: 'center' },
            8: { cellWidth: 22, halign: 'right' },
            9: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
            10: { cellWidth: 24, halign: 'center' },
            11: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
          },
          didDrawPage: (data) => {
            drawFooter(data.pageNumber);
          }
        });

        // PAGE 3: SEÇÃO 2 DO COMPILADO - FICHAS INDIVIDUAIS POR MILITANTE
        doc.addPage('a4', 'landscape');
        drawHeaderBanner(
          'COMPILADO GERAL (SEÇÃO 2/4) - DETALHAMENTO DE RUAS POR MILITANTE',
          `Fichas Individuais, Matrículas, Diárias da Folha e Ruas Executadas | Período: ${selectedWeekLabel}`
        );

        let currentY = 28;
        activeMilitants.forEach((mil, idx) => {
          const milCheckIns = filteredCheckIns.filter(c => c.militantId === mil.id || c.militantName === mil.name);
          const milProd = productivityData.find(p => p.id === mil.id);

          if (currentY > 165) {
            doc.addPage('a4', 'landscape');
            drawHeaderBanner(
              'COMPILADO GERAL (SEÇÃO 2/4) - DETALHAMENTO DE RUAS POR MILITANTE (CONT.)',
              `Fichas Individuais de Militância e Registros de Campo | Período: ${selectedWeekLabel}`
            );
            currentY = 28;
          }

          // Militant Card Header
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(14, currentY, 269, 10, 1.5, 1.5, 'F');
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(14, currentY, 269, 10, 1.5, 1.5, 'D');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(`${mil.name} (${mil.matricula || 'MAT-000'})`, 18, currentY + 6.5);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          const teamLabel = mil.teamId === 'team-alpha' ? 'Equipe Alpha' : (mil.teamId === 'team-bravo' ? 'Equipe Bravo' : 'Equipe Geral');
          doc.text(`Equipe: ${teamLabel} | Tel: ${mil.phone} | Diária: R$ ${milProd?.dailyRate || 150},00 | Folha Total: R$ ${(milProd?.totalPay || 0).toFixed(2).replace('.', ',')}`, 95, currentY + 6.5);

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138);
          doc.text(`${milCheckIns.length} ruas executadas`, 278, currentY + 6.5, { align: 'right' });

          currentY += 12;

          const milRows = milCheckIns.map(chk => [
            chk.timestamp,
            chk.neighborhoodName,
            chk.streetName,
            `${chk.latitude.toFixed(4)}, ${chk.longitude.toFixed(4)}`,
            `${chk.materialsDelivered.abordagens || 0}`,
            `${chk.materialsDelivered.comercio || 0}`,
            `${chk.materialsDelivered.santinhos} sant. / ${chk.materialsDelivered.adesivo_bola} bola`,
            chk.status === 'validado' ? 'VALIDADO ✓' : 'PENDENTE'
          ]);

          if (milRows.length > 0) {
            autoTable(doc, {
              head: [[
                'Data / Hora',
                'Bairro',
                'Logradouro / Trecho',
                'GPS (Lat, Lng)',
                'Abord.',
                'Comércio',
                'Materiais Entregues',
                'Status'
              ]],
              body: milRows,
              startY: currentY,
              margin: { left: 14, right: 14, bottom: 28 },
              styles: {
                fontSize: 7,
                cellPadding: 1.5,
                textColor: [30, 41, 59],
                lineColor: [226, 232, 240],
                lineWidth: 0.1
              },
              headStyles: {
                fillColor: [248, 250, 252],
                textColor: [71, 85, 105],
                fontStyle: 'bold',
                fontSize: 7
              },
              columnStyles: {
                0: { cellWidth: 26 },
                1: { cellWidth: 32 },
                2: { cellWidth: 70 },
                3: { cellWidth: 35, font: 'courier' },
                4: { cellWidth: 16, halign: 'center' },
                5: { cellWidth: 18, halign: 'center' },
                6: { cellWidth: 46 },
                7: { cellWidth: 26, halign: 'center', fontStyle: 'bold' }
              },
              didDrawPage: (data) => {
                drawFooter(data.pageNumber);
              }
            });
            currentY = (doc as any).lastAutoTable.finalY + 6;
          } else {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            doc.text('Nenhuma rua registrada para este militante no período.', 18, currentY + 3);
            currentY += 8;
          }
        });

        // PAGE 4: SEÇÃO 3 DO COMPILADO - AUDITORIA TERRITORIAL CONSOLIDADA DE TODOS OS BAIRROS
        doc.addPage('a4', 'landscape');
        drawHeaderBanner(
          'COMPILADO GERAL (SEÇÃO 3/4) - AUDITORIA TERRITORIAL CONSOLIDADA POR BAIRROS',
          `Cobertura Territorial, População IBGE, Eleitores e Ruas Registradas em São José - SC | Período: ${selectedWeekLabel}`
        );

        const bairrosConsolidatedRows = neighborhoods.map((n, idx) => {
          const nCheckIns = filteredCheckIns.filter(c => c.neighborhoodId === n.id || c.neighborhoodName.toLowerCase().includes(n.name.toLowerCase()));
          const nStreets = nCheckIns.length;
          const nCoverage = Math.min(Math.round((nStreets / Math.max(n.totalStreets, 1)) * 100), 100);
          const nAbord = nCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
          const nMat = nCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos + c.materialsDelivered.adesivo_bola + c.materialsDelivered.adesivo_parachoque + c.materialsDelivered.colinhas), 0);
          let nStatus = 'Planejado';
          if (nCoverage >= 70) nStatus = 'Alta Cobertura';
          else if (nCoverage >= 30) nStatus = 'Em Andamento';
          else if (nCoverage > 0) nStatus = 'Iniciado';

          return [
            `#${idx + 1}`,
            n.name,
            n.zone,
            `${n.population.toLocaleString('pt-BR')} hab.`,
            `${n.votersEstimated.toLocaleString('pt-BR')}`,
            `${n.totalStreets}`,
            `${nStreets}`,
            `${nCoverage}%`,
            `${nAbord}`,
            `${nMat.toLocaleString('pt-BR')}`,
            nStatus
          ];
        });

        autoTable(doc, {
          head: [[
            'Pos',
            'Bairro',
            'Zona / Região',
            'População (IBGE)',
            'Eleitores Estimados',
            'Total Ruas',
            'Ruas Feitas',
            '% Cobertura',
            'Abordagens',
            'Materiais',
            'Status Cobertura'
          ]],
          body: bairrosConsolidatedRows,
          startY: 28,
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
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 40, fontStyle: 'bold' },
            2: { cellWidth: 28 },
            3: { cellWidth: 32, halign: 'right' },
            4: { cellWidth: 32, halign: 'right' },
            5: { cellWidth: 22, halign: 'center' },
            6: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
            7: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
            8: { cellWidth: 24, halign: 'center' },
            9: { cellWidth: 25, halign: 'center' },
            10: { cellWidth: 28, halign: 'center' }
          },
          didDrawPage: (data) => {
            drawFooter(data.pageNumber);
          }
        });

        // PAGE 5: SEÇÃO 4 DO COMPILADO - TABELA COMPLETA DE TODAS AS RUAS PERCORRIDAS
        doc.addPage('a4', 'landscape');
        drawHeaderBanner(
          'COMPILADO GERAL (SEÇÃO 4/4) - TABELA COMPLETA DE RUAS & AUDITORIA GEORREFERENCIADA',
          `Registro Geral de Ruas Atendidas, Coordenadas GPS e Validação de Campo | Período: ${selectedWeekLabel}`
        );

        const allStreetRows = filteredCheckIns.map(chk => {
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
            chk.status === 'validado' ? 'VALIDADO ✓' : 'PENDENTE'
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
          body: allStreetRows.length > 0 ? allStreetRows : [['-', 'Nenhum registro encontrado no período', '-', '-', '-', '-', '-', '-', '-']],
          startY: 28,
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

        const sanitizedWeek = selectedWeek.replace(/[^a-zA-Z0-9_-]/g, '_');
        const reportFileName = `relatorio_compilado_geral_completo_${sanitizedWeek}.pdf`;
        finalizeAndSavePdf(doc, reportFileName, 'Relatório Consolidado Compilado Geral de Todos os Relatórios');
        return;
      }

    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      setExportFeedback(`Erro ao processar PDF: ${error?.message || 'Falha na compilação'}. Você também pode utilizar a opção Imprimir do navegador.`);
      setTimeout(() => setExportFeedback(null), 8000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportCSV = () => {
    if (viewGrouping === 'por_bairro') {
      const isAllBairrosMode = selectedBairroId === 'todos';
      const qualifyingBairros = getQualifyingNeighborhoods(neighborhoods, filteredCheckIns);
      const targetCheckIns = isAllBairrosMode
        ? filteredCheckIns.filter(chk => qualifyingBairros.some(b => isCheckInInNeighborhood(chk, b)))
        : filteredCheckIns.filter(chk => 
            chk.neighborhoodId === currentSelectedBairro.id || 
            chk.neighborhoodName.toLowerCase().includes(currentSelectedBairro.name.toLowerCase())
          );

      const headers = ['Bairro', 'Zona', 'Logradouro', 'Data/Hora', 'Militante', 'Matrícula', 'Latitude', 'Longitude', 'Santinhos', 'Adesivo Bola', 'Abordagens', 'Comércio', 'Status'];
      const rows = targetCheckIns.map(c => {
        const bMatch = neighborhoods.find(n => isCheckInInNeighborhood(c, n));
        const bName = bMatch?.name || c.neighborhoodName || currentSelectedBairro.name;
        const bZone = bMatch?.zone || currentSelectedBairro.zone;
        return [
          `"${bName}"`,
          `"${bZone}"`,
          `"${c.streetName}"`,
          c.timestamp,
          `"${c.militantName}"`,
          `"${militants.find(m => m.id === c.militantId)?.matricula || ''}"`,
          c.latitude,
          c.longitude,
          c.materialsDelivered.santinhos,
          c.materialsDelivered.adesivo_bola,
          c.materialsDelivered.abordagens || 0,
          c.materialsDelivered.comercio || 0,
          c.status
        ];
      });
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', isAllBairrosMode ? `relatorio_todos_bairros_qualificados_${selectedWeek}.csv` : `relatorio_bairro_${currentSelectedBairro.name.toLowerCase()}_${selectedWeek}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (viewGrouping === 'tabela_produtividade') {
      const headers = ['Posição', 'Militante', 'Matrícula', 'Equipe', 'Ruas Percorridas', 'Meta Semanal', '% Atingimento', 'Abordagens', 'Comércio', 'Santinhos', 'Total Materiais', 'Status Meta', 'Diárias Estimadas', 'Valor Total R$'];
      const rows = productivityData.map((d, idx) => [
        idx + 1,
        `"${d.name}"`,
        `"${d.matricula}"`,
        `"${d.teamName}"`,
        d.streetsCount,
        d.weeklyGoal,
        `${d.completionRate}%`,
        d.abordagens,
        d.comercios,
        d.santinhos,
        d.totalMat,
        `"${d.statusLabel}"`,
        d.estimatedDiarias,
        d.totalPay.toFixed(2)
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `relatorio_produtividade_metas_${selectedWeek}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Default or General Full CSV
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
    link.setAttribute('download', `relatorio_geral_completo_${selectedWeek}.csv`);
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
              {getReportMainTitle()}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {getReportSubtitle()}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs flex-wrap gap-0.5">
              <button
                type="button"
                onClick={() => setViewGrouping('por_militante')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewGrouping === 'por_militante' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Militante
              </button>
              <button
                type="button"
                onClick={() => setViewGrouping('tabela_produtividade')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewGrouping === 'tabela_produtividade' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Produtividade
              </button>
              <button
                type="button"
                onClick={() => setViewGrouping('tabela_geral')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewGrouping === 'tabela_geral' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tabela Completa
              </button>
              <button
                type="button"
                onClick={() => setViewGrouping('por_bairro')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  viewGrouping === 'por_bairro' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🗺️</span> Por Região & Mapas
              </button>
            </div>

            <button
              onClick={handleRecoverPhotos}
              disabled={isRecoveringPhotos}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-xs font-bold text-purple-700 border border-purple-200 transition disabled:opacity-50 cursor-pointer"
              title="Varre o banco de dados e recupera fotos já lançadas vinculando-as às ruas"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecoveringPhotos ? 'animate-spin' : ''}`} />
              {isRecoveringPhotos ? 'Recuperando...' : 'Recuperar Fotos do BD'}
            </button>

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
              title="Exportar documento PDF oficial configurado para o tipo de relatório selecionado"
            >
              <FileDown className="w-4 h-4" />
              {isGeneratingPdf ? 'Gerando PDF...' : getExportButtonLabel()}
            </button>

            {completedPdfModal && (
              <button
                type="button"
                onClick={() => setCompletedPdfModal(prev => prev ? { ...prev, isOpen: true } : null)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 border border-amber-200 transition cursor-pointer shadow-xs"
                title="Abrir painel de download e visualização do último PDF gerado (Otimizado para Safari / Mac)"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                Baixar PDF Gerado
              </button>
            )}

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

        {/* Photo Recovery Feedback Alert */}
        {photoRecoveryFeedback && (
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="font-semibold">{photoRecoveryFeedback}</span>
            </div>
            <button
              onClick={() => setPhotoRecoveryFeedback(null)}
              className="text-purple-600 hover:text-purple-800 text-xs font-bold px-2 py-0.5"
            >
              ✕
            </button>
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
              <option value="todos">Todos os Militantes com Lançamentos ({militantsWithLaunches.length})</option>
              {militantsWithLaunches.map(m => (
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
              <h1 className="text-xl font-bold text-slate-900">{getReportMainTitle()}</h1>
              <p className="text-xs text-slate-500">
                {COMMITTEE_NAME} • {getReportSubtitle()}
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

        {/* Aggregate KPI Summary for Selected Period (Only for non por_bairro views) */}
        {viewGrouping !== 'por_bairro' && (
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
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
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Adesivos Bola</span>
              <span className="text-base font-bold text-amber-700">{totalAdesivoBola.toLocaleString('pt-BR')}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Materiais</span>
              <span className="text-base font-bold text-slate-900">{totalMateriaisGeral.toLocaleString('pt-BR')}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block flex items-center justify-center gap-1">
                <DollarSign className="w-3 h-3" /> Folha Total
              </span>
              <span className="text-sm font-black text-emerald-900 font-mono">
                R$ {productivityData.reduce((acc, d) => acc + d.totalPay, 0).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        )}

        {/* SECTION: GRÁFICOS DE PRODUTIVIDADE & DISTRIBUIÇÃO (Captured for PDF export - Only for non por_bairro views) */}
        {viewGrouping !== 'por_bairro' && (
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
        )}

        {/* SECTION: TABELA CONSOLIDADA DE PRODUTIVIDADE & FOLHA DE PAGAMENTOS */}
        {(viewGrouping === 'tabela_produtividade' || viewGrouping === 'tabela_geral') && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-blue-600" />
                  Tabela Oficial de Produtividade & Folha de Pagamentos
                </h3>
                <p className="text-[11px] text-slate-500">
                  Valores de diárias, dias apurados e total a pagar 100% integrados à Folha de Pagamentos da campanha
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Meta: <strong>25 ruas / militante</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                  Folha da {selectedWeekLabel.split('(')[0].trim()}
                </span>
              </div>
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
                    <th className="py-2.5 px-3 text-center">Diária (R$)</th>
                    <th className="py-2.5 px-3 text-center">Dias (Folha)</th>
                    <th className="py-2.5 px-3 text-center">Status Folha</th>
                    <th className="py-2.5 px-3 text-right">Total a Pagar (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {productivityData.map((item) => (
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
                      <td className="py-2.5 px-3 text-center font-mono text-slate-700 whitespace-nowrap">
                        R$ {item.dailyRate.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-800 whitespace-nowrap">
                        {item.daysWorked} {item.daysWorked === 1 ? 'dia' : 'dias'}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.payrollStatus === 'pago'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : (item.payrollStatus === 'aprovado'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300')
                        }`}>
                          {item.payrollStatus || 'Pendente'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-900 font-mono whitespace-nowrap">
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
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                      -
                    </td>
                    <td className="py-2.5 px-3 text-center text-blue-800 font-bold">
                      {productivityData.reduce((acc, d) => acc + d.daysWorked, 0)} d
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                        HOMOLOGADO
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-800 text-sm">
                      R$ {productivityData.reduce((acc, d) => acc + d.totalPay, 0).toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 1: PER-MILITANT DETAILED STREETS BREAKDOWN */}
        {(viewGrouping === 'por_militante' || viewGrouping === 'tabela_geral') && (
          <div className="space-y-6 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Detalhamento de Ruas por Militante na Semana (Fichas Individuais)
              </h3>
              <span className="text-xs text-slate-500">{activeMilitants.length} militantes listados</span>
            </div>

            <div className="space-y-6">
              {activeMilitants.map(mil => {
                const milCheckIns = filteredCheckIns.filter(c => c.militantId === mil.id || c.militantName === mil.name);
                const milSantinhos = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos || 0), 0);
                const milAbordagens = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
                const milComercios = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);
                const milProd = productivityData.find(p => p.id === mil.id);

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
                            <span className="text-xs text-emerald-700 font-semibold">
                              (Diária: R$ {milProd?.dailyRate || mil.dailyRate || 150},00 • Folha: R$ {milProd?.totalPay.toFixed(2).replace('.', ',')})
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {mil.phone} • {mil.teamId === 'team-alpha' ? 'Equipe Alpha' : (mil.teamId === 'team-bravo' ? 'Equipe Bravo' : 'Equipe Geral')} • PIX ({milProd?.pixType}): {milProd?.pixKey}
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
                              <th className="py-2.5 px-3">Data / Hora</th>
                              <th className="py-2.5 px-3">Bairro</th>
                              <th className="py-2.5 px-3">Rua / Trecho Percorrido</th>
                              <th className="py-2.5 px-3">Foto da Rua & Localização (GPS)</th>
                              <th className="py-2.5 px-3 text-center">Abordagens</th>
                              <th className="py-2.5 px-3 text-center">Comércio</th>
                              <th className="py-2.5 px-3 text-center">Santinhos</th>
                              <th className="py-2.5 px-3 text-center">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {milCheckIns.map(chk => {
                              const dbPhoto = StorageService.getPhotoForCheckIn(chk.id);
                              const validPhotos = (chk.photos || []).filter(p => p && p !== '[vault_photo]' && !p.includes('unsplash.com'));
                              const firstPhoto = validPhotos.length > 0 ? validPhotos[0] : (dbPhoto || null);
                              return (
                                <tr key={chk.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap text-slate-600">
                                    {formatDateTimeBR(chk.timestamp)}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                                    {chk.neighborhoodName}
                                  </td>
                                  <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[200px]">
                                    {chk.streetName}
                                  </td>
                                  
                                  {/* Foto correspondente da rua ao lado da localização GPS */}
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2.5">
                                      {firstPhoto ? (
                                        <div className="relative group shrink-0">
                                          <img
                                            src={firstPhoto}
                                            alt={chk.streetName}
                                            onClick={() => setSelectedPhotoZoom(firstPhoto)}
                                            className="w-11 h-11 rounded-lg object-cover cursor-pointer ring-1 ring-slate-200 shadow-2xs hover:scale-105 transition-transform"
                                          />
                                          <span className="absolute bottom-0 right-0 p-0.5 bg-black/60 rounded text-[7px] text-white">📷</span>
                                        </div>
                                      ) : (
                                        <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] shrink-0">
                                          Sem foto
                                        </div>
                                      )}
                                      <div className="text-left space-y-0.5">
                                        <a
                                          href={`https://www.google.com/maps?q=${chk.latitude},${chk.longitude}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 hover:bg-slate-100 text-blue-700 font-semibold text-[10px] border border-slate-200"
                                        >
                                          <MapPin className="w-3 h-3 text-red-600" />
                                          {chk.latitude.toFixed(4)}, {chk.longitude.toFixed(4)}
                                        </a>
                                        <span className="block text-[9px] text-slate-400 font-mono">Precisão: {chk.accuracyMeters || 3.5}m</span>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-2.5 px-3 text-center font-bold text-purple-700 whitespace-nowrap">
                                    {chk.materialsDelivered.abordagens || 0}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-bold text-emerald-700 whitespace-nowrap">
                                    {chk.materialsDelivered.comercio || 0}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-bold text-slate-900 whitespace-nowrap">
                                    {chk.materialsDelivered.santinhos}
                                  </td>
                                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                    <button
                                      onClick={() => setEditingCheckIn(chk)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition cursor-pointer"
                                      title="Editar Registro de Rua, Data e Horário"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      Editar Rua
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
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

        {/* SECTION 2: POR BAIRRO & MAPAS (TERRITORIAL REPORT WITH MAPS, CHARTS & PHOTOS) */}
        {(viewGrouping === 'por_bairro' || viewGrouping === 'tabela_geral') && (
          <div className={`space-y-3 ${viewGrouping !== 'por_bairro' ? 'pt-4 border-t border-slate-200' : 'pt-1'}`}>
            {viewGrouping === 'tabela_geral' && (
              <div className="flex items-center justify-between pb-1">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-600" />
                  Auditoria Territorial por Bairros & Mapas de São José - SC
                </h3>
                <span className="text-xs text-blue-700 font-semibold">
                  {neighborhoods.length} Bairros Auditados
                </span>
              </div>
            )}
            <NeighborhoodReportSection
              neighborhoods={neighborhoods}
              checkIns={filteredCheckIns}
              militants={militants}
              teams={teams}
              selectedBairroId={selectedBairroId}
              onSelectBairro={(bId) => setSelectedBairroId(bId)}
              onZoomPhoto={(p) => setSelectedPhotoZoom(p)}
              onEditStreet={(chk) => setEditingCheckIn(chk)}
            />
          </div>
        )}

        {/* SECTION 3: COMPLETE TABLE (ALL COLUMNS & PHOTOS) */}
        {(viewGrouping === 'tabela_geral') && (
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Tabela Completa de Ruas Percorridas & Comprovação Georreferenciada
                </h3>
                <p className="text-[11px] text-slate-500">
                  Listagem integral de todos os check-ins geolocalizados com links para satélite e controle de auditoria
                </p>
              </div>
              <span className="text-xs text-slate-600 font-bold">
                {filteredCheckIns.length} Registros Auditados
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Data / Hora</th>
                    <th className="py-2.5 px-3">Militante</th>
                    <th className="py-2.5 px-3">Bairro</th>
                    <th className="py-2.5 px-3">Logradouro / Trecho</th>
                    <th className="py-2.5 px-3">Foto da Rua & Localização (GPS)</th>
                    <th className="py-2.5 px-3 text-center">Abordagens</th>
                    <th className="py-2.5 px-3 text-center">Comércio</th>
                    <th className="py-2.5 px-3 text-center">Materiais</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCheckIns.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-slate-400">
                        Nenhum check-in registrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredCheckIns.map(chk => {
                      const dbPhoto = StorageService.getPhotoForCheckIn(chk.id);
                      const validPhotos = (chk.photos || []).filter(p => p && p !== '[vault_photo]' && !p.includes('unsplash.com'));
                      const firstPhoto = validPhotos.length > 0 ? validPhotos[0] : (dbPhoto || null);

                      return (
                        <tr key={chk.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                            {formatDateTimeBR(chk.timestamp)}
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
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {firstPhoto ? (
                                <div className="relative group shrink-0">
                                  <img
                                    src={firstPhoto}
                                    alt={chk.streetName}
                                    onClick={() => setSelectedPhotoZoom(firstPhoto)}
                                    className="w-10 h-10 rounded-lg object-cover cursor-pointer ring-1 ring-slate-200 shadow-2xs hover:scale-105 transition-transform"
                                  />
                                  <span className="absolute bottom-0 right-0 p-0.5 bg-black/60 rounded text-[7px] text-white">📷</span>
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] shrink-0">
                                  Sem foto
                                </div>
                              )}
                              <div className="text-left space-y-0.5">
                                <a
                                  href={`https://www.google.com/maps?q=${chk.latitude},${chk.longitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 hover:bg-slate-100 text-blue-700 font-semibold text-[10px] border border-slate-200"
                                >
                                  <MapPin className="w-3 h-3 text-red-600" />
                                  {chk.latitude.toFixed(4)}, {chk.longitude.toFixed(4)}
                                </a>
                              </div>
                            </div>
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
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {deletingCheckInId === chk.id ? (
                              <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                                <span className="text-[10px] font-bold text-rose-800">Excluir?</span>
                                <button
                                  onClick={() => handleDeleteCheckIn(chk.id)}
                                  className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]"
                                >
                                  Sim
                                </button>
                                <button
                                  onClick={() => setDeletingCheckInId(null)}
                                  className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[10px]"
                                >
                                  Não
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => setEditingCheckIn(chk)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200 transition cursor-pointer"
                                  title="Editar Registro de Rua, Data e Horário"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => setDeletingCheckInId(chk.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] border border-rose-200 transition cursor-pointer"
                                  title="Excluir Definitivamente este Registro"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Excluir
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Edit Street Modal (allows editing street, neighborhood, date/time and GPS) */}
      {editingCheckIn && (
        <EditStreetModal
          isOpen={!!editingCheckIn}
          checkIn={editingCheckIn}
          neighborhoods={neighborhoods}
          onClose={() => setEditingCheckIn(null)}
          onSave={async (updated) => {
            await StorageService.updateCheckIn(updated);
            setEditingCheckIn(null);
            onCheckInUpdated?.();
          }}
          onDelete={handleDeleteCheckIn}
        />
      )}

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

      {/* Safari & Universal PDF Download & View Modal */}
      {completedPdfModal && completedPdfModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 text-slate-800 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Relatório PDF Compilado!</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{completedPdfModal.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompletedPdfModal(prev => prev ? { ...prev, isOpen: false } : null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Details */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-700 block truncate max-w-xs">{completedPdfModal.fileName}</span>
                <span className="text-slate-500">{completedPdfModal.pageCount} páginas {completedPdfModal.sizeBytes > 0 ? `• ${(completedPdfModal.sizeBytes / (1024 * 1024)).toFixed(2)} MB` : ''}</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">Pronto para Impressão</span>
            </div>

            {/* Safari on macOS Sierra Callout */}
            <div className="mt-3.5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-amber-950 font-semibold block mb-0.5">Compatibilidade Safari / MacBook Pro 2012 (macOS Sierra):</strong>
                Se o Safari bloqueou o download automático em segundo plano, clique diretamente em <strong>Baixar Arquivo PDF</strong> ou no botão <strong>Abrir PDF no Safari</strong> para visualizar todas as páginas e salvar com <kbd className="px-1.5 py-0.5 bg-white rounded border border-amber-300 font-mono text-[10px]">Cmd + S</kbd> ou imprimir com <kbd className="px-1.5 py-0.5 bg-white rounded border border-amber-300 font-mono text-[10px]">Cmd + P</kbd>.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col sm:flex-row items-stretch gap-2.5">
              {/* Direct Download Button (Specialized for Safari on Sierra with octet-stream blob fallback) */}
              <button
                type="button"
                onClick={() => {
                  downloadOrOpenPdfInSafari(
                    completedPdfModal.pdfBlob || null,
                    completedPdfModal.dataUri,
                    completedPdfModal.fileName,
                    'download'
                  );
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer text-center"
              >
                <FileDown className="w-4 h-4" />
                Baixar Arquivo PDF
              </button>

              {/* Open in Safari Browser tab / reader */}
              <button
                type="button"
                onClick={() => {
                  downloadOrOpenPdfInSafari(
                    completedPdfModal.pdfBlob || null,
                    completedPdfModal.dataUri,
                    completedPdfModal.fileName,
                    'open'
                  );
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir PDF no Safari
              </button>
            </div>

            {/* Embedded Live PDF Preview for Safari on macOS Sierra (Never blocked by pop-ups) */}
            {(completedPdfModal.blobUrl || completedPdfModal.dataUri) && (
              <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                <div className="bg-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-700 font-semibold border-b border-slate-300">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Visualização Integrada no Navegador ({completedPdfModal.pageCount} págs.)
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Compatível com Safari Sierra
                  </span>
                </div>
                <iframe
                  src={completedPdfModal.blobUrl || completedPdfModal.dataUri}
                  className="w-full h-72 border-0 bg-white"
                  title="Pré-visualização do Relatório Oficial"
                />
              </div>
            )}

            {/* Secondary actions */}
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir Relatório (Cmd+P)
              </button>

              <button
                type="button"
                onClick={() => setCompletedPdfModal(prev => prev ? { ...prev, isOpen: false } : null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

