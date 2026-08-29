import React, { useState, useEffect } from 'react';
import { StreetCheckIn, Neighborhood, MaterialCount } from '../types';
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
  AlertCircle
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
      setObservations(checkIn.observations || '');
      setStatus(checkIn.status || 'validado');
      setErrorMsg(null);
    }
  }, [checkIn]);

  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    setErrorMsg(null);

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
      },
      (err) => {
        console.warn('GPS error in edit modal:', err);
        // Fallback São José
        setLatitude(-27.5962);
        setLongitude(-48.6190);
        setAccuracyMeters(10);
        setIsCapturingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetName.trim()) {
      setErrorMsg('O nome da rua é obrigatório.');
      return;
    }

    setIsSaving(true);
    try {
      const selectedNeigh = neighborhoods.find(n => n.id === neighborhoodId) || neighborhoods[0];

      const updated: StreetCheckIn = {
        ...checkIn,
        streetName: streetName.trim(),
        houseNumberRange: houseNumberRange.trim() || 'Trecho Geral',
        neighborhoodId: selectedNeigh?.id || neighborhoodId,
        neighborhoodName: selectedNeigh?.name || checkIn.neighborhoodName,
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

          {/* Localização GPS & Coordenadas */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                Localização & GPS da Rua
              </span>
              <button
                type="button"
                onClick={handleCaptureGps}
                disabled={isCapturingGps}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Compass className={`w-3 h-3 ${isCapturingGps ? 'animate-spin' : ''}`} />
                {isCapturingGps ? 'Obtendo GPS...' : 'Atualizar com GPS Atual'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Precisão estimada: ±{accuracyMeters}m</span>
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
