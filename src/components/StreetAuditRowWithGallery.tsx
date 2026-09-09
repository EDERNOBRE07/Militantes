import React from 'react';
import { StreetCheckIn, Militant } from '../types';
import { formatDateTimeBR } from '../utils/formatters';
import { getAllPhotosForCheckIn } from '../utils/neighborhoodHelpers';
import { MapPin, Camera, Image as ImageIcon, ExternalLink, CheckCircle2 } from 'lucide-react';

interface StreetAuditRowWithGalleryProps {
  chk: StreetCheckIn;
  militants: Militant[];
  bairroNumber: number; // ex: 3, 4, 5...
  streetIndex: number;  // 0, 1, 2...
  onZoomPhoto: (photo: string) => void;
  onEditStreet?: (chk: StreetCheckIn) => void;
}

export const StreetAuditRowWithGallery: React.FC<StreetAuditRowWithGalleryProps> = ({
  chk,
  militants,
  bairroNumber,
  streetIndex,
  onZoomPhoto,
  onEditStreet
}) => {
  // Letras das etapas: ex 0 -> 'a' e 'b', 1 -> 'c' e 'd', 2 -> 'e' e 'f'
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const sIdx = streetIndex * 2;
  const gIdx = streetIndex * 2 + 1;

  const streetLetter = sIdx < alphabet.length ? alphabet[sIdx] : `.${sIdx + 1}`;
  const galleryLetter = gIdx < alphabet.length ? alphabet[gIdx] : `.${gIdx + 1}`;

  const streetTag = `${bairroNumber}${streetLetter}`;
  const galleryTag = `${bairroNumber}${galleryLetter}`;

  const militant = militants.find(m => m.id === chk.militantId);
  const allPhotos = getAllPhotosForCheckIn(chk);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs space-y-0 transition-all">
      
      {/* 3a / 4a / etc: Top Header Indicator */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-mono font-bold text-xs shadow-2xs">
            {streetTag}
          </span>
          <span className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            Logradouro Auditado: <strong className="text-blue-900 font-extrabold">{chk.streetName}</strong>
            {chk.houseNumberRange && chk.houseNumberRange !== 'Trecho Geral' && (
              <span className="text-[10px] font-normal text-slate-500">({chk.houseNumberRange})</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-mono">
            {formatDateTimeBR(chk.timestamp)}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Validado
          </span>
        </div>
      </div>

      {/* 3a / 4a: Tabela de Dados da Rua (9 colunas exatas solicitadas) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Data / Hora</th>
              <th className="py-2.5 px-3">Logradouro / Trecho Percorrido</th>
              <th className="py-2.5 px-3">Militante Responsável</th>
              <th className="py-2.5 px-3">GPS (Latitude, Longitude)</th>
              <th className="py-2.5 px-3 text-center">Abordagens</th>
              <th className="py-2.5 px-3 text-center">Comércio</th>
              <th className="py-2.5 px-3 text-center">Santinhos</th>
              <th className="py-2.5 px-3 text-center">Comprovante</th>
              <th className="py-2.5 px-3 text-center">Status Auditoria</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            <tr className="hover:bg-slate-50/50 transition">
              {/* 1. Data / Hora */}
              <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                {formatDateTimeBR(chk.timestamp)}
              </td>

              {/* 2. Logradouro / Trecho Percorrido */}
              <td className="py-3 px-3 font-bold text-slate-900 max-w-[220px]">
                <div className="flex flex-col">
                  <span>{chk.streetName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {chk.houseNumberRange || 'Trecho Geral'}
                  </span>
                </div>
              </td>

              {/* 3. Militante Responsável */}
              <td className="py-3 px-3">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <img
                    src={militant?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={chk.militantName}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <strong className="font-bold text-slate-900 block leading-tight">{chk.militantName}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">{militant?.matricula || 'Militante'}</span>
                  </div>
                </div>
              </td>

              {/* 4. GPS (Latitude, Longitude) */}
              <td className="py-3 px-3 whitespace-nowrap">
                <div className="flex flex-col space-y-0.5">
                  <a
                    href={`https://www.google.com/maps?q=${chk.latitude},${chk.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-mono text-[10px] border border-slate-200 transition"
                    title="Visualizar coordenadas no Google Maps"
                  >
                    <MapPin className="w-3 h-3 text-red-600" />
                    {chk.latitude.toFixed(4)}, {chk.longitude.toFixed(4)}
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                  </a>
                  <span className="text-[9px] text-slate-400 font-mono">Precisão: {chk.accuracyMeters || 3.5}m</span>
                </div>
              </td>

              {/* 5. Abordagens */}
              <td className="py-3 px-3 text-center font-bold text-purple-700 whitespace-nowrap font-mono">
                {chk.materialsDelivered.abordagens || 0}
              </td>

              {/* 6. Comércio */}
              <td className="py-3 px-3 text-center font-bold text-emerald-700 whitespace-nowrap font-mono">
                {chk.materialsDelivered.comercio || 0}
              </td>

              {/* 7. Santinhos */}
              <td className="py-3 px-3 text-center font-bold text-blue-700 whitespace-nowrap font-mono">
                {chk.materialsDelivered.santinhos.toLocaleString('pt-BR')}
              </td>

              {/* 8. Comprovante */}
              <td className="py-3 px-3 text-center whitespace-nowrap">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  <Camera className="w-3 h-3 text-blue-600" />
                  {allPhotos.length} foto{allPhotos.length === 1 ? '' : 's'} anexada{allPhotos.length === 1 ? '' : 's'}
                </span>
              </td>

              {/* 9. Status Auditoria */}
              <td className="py-3 px-3 text-center whitespace-nowrap">
                <div className="inline-flex items-center gap-1.5 justify-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Validado
                  </span>
                  {onEditStreet && (
                    <button
                      type="button"
                      onClick={() => onEditStreet(chk)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 font-semibold text-[10px] border border-slate-200 transition cursor-pointer"
                      title="Editar registro da rua"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3b / 4b: Galeria de Fotos dessa Rua (Todas as fotos anexadas desta rua) */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-bold text-xs shadow-2xs">
              {galleryTag}
            </span>
            <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              Galeria de Fotos desta Rua • <span className="text-emerald-800">{chk.streetName}</span>
            </h5>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Exibindo <strong>{allPhotos.length}</strong> foto{allPhotos.length === 1 ? '' : 's'} comprovatória{allPhotos.length === 1 ? '' : 's'} anexada{allPhotos.length === 1 ? '' : 's'} (Clique para ampliar)
          </span>
        </div>

        {allPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {allPhotos.map((photo, pIdx) => (
              <div
                key={`street-photo-${chk.id}-${pIdx}`}
                onClick={() => onZoomPhoto(photo)}
                className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs hover:shadow-md cursor-pointer transition-all hover:scale-102"
              >
                <img
                  src={photo}
                  alt={`${chk.streetName} - comprovante ${pIdx + 1}`}
                  className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 p-2 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold line-clamp-1 leading-tight">{chk.streetName}</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] text-emerald-300 font-semibold font-mono">
                      Foto {pIdx + 1} de {allPhotos.length}
                    </span>
                    <span className="text-[8px] text-slate-300 font-mono">
                      {formatDateTimeBR(chk.timestamp).split(' ')[1] || ''}
                    </span>
                  </div>
                </div>
                <span className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded font-mono shadow-xs">
                  🔍 Ampliar
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-white border border-slate-200 text-center text-xs text-slate-400 italic">
            Nenhuma foto anexada encontrada para o logradouro {chk.streetName}.
          </div>
        )}
      </div>

    </div>
  );
};
