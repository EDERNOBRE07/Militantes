import React from 'react';
import { StreetCheckIn, Militant, Team } from '../types';
import { formatDateTimeBR } from '../utils/formatters';
import { getAllPhotosForCheckIn } from '../utils/neighborhoodHelpers';
import { Camera, CameraOff, Calendar, Image as ImageIcon, CheckCircle2, User, Users, Edit3 } from 'lucide-react';

export interface MilitantAuditGroup {
  militantId: string;
  militantName: string;
  matricula: string;
  avatar?: string;
  teamName: string;
  checkIns: StreetCheckIn[];
  totalAbordagens: number;
  totalComercio: number;
  totalSantinhos: number;
  totalMateriais: number;
}

export function groupCheckInsByMilitant(
  checkIns: StreetCheckIn[],
  militants: Militant[],
  teams?: Team[]
): MilitantAuditGroup[] {
  const map = new Map<string, MilitantAuditGroup>();

  checkIns.forEach(chk => {
    const mId = chk.militantId || 'militante-sem-id';
    if (!map.has(mId)) {
      const mObj = militants.find(
        m => m.id === mId || m.name.toLowerCase() === (chk.militantName || '').toLowerCase()
      );
      const tObj = teams?.find(t => t.id === (chk.teamId || mObj?.teamId));
      map.set(mId, {
        militantId: mId,
        militantName: chk.militantName || mObj?.name || 'Militante',
        matricula: mObj?.matricula || '',
        avatar: mObj?.avatar,
        teamName: tObj?.name || 'Equipe de Campo',
        checkIns: [],
        totalAbordagens: 0,
        totalComercio: 0,
        totalSantinhos: 0,
        totalMateriais: 0
      });
    }

    const grp = map.get(mId)!;
    grp.checkIns.push(chk);
    const m = chk.materialsDelivered || ({} as any);
    grp.totalAbordagens += (m.abordagens || 0);
    grp.totalComercio += (m.comercio || 0);
    grp.totalSantinhos += (m.santinhos || 0);
    grp.totalMateriais += (m.santinhos || 0) + (m.adesivo_bola || 0) + (m.adesivo_parachoque || 0) + (m.colinhas || 0);
  });

  return Array.from(map.values()).sort((a, b) => b.checkIns.length - a.checkIns.length);
}

interface MilitantAuditSectionProps {
  group: MilitantAuditGroup;
  bairroName: string;
  militantIndex: number;
  pinMap?: Record<string, number>;
  onZoomPhoto: (photo: string) => void;
  onEditStreet?: (chk: StreetCheckIn) => void;
}

export const MilitantAuditSection: React.FC<MilitantAuditSectionProps> = ({
  group,
  bairroName,
  militantIndex,
  pinMap,
  onZoomPhoto,
  onEditStreet
}) => {
  // Ordena os lançamentos deste militante estritamente por ordem cronológica de lançamento
  const sortedCheckIns = [...group.checkIns].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Coleta todas as fotos anexadas às ruas deste militante (ou quadro "Sem foto" quando não há foto anexada)
  const allPhotos: { photo: string; isSemFoto: boolean; streetName: string; timestamp: string; chkId: string }[] = [];
  sortedCheckIns.forEach(chk => {
    const photos = getAllPhotosForCheckIn(chk);
    if (photos.length > 0) {
      photos.forEach(p => {
        allPhotos.push({
          photo: p,
          isSemFoto: false,
          streetName: chk.streetName,
          timestamp: chk.timestamp,
          chkId: chk.id
        });
      });
    } else {
      allPhotos.push({
        photo: '',
        isSemFoto: true,
        streetName: chk.streetName,
        timestamp: chk.timestamp,
        chkId: chk.id
      });
    }
  });

  return (
    <div
      id={`militant-audit-section-${group.militantId}`}
      className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs space-y-0 transition-all"
    >
      {/* 1. CABEÇALHO DO MILITANTE */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            {group.avatar ? (
              <img
                src={group.avatar}
                alt={group.militantName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-400"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                <User className="w-5 h-5" />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] font-black">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-600/80 text-[10px] font-mono font-bold tracking-wide">
                Militante #{militantIndex + 1}
              </span>
              <h4 className="text-sm font-extrabold uppercase tracking-wide text-white">
                {group.militantName}
              </h4>
              {group.matricula && (
                <span className="text-[11px] text-slate-300 font-mono">
                  (Mat. {group.matricula})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Users className="w-3 h-3 text-slate-400" />
              {group.teamName} • Bairro: <strong className="text-slate-200">{bairroName}</strong>
            </p>
          </div>
        </div>

        {/* Resumo de Produtividade do Militante */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold text-slate-200">
            🛣️ <strong>{group.checkIns.length}</strong> ruas auditadas
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold text-purple-300">
            👥 <strong>{group.totalAbordagens}</strong> abordagens
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-900/80 border border-emerald-600/60 font-bold text-emerald-200 flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {allPhotos.filter(p => !p.isSemFoto).length} fotos anexadas
          </span>
        </div>
      </div>

      {/* 2. TABELA ÚNICA COM TODAS AS RUAS DESTE MILITANTE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Data</th>
              <th className="py-2.5 px-3">Logradouro / Trecho Percorrido</th>
              <th className="py-2.5 px-3 text-center">Abordagens</th>
              <th className="py-2.5 px-3 text-center">Comprovante</th>
              <th className="py-2.5 px-3 text-center">Status Auditoria</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {sortedCheckIns.map((chk) => {
              const chkPhotos = getAllPhotosForCheckIn(chk);
              return (
                <tr key={chk.id} className="hover:bg-slate-50/70 transition">
                  {/* 1. Data (Apenas Data, sem hora) */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {formatDateTimeBR(chk.timestamp).split(' ')[0]}
                  </td>

                  {/* 2. Logradouro / Trecho Percorrido */}
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-900">{chk.streetName}</span>
                      {chk.houseNumberRange && chk.houseNumberRange !== 'Trecho Geral' && (
                        <span className="text-[10px] text-slate-500 font-normal">
                          {chk.houseNumberRange}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 3. Abordagens */}
                  <td className="py-2.5 px-3 text-center font-bold text-purple-700 whitespace-nowrap font-mono">
                    {chk.materialsDelivered.abordagens || 0}
                  </td>

                  {/* 4. Comprovante */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {chkPhotos.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <Camera className="w-3 h-3 text-blue-600" />
                        {chkPhotos.length} foto{chkPhotos.length === 1 ? '' : 's'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                        <CameraOff className="w-3 h-3 text-slate-400" />
                        Sem foto
                      </span>
                    )}
                  </td>

                  {/* 5. Status Auditoria */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Validado
                      </span>
                      {onEditStreet && (
                        <button
                          type="button"
                          onClick={() => onEditStreet(chk)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 font-semibold text-[10px] border border-slate-200 transition cursor-pointer flex items-center gap-0.5"
                          title="Editar dados da rua"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          Editar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. GALERIA DE FOTOS CONSOLIDADA DO MILITANTE */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-bold text-xs">
              Galeria
            </span>
            <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              Galeria Fotográfica de Comprovação • {group.militantName} ({allPhotos.length} registros)
            </h5>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Grade de comprovação auditada
          </span>
        </div>

        {allPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-2.5">
            {allPhotos.map((item, pIdx) => (
              <div
                key={`militant-photo-${item.chkId}-${pIdx}`}
                onClick={() => !item.isSemFoto && onZoomPhoto(item.photo)}
                className={`group relative rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col ${
                  item.isSemFoto ? '' : 'cursor-pointer'
                }`}
              >
                {item.isSemFoto || !item.photo ? (
                  <div className="relative aspect-4/3 w-full bg-slate-100 flex flex-col items-center justify-center p-2 text-slate-400">
                    <CameraOff className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sem foto</span>
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[9px] font-mono font-bold">
                      #{pIdx + 1}
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.photo}
                      alt={item.streetName}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-mono font-bold">
                      #{pIdx + 1}
                    </div>
                  </div>
                )}
                <div className="p-1.5 bg-white space-y-0.5 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-800 truncate" title={item.streetName}>
                    {item.streetName}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5 text-slate-400" />
                    {formatDateTimeBR(item.timestamp).split(' ')[0]} • Validado
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-slate-100 text-center text-slate-500 text-xs italic">
            Nenhum registro para as ruas deste militante.
          </div>
        )}
      </div>
    </div>
  );
};
