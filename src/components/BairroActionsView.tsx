import React, { useState } from 'react';
import {
  BairroAction,
  BairroActionScope,
  Neighborhood,
  Militant,
  Team,
  User
} from '../types';
import { StorageService } from '../services/storageService';
import { compressImageFile } from '../utils/imageCompressor';
import {
  Camera,
  MapPin,
  Plus,
  Users,
  User as UserIcon,
  Flag,
  Upload,
  Calendar,
  X,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Navigation,
  Eye,
  Store,
  GraduationCap,
  Building,
  ShoppingBag,
  Sparkles,
  Layers,
  Clock,
  Compass,
  FileText,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BairroActionsViewProps {
  currentUser: User;
  neighborhoods: Neighborhood[];
  militants: Militant[];
  teams: Team[];
  isOffline?: boolean;
  onActionCreated?: () => void;
  initialNeighborhoodId?: string;
  onZoomPhoto?: (url: string) => void;
}

export const BairroActionsView: React.FC<BairroActionsViewProps> = ({
  currentUser,
  neighborhoods,
  militants,
  teams,
  isOffline = false,
  onActionCreated,
  initialNeighborhoodId,
  onZoomPhoto: externalZoomPhoto
}) => {
  const isCoordination = currentUser.role === 'admin' || currentUser.role === 'coordenador' || currentUser.role === 'lider';

  const [actions, setActions] = useState<BairroAction[]>(() => StorageService.getBairroActions());
  const [filterNeighborhood, setFilterNeighborhood] = useState<string>(initialNeighborhoodId || 'todos');
  const [filterActionType, setFilterActionType] = useState<string>('todos');
  const [filterScope, setFilterScope] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<string | null>(null);

  // Form Fields
  const [formNeighborhoodId, setFormNeighborhoodId] = useState<string>(
    initialNeighborhoodId || neighborhoods[0]?.id || 'kobrasol'
  );
  const [formLocationType, setFormLocationType] = useState<string>('praca');
  const [formLocationName, setFormLocationName] = useState<string>('');
  const [formActionType, setFormActionType] = useState<string>('distribuicao_materiais');
  const [formActionCustom, setFormActionCustom] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formScope, setFormScope] = useState<BairroActionScope>('toda_equipe');
  const [formMilitantId, setFormMilitantId] = useState<string>(militants[0]?.id || '');
  const [formSelectedMilitantIds, setFormSelectedMilitantIds] = useState<string[]>([]);
  const [formTeamId, setFormTeamId] = useState<string>(teams[0]?.id || 'team-alpha');
  
  // GPS fields
  const [formUseGps, setFormUseGps] = useState<boolean>(true);
  const [formLatitude, setFormLatitude] = useState<string>('-27.5958');
  const [formLongitude, setFormLongitude] = useState<string>('-48.6185');
  const [formAccuracy, setFormAccuracy] = useState<number>(3.5);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [formAddress, setFormAddress] = useState<string>('');

  // Timing & Photos & Metrics
  const [formTimestamp, setFormTimestamp] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().substring(0, 16);
  });
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [formEstimatedPeople, setFormEstimatedPeople] = useState<number>(100);
  const [formObservations, setFormObservations] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const reloadActions = () => {
    setActions(StorageService.getBairroActions());
  };

  const handleOpenNewModal = (preselectedBairroId?: string) => {
    setEditingActionId(null);
    const targetBairroId = preselectedBairroId || (filterNeighborhood !== 'todos' ? filterNeighborhood : neighborhoods[0]?.id || 'kobrasol');
    const targetBairro = neighborhoods.find(n => n.id === targetBairroId) || neighborhoods[0];

    setFormNeighborhoodId(targetBairro.id);
    setFormLocationType('praca');
    setFormLocationName('');
    setFormActionType('distribuicao_materiais');
    setFormActionCustom('');
    setFormTitle('');
    setFormScope('toda_equipe');
    setFormMilitantId(militants[0]?.id || '');
    setFormSelectedMilitantIds([militants[0]?.id, militants[1]?.id].filter(Boolean) as string[]);
    setFormTeamId(teams[0]?.id || 'team-alpha');
    setFormUseGps(true);
    setFormLatitude(String(targetBairro.lat || -27.5958));
    setFormLongitude(String(targetBairro.lng || -48.6185));
    setFormAccuracy(3.5);
    setFormAddress('');
    setFormTimestamp(new Date().toISOString().substring(0, 16));
    setFormPhotos([]);
    setFormEstimatedPeople(150);
    setFormObservations('');
    setIsModalOpen(true);
  };

  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormLatitude(pos.coords.latitude.toFixed(6));
          setFormLongitude(pos.coords.longitude.toFixed(6));
          setFormAccuracy(Math.round(pos.coords.accuracy));
          setIsCapturingGps(false);
        },
        () => {
          const bairro = neighborhoods.find(n => n.id === formNeighborhoodId);
          if (bairro) {
            setFormLatitude((bairro.lat + (Math.random() - 0.5) * 0.002).toFixed(6));
            setFormLongitude((bairro.lng + (Math.random() - 0.5) * 0.002).toFixed(6));
            setFormAccuracy(4.2);
          }
          setIsCapturingGps(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsCapturingGps(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    for (const file of fileList) {
      try {
        const compressed = await compressImageFile(file, 1280, 0.75);
        setFormPhotos(prev => [...prev, compressed]);
      } catch (err) {
        console.error('Erro ao processar foto:', err);
      }
    }
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setFormPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formLocationName.trim()) {
      alert('Por favor, informe o nome do local da ação (ex: Praça Eugênio Koerich, Supermercado Imperatriz, Escola Básica...).');
      return;
    }

    const targetBairro = neighborhoods.find(n => n.id === formNeighborhoodId) || neighborhoods[0];
    const targetTeam = teams.find(t => t.id === formTeamId);
    const targetMilitant = militants.find(m => m.id === formMilitantId);
    const selectedMilitantObjects = militants.filter(m => formSelectedMilitantIds.includes(m.id));

    const actionToSave: BairroAction = {
      id: editingActionId || `act-${formNeighborhoodId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      neighborhoodId: targetBairro.id,
      neighborhoodName: targetBairro.name,
      locationType: formLocationType,
      locationName: formLocationName.trim(),
      actionType: formActionType,
      actionTypeCustom: formActionType === 'outro' ? formActionCustom.trim() : undefined,
      title: formTitle.trim() || `${getActionTypeLabel(formActionType)} em ${formLocationName.trim()}`,
      scope: formScope,
      militantId: formScope === 'individual' ? targetMilitant?.id : undefined,
      militantName: formScope === 'individual' ? targetMilitant?.name : undefined,
      militantIds: formScope === 'grupo' ? selectedMilitantObjects.map(m => m.id) : undefined,
      militantNames: formScope === 'grupo' ? selectedMilitantObjects.map(m => m.name) : undefined,
      teamId: formScope === 'toda_equipe' ? targetTeam?.id : undefined,
      teamName: formScope === 'toda_equipe' ? (targetTeam?.name || 'Toda a Equipe') : undefined,
      hasGps: formUseGps,
      latitude: formUseGps ? parseFloat(formLatitude) || targetBairro.lat : undefined,
      longitude: formUseGps ? parseFloat(formLongitude) || targetBairro.lng : undefined,
      accuracyMeters: formUseGps ? formAccuracy : undefined,
      address: formAddress.trim() || undefined,
      timestamp: formTimestamp.replace('T', ' ') + (formTimestamp.length === 16 ? ':00' : ''),
      photos: formPhotos,
      estimatedPeople: formEstimatedPeople > 0 ? formEstimatedPeople : undefined,
      observations: formObservations.trim() || undefined,
      status: 'concluida',
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: new Date().toISOString()
    };

    StorageService.saveBairroAction(actionToSave);
    reloadActions();
    if (onActionCreated) onActionCreated();

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 }
      });
    } catch {}

    setFeedbackMsg({
      text: `✓ Ação no Bairro "${actionToSave.title}" registrada com sucesso em ${targetBairro.name}!`
    });
    setIsModalOpen(false);

    setTimeout(() => {
      setFeedbackMsg(null);
    }, 6000);
  };

  const handleDeleteAction = (actionId: string, title?: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a ação "${title || 'Ação no Bairro'}"? Esta operação é irreversível.`)) {
      StorageService.deleteBairroAction(actionId);
      reloadActions();
      if (onActionCreated) onActionCreated();
      setFeedbackMsg({
        text: 'Ação no bairro removida com sucesso.'
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // Helper Labels & Icons
  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'praca': return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'escola': return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'mercado':
      case 'supermercado': return <ShoppingBag className="w-4 h-4 text-amber-600" />;
      case 'feira': return <Store className="w-4 h-4 text-orange-600" />;
      case 'calcadao': return <Navigation className="w-4 h-4 text-purple-600" />;
      default: return <MapPin className="w-4 h-4 text-slate-600" />;
    }
  };

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'praca': return 'Praça Pública';
      case 'escola': return 'Escola / Colégio';
      case 'supermercado': return 'Supermercado';
      case 'mercado': return 'Mercado / Centro Comercial';
      case 'feira': return 'Feira Livre / Feirinha';
      case 'calcadao': return 'Calçadão / Via de Pedestres';
      case 'ponto_onibus': return 'Ponto de Ônibus / Terminal';
      case 'igreja': return 'Igreja / Centro Religioso';
      case 'posto_saude': return 'Posto de Saúde / UBS';
      default: return 'Espaço Público';
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'distribuicao_materiais': return 'Distribuição de Materiais';
      case 'abordagens': return 'Abordagens em Pessoas';
      case 'caminhada': return 'Caminhada Cívica';
      case 'bandeiraco': return 'Bandeiraço';
      case 'comicio': return 'Comício / Discurso';
      case 'carreata': return 'Carreata';
      case 'panfletagem': return 'Panfletagem';
      case 'corpo_a_corpo': return 'Corpo a Corpo';
      default: return 'Ação de Campo';
    }
  };

  // Filter actions
  const filteredActions = actions.filter(a => {
    const matchBairro = filterNeighborhood === 'todos' || a.neighborhoodId === filterNeighborhood;
    const matchType = filterActionType === 'todos' || a.actionType === filterActionType;
    const matchScope = filterScope === 'todos' || a.scope === filterScope;
    const matchSearch = !searchTerm.trim() ||
      a.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.neighborhoodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.title && a.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.militantName && a.militantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.teamName && a.teamName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchBairro && matchType && matchScope && matchSearch;
  });

  const totalPhotosOverall = actions.reduce((acc, a) => acc + (a.photos?.length || 0), 0);
  const totalPeopleOverall = actions.reduce((acc, a) => acc + (a.estimatedPeople || 0), 0);
  const uniqueNeighborhoodsCovered = new Set(actions.map(a => a.neighborhoodId)).size;

  const handleZoom = (photo: string) => {
    if (externalZoomPhoto) {
      externalZoomPhoto(photo);
    } else {
      setSelectedPhotoZoom(photo);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Actions Overview */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              Módulo de Campo
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              {actions.length} Ações Cadastradas
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Ações no Bairro
          </h2>
          <p className="text-slate-300 text-xs max-w-2xl mt-1 leading-relaxed">
            Cadastre ações pontuais em praças, escolas, feiras, mercados e pontos estratégicos de São José.
            Suporte para ações individuais, em grupo ou por toda a equipe, com galeria de fotos e geolocalização flexível.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenNewModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all shrink-0 hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nova Ação no Bairro</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border shadow-xs transition-all ${
          feedbackMsg.isError ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total de Ações</span>
          <strong className="text-lg font-black text-slate-900 font-mono mt-0.5 block">{actions.length}</strong>
          <span className="text-[10px] text-blue-600 font-medium">Cadastradas no app</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Bairros Atendidos</span>
          <strong className="text-lg font-black text-indigo-700 font-mono mt-0.5 block">{uniqueNeighborhoodsCovered} bairros</strong>
          <span className="text-[10px] text-slate-500">De São José</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Pessoas Impactadas</span>
          <strong className="text-lg font-black text-purple-700 font-mono mt-0.5 block">{totalPeopleOverall.toLocaleString('pt-BR')}</strong>
          <span className="text-[10px] text-purple-600 font-medium">Estimativa presencial</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Galeria de Fotos</span>
          <strong className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">{totalPhotosOverall} fotos</strong>
          <span className="text-[10px] text-emerald-600 font-medium">Comprovantes anexados</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por praça, escola, supermercado, militante ou bairro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bairro Filter */}
          <select
            value={filterNeighborhood}
            onChange={(e) => setFilterNeighborhood(e.target.value)}
            aria-label="Filtrar por Bairro"
            className="px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos os Bairros</option>
            {neighborhoods.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Action Type Filter */}
          <select
            value={filterActionType}
            onChange={(e) => setFilterActionType(e.target.value)}
            aria-label="Filtrar por Tipo de Ação"
            className="px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos os Tipos de Ação</option>
            <option value="distribuicao_materiais">Distribuição de Materiais</option>
            <option value="abordagens">Abordagens em Pessoas</option>
            <option value="caminhada">Caminhada</option>
            <option value="bandeiraco">Bandeiraço</option>
            <option value="panfletagem">Panfletagem</option>
            <option value="corpo_a_corpo">Corpo a Corpo</option>
            <option value="comicio">Comício</option>
            <option value="carreata">Carreata</option>
          </select>

          {/* Scope Filter */}
          <select
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value)}
            aria-label="Filtrar por Formato da Ação"
            className="px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos os Formatos</option>
            <option value="individual">Individual (por militante)</option>
            <option value="grupo">Em Grupo (vários)</option>
            <option value="toda_equipe">Toda a Equipe</option>
          </select>
        </div>
      </div>

      {/* List of Actions */}
      {filteredActions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-slate-300 space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhuma ação encontrada</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não há ações no bairro correspondentes aos filtros selecionados. Clique no botão abaixo para registrar uma nova ação.
          </p>
          <button
            type="button"
            onClick={() => handleOpenNewModal(filterNeighborhood !== 'todos' ? filterNeighborhood : undefined)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Ação Agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActions.map(action => {
            const bairroObj = neighborhoods.find(n => n.id === action.neighborhoodId);
            return (
              <div
                key={action.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5"
              >
                <div>
                  {/* Card Header: Bairro & Scope Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      {action.neighborhoodName || bairroObj?.name || 'São José'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {action.scope === 'individual' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <UserIcon className="w-3 h-3 text-purple-600" />
                          Individual
                        </span>
                      )}
                      {action.scope === 'grupo' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber-600" />
                          Em Grupo ({action.militantNames?.length || 'Vários'})
                        </span>
                      )}
                      {action.scope === 'toda_equipe' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Flag className="w-3 h-3 text-emerald-600" />
                          {action.teamName || 'Toda a Equipe'}
                        </span>
                      )}

                      {isCoordination && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAction(action.id, action.title)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                          title="Excluir ação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Location */}
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {action.title || action.locationName}
                  </h4>

                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {getLocationTypeIcon(action.locationType)}
                      {action.locationName}
                    </span>

                    <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {getActionTypeLabel(action.actionType)}
                    </span>
                  </div>

                  {/* Date & Address */}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {action.timestamp}
                    </span>

                    {action.hasGps && action.latitude && action.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${action.latitude},${action.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline font-mono"
                        title="Abrir no Google Maps"
                      >
                        <Compass className="w-3 h-3" />
                        {action.latitude.toFixed(4)}, {action.longitude.toFixed(4)}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Sem GPS pontual
                      </span>
                    )}

                    {action.estimatedPeople && (
                      <span className="font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                        👥 ~{action.estimatedPeople} pessoas
                      </span>
                    )}
                  </div>

                  {/* Participants details */}
                  {action.scope === 'individual' && action.militantName && (
                    <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                      <UserIcon className="w-3 h-3 text-purple-600 shrink-0" />
                      <span>Militante responsável: <strong>{action.militantName}</strong></span>
                    </div>
                  )}

                  {action.scope === 'grupo' && action.militantNames && action.militantNames.length > 0 && (
                    <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
                      <span className="font-semibold text-slate-700 block">Militantes no grupo ({action.militantNames.length}):</span>
                      <div className="flex flex-wrap gap-1">
                        {action.militantNames.map((name, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {action.observations && (
                    <p className="mt-2 text-xs text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100 italic">
                      "{action.observations}"
                    </p>
                  )}
                </div>

                {/* Photo Gallery for this Action */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      Galeria de Fotos ({action.photos?.length || 0})
                    </span>
                    <span className="text-[10px] text-slate-400">Clique para ampliar</span>
                  </div>

                  {action.photos && action.photos.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {action.photos.map((photo, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => handleZoom(photo)}
                          className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group shadow-2xs hover:shadow-md transition"
                        >
                          <img
                            src={photo}
                            alt={`Foto da ação ${pIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-400">
                      Nenhuma foto vinculada a esta ação.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Nova Ação / Editar Ação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Cadastrar Ação no Bairro</h3>
                  <p className="text-slate-300 text-xs">Praças, escolas, mercados, caminhadas e comícios</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* 1. Escolha do Bairro */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  1. Escolha o Bairro *
                </label>
                <select
                  value={formNeighborhoodId}
                  onChange={(e) => {
                    setFormNeighborhoodId(e.target.value);
                    const b = neighborhoods.find(n => n.id === e.target.value);
                    if (b) {
                      setFormLatitude(String(b.lat));
                      setFormLongitude(String(b.lng));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {neighborhoods.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.zone})</option>
                  ))}
                </select>
              </div>

              {/* 2. Tipo do Local & Nome do Local */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    2. Tipo de Local
                  </label>
                  <select
                    value={formLocationType}
                    onChange={(e) => setFormLocationType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="praca">Praça Pública</option>
                    <option value="escola">Escola / Colégio</option>
                    <option value="supermercado">Supermercado</option>
                    <option value="mercado">Mercado / Galeria</option>
                    <option value="feira">Feira Livre</option>
                    <option value="calcadao">Calçadão Comercial</option>
                    <option value="ponto_onibus">Ponto de Ônibus / Terminal</option>
                    <option value="igreja">Igreja / Centro Comunitário</option>
                    <option value="posto_saude">Posto de Saúde / UBS</option>
                    <option value="outro">Outro Local</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Nome do Local *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Praça Eugênio Koerich, Supermercado Imperatriz..."
                    value={formLocationName}
                    onChange={(e) => setFormLocationName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 3. Tipo de Ação */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  3. Tipo de Ação Realizada
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'distribuicao_materiais', label: 'Distribuição de Materiais' },
                    { id: 'abordagens', label: 'Abordagens em Pessoas' },
                    { id: 'caminhada', label: 'Caminhada' },
                    { id: 'bandeiraco', label: 'Bandeiraço' },
                    { id: 'comicio', label: 'Comício' },
                    { id: 'carreata', label: 'Carreata' },
                    { id: 'panfletagem', label: 'Panfletagem' },
                    { id: 'corpo_a_corpo', label: 'Corpo a Corpo' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormActionType(item.id)}
                      className={`p-2 rounded-lg text-xs font-bold border transition text-left ${
                        formActionType === item.id
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Formato da Ação: Individual, Grupo ou Equipe */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  4. Formato da Ação
                </label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormScope('individual')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      formScope === 'individual'
                        ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Individual (1 Militante)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormScope('grupo')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      formScope === 'grupo'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Em Grupo (Vários)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormScope('toda_equipe')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      formScope === 'toda_equipe'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Por Toda a Equipe
                  </button>
                </div>

                {/* Sub-form based on scope */}
                {formScope === 'individual' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Selecione o Militante:
                    </label>
                    <select
                      value={formMilitantId}
                      onChange={(e) => setFormMilitantId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800"
                    >
                      {militants.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.matricula})</option>
                      ))}
                    </select>
                  </div>
                )}

                {formScope === 'grupo' && (
                  <div className="pt-2 space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Selecione os Militantes do Grupo ({formSelectedMilitantIds.length} selecionados):
                    </label>
                    <div className="max-h-36 overflow-y-auto p-2 rounded-lg bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {militants.map(m => {
                        const isSelected = formSelectedMilitantIds.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setFormSelectedMilitantIds(prev => prev.filter(id => id !== m.id));
                              } else {
                                setFormSelectedMilitantIds(prev => [...prev, m.id]);
                              }
                            }}
                            className={`p-1.5 rounded text-left text-xs flex items-center justify-between border transition ${
                              isSelected
                                ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{m.name}</span>
                            <span className="text-[10px] font-mono">{m.matricula}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formScope === 'toda_equipe' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Selecione a Equipe Responsável:
                    </label>
                    <select
                      value={formTeamId}
                      onChange={(e) => setFormTeamId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800"
                    >
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                      <option value="equipe-geral">Toda a Mobilização / Todas as Equipes</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 5. Geolocalização (Opcional, que poderá ser usada ou não) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-600" />
                    5. Geolocalização (Uso Opcional)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={formUseGps}
                      onChange={(e) => setFormUseGps(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Ativar GPS</span>
                  </label>
                </div>

                {formUseGps ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCaptureGps}
                        disabled={isCapturingGps}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Navigation className={`w-3.5 h-3.5 ${isCapturingGps ? 'animate-spin' : ''}`} />
                        <span>{isCapturingGps ? 'Capturando Satélites...' : 'Capturar Meu GPS Atual'}</span>
                      </button>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Precisão: ±{formAccuracy}m
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Latitude</span>
                        <input
                          type="text"
                          value={formLatitude}
                          onChange={(e) => setFormLatitude(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Longitude</span>
                        <input
                          type="text"
                          value={formLongitude}
                          onChange={(e) => setFormLongitude(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Geolocalização desativada para esta ação. Será registrada com o endereço e bairro indicados.
                  </p>
                )}

                <div>
                  <span className="text-[10px] text-slate-500 block">Endereço / Referência Complementar (Opcional):</span>
                  <input
                    type="text"
                    placeholder="Ex: Em frente ao portão principal, esquina com a Av. Central"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* 6. Galeria de Fotos e Local Específico para Upload */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    6. Galeria de Fotos da Ação ({formPhotos.length})
                  </label>
                  <span className="text-[11px] text-slate-500">Múltiplas fotos permitidas</span>
                </div>

                {/* Upload Box */}
                <div className="p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 transition text-center relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-blue-900">Clique para selecionar ou arraste fotos aqui</span>
                    <span className="text-[10px] text-slate-500">Comprovantes, fotos com eleitores, praças e materiais</span>
                  </div>
                </div>

                {/* Preview Grid */}
                {formPhotos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {formPhotos.map((photo, pIdx) => (
                      <div key={pIdx} className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(pIdx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 7. Pessoas Estimadas & Observações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Pessoas Estimadas Impactadas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formEstimatedPeople}
                    onChange={(e) => setFormEstimatedPeople(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Data e Hora
                  </label>
                  <input
                    type="datetime-local"
                    value={formTimestamp}
                    onChange={(e) => setFormTimestamp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Observações e Relato da Ação
                </label>
                <textarea
                  rows={2}
                  placeholder="Relato sucinto da recepção dos moradores, lideranças presentes ou pontos de atenção..."
                  value={formObservations}
                  onChange={(e) => setFormObservations(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  Salvar Ação no Bairro
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Internal Zoom Modal if no external handler */}
      {selectedPhotoZoom && !externalZoomPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setSelectedPhotoZoom(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedPhotoZoom(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 text-sm font-bold flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full"
            >
              <X className="w-4 h-4" /> Fechar
            </button>
            <img
              src={selectedPhotoZoom}
              alt="Foto Ampliada"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
};
