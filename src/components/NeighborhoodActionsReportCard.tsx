import React from 'react';
import { Neighborhood, BairroAction } from '../types';
import {
  Sparkles,
  MapPin,
  Camera,
  Users,
  User as UserIcon,
  Flag,
  Calendar,
  Clock,
  Compass,
  ExternalLink,
  Store,
  GraduationCap,
  ShoppingBag,
  Navigation,
  Eye,
  Plus,
  Layers,
  ChevronRight
} from 'lucide-react';

interface NeighborhoodActionsReportCardProps {
  bairro: Neighborhood;
  actions: BairroAction[];
  onZoomPhoto: (url: string) => void;
  onNewAction?: (bairroId: string) => void;
  compact?: boolean;
}

export const NeighborhoodActionsReportCard: React.FC<NeighborhoodActionsReportCardProps> = ({
  bairro,
  actions,
  onZoomPhoto,
  onNewAction,
  compact = false
}) => {
  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'praca': return <Sparkles className="w-3.5 h-3.5 text-emerald-600" />;
      case 'escola': return <GraduationCap className="w-3.5 h-3.5 text-blue-600" />;
      case 'supermercado':
      case 'mercado': return <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />;
      case 'feira': return <Store className="w-3.5 h-3.5 text-orange-600" />;
      case 'calcadao': return <Navigation className="w-3.5 h-3.5 text-purple-600" />;
      default: return <MapPin className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'distribuicao_materiais': return 'Distribuição de Materiais';
      case 'abordagens': return 'Abordagens em Pessoas';
      case 'caminhada': return 'Caminhada';
      case 'bandeiraco': return 'Bandeiraço';
      case 'comicio': return 'Comício';
      case 'carreata': return 'Carreata';
      case 'panfletagem': return 'Panfletagem';
      case 'corpo_a_corpo': return 'Corpo a Corpo';
      default: return 'Ação de Campo';
    }
  };

  const totalPhotos = actions.reduce((acc, a) => {
    const valid = (a.photos || []).filter(p => typeof p === 'string' && p.trim() !== '' && p !== '[vault_photo]' && !p.includes('unsplash.com') && !p.includes('placeholder'));
    return acc + valid.length;
  }, 0);
  const totalPeople = actions.reduce((acc, a) => acc + (a.estimatedPeople || 0), 0);
  const totalAbordagensAcoes = actions.reduce((acc, a) => {
    if (a.totalApproaches) return acc + a.totalApproaches;
    if (a.militantParticipations && a.militantParticipations.length > 0) {
      return acc + a.militantParticipations.reduce((s, p) => s + (p.approachesCount || 0), 0);
    }
    return acc + (a.materialsDistributed?.abordagens || 0);
  }, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs space-y-0">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                Ações no Bairro • {bairro.name}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {actions.length} {actions.length === 1 ? 'Ação' : 'Ações'} Realizada{actions.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Eventos específicos em praças, escolas, comércios, feiras e pontos estratégicos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-slate-300 pr-1 flex-wrap">
              {totalAbordagensAcoes > 0 && (
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-400/30">
                  🗣️ {totalAbordagensAcoes} abordagens
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-white/10 text-emerald-300 font-bold border border-white/10">
                📷 {totalPhotos} fotos
              </span>
              {totalPeople > 0 && (
                <span className="px-2 py-0.5 rounded bg-white/10 text-blue-300 font-bold border border-white/10">
                  👥 ~{totalPeople} pessoas
                </span>
              )}
            </div>
          )}

          {onNewAction && (
            <button
              type="button"
              onClick={() => onNewAction(bairro.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shrink-0 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Ação</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {actions.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
            <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">
              Nenhuma ação específica registrada ainda no bairro {bairro.name}.
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Ações em praças, escolas, bandeiraços, supermercados e caminhadas podem ser adicionadas pelo App de Campo.
            </p>
            {onNewAction && (
              <button
                type="button"
                onClick={() => onNewAction(bairro.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition mt-1"
              >
                <Plus className="w-3 h-3" />
                <span>Registrar Primeira Ação em {bairro.name}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((act, idx) => (
              <div
                key={act.id || idx}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col justify-between space-y-3 hover:bg-white transition shadow-2xs"
              >
                <div>
                  {/* Scope & Type Badges */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {getActionTypeLabel(act.actionType)}
                    </span>

                    {act.scope === 'individual' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <UserIcon className="w-3 h-3 text-purple-600" />
                        Individual ({act.militantName || 'Militante'})
                      </span>
                    )}
                    {act.scope === 'grupo' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Users className="w-3 h-3 text-amber-600" />
                        Grupo ({act.militantNames?.length || 'Vários'} militantes)
                      </span>
                    )}
                    {act.scope === 'toda_equipe' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Flag className="w-3 h-3 text-emerald-600" />
                        {act.teamName || 'Toda a Equipe'}
                      </span>
                    )}
                  </div>

                  {/* Title & Place */}
                  <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                    {act.title || act.locationName}
                  </h5>

                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-700 font-medium">
                    {getLocationTypeIcon(act.locationType)}
                    <span>{act.locationName}</span>
                  </div>

                  {/* Date, GPS, People */}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {act.timestamp}
                    </span>

                    {act.hasGps && act.latitude && act.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${act.latitude},${act.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline font-mono"
                      >
                        <Compass className="w-3 h-3" />
                        {act.latitude.toFixed(4)}, {act.longitude.toFixed(4)}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-slate-400">Sem GPS pontual</span>
                    )}

                    {act.estimatedPeople && (
                      <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                        👥 ~{act.estimatedPeople} pessoas
                      </span>
                    )}
                  </div>

                  {/* Militantes Participantes e Abordagens Individuais */}
                  {act.militantParticipations && act.militantParticipations.length > 0 ? (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="flex items-center gap-1.5 text-blue-800">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          Militantes Participantes ({act.militantParticipations.length}):
                        </span>
                        <span className="text-purple-700 font-mono font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Total: {act.totalApproaches || act.militantParticipations.reduce((sum, p) => sum + (p.approachesCount || 0), 0)} abordagens
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {act.militantParticipations.map(p => (
                          <div
                            key={p.militantId}
                            className="flex items-center justify-between px-2 py-1 bg-slate-50 rounded border border-slate-200 text-[11px]"
                          >
                            <span className="text-slate-800 font-medium truncate mr-1.5">{p.militantName}</span>
                            <span className="px-1.5 py-0.5 rounded bg-purple-100/70 text-purple-800 font-bold font-mono text-[10px] shrink-0">
                              {p.approachesCount} {p.approachesCount === 1 ? 'abordagem' : 'abordagens'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    act.scope === 'individual' && act.militantName ? (
                      <div className="mt-2 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                        <span>Militante responsável: <strong>{act.militantName}</strong></span>
                        {act.materialsDistributed?.abordagens ? (
                          <span className="font-mono text-purple-700 font-bold">{act.materialsDistributed.abordagens} abordagens</span>
                        ) : null}
                      </div>
                    ) : act.scope === 'grupo' && act.militantNames && act.militantNames.length > 0 ? (
                      <div className="mt-2 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-semibold text-slate-700 block">Militantes no grupo ({act.militantNames.length}):</span>
                        <div className="flex flex-wrap gap-1">
                          {act.militantNames.map((name, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}

                  {act.observations && (
                    <p className="mt-2 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 italic">
                      "{act.observations}"
                    </p>
                  )}
                </div>

                {/* Photo Gallery for this action */}
                <div className="pt-2 border-t border-slate-200/80">
                  {(() => {
                    const validPhotos = (act.photos || []).filter(p => typeof p === 'string' && p.trim() !== '' && p !== '[vault_photo]' && !p.includes('unsplash.com') && !p.includes('placeholder'));
                    return (
                      <>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                            <Camera className="w-3 h-3 text-blue-600" />
                            Galeria de Fotos da Ação ({validPhotos.length})
                          </span>
                          {validPhotos.length > 0 && (
                            <span className="text-[10px] text-slate-400">Clique para ampliar</span>
                          )}
                        </div>

                        {validPhotos.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                            {validPhotos.map((photo, pIdx) => (
                              <div
                                key={pIdx}
                                onClick={() => onZoomPhoto(photo)}
                                className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group shadow-2xs hover:shadow-md transition"
                              >
                                <img
                                  src={photo}
                                  alt={`Foto ${pIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-3.5 h-3.5 text-white drop-shadow" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic block">
                            Sem fotos registradas nesta ação.
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
