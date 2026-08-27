import React, { useState } from 'react';
import {
  Militant,
  Team,
  Van,
  User,
  UserRole,
  Neighborhood
} from '../types';
import { StorageService } from '../services/storageService';
import {
  Users,
  UserPlus,
  Shield,
  Phone,
  Mail,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Truck,
  MapPin,
  Sparkles,
  Car,
  Navigation,
  Camera,
  Upload,
  Image as ImageIcon,
  UserCheck,
  ExternalLink
} from 'lucide-react';

interface CadastrosViewProps {
  militants: Militant[];
  teams: Team[];
  vans: Van[];
  neighborhoods: Neighborhood[];
  currentUser: User;
  onRefreshData: () => void;
}

const PRESET_COLORS = [
  '#2563EB', // Blue
  '#16A34A', // Green
  '#9333EA', // Purple
  '#D97706', // Amber
  '#E11D48', // Rose
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
  '#EA580C', // Orange
  '#059669', // Emerald
  '#475569'  // Slate
];

export const CadastrosView: React.FC<CadastrosViewProps> = ({
  militants,
  teams,
  vans,
  neighborhoods,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'militantes' | 'equipes' | 'motoristas'>('equipes');

  // Modal States
  const [showMilitantModal, setShowMilitantModal] = useState(false);
  const [editingMilitant, setEditingMilitant] = useState<Militant | null>(null);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const [showVanModal, setShowVanModal] = useState(false);
  const [editingVan, setEditingVan] = useState<Van | null>(null);

  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [deletingMilitant, setDeletingMilitant] = useState<Militant | null>(null);
  const [deletingVan, setDeletingVan] = useState<Van | null>(null);

  // Militant Form State
  const [mName, setMName] = useState('');
  const [mMatricula, setMMatricula] = useState('');
  const [mCpf, setMCpf] = useState('');
  const [mPhone, setMPhone] = useState('(48) 9');
  const [mEmail, setMEmail] = useState('');
  const [mTeamId, setMTeamId] = useState(teams[0]?.id || 'team-alpha');
  const [mRole, setMRole] = useState<UserRole>('militante');
  const [mDailyRate, setMDailyRate] = useState<number>(150);
  const [mAvatar, setMAvatar] = useState<string>('');

  // Handle Photo File Upload
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Militant Modal (New or Edit)
  const handleOpenMilitantModal = (mil?: Militant, defaultTeamId?: string) => {
    if (mil) {
      setEditingMilitant(mil);
      setMName(mil.name);
      setMMatricula(mil.matricula);
      setMCpf(mil.cpfMasked);
      setMPhone(mil.phone);
      setMEmail(mil.email);
      setMTeamId(mil.teamId);
      setMRole(mil.role);
      setMDailyRate(mil.dailyRate || (mil.role === 'lider' || mil.role === 'motorista_van' ? 250 : 150));
      setMAvatar(mil.avatar || '');
    } else {
      setEditingMilitant(null);
      setMName('');
      const nextNum = Math.min(50, (militants.length + 1));
      setMMatricula(`Mil${String(nextNum).padStart(3, '0')}`);
      setMCpf('');
      setMPhone('(48) 9');
      setMEmail('');
      setMTeamId(defaultTeamId || teams[0]?.id || 'team-alpha');
      setMRole('militante');
      setMDailyRate(150);
      setMAvatar('');
    }
    setShowMilitantModal(true);
  };

  // Save Militant
  const handleSaveMilitant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim()) return;

    const baseMil = editingMilitant || {
      id: `mil-${Date.now()}`,
      avatar: mAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'ativo' as const,
      totalKmWalked: 0,
      totalStreetsCovered: 0,
      deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
      weeklyGoalPercentage: 0,
      batteryLevel: 100
    };

    const updatedMilitant: Militant = {
      ...baseMil,
      name: mName,
      matricula: mMatricula,
      avatar: mAvatar || baseMil.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      cpfMasked: mCpf.includes('*') ? mCpf : (mCpf ? `***.${mCpf.substring(4, 7)}.${mCpf.substring(7, 10)}-**` : '***.***.***-**'),
      phone: mPhone,
      email: mEmail || `${mName.toLowerCase().replace(/\s+/g, '.')}@campanhasj.com.br`,
      teamId: mTeamId,
      role: mRole,
      dailyRate: mDailyRate || 150
    };

    StorageService.addOrUpdateMilitant(updatedMilitant);
    setShowMilitantModal(false);
    onRefreshData();
  };
  const [tName, setTName] = useState('');
  const [tColor, setTColor] = useState(PRESET_COLORS[0]);
  const [tLeaderName, setTLeaderName] = useState('');
  const [tAssignedVanId, setTAssignedVanId] = useState(vans[0]?.id || 'van-01');
  const [tSelectedBairros, setTSelectedBairros] = useState<string[]>([]);
  const [tStatus, setTStatus] = useState<Team['status']>('em_campo');

  // Van / Driver Form State
  const [vName, setVName] = useState('');
  const [vModel, setVModel] = useState('');
  const [vPlate, setVPlate] = useState('');
  const [vDriverName, setVDriverName] = useState('');
  const [vDriverPhone, setVDriverPhone] = useState('(48) 9');
  const [vCapacity, setVCapacity] = useState(16);
  const [vAssignedTeamIds, setVAssignedTeamIds] = useState<string[]>([]);
  const [vStatus, setVStatus] = useState<Van['status']>('em_rota');
  const [vNextPickupLocation, setVNextPickupLocation] = useState('Praça Central / Ponto de Apoio');
  const [vNextPickupTime, setVNextPickupTime] = useState('12:30');

  // Delete Militant
  const handleConfirmDeleteMilitant = () => {
    if (!deletingMilitant) return;
    StorageService.deleteMilitant(deletingMilitant.id);
    setDeletingMilitant(null);
    onRefreshData();
  };

  // Open Team Modal (New or Edit)
  const handleOpenTeamModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setTName(team.name);
      setTColor(team.color || PRESET_COLORS[0]);
      setTLeaderName(team.leaderName);
      setTAssignedVanId(team.assignedVanId || vans[0]?.id || 'van-01');
      setTSelectedBairros(team.targetNeighborhoodIds || []);
      setTStatus(team.status || 'em_campo');
    } else {
      setEditingTeam(null);
      setTName(`Equipe ${['Delta', 'Eco', 'Fox', 'Golf', 'Hotel'][teams.length % 5]} - São José`);
      setTColor(PRESET_COLORS[teams.length % PRESET_COLORS.length]);
      setTLeaderName('');
      setTAssignedVanId(vans[0]?.id || `van-0${(teams.length % 3) + 1}`);
      setTSelectedBairros([neighborhoods[0]?.id || 'kobrasol']);
      setTStatus('em_campo');
    }
    setShowTeamModal(true);
  };

  // Toggle Neighborhood in Team
  const handleToggleBairro = (bairroId: string) => {
    setTSelectedBairros(prev =>
      prev.includes(bairroId)
        ? prev.filter(id => id !== bairroId)
        : [...prev, bairroId]
    );
  };

  // Save Team (Create or Edit)
  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim()) return;

    const baseTeam = editingTeam || {
      id: `team-${Date.now()}`,
      memberIds: [],
      dailyProgressPct: 0,
      totalMaterialsDelivered: 0
    };

    const updatedTeam: Team = {
      ...baseTeam,
      name: tName.trim(),
      color: tColor,
      leaderId: ('leaderId' in baseTeam && baseTeam.leaderId) ? baseTeam.leaderId : `leader-${Date.now()}`,
      leaderName: tLeaderName.trim() || 'Coordenador Designado',
      assignedVanId: tAssignedVanId,
      targetNeighborhoodIds: tSelectedBairros.length > 0 ? tSelectedBairros : [neighborhoods[0]?.id || 'kobrasol'],
      status: tStatus
    };

    StorageService.addOrUpdateTeam(updatedTeam);
    setShowTeamModal(false);
    onRefreshData();
  };

  // Delete Team
  const handleConfirmDeleteTeam = () => {
    if (!deletingTeam) return;
    StorageService.deleteTeam(deletingTeam.id);
    setDeletingTeam(null);
    onRefreshData();
  };

  // Open Van / Driver Modal (New or Edit)
  const handleOpenVanModal = (van?: Van) => {
    if (van) {
      setEditingVan(van);
      setVName(van.name);
      setVModel(van.model);
      setVPlate(van.plate);
      setVDriverName(van.driverName);
      setVDriverPhone(van.driverPhone);
      setVCapacity(van.capacity || 16);
      setVAssignedTeamIds(van.assignedTeamIds || []);
      setVStatus(van.status || 'em_rota');
      setVNextPickupLocation(van.nextPickupLocation || 'Praça Central / Ponto de Apoio');
      setVNextPickupTime(van.nextPickupTime || '12:30');
    } else {
      setEditingVan(null);
      setVName(`Van 0${vans.length + 1} - Logística`);
      setVModel('Renault Master Grand L3H2 (16 Lugares)');
      setVPlate(`RKS-${Math.floor(Math.random() * 8 + 1)}A${Math.floor(Math.random() * 80 + 10)}`);
      setVDriverName('');
      setVDriverPhone('(48) 9');
      setVCapacity(16);
      setVAssignedTeamIds([teams[0]?.id || 'team-alpha']);
      setVStatus('em_rota');
      setVNextPickupLocation('Kobrasol - Ponto de Apoio');
      setVNextPickupTime('12:30');
    }
    setShowVanModal(true);
  };

  // Toggle Assigned Team in Van
  const handleToggleVanTeam = (teamId: string) => {
    setVAssignedTeamIds(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  // Save Van & Driver
  const handleSaveVan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vDriverName.trim() || !vPlate.trim()) return;

    const baseVan = editingVan || {
      id: `van-${Date.now()}`,
      currentCoords: { lat: -27.598, lng: -48.622, lastUpdate: 'Agora mesmo' }
    };

    const updatedVan: Van = {
      ...baseVan,
      name: vName.trim() || `Van ${vPlate.toUpperCase()}`,
      model: vModel.trim() || 'Van Transporte Executivo',
      plate: vPlate.trim().toUpperCase(),
      driverName: vDriverName.trim(),
      driverPhone: vDriverPhone.trim(),
      capacity: Number(vCapacity) || 16,
      assignedTeamIds: vAssignedTeamIds,
      status: vStatus,
      nextPickupLocation: vNextPickupLocation.trim() || 'Ponto de Apoio',
      nextPickupTime: vNextPickupTime.trim() || '12:30'
    };

    StorageService.addOrUpdateVan(updatedVan);
    setShowVanModal(false);
    onRefreshData();
  };

  // Delete Van & Driver
  const handleConfirmDeleteVan = () => {
    if (!deletingVan) return;
    StorageService.deleteVan(deletingVan.id);
    setDeletingVan(null);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Gestão de Recursos Humanos, Brigadas & Frotas
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Nível Gratuito / Sem Custos de Servidor
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Cadastro e Gestão de Equipes, Militantes & Motoristas</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Inclusão, edição e exclusão de equipes, militantes de campo e motoristas de van com veículos em São José - SC.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleOpenVanModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <Car className="w-4 h-4" />
            Cadastrar Motorista / Van
          </button>
          <button
            onClick={() => handleOpenTeamModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Incluir Equipe
          </button>
          <button
            onClick={() => handleOpenMilitantModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs shadow-sm transition"
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            Cadastrar Militante
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('equipes')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'equipes'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Equipes & Brigadas ({teams.length})
          </button>
          <button
            onClick={() => setActiveTab('militantes')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'militantes'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Militantes ({militants.length})
          </button>
          <button
            onClick={() => setActiveTab('motoristas')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'motoristas'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            Motoristas & Vans ({vans.length})
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline-block">
          Clique em <strong>Editar</strong> ou <strong>Excluir</strong> nos cards abaixo para gerenciar
        </span>
      </div>

      {/* TEAMS TAB */}
      {activeTab === 'equipes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Equipes de Campo Cadastradas ({teams.length})
            </h3>
            <button
              onClick={() => handleOpenTeamModal()}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Equipe
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map(team => {
              const targetBairros = team.targetNeighborhoodIds
                .map(id => neighborhoods.find(n => n.id === id)?.name)
                .filter(Boolean)
                .join(', ');

              const teamMembers = militants.filter(m => m.teamId === team.id);
              const assignedVan = vans.find(v => v.id === team.assignedVanId);

              return (
                <div key={team.id} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition">
                  
                  {/* Team Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full shrink-0 ring-2 ring-white shadow-xs"
                        style={{ backgroundColor: team.color || '#2563EB' }}
                      />
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{team.name}</h3>
                        <span className="text-[11px] text-slate-500 font-mono">ID: {team.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenTeamModal(team)}
                        title="Editar Equipe"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingTeam(team)}
                        title="Excluir Equipe"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Info Details */}
                  <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="flex items-center justify-between">
                      <span>👤 <strong>Líder da Equipe:</strong> {team.leaderName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        team.status === 'em_campo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        team.status === 'em_transito' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {team.status ? team.status.replace('_', ' ') : 'Ativo'}
                      </span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      <strong>Van & Motorista:</strong> {assignedVan ? `${assignedVan.name} (${assignedVan.driverName})` : (team.assignedVanId ? team.assignedVanId.toUpperCase() : 'Não atribuída')}
                    </p>
                    <p className="flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span><strong>Bairros Designados:</strong> {targetBairros || 'Todos os Bairros'}</span>
                    </p>
                  </div>

                  {/* Team Participants Section */}
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        Participantes da Equipe ({teamMembers.length})
                      </h4>
                      <button
                        onClick={() => handleOpenMilitantModal(undefined, team.id)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 transition"
                      >
                        <Plus className="w-3 h-3" />
                        Adicionar Integrante
                      </button>
                    </div>

                    {teamMembers.length === 0 ? (
                      <div className="p-3 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                        Nenhum participante vinculado a esta equipe ainda.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {teamMembers.map(member => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                                alt={member.name}
                                className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-900 truncate block">
                                    {member.name}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-500">
                                    ({member.matricula})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                    member.role === 'lider' ? 'bg-purple-100 text-purple-800' :
                                    member.role === 'coordenador' ? 'bg-amber-100 text-amber-800' :
                                    member.role === 'motorista_van' ? 'bg-indigo-100 text-indigo-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {member.role === 'lider' ? 'Líder' : member.role === 'coordenador' ? 'Coord.' : member.role === 'motorista_van' ? 'Motorista' : 'Militante'}
                                  </span>
                                  <span>R$ {member.dailyRate || 150}/dia</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {member.phone && (
                                <a
                                  href={`https://wa.me/55${member.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`Conversar com ${member.name} no WhatsApp`}
                                  className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                              )}
                              <button
                                onClick={() => handleOpenMilitantModal(member)}
                                title="Editar dados deste participante"
                                className="p-1 rounded bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Team Militants & Performance Footer */}
                  <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-100">
                        {teamMembers.length} participante{teamMembers.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {team.totalMaterialsDelivered?.toLocaleString('pt-BR') || 0} materiais entregues
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenTeamModal(team)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline"
                      >
                        Configurar Equipe
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MILITANTS TAB */}
      {activeTab === 'militantes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Militantes de Campo Cadastrados ({militants.length})
            </h3>
            <button
              onClick={() => handleOpenMilitantModal()}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Militante
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {militants.map(mil => {
              const team = teams.find(t => t.id === mil.teamId);
              return (
                <div key={mil.id} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={mil.avatar}
                        alt={mil.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{mil.name}</h4>
                        <p className="text-[11px] text-blue-700 font-mono font-medium">{mil.matricula}</p>
                        <span className="text-[10px] text-slate-500 font-medium capitalize">Cargo: {mil.role.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenMilitantModal(mil)}
                        title="Editar Militante"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingMilitant(mil)}
                        title="Excluir Militante"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <strong>Equipe:</strong> {team?.name || 'Sem Equipe'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {mil.phone}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {mil.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Ruas Cobertas</span>
                      <strong className="text-slate-900 text-sm">{mil.totalStreetsCovered}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Materiais</span>
                      <strong className="text-blue-700 text-sm">{(mil.deliveredMaterials.santinhos + (mil.deliveredMaterials.abordagens || 0) + (mil.deliveredMaterials.comercio || 0)).toLocaleString('pt-BR')}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-semibold block">Valor Diária</span>
                      <strong className="text-emerald-800 text-sm font-black">R$ {(mil.dailyRate || 150).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DRIVERS & VANS TAB */}
      {activeTab === 'motoristas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Motoristas e Frotas de Vans ({vans.length})
            </h3>
            <button
              onClick={() => handleOpenVanModal()}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Motorista / Van
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vans.map(van => {
              const assignedTeams = teams.filter(t => van.assignedTeamIds?.includes(t.id));

              return (
                <div key={van.id} className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-indigo-200 transition">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{van.driverName}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200">
                            {van.plate}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">{van.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenVanModal(van)}
                        title="Editar Motorista/Van"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingVan(van)}
                        title="Excluir Motorista/Van"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">🚐 <strong>Veículo:</strong> {van.model}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {van.capacity} lugares
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Contato:</strong> {van.driverPhone || 'Sem telefone'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                      <strong>Próximo Resgate:</strong> {van.nextPickupTime} - {van.nextPickupLocation}
                    </p>
                  </div>

                  {/* Assigned Teams */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-100 text-xs">
                    <span className="text-[11px] font-semibold text-slate-700 block">
                      Equipes Atendidas ({assignedTeams.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {assignedTeams.length > 0 ? (
                        assignedTeams.map(t => (
                          <span
                            key={t.id}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold text-white shadow-2xs"
                            style={{ backgroundColor: t.color || '#2563EB' }}
                          >
                            {t.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Nenhuma equipe vinculada</span>
                      )}
                    </div>
                  </div>

                  {/* Footer Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      van.status === 'em_rota' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      van.status === 'desembarque' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      van.status === 'aguardando_resgate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {van.status ? van.status.replace('_', ' ') : 'Ativo'}
                    </span>
                    <button
                      onClick={() => handleOpenVanModal(van)}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Editar cadastro
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: INCLUIR / EDITAR MOTORISTA & VAN */}
      {showVanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              {editingVan ? 'Editar Cadastro de Motorista e Van' : 'Cadastrar Novo Motorista e Van'}
            </h3>

            <form onSubmit={handleSaveVan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nome do Motorista *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Roberto Valente (Beto)"
                    value={vDriverName}
                    onChange={(e) => setVDriverName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(48) 99999-9999"
                    value={vDriverPhone}
                    onChange={(e) => setVDriverPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Identificação da Van</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Van 01 - Alpha"
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Placa do Veículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="RKS-8A24"
                    value={vPlate}
                    onChange={(e) => setVPlate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Capacidade (Lugares)</label>
                  <input
                    type="number"
                    min={4}
                    max={30}
                    value={vCapacity}
                    onChange={(e) => setVCapacity(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Modelo do Veículo</label>
                <input
                  type="text"
                  placeholder="Ex: Mercedes-Benz Sprinter 516 / Renault Master L3H2"
                  value={vModel}
                  onChange={(e) => setVModel(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ponto de Resgate Padrão</label>
                  <input
                    type="text"
                    placeholder="Ex: Praça Eugênio Raulino Koerich (Kobrasol)"
                    value={vNextPickupLocation}
                    onChange={(e) => setVNextPickupLocation(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status Operacional</label>
                  <select
                    value={vStatus}
                    onChange={(e) => setVStatus(e.target.value as Van['status'])}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none"
                  >
                    <option value="em_rota">Em Rota de Campo</option>
                    <option value="desembarque">Desembarque de Militantes</option>
                    <option value="aguardando_resgate">Aguardando Resgate / Ponto de Apoio</option>
                    <option value="garagem">Garagem / Manutenção</option>
                  </select>
                </div>
              </div>

              {/* Assigned Teams Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Equipes / Brigadas Atendidas por esta Van
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {teams.map(t => {
                    const isSelected = vAssignedTeamIds.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => handleToggleVanTeam(t.id)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: t.color || '#2563EB' }}
                          />
                          <span className="truncate">{t.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVanModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Salvar Motorista & Van
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INCLUIR / EDITAR EQUIPE */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {editingTeam ? <Edit2 className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
              {editingTeam ? 'Editar Equipe de Campo' : 'Incluir Nova Equipe de Campo'}
            </h3>

            <form onSubmit={handleSaveTeam} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome da Equipe / Brigada *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Equipe Delta - Forquilhinhas"
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Cor Identificadora da Equipe no Mapa</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map(color => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setTColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        tColor === color ? 'border-slate-900 scale-110 shadow-xs' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nome do Líder da Equipe *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Juliana Silveira"
                    value={tLeaderName}
                    onChange={(e) => setTLeaderName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Van & Motorista Vinculado</label>
                  <select
                    value={tAssignedVanId}
                    onChange={(e) => setTAssignedVanId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none"
                  >
                    {vans.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.driverName} - {v.plate})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Bairros de São José Designados ({tSelectedBairros.length} selecionados)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {neighborhoods.map(n => {
                    const isSelected = tSelectedBairros.includes(n.id);
                    return (
                      <button
                        type="button"
                        key={n.id}
                        onClick={() => handleToggleBairro(n.id)}
                        className={`p-1.5 rounded text-left flex items-center justify-between border transition ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{n.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status Operacional</label>
                <select
                  value={tStatus}
                  onChange={(e) => setTStatus(e.target.value as Team['status'])}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none"
                >
                  <option value="em_campo">Em Campo (Ativo)</option>
                  <option value="em_transito">Em Trânsito / Deslocamento</option>
                  <option value="descanso">Descanso / Almoço</option>
                  <option value="planejamento">Planejamento Estratégico</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Salvar Equipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR EXCLUSÃO DE EQUIPE */}
      {deletingTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50 border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Excluir Equipe?</h3>
                <p className="text-xs text-slate-500">Esta ação não poderá ser desfeita</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você tem certeza que deseja excluir a <strong>{deletingTeam.name}</strong>? Os militantes vinculados a ela serão desvinculados com segurança.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingTeam(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTeam}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Sim, Excluir Equipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR EXCLUSÃO DE MOTORISTA / VAN */}
      {deletingVan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50 border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Excluir Motorista / Van?</h3>
                <p className="text-xs text-slate-500">Esta ação removerá o motorista e o veículo do sistema</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você tem certeza que deseja excluir o motorista <strong>{deletingVan.driverName}</strong> (Van: {deletingVan.name} - Placa: {deletingVan.plate})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingVan(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVan}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Sim, Excluir Motorista/Van
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INCLUIR / EDITAR MILITANTE */}
      {showMilitantModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              {editingMilitant ? 'Editar Dados do Militante' : 'Cadastrar Novo Militante de Campo'}
            </h3>

            <form onSubmit={handleSaveMilitant} className="space-y-4 text-xs">
              
              {/* Photo Upload & Preview Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    Foto de Identificação do Participante
                  </span>
                  <span className="text-[10px] text-slate-500 lowercase font-normal">(militante / líder / coord)</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview */}
                  <div className="relative group shrink-0">
                    <img
                      src={mAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt="Foto do Participante"
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-blue-500/30"
                    />
                    <label
                      htmlFor="avatar-file-input"
                      className="absolute inset-0 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-[9px] font-bold"
                    >
                      <Camera className="w-4 h-4 mb-0.5" />
                      Alterar
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label
                        htmlFor="avatar-file-input"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer transition shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Fazer Upload de Foto
                      </label>
                      <input
                        id="avatar-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />

                      {mAvatar && (
                        <button
                          type="button"
                          onClick={() => setMAvatar('')}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-semibold rounded-lg transition text-[11px]"
                        >
                          Remover Foto
                        </button>
                      )}
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 font-medium">Modelos:</span>
                      {[
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                      ].map((presetUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setMAvatar(presetUrl)}
                          className="w-6 h-6 rounded-full overflow-hidden border border-slate-300 hover:scale-110 transition shrink-0"
                        >
                          <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo Ramos"
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Matrícula / Usuário de Login (Mil001 a Mil050)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mil001"
                    value={mMatricula}
                    onChange={(e) => setMMatricula(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono font-medium"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Senha de acesso ao App de Campo: <strong>2211</strong></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={mCpf}
                    onChange={(e) => setMCpf(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(48) 99999-9999"
                    value={mPhone}
                    onChange={(e) => setMPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="email@campanhasj.com.br"
                    value={mEmail}
                    onChange={(e) => setMEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Equipe / Brigada</label>
                  <select
                    value={mTeamId}
                    onChange={(e) => setMTeamId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Função / Cargo</label>
                  <select
                    value={mRole}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setMRole(newRole);
                      if (newRole === 'lider' || newRole === 'motorista_van') {
                        setMDailyRate(250);
                      } else if (newRole === 'militante') {
                        setMDailyRate(150);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none"
                  >
                    <option value="militante">Militante de Campo</option>
                    <option value="lider">Líder de Equipe</option>
                    <option value="coordenador">Coordenador de Região</option>
                    <option value="motorista_van">Motorista de Van</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Valor da Diária de Campo (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">R$</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    required
                    value={mDailyRate}
                    onChange={(e) => setMDailyRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-bold outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="150.00"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Este valor será automaticamente utilizado na Folha de Pagamento e Relatórios Semanais. (Meia diária = 50% deste valor).
                </p>
              </div>

              {/* LGPD Consent Banner */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Termo de consentimento LGPD aceito para rastreamento de rota de campo e envio de fotos comprobatórias.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMilitantModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR EXCLUSÃO DE MILITANTE */}
      {deletingMilitant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50 border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Excluir Militante?</h3>
                <p className="text-xs text-slate-500">Esta ação removerá o registro do sistema</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você tem certeza que deseja excluir o militante <strong>{deletingMilitant.name}</strong> ({deletingMilitant.matricula})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingMilitant(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMilitant}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Sim, Excluir Militante
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
