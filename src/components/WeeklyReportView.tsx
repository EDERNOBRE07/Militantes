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
import { StorageService } from '../services/storageService';
import { EditStreetModal } from './EditStreetModal';
import { OFFICIAL_SAO_JOSE_NEIGHBORHOODS } from '../data/officialSaoJoseNeighborhoods';
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
  Image as ImageIcon
} from 'lucide-react';

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
  const [selectedWeek, setSelectedWeek] = useState<string>('semana-1');
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<string | null>(null);
  const [viewGrouping, setViewGrouping] = useState<'por_militante' | 'tabela_geral' | 'tabela_produtividade' | 'por_bairro'>('por_militante');
  const [selectedBairroId, setSelectedBairroId] = useState<string>(neighborhoods[0]?.id || 'kobrasol');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [editingCheckIn, setEditingCheckIn] = useState<StreetCheckIn | null>(null);
  const [deletingCheckInId, setDeletingCheckInId] = useState<string | null>(null);
  const [isRecoveringPhotos, setIsRecoveringPhotos] = useState(false);
  const [photoRecoveryFeedback, setPhotoRecoveryFeedback] = useState<string | null>(null);

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
    { id: 'semana-1', label: 'Semana 1 (25/08 a 31/08/2026)' },
    { id: 'semana-2', label: 'Semana 2 (01/09 a 07/09/2026)' },
    { id: 'semana-3', label: 'Semana 3 (08/09 a 14/09/2026)' },
    { id: 'semana-4', label: 'Semana 4 (15/09 a 21/09/2026)' },
    { id: 'semana-5', label: 'Semana 5 (22/09 a 28/09/2026)' },
    { id: 'semana-6', label: 'Semana 6 / Reta Final (29/09 a 04/10/2026)' }
  ];

  // Folha de Pagamento sincronizada do StorageService
  const payrolls = useMemo(() => StorageService.getPayrolls(), [selectedWeek]);
  const currentPayroll = useMemo(() => {
    return payrolls.find(p => p.id === selectedWeek || p.id === `folha-${selectedWeek}` || p.weekNumber === parseInt(selectedWeek.replace('semana-', ''))) || payrolls[0];
  }, [payrolls, selectedWeek]);

  // Current selected neighborhood for territorial report
  const currentSelectedBairro: Neighborhood = useMemo(() => {
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
    bCheckIns: StreetCheckIn[]
  ): Promise<string> => {
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

    // Determine Geo Bounds delimitados exatamente pelo polígono do bairro
    let minLat = 90;
    let maxLat = -90;
    let minLng = 180;
    let maxLng = -180;

    if (bairroPolygon && Array.isArray(bairroPolygon) && bairroPolygon.length > 0) {
      bairroPolygon.forEach(pt => {
        const lat = Number(pt[0]);
        const lng = Number(pt[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
        }
      });
    }

    // Se houver check-ins, inclui no envelope caso algum ponto esteja ligeiramente na borda
    if (bCheckIns && bCheckIns.length > 0) {
      bCheckIns.forEach(chk => {
        if (chk.latitude && chk.longitude) {
          if (chk.latitude < minLat) minLat = chk.latitude;
          if (chk.latitude > maxLat) maxLat = chk.latitude;
          if (chk.longitude < minLng) minLng = chk.longitude;
          if (chk.longitude > maxLng) maxLng = chk.longitude;
        }
      });
    }

    // Fallback de segurança se coordenadas estiverem inválidas
    if (minLat >= maxLat || minLng >= maxLng) {
      minLat = (bairro.lat || -27.5962) - 0.012;
      maxLat = (bairro.lat || -27.5962) + 0.012;
      minLng = (bairro.lng || -48.6190) - 0.015;
      maxLng = (bairro.lng || -48.6190) + 0.015;
    }

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const rawLatSpan = Math.max(maxLat - minLat, 0.003);
    const rawLngSpan = Math.max(maxLng - minLng, 0.004);

    // Determina o nível exato de zoom mercator para enquadrar perfeitamente o polígono no canvas
    const zoomLng = Math.log2((canvas.width * 0.82) / ((rawLngSpan / 360) * 256));
    const latRadMin = (minLat * Math.PI) / 180;
    const latRadMax = (maxLat * Math.PI) / 180;
    const yMin = (1 - Math.log(Math.tan(latRadMax) + 1 / Math.cos(latRadMax)) / Math.PI) / 2;
    const yMax = (1 - Math.log(Math.tan(latRadMin) + 1 / Math.cos(latRadMin)) / Math.PI) / 2;
    const ySpan = Math.abs(yMax - yMin);
    const zoomLat = Math.log2((canvas.height * 0.78) / (ySpan * 256));

    let zoom = Math.floor(Math.min(zoomLng, zoomLat));
    zoom = Math.min(Math.max(zoom, 13), 16);

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

        const p = new Promise<{ img: HTMLImageElement; destX: number; destY: number } | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve({ img, destX, destY });
          img.onerror = () => resolve(null);
          img.src = url;
          setTimeout(() => resolve(null), 3000);
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

    // 1. Draw Registered Streets in Vibrant RED exactly on the road bed
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

        // Street Name Tag
        const midPoint = points[Math.floor(points.length / 2)] || points[0];
        ctx.font = 'bold 12.5px Helvetica, Arial, sans-serif';
        const text = chk.streetName;
        const textWidth = ctx.measureText(text).width;
        const labelX = midPoint.x + 16;
        const labelY = midPoint.y - 12;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
        ctx.beginPath();
        ctx.roundRect(labelX - 4, labelY - 14, textWidth + 8, 20, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, labelX, labelY);
      }
    });

    // 2. Draw GPS Markers / Pins (📍)
    bCheckIns.forEach(chk => {
      const px = toX(chk.longitude, chk.latitude);
      const py = toY(chk.latitude, chk.longitude);

      // Pin Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(px, py + 3, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pin Outer
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(px, py - 10, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Pin Center
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py - 10, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Checkmark Badge
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(px + 9, py - 18, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 8px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('✓', px + 7.2, py - 15.2);
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

    return canvas.toDataURL('image/png');
  };

  // Helper to generate the neighborhood materials & progress chart canvas (Widescreen 1600x850)
  const generateMaterialsChartCanvas = (
    bairro: Neighborhood,
    bCheckIns: StreetCheckIn[]
  ): string => {
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

    return canvas.toDataURL('image/png');
  };

  // Helper to load image as base64 JPEG data URL safely with crossOrigin
  const loadBase64Image = async (src: string): Promise<string> => {
    if (!src) return '';
    if (src.startsWith('data:image/')) return src;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 400;
          canvas.height = img.naturalHeight || img.height || 300;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
            return;
          }
        } catch (e) {
          console.warn('Canvas conversion failed for photo:', e);
        }
        resolve('');
      };
      img.onerror = () => {
        resolve('');
      };
      img.src = src;
    });
  };

  const handlePrint = () => {
    window.print();
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
        setExportFeedback(`Gerando relatório completo do Bairro ${currentSelectedBairro.name} com mapa, gráficos, tabela e galeria fotográfica...`);

        // Filter check-ins for the current selected neighborhood
        const bairroCheckIns = filteredCheckIns.filter(chk => 
          chk.neighborhoodId === currentSelectedBairro.id || 
          chk.neighborhoodName.toLowerCase().includes(currentSelectedBairro.name.toLowerCase())
        );
        const totalAbordBairro = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
        const totalComBairro = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);
        const totalMatBairro = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos + c.materialsDelivered.adesivo_bola + c.materialsDelivered.adesivo_parachoque + c.materialsDelivered.colinhas), 0);
        const coveragePercent = Math.min(Math.round((bairroCheckIns.length / Math.max(currentSelectedBairro.totalStreets, 1)) * 100), 100);

        // PAGE 1: HEADER, CARDS, CRISP MAP WITH PAINTED STREETS AND CHARTS
        drawHeaderBanner(
          'SISTEMA DE MILITÂNCIA SÃO JOSÉ - RELATÓRIO TERRITORIAL & AUDITORIA GEOGRÁFICA',
          `Bairro: ${currentSelectedBairro.name.toUpperCase()} (${currentSelectedBairro.zone}) • Eleições 2026 | Período: ${selectedWeekLabel}`
        );

        // Demographic & Activity KPI Cards for this Neighborhood
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 27, 269, 17, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, 27, 269, 17, 2, 2, 'D');

        const bairroKpiItems = [
          { label: 'POPULAÇÃO (IBGE)', val: `${currentSelectedBairro.population.toLocaleString('pt-BR')} hab.` },
          { label: 'ELEITORES ESTIMADOS', val: `${currentSelectedBairro.votersEstimated.toLocaleString('pt-BR')}` },
          { label: 'RUAS REGISTRADAS', val: `${bairroCheckIns.length} / ${currentSelectedBairro.totalStreets} (${coveragePercent}%)` },
          { label: 'ABORDAGENS DIRETAS', val: `${totalAbordBairro} eleitores` },
          { label: 'COMÉRCIOS ATENDIDOS', val: `${totalComBairro}` },
          { label: 'MATERIAIS NO BAIRRO', val: `${totalMatBairro.toLocaleString('pt-BR')}` },
        ];

        const bKpiWidth = 269 / bairroKpiItems.length;
        bairroKpiItems.forEach((kpi, idx) => {
          const xPos = 14 + (idx * bKpiWidth) + (bKpiWidth / 2);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(100, 116, 139);
          doc.text(kpi.label, xPos, 32.5, { align: 'center' });

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(30, 58, 138);
          doc.text(kpi.val, xPos, 39.5, { align: 'center' });
        });

        // High-Definition Google Map & Chart Generation for Page 1
        setExportFeedback(`Renderizando mapa do Google com ruas pintadas e pins de ${currentSelectedBairro.name}...`);
        
        let mapImgData = '';
        const mapDomElement = document.getElementById('neighborhood-report-map-wrapper');
        if (mapDomElement) {
          try {
            const mapCanvas = await html2canvas(mapDomElement, {
              scale: 2,
              useCORS: true,
              allowTaint: false,
              logging: false,
              backgroundColor: '#ffffff'
            });
            mapImgData = mapCanvas.toDataURL('image/png');
          } catch (e) {
            console.warn('Erro ao capturar mapa do DOM, usando gerador Google Maps:', e);
          }
        }
        
        if (!mapImgData) {
          mapImgData = await generateNeighborhoodMapCanvas(currentSelectedBairro, bairroCheckIns);
        }

        const chartImgData = generateMaterialsChartCanvas(currentSelectedBairro, bairroCheckIns);

        // PAGE 1: FULL-WIDTH NEIGHBORHOOD MAP (Maximizes width to 269mm on A4 Landscape)
        if (mapImgData) {
          doc.addImage(mapImgData, 'PNG', 14, 46, 269, 136);
        }

        // PAGE 2: FULL-WIDTH DETAILED PERFORMANCE & MATERIALS CHART (Maximizes width to 269mm on A4 Landscape)
        doc.addPage('a4', 'landscape');
        drawHeaderBanner(
          `SISTEMA DE MILITÂNCIA SÃO JOSÉ - DESEMPENHO E DISTRIBUIÇÃO: ${currentSelectedBairro.name.toUpperCase()}`,
          `Distribuição de Materiais, Abordagens, Metas e Auditoria • Bairro ${currentSelectedBairro.name} | Período: ${selectedWeekLabel}`
        );
        if (chartImgData) {
          doc.addImage(chartImgData, 'PNG', 14, 28, 269, 150);
        }

        // PAGE 3: DETAILED STREET TABLE FOR THIS NEIGHBORHOOD
        doc.addPage('a4', 'landscape');
        drawHeaderBanner(
          `SISTEMA DE MILITÂNCIA SÃO JOSÉ - AUDITORIA DE RUAS: ${currentSelectedBairro.name.toUpperCase()}`,
          `Logradouros, Coordenadas GPS, Abordagens e Validação no Bairro ${currentSelectedBairro.name} | Período: ${selectedWeekLabel}`
        );

        const bairroStreetRows = bairroCheckIns.map(chk => {
          const militant = militants.find(m => m.id === chk.militantId);
          const mat = militant?.matricula ? `(${militant.matricula})` : '';
          const photoCount = chk.photos ? chk.photos.length : 0;
          const photoText = photoCount > 0 ? `${photoCount} foto(s) [ANEXO]` : 'Sem foto';
          return [
            chk.timestamp,
            chk.streetName,
            `${chk.militantName} ${mat}`,
            `${chk.latitude.toFixed(4)}, ${chk.longitude.toFixed(4)}`,
            `${chk.materialsDelivered.abordagens || 0}`,
            `${chk.materialsDelivered.comercio || 0}`,
            `${chk.materialsDelivered.santinhos}`,
            photoText,
            chk.status === 'validado' ? 'VALIDADO' : 'PENDENTE'
          ];
        });

        autoTable(doc, {
          head: [[
            'Data / Hora',
            'Logradouro / Trecho Percorrido',
            'Militante Responsável',
            'GPS (Latitude, Longitude)',
            'Abordagens',
            'Comércio',
            'Santinhos',
            'Comprovante',
            'Status Auditoria'
          ]],
          body: bairroStreetRows.length > 0 ? bairroStreetRows : [['-', `Nenhuma rua cadastrada para o bairro ${currentSelectedBairro.name} no período`, '-', '-', '-', '-', '-', '-', '-']],
          startY: 28,
          margin: { left: 14, right: 14, bottom: 28 },
          styles: {
            fontSize: 7.5,
            cellPadding: 2.2,
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
            0: { cellWidth: 28 },
            1: { cellWidth: 62, fontStyle: 'bold' },
            2: { cellWidth: 42 },
            3: { cellWidth: 38, font: 'courier' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 18, halign: 'center' },
            6: { cellWidth: 18, halign: 'center' },
            7: { cellWidth: 23, halign: 'center', fontStyle: 'bold' },
            8: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
          }
        });

        // PAGE 3+: GALERIA DE COMPROVAÇÃO FOTOGRÁFICA DAS RUAS DO BAIRRO
        interface PhotoProofItem {
          photoUrl: string;
          streetName: string;
          militantName: string;
          matricula: string;
          timestamp: string;
          lat: number;
          lng: number;
          santinhos: number;
          abordagens: number;
        }

        const photoProofItems: PhotoProofItem[] = [];
        bairroCheckIns.forEach(chk => {
          const mObj = militants.find(m => m.id === chk.militantId);
          const mat = mObj?.matricula || 'Mil001';

          // Recupera foto do banco de dados ou cofre dedicado se não estiver no array direto
          const dbPhoto = StorageService.getPhotoForCheckIn(chk.id, chk.neighborhoodId, chk.streetName);
          const validPhotos = (chk.photos || []).filter(p => p && p !== '[vault_photo]');
          const effectivePhotos = validPhotos.length > 0 ? validPhotos : (dbPhoto ? [dbPhoto] : []);

          if (effectivePhotos.length > 0) {
            effectivePhotos.forEach(photo => {
              photoProofItems.push({
                photoUrl: photo,
                streetName: chk.streetName,
                militantName: chk.militantName,
                matricula: mat,
                timestamp: chk.timestamp,
                lat: chk.latitude,
                lng: chk.longitude,
                santinhos: chk.materialsDelivered.santinhos || 0,
                abordagens: chk.materialsDelivered.abordagens || 0
              });
            });
          } else {
            // Se não houver foto enviada, gera o comprovante de auditoria georreferenciado via GPS
            photoProofItems.push({
              photoUrl: '',
              streetName: chk.streetName,
              militantName: chk.militantName,
              matricula: mat,
              timestamp: chk.timestamp,
              lat: chk.latitude,
              lng: chk.longitude,
              santinhos: chk.materialsDelivered.santinhos || 0,
              abordagens: chk.materialsDelivered.abordagens || 0
            });
          }
        });

        // Preload base64 images
        setExportFeedback(`Carregando fotos de comprovação de ${currentSelectedBairro.name}...`);
        const preloadedImages = await Promise.all(
          photoProofItems.map(item => (item.photoUrl ? loadBase64Image(item.photoUrl) : Promise.resolve('')))
        );

        const itemsPerPage = 6;
        const totalPhotoPages = Math.max(Math.ceil(photoProofItems.length / itemsPerPage), 1);

        for (let pageIdx = 0; pageIdx < totalPhotoPages; pageIdx++) {
          doc.addPage('a4', 'landscape');
          drawHeaderBanner(
            `SISTEMA DE MILITÂNCIA SÃO JOSÉ - GALERIA DE COMPROVAÇÃO FOTOGRÁFICA DAS RUAS`,
            `Auditoria Visual das Ruas e Comprovantes em Campo • Bairro ${currentSelectedBairro.name} (Pág. ${pageIdx + 1}/${totalPhotoPages}) | Período: ${selectedWeekLabel}`
          );

          // Sub-header title bar
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(14, 27, 269, 7.5, 1.5, 1.5, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(30, 41, 59);
          doc.text(`REGISTROS FOTOGRÁFICOS DE CAMPO COM VALIDAÇÃO GPS • BAIRRO ${currentSelectedBairro.name.toUpperCase()}`, 18, 32);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          const startIdx = pageIdx * itemsPerPage;
          const endIdx = Math.min((pageIdx + 1) * itemsPerPage, photoProofItems.length);
          doc.text(`Exibindo ${photoProofItems.length > 0 ? startIdx + 1 : 0} a ${endIdx} de ${photoProofItems.length} registros`, pageWidth - 18, 32, { align: 'right' });

          // Grid of 3 cols x 2 rows
          const pagePhotos = photoProofItems.slice(startIdx, endIdx);
          const cardW = 87;
          const cardH = 68;
          const gapX = 4;
          const gapY = 4;
          const startX = 14;
          const startY = 37;

          pagePhotos.forEach((item, idx) => {
            const globalIdx = startIdx + idx;
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            const cardX = startX + col * (cardW + gapX);
            const cardY = startY + row * (cardH + gapY);

            // Card Frame
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(203, 213, 225);
            doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, 'FD');

            const photoBase64 = preloadedImages[globalIdx];
            const photoH = 43;
            const photoW = cardW - 4;

            if (photoBase64) {
              try {
                doc.addImage(photoBase64, 'JPEG', cardX + 2, cardY + 2, photoW, photoH);
              } catch {
                // Placeholder fallback
                doc.setFillColor(226, 232, 240);
                doc.roundedRect(cardX + 2, cardY + 2, photoW, photoH, 1, 1, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(100, 116, 139);
                doc.text('Comprovante Fotográfico de Campo', cardX + cardW / 2, cardY + 24, { align: 'center' });
              }
            } else {
              // Graphic Card Placeholder
              doc.setFillColor(241, 245, 249);
              doc.roundedRect(cardX + 2, cardY + 2, photoW, photoH, 1, 1, 'F');
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(8.5);
              doc.setTextColor(71, 85, 105);
              doc.text('Registro Georreferenciado via GPS', cardX + cardW / 2, cardY + 20, { align: 'center' });
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(7);
              doc.setTextColor(100, 116, 139);
              doc.text(`Lat: ${item.lat.toFixed(5)}, Lng: ${item.lng.toFixed(5)}`, cardX + cardW / 2, cardY + 27, { align: 'center' });
            }

            // Photo Border
            doc.setDrawColor(203, 213, 225);
            doc.roundedRect(cardX + 2, cardY + 2, photoW, photoH, 1, 1, 'D');

            // Validated Badge on Top-Right of photo
            doc.setFillColor(16, 185, 129);
            doc.roundedRect(cardX + cardW - 24, cardY + 4, 20, 5, 1, 1, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(255, 255, 255);
            doc.text('VALIDADO', cardX + cardW - 14, cardY + 7.6, { align: 'center' });

            // Photo Details below image
            // Street Name
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.8);
            doc.setTextColor(15, 23, 42);
            const streetLabel = item.streetName.length > 32 ? item.streetName.substring(0, 30) + '...' : item.streetName;
            doc.text(streetLabel, cardX + 4, cardY + 49);

            // Militant Name
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.5);
            doc.setTextColor(51, 65, 85);
            doc.text(`Militante: ${item.militantName} (${item.matricula})`, cardX + 4, cardY + 54.5);

            // Timestamp
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(100, 116, 139);
            doc.text(`Data/Hora: ${formatDateTimeBR(item.timestamp)}`, cardX + 4, cardY + 59.5);

            // GPS & Materials
            doc.setFont('courier', 'bold');
            doc.setFontSize(6);
            doc.setTextColor(220, 38, 38);
            doc.text(`GPS: ${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`, cardX + 4, cardY + 64.5);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(30, 58, 138);
            doc.text(`${item.santinhos} sant | ${item.abordagens} abord`, cardX + cardW - 4, cardY + 64.5, { align: 'right' });
          });
        }

        // Global pagination pass for All Pages
        const totalPages = doc.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
          doc.setPage(p);
          drawFooter(p, totalPages);
        }

        const sanitizedBairro = currentSelectedBairro.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const sanitizedWeek = selectedWeek.replace(/[^a-zA-Z0-9_-]/g, '_');
        doc.save(`relatorio_territorial_${sanitizedBairro}_${sanitizedWeek}.pdf`);
        setExportFeedback(`✓ Relatório Territorial do Bairro ${currentSelectedBairro.name} com mapa, gráficos, tabela e galeria gerado com sucesso!`);
        setTimeout(() => setExportFeedback(null), 6000);
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
        doc.save(`relatorio_militantes_${sanitizedWeek}.pdf`);
        setExportFeedback('✓ Relatório por Militante gerado com sucesso!');
        setTimeout(() => setExportFeedback(null), 6000);
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
        doc.save(`relatorio_produtividade_metas_${sanitizedWeek}.pdf`);
        setExportFeedback('✓ Relatório Oficial de Produtividade & Metas gerado com sucesso!');
        setTimeout(() => setExportFeedback(null), 6000);
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
        doc.save(`relatorio_compilado_geral_completo_${sanitizedWeek}.pdf`);
        setExportFeedback('✓ Relatório Consolidado Compilado Geral de Todos os Relatórios gerado com sucesso!');
        setTimeout(() => setExportFeedback(null), 6000);
        return;
      }

    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      setExportFeedback('Erro ao processar PDF. Você pode utilizar a opção Imprimir / Salvar PDF do navegador.');
      setTimeout(() => setExportFeedback(null), 6000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportCSV = () => {
    if (viewGrouping === 'por_bairro') {
      const bairroCheckIns = filteredCheckIns.filter(chk => 
        chk.neighborhoodId === currentSelectedBairro.id || 
        chk.neighborhoodName.toLowerCase().includes(currentSelectedBairro.name.toLowerCase())
      );
      const headers = ['Bairro', 'Zona', 'Logradouro', 'Data/Hora', 'Militante', 'Matrícula', 'Latitude', 'Longitude', 'Santinhos', 'Adesivo Bola', 'Abordagens', 'Comércio', 'Status'];
      const rows = bairroCheckIns.map(c => [
        `"${currentSelectedBairro.name}"`,
        `"${currentSelectedBairro.zone}"`,
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
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `relatorio_bairro_${currentSelectedBairro.name.toLowerCase()}_${selectedWeek}.csv`);
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
                <span>🗺️</span> Por Bairro & Mapas
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

        {/* Aggregate KPI Summary for Selected Period */}
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

        {/* SECTION: TABELA CONSOLIDADA DE PRODUTIVIDADE & FOLHA DE PAGAMENTOS */}
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
                              const firstPhoto = chk.photos && chk.photos.length > 0 ? chk.photos[0] : null;
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
          <div className="pt-4 border-t border-slate-200 space-y-3">
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
                      const dbPhoto = StorageService.getPhotoForCheckIn(chk.id, chk.neighborhoodId, chk.streetName);
                      const validPhotos = (chk.photos || []).filter(p => p && p !== '[vault_photo]');
                      const firstPhoto = validPhotos.length > 0 ? validPhotos[0] : dbPhoto;

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

    </div>
  );
};

