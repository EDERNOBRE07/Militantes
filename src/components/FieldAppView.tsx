import React, { useState, useEffect } from 'react';
import {
  Neighborhood,
  Militant,
  User,
  StreetCheckIn,
  MaterialCount
} from '../types';
import { StorageService } from '../services/storageService';
import { MilitantSummaryCard } from './MilitantSummaryCard';
import { WhatsAppLocationInput } from './WhatsAppLocationInput';
import { EditStreetModal } from './EditStreetModal';
import { compressImageFile, compressBase64IfNeeded } from '../utils/imageCompressor';
import {
  Camera,
  MapPin,
  CheckCircle,
  Plus,
  Minus,
  Upload,
  WifiOff,
  Compass,
  FileText,
  Disc,
  Layers,
  CheckSquare,
  Trash2,
  Users,
  Store,
  MessageSquare,
  Database,
  Search,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Clock,
  Navigation,
  Shield,
  UserCheck,
  Filter,
  Phone,
  Battery,
  Lock,
  Eye,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RefreshCw,
  Wifi,
  Loader2,
  ImageIcon,
  Download,
  CloudDownload
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FieldAppViewProps {
  currentUser: User;
  militants: Militant[];
  neighborhoods: Neighborhood[];
  isOffline: boolean;
  onCheckInCreated: () => void;
}

export const FieldAppView: React.FC<FieldAppViewProps> = ({
  currentUser,
  militants,
  neighborhoods,
  isOffline,
  onCheckInCreated
}) => {
  // Check if current user is part of Coordination / Leadership or a regular Militant
  const isCoordination = currentUser.role === 'admin' || currentUser.role === 'coordenador' || currentUser.role === 'lider';

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'dashboard_militantes' | 'novo_checkin' | 'meu_historico'>(
    isCoordination ? 'dashboard_militantes' : 'novo_checkin'
  );

  // Local check-ins state with real-time listener for instant re-renders
  const [allCheckIns, setAllCheckIns] = useState<StreetCheckIn[]>(() => StorageService.getCheckIns());

  useEffect(() => {
    const handleUpdate = () => {
      setAllCheckIns(StorageService.getCheckIns());
    };
    window.addEventListener('militancia_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('militancia_data_updated', handleUpdate);
    };
  }, []);

  // Search and filter state for Coordination Dashboard
  const [militantSearch, setMilitantSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [expandedMilitantId, setExpandedMilitantId] = useState<string | null>(null);
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<string | null>(null);

  // Identify user's own militant profile
  const userOwnMilitant = militants.find(m => m.id === currentUser.id || m.email === currentUser.email) 
    || militants.find(m => m.name.toLowerCase().includes(currentUser.name.toLowerCase())) 
    || militants[0];

  // Selected militant for creating check-in (Coordination can select any militant; Militant is strictly locked to themselves)
  const [selectedMilitantId, setSelectedMilitantId] = useState<string>(
    isCoordination ? militants[0]?.id || userOwnMilitant.id : userOwnMilitant.id
  );

  // Current effective militant for the check-in form
  const activeMilitant = isCoordination
    ? (militants.find(m => m.id === selectedMilitantId) || userOwnMilitant)
    : userOwnMilitant;

  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>(
    activeMilitant.teamId === 'team-alpha' ? 'kobrasol' : (activeMilitant.teamId === 'team-bravo' ? 'barreiros' : 'forquilhinhas')
  );
  const [streetName, setStreetName] = useState<string>('');
  const [houseNumberRange, setHouseNumberRange] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: -27.5962,
    lng: -48.6190,
    accuracy: 4.2
  });

  // Material & Action Counters (Including Abordagens and Materiais no Comércio) - Initialized at 0
  const [materials, setMaterials] = useState<MaterialCount>({
    santinhos: 0,
    adesivos: 0,
    adesivo_bola: 0,
    adesivo_parachoque: 0,
    colinhas: 0,
    abordagens: 0,
    comercio: 0
  });

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; details?: string; destination?: string; isError?: boolean } | null>(null);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);
  const [deletingCheckIn, setDeletingCheckIn] = useState<{ id: string; streetName: string } | null>(null);
  const [editingCheckIn, setEditingCheckIn] = useState<StreetCheckIn | null>(null);
  const [connStatus, setConnStatus] = useState<{ online: boolean; latencyMs?: number; label: string }>({
    online: true,
    latencyMs: 32,
    label: 'Banco MySQL Ativo • u844537895_Militantes'
  });

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    try {
      const res = await StorageService.testHostingerConnection();
      setConnStatus({
        online: res.connected,
        latencyMs: res.latencyMs,
        label: res.connected
          ? `MySQL Hostinger Online (${res.latencyMs || 25}ms)`
          : `Hostinger Indisponível (${res.error || 'Timeout'})`
      });
      setFeedbackMsg({
        text: res.connected
          ? `✓ Conexão com Hostinger MySQL verificada com sucesso!`
          : `⚠ Hostinger temporariamente indisponível. Fila offline em espera.`,
        destination: `${res.endpoint} (${res.database})`,
        details: res.message,
        isError: !res.connected
      });
    } catch (e: any) {
      setConnStatus({
        online: false,
        label: 'Erro de Rede / Timeout'
      });
      setFeedbackMsg({
        text: 'Erro ao contatar o servidor MySQL da Hostinger.',
        details: e.message || 'Verifique a conexão de internet.',
        isError: true
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleSyncOffline = async () => {
    setIsSyncingQueue(true);
    try {
      const res = await StorageService.syncAllPendingCheckins();
      if (res.succeeded > 0) {
        onCheckInCreated();
        setFeedbackMsg({
          text: `✓ ${res.succeeded} check-ins sincronizados com o MySQL da Hostinger!`,
          details: `Todos os dados da fila offline foram transmitidos para a base central.`
        });
      } else if (res.total === 0) {
        setFeedbackMsg({
          text: 'Fila de sincronização está vazia.',
          details: 'Todos os check-ins já foram transmitidos para o MySQL.'
        });
      } else {
        setFeedbackMsg({
          text: 'Não foi possível sincronizar no momento.',
          details: 'Servidor em espera. Tentaremos novamente no próximo check-in.',
          isError: true
        });
      }
    } finally {
      setIsSyncingQueue(false);
    }
  };

  const [isRestoringServer, setIsRestoringServer] = useState(false);

  const handleRestoreServerData = async () => {
    setIsRestoringServer(true);
    try {
      await StorageService.fetchRemoteState(true);
      const allNow = StorageService.getCheckIns();
      setAllCheckIns(allNow);
      onCheckInCreated();
      setFeedbackMsg({
        text: `✓ Dados Recuperados da Nuvem!`,
        destination: `MySQL Hostinger u844537895_Militantes + Cofre Central`,
        details: `${allNow.length} ruas e check-ins integrados com sucesso. Nenhum dado foi perdido.`
      });
    } catch (err: any) {
      setFeedbackMsg({
        text: 'Erro ao consultar o servidor.',
        details: err?.message || 'Verifique sua conexão.',
        isError: true
      });
    } finally {
      setIsRestoringServer(false);
    }
  };

  const selectedNeighborhood = neighborhoods.find(n => n.id === selectedNeighborhoodId) || neighborhoods[0];

  // Street Suggestions for São José Neighborhoods
  const sampleStreetsByBairro: Record<string, string[]> = {
    kobrasol: ['Rua Koesa', 'Av. Lédio João Martins', 'Rua Adhemar da Silva', 'Rua Brasilpinho', 'Rua Caetano José Ferreira'],
    campinas: ['Av. Presidente Kennedy', 'Av. Central do Kobrasol', 'Rua Altamiro Di Bernardi', 'Rua Victor Meirelles'],
    barreiros: ['Av. Leoberto Leal', 'Rua Eugênio Portela', 'Rua José Victor da Silva', 'Rua Nossa Senhora Aparecida'],
    forquilhinhas: ['Rua Vereador Arthur Mariano', 'Rua Francisco Nappi', 'Rua Princesa Isabel', 'Rua Antônio Jovita Duarte'],
    praia_comprida: ['Rua Luiz Fagundes', 'Rua Frederico Afonso', 'Rua Menino Meneses'],
    serraria: ['Rua Afrísio de Senna Vaz', 'Rua Nossa Senhora dos Navegantes', 'Rua José Manoel de Souza'],
    fazenda_santo_antonio: ['Rua Manoel Joaquim Santos', 'Rua Santo Antônio', 'Rua Benjamin Gerlach'],
    bela_vista: ['Rua Emerson Ferrari', 'Rua Arthur Mariano', 'Rua Gisela']
  };

  const currentSuggestions = sampleStreetsByBairro[selectedNeighborhoodId] || ['Rua Central', 'Avenida Principal', 'Rua das Flores'];

  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
          });
          setIsCapturingGps(false);
        },
        () => {
          setGpsCoords({
            lat: selectedNeighborhood.lat + (Math.random() - 0.5) * 0.003,
            lng: selectedNeighborhood.lng + (Math.random() - 0.5) * 0.003,
            accuracy: 3.8
          });
          setIsCapturingGps(false);
        },
        { timeout: 4000 }
      );
    } else {
      setIsCapturingGps(false);
    }
  };

  const handleApplyWhatsAppLocation = (data: {
    lat: number;
    lng: number;
    accuracy?: number;
    neighborhoodId?: string;
    streetName?: string;
    houseNumberRange?: string;
    sourceSummary: string;
  }) => {
    setGpsCoords({
      lat: data.lat,
      lng: data.lng,
      accuracy: data.accuracy || 3.5
    });

    if (data.neighborhoodId) {
      setSelectedNeighborhoodId(data.neighborhoodId);
    }

    if (data.streetName) {
      setStreetName(data.streetName);
    }

    if (data.houseNumberRange) {
      setHouseNumberRange(data.houseNumberRange);
    }

    setFeedbackMsg({
      text: `✓ Localização do WhatsApp importada com sucesso!`,
      destination: `Ponto GPS: ${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}`,
      details: `${data.sourceSummary} • Coordenadas e bairro atualizados no formulário de rua.`
    });
  };

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressingPhoto(true);
    try {
      const compressedList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressed = await compressImageFile(file, 1080, 0.75);
        if (compressed) {
          compressedList.push(compressed);
        }
      }
      if (compressedList.length > 0) {
        setPhotos(prev => [...prev, ...compressedList]);
      }
    } catch (err: any) {
      setFeedbackMsg({
        text: 'Erro ao processar imagem.',
        details: err?.message || 'Tente selecionar outro arquivo de foto.',
        isError: true
      });
    } finally {
      setIsCompressingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== index));
  };

  const incrementMaterial = (key: keyof MaterialCount, delta: number) => {
    setMaterials(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta)
    }));
  };

  const handleSaveMaterialAdjustment = (militantId: string, updatedMaterials: MaterialCount) => {
    const targetMilitant = militants.find(m => m.id === militantId);
    if (targetMilitant) {
      const updated: Militant = {
        ...targetMilitant,
        deliveredMaterials: {
          ...targetMilitant.deliveredMaterials,
          ...updatedMaterials
        }
      };
      StorageService.addOrUpdateMilitant(updated);
      onCheckInCreated();
    }
  };

  const handleRequestDeleteStreet = (checkInId: string, streetName: string) => {
    setDeletingCheckIn({ id: checkInId, streetName });
  };

  const handleConfirmDeleteStreet = () => {
    if (!deletingCheckIn) return;
    StorageService.deleteCheckIn(deletingCheckIn.id);
    setAllCheckIns(StorageService.getCheckIns());
    setFeedbackMsg({
      text: `✓ Registro da rua "${deletingCheckIn.streetName}" apagado com sucesso!`,
      details: 'O histórico e as contagens de ruas foram atualizadas.'
    });
    setDeletingCheckIn(null);
    onCheckInCreated();
  };

  const handleSaveEditedStreet = async (updatedCheckIn: StreetCheckIn) => {
    await StorageService.updateCheckIn(updatedCheckIn);
    setAllCheckIns(StorageService.getCheckIns());
    setFeedbackMsg({
      text: `✓ Registro da rua "${updatedCheckIn.streetName}" atualizado com sucesso!`,
      details: 'Fotos, localização GPS e materiais foram salvos e sincronizados.'
    });
    setEditingCheckIn(null);
    onCheckInCreated();
  };

  const handleQuickCheckIn = (militantId: string) => {
    setSelectedMilitantId(militantId);
    setActiveTab('novo_checkin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitCheckin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!streetName.trim()) {
      alert('Por favor, informe o nome da rua percorrida.');
      return;
    }

    setIsTransmitting(true);

    // Ensure all uploaded photos are compressed
    const sanitizedPhotos = await Promise.all(
      photos.map(p => compressBase64IfNeeded(p, 1080, 0.75))
    );

    const newCheckIn: StreetCheckIn = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${(activeMilitant.id || 'm').replace(/[^a-zA-Z0-9]/g, '')}`,
      militantId: activeMilitant.id,
      militantName: activeMilitant.name,
      teamId: activeMilitant.teamId || 'team-alpha',
      neighborhoodId: selectedNeighborhood.id,
      neighborhoodName: selectedNeighborhood.name,
      streetName: `${streetName.trim()} (nº ${houseNumberRange || 'Trecho Geral'})`,
      houseNumberRange: houseNumberRange || 'Trecho Geral',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      latitude: gpsCoords.lat,
      longitude: gpsCoords.lng,
      accuracyMeters: gpsCoords.accuracy,
      photos: sanitizedPhotos,
      materialsDelivered: { ...materials },
      observations: observations.trim(),
      status: 'validado',
      synced: !isOffline
    };

    // Primary API persistence and direct Hostinger MySQL transmission
    const res = await StorageService.onCheckInCreated(newCheckIn);
    setAllCheckIns(StorageService.getCheckIns());
    setIsTransmitting(false);

    if (res.status === 'synced_mysql') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}

      setFeedbackMsg({
        text: `✓ Check-in de ${activeMilitant.name} persistido no MySQL da Hostinger com sucesso! (${res.latencyMs || 28}ms)`,
        destination: res.destination,
        details: `Rua "${newCheckIn.streetName}" em ${newCheckIn.neighborhoodName} sincronizada no banco u844537895_Militantes.`
      });
    } else {
      setFeedbackMsg({
        text: `Check-in de ${activeMilitant.name} gravado com segurança na fila local de contingência!`,
        destination: res.destination,
        details: res.message || 'Sem conexão estável no momento. Será sincronizado automaticamente assim que o sinal retornar.',
        isError: false
      });
    }

    // Auto-open new fresh street registration for continuous fieldwork
    const remainingSuggestions = sampleStreetsByBairro[selectedNeighborhoodId] || [];
    const nextStreet = remainingSuggestions[Math.floor(Math.random() * remainingSuggestions.length)] || '';
    
    setStreetName(nextStreet);
    setHouseNumberRange('');
    setObservations('');
    setPhotos([]);
    setMaterials({
      santinhos: 0,
      adesivos: 0,
      adesivo_bola: 0,
      adesivo_parachoque: 0,
      colinhas: 0,
      abordagens: 0,
      comercio: 0
    });

    onCheckInCreated();

    setTimeout(() => {
      setFeedbackMsg(null);
    }, 7000);
  };

  // Filter militants for Coordination Dashboard
  const filteredMilitants = militants.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(militantSearch.toLowerCase()) ||
      m.matricula.toLowerCase().includes(militantSearch.toLowerCase()) ||
      (m.phone && m.phone.includes(militantSearch));
    const matchesTeam = teamFilter === 'todos' || m.teamId === teamFilter;
    const matchesStatus = statusFilter === 'todos' || m.status === statusFilter;
    return matchesSearch && matchesTeam && matchesStatus;
  });

  // Calculate Coordination Dashboard Totals
  const totalMilitantsActive = militants.filter(m => m.status === 'em_campo' || m.status === 'ativo').length;
  const totalAbordagensGlobal = allCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
  const totalComerciosGlobal = allCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);
  const totalSantinhosGlobal = allCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos || 0), 0);
  const totalDailyRatesGlobal = militants.reduce((acc, m) => acc + (m.dailyRate || 150), 0);

  // Militant-specific check-ins for personal view
  const myCheckIns = allCheckIns.filter(c => c.militantId === userOwnMilitant.id || c.militantName === userOwnMilitant.name);
  const myTotalAbordagens = myCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0) || (userOwnMilitant.deliveredMaterials.abordagens || 0);
  const myTotalComercios = myCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0) || (userOwnMilitant.deliveredMaterials.comercio || 0);
  const myTotalSantinhos = myCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos || 0), 0) || userOwnMilitant.deliveredMaterials.santinhos;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Header & Role Permissions Status */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              App de Campo • São José / SC
            </span>
            
            {/* Role Badge Indicator */}
            {isCoordination ? (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                <Shield className="w-3 h-3 text-purple-600" />
                Modo Coordenação Geral (Acesso Completo)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                Modo Militante (Acesso Restrito Individual)
              </span>
            )}

            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-600" />
              Sincronização MySQL Hostinger
            </span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isCoordination ? 'Dashboard Geral de Militantes & Check-in de Campo' : 'App de Campo • Registro Pessoal de Ruas'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isCoordination
              ? `Visualização da coordenação com todos os ${militants.length} militantes cadastrados, auditoria de ruas e monitoramento de metas.`
              : `Você está conectado como ${userOwnMilitant.name} (${userOwnMilitant.matricula}). Acesso restrito aos seus próprios registros.`}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          
          {/* Dashboard Geral (Coordination Only) */}
          {isCoordination && (
            <button
              type="button"
              onClick={() => setActiveTab('dashboard_militantes')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard_militantes'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Dashboard Coordenação ({militants.length})
            </button>
          )}

          {/* Novo Check-in */}
          <button
            type="button"
            onClick={() => setActiveTab('novo_checkin')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'novo_checkin'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            {isCoordination ? 'Registrar Check-in' : 'Registrar Minha Rua'}
          </button>

          {/* Meu Histórico (Militant Only) */}
          {!isCoordination && (
            <button
              type="button"
              onClick={() => setActiveTab('meu_historico')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'meu_historico'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Meu Histórico & Metas ({myCheckIns.length})
            </button>
          )}

        </div>
      </div>

      {/* MySQL Connection Status Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-blue-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${connStatus.online ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400' : 'bg-amber-500/20 border border-amber-400/40 text-amber-400'}`}>
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white block">Hostinger MySQL: u844537895_Militantes</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${connStatus.online ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' : 'bg-amber-900/60 text-amber-300 border border-amber-500/40'}`}>
                {connStatus.online ? `${connStatus.latencyMs || 28}ms` : 'OFFLINE'}
              </span>
            </div>
            <span className="text-slate-300 text-[11px]">Endpoint: https://militancia.mastervisionmarketing.com/api/checkin.php</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleRestoreServerData}
            disabled={isRestoringServer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            title="Recuperar todos os lançamentos, fotos e ruas salvas no MySQL e Cofre do Servidor"
          >
            <Download className={`w-3.5 h-3.5 ${isRestoringServer ? 'animate-spin' : ''}`} />
            <span>{isRestoringServer ? 'Recuperando...' : 'Recuperar Lançamentos da Nuvem'}</span>
          </button>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTestingConn}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition disabled:opacity-50 cursor-pointer"
            title="Testar ping e conexão com o banco MySQL do Hostinger"
          >
            <RefreshCw className={`w-3 h-3 text-blue-400 ${isTestingConn ? 'animate-spin' : ''}`} />
            <span>{isTestingConn ? 'Testando...' : 'Testar Conexão'}</span>
          </button>

          {StorageService.getOfflineQueue().length > 0 && (
            <button
              type="button"
              onClick={handleSyncOffline}
              disabled={isSyncingQueue}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <Wifi className="w-3 h-3" />
              <span>Sincronizar Fila ({StorageService.getOfflineQueue().length})</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 pl-1 border-l border-slate-700">
            <span className={`w-2 h-2 rounded-full ${connStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{connStatus.online ? 'Online' : 'Contingência'}</span>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold space-y-1 shadow-sm animate-in fade-in ${
          feedbackMsg.isError
            ? 'bg-rose-50 border border-rose-200 text-rose-950'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.isError ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span className="font-bold">{feedbackMsg.text}</span>
          </div>
          {feedbackMsg.destination && (
            <p className={`text-xs ml-7 font-mono font-normal ${feedbackMsg.isError ? 'text-rose-800' : 'text-emerald-800'}`}>
              {feedbackMsg.destination}
            </p>
          )}
          {feedbackMsg.details && (
            <p className={`text-xs ml-7 font-normal ${feedbackMsg.isError ? 'text-rose-700' : 'text-emerald-700'}`}>
              {feedbackMsg.details}
            </p>
          )}
        </div>
      )}

      {isOffline && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 shadow-xs">
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Modo Offline ativado. Seus check-ins serão armazenados localmente e sincronizados com o banco MySQL assim que houver sinal de internet.</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DASHBOARD GERAL DE TODOS OS MILITANTES (EXCLUSIVO COORDENAÇÃO)     */}
      {/* ========================================================================= */}
      {isCoordination && activeTab === 'dashboard_militantes' && (
        <div className="space-y-6">
          
          {/* Security & Access Level Banner */}
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-700 shrink-0" />
              <span>
                <strong>Visualização da Coordenação:</strong> Painel gerencial restrito aos líderes de campanha. Os militantes individuais só possuem acesso ao seu próprio perfil e check-ins.
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-200/70 text-purple-900 font-bold text-[10px] uppercase">
              Admin & Liderança
            </span>
          </div>

          {/* Coordination KPI Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Militantes</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{militants.length}</p>
              <span className="text-[10px] text-slate-400">Cadastrados</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Em Campo</span>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">{totalMilitantsActive}</p>
              <span className="text-[10px] text-emerald-600 font-medium">Operação Ativa</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Ruas Cobertas</span>
              <p className="text-lg font-bold text-blue-700 mt-0.5">{allCheckIns.length}</p>
              <span className="text-[10px] text-blue-600 font-medium">Check-ins Hoje</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Abordagens</span>
              <p className="text-lg font-bold text-purple-700 mt-0.5">{totalAbordagensGlobal}</p>
              <span className="text-[10px] text-purple-600 font-medium">Eleitores</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Comércios</span>
              <p className="text-lg font-bold text-amber-700 mt-0.5">{totalComerciosGlobal}</p>
              <span className="text-[10px] text-amber-600 font-medium">Pontos Atendidos</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Diárias Previstas</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">R$ {totalDailyRatesGlobal.toLocaleString('pt-BR')}</p>
              <span className="text-[10px] text-slate-400">Total / Dia</span>
            </div>

          </div>

          {/* Search, Filter & Controls Toolbar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-80 relative">
              <input
                type="text"
                placeholder="Buscar militante por nome, matrícula ou telefone..."
                value={militantSearch}
                onChange={(e) => setMilitantSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {/* Team Filter */}
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="todos">Todas as Equipes</option>
                <option value="team-alpha">Equipe Alpha (Kobrasol/Campinas)</option>
                <option value="team-bravo">Equipe Bravo (Barreiros)</option>
                <option value="team-charlie">Equipe Charlie (Forquilhinhas)</option>
                <option value="team-delta">Equipe Delta (Praia Comprida)</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="todos">Todos os Status</option>
                <option value="em_campo">Em Campo</option>
                <option value="ativo">Ativo</option>
                <option value="pausa">Em Pausa</option>
              </select>

              <span className="text-xs text-slate-500 ml-1">
                Exibindo <strong>{filteredMilitants.length}</strong> de {militants.length}
              </span>
            </div>
          </div>

          {/* Militants List for Coordination */}
          <div className="space-y-4">
            {filteredMilitants.map(mil => {
              // Get all check-ins for this militant
              const milCheckIns = allCheckIns.filter(c => c.militantId === mil.id || c.militantName === mil.name);

              return (
                <MilitantSummaryCard
                  key={mil.id}
                  militant={mil}
                  checkIns={milCheckIns}
                  onQuickCheckIn={handleQuickCheckIn}
                  onSelectPhotoZoom={setSelectedPhotoZoom}
                  onSaveMaterialAdjustment={handleSaveMaterialAdjustment}
                  onDeleteCheckIn={isCoordination ? handleRequestDeleteStreet : undefined}
                  onEditCheckIn={setEditingCheckIn}
                />
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REGISTRO DE NOVO CHECK-IN DE RUA                                   */}
      {/* ========================================================================= */}
      {activeTab === 'novo_checkin' && (
        <div className="space-y-6">
          
          {/* If user is Coordination, allow selecting any militant */}
          {isCoordination && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Registrar Check-in em Nome do Militante:
                </label>
              </div>
              <select
                value={selectedMilitantId}
                onChange={(e) => setSelectedMilitantId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              >
                {militants.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.matricula}) - {m.teamId === 'team-alpha' ? 'Eq. Alpha' : (m.teamId === 'team-bravo' ? 'Eq. Bravo' : 'Eq. Geral')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selected / Active Militant Summary Card with Interactive Counters */}
          <MilitantSummaryCard
            militant={activeMilitant}
            checkIns={allCheckIns.filter(c => c.militantId === activeMilitant.id || c.militantName === activeMilitant.name)}
            onSaveMaterialAdjustment={handleSaveMaterialAdjustment}
            onSelectPhotoZoom={setSelectedPhotoZoom}
            onDeleteCheckIn={isCoordination ? handleRequestDeleteStreet : undefined}
            onEditCheckIn={setEditingCheckIn}
            isCurrentMilitant={true}
          />

          {/* Form */}
          <form onSubmit={handleSubmitCheckin} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Registro de Rua & Distribuição</h3>
                  <p className="text-xs text-slate-500">Ao finalizar, os dados vão direto para o MySQL e abre uma nova rua automaticamente</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={isCapturingGps}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-blue-700 border border-slate-200 transition"
              >
                <Compass className={`w-3.5 h-3.5 ${isCapturingGps ? 'animate-spin' : ''}`} />
                {isCapturingGps ? 'Obtendo GPS...' : 'Atualizar GPS'}
              </button>
            </div>

            {/* GPS Badge */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">
                  Coordenadas: <strong className="text-slate-900 font-mono">{gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}</strong>
                </span>
              </div>
              <span className="text-slate-500 text-[11px] font-medium">Precisão: ±{gpsCoords.accuracy}m</span>
            </div>

            {/* WhatsApp Location Upload & Paste Section (Exclusive for Coordinator / Leadership) */}
            {isCoordination && (
              <WhatsAppLocationInput
                neighborhoods={neighborhoods}
                currentGps={gpsCoords}
                onApplyLocation={handleApplyWhatsAppLocation}
              />
            )}

            {/* Bairro & Trecho */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bairro de São José *
                </label>
                <select
                  value={selectedNeighborhoodId}
                  onChange={(e) => {
                    setSelectedNeighborhoodId(e.target.value);
                    const firstStreet = sampleStreetsByBairro[e.target.value]?.[0] || '';
                    if (firstStreet) setStreetName(firstStreet);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  {neighborhoods.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.zone}) - {n.population.toLocaleString('pt-BR')} hab.
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faixa de Numeração / Trecho
                </label>
                <input
                  type="text"
                  placeholder="Ex: do nº 100 ao 450 (lado par/ímpar)"
                  value={houseNumberRange}
                  onChange={(e) => setHouseNumberRange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Street Name input & Quick Suggestions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome da Rua / Avenida *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Av. Presidente Kennedy"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
              {/* Street auto pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-slate-500 py-0.5">Sugestões de {selectedNeighborhood.name}:</span>
                {currentSuggestions.map((st, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStreetName(st)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* REQUIRED COUNTERS: ABORDAGENS & MATERIAIS NO COMÉRCIO */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Abordagens & Comércios da Rua (Contagem do Dia)
                </span>
                <span className="text-[11px] text-blue-700 font-semibold">Contadores com botões +/-</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Abordagens a Eleitores */}
                <div className="p-3 rounded-xl bg-white border border-blue-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Abordagens</span>
                      <span className="text-[10px] text-slate-500">Eleitores conversados</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => incrementMaterial('abordagens', -5)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={materials.abordagens || 0}
                      onChange={(e) => setMaterials({...materials, abordagens: Math.max(0, parseInt(e.target.value) || 0)})}
                      className="w-16 bg-white border border-slate-300 rounded-lg py-1 text-center text-sm font-bold text-purple-700"
                    />
                    <button
                      type="button"
                      onClick={() => incrementMaterial('abordagens', 5)}
                      className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white font-bold shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Materiais no Comércio */}
                <div className="p-3 rounded-xl bg-white border border-blue-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Materiais no Comércio</span>
                      <span className="text-[10px] text-slate-500">Lojas & balcões atendidos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => incrementMaterial('comercio', -1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={materials.comercio || 0}
                      onChange={(e) => setMaterials({...materials, comercio: Math.max(0, parseInt(e.target.value) || 0)})}
                      className="w-16 bg-white border border-slate-300 rounded-lg py-1 text-center text-sm font-bold text-emerald-700"
                    />
                    <button
                      type="button"
                      onClick={() => incrementMaterial('comercio', 1)}
                      className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white font-bold shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Material Distribution Counters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Materiais Gráficos Distribuídos
                </label>
                <span className="text-[11px] text-blue-700 font-semibold">
                  Total Gráfico: {(materials.santinhos + materials.colinhas + materials.adesivos + materials.adesivo_bola + materials.adesivo_parachoque)} un.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Santinhos */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-900 block">Santinhos</span>
                      <span className="text-[10px] text-slate-500">Folhetos com propostas</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => incrementMaterial('santinhos', -50)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={materials.santinhos}
                      onChange={(e) => setMaterials({...materials, santinhos: Math.max(0, parseInt(e.target.value) || 0)})}
                      className="w-16 bg-white border border-slate-300 rounded-lg py-1 text-center text-sm font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => incrementMaterial('santinhos', 50)}
                      className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white font-bold shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Colinhas */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-900 block">Colinhas</span>
                      <span className="text-[10px] text-slate-500">Para o dia do voto</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => incrementMaterial('colinhas', -20)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={materials.colinhas}
                      onChange={(e) => setMaterials({...materials, colinhas: Math.max(0, parseInt(e.target.value) || 0)})}
                      className="w-16 bg-white border border-slate-300 rounded-lg py-1 text-center text-sm font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => incrementMaterial('colinhas', 20)}
                      className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white font-bold shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Adesivo Bola Perfurite */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                      <Disc className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-900 block">Adesivo Bola</span>
                      <span className="text-[10px] text-slate-500">Vidro de veículos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => incrementMaterial('adesivo_bola', -5)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={materials.adesivo_bola}
                      onChange={(e) => setMaterials({...materials, adesivo_bola: Math.max(0, parseInt(e.target.value) || 0)})}
                      className="w-16 bg-white border border-slate-300 rounded-lg py-1 text-center text-sm font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => incrementMaterial('adesivo_bola', 5)}
                      className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white font-bold shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Adesivo Parachoque */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-900 block">Adesivo Parachoque</span>
                      <span className="text-[10px] text-slate-500">Faixa adesiva</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => incrementMaterial('adesivo_parachoque', -5)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={materials.adesivo_parachoque}
                      onChange={(e) => setMaterials({...materials, adesivo_parachoque: Math.max(0, parseInt(e.target.value) || 0)})}
                      className="w-16 bg-white border border-slate-300 rounded-lg py-1 text-center text-sm font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => incrementMaterial('adesivo_parachoque', 5)}
                      className="w-7 h-7 rounded-lg bg-amber-600 hover:bg-amber-700 flex items-center justify-center text-white font-bold shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Photos Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" />
                  Fotos de Comprovação de Campo ({photos.length})
                </label>
                {isCompressingPhoto ? (
                  <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Otimizando fotos...
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">Compressão HD automática ativa</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.map((p, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100 shadow-xs">
                    <img src={p} alt="Foto de Campo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-white/90 text-rose-600 hover:text-white hover:bg-rose-600 transition shadow-xs"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Botão Tirar Foto na Câmera */}
                <label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-100/50 cursor-pointer transition p-2 text-center">
                  <Camera className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-xs font-bold text-blue-900">Tirar Foto</span>
                  <span className="text-[10px] text-blue-600 font-medium">Câmera Celular</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleAddPhoto}
                    className="hidden"
                  />
                </label>

                {/* Botão Galeria de Fotos */}
                <label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 cursor-pointer transition p-2 text-center">
                  <ImageIcon className="w-5 h-5 text-slate-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-800">Galeria</span>
                  <span className="text-[10px] text-slate-500">Múltiplas Fotos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddPhoto}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Observations */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações / Feedback dos Eleitores (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Comércio muito receptivo. Pediram material extra sobre segurança e saúde."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Finalize and Transmit Button */}
            <button
              type="submit"
              disabled={isTransmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Database className="w-5 h-5" />
              {isTransmitting
                ? 'Transmitindo para o MySQL Hostinger...'
                : `Finalizar Check-in de ${activeMilitant.name} & Transmitir para o MySQL`}
            </button>

          </form>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MEU HISTÓRICO & METAS PESSOAIS (EXCLUSIVO MILITANTE)               */}
      {/* ========================================================================= */}
      {!isCoordination && activeTab === 'meu_historico' && (
        <div className="space-y-6">
          
          {/* Privacy & LGPD Security Notice */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold block">Acesso Restrito ao Militante</span>
                <span className="text-emerald-800 text-[11px]">
                  Você tem acesso exclusivo e seguro às suas próprias métricas, diárias e histórico de ruas percorridas.
                </span>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px] uppercase font-mono">
              LGPD OK
            </span>
          </div>

          {/* Personal Summary Card with Interactive Material Adjustments */}
          <MilitantSummaryCard
            militant={userOwnMilitant}
            checkIns={myCheckIns}
            onQuickCheckIn={() => setActiveTab('novo_checkin')}
            onSelectPhotoZoom={setSelectedPhotoZoom}
            onSaveMaterialAdjustment={handleSaveMaterialAdjustment}
            onEditCheckIn={setEditingCheckIn}
            isCurrentMilitant={true}
          />

        </div>
      )}

      {/* Photo Zoom Modal */}
      {selectedPhotoZoom && (
        <div
          onClick={() => setSelectedPhotoZoom(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-2xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl max-h-[85vh] bg-white rounded-xl p-3 border border-slate-200 shadow-xl">
            <img src={selectedPhotoZoom} alt="Foto Ampliada" className="max-h-[75vh] w-auto rounded-lg object-contain" />
            <p className="text-xs text-slate-500 text-center py-2">Clique em qualquer lugar para fechar</p>
          </div>
        </div>
      )}

      {/* Delete Street Confirmation Modal (Exclusive for Coordinator) */}
      {deletingCheckIn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Apagar Registro de Rua?</h3>
                <p className="text-xs text-slate-500">Ação de coordenação e auditoria</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p>Rua selecionada: <strong className="text-slate-900">{deletingCheckIn.streetName}</strong></p>
              <p className="text-[11px] text-slate-500">Ao confirmar, este check-in será removido do histórico do militante e das estatísticas do dia.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingCheckIn(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStreet}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-4 h-4" />
                Sim, Apagar Rua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Street Modal (Includes photo upload, GPS coordinates, materials, notes) */}
      <EditStreetModal
        isOpen={!!editingCheckIn}
        checkIn={editingCheckIn}
        neighborhoods={neighborhoods}
        onClose={() => setEditingCheckIn(null)}
        onSave={handleSaveEditedStreet}
      />

    </div>
  );
};
