import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Neighborhood, StreetCheckIn } from '../types';
import { formatDateTimeBR } from '../utils/formatters';
import { getStreetRoadBedCoordinates } from '../utils/saoJoseStreetGeometries';
import { OFFICIAL_SAO_JOSE_NEIGHBORHOODS } from '../data/officialSaoJoseNeighborhoods';
import { getAllPhotosForCheckIn } from '../utils/neighborhoodHelpers';

interface BairroInteractiveMapProps {
  mapId: string;
  bairro: Neighborhood;
  checkIns: StreetCheckIn[];
  isGeneralMap?: boolean;
  qualifyingNeighborhoods?: Neighborhood[];
  height?: string;
  title?: string;
}

export const BairroInteractiveMap: React.FC<BairroInteractiveMapProps> = ({
  mapId,
  bairro,
  checkIns,
  isGeneralMap = false,
  qualifyingNeighborhoods = [],
  height = '380px',
  title
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Remove existing map if previously mounted
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
      attributionControl: false
    });

    // Camada de alta resolução Google Maps
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      crossOrigin: true
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

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

    // Desenha as ruas sinalizadas e pintadas em vermelho brilhante sobre o leito viário
    checkIns.forEach(chk => {
      const streetCoords = getStreetRoadBedCoordinates(
        chk.id,
        chk.streetName,
        chk.latitude,
        chk.longitude
      );

      // Linha de brilho vermelho (glow) sobre o leito viário
      const glowLine = L.polyline(streetCoords, {
        color: '#ef4444',
        weight: 12,
        opacity: 0.5,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Linha central nítida em vermelho escarlate exatamente no leito da via
      const coreLine = L.polyline(streetCoords, {
        color: '#dc2626',
        weight: 5.5,
        opacity: 1.0,
        lineCap: 'round',
        lineJoin: 'round'
      });

      const photos = getAllPhotosForCheckIn(chk);
      const firstPhoto = photos.length > 0 ? photos[0] : null;

      const popupContent = `
        <div class="p-2.5 text-slate-800 space-y-2 max-w-[260px] font-sans">
          <div class="flex items-center justify-between border-b border-rose-100 pb-1.5 bg-gradient-to-r from-rose-50 to-red-50 -mx-2.5 -mt-2.5 p-2 rounded-t">
            <span class="text-[10px] font-bold uppercase text-red-700">📍 ${chk.neighborhoodName || bairro.name}</span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Validado</span>
          </div>
          <h4 class="font-black text-sm text-slate-900 leading-tight">🛣️ ${chk.streetName}</h4>
          ${firstPhoto ? `<img src="${firstPhoto}" class="w-full h-24 object-cover rounded-lg border border-slate-200 mt-1 shadow-2xs" />` : ''}
          <div class="p-1.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-0.5">
            <p><strong>Militante:</strong> ${chk.militantName}</p>
            <p><strong>Data:</strong> ${formatDateTimeBR(chk.timestamp)}</p>
            <p><strong>Materiais:</strong> ${chk.materialsDelivered.santinhos} santinhos | ${chk.materialsDelivered.abordagens || 0} abordagens</p>
            <p class="text-[10px] text-blue-700 font-semibold">📷 ${photos.length} foto(s) anexada(s)</p>
          </div>
        </div>
      `;

      glowLine.bindPopup(popupContent, { maxWidth: 280 });
      coreLine.bindPopup(popupContent, { maxWidth: 280 });
      layerGroup.addLayer(glowLine);
      layerGroup.addLayer(coreLine);

      // Pin vermelho estilizado com checkmark
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

    // Auto-ajuste de limites (fitBounds) territorial dos bairros qualificados
    if (isGeneralMap) {
      const allBoundsPoints: [number, number][] = [];
      // Inclui coordenadas dos polígonos oficiais dos bairros qualificados
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
      // Inclui coordenadas GPS dos check-ins com ruas auditadas
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
      // 1. Zoom in estrito para visualizar na janela do mapa apenas a região do bairro selecionado
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

      if (targetBounds.length > 0) {
        map.fitBounds(L.latLngBounds(targetBounds), {
          padding: [30, 30],
          maxZoom: 17
        });
        if (map.getZoom() < 16) {
          map.setZoom(16);
        }
      } else {
        const centerLat = bairro.lat || initialLat;
        const centerLng = bairro.lng || initialLng;
        map.setView([centerLat, centerLng], 16);
      }
    }

    mapRef.current = map;

    // Invalida tamanho após montagem para renderizar os blocos corretamente
    const t = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 200);

    return () => {
      clearTimeout(t);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }
    };
  }, [bairro, checkIns, isGeneralMap, qualifyingNeighborhoods]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-white">
      {title && (
        <div className="bg-white px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
              {title}
            </h4>
          </div>
          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
            {checkIns.length} ruas sinalizadas
          </span>
        </div>
      )}
      <div
        id={mapId}
        ref={containerRef}
        style={{ height }}
        className="w-full z-0"
      />
      {/* Legenda de Mapa Sobreposta */}
      <div className="absolute bottom-2.5 left-2.5 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] shadow-sm text-slate-700 space-y-0.5 pointer-events-none">
        <div className="flex items-center gap-1.5 font-bold text-rose-700">
          <span className="w-3 h-1 bg-red-600 rounded-sm"></span> Ruas Auditadas (Linha Vermelha)
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <span className="text-xs">📍</span> Pins Georreferenciados (GPS)
        </div>
      </div>
    </div>
  );
};
