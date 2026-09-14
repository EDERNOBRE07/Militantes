import React, { useState, useMemo } from 'react';
import { Neighborhood, StreetCheckIn, Militant, Team } from '../types';
import { formatDateTimeBR } from '../utils/formatters';
import { getAllPhotosForCheckIn } from '../utils/neighborhoodHelpers';
import {
  Camera,
  CheckCircle2,
  User,
  Users,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

interface UnifiedNeighborhoodAuditProps {
  bairro: Neighborhood;
  checkIns: StreetCheckIn[];
  militants: Militant[];
  teams: Team[];
  pinMap: Record<string, number>;
  onZoomPhoto: (photo: string) => void;
  onEditStreet?: (chk: StreetCheckIn) => void;
}

interface UnifiedNeighborhoodStreetTableProps {
  bairro: Neighborhood;
  checkIns: StreetCheckIn[];
  militants: Militant[];
  teams: Team[];
  pinMap: Record<string, number>;
  onZoomPhoto?: (photo: string) => void;
  onEditStreet?: (chk: StreetCheckIn) => void;
}

export const UnifiedNeighborhoodStreetTable: React.FC<UnifiedNeighborhoodStreetTableProps> = ({
  bairro,
  checkIns,
  militants,
  teams,
  pinMap,
  onZoomPhoto,
  onEditStreet
}) => {
  // Mapeamento enriquecido de check-ins com os dados do militante e ordenados por pin sequencial
  const enrichedCheckIns = useMemo(() => {
    return [...checkIns].map(chk => {
      const pinNum = (pinMap && (pinMap[chk.id] ?? pinMap[String(chk.id)])) || 1;
      const mObj = militants.find(
        m => m.id === chk.militantId || m.name.toLowerCase() === (chk.militantName || '').toLowerCase()
      );
      const tObj = teams.find(t => t.id === (chk.teamId || mObj?.teamId));
      const photos = getAllPhotosForCheckIn(chk);

      return {
        checkIn: chk,
        pinNum,
        militantName: chk.militantName || mObj?.name || 'Militante Não Identificado',
        matricula: mObj?.matricula || '',
        avatar: mObj?.avatar,
        teamName: tObj?.name || 'Equipe Geral',
        photos,
        timestamp: chk.timestamp,
        streetName: chk.streetName,
        houseNumberRange: chk.houseNumberRange,
        materials: chk.materialsDelivered || {
          santinhos: 0,
          adesivo_bola: 0,
          adesivo_parachoque: 0,
          colinhas: 0,
          abordagens: 0,
          comercio: 0
        },
        status: chk.status
      };
    }).sort((a, b) => a.pinNum - b.pinNum);
  }, [checkIns, militants, teams, pinMap]);

  // Estatísticas agregadas deste bairro
  const totalRuas = enrichedCheckIns.length;
  const totalAbordagens = enrichedCheckIns.reduce((acc, c) => acc + (c.materials.abordagens || 0), 0);
  const totalComercios = enrichedCheckIns.reduce((acc, c) => acc + (c.materials.comercio || 0), 0);
  const totalSantinhos = enrichedCheckIns.reduce((acc, c) => acc + (c.materials.santinhos || 0), 0);
  const totalPhotosCount = enrichedCheckIns.reduce((acc, c) => acc + c.photos.length, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs" id={`unified-street-table-${bairro.id}`}>
      {/* Cabeçalho da Tabela Única */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              Tabela Única de Ruas • Bairro {bairro.name}
            </h4>
            <p className="text-xs text-slate-500">
              Sequência unificada de lançamentos com identificação de militantes, numeração de pin e fotos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-bold text-slate-800">
            {totalRuas} ruas auditadas
          </span>
          <span className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 font-bold text-purple-800">
            👥 {totalAbordagens} abordagens
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 font-bold text-emerald-800">
            🏪 {totalComercios} comércios
          </span>
          <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 font-bold text-blue-800">
            📦 {totalSantinhos.toLocaleString('pt-BR')} santinhos
          </span>
        </div>
      </div>

      {/* Corpo da Tabela Única */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3 whitespace-nowrap">Data / Hora</th>
              <th className="py-2.5 px-3 min-w-[180px]">Logradouro / Trecho</th>
              <th className="py-2.5 px-3 min-w-[170px] bg-blue-50/60 text-blue-900 border-x border-blue-100">
                Militante Responsável
              </th>
              <th className="py-2.5 px-2 text-center whitespace-nowrap">Pin nº</th>
              <th className="py-2.5 px-2 text-center whitespace-nowrap">Abordagens</th>
              <th className="py-2.5 px-2 text-center whitespace-nowrap">Comércio</th>
              <th className="py-2.5 px-2 text-center whitespace-nowrap">Santinhos</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Comprovante</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
              {onEditStreet && (
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Ações</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {enrichedCheckIns.length === 0 ? (
              <tr>
                <td colSpan={onEditStreet ? 10 : 9} className="py-8 text-center text-slate-400 italic">
                  Nenhuma rua registrada para o bairro {bairro.name} no período.
                </td>
              </tr>
            ) : (
              enrichedCheckIns.map(item => (
                <tr
                  key={item.checkIn.id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  {/* Data / Hora */}
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                    {formatDateTimeBR(item.timestamp)}
                  </td>

                  {/* Logradouro / Trecho */}
                  <td className="py-2.5 px-3">
                    <strong className="text-slate-900 block text-xs">
                      {item.streetName}
                    </strong>
                    {item.houseNumberRange && item.houseNumberRange !== 'Trecho Geral' && (
                      <span className="text-[10px] text-slate-500 block">
                        Trecho: {item.houseNumberRange}
                      </span>
                    )}
                  </td>

                  {/* COLUNA MILITANTE */}
                  <td className="py-2.5 px-3 bg-blue-50/30 border-x border-blue-100">
                    <div className="flex items-center gap-2">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-blue-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {item.militantName.charAt(0)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <strong className="text-blue-900 block text-xs truncate">
                          {item.militantName}
                        </strong>
                        <span className="text-[10px] text-blue-700 block truncate">
                          {item.teamName} {item.matricula ? `• Mat. ${item.matricula}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Pin nº */}
                  <td className="py-2.5 px-2 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white shadow-2xs font-mono">
                      #{item.pinNum}
                    </span>
                  </td>

                  {/* Abordagens */}
                  <td className="py-2.5 px-2 text-center font-bold text-slate-800 font-mono">
                    {item.materials.abordagens || 0}
                  </td>

                  {/* Comércio */}
                  <td className="py-2.5 px-2 text-center font-bold text-slate-800 font-mono">
                    {item.materials.comercio || 0}
                  </td>

                  {/* Santinhos */}
                  <td className="py-2.5 px-2 text-center font-bold text-blue-700 font-mono">
                    {(item.materials.santinhos || 0).toLocaleString('pt-BR')}
                  </td>

                  {/* Comprovante */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {item.photos.length > 0 ? (
                      <button
                        onClick={() => onZoomPhoto && onZoomPhoto(item.photos[0])}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100 transition-colors"
                      >
                        <Camera className="w-3 h-3" />
                        <span>{item.photos.length} foto(s)</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Sem fotos</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Validado
                    </span>
                  </td>

                  {/* Ações */}
                  {onEditStreet && (
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <button
                        onClick={() => onEditStreet(item.checkIn)}
                        className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar dados da rua"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {enrichedCheckIns.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100/90 font-bold text-slate-800 border-t-2 border-slate-300 text-xs">
                <td colSpan={2} className="py-2.5 px-3">
                  Totais do Bairro {bairro.name} ({totalRuas} ruas registradas)
                </td>
                <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                  {new Set(enrichedCheckIns.map(c => c.militantName)).size} militantes atuando
                </td>
                <td className="py-2.5 px-2 text-center text-rose-700 font-mono">
                  #{enrichedCheckIns.length > 0 ? `${enrichedCheckIns[0].pinNum}-${enrichedCheckIns[enrichedCheckIns.length - 1].pinNum}` : '-'}
                </td>
                <td className="py-2.5 px-2 text-center font-mono">{totalAbordagens}</td>
                <td className="py-2.5 px-2 text-center font-mono">{totalComercios}</td>
                <td className="py-2.5 px-2 text-center text-blue-700 font-mono">{totalSantinhos.toLocaleString('pt-BR')}</td>
                <td className="py-2.5 px-3 text-center text-emerald-700 font-mono">{totalPhotosCount} fotos</td>
                <td colSpan={onEditStreet ? 2 : 1} className="py-2.5 px-3 text-center text-slate-500 text-[11px]">
                  100% Concluído
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

interface UnifiedNeighborhoodPhotoGalleryProps {
  bairro: Neighborhood;
  checkIns: StreetCheckIn[];
  militants: Militant[];
  teams: Team[];
  pinMap: Record<string, number>;
  onZoomPhoto: (photo: string) => void;
}

export const UnifiedNeighborhoodPhotoGallery: React.FC<UnifiedNeighborhoodPhotoGalleryProps> = ({
  bairro,
  checkIns,
  militants,
  teams,
  pinMap,
  onZoomPhoto
}) => {
  const [photosPerPage, setPhotosPerPage] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewAllPhotos, setViewAllPhotos] = useState<boolean>(false);

  // Mapeamento de todas as fotos com Pin nº e dados do militante
  const allNeighborhoodPhotos = useMemo(() => {
    const list: {
      photo: string;
      streetName: string;
      timestamp: string;
      chkId: string;
      pinNum: number;
      militantName: string;
      matricula: string;
    }[] = [];

    const sortedCheckIns = [...checkIns].sort((a, b) => {
      const pinA = (pinMap && (pinMap[a.id] ?? pinMap[String(a.id)])) || 1;
      const pinB = (pinMap && (pinMap[b.id] ?? pinMap[String(b.id)])) || 1;
      return pinA - pinB;
    });

    sortedCheckIns.forEach(chk => {
      const pinNum = (pinMap && (pinMap[chk.id] ?? pinMap[String(chk.id)])) || 1;
      const mObj = militants.find(
        m => m.id === chk.militantId || m.name.toLowerCase() === (chk.militantName || '').toLowerCase()
      );
      const mName = chk.militantName || mObj?.name || 'Militante';
      const matricula = mObj?.matricula || '';
      const pList = getAllPhotosForCheckIn(chk);

      pList.forEach(p => {
        list.push({
          photo: p,
          streetName: chk.streetName,
          timestamp: chk.timestamp,
          chkId: chk.id,
          pinNum,
          militantName: mName,
          matricula
        });
      });
    });

    return list;
  }, [checkIns, militants, teams, pinMap]);

  const totalPhotos = allNeighborhoodPhotos.length;
  const totalPages = Math.max(Math.ceil(totalPhotos / photosPerPage), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const displayedPhotos = useMemo(() => {
    if (viewAllPhotos) return allNeighborhoodPhotos;
    const startIndex = (safeCurrentPage - 1) * photosPerPage;
    return allNeighborhoodPhotos.slice(startIndex, startIndex + photosPerPage);
  }, [allNeighborhoodPhotos, viewAllPhotos, safeCurrentPage, photosPerPage]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4" id={`unified-gallery-${bairro.id}`}>
      {/* Barra de Título & Controles de Paginação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600" />
            Galeria de Fotos Única • Bairro {bairro.name}
          </h4>
          <p className="text-xs text-slate-500">
            Total de <strong>{totalPhotos} fotos comprovatórias</strong> anexadas aos lançamentos de ruas deste bairro (Mínimo 15 fotos por página)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Seletor de visualização */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => {
                setPhotosPerPage(15);
                setViewAllPhotos(false);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors ${
                photosPerPage === 15 && !viewAllPhotos
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              15 por página
            </button>
            <button
              onClick={() => {
                setPhotosPerPage(30);
                setViewAllPhotos(false);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors ${
                photosPerPage === 30 && !viewAllPhotos
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 por página
            </button>
            <button
              onClick={() => setViewAllPhotos(true)}
              className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors ${
                viewAllPhotos
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ver Todas ({totalPhotos})
            </button>
          </div>

          {/* Controles de navegação (se não estiver em ver todas) */}
          {!viewAllPhotos && totalPages > 1 && (
            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Página Anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-semibold text-slate-700 text-xs px-1">
                Página <strong>{safeCurrentPage}</strong> de <strong>{totalPages}</strong>
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Próxima Página"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grade de Fotos Única (Pelo menos 15 fotos por página) */}
      {totalPhotos === 0 ? (
        <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-400 italic">
          Nenhuma foto de comprovação anexada para as ruas deste bairro no período.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {displayedPhotos.map((item, idx) => {
            const globalIndex = viewAllPhotos
              ? idx + 1
              : (safeCurrentPage - 1) * photosPerPage + idx + 1;

            return (
              <div
                key={`${item.chkId}-${idx}`}
                className="group relative rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                {/* Container da Imagem com Aspect Ratio 4:3 */}
                <div
                  onClick={() => onZoomPhoto(item.photo)}
                  className="relative w-full aspect-4/3 bg-slate-900 cursor-pointer overflow-hidden"
                >
                  <img
                    src={item.photo}
                    alt={item.streetName}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badge do Pin nº (Vínculo direto com o mapa e com a tabela única) */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[11px] shadow-sm flex items-center gap-1 font-mono">
                      <MapPin className="w-3 h-3" />
                      Pin #{item.pinNum}
                    </span>
                  </div>

                  {/* Contador Sequencial da Foto */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
                      #{globalIndex}
                    </span>
                  </div>

                  {/* Overlay de Hover para Zoom */}
                  <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-2.5 py-1 rounded-lg bg-white/90 text-blue-900 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Eye className="w-3.5 h-3.5" />
                      Ampliar Foto
                    </span>
                  </div>
                </div>

                {/* Informações detalhadas da foto */}
                <div className="p-2.5 bg-white space-y-1">
                  {/* Logradouro */}
                  <strong className="text-xs font-bold text-slate-900 block truncate" title={item.streetName}>
                    {item.streetName}
                  </strong>

                  {/* Militante Responsável */}
                  <div className="flex items-center gap-1 text-[11px] text-blue-800 font-semibold truncate" title={item.militantName}>
                    <User className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="truncate">{item.militantName}</span>
                  </div>

                  {/* Data / Hora & Validação */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDateTimeBR(item.timestamp).split(' ')[1] || formatDateTimeBR(item.timestamp)}
                    </span>
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      OK
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rodapé da Galeria com Navegação */}
      {!viewAllPhotos && totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Exibindo fotos <strong>{(safeCurrentPage - 1) * photosPerPage + 1}</strong> a <strong>{Math.min(safeCurrentPage * photosPerPage, totalPhotos)}</strong> de <strong>{totalPhotos}</strong> fotos no bairro {bairro.name}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                  safeCurrentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const UnifiedNeighborhoodAudit: React.FC<UnifiedNeighborhoodAuditProps> = ({
  bairro,
  checkIns,
  militants,
  teams,
  pinMap,
  onZoomPhoto,
  onEditStreet
}) => {
  return (
    <div className="space-y-6 pt-3" id={`unified-audit-${bairro.id}`}>
      <UnifiedNeighborhoodStreetTable
        bairro={bairro}
        checkIns={checkIns}
        militants={militants}
        teams={teams}
        pinMap={pinMap}
        onZoomPhoto={onZoomPhoto}
        onEditStreet={onEditStreet}
      />
      <UnifiedNeighborhoodPhotoGallery
        bairro={bairro}
        checkIns={checkIns}
        militants={militants}
        teams={teams}
        pinMap={pinMap}
        onZoomPhoto={onZoomPhoto}
      />
    </div>
  );
};
