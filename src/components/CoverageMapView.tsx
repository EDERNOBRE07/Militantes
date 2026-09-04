import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Neighborhood, Militant, Van, StreetCheckIn } from '../types';
import { SAO_JOSE_CENTER } from '../data/saoJoseData';
import { formatDateTimeBR } from '../utils/formatters';
import { getCalibratedCheckInPosition, resolveExactStreetCoordinates } from '../utils/saoJoseStreetsGeo';
import { EditStreetModal } from './EditStreetModal';
import { StorageService } from '../services/storageService';
import {
  MapPin,
  Users,
  Truck,
  CheckCircle,
  Maximize2,
  Layers,
  Building2,
  Activity,
  Compass,
  FileText,
  MessageSquare,
  Store,
  ExternalLink,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Edit3,
  CheckCircle2,
  Eye,
  Flame
} from 'lucide-react';

export type MapLayerMode = 'atlas_pmsj' | 'mapa_calor' | 'demografia_ibge' | 'performance_militancia';
export type HeatmapMetric = 'checkins' | 'santinhos' | 'adesivos' | 'eleitores';
export type BaseMapProvider = 'google_streets' | 'google_satellite' | 'google_terrain' | 'carto_osm';

interface CoverageMapViewProps {
  neighborhoods: Neighborhood[];
  militants: Militant[];
  vans: Van[];
  checkIns: StreetCheckIn[];
  initialLayerMode?: MapLayerMode;
  onSelectNeighborhood?: (neighborhood: Neighborhood) => void;
  onCheckInUpdated?: () => void;
}

export const CoverageMapView: React.FC<CoverageMapViewProps> = ({
  neighborhoods,
  militants,
  vans,
  checkIns,
  initialLayerMode,
  onSelectNeighborhood,
  onCheckInUpdated
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  // Map Provider (Google Maps Free standard, satellite and terrain)
  const [baseMapProvider, setBaseMapProvider] = useState<BaseMapProvider>('google_streets');

  // Layer mode: Mapa Oficial PMSJ 2020 (Atlas IFSC) vs Demografia IBGE vs PINs Performance
  const [layerMode, setLayerMode] = useState<MapLayerMode>(initialLayerMode || 'atlas_pmsj');
  const [heatMetric, setHeatMetric] = useState<HeatmapMetric>('checkins');
  const [showVans, setShowVans] = useState<boolean>(true);
  const [showMilitants, setShowMilitants] = useState<boolean>(true);
  const [showCheckins, setShowCheckins] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [selectedBairroFilter, setSelectedBairroFilter] = useState<string>('todos');
  const [inspectedBairro, setInspectedBairro] = useState<Neighborhood | null>(null);

  // Selected check-in for detailed drawer / full multi-photo view
  const [inspectedCheckIn, setInspectedCheckIn] = useState<StreetCheckIn | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [expandedPhotoModal, setExpandedPhotoModal] = useState<string | null>(null);
  const [editingCheckIn, setEditingCheckIn] = useState<StreetCheckIn | null>(null);

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
        if (targetBairro.polygon && targetBairro.polygon.length >= 3) {
          map.fitBounds(L.polygon(targetBairro.polygon).getBounds(), { padding: [45, 45], maxZoom: 16 });
        } else {
          map.setView([targetBairro.lat, targetBairro.lng], 15);
        }
        setInspectedBairro(targetBairro);
        setShowCheckins(true); // Exibe os pins daquele bairro automaticamente
      }
    }
  }, [selectedBairroFilter, neighborhoods]);

  // Render Map Layers & Pins dynamically based on Layer Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // =========================================================================
    // 1. RENDER NEIGHBORHOOD POLYGONS ACCORDING TO ACTIVE LAYER MODE & SELECTION
    // =========================================================================
    const chkCounts: Record<string, number> = {};
    neighborhoods.forEach(n => { chkCounts[n.id] = 0; });
    checkIns.forEach(c => {
      if (c.neighborhoodId && chkCounts[c.neighborhoodId] !== undefined) {
        chkCounts[c.neighborhoodId]++;
      }
    });

    let maxChk = 1;
    let maxSant = 1;
    let maxAdes = 1;
    let maxEleit = 1;
    neighborhoods.forEach(b => {
      const c = chkCounts[b.id] || 0;
      if (c > maxChk) maxChk = c;
      const s = b.deliveredMaterials?.santinhos || 0;
      if (s > maxSant) maxSant = s;
      const a = (b.deliveredMaterials?.adesivo_bola || 0) + (b.deliveredMaterials?.adesivo_parachoque || 0) + (b.deliveredMaterials?.adesivos || 0);
      if (a > maxAdes) maxAdes = a;
      const el = b.votersEstimated || 1;
      if (el > maxEleit) maxEleit = el;
    });

    neighborhoods.forEach(bairro => {
      const isSelected = selectedBairroFilter !== 'todos' && bairro.id === selectedBairroFilter;
      const isOtherWhenFiltered = selectedBairroFilter !== 'todos' && !isSelected;

      const completionRate = (bairro.completedStreets / bairro.totalStreets) * 100;
      const votersPerStreet = Math.round(bairro.votersEstimated / Math.max(bairro.totalStreets, 1));

      let fillColor = '#10b981';
      let strokeColor = '#059669';
      let fillOpacity = 0.25;
      let strokeWidth = 2.0;
      let strokeOpacity = 0.85;

      if (isSelected) {
        // Destaque exato da área geográfica oficial solicitada pelo usuário (contorno vermelho nítido)
        strokeColor = '#ef4444';
        fillColor = '#ef4444';
        strokeWidth = 3.5;
        strokeOpacity = 1.0;
        fillOpacity = 0.28;
      } else if (isOtherWhenFiltered) {
        // Outros bairros em segundo plano sutil para contextualizar o mapa
        strokeColor = '#94a3b8';
        fillColor = '#cbd5e1';
        strokeWidth = 1.0;
        strokeOpacity = 0.4;
        fillOpacity = 0.04;
      } else if (layerMode === 'atlas_pmsj') {
        // Mapa Oficial IFSC / PMSJ (2020) & IBGE (2021)
        fillColor = bairro.officialColor || '#6366f1';
        strokeColor = '#334155';
        strokeWidth = 2.0;
        strokeOpacity = 0.95;
        fillOpacity = 0.45;
      } else if (layerMode === 'mapa_calor') {
        let heatVal = 0;
        let maxV = 1;
        if (heatMetric === 'checkins') {
          heatVal = chkCounts[bairro.id] || 0;
          maxV = maxChk;
        } else if (heatMetric === 'santinhos') {
          heatVal = bairro.deliveredMaterials?.santinhos || 0;
          maxV = maxSant;
        } else if (heatMetric === 'adesivos') {
          heatVal = (bairro.deliveredMaterials?.adesivo_bola || 0) + (bairro.deliveredMaterials?.adesivo_parachoque || 0) + (bairro.deliveredMaterials?.adesivos || 0);
          maxV = maxAdes;
        } else {
          heatVal = bairro.votersEstimated || 0;
          maxV = maxEleit;
        }
        const heatRatio = maxV > 0 ? heatVal / maxV : 0;
        if (heatRatio >= 0.85) {
          fillColor = '#dc2626'; // Hotspot Fogo Máximo
          strokeColor = '#991b1b';
          fillOpacity = 0.65;
          strokeWidth = 2.5;
        } else if (heatRatio >= 0.65) {
          fillColor = '#ea580c'; // Laranja Intenso
          strokeColor = '#c2410c';
          fillOpacity = 0.55;
          strokeWidth = 2.0;
        } else if (heatRatio >= 0.45) {
          fillColor = '#eab308'; // Amarelo Quente
          strokeColor = '#a16207';
          fillOpacity = 0.48;
          strokeWidth = 1.8;
        } else if (heatRatio >= 0.25) {
          fillColor = '#10b981'; // Verde Moderado
          strokeColor = '#047857';
          fillOpacity = 0.40;
          strokeWidth = 1.5;
        } else if (heatRatio > 0.05) {
          fillColor = '#06b6d4'; // Ciano
          strokeColor = '#0e7490';
          fillOpacity = 0.32;
          strokeWidth = 1.2;
        } else {
          fillColor = '#3b82f6'; // Azul Frio
          strokeColor = '#1d4ed8';
          fillOpacity = 0.22;
          strokeWidth = 1.0;
        }
      } else if (layerMode === 'demografia_ibge') {
        // IBGE Population / Demography scale
        if (bairro.population >= 20000) {
          fillColor = '#6366f1'; // Indigo (>20k hab - Muito Alta)
          strokeColor = '#4338ca';
          fillOpacity = 0.40;
        } else if (bairro.population >= 14000) {
          fillColor = '#3b82f6'; // Blue (14k-20k hab - Alta)
          strokeColor = '#1d4ed8';
          fillOpacity = 0.32;
        } else if (bairro.population >= 8000) {
          fillColor = '#0ea5e9'; // Sky (8k-14k hab - Média)
          strokeColor = '#0284c7';
          fillOpacity = 0.28;
        } else {
          fillColor = '#14b8a6'; // Teal (<8k hab - Moderada)
          strokeColor = '#0d9488';
          fillOpacity = 0.22;
        }
      } else {
        // Performance & Militancy scale
        if (completionRate >= 75) {
          fillColor = '#10b981'; // Emerald (>=75% - Meta Atingida)
          strokeColor = '#059669';
          fillOpacity = 0.30;
        } else if (completionRate >= 45) {
          fillColor = '#f59e0b'; // Amber (45-74% - Em Andamento)
          strokeColor = '#d97706';
          fillOpacity = 0.30;
        } else {
          fillColor = '#ef4444'; // Red (<45% - Área Crítica / Prioridade)
          strokeColor = '#dc2626';
          fillOpacity = 0.35;
        }
      }

      const polygon = L.polygon(bairro.polygon, {
        color: strokeColor,
        weight: strokeWidth,
        opacity: strokeOpacity,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        dashArray: isOtherWhenFiltered ? '4, 4' : undefined
      });

      if (isSelected) {
        polygon.bringToFront();
      }

      // Customized Popup content per layer
      let heatValPopup = 0;
      let maxVPopup = 1;
      let heatUnitLabel = '';
      if (heatMetric === 'checkins') {
        heatValPopup = chkCounts[bairro.id] || 0;
        maxVPopup = maxChk;
        heatUnitLabel = heatValPopup + ' check-ins';
      } else if (heatMetric === 'santinhos') {
        heatValPopup = bairro.deliveredMaterials?.santinhos || 0;
        maxVPopup = maxSant;
        heatUnitLabel = heatValPopup.toLocaleString('pt-BR') + ' santinhos';
      } else if (heatMetric === 'adesivos') {
        heatValPopup = (bairro.deliveredMaterials?.adesivo_bola || 0) + (bairro.deliveredMaterials?.adesivo_parachoque || 0) + (bairro.deliveredMaterials?.adesivos || 0);
        maxVPopup = maxAdes;
        heatUnitLabel = heatValPopup.toLocaleString('pt-BR') + ' adesivos';
      } else {
        heatValPopup = bairro.votersEstimated || 0;
        maxVPopup = maxEleit;
        heatUnitLabel = heatValPopup.toLocaleString('pt-BR') + ' eleitores';
      }
      const heatPct = Math.round((maxVPopup > 0 ? heatValPopup / maxVPopup : 0) * 100);

      const popupHtml = layerMode === 'mapa_calor' ? `
        <div class="p-2 space-y-2 text-slate-800 font-sans min-w-[220px]">
          <div class="flex items-center justify-between border-b border-orange-200 pb-1.5 bg-orange-50/80 -mx-2 -mt-2 p-2 rounded-t">
            <div class="flex items-center gap-1.5">
              <span class="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-xs border border-white" style="background-color: ${fillColor}"></span>
              <div>
                <span class="text-[9px] uppercase tracking-wider font-bold text-orange-700 block">
                  Mapa de Calor • ${heatMetric.toUpperCase()}
                </span>
                <h4 class="font-bold text-sm text-slate-900 leading-tight">${bairro.name}</h4>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-orange-700 border border-orange-200 shadow-xs">
              ${heatPct}% Calor
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs pt-1">
            <div class="p-1.5 rounded bg-orange-50/50 border border-orange-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">Métrica Selecionada:</p>
              <p class="font-bold text-orange-950 text-sm">${heatUnitLabel}</p>
            </div>
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">Check-ins Totais:</p>
              <p class="font-bold text-slate-900 text-sm">${chkCounts[bairro.id] || 0}</p>
            </div>
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">Santinhos Entregues:</p>
              <p class="font-bold text-slate-900 text-sm">${(bairro.deliveredMaterials?.santinhos || 0).toLocaleString('pt-BR')}</p>
            </div>
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">Adesivos Colados:</p>
              <p class="font-bold text-slate-900 text-sm">${((bairro.deliveredMaterials?.adesivo_bola || 0) + (bairro.deliveredMaterials?.adesivo_parachoque || 0)).toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <p class="text-[9px] text-slate-500 italic pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Eleitores TSE: <b>${bairro.votersEstimated.toLocaleString('pt-BR')}</b></span>
            <span class="font-semibold text-orange-700">Prioridade: ${bairro.priority}</span>
          </p>
        </div>
      ` : layerMode === 'atlas_pmsj' ? `
        <div class="p-2 space-y-2 text-slate-800 font-sans min-w-[220px]">
          <div class="flex items-center justify-between border-b border-slate-200 pb-1.5 bg-slate-50 -mx-2 -mt-2 p-2 rounded-t">
            <div class="flex items-center gap-1.5">
              <span class="w-3.5 h-3.5 rounded-full inline-block border border-black/30 shrink-0 shadow-xs" style="background-color: ${bairro.officialColor || '#3b82f6'}"></span>
              <div>
                <span class="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">
                  ${bairro.officialNumber ? `Nº ${bairro.officialNumber} • Mapa Oficial PMSJ` : 'Bairro Oficial PMSJ (2020)'}
                </span>
                <h4 class="font-bold text-sm text-slate-900 leading-tight">${bairro.name}</h4>
              </div>
            </div>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">${bairro.zone}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs pt-1">
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">População (Censo):</p>
              <p class="font-bold text-slate-900 text-sm">${bairro.population.toLocaleString('pt-BR')} hab.</p>
            </div>
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">Eleitores (TSE):</p>
              <p class="font-bold text-blue-700 text-sm">${bairro.votersEstimated.toLocaleString('pt-BR')}</p>
            </div>
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">Total de Ruas:</p>
              <p class="font-bold text-slate-800">${bairro.totalStreets} ruas</p>
            </div>
            <div class="p-1.5 rounded bg-slate-50 border border-slate-100">
              <p class="text-slate-500 text-[10px] uppercase font-semibold">Ruas Cobertas:</p>
              <p class="font-bold text-emerald-700">${bairro.completedStreets} (${Math.round((bairro.completedStreets / Math.max(bairro.totalStreets, 1)) * 100)}%)</p>
            </div>
          </div>
          <p class="text-[9px] text-slate-500 italic pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Atlas PMSJ (2020) • IFSC / IBGE</span>
            <span class="font-semibold text-slate-600">Prioridade: ${bairro.priority}</span>
          </p>
        </div>
      ` : layerMode === 'demografia_ibge' ? `
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
        setSelectedBairroFilter(bairro.id);
        setShowCheckins(true);
        setInspectedBairro(bairro);
        if (mapInstanceRef.current && bairro.polygon && bairro.polygon.length >= 3) {
          mapInstanceRef.current.fitBounds(L.polygon(bairro.polygon).getBounds(), { padding: [45, 45], maxZoom: 16 });
        }
        if (onSelectNeighborhood) onSelectNeighborhood(bairro);
      });

      layerGroup.addLayer(polygon);

      // 1.1 Render Labels on Center
      if (showLabels && (!isOtherWhenFiltered || selectedBairroFilter === 'todos')) {
        let labelHtml = '';
        if (layerMode === 'mapa_calor') {
          labelHtml = `
            <div class="px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-xs border ${isSelected ? 'border-rose-400 ring-2 ring-rose-300' : 'border-orange-300'} text-[11px] font-semibold text-slate-800 whitespace-nowrap shadow-xs flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${fillColor}"></span>
              <span class="${isSelected ? 'font-bold text-rose-700' : ''}">${bairro.name}</span>
              <span class="text-orange-700 font-bold font-mono text-[10px]">(${heatPct}% calor)</span>
            </div>
          `;
        } else if (layerMode === 'atlas_pmsj') {
          labelHtml = `
            <div class="px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-xs border ${isSelected ? 'border-rose-400 ring-2 ring-rose-300' : 'border-slate-300'} text-[11px] font-semibold text-slate-800 whitespace-nowrap shadow-xs flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0" style="background-color: ${bairro.officialColor || fillColor}"></span>
              ${bairro.officialNumber ? `<span class="bg-slate-800 text-white rounded-full text-[9px] w-3.5 h-3.5 flex items-center justify-center font-bold font-mono shrink-0">${bairro.officialNumber}</span>` : ''}
              <span class="${isSelected ? 'font-bold text-rose-700' : 'text-slate-800'}">${bairro.name}</span>
            </div>
          `;
        } else if (layerMode === 'demografia_ibge') {
          labelHtml = `
            <div class="px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-xs border ${isSelected ? 'border-rose-400 ring-2 ring-rose-300' : 'border-indigo-200'} text-[11px] font-semibold text-slate-800 whitespace-nowrap shadow-xs flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full" style="background-color: ${isSelected ? '#ef4444' : fillColor}"></span>
              <span class="${isSelected ? 'font-bold text-rose-700' : ''}">${bairro.name}</span>
              <span class="text-indigo-700 font-bold font-mono text-[10px]">(${(bairro.population / 1000).toFixed(1)}k hab)</span>
            </div>
          `;
        } else {
          labelHtml = `
            <div class="px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-xs border ${isSelected ? 'border-rose-400 ring-2 ring-rose-300' : 'border-slate-200'} text-[11px] font-semibold text-slate-800 whitespace-nowrap shadow-xs flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full" style="background-color: ${isSelected ? '#ef4444' : fillColor}"></span>
              <span class="${isSelected ? 'font-bold text-rose-700' : ''}">${bairro.name}</span>
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
    // 2. RENDER MILITANTES IN FIELD
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
    // 4. RENDER PRECISE STREET PINS (Posicionado exatamente na Rua cadastrada)
    // =========================================================================
    if (showCheckins) {
      const activeCheckIns = selectedBairroFilter === 'todos'
        ? checkIns
        : checkIns.filter(chk => chk.neighborhoodId === selectedBairroFilter);

      activeCheckIns.forEach((chk) => {
        // Calibrate precise position on the registered street
        const pos = getCalibratedCheckInPosition(chk, neighborhoods);
        const pinLat = pos.lat;
        const pinLng = pos.lng;
        const photosList = chk.photos || [];
        const photoCount = photosList.length;
        const militantObj = militants.find(m => m.id === chk.militantId);
        const formattedDate = formatDateTimeBR(chk.timestamp);

        // Render Elegant Street PIN
        const pinHtml = `
          <div class="relative group cursor-pointer flex flex-col items-center" style="transform: translate(-50%, -100%);">
            
            <!-- Pulse ring for visual attention -->
            <div class="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping"></div>
            
            <!-- Main Street Pin Badge -->
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 text-white shadow-xl ring-2 ring-white hover:scale-125 hover:ring-rose-300 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-xs">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              
              <!-- Multi-photo camera badge if photos exist -->
              ${photoCount > 0 ? `
                <div class="absolute -top-1.5 -left-1.5 px-1 py-0.5 bg-blue-600 text-white text-[8px] font-black rounded-full border border-white flex items-center gap-0.5 shadow-sm">
                  📷${photoCount > 1 ? `<span>${photoCount}</span>` : ''}
                </div>
              ` : ''}
              
              <!-- Checkmark badge -->
              <div class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white rounded-full border border-white flex items-center justify-center text-[8px] font-black shadow-xs">
                ✓
              </div>
            </div>

            <!-- Pin Stem Needle -->
            <div class="w-1.5 h-2 bg-gradient-to-b from-red-600 to-red-800 mx-auto -mt-0.5 rounded-b-full"></div>
            
            <!-- Street Name Capsule Tooltip on Hover -->
            <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap pointer-events-none shadow-md z-50">
              ${chk.streetName}
            </div>

          </div>
        `;

        const streetPinIcon = L.divIcon({
          className: 'custom-exact-street-pin',
          html: pinHtml,
          iconSize: [32, 38],
          iconAnchor: [16, 36]
        });

        // Multi-Photo HTML snippet for Leaflet popup
        let photosHtmlSection = '';
        if (photoCount > 0) {
          photosHtmlSection = `
            <div class="space-y-1 pt-1">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-slate-800 flex items-center gap-1">
                  📷 Fotos da Rua (${photoCount})
                </span>
                <span class="text-[10px] text-blue-600 font-semibold">Clique para ver fotos</span>
              </div>
              <div class="grid grid-cols-${Math.min(photoCount, 3)} gap-1 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 p-1">
                ${photosList.slice(0, 3).map((p, pIdx) => `
                  <div class="relative h-16 rounded overflow-hidden group/p cursor-pointer bg-black/5 border border-slate-200">
                    <img src="${p}" alt="Foto ${pIdx + 1}" class="w-full h-full object-cover hover:scale-105 transition duration-200" />
                    ${pIdx === 2 && photoCount > 3 ? `
                      <div class="absolute inset-0 bg-black/60 text-white flex items-center justify-center font-bold text-xs">
                        +${photoCount - 2}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }

        const popupHtml = `
          <div class="p-2.5 text-slate-800 space-y-2 max-w-[280px] font-sans">
            
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-rose-100 pb-1.5 bg-gradient-to-r from-rose-50 to-red-50 -mx-2.5 -mt-2.5 p-2.5 rounded-t">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                <span class="text-[10px] font-black uppercase tracking-wider text-red-700">Rua Registrada & Coberta</span>
              </div>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✓ Validado
              </span>
            </div>

            <!-- Street & Neighborhood Details -->
            <div>
              <h4 class="font-black text-sm text-slate-900 leading-tight">
                📍 ${chk.streetName}
              </h4>
              <p class="text-[11px] text-slate-600 font-medium mt-0.5">
                Bairro: <strong class="text-blue-700">${chk.neighborhoodName}</strong>
                ${chk.houseNumberRange ? `<span class="text-slate-500"> • ${chk.houseNumberRange}</span>` : ''}
              </p>
            </div>

            <!-- Photos Section -->
            ${photosHtmlSection}

            <!-- Militant info -->
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

            <!-- Materials count -->
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

            ${chk.observations ? `
              <p class="text-[11px] text-slate-600 italic bg-amber-50/70 p-1.5 rounded border border-amber-100">
                "${chk.observations}"
              </p>
            ` : ''}

            <!-- Footer links -->
            <div class="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100">
              <span class="font-mono">GPS: ${pinLat.toFixed(4)}, ${pinLng.toFixed(4)}</span>
              <a href="https://www.google.com/maps?q=${pinLat},${pinLng}" target="_blank" rel="noreferrer" class="text-blue-600 font-semibold hover:underline flex items-center gap-0.5">
                Abrir Mapa ↗
              </a>
            </div>

          </div>
        `;

        const marker = L.marker([pinLat, pinLng], { icon: streetPinIcon });
        marker.bindPopup(popupHtml, { maxWidth: 290 });
        marker.bindTooltip(`<b>Rua:</b> ${chk.streetName} (${chk.neighborhoodName})`, { sticky: true });
        
        // Open rich inspect drawer on click
        marker.on('click', () => {
          setInspectedCheckIn(chk);
          setActivePhotoIndex(0);
        });

        layerGroup.addLayer(marker);
      });
    }

  }, [neighborhoods, militants, vans, checkIns, layerMode, heatMetric, showVans, showMilitants, showCheckins, showLabels, selectedBairroFilter, onSelectNeighborhood]);

  const zoomToSaoJose = () => {
    setSelectedBairroFilter('todos');
    setInspectedBairro(null);
    setInspectedCheckIn(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(SAO_JOSE_CENTER, 13);
    }
  };

  const handleSaveEditedCheckIn = async (updated: StreetCheckIn) => {
    await StorageService.updateCheckIn(updated);
    setEditingCheckIn(null);
    setInspectedCheckIn(updated);
    if (onCheckInUpdated) {
      onCheckInUpdated();
    }
  };

  const totalPopulation = neighborhoods.reduce((acc, curr) => acc + curr.population, 0);
  const totalVoters = neighborhoods.reduce((acc, curr) => acc + curr.votersEstimated, 0);
  const totalStreets = neighborhoods.reduce((acc, curr) => acc + curr.totalStreets, 0);
  const totalCompletedStreets = neighborhoods.reduce((acc, curr) => acc + curr.completedStreets, 0);

  return (
    <div className="relative w-full h-[680px] lg:h-[750px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm flex flex-col">
      
      {/* Top Map Control & Layer Switcher Bar */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Layer Mode Switcher (Atlas Oficial PMSJ 2020 vs IBGE vs Performance) */}
        <div className="flex flex-wrap items-center gap-1 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200 shadow-md pointer-events-auto">
          <button
            type="button"
            onClick={() => setLayerMode('atlas_pmsj')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              layerMode === 'atlas_pmsj'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Mapa Oficial dos 28 Bairros de São José (PMSJ 2020 / Atlas Escolar IFSC / IBGE 2021)"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mapa Oficial PMSJ (2020)</span>
            <span className="sm:hidden">Oficial PMSJ</span>
          </button>

          <button
            type="button"
            onClick={() => setLayerMode('mapa_calor')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              layerMode === 'mapa_calor'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Mapa de Calor Térmico de Atividades, Ruas e Materiais em São José"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Mapa de Calor</span>
            <span className="sm:hidden">Calor</span>
          </button>

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
            <span className="hidden sm:inline">PINs de Ruas & Performance</span>
            <span className="sm:hidden">PINs de Ruas</span>
          </button>
        </div>

        {/* Floating Heatmap Metric Selector Toolbar */}
        {layerMode === 'mapa_calor' && (
          <div className="w-full flex items-center justify-between gap-2 bg-gradient-to-r from-orange-600/95 via-rose-600/95 to-red-600/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/25 shadow-lg pointer-events-auto text-white">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold tracking-wide">Métrica de Calor:</span>
            </div>
            <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setHeatMetric('checkins')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  heatMetric === 'checkins' ? 'bg-white text-rose-700 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                🔥 Ruas & Check-ins ({checkIns.length})
              </button>
              <button
                type="button"
                onClick={() => setHeatMetric('santinhos')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  heatMetric === 'santinhos' ? 'bg-white text-rose-700 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                📦 Santinhos
              </button>
              <button
                type="button"
                onClick={() => setHeatMetric('adesivos')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  heatMetric === 'adesivos' ? 'bg-white text-rose-700 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                🚗 Adesivos
              </button>
              <button
                type="button"
                onClick={() => setHeatMetric('eleitores')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  heatMetric === 'eleitores' ? 'bg-white text-rose-700 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                👥 Eleitores TSE
              </button>
            </div>
          </div>
        )}

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
              <option value="todos">Todos ({neighborhoods.length || 24} Bairros)</option>
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
              showCheckins ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-500 hover:bg-slate-50'
            }`}
            title="Exibir PINs Georreferenciados de Ruas Registradas"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">PINs de Ruas ({checkIns.length})</span>
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
        
        {layerMode === 'mapa_calor' ? (
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-rose-900 font-bold text-[11px] uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                Termômetro de Calor ({heatMetric.toUpperCase()})
              </div>
              <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">Tempo Real</span>
            </div>
            <div className="w-full h-3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 via-emerald-400 via-amber-400 via-orange-500 to-rose-600 shadow-inner mb-1" />
            <div className="flex justify-between text-[9px] font-bold text-slate-500 font-mono">
              <span>Frio</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100% Fogo</span>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 mt-1 flex items-center justify-between">
              <span>Halos no mapa: Ruas com Check-in</span>
              <span className="font-semibold text-rose-600">{checkIns.length} ruas batidas</span>
            </p>
          </div>
        ) : layerMode === 'atlas_pmsj' ? (
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px] uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                28 Bairros Oficiais • PMSJ (2020)
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">28 Bairros + Rural</span>
            </div>
            <p className="text-[10px] text-slate-600 mb-1.5">
              Limites cartografados conforme o Atlas Escolar de São José (PMSJ 2020 / IFSC / IBGE 2021).
            </p>
            <div className="flex items-center gap-3 text-[10px] text-slate-600 border-t border-slate-100 pt-1.5">
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[8px]">1</span> Flor de Nápolis
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[8px]">2</span> Jd. Cidade de Florianópolis
              </span>
            </div>
          </div>
        ) : layerMode === 'demografia_ibge' ? (
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
              PINs de Ruas & Performance de Campo
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
                <span className="w-3 h-3 rounded-full bg-red-600 border border-white text-[8px] flex items-center justify-center text-white">📍</span> PIN na Rua Cadastrada
              </span>
              <span className="flex items-center gap-1 font-semibold text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Militante Ativo
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span> Van
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Dynamic Bottom Right KPI Summary Card */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-md text-xs flex items-center gap-3 pointer-events-auto">
        {layerMode === 'mapa_calor' ? (
          <>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Ruas com Check-in</p>
              <p className="font-bold text-rose-600 text-sm">{checkIns.length} ruas ativas</p>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Territórios Oficiais</p>
              <p className="font-bold text-slate-900 text-sm">{neighborhoods.length} Bairros PMSJ</p>
            </div>
          </>
        ) : layerMode === 'demografia_ibge' ? (
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

      {/* Selected Neighborhood Drawer */}
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

      {/* Detailed Street Check-in Drawer with Multi-Photo Gallery */}
      {inspectedCheckIn && (
        <div className="absolute top-20 left-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-2xl text-xs space-y-3 pointer-events-auto w-[320px] sm:w-[360px] animate-in fade-in slide-in-from-left-4 max-h-[85%] overflow-y-auto">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-rose-100 text-rose-700">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Rua Registrada</span>
                <h4 className="font-bold text-sm text-slate-900 leading-tight">{inspectedCheckIn.streetName}</h4>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditingCheckIn(inspectedCheckIn)}
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                title="Editar dados ou fotos desta rua"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setInspectedCheckIn(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 space-y-1">
            <p>Bairro: <strong className="text-slate-900">{inspectedCheckIn.neighborhoodName}</strong></p>
            {inspectedCheckIn.houseNumberRange && (
              <p>Trecho / Numeração: <strong className="text-slate-800">{inspectedCheckIn.houseNumberRange}</strong></p>
            )}
            <p>Militante: <strong className="text-slate-900">{inspectedCheckIn.militantName}</strong></p>
            <p>Data & Horário: <strong className="text-slate-800 font-mono">{formatDateTimeBR(inspectedCheckIn.timestamp)}</strong></p>
          </div>

          {/* Multi-Photo Viewer & Gallery */}
          {inspectedCheckIn.photos && inspectedCheckIn.photos.length > 0 && (
            <div className="space-y-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  Fotos de Comprovação ({inspectedCheckIn.photos.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {activePhotoIndex + 1} de {inspectedCheckIn.photos.length}
                </span>
              </div>

              {/* Main Featured Photo Preview */}
              <div className="relative rounded-lg overflow-hidden border border-slate-200 h-44 bg-black group">
                <img
                  src={inspectedCheckIn.photos[activePhotoIndex] || inspectedCheckIn.photos[0]}
                  alt="Foto da Rua"
                  className="w-full h-full object-cover"
                />
                
                {/* Expand Zoom Button */}
                <button
                  type="button"
                  onClick={() => setExpandedPhotoModal(inspectedCheckIn.photos![activePhotoIndex] || inspectedCheckIn.photos![0])}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white shadow-md transition"
                  title="Ampliar Foto"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Left/Right controls if multi-photo */}
                {inspectedCheckIn.photos.length > 1 && (
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIndex(prev => (prev > 0 ? prev - 1 : inspectedCheckIn.photos!.length - 1));
                      }}
                      className="p-1 rounded-full bg-black/60 hover:bg-black/80 text-white pointer-events-auto transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIndex(prev => (prev < inspectedCheckIn.photos!.length - 1 ? prev + 1 : 0));
                      }}
                      className="p-1 rounded-full bg-black/60 hover:bg-black/80 text-white pointer-events-auto transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbnails row for multiple photos */}
              {inspectedCheckIn.photos.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {inspectedCheckIn.photos.map((ph, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                        activePhotoIndex === idx ? 'border-blue-600 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={ph} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Materials */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100">
              <span className="text-slate-500 block">Santinhos</span>
              <strong className="text-blue-800 text-xs font-mono">{inspectedCheckIn.materialsDelivered.santinhos}</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-100">
              <span className="text-slate-500 block">Abordagens</span>
              <strong className="text-purple-800 text-xs font-mono">{inspectedCheckIn.materialsDelivered.abordagens || 0}</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="text-slate-500 block">Comércio</span>
              <strong className="text-emerald-800 text-xs font-mono">{inspectedCheckIn.materialsDelivered.comercio || 0}</strong>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <a
              href={`https://www.google.com/maps?q=${inspectedCheckIn.latitude},${inspectedCheckIn.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Ver no Google Maps <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => setEditingCheckIn(inspectedCheckIn)}
              className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              Editar Rua
            </button>
          </div>

        </div>
      )}

      {/* Expanded Full-Resolution Photo Modal */}
      {expandedPhotoModal && (
        <div
          className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setExpandedPhotoModal(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={() => setExpandedPhotoModal(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={expandedPhotoModal}
              alt="Foto ampliada da rua"
              className="w-full h-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* Edit Street Modal (Accessible from Map) */}
      <EditStreetModal
        isOpen={!!editingCheckIn}
        checkIn={editingCheckIn}
        neighborhoods={neighborhoods}
        onClose={() => setEditingCheckIn(null)}
        onSave={handleSaveEditedCheckIn}
      />

    </div>
  );
};
