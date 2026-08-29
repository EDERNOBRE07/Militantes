import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Neighborhood, Militant, Van, StreetCheckIn } from '../types';
import { SAO_JOSE_CENTER } from '../data/saoJoseData';
import { formatDateTimeBR } from '../utils/formatters';
import {
  MapPin,
  Users,
  Truck,
  Flame,
  CheckCircle,
  Maximize2,
  Layers,
  BarChart2,
  Building2,
  Activity,
  Compass,
  Info,
  TrendingUp,
  Target,
  Sparkles,
  ChevronRight,
  X,
  Camera,
  MapPinOff
} from 'lucide-react';

export type MapLayerMode = 'demografia_ibge' | 'performance_militancia';
export type BaseMapProvider = 'google_streets' | 'google_satellite' | 'google_terrain' | 'carto_osm';

interface CoverageMapViewProps {
  neighborhoods: Neighborhood[];
  militants: Militant[];
  vans: Van[];
  checkIns: StreetCheckIn[];
  onSelectNeighborhood?: (neighborhood: Neighborhood) => void;
}

export const CoverageMapView: React.FC<CoverageMapViewProps> = ({
  neighborhoods,
  militants,
  vans,
  checkIns,
  onSelectNeighborhood
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  // Map Provider (Google Maps Free standard, satellite and terrain)
  const [baseMapProvider, setBaseMapProvider] = useState<BaseMapProvider>('google_streets');

  // Layer mode: IBGE Demographic Density vs Militancy Performance
  const [layerMode, setLayerMode] = useState<MapLayerMode>('performance_militancia');
  const [showVans, setShowVans] = useState<boolean>(true);
  const [showMilitants, setShowMilitants] = useState<boolean>(true);
  const [showCheckins, setShowCheckins] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [selectedBairroFilter, setSelectedBairroFilter] = useState<string>('todos');
  const [inspectedBairro, setInspectedBairro] = useState<Neighborhood | null>(null);

  const getTileLayerConfig = (provider: BaseMapProvider) => {
    switch (provider) {
      case 'google_streets':
        return {
          url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
          attribution: '&copy; Google Maps (São José - SC)',
          maxZoom: 20
        };
      case 'google_satellite':
        return {
          url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          attribution: '&copy; Google Maps Satélite / Híbrido (São José - SC)',
          maxZoom: 20
        };
      case 'google_terrain':
        return {
          url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
          attribution: '&copy; Google Maps Relevo (São José - SC)',
          maxZoom: 20
        };
      case 'carto_osm':
      default:
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          attribution: '&copy; CARTO & OSM (São José - SC)',
          maxZoom: 19
        };
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: SAO_JOSE_CENTER,
        zoom: 13,
        minZoom: 10,
        maxZoom: 20,
        zoomControl: false
      });

      const initialTile = getTileLayerConfig('google_streets');
      const tileLayer = L.tileLayer(initialTile.url, {
        attribution: initialTile.attribution,
        maxZoom: initialTile.maxZoom
      }).addTo(map);

      baseTileLayerRef.current = tileLayer;

      // Add zoom control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Base Map Provider Switching (Google Maps vs Satellite vs Terrain vs Carto)
  useEffect(() => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;
    const config = getTileLayerConfig(baseMapProvider);
    baseTileLayerRef.current.setUrl(config.url);
  }, [baseMapProvider]);

  // Center/Zoom on neighborhood filter change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedBairroFilter === 'todos') {
      map.setView(SAO_JOSE_CENTER, 13);
      setInspectedBairro(null);
    } else {
      const targetBairro = neighborhoods.find(n => n.id === selectedBairroFilter);
      if (targetBairro) {
        map.setView([targetBairro.lat, targetBairro.lng], 15);
        setInspectedBairro(targetBairro);
      }
    }
  }, [selectedBairroFilter, neighborhoods]);

  // Render Map Layers & Pins dynamically based on Layer Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const filteredNeighborhoods = selectedBairroFilter === 'todos'
      ? neighborhoods
      : neighborhoods.filter(n => n.id === selectedBairroFilter);

    // =========================================================================
    // 1. RENDER NEIGHBORHOOD POLYGONS ACCORDING TO ACTIVE LAYER MODE
    // =========================================================================
    filteredNeighborhoods.forEach(bairro => {
      const completionRate = (bairro.completedStreets / bairro.totalStreets) * 100;
      const votersPerStreet = Math.round(bairro.votersEstimated / Math.max(bairro.totalStreets, 1));

      let fillColor = '#10b981';
      let strokeColor = '#059669';
      let fillOpacity = 0.28;

      if (layerMode === 'demografia_ibge') {
        // IBGE Population / Demography scale
        if (bairro.population >= 20000) {
          fillColor = '#6366f1'; // Indigo (>20k hab - Muito Alta)
          strokeColor = '#4338ca';
          fillOpacity = 0.45;
        } else if (bairro.population >= 14000) {
          fillColor = '#3b82f6'; // Blue (14k-20k hab - Alta)
          strokeColor = '#1d4ed8';
          fillOpacity = 0.38;
        } else if (bairro.population >= 8000) {
          fillColor = '#0ea5e9'; // Sky (8k-14k hab - Média)
          strokeColor = '#0284c7';
          fillOpacity = 0.32;
        } else {
          fillColor = '#14b8a6'; // Teal (<8k hab - Moderada)
          strokeColor = '#0d9488';
          fillOpacity = 0.25;
        }
      } else {
        // Performance & Militancy scale
        if (completionRate >= 75) {
          fillColor = '#10b981'; // Emerald (>=75% - Meta Atingida)
          strokeColor = '#059669';
          fillOpacity = 0.35;
        } else if (completionRate >= 45) {
          fillColor = '#f59e0b'; // Amber (45-74% - Em Andamento)
          strokeColor = '#d97706';
          fillOpacity = 0.35;
        } else {
          fillColor = '#ef4444'; // Red (<45% - Área Crítica / Prioridade)
          strokeColor = '#dc2626';
          fillOpacity = 0.40;
        }
      }

      const polygon = L.polygon(bairro.polygon, {
        color: strokeColor,
        weight: 2.2,
        opacity: 0.9,
        fillColor: fillColor,
        fillOpacity: fillOpacity
      });

      // Customized Popup content per layer
      const popupHtml = layerMode === 'demografia_ibge' ? `
        <div class="p-2 space-y-2 text-slate-800 font-sans min-w-[210px]">
          <div class="flex items-center justify-between border-b border-indigo-100 pb-1.5 bg-indigo-50/70 -mx-2 -mt-2 p-2 rounded-t">
            <div>
              <span class="text-[9px] uppercase tracking-wider font-bold text-indigo-700 block">IBGE 2022 • Demografia</span>
              <h4 class="font-bold text-sm text-slate-900 leading-tight">${bairro.name}</h4>
            </div>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-indigo-800 border border-indigo-200">${bairro.zone}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs pt-1">
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">População (Censo):</p>
              <p class="font-bold text-indigo-900 text-sm">${bairro.population.toLocaleString('pt-BR')} hab.</p>
            </div>
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">Eleitores (TSE):</p>
              <p class="font-bold text-blue-700 text-sm">${bairro.votersEstimated.toLocaleString('pt-BR')}</p>
            </div>
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">Domicílios:</p>
              <p class="font-bold text-slate-800">${bairro.households.toLocaleString('pt-BR')}</p>
            </div>
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">Densidade / Rua:</p>
              <p class="font-bold text-emerald-700">${votersPerStreet} eleit./rua</p>
            </div>
          </div>
          <div class="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Prioridade Política:</span>
            <strong class="${bairro.priority === 'Alta' ? 'text-rose-600' : 'text-amber-600'} font-bold">${bairro.priority}</strong>
          </div>
        </div>
      ` : `
        <div class="p-2 space-y-2 text-slate-800 font-sans min-w-[210px]">
          <div class="flex items-center justify-between border-b border-emerald-100 pb-1.5 bg-emerald-50/70 -mx-2 -mt-2 p-2 rounded-t">
            <div>
              <span class="text-[9px] uppercase tracking-wider font-bold text-emerald-700 block">Performance de Militância</span>
              <h4 class="font-bold text-sm text-slate-900 leading-tight">${bairro.name}</h4>
            </div>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">${bairro.zone}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs pt-1">
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">Ruas Concluídas:</p>
              <p class="font-bold text-slate-900 text-sm">${bairro.completedStreets} / ${bairro.totalStreets}</p>
            </div>
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">Atingimento:</p>
              <p class="font-bold ${completionRate >= 75 ? 'text-emerald-700' : (completionRate >= 45 ? 'text-amber-700' : 'text-rose-700')} text-sm">${completionRate.toFixed(1)}%</p>
            </div>
          </div>
          <div class="p-1.5 rounded bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 space-y-0.5">
            <div class="flex justify-between">
              <span>Santinhos entregues:</span>
              <strong>${bairro.deliveredMaterials.santinhos.toLocaleString('pt-BR')}</strong>
            </div>
            <div class="flex justify-between">
              <span>Adesivos colados:</span>
              <strong>${(bairro.deliveredMaterials.adesivo_bola + bairro.deliveredMaterials.adesivo_parachoque).toLocaleString('pt-BR')}</strong>
            </div>
          </div>
        </div>
      `;

      polygon.bindPopup(popupHtml, { maxWidth: 300 });

      polygon.on('click', () => {
        setInspectedBairro(bairro);
        if (onSelectNeighborhood) onSelectNeighborhood(bairro);
      });

      layerGroup.addLayer(polygon);

      // 1.1 Render Labels on Center
      if (showLabels) {
        let labelHtml = '';
        if (layerMode === 'demografia_ibge') {
          labelHtml = `
            <div class="px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-xs border border-indigo-200 text-[11px] font-semibold text-slate-800 whitespace-nowrap shadow-xs flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full" style="background-color: ${fillColor}"></span>
              <span>${bairro.name}</span>
              <span class="text-indigo-700 font-bold font-mono text-[10px]">(${(bairro.population / 1000).toFixed(1)}k hab)</span>
            </div>
          `;
        } else {
          labelHtml = `
            <div class="px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200 text-[11px] font-semibold text-slate-800 whitespace-nowrap shadow-xs flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full" style="background-color: ${fillColor}"></span>
              <span>${bairro.name}</span>
              <span class="${completionRate >= 75 ? 'text-emerald-700 font-bold' : (completionRate >= 45 ? 'text-amber-700 font-bold' : 'text-rose-700 font-bold')} font-mono text-[10px]">(${completionRate.toFixed(0)}%)</span>
            </div>
          `;
        }

        const labelIcon = L.divIcon({
          className: 'custom-div-icon',
          html: labelHtml,
          iconSize: [110, 26],
          iconAnchor: [55, 13]
        });

        L.marker([bairro.lat, bairro.lng], { icon: labelIcon }).addTo(layerGroup);
      }
    });

    // =========================================================================
    // 2. RENDER MILITANTES IN FIELD (Available in both, prominent in performance)
    // =========================================================================
    if (showMilitants) {
      militants.forEach(m => {
        if (m.currentLocation && m.status === 'em_campo') {
          const milIcon = L.divIcon({
            className: 'custom-militant-icon',
            html: `
              <div class="relative group cursor-pointer">
                <div class="w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-white ring-2 ring-blue-500 hover:scale-110 transition-transform">
                  <img src="${m.avatar}" class="w-full h-full object-cover" />
                </div>
                <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const marker = L.marker([m.currentLocation.lat, m.currentLocation.lng], { icon: milIcon });
          marker.bindPopup(`
            <div class="p-2 text-slate-800 space-y-1.5 min-w-[200px]">
              <div class="flex items-center gap-2">
                <img src="${m.avatar}" class="w-8 h-8 rounded-full object-cover border border-slate-200" />
                <div>
                  <h4 class="font-bold text-sm text-slate-900">${m.name}</h4>
                  <p class="text-[11px] text-emerald-700 font-semibold">${m.matricula} • Em Campo</p>
                </div>
              </div>
              <div class="text-xs text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                <p>📍 <strong>Local:</strong> ${m.currentLocation.streetName}, ${m.currentLocation.neighborhoodName}</p>
                <p>🚶 <strong>Distância hoje:</strong> ${m.totalKmWalked} km (${m.totalStreetsCovered} ruas)</p>
                <p>📦 <strong>Santinhos:</strong> ${m.deliveredMaterials.santinhos.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          `);
          layerGroup.addLayer(marker);
        }
      });
    }

    // =========================================================================
    // 3. RENDER VANS AND LOGISTICS ROUTES
    // =========================================================================
    if (showVans) {
      vans.forEach(van => {
        const vanIcon = L.divIcon({
          className: 'custom-van-icon',
          html: `
            <div class="w-8 h-8 rounded-xl bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white ring-2 ring-blue-400 hover:scale-110 transition-transform cursor-pointer">
              🚐
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const vanMarker = L.marker([van.currentCoords.lat, van.currentCoords.lng], { icon: vanIcon });
        vanMarker.bindPopup(`
          <div class="p-2 text-slate-800 space-y-1.5 min-w-[200px]">
            <h4 class="font-bold text-sm text-blue-700">${van.name}</h4>
            <p class="text-[11px] text-slate-500 font-medium">${van.model} (${van.plate})</p>
            <div class="text-xs space-y-0.5 text-slate-600 pt-1 border-t border-slate-100">
              <p>👤 <strong>Motorista:</strong> ${van.driverName} (${van.driverPhone})</p>
              <p>🎯 <strong>Próximo Ponto:</strong> ${van.nextPickupLocation}</p>
              <p>⏰ <strong>Horário:</strong> ${van.nextPickupTime}</p>
              <p>🚦 <strong>Status:</strong> <span class="text-emerald-700 font-semibold uppercase">${van.status}</span></p>
            </div>
          </div>
        `);
        layerGroup.addLayer(vanMarker);
      });
    }

    // =========================================================================
    // 4. RENDER STREET CHECK-INS (Painted Red on Map + Custom Red PINs)
    // =========================================================================
    if (showCheckins) {
      const activeCheckIns = selectedBairroFilter === 'todos'
        ? checkIns
        : checkIns.filter(chk => chk.neighborhoodId === selectedBairroFilter);

      activeCheckIns.forEach((chk, idx) => {
        // Generate realistic street polyline trajectory around the checkin coordinates
        const hash = Array.from(chk.id + chk.streetName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const angle = ((hash % 180) * Math.PI) / 180;
        const length = 0.0016 + (hash % 8) * 0.00015; // ~150-240 meters
        const dx = Math.cos(angle) * length;
        const dy = Math.sin(angle) * (length * 0.82);

        const streetPolylineCoords: [number, number][] = [
          [chk.latitude - dy, chk.longitude - dx],
          [chk.latitude - dy * 0.35, chk.longitude - dx * 0.35],
          [chk.latitude, chk.longitude],
          [chk.latitude + dy * 0.45, chk.longitude + dx * 0.45],
          [chk.latitude + dy, chk.longitude + dx]
        ];

        // 4.1 Draw Glow Red Outer Line (Pintada de Vermelho)
        const outerStreetGlow = L.polyline(streetPolylineCoords, {
          color: '#ef4444',
          weight: 9,
          opacity: 0.45,
          lineCap: 'round',
          lineJoin: 'round'
        });

        // 4.2 Draw Core Red Solid Line (Pintada de Vermelho)
        const coreStreetLine = L.polyline(streetPolylineCoords, {
          color: '#dc2626',
          weight: 4.5,
          opacity: 0.98,
          lineCap: 'round',
          lineJoin: 'round'
        });

        const formattedDate = formatDateTimeBR(chk.timestamp);
        const militantObj = militants.find(m => m.id === chk.militantId);
        const photoUrl = (chk.photos && chk.photos.length > 0) ? chk.photos[0] : null;

        const streetPopupHtml = `
          <div class="p-2.5 text-slate-800 space-y-2 max-w-[270px] font-sans">
            <div class="flex items-center justify-between border-b border-rose-100 pb-1.5 bg-gradient-to-r from-rose-50 to-red-50 -mx-2.5 -mt-2.5 p-2 rounded-t">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                <span class="text-[10px] font-bold uppercase tracking-wider text-red-700">Rua Registrada & Coberta</span>
              </div>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✓ Validado
              </span>
            </div>

            <div>
              <h4 class="font-black text-sm text-slate-900 leading-tight flex items-center gap-1">
                <span>🛣️</span> ${chk.streetName}
              </h4>
              <p class="text-[11px] text-slate-600 font-medium">Bairro: <strong class="text-blue-700">${chk.neighborhoodName}</strong></p>
            </div>

            ${photoUrl ? `
              <div class="rounded-lg overflow-hidden border border-slate-200 shadow-2xs group relative">
                <img src="${photoUrl}" alt="Foto da Rua" class="w-full h-24 object-cover" />
                <div class="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
                  📷 Foto de Campo
                </div>
              </div>
            ` : ''}

            <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div class="flex items-center gap-2">
                <img src="${militantObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300" />
                <div class="truncate">
                  <strong class="text-slate-900 block truncate leading-tight">${chk.militantName}</strong>
                  <span class="text-[10px] text-slate-500 font-mono">${militantObj?.matricula || 'Militante'}</span>
                </div>
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                <span>🕒 Data & Horário:</span>
                <strong class="text-slate-900 font-mono">${formattedDate}</strong>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-1 text-[10px] text-center pt-0.5">
              <div class="p-1 rounded bg-blue-50 border border-blue-100">
                <span class="text-slate-500 block">Santinhos</span>
                <strong class="text-blue-800 text-xs font-mono">${chk.materialsDelivered.santinhos}</strong>
              </div>
              <div class="p-1 rounded bg-purple-50 border border-purple-100">
                <span class="text-slate-500 block">Abordagens</span>
                <strong class="text-purple-800 text-xs font-mono">${chk.materialsDelivered.abordagens || 0}</strong>
              </div>
              <div class="p-1 rounded bg-emerald-50 border border-emerald-100">
                <span class="text-slate-500 block">Comércio</span>
                <strong class="text-emerald-800 text-xs font-mono">${chk.materialsDelivered.comercio || 0}</strong>
              </div>
            </div>

            <div class="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100">
              <span class="font-mono">GPS: ${chk.latitude.toFixed(4)}, ${chk.longitude.toFixed(4)}</span>
              <a href="https://www.google.com/maps?q=${chk.latitude},${chk.longitude}" target="_blank" rel="noreferrer" class="text-blue-600 font-semibold hover:underline">
                Abrir Mapa ↗
              </a>
            </div>
          </div>
        `;

        outerStreetGlow.bindPopup(streetPopupHtml, { maxWidth: 290 });
        coreStreetLine.bindPopup(streetPopupHtml, { maxWidth: 290 });
        outerStreetGlow.bindTooltip(`<b>Rua Coberta (Vermelho):</b> ${chk.streetName}`, { sticky: true });
        coreStreetLine.bindTooltip(`<b>Rua Coberta (Vermelho):</b> ${chk.streetName}`, { sticky: true });

        layerGroup.addLayer(outerStreetGlow);
        layerGroup.addLayer(coreStreetLine);

        // 4.3 Draw Custom Red PIN Marker with Pulse & Checkmark Badge
        const pinIcon = L.divIcon({
          className: 'custom-red-pin-icon',
          html: `
            <div class="relative group cursor-pointer" style="transform: translate(-50%, -100%);">
              <div class="absolute -inset-1 rounded-full bg-rose-500/50 animate-ping"></div>
              <div class="relative w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 via-red-600 to-red-800 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold ring-2 ring-red-400 hover:scale-125 transition-transform">
                📍
              </div>
              <div class="w-1.5 h-1.5 bg-red-700 mx-auto -mt-0.5 rounded-b-full"></div>
              <div class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-black shadow-xs">✓</div>
            </div>
          `,
          iconSize: [32, 36],
          iconAnchor: [16, 34]
        });

        const marker = L.marker([chk.latitude, chk.longitude], { icon: pinIcon });
        marker.bindPopup(streetPopupHtml, { maxWidth: 290 });
        layerGroup.addLayer(marker);
      });
    }

  }, [neighborhoods, militants, vans, checkIns, layerMode, showVans, showMilitants, showCheckins, showLabels, selectedBairroFilter, onSelectNeighborhood]);

  const zoomToSaoJose = () => {
    setSelectedBairroFilter('todos');
    setInspectedBairro(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(SAO_JOSE_CENTER, 13);
    }
  };

  const totalPopulation = neighborhoods.reduce((acc, curr) => acc + curr.population, 0);
  const totalVoters = neighborhoods.reduce((acc, curr) => acc + curr.votersEstimated, 0);
  const totalStreets = neighborhoods.reduce((acc, curr) => acc + curr.totalStreets, 0);
  const totalCompletedStreets = neighborhoods.reduce((acc, curr) => acc + curr.completedStreets, 0);

  return (
    <div className="relative w-full h-[660px] lg:h-[730px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm flex flex-col">
      
      {/* Top Map Control & Layer Switcher Bar */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Layer Mode Switcher (IBGE vs Performance) */}
        <div className="flex flex-wrap items-center gap-1 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200 shadow-md pointer-events-auto">
          <button
            type="button"
            onClick={() => setLayerMode('demografia_ibge')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              layerMode === 'demografia_ibge'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Alternar para visualização de Densidade Demográfica e Eleitores do Censo IBGE"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Densidade Demográfica (IBGE)</span>
            <span className="sm:hidden">Demografia IBGE</span>
          </button>

          <button
            type="button"
            onClick={() => setLayerMode('performance_militancia')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              layerMode === 'performance_militancia'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Alternar para visualização de Performance de Militância, Cobertura de Ruas e Check-ins"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Performance de Militância (Check-ins)</span>
            <span className="sm:hidden">Performance</span>
          </button>
        </div>

        {/* Map Type Provider (Google Maps Free vs Satellite vs Terrain) & Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200 shadow-md pointer-events-auto text-xs">
          
          {/* Base Map Switcher: Google Maps */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setBaseMapProvider('google_streets')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                baseMapProvider === 'google_streets'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Google Maps (Padrão de Ruas)"
            >
              🗺️ Google Ruas
            </button>

            <button
              type="button"
              onClick={() => setBaseMapProvider('google_satellite')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                baseMapProvider === 'google_satellite'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Google Maps Satélite / Híbrido (Imagens aéreas de São José com nomes de vias)"
            >
              🛰️ Satélite
            </button>

            <button
              type="button"
              onClick={() => setBaseMapProvider('google_terrain')}
              className={`hidden sm:inline-block px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                baseMapProvider === 'google_terrain'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Google Maps Relevo e Terreno"
            >
              ⛰️ Relevo
            </button>
          </div>

          {/* Bairro Selector Dropdown */}
          <div className="flex items-center gap-1 pr-1 border-r border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-blue-600 ml-1" />
            <select
              value={selectedBairroFilter}
              onChange={(e) => setSelectedBairroFilter(e.target.value)}
              className="bg-slate-50 text-xs text-slate-800 border-0 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500 font-medium outline-none cursor-pointer max-w-[120px] sm:max-w-none"
            >
              <option value="todos">Todos (18 Bairros)</option>
              {neighborhoods.map(n => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
              showLabels ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:bg-slate-50'
            }`}
            title="Exibir/Ocultar Rótulos com Nomes dos Bairros"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Rótulos</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCheckins(!showCheckins)}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-medium transition ${
              showCheckins ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:bg-slate-50'
            }`}
            title="Exibir Check-ins Georreferenciados de Ruas"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Check-ins ({checkIns.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMilitants(!showMilitants)}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-medium transition ${
              showMilitants ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:bg-slate-50'
            }`}
            title="Exibir Militantes em Campo"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Militantes</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVans(!showVans)}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-medium transition ${
              showVans ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'text-slate-500 hover:bg-slate-50'
            }`}
            title="Exibir Vans e Rotas de Transporte"
          >
            <Truck className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden sm:inline">Vans</span>
          </button>

          <button
            type="button"
            onClick={zoomToSaoJose}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition ml-0.5"
            title="Centralizar mapa em São José - SC"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

      {/* Dynamic Bottom Left Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-md text-xs space-y-1.5 pointer-events-auto max-w-sm">
        
        {layerMode === 'demografia_ibge' ? (
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-indigo-900 font-bold text-[11px] uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              Densidade Demográfica (Censo IBGE 2022)
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0"></span>
                <span className="text-slate-700">&gt; 20.000 hab.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></span>
                <span className="text-slate-700">14.000 - 20.000 hab.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0"></span>
                <span className="text-slate-700">8.000 - 14.000 hab.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-500 shrink-0"></span>
                <span className="text-slate-700">&lt; 8.000 hab.</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 border-t border-slate-100 pt-1">
              Base oficial: Censo Demográfico IBGE 2022 • São José / SC
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-slate-900 font-bold text-[11px] uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Cobertura de Ruas & Check-ins de Campo
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-700">&ge; 75% Coberto</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-slate-700">45% - 74% (Em Andamento)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                <span className="text-slate-700">&lt; 45% (Crítico / Prioridade)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-600 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-rose-700">
                <span className="w-3 h-1.5 bg-red-600 rounded-sm"></span> Rua Coberta (Linha Vermelha)
              </span>
              <span className="flex items-center gap-1 font-semibold text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></span> PIN Rua
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span> Militante Ativo
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-600"></span> Van
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Dynamic Bottom Right KPI Summary Card */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-md text-xs flex items-center gap-3 pointer-events-auto">
        {layerMode === 'demografia_ibge' ? (
          <>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">População IBGE 2022</p>
              <p className="font-bold text-slate-900 text-sm">{totalPopulation.toLocaleString('pt-BR')} hab.</p>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-right">
              <p className="text-[10px] text-indigo-700 uppercase font-semibold">Eleitores Estimados</p>
              <p className="font-bold text-indigo-900 text-sm">
                {totalVoters.toLocaleString('pt-BR')} aptos
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Total de Ruas em SJ</p>
              <p className="font-bold text-slate-900 text-sm">{totalStreets} Ruas</p>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-right">
              <p className="text-[10px] text-emerald-700 uppercase font-semibold">Ruas Cobertas</p>
              <p className="font-bold text-emerald-800 text-sm">
                {totalCompletedStreets} ({((totalCompletedStreets / totalStreets) * 100).toFixed(1)}%)
              </p>
            </div>
          </>
        )}
      </div>

      {/* Selected Neighborhood Drawer (Bottom Center / Floating Panel) */}
      {inspectedBairro && (
        <div className="absolute top-20 right-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl text-xs space-y-2 pointer-events-auto max-w-xs animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">{inspectedBairro.zone}</span>
              <h4 className="font-bold text-base text-slate-900 leading-tight">{inspectedBairro.name}</h4>
            </div>
            <button
              onClick={() => setInspectedBairro(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100">
              <span className="text-[10px] text-indigo-700 font-semibold uppercase block">População (IBGE)</span>
              <strong className="text-indigo-950 font-mono text-sm">{inspectedBairro.population.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
              <span className="text-[10px] text-blue-700 font-semibold uppercase block">Eleitores Estimados</span>
              <strong className="text-blue-950 font-mono text-sm">{inspectedBairro.votersEstimated.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Cobertura Ruas</span>
              <strong className="text-emerald-950 font-mono text-sm">
                {inspectedBairro.completedStreets} / {inspectedBairro.totalStreets} ({((inspectedBairro.completedStreets / inspectedBairro.totalStreets) * 100).toFixed(0)}%)
              </strong>
            </div>
            <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100">
              <span className="text-[10px] text-amber-700 font-semibold uppercase block">Prioridade</span>
              <strong className="text-amber-950 text-sm">{inspectedBairro.priority}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between items-center">
            <span>Santinhos Entregues:</span>
            <span className="font-bold text-slate-900 font-mono">{inspectedBairro.deliveredMaterials.santinhos.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      )}

    </div>
  );
};

