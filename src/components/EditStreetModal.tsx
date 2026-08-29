import React, { useState, useEffect } from 'react';
import { StreetCheckIn, Neighborhood, MaterialCount } from '../types';
import { parseWhatsAppLocationText } from '../utils/whatsappLocationParser';
import {
  X,
  MapPin,
  Camera,
  Upload,
  Trash2,
  Compass,
  FileText,
  CheckSquare,
  Disc,
  Layers,
  MessageSquare,
  Store,
  ExternalLink,
  Plus,
  Minus,
  Save,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Globe,
  Sparkles,
  Navigation,
  Calendar,
  Clock
} from 'lucide-react';

interface EditStreetModalProps {
  isOpen: boolean;
  checkIn: StreetCheckIn | null;
  neighborhoods: Neighborhood[];
  onClose: () => void;
  onSave: (updatedCheckIn: StreetCheckIn) => Promise<void> | void;
}

export const EditStreetModal: React.FC<EditStreetModalProps> = ({
  isOpen,
  checkIn,
  neighborhoods,
  onClose,
  onSave
}) => {
  if (!isOpen || !checkIn) return null;

  const [streetName, setStreetName] = useState(checkIn.streetName || '');
  const [houseNumberRange, setHouseNumberRange] = useState(checkIn.houseNumberRange || '');
  const [neighborhoodId, setNeighborhoodId] = useState(checkIn.neighborhoodId || neighborhoods[0]?.id || '');
  const [latitude, setLatitude] = useState<number>(checkIn.latitude || -27.5962);
  const [longitude, setLongitude] = useState<number>(checkIn.longitude || -48.6190);
  const [accuracyMeters, setAccuracyMeters] = useState<number>(checkIn.accuracyMeters || 5);
  const [photos, setPhotos] = useState<string[]>(checkIn.photos || []);
  const [materials, setMaterials] = useState<MaterialCount>({
    santinhos: checkIn.materialsDelivered?.santinhos || 0,
    adesivos: checkIn.materialsDelivered?.adesivos || 0,
    adesivo_bola: checkIn.materialsDelivered?.adesivo_bola || 0,
    adesivo_parachoque: checkIn.materialsDelivered?.adesivo_parachoque || 0,
    colinhas: checkIn.materialsDelivered?.colinhas || 0,
    abordagens: checkIn.materialsDelivered?.abordagens || 0,
    comercio: checkIn.materialsDelivered?.comercio || 0
  });
  const [observations, setObservations] = useState(checkIn.observations || '');
  const [status, setStatus] = useState<StreetCheckIn['status']>(checkIn.status || 'validado');
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Date and Time State (Day/Month/Year and 24h Hours & Minutes 00-59)
  const parseInitialTimestamp = (ts: string) => {
    let year = 2026;
    let month = 8;
    let day = 28;
    let hours = 18;
    let minutes = 30;
    let seconds = 0;

    if (ts) {
      // Check for ISO or YYYY-MM-DD HH:mm:ss format
      const isoMatch = ts.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
      if (isoMatch) {
        year = parseInt(isoMatch[1], 10);
        month = parseInt(isoMatch[2], 10);
        day = parseInt(isoMatch[3], 10);
        hours = parseInt(isoMatch[4], 10);
        minutes = parseInt(isoMatch[5], 10);
        seconds = isoMatch[6] ? parseInt(isoMatch[6], 10) : 0;
      } else {
        // Check for DD/MM/YYYY HH:mm:ss
        const brMatch = ts.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
        if (brMatch) {
          day = parseInt(brMatch[1], 10);
          month = parseInt(brMatch[2], 10);
          year = parseInt(brMatch[3], 10);
          hours = parseInt(brMatch[4], 10);
          minutes = parseInt(brMatch[5], 10);
          seconds = brMatch[6] ? parseInt(brMatch[6], 10) : 0;
        } else {
          const d = new Date(ts);
          if (!isNaN(d.getTime())) {
            year = d.getFullYear();
            month = d.getMonth() + 1;
            day = d.getDate();
            hours = d.getHours();
            minutes = d.getMinutes();
            seconds = d.getSeconds();
          }
        }
      }
    }

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      dateStr,
      hours: Math.max(0, Math.min(23, hours)),
      minutes: Math.max(0, Math.min(59, minutes)),
      seconds: Math.max(0, Math.min(59, seconds))
    };
  };

  const initialTime = parseInitialTimestamp(checkIn.timestamp);
  const [recordDate, setRecordDate] = useState<string>(initialTime.dateStr);
  const [recordHours, setRecordHours] = useState<number>(initialTime.hours);
  const [recordMinutes, setRecordMinutes] = useState<number>(initialTime.minutes);
  const [recordSeconds, setRecordSeconds] = useState<number>(initialTime.seconds);

  // Google Maps link input & location edit states
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [googleMapsUrlInput, setGoogleMapsUrlInput] = useState('');
  const [locationFeedback, setLocationFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Sync state if incoming checkIn changes
  useEffect(() => {
    if (checkIn) {
      setStreetName(checkIn.streetName);
      setHouseNumberRange(checkIn.houseNumberRange || '');
      setNeighborhoodId(checkIn.neighborhoodId);
      setLatitude(checkIn.latitude);
      setLongitude(checkIn.longitude);
      setAccuracyMeters(checkIn.accuracyMeters || 5);
      setPhotos(checkIn.photos ? [...checkIn.photos] : []);
      setMaterials({
        santinhos: checkIn.materialsDelivered?.santinhos || 0,
        adesivos: checkIn.materialsDelivered?.adesivos || 0,
        adesivo_bola: checkIn.materialsDelivered?.adesivo_bola || 0,
        adesivo_parachoque: checkIn.materialsDelivered?.adesivo_parachoque || 0,
        colinhas: checkIn.materialsDelivered?.colinhas || 0,
        abordagens: checkIn.materialsDelivered?.abordagens || 0,
        comercio: checkIn.materialsDelivered?.comercio || 0
      });
      const parsedTime = parseInitialTimestamp(checkIn.timestamp);
      setRecordDate(parsedTime.dateStr);
      setRecordHours(parsedTime.hours);
      setRecordMinutes(parsedTime.minutes);
      setRecordSeconds(parsedTime.seconds);
      setObservations(checkIn.observations || '');
      setStatus(checkIn.status || 'validado');
      setErrorMsg(null);
      setShowLinkInput(false);
      setGoogleMapsUrlInput('');
      setLocationFeedback(null);
    }
  }, [checkIn]);

  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    setErrorMsg(null);
    setLocationFeedback(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocalização não suportada no navegador.');
      setIsCapturingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setAccuracyMeters(Number(pos.coords.accuracy.toFixed(1)));
        setIsCapturingGps(false);
        setLocationFeedback({
          type: 'success',
          text: `Coordenadas atualizadas via GPS do dispositivo: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`
        });
      },
      (err) => {
        console.warn('GPS error in edit modal:', err);
        setLatitude(-27.5962);
        setLongitude(-48.6190);
        setAccuracyMeters(10);
        setIsCapturingGps(false);
        setLocationFeedback({
          type: 'error',
          text: 'Não foi possível obter o sinal de GPS. Aplicado centro de São José.'
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleApplyGoogleMapsLink = () => {
    if (!googleMapsUrlInput.trim()) {
      setLocationFeedback({
        type: 'error',
        text: 'Por favor, cole um link do Google Maps ou coordenadas.'
      });
      return;
    }

    const parsed = parseWhatsAppLocationText(googleMapsUrlInput, neighborhoods);
    if (!parsed.success || parsed.lat === undefined || parsed.lng === undefined) {
      setLocationFeedback({
        type: 'error',
        text: parsed.error || 'Não foi possível extrair coordenadas do link fornecido.'
      });
      return;
    }

    setLatitude(Number(parsed.lat.toFixed(6)));
    setLongitude(Number(parsed.lng.toFixed(6)));
    setAccuracyMeters(parsed.accuracy || 3);

    const feedbackParts = [`Localização atualizada: Lat ${parsed.lat.toFixed(6)}, Lng ${parsed.lng.toFixed(6)}.`];

    // If street name was detected in Google Maps URL (e.g. /place/R.+Águas+de+Chapecó)
    if (parsed.extractedStreet && parsed.extractedStreet.length > 2) {
      setStreetName(parsed.extractedStreet);
      feedbackParts.push(`Rua identificada: "${parsed.extractedStreet}".`);
    }

    // If neighborhood was detected
    if (parsed.suggestedNeighborhoodId) {
      setNeighborhoodId(parsed.suggestedNeighborhoodId);
      if (parsed.suggestedNeighborhoodName) {
        feedbackParts.push(`Bairro identificado: ${parsed.suggestedNeighborhoodName}.`);
      }
    }

    setLocationFeedback({
      type: 'success',
      text: feedbackParts.join(' ')
    });
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotos(prev => [...prev, event.target!.result as string]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleIncrementMaterial = (key: keyof MaterialCount, delta: number) => {
    setMaterials(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta)
    }));
  };

  const handleSetCurrentDateTime = () => {
    const now = new Date();
    const yr = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const da = String(now.getDate()).padStart(2, '0');
    setRecordDate(`${yr}-${mo}-${da}`);
    setRecordHours(now.getHours());
    setRecordMinutes(now.getMinutes());
    setRecordSeconds(now.getSeconds());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetName.trim()) {
      setErrorMsg('O nome da rua é obrigatório.');
      return;
    }

    setIsSaving(true);
    try {
      const selectedNeigh = neighborhoods.find(n => n.id === neighborhoodId) || neighborhoods[0];

      // Format clean timestamp YYYY-MM-DD HH:mm:ss
      const safeHours = Math.max(0, Math.min(23, Number(recordHours) || 0));
      const safeMinutes = Math.max(0, Math.min(59, Number(recordMinutes) || 0));
      const safeSeconds = Math.max(0, Math.min(59, Number(recordSeconds) || 0));
      const safeDate = recordDate && recordDate.includes('-') ? recordDate : '2026-08-28';
      const formattedTimestamp = `${safeDate} ${String(safeHours).padStart(2, '0')}:${String(safeMinutes).padStart(2, '0')}:${String(safeSeconds).padStart(2, '0')}`;

      const updated: StreetCheckIn = {
        ...checkIn,
        streetName: streetName.trim(),
        houseNumberRange: houseNumberRange.trim() || 'Trecho Geral',
        neighborhoodId: selectedNeigh?.id || neighborhoodId,
        neighborhoodName: selectedNeigh?.name || checkIn.neighborhoodName,
        timestamp: formattedTimestamp,
        latitude,
        longitude,
        accuracyMeters,
        photos: photos.length > 0 ? photos : checkIn.photos,
        materialsDelivered: { ...materials },
        observations: observations.trim(),
        status
      };

      await onSave(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg('Erro ao salvar alterações da rua: ' + (err?.message || 'Tente novamente'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Editar Registro de Rua
              </h3>
              <p className="text-xs text-slate-500">
                Militante: <strong className="text-slate-800">{checkIn.militantName}</strong> • {checkIn.neighborhoodName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nome da Rua & Bairro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome da Rua / Avenida *
              </label>
              <input
                type="text"
                required
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                placeholder="Ex: Av. Presidente Kennedy"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bairro de São José *
              </label>
              <select
                value={neighborhoodId}
                onChange={(e) => setNeighborhoodId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              >
                {neighborhoods.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.zone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Faixa de Numeração / Trecho
              </label>
              <input
                type="text"
                value={houseNumberRange}
                onChange={(e) => setHouseNumberRange(e.target.value)}
                placeholder="Ex: nº 100 ao 450"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Data e Horário da Ação de Rua (Dia, Mês, Ano e Horas 24h / Minutos 00 a 59) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Data & Horário do Registro (24 Horas)
              </span>
              <button
                type="button"
                onClick={handleSetCurrentDateTime}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                title="Preencher com a data e hora atual"
              >
                <Clock className="w-3 h-3 text-blue-600" />
                <span>Definir Agora</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              {/* Data (Dia / Mês / Ano) */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Data do Registro (Dia / Mês / Ano) *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Horário no formato 24h: Horas (00-23) e Minutos (00-59) */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Horário Oficial (Horas 24h : Minutos 00-59) *
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-xl px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={recordHours}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setRecordHours(isNaN(val) ? 0 : Math.max(0, Math.min(23, val)));
                      }}
                      className="w-full text-center text-sm font-bold text-slate-900 bg-transparent outline-none"
                      title="Horas (00 a 23)"
                      placeholder="HH"
                    />
                    <span className="text-xs text-slate-400 font-medium ml-1">h</span>
                  </div>

                  <span className="text-slate-400 font-bold">:</span>

                  <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-xl px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={recordMinutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setRecordMinutes(isNaN(val) ? 0 : Math.max(0, Math.min(59, val)));
                      }}
                      className="w-full text-center text-sm font-bold text-slate-900 bg-transparent outline-none"
                      title="Minutos (00 a 59)"
                      placeholder="MM"
                    />
                    <span className="text-xs text-slate-400 font-medium ml-1">min</span>
                  </div>

                  <span className="text-slate-400 font-bold">:</span>

                  <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-xl px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={recordSeconds}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setRecordSeconds(isNaN(val) ? 0 : Math.max(0, Math.min(59, val)));
                      }}
                      className="w-full text-center text-sm font-bold text-slate-900 bg-transparent outline-none"
                      title="Segundos (00 a 59)"
                      placeholder="SS"
                    />
                    <span className="text-xs text-slate-400 font-medium ml-1">s</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Formatado: <strong className="text-slate-800 font-mono">{recordDate ? recordDate.split('-').reverse().join('/') : '28/08/2026'} às {String(recordHours).padStart(2, '0')}:{String(recordMinutes).padStart(2, '0')}:{String(recordSeconds).padStart(2, '0')}</strong>
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                Horário 24h Válido
              </span>
            </div>
          </div>

          {/* Localização GPS & Coordenadas */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                Localização & GPS da Rua
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    showLinkInput 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                      : 'bg-white hover:bg-slate-100 text-blue-700 border-blue-300'
                  }`}
                  title="Editar localização colando um link do Google Maps ou WhatsApp"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>{showLinkInput ? 'Ocultar Link' : 'Editar Localização (Google Maps)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCaptureGps}
                  disabled={isCapturingGps}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Capturar GPS ao vivo do dispositivo"
                >
                  <Compass className={`w-3 h-3 ${isCapturingGps ? 'animate-spin' : ''}`} />
                  <span>{isCapturingGps ? 'GPS...' : 'GPS Atual'}</span>
                </button>
              </div>
            </div>

            {/* Google Maps Link / WhatsApp URL Input Box */}
            {showLinkInput && (
              <div className="p-3 rounded-xl bg-white border border-blue-200 shadow-2xs space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    Colar Link do Google Maps / WhatsApp
                  </label>
                  <span className="text-[10px] text-slate-500">Extrai coordenadas, rua e bairro</span>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={googleMapsUrlInput}
                    onChange={(e) => setGoogleMapsUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyGoogleMapsLink();
                      }
                    }}
                    placeholder="Cole aqui o link do Google Maps (ex: https://www.google.com/maps/place/R.+Águas+de+Chapecó...)"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyGoogleMapsLink}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Aplicar</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  💡 Aceita links do <strong>Google Maps</strong> (ex: <span className="font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded text-slate-700">/place/R.+Águas+de+Chapecó...</span>), links encurtados (<span className="font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded text-slate-700">maps.app.goo.gl</span>), links do WhatsApp ou coordenadas puras (<span className="font-mono text-[9px] bg-slate-100 px-1 py-0.5 rounded text-slate-700">-27.569179, -48.614417</span>).
                </p>
              </div>
            )}

            {/* Feedback message for Location / Link parsing */}
            {locationFeedback && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-start gap-2 border ${
                  locationFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {locationFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{locationFeedback.text}</span>
              </div>
            )}

            {/* Latitude & Longitude Numeric Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span className="font-mono">Precisão estimada: ±{accuracyMeters}m</span>
              <a
                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                Ver no Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Fotos de Comprovação */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                Fotos de Comprovação de Campo ({photos.length})
              </label>
              <span className="text-[11px] text-slate-500">Incluir nova foto ou excluir anteriores</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {photos.map((p, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 h-24 bg-slate-100 shadow-2xs">
                  <img src={p} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-700 transition cursor-pointer"
                    title="Remover esta foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Botão para Enviar Nova Foto */}
              <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition p-2 text-center">
                <Upload className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-xs font-semibold text-slate-800">Adicionar Foto</span>
                <span className="text-[10px] text-slate-400">Câmera / Galeria</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleAddPhoto}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Abordagens & Comércios */}
          <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-200/80 space-y-3">
            <span className="text-xs font-bold text-blue-950 uppercase tracking-wider block">
              Abordagens & Comércios Atendidos
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Abordagens */}
              <div className="p-2.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Abordagens</span>
                    <span className="text-[10px] text-slate-500">Eleitores</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleIncrementMaterial('abordagens', -1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    value={materials.abordagens || 0}
                    onChange={(e) => setMaterials({ ...materials, abordagens: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-12 bg-white border border-slate-300 rounded-md py-0.5 text-center text-xs font-bold text-purple-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleIncrementMaterial('abordagens', 1)}
                    className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Comércio */}
              <div className="p-2.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Comércio</span>
                    <span className="text-[10px] text-slate-500">Lojas</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleIncrementMaterial('comercio', -1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    value={materials.comercio || 0}
                    onChange={(e) => setMaterials({ ...materials, comercio: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-12 bg-white border border-slate-300 rounded-md py-0.5 text-center text-xs font-bold text-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleIncrementMaterial('comercio', 1)}
                    className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Materiais Gráficos */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Materiais Gráficos Entregues
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Santinhos */}
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Santinhos</span>
                <input
                  type="number"
                  value={materials.santinhos}
                  onChange={(e) => setMaterials({ ...materials, santinhos: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full bg-white border border-slate-300 rounded-lg py-1 text-center text-xs font-bold text-blue-700"
                />
              </div>

              {/* Colinhas */}
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Colinhas</span>
                <input
                  type="number"
                  value={materials.colinhas}
                  onChange={(e) => setMaterials({ ...materials, colinhas: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full bg-white border border-slate-300 rounded-lg py-1 text-center text-xs font-bold text-indigo-700"
                />
              </div>

              {/* Adesivo Bola */}
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Adesivo Bola</span>
                <input
                  type="number"
                  value={materials.adesivo_bola}
                  onChange={(e) => setMaterials({ ...materials, adesivo_bola: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full bg-white border border-slate-300 rounded-lg py-1 text-center text-xs font-bold text-purple-700"
                />
              </div>

              {/* Adesivo Parachoque */}
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Parachoque</span>
                <input
                  type="number"
                  value={materials.adesivo_parachoque}
                  onChange={(e) => setMaterials({ ...materials, adesivo_parachoque: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full bg-white border border-slate-300 rounded-lg py-1 text-center text-xs font-bold text-amber-700"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações / Detalhes da Rua
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ex: Trecho concluído com boa aceitação comercial."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Status de Auditoria */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Status de Validação:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StreetCheckIn['status'])}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="validado">✓ Validado</option>
              <option value="pendente_auditoria">⏳ Pendente de Auditoria</option>
              <option value="rejeitado">✕ Rejeitado</option>
            </select>
          </div>

        </form>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações da Rua'}
          </button>
        </div>

      </div>
    </div>
  );
};
