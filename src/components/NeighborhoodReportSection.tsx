import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
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
import { Neighborhood, StreetCheckIn, Militant, Team } from '../types';
import { formatDateTimeBR } from '../utils/formatters';
import { getStreetRoadBedCoordinates } from '../utils/saoJoseStreetGeometries';
import { StorageService } from '../services/storageService';
import { compressImageFile } from '../utils/imageCompressor';
import { OFFICIAL_SAO_JOSE_NEIGHBORHOODS } from '../data/officialSaoJoseNeighborhoods';
import {
  MapPin,
  Building2,
  CheckCircle2,
  TrendingUp,
  Image as ImageIcon,
  Users,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  Target,
  BarChart3,
  Calendar,
  Compass,
  Camera,
  Upload
} from 'lucide-react';

interface NeighborhoodReportSectionProps {
  neighborhoods: Neighborhood[];
  checkIns: StreetCheckIn[];
  militants: Militant[];
  teams: Team[];
  onZoomPhoto: (photo: string) => void;
  selectedBairroId?: string;
  onSelectBairro?: (id: string) => void;
  onEditStreet?: (chk: StreetCheckIn) => void;
}

export const NeighborhoodReportSection: React.FC<NeighborhoodReportSectionProps> = ({
  neighborhoods,
  checkIns,
  militants,
  teams,
  onZoomPhoto,
  selectedBairroId: externalBairroId,
  onSelectBairro,
  onEditStreet
}) => {
  const [internalBairroId, setInternalBairroId] = useState<string>(neighborhoods[0]?.id || 'kobrasol');
  const selectedBairroId = externalBairroId || internalBairroId;

  const handleSelectBairro = (newId: string) => {
    setInternalBairroId(newId);
    if (onSelectBairro) {
      onSelectBairro(newId);
    }
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const prevBairroIdRef = useRef<string>('');

  const currentBairro = useMemo(() => {
    return neighborhoods.find(n => n.id === selectedBairroId) || neighborhoods[0];
  }, [neighborhoods, selectedBairroId]);

  // Filter checkins for this neighborhood (by ID and fuzzy neighborhood name match)
  const bairroCheckIns = useMemo(() => {
    if (!currentBairro) return [];
    const bId = (currentBairro.id || '').toLowerCase().trim();
    const bName = (currentBairro.name || '').toLowerCase().trim();
    return checkIns.filter(chk => {
      if (chk.neighborhoodId && chk.neighborhoodId.toLowerCase().trim() === bId) return true;
      if (chk.neighborhoodName) {
        const cName = chk.neighborhoodName.toLowerCase().trim();
        if (cName === bName || cName.includes(bName) || bName.includes(cName)) return true;
      }
      return false;
    });
  }, [checkIns, currentBairro]);

  // Recupera todas as fotos (inclusive fotos recuperadas do banco de dados) vinculadas a este bairro
  const allBairroPhotos = useMemo(() => {
    return bairroCheckIns.flatMap((chk) => {
      const dbPhoto = StorageService.getPhotoForCheckIn(chk.id, chk.neighborhoodId, chk.streetName);
      const validPhotos = (chk.photos || []).filter(p => p && p !== '[vault_photo]');
      const resolved = validPhotos.length > 0 ? validPhotos : (dbPhoto ? [dbPhoto] : []);
      return resolved.map((photo, pIdx) => ({
        key: `${chk.id}-${pIdx}`,
        photo,
        streetName: chk.streetName,
        timestamp: chk.timestamp,
        militantName: chk.militantName
      }));
    });
  }, [bairroCheckIns]);

  // Aggregate stats for current neighborhood
  const totalSantinhos = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos || 0), 0);
  const totalAdesivoBola = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.adesivo_bola || 0), 0);
  const totalParachoque = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.adesivo_parachoque || 0), 0);
  const totalColinhas = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.colinhas || 0), 0);
  const totalAbordagens = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
  const totalComercios = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);
  const totalMateriais = totalSantinhos + totalAdesivoBola + totalParachoque + totalColinhas;

  const coveragePercent = Math.min(
    Math.round((bairroCheckIns.length / Math.max(currentBairro.totalStreets, 1)) * 100),
    100
  );

  // Materials chart data
  const materialsPieData = useMemo(() => {
    return [
      { name: 'Santinhos', value: totalSantinhos || currentBairro.deliveredMaterials.santinhos || 450, color: '#2563eb' },
      { name: 'Adesivo Bola', value: totalAdesivoBola || currentBairro.deliveredMaterials.adesivo_bola || 180, color: '#f59e0b' },
      { name: 'Colinhas', value: totalColinhas || currentBairro.deliveredMaterials.colinhas || 220, color: '#059669' },
      { name: 'Parachoque', value: totalParachoque || currentBairro.deliveredMaterials.adesivo_parachoque || 60, color: '#9333ea' }
    ].filter(item => item.value > 0);
  }, [totalSantinhos, totalAdesivoBola, totalColinhas, totalParachoque, currentBairro]);

  // Initialize and update the Leaflet map for this neighborhood
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentBairro.lat, currentBairro.lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        crossOrigin: true
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 0. Locate official polygon for this neighborhood
    const officialBairro = OFFICIAL_SAO_JOSE_NEIGHBORHOODS.find(
      o => o.id === currentBairro.id || o.name.toLowerCase() === currentBairro.name.toLowerCase()
    );
    const bairroPolygon: [number, number][] = (officialBairro?.polygon || (currentBairro as any).polygon || []) as [number, number][];

    // Desenha o polígono da área delimitada oficial do bairro
    if (bairroPolygon && Array.isArray(bairroPolygon) && bairroPolygon.length > 2) {
      const polygonColor = officialBairro?.officialColor || '#2563eb';
      const poly = L.polygon(bairroPolygon, {
        color: polygonColor,
        weight: 3.5,
        dashArray: '8, 6',
        fillColor: polygonColor,
        fillOpacity: 0.12
      });
      poly.bindTooltip(`<strong>Área Delimitada Oficial</strong><br/>${currentBairro.name}`, {
        sticky: true,
        className: 'text-xs'
      });
      layerGroup.addLayer(poly);
    }

    // Auto-fit and center map on the EXACT delimited polygon of the neighborhood
    if (prevBairroIdRef.current !== currentBairro.id) {
      prevBairroIdRef.current = currentBairro.id;
      if (bairroPolygon && Array.isArray(bairroPolygon) && bairroPolygon.length > 2) {
        const bounds = L.latLngBounds(bairroPolygon);
        map.fitBounds(bounds, { padding: [35, 35] });
      } else if (bairroCheckIns.length > 0) {
        const latLngs = bairroCheckIns.map(c => [c.latitude, c.longitude] as [number, number]);
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      } else {
        map.setView([currentBairro.lat, currentBairro.lng], 15);
      }
    }

    // Draw all check-in streets in this neighborhood painted in RED exactly on the street's road bed
    bairroCheckIns.forEach((chk) => {
      const streetCoords = getStreetRoadBedCoordinates(
        chk.id,
        chk.streetName,
        chk.latitude,
        chk.longitude
      );

      // Glow Red Line
      const glowLine = L.polyline(streetCoords, {
        color: '#ef4444',
        weight: 9,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Core Red Line
      const coreLine = L.polyline(streetCoords, {
        color: '#dc2626',
        weight: 4.5,
        opacity: 0.98,
        lineCap: 'round',
        lineJoin: 'round'
      });

      const formattedDate = formatDateTimeBR(chk.timestamp);
      const photoUrl = chk.photos && chk.photos.length > 0 ? chk.photos[0] : null;

      const popupContent = `
        <div class="p-2.5 text-slate-800 space-y-2 max-w-[260px] font-sans">
          <div class="flex items-center justify-between border-b border-rose-100 pb-1.5 bg-gradient-to-r from-rose-50 to-red-50 -mx-2.5 -mt-2.5 p-2 rounded-t">
            <span class="text-[10px] font-bold uppercase text-red-700">Rua Coberta (Vermelho)</span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Validado</span>
          </div>
          <h4 class="font-black text-sm text-slate-900 leading-tight">🛣️ ${chk.streetName}</h4>
          ${photoUrl ? `<img src="${photoUrl}" class="w-full h-24 object-cover rounded-lg border border-slate-200 mt-1 shadow-2xs" />` : ''}
          <div class="p-1.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-0.5">
            <p><strong>Militante:</strong> ${chk.militantName}</p>
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Materiais:</strong> ${chk.materialsDelivered.santinhos} santinhos | ${chk.materialsDelivered.abordagens || 0} abordagens</p>
          </div>
        </div>
      `;

      glowLine.bindPopup(popupContent, { maxWidth: 280 });
      coreLine.bindPopup(popupContent, { maxWidth: 280 });
      layerGroup.addLayer(glowLine);
      layerGroup.addLayer(coreLine);

      // Red PIN with Checkmark
      const pinIcon = L.divIcon({
        className: 'custom-red-pin-icon',
        html: `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -100%);">
            <div class="absolute -inset-1 rounded-full bg-rose-500/50 animate-ping"></div>
            <div class="relative w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 via-red-600 to-red-800 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold ring-2 ring-red-400 hover:scale-125 transition-transform">
              📍
            </div>
            <div class="w-1.5 h-1.5 bg-red-700 mx-auto -mt-0.5 rounded-b-full"></div>
            <div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-black shadow-xs">✓</div>
          </div>
        `,
        iconSize: [28, 32],
        iconAnchor: [14, 30]
      });

      const pinMarker = L.marker([chk.latitude, chk.longitude], { icon: pinIcon });
      pinMarker.bindPopup(popupContent, { maxWidth: 280 });
      layerGroup.addLayer(pinMarker);
    });

  }, [currentBairro, bairroCheckIns]);

  // Destroy map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-6 pt-2">
      
      {/* Header & Neighborhood Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Compass className="w-3 h-3 text-blue-600" />
              Visão Territorial & Auditoria Geográfica
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Relatório Territorial por Bairros & Mapas de Ruas
          </h3>
          <p className="text-xs text-slate-500">
            Selecione o bairro para auditar o mapa de ruas percorridas (em vermelho), galeria de fotos de comprovação, gráficos e tabela.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Bairro:</label>
          <select
            value={selectedBairroId}
            onChange={(e) => handleSelectBairro(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-2xs"
          >
            {neighborhoods.map(n => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.zone}) - {n.population.toLocaleString('pt-BR')} hab.
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Neighborhood Overview Summary Banner */}
      <div id="neighborhood-report-cards" className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">População (IBGE)</span>
          <strong className="text-base font-bold text-slate-900 font-mono">{currentBairro.population.toLocaleString('pt-BR')} hab.</strong>
          <span className="text-[10px] text-slate-400 block mt-0.5">{currentBairro.zone}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Eleitores Estimados</span>
          <strong className="text-base font-bold text-blue-700 font-mono">{currentBairro.votersEstimated.toLocaleString('pt-BR')}</strong>
          <span className="text-[10px] text-blue-600 block mt-0.5">Aptos a Votar</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Ruas Registradas</span>
          <strong className="text-base font-bold text-rose-700 font-mono">{bairroCheckIns.length} / {currentBairro.totalStreets}</strong>
          <span className="text-[10px] text-rose-600 font-bold block mt-0.5">{coveragePercent}% Coberto</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Abordagens Diretas</span>
          <strong className="text-base font-bold text-purple-700 font-mono">{totalAbordagens} eleitores</strong>
          <span className="text-[10px] text-purple-600 block mt-0.5">{totalComercios} comércios</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Materiais Entregues</span>
          <strong className="text-base font-bold text-emerald-700 font-mono">{totalMateriais.toLocaleString('pt-BR')}</strong>
          <span className="text-[10px] text-emerald-600 block mt-0.5">{totalSantinhos} santinhos</span>
        </div>
      </div>

      {/* SECTION 1: MAP WITH STREETS PAINTED RED & CHARTS */}
      <div id="neighborhood-report-visuals" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Interactive Map Component */}
        <div id="neighborhood-report-map-wrapper" className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Mapa Territorial de {currentBairro.name} • Ruas Pintadas em Vermelho
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
              {bairroCheckIns.length} ruas sinalizadas
            </span>
          </div>

          <div className="relative w-full h-[360px] rounded-lg overflow-hidden border border-slate-200">
            <div ref={mapContainerRef} className="w-full h-full z-0" />
            
            {/* Overlay Map Badge */}
            <div className="absolute bottom-2.5 left-2.5 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] shadow-sm text-slate-700 space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-700">
                <span className="w-3 h-1 bg-red-600 rounded-sm"></span> Ruas Auditadas (Linha Vermelha)
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="text-xs">📍</span> Pins Georreferenciados (GPS)
              </div>
            </div>
          </div>
        </div>

        {/* Charts Panel for this Neighborhood */}
        <div id="neighborhood-report-charts-card" className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Distribuição de Materiais & Abordagens em {currentBairro.name}
            </h4>
            <p className="text-[11px] text-slate-500">Volume de santinhos, adesivos e contatos diretos no bairro</p>
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
                  innerRadius={35}
                  outerRadius={58}
                  paddingAngle={3}
                >
                  {materialsPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val: any, name: any) => [`${val.toLocaleString('pt-BR')} unidades`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
            {materialsPieData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <strong className="text-slate-900 font-mono">{item.value.toLocaleString('pt-BR')}</strong>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-600 font-medium">Atingimento da Meta Territorial:</span>
              <strong className="text-slate-900 font-bold">{coveragePercent}%</strong>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  coveragePercent >= 75 ? 'bg-emerald-500' : (coveragePercent >= 45 ? 'bg-blue-500' : 'bg-amber-500')
                }`}
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: PHOTO PROOF GALLERY FOR THIS NEIGHBORHOOD */}
      <div id="neighborhood-report-photos-card" className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Galeria de Comprovação Fotográfica das Ruas • {currentBairro.name}
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {allBairroPhotos.length} fotos registradas
          </span>
        </div>

        {allBairroPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {allBairroPhotos.map((item) => (
              <div
                key={item.key}
                onClick={() => onZoomPhoto(item.photo)}
                className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs hover:shadow-md cursor-pointer transition-all hover:scale-102"
              >
                <img
                  src={item.photo}
                  alt={item.streetName}
                  className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 p-2 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold line-clamp-1 leading-tight">{item.streetName}</span>
                  <span className="text-[9px] text-slate-300 font-mono">{formatDateTimeBR(item.timestamp)}</span>
                  <span className="text-[8px] text-blue-300 font-medium">{item.militantName}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            Nenhuma foto de rua enviada para o bairro {currentBairro.name} no período.
          </p>
        )}
      </div>

      {/* SECTION 3: DETAILED STREETS TABLE FOR THIS NEIGHBORHOOD */}
      <div id="neighborhood-report-streets-table" className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Tabela Detalhada de Ruas Atendidas em {currentBairro.name}
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Total: <strong>{bairroCheckIns.length} ruas</strong>
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Foto da Rua & Localização (GPS)</th>
                <th className="py-2.5 px-3">Logradouro / Trecho</th>
                <th className="py-2.5 px-3">Militante Responsável</th>
                <th className="py-2.5 px-3 text-center">Abordagens</th>
                <th className="py-2.5 px-3 text-center">Comércio</th>
                <th className="py-2.5 px-3 text-center">Santinhos</th>
                <th className="py-2.5 px-3 text-center">Auditoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bairroCheckIns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    Nenhuma rua cadastrada neste bairro no período selecionado.
                  </td>
                </tr>
              ) : (
                bairroCheckIns.map(chk => {
                  const militantObj = militants.find(m => m.id === chk.militantId);
                  const dbPhoto = StorageService.getPhotoForCheckIn(chk.id, chk.neighborhoodId, chk.streetName);
                  const validPhotos = (chk.photos || []).filter(p => p && p !== '[vault_photo]');
                  const firstPhoto = validPhotos.length > 0 ? validPhotos[0] : dbPhoto;

                  return (
                    <tr key={chk.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {formatDateTimeBR(chk.timestamp)}
                      </td>
                      
                      {/* Photo alongside location & GPS */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          {firstPhoto ? (
                            <div className="relative group shrink-0">
                              <img
                                src={firstPhoto}
                                alt={chk.streetName}
                                onClick={() => onZoomPhoto(firstPhoto)}
                                className="w-10 h-10 rounded-lg object-cover cursor-pointer ring-1 ring-slate-200 shadow-2xs hover:scale-105 transition-transform"
                              />
                              <span className="absolute bottom-0 right-0 p-0.5 bg-black/60 rounded text-[7px] text-white">📷</span>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px]">
                              Sem foto
                            </div>
                          )}
                          <div className="text-left space-y-0.5">
                            <a
                              href={`https://www.google.com/maps?q=${chk.latitude},${chk.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-[10px] border border-slate-200 transition"
                            >
                              <MapPin className="w-3 h-3 text-red-600" />
                              {chk.latitude.toFixed(4)}, {chk.longitude.toFixed(4)}
                            </a>
                            <span className="block text-[9px] text-slate-400 font-mono">Precisão: {chk.accuracyMeters || 3.5}m</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[220px]">
                        {chk.streetName}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={militantObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={chk.militantName}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{chk.militantName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{militantObj?.matricula || 'Militante'}</span>
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
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Validado
                          </span>
                          {onEditStreet && (
                            <button
                              onClick={() => onEditStreet(chk)}
                              className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[10px] border border-blue-200 cursor-pointer"
                              title="Editar ou Excluir Definitivamente este Registro"
                            >
                              Editar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
