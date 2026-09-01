import React, { useState } from 'react';
import {
  Militant,
  StreetCheckIn,
  MaterialCount
} from '../types';
import {
  MapPin,
  MessageSquare,
  Store,
  FileText,
  Disc,
  Layers,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Navigation,
  Clock,
  ExternalLink,
  Target,
  Sparkles,
  TrendingUp,
  Award,
  Phone,
  CheckCircle2,
  Trash2,
  Edit3
} from 'lucide-react';

interface MilitantSummaryCardProps {
  militant: Militant;
  checkIns: StreetCheckIn[];
  onQuickCheckIn?: (militantId: string) => void;
  onSelectPhotoZoom?: (photoUrl: string) => void;
  isCurrentMilitant?: boolean;
  onSaveMaterialAdjustment?: (militantId: string, materials: MaterialCount) => void;
  onDeleteCheckIn?: (checkInId: string, streetName: string) => void;
  onEditCheckIn?: (checkIn: StreetCheckIn) => void;
}

export const MilitantSummaryCard: React.FC<MilitantSummaryCardProps> = ({
  militant,
  checkIns,
  onQuickCheckIn,
  onSelectPhotoZoom,
  isCurrentMilitant = false,
  onSaveMaterialAdjustment,
  onDeleteCheckIn,
  onEditCheckIn
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showQuickAdjuster, setShowQuickAdjuster] = useState<boolean>(false);

  // Calculate totals from check-ins + baseline
  const streetsCoveredToday = Math.max(checkIns.length, militant.totalStreetsCovered || 0);
  
  const totalAbordagens = checkIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0) 
    || (militant.deliveredMaterials.abordagens || 0);

  const totalComercios = checkIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0)
    || (militant.deliveredMaterials.comercio || 0);

  const totalSantinhos = checkIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos || 0), 0)
    || (militant.deliveredMaterials.santinhos || 0);

  const totalColinhas = checkIns.reduce((acc, c) => acc + (c.materialsDelivered.colinhas || 0), 0)
    || (militant.deliveredMaterials.colinhas || 0);

  const totalAdesivoBola = checkIns.reduce((acc, c) => acc + (c.materialsDelivered.adesivo_bola || 0), 0)
    || (militant.deliveredMaterials.adesivo_bola || 0);

  const totalAdesivoParachoque = checkIns.reduce((acc, c) => acc + (c.materialsDelivered.adesivo_parachoque || 0), 0)
    || (militant.deliveredMaterials.adesivo_parachoque || 0);

  const totalMateriaisGraficos = totalSantinhos + totalColinhas + totalAdesivoBola + totalAdesivoParachoque;

  // Daily target goals (default: 6 ruas, 60 abordagens, 15 comércios, 600 santinhos)
  const metaRuas = 6;
  const metaAbordagens = 60;
  const pctRuas = Math.min(100, Math.round((streetsCoveredToday / metaRuas) * 100));
  const pctAbordagens = Math.min(100, Math.round((totalAbordagens / metaAbordagens) * 100));

  // Local state for interactive increment/decrement quick adjuster
  const [currentAdjustedMaterials, setCurrentAdjustedMaterials] = useState<MaterialCount>({
    santinhos: totalSantinhos,
    colinhas: totalColinhas,
    adesivos: totalAdesivoBola + totalAdesivoParachoque,
    adesivo_bola: totalAdesivoBola,
    adesivo_parachoque: totalAdesivoParachoque,
    abordagens: totalAbordagens,
    comercio: totalComercios
  });

  // Sync state when props change
  React.useEffect(() => {
    setCurrentAdjustedMaterials({
      santinhos: totalSantinhos,
      colinhas: totalColinhas,
      adesivos: totalAdesivoBola + totalAdesivoParachoque,
      adesivo_bola: totalAdesivoBola,
      adesivo_parachoque: totalAdesivoParachoque,
      abordagens: totalAbordagens,
      comercio: totalComercios
    });
  }, [totalSantinhos, totalColinhas, totalAdesivoBola, totalAdesivoParachoque, totalAbordagens, totalComercios]);

  const handleIncrement = (key: keyof MaterialCount, delta: number) => {
    setCurrentAdjustedMaterials(prev => {
      const updated = {
        ...prev,
        [key]: Math.max(0, (prev[key] || 0) + delta)
      };
      if (onSaveMaterialAdjustment) {
        onSaveMaterialAdjustment(militant.id, updated);
      }
      return updated;
    });
  };

  const getTeamLabel = (teamId: string) => {
    switch (teamId) {
      case 'team-alpha':
        return 'Equipe Alpha (Kobrasol / Campinas)';
      case 'team-bravo':
        return 'Equipe Bravo (Barreiros)';
      case 'team-charlie':
        return 'Equipe Charlie (Forquilhinhas)';
      case 'team-delta':
        return 'Equipe Delta (Praia Comprida)';
      default:
        return 'Equipe de Campo São José';
    }
  };

  return (
    <div
      id={`militant-card-${militant.id}`}
      className={`rounded-2xl bg-white border transition-all duration-200 shadow-2xs hover:shadow-xs overflow-hidden ${
        isCurrentMilitant ? 'border-blue-300 ring-2 ring-blue-500/15' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* CARD MAIN SECTION */}
      <div className="p-4 sm:p-5 space-y-4">
        
        {/* Row 1: Header with Avatar, Militant Info & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src={militant.avatar}
                alt={militant.name}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  militant.status === 'em_campo'
                    ? 'bg-emerald-500'
                    : militant.status === 'ativo'
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                }`}
                title={`Status: ${militant.status}`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-slate-900 leading-tight">
                  {militant.name}
                </h4>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold font-mono border border-blue-200/60">
                  {militant.matricula}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    militant.status === 'em_campo'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : militant.status === 'ativo'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {militant.status === 'em_campo'
                    ? 'Em Campo'
                    : militant.status === 'ativo'
                    ? 'Ativo'
                    : 'Em Pausa'}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                <span className="font-medium text-slate-700">{getTeamLabel(militant.teamId)}</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">
                  Diária: R$ {militant.dailyRate || 150},00
                </span>
                {militant.phone && (
                  <>
                    <span>•</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {militant.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions at Top Right */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {onQuickCheckIn && (
              <button
                type="button"
                onClick={() => onQuickCheckIn(militant.id)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Registrar nova rua percorrida para este militante"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Rua</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowQuickAdjuster(!showQuickAdjuster)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                showQuickAdjuster
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200'
              }`}
              title="Ajustar e incrementar contadores de materiais e abordagens"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contadores +/-</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title={isExpanded ? 'Recolher detalhes de ruas' : 'Ver histórico de ruas'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Row 2: CONTADOR DE RUAS HOJE & RESUMO VISUAL DE ATIVIDADES */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          
          {/* HIGHLIGHT: CONTADOR DE RUAS PERCORRIDAS HOJE (md:col-span-4) */}
          <div className="md:col-span-4 p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
              <Navigation className="w-20 h-20 text-white" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-200" />
                  Ruas Percorridas Hoje
                </span>
                <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-md text-white">
                  Meta: {metaRuas} ruas
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {streetsCoveredToday}
                </span>
                <span className="text-xs text-blue-100 font-medium">
                  {streetsCoveredToday === 1 ? 'rua registrada' : 'ruas registradas'}
                </span>
              </div>
            </div>

            {/* Progress Bar towards daily street goal */}
            <div className="mt-3 pt-2 border-t border-white/20">
              <div className="flex items-center justify-between text-[10px] text-blue-100 font-semibold mb-1">
                <span>Progresso Diário</span>
                <span>{pctRuas}% da Meta</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    pctRuas >= 100 ? 'bg-emerald-300' : 'bg-white'
                  }`}
                  style={{ width: `${pctRuas}%` }}
                />
              </div>
            </div>
          </div>

          {/* RESUMO VISUAL DAS ATIVIDADES: ABORDAGENS, COMÉRCIO E MATERIAIS (md:col-span-8) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            
            {/* 1. Abordagens a Eleitores */}
            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-purple-900 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  Abordagens
                </span>
                <span className="text-[10px] font-semibold text-purple-700">{pctAbordagens}%</span>
              </div>
              <div className="my-1">
                <span className="text-2xl font-bold text-purple-950 block leading-tight">
                  {totalAbordagens}
                </span>
                <span className="text-[10px] text-purple-700">Eleitores dialogados</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${pctAbordagens}%` }}
                />
              </div>
            </div>

            {/* 2. Comércios & Lojas Atendidos */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-emerald-900 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  Comércios
                </span>
                <span className="text-[10px] font-semibold text-emerald-700">Locais</span>
              </div>
              <div className="my-1">
                <span className="text-2xl font-bold text-emerald-950 block leading-tight">
                  {totalComercios}
                </span>
                <span className="text-[10px] text-emerald-700">Lojas & balcões</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((totalComercios / 15) * 100))}%` }}
                />
              </div>
            </div>

            {/* 3. Total Geral de Materiais */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-700 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Total Gráfico
                </span>
                <span className="text-[10px] font-bold text-blue-700 font-mono">
                  {totalMateriaisGraficos.toLocaleString('pt-BR')}
                </span>
              </div>

              {/* Segmented mini bar of material distribution */}
              <div className="space-y-1 my-1">
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 font-medium">
                  <span className="truncate">📄 {totalSantinhos} Sant.</span>
                  <span className="truncate">📋 {totalColinhas} Col.</span>
                  <span className="truncate">🟣 {totalAdesivoBola} Bola</span>
                  <span className="truncate">🚗 {totalAdesivoParachoque} Parach.</span>
                </div>
              </div>

              {/* Multi-color distribution bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full flex overflow-hidden">
                <div
                  className="bg-blue-600 h-full"
                  style={{ width: `${totalMateriaisGraficos ? (totalSantinhos / totalMateriaisGraficos) * 100 : 50}%` }}
                  title={`Santinhos: ${totalSantinhos}`}
                />
                <div
                  className="bg-indigo-600 h-full"
                  style={{ width: `${totalMateriaisGraficos ? (totalColinhas / totalMateriaisGraficos) * 100 : 25}%` }}
                  title={`Colinhas: ${totalColinhas}`}
                />
                <div
                  className="bg-purple-600 h-full"
                  style={{ width: `${totalMateriaisGraficos ? (totalAdesivoBola / totalMateriaisGraficos) * 100 : 15}%` }}
                  title={`Adesivo Bola: ${totalAdesivoBola}`}
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${totalMateriaisGraficos ? (totalAdesivoParachoque / totalMateriaisGraficos) * 100 : 10}%` }}
                  title={`Adesivo Parachoque: ${totalAdesivoParachoque}`}
                />
              </div>
            </div>

          </div>

        </div>

        {/* Row 3: QUICK MATERIAL INCREMENT / DECREMENT CONTROLLERS (TOGGLED OR INLINE) */}
        {showQuickAdjuster && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-purple-200/90 space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Contadores Rápidos de Materiais & Atividades
                </span>
              </div>
              <span className="text-[11px] text-purple-700 font-semibold">
                Incrementar / Decrementar (+ / -)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              
              {/* Abordagens */}
              <div className="p-2.5 rounded-xl bg-white border border-purple-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    Abordagens
                  </span>
                  <span className="text-[10px] text-slate-500">Eleitores</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleIncrement('abordagens', -5)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                    title="Diminuir 5 abordagens"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-purple-900">
                    {currentAdjustedMaterials.abordagens || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleIncrement('abordagens', 5)}
                    className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center font-bold cursor-pointer shadow-xs"
                    title="Aumentar 5 abordagens"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Comércio */}
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    Comércios
                  </span>
                  <span className="text-[10px] text-slate-500">Lojas visitadas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleIncrement('comercio', -1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                    title="Diminuir 1 comércio"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-emerald-900">
                    {currentAdjustedMaterials.comercio || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleIncrement('comercio', 1)}
                    className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-bold cursor-pointer shadow-xs"
                    title="Aumentar 1 comércio"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Santinhos */}
              <div className="p-2.5 rounded-xl bg-white border border-blue-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Santinhos
                  </span>
                  <span className="text-[10px] text-slate-500">Folhetos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleIncrement('santinhos', -50)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                    title="Diminuir 50 santinhos"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-12 text-center font-bold text-xs text-blue-900">
                    {currentAdjustedMaterials.santinhos || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleIncrement('santinhos', 50)}
                    className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold cursor-pointer shadow-xs"
                    title="Aumentar 50 santinhos"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Colinhas */}
              <div className="p-2.5 rounded-xl bg-white border border-indigo-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                    Colinhas
                  </span>
                  <span className="text-[10px] text-slate-500">Dia da votação</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleIncrement('colinhas', -20)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                    title="Diminuir 20 colinhas"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-indigo-900">
                    {currentAdjustedMaterials.colinhas || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleIncrement('colinhas', 20)}
                    className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center font-bold cursor-pointer shadow-xs"
                    title="Aumentar 20 colinhas"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Adesivo Bola */}
              <div className="p-2.5 rounded-xl bg-white border border-purple-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-1">
                    <Disc className="w-3.5 h-3.5 text-purple-600" />
                    Adesivo Bola
                  </span>
                  <span className="text-[10px] text-slate-500">Vidro de veículos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleIncrement('adesivo_bola', -5)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                    title="Diminuir 5 adesivos bola"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-purple-900">
                    {currentAdjustedMaterials.adesivo_bola || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleIncrement('adesivo_bola', 5)}
                    className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center font-bold cursor-pointer shadow-xs"
                    title="Aumentar 5 adesivos bola"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Adesivo Parachoque */}
              <div className="p-2.5 rounded-xl bg-white border border-amber-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    Adesivo Parachoque
                  </span>
                  <span className="text-[10px] text-slate-500">Faixa automotiva</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleIncrement('adesivo_parachoque', -5)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                    title="Diminuir 5 adesivos parachoque"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-amber-900">
                    {currentAdjustedMaterials.adesivo_parachoque || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleIncrement('adesivo_parachoque', 5)}
                    className="w-7 h-7 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold cursor-pointer shadow-xs"
                    title="Aumentar 5 adesivos parachoque"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* EXPANDABLE SECTION: HISTÓRICO DETALHADO DE RUAS REGISTRADAS */}
      {isExpanded && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-600" />
              Ruas Registradas Hoje por {militant.name} ({checkIns.length})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Matrícula: {militant.matricula}
            </span>
          </div>

          {checkIns.length === 0 ? (
            <div className="p-5 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-400 space-y-1">
              <p>Nenhuma rua individual registrada para este militante hoje.</p>
              {onQuickCheckIn && (
                <button
                  type="button"
                  onClick={() => onQuickCheckIn(militant.id)}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Registrar Primeira Rua
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {checkIns.map(chk => (
                <div
                  key={chk.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900">{chk.streetName}</h5>
                      <p className="text-[11px] text-slate-500">
                        Bairro: <strong className="text-slate-800">{chk.neighborhoodName}</strong>
                        {chk.houseNumberRange && ` • ${chk.houseNumberRange}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mr-1">
                        <Clock className="w-3 h-3" />
                        {chk.timestamp.substring(11, 16) || 'Hoje'}
                      </span>
                      {onEditCheckIn && (
                        <button
                          type="button"
                          onClick={() => onEditCheckIn(chk)}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title={`Editar rua ${chk.streetName} (incluir fotos, GPS ou notas)`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteCheckIn && (
                        <button
                          type="button"
                          onClick={() => onDeleteCheckIn(chk.id, chk.streetName)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title={`Apagar registro da rua ${chk.streetName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-600 flex-wrap">
                    <span>Abordagens: <strong className="text-purple-700">{chk.materialsDelivered.abordagens || 0}</strong></span>
                    <span>•</span>
                    <span>Comércio: <strong className="text-emerald-700">{chk.materialsDelivered.comercio || 0}</strong></span>
                    <span>•</span>
                    <span>Santinhos: <strong className="text-blue-700">{chk.materialsDelivered.santinhos}</strong></span>
                  </div>

                  {chk.observations && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                      "{chk.observations}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                    <a
                      href={`https://www.google.com/maps?q=${Number(chk.latitude || 0)},${Number(chk.longitude || 0)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline bg-blue-50/60 px-2 py-0.5 rounded-md border border-blue-100"
                      title="Abrir localização exata no Google Maps"
                    >
                      <MapPin className="w-3 h-3 text-rose-600" />
                      GPS: {Number(chk.latitude || 0).toFixed(5)}, {Number(chk.longitude || 0).toFixed(5)}
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-blue-500" />
                    </a>

                    {chk.photos && chk.photos.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                          📷 {chk.photos.length}
                        </span>
                        {chk.photos.map((ph, pIdx) => (
                          <img
                            key={pIdx}
                            src={ph}
                            alt={`Foto comprovação ${pIdx + 1}`}
                            onClick={() => onSelectPhotoZoom && onSelectPhotoZoom(ph)}
                            className="w-7 h-7 rounded-lg object-cover cursor-pointer ring-1 ring-slate-300 hover:ring-2 hover:ring-blue-500 hover:scale-110 transition shadow-2xs"
                            title="Clique para ampliar foto de campo"
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sem fotos</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
