import React, { useEffect, useRef, useCallback, useState } from 'react';
import L from '../utils/leafletCluster';
import { Neighborhood, StreetCheckIn, BairroAction } from '../types';
import { StorageService } from '../services/storageService';
import { formatDateTimeBR } from '../utils/formatters';
import { getStreetRoadBedCoordinates } from '../utils/saoJoseStreetGeometries';
import { OFFICIAL_SAO_JOSE_NEIGHBORHOODS } from '../data/officialSaoJoseNeighborhoods';
import { getAllPhotosForCheckIn } from '../utils/neighborhoodHelpers';
import { RotateCcw, Layers, Sparkles } from 'lucide-react';

interface BairroInteractiveMapProps {
  mapId: string;
  bairro: Neighborhood;
  checkIns: StreetCheckIn[];
  actions?: BairroAction[];
  pinMap?: Record<string, number>;
  isGeneralMap?: boolean;
  qualifyingNeighborhoods?: Neighborhood[];
  height?: string;
  title?: string;
}

export const BairroInteractiveMap: React.FC<BairroInteractiveMapProps> = ({
  mapId,
  bairro,
  checkIns,
  actions,
  pinMap,
  isGeneralMap = false,
  qualifyingNeighborhoods = [],
  height = '380px',
  title
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const prevBairroIdRef = useRef<string | null>(null);
  const prevIsGeneralMapRef = useRef<boolean | null>(null);

  // Controle de agrupamento de densidade com Leaflet MarkerCluster
  const [useMarkerCluster, setUseMarkerCluster] = useState<boolean>(true);

  // Ações do bairro (ou todas em mapa geral)
  const bActions = actions || (isGeneralMap ? StorageService.getBairroActions() : StorageService.getBairroActionsByNeighborhood(bairro.id));

  // 1. Inicializa o mapa Leaflet UMA ÚNICA VEZ na montagem do contêiner
  useEffect(() => {
    if (!containerRef.current) return;

    // Se já existe um mapa neste container, destrói com segurança antes de criar
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch {}
      mapRef.current = null;
    }

    const initialLat = bairro.lat || -27.5962;
    const initialLng = bairro.lng || -48.6190;

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: isGeneralMap ? 13 : 15,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
      touchZoom: true
    });

    // Camada de alta resolução Google Maps (sem travas ou marca d'água obstrutiva)
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      crossOrigin: true
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapRef.current = map;

    // Invalida tamanho após montagem para renderizar os blocos sem distorção
    const t = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 150);

    return () => {
      clearTimeout(t);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, [mapId]);

  // Função para recentralizar o mapa nos limites do bairro
  const fitMapToBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (isGeneralMap) {
      const allBoundsPoints: [number, number][] = [];
      qualifyingNeighborhoods.forEach(n => {
        const official = OFFICIAL_SAO_JOSE_NEIGHBORHOODS.find(
          o => o.id === n.id || o.name.toLowerCase() === n.name.toLowerCase()
        );
        const polyCoords = (official?.polygon || (n as any).polygon || []) as [number, number][];
        if (polyCoords && Array.isArray(polyCoords) && polyCoords.length > 0) {
          polyCoords.forEach(pt => {
            if (pt && !isNaN(Number(pt[0])) && !isNaN(Number(pt[1]))) {
              allBoundsPoints.push([Number(pt[0]), Number(pt[1])]);
            }
          });
        }
      });
      checkIns.forEach(c => {
        if (c.latitude && c.longitude) {
          allBoundsPoints.push([c.latitude, c.longitude]);
        }
      });

      if (allBoundsPoints.length > 0) {
        map.fitBounds(L.latLngBounds(allBoundsPoints), { padding: [35, 35], maxZoom: 15 });
      } else {
        map.setView([-27.5962, -48.6190], 13);
      }
    } else {
      const targetBounds: [number, number][] = [];
      if (checkIns.length > 0) {
        checkIns.forEach(c => {
          if (c.latitude && c.longitude) {
            targetBounds.push([c.latitude, c.longitude]);
          }
          const streetCoords = getStreetRoadBedCoordinates(c.id, c.streetName, c.latitude, c.longitude);
          streetCoords.forEach(pt => targetBounds.push(pt));
        });
      }

      const official = OFFICIAL_SAO_JOSE_NEIGHBORHOODS.find(
        o => o.id === bairro.id || o.name.toLowerCase() === bairro.name.toLowerCase()
      );
      const polyCoords = (official?.polygon || (bairro as any).polygon || []) as [number, number][];
      if (polyCoords && Array.isArray(polyCoords) && polyCoords.length > 0) {
        polyCoords.forEach(pt => {
          if (pt && !isNaN(Number(pt[0])) && !isNaN(Number(pt[1]))) {
            targetBounds.push([Number(pt[0]), Number(pt[1])]);
          }
        });
      }

      if (targetBounds.length > 0) {
        map.fitBounds(L.latLngBounds(targetBounds), {
          padding: [30, 30],
          maxZoom: 16
        });
      } else {
        const centerLat = bairro.lat || -27.5962;
        const centerLng = bairro.lng || -48.6190;
        map.setView([centerLat, centerLng], 15);
      }
    }
  }, [bairro, checkIns, isGeneralMap, qualifyingNeighborhoods]);

  // 2. Atualiza os dados (polígonos, linhas vermelhas e pins) SEM destruir o mapa e SEM resetar o zoom
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Limpa apenas as camadas anteriores (não destrói o mapa nem o zoom!)
    layerGroup.clearLayers();

    if (isGeneralMap) {
      // Desenha as delimitações oficiais de todos os bairros qualificados
      qualifyingNeighborhoods.forEach(n => {
        const official = OFFICIAL_SAO_JOSE_NEIGHBORHOODS.find(
          o => o.id === n.id || o.name.toLowerCase() === n.name.toLowerCase()
        );
        const polyCoords = (official?.polygon || (n as any).polygon || []) as [number, number][];
        if (polyCoords && Array.isArray(polyCoords) && polyCoords.length > 2) {
          const color = official?.officialColor || '#2563eb';
          const poly = L.polygon(polyCoords, {
            color,
            weight: 2.5,
            dashArray: '6, 5',
            fillColor: color,
            fillOpacity: 0.08
          });
          poly.bindTooltip(`<strong>${n.name}</strong><br/>${n.zone}`, {
            sticky: true,
            className: 'text-xs'
          });
          layerGroup.addLayer(poly);
        }
      });
    } else {
      // Delimitação oficial específica deste bairro
      const official = OFFICIAL_SAO_JOSE_NEIGHBORHOODS.find(
        o => o.id === bairro.id || o.name.toLowerCase() === bairro.name.toLowerCase()
      );
      const polyCoords = (official?.polygon || (bairro as any).polygon || []) as [number, number][];
      if (polyCoords && Array.isArray(polyCoords) && polyCoords.length > 2) {
        const color = official?.officialColor || '#2563eb';
        const poly = L.polygon(polyCoords, {
          color,
          weight: 3.5,
          dashArray: '8, 6',
          fillColor: color,
          fillOpacity: 0.12
        });
        poly.bindTooltip(`<strong>Área Delimitada Oficial</strong><br/>${bairro.name}`, {
          sticky: true,
          className: 'text-xs'
        });
        layerGroup.addLayer(poly);
      }
    }

    // Criação do grupo de agrupamento MarkerCluster para áreas densas
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 38,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: true,
      animate: true,
      iconCreateFunction: (cluster) => {
        const childMarkers = cluster.getAllChildMarkers();
        const count = cluster.getChildCount();
        const hasActions = childMarkers.some(m => (m as any)._isAction);
        const hasCheckins = childMarkers.some(m => !(m as any)._isAction);

        let typeClass = 'cluster-small';
        if (hasActions && !hasCheckins) {
          typeClass = 'cluster-actions';
        } else if (hasActions && hasCheckins) {
          typeClass = 'cluster-mixed';
        } else if (count >= 20) {
          typeClass = 'cluster-large';
        } else if (count >= 8) {
          typeClass = 'cluster-medium';
        }

        const size = count >= 20 ? 44 : (count >= 8 ? 38 : 34);

        return L.divIcon({
          html: `
            <div class="custom-cluster-badge ${typeClass}" style="width: ${size}px; height: ${size}px;">
              <span class="cluster-count">${count}</span>
              <span class="cluster-sub">${hasActions && !hasCheckins ? 'ações' : (hasActions ? 'itens' : 'ruas')}</span>
            </div>
          `,
          className: 'custom-leaflet-cluster-wrap',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        });
      }
    });

    // Desenha as ruas sinalizadas e pintadas em vermelho brilhante sobre o leito viário (100% de todas as ruas sinalizadas)
    checkIns.forEach((chk, index) => {
      const streetCoords = getStreetRoadBedCoordinates(
        chk.id,
        chk.streetName,
        chk.latitude,
        chk.longitude
      );

      const glowLine = L.polyline(streetCoords, {
        color: '#ef4444',
        weight: 8,
        opacity: 0.55,
        lineCap: 'round',
        lineJoin: 'round'
      });

      const coreLine = L.polyline(streetCoords, {
        color: '#dc2626',
        weight: 4.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      });

      const photos = getAllPhotosForCheckIn(chk);
      const firstPhoto = photos.length > 0 ? photos[0] : null;
      const pinNumber = (pinMap && pinMap[chk.id]) ? pinMap[chk.id] : (index + 1);

      const popupContent = `
        <div class="p-2.5 text-slate-800 space-y-2 max-w-[260px] font-sans">
          <div class="flex items-center justify-between border-b border-rose-100 pb-1.5 bg-gradient-to-r from-rose-50 to-red-50 -mx-2.5 -mt-2.5 p-2 rounded-t">
            <span class="text-[10px] font-bold uppercase text-red-700">📍 #${pinNumber} • ${chk.neighborhoodName || bairro.name}</span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Validado</span>
          </div>
          <h4 class="font-black text-sm text-slate-900 leading-tight">🛣️ ${chk.streetName}</h4>
          ${firstPhoto ? `<img src="${firstPhoto}" class="w-full h-24 object-cover rounded-lg border border-slate-200 mt-1 shadow-2xs" />` : ''}
          <div class="p-1.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-0.5">
            <p><strong>Militante:</strong> ${chk.militantName}</p>
            <p><strong>Data:</strong> ${formatDateTimeBR(chk.timestamp).split(' ')[0]}</p>
            <p><strong>Abordagens:</strong> ${chk.materialsDelivered.abordagens || 0} pessoas</p>
            <p class="text-[10px] text-blue-700 font-semibold">📷 ${photos.length} foto(s) anexada(s)</p>
          </div>
        </div>
      `;

      coreLine.bindPopup(popupContent, { maxWidth: 280 });
      glowLine.bindPopup(popupContent, { maxWidth: 280 });

      layerGroup.addLayer(glowLine);
      layerGroup.addLayer(coreLine);

      // Pino sequencial numerado no ponto exato do check-in
      if (chk.latitude && chk.longitude) {
        const pinIcon = L.divIcon({
          className: 'custom-militancia-pin',
          html: `<div style="background: linear-gradient(135deg, #ef4444, #b91c1c); color: #ffffff; font-weight: 900; font-size: 11px; width: 24px; height: 24px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont;">${pinNumber}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([chk.latitude, chk.longitude], { icon: pinIcon });
        (marker as any)._isAction = false;
        marker.bindPopup(popupContent, { maxWidth: 280 });
        marker.bindTooltip(`<strong>#${pinNumber}</strong> ${chk.streetName}`, { sticky: true, className: 'text-xs' });

        if (useMarkerCluster) {
          clusterGroup.addLayer(marker);
        } else {
          layerGroup.addLayer(marker);
        }
      }
    });

    // Renderiza ações do bairro no mapa (praças, feiras, caminhadas)
    bActions.forEach((act) => {
      const actLat = act.latitude || (bairro.lat ? bairro.lat + (Math.sin(act.id.charCodeAt(0) || 1) * 0.003) : -27.5962);
      const actLng = act.longitude || (bairro.lng ? bairro.lng + (Math.cos(act.id.charCodeAt(1) || 2) * 0.003) : -48.6190);

      const actionIcon = L.divIcon({
        className: 'custom-action-report-pin',
        html: `
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef); color: #ffffff; font-weight: 900; font-size: 11px; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(99,102,241,0.5); display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ✨
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const actionPopup = `
        <div class="p-2.5 text-slate-800 space-y-1.5 max-w-[260px] font-sans">
          <div class="flex items-center justify-between border-b border-indigo-100 pb-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 -mx-2.5 -mt-2.5 p-2 rounded-t">
            <span class="text-[10px] font-bold uppercase text-indigo-700">✨ Ação no Bairro</span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">Concluída</span>
          </div>
          <h4 class="font-bold text-sm text-slate-900">${act.locationName || 'Mobilização Comunitária'}</h4>
          <p class="text-xs text-slate-600">Bairro: <strong class="text-indigo-700">${act.neighborhoodName}</strong></p>
          <div class="text-xs text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 space-y-0.5">
            <p>👥 <strong>Pessoas estimadas:</strong> ${act.estimatedPeople || 0}</p>
            ${act.materialsDistributed?.santinhos ? `<p>📦 <strong>Santinhos:</strong> ${act.materialsDistributed.santinhos}</p>` : ''}
            ${act.address ? `<p class="truncate">📍 ${act.address}</p>` : ''}
          </div>
        </div>
      `;

      const actMarker = L.marker([actLat, actLng], { icon: actionIcon });
      (actMarker as any)._isAction = true;
      actMarker.bindPopup(actionPopup, { maxWidth: 280 });
      actMarker.bindTooltip(`<strong>✨ ${act.locationName || act.neighborhoodName}</strong>`, { sticky: true, className: 'text-xs' });

      if (useMarkerCluster) {
        clusterGroup.addLayer(actMarker);
      } else {
        layerGroup.addLayer(actMarker);
      }
    });

    if (useMarkerCluster) {
      layerGroup.addLayer(clusterGroup);
    }

    // REGRA DE OURO PARA ZOOM ESTÁVEL:
    // Apenas ajusta o enquadramento (fitBounds) se o bairro mudou, se o modo mudou ou na 1ª vez!
    // Se o usuário estiver apenas interagindo com o mapa (zoom in/out, arrastando ou clicando em pinos),
    // a posição e o zoom atuais são PRESERVADOS sem retornar à posição inicial!
    const isFirstTime = prevBairroIdRef.current === null;
    const bairroChanged = prevBairroIdRef.current !== bairro.id;
    const modeChanged = prevIsGeneralMapRef.current !== isGeneralMap;

    if (isFirstTime || bairroChanged || modeChanged) {
      prevBairroIdRef.current = bairro.id;
      prevIsGeneralMapRef.current = isGeneralMap;
      fitMapToBounds();
    }
  }, [bairro.id, checkIns, bActions, useMarkerCluster, pinMap, isGeneralMap, qualifyingNeighborhoods, fitMapToBounds]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-white">
      {title && (
        <div className="bg-white px-3.5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
              {title}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle Leaflet MarkerCluster */}
            <button
              type="button"
              onClick={() => setUseMarkerCluster(!useMarkerCluster)}
              title="Alternar Agrupamento Inteligente de Marcadores (Leaflet MarkerCluster)"
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition shadow-2xs cursor-pointer ${
                useMarkerCluster
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${useMarkerCluster ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>{useMarkerCluster ? 'Cluster Ativo' : 'Pins Individuais'}</span>
            </button>

            <button
              onClick={fitMapToBounds}
              title="Centralizar mapa no bairro"
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Centralizar</span>
            </button>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
              {checkIns.length} ruas sinalizadas
            </span>
          </div>
        </div>
      )}
      <div
        id={mapId}
        ref={containerRef}
        style={{ height }}
        className="w-full z-0"
      />
      {/* Botões flutuantes no canto superior direito do mapa (se não houver barra de título) */}
      {!title && (
        <div className="absolute top-2.5 right-2.5 z-[1000] flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setUseMarkerCluster(!useMarkerCluster)}
            title="Alternar Agrupamento MarkerCluster"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border shadow-md text-xs font-bold transition cursor-pointer ${
              useMarkerCluster
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white/95 text-slate-700 border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>{useMarkerCluster ? 'Cluster' : 'Pins'}</span>
          </button>
          <button
            onClick={fitMapToBounds}
            title="Centralizar enquadramento no bairro"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 border border-slate-200 shadow-md text-xs font-bold transition cursor-pointer hover:shadow-lg"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Centralizar</span>
          </button>
        </div>
      )}
      {/* Legenda de Mapa Sobreposta */}
      <div className="absolute bottom-2.5 left-2.5 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] shadow-sm text-slate-700 flex items-center gap-3 pointer-events-none">
        <div className="flex items-center gap-1.5 font-bold text-rose-700">
          <span className="w-3 h-1 bg-red-600 rounded-sm"></span> Ruas Auditadas
        </div>
        <div className="flex items-center gap-1.5 font-bold text-indigo-700">
          <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Ações ({bActions.length})
        </div>
      </div>
    </div>
  );
};
