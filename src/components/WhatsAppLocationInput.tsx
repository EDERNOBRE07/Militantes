import React, { useState, useRef } from 'react';
import {
  Neighborhood
} from '../types';
import {
  parseWhatsAppLocationText,
  parseWhatsAppLocationFile,
  ParsedWhatsAppLocation
} from '../utils/whatsappLocationParser';
import {
  Upload,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clipboard,
  X,
  Smartphone,
  Navigation,
  FileText,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface WhatsAppLocationInputProps {
  neighborhoods: Neighborhood[];
  currentGps: { lat: number; lng: number; accuracy: number };
  onApplyLocation: (data: {
    lat: number;
    lng: number;
    accuracy?: number;
    neighborhoodId?: string;
    streetName?: string;
    houseNumberRange?: string;
    sourceSummary: string;
  }) => void;
}

export const WhatsAppLocationInput: React.FC<WhatsAppLocationInputProps> = ({
  neighborhoods,
  currentGps,
  onApplyLocation
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastParsed, setLastParsed] = useState<ParsedWhatsAppLocation | null>(null);
  const [feedback, setFeedback] = useState<{ isError: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessText = (textToParse: string) => {
    if (!textToParse.trim()) {
      setFeedback({
        isError: true,
        message: 'Por favor, cole um link de localização ou mensagem do WhatsApp.'
      });
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    try {
      const result = parseWhatsAppLocationText(textToParse, neighborhoods);
      setLastParsed(result);

      if (result.success && result.lat !== undefined && result.lng !== undefined) {
        setFeedback({
          isError: false,
          message: `Localização do WhatsApp identificada com sucesso! Coordenadas: ${result.lat.toFixed(5)}, ${result.lng.toFixed(5)}`
        });

        // Trigger parent callback to apply changes to form
        onApplyLocation({
          lat: result.lat,
          lng: result.lng,
          accuracy: result.accuracy || 3.5,
          neighborhoodId: result.suggestedNeighborhoodId,
          streetName: result.extractedStreet,
          houseNumberRange: result.extractedNumber ? `nº ${result.extractedNumber}` : undefined,
          sourceSummary: `WhatsApp (${result.suggestedNeighborhoodName || 'São José'})`
        });
      } else {
        setFeedback({
          isError: true,
          message: result.error || 'Não foi possível identificar coordenadas no texto fornecido.'
        });
      }
    } catch (err: any) {
      setFeedback({
        isError: true,
        message: err.message || 'Erro ao processar localização do WhatsApp.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setFeedback(null);

    try {
      const result = await parseWhatsAppLocationFile(file, neighborhoods);
      setLastParsed(result);

      if (result.success && result.lat !== undefined && result.lng !== undefined) {
        setFeedback({
          isError: false,
          message: `Arquivo do WhatsApp (${file.name}) processado com sucesso! Coordenadas: ${result.lat.toFixed(5)}, ${result.lng.toFixed(5)}`
        });

        onApplyLocation({
          lat: result.lat,
          lng: result.lng,
          accuracy: result.accuracy || 3.5,
          neighborhoodId: result.suggestedNeighborhoodId,
          streetName: result.extractedStreet,
          houseNumberRange: result.extractedNumber ? `nº ${result.extractedNumber}` : undefined,
          sourceSummary: `WhatsApp Arquivo: ${file.name}`
        });
      } else {
        setFeedback({
          isError: true,
          message: result.error || `Não foi possível ler as coordenadas do arquivo "${file.name}".`
        });
      }
    } catch (err: any) {
      setFeedback({
        isError: true,
        message: err.message || 'Erro ao ler arquivo do WhatsApp.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          setInputText(clipText);
          handleProcessText(clipText);
          return;
        }
      }
    } catch {
      // Clipboard API might be restricted by browser permissions
    }
    // Focus the textarea so the user can use Ctrl+V / Cmd+V directly
    document.getElementById('whatsapp-location-textarea')?.focus();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 transition-all shadow-xs">
      
      {/* Header toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          {/* WhatsApp style icon badge */}
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                Importar Localização do WhatsApp
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Link ou Arquivo .vcf / .txt
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Faça upload do arquivo de localização ou cole o link do Google Maps compartilhado pelo WhatsApp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isOpen
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
            }`}
          >
            {isOpen ? <X className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
            <span>{isOpen ? 'Recolher' : 'Upload / Colar Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Upload / Paste Section */}
      {isOpen && (
        <div className="mt-4 space-y-3.5 pt-3.5 border-t border-emerald-200/80 animate-in fade-in">
          
          {/* Top Options Tabs: Paste Text or File Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* 1. Paste WhatsApp Link / Text Box */}
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    Opção 1: Colar Link ou Mensagem do WhatsApp
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 transition"
                    title="Colar da Área de Transferência"
                  >
                    <Clipboard className="w-3 h-3" />
                    <span>Colar</span>
                  </button>
                </div>

                <textarea
                  id="whatsapp-location-textarea"
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Cole aqui o link do Google Maps enviado no WhatsApp (ex: https://maps.google.com/?q=-27.5962,-48.6190 ou texto da conversa)..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-slate-500">
                  Aceita links curtos, Google Maps, Apple Maps e texto
                </span>
                <button
                  type="button"
                  onClick={() => handleProcessText(inputText)}
                  disabled={isProcessing || !inputText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Aplicar Localização</span>
                </button>
              </div>
            </div>

            {/* 2. File Upload / Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-3.5 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-100/70 scale-[1.01]'
                  : 'border-emerald-300 bg-white hover:bg-emerald-50/50 hover:border-emerald-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".vcf,.txt,.gpx,.kml,.json,image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="p-2 rounded-full bg-emerald-100 text-emerald-700 mb-1.5">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Opção 2: Fazer Upload do Arquivo do WhatsApp
              </span>
              <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                Arraste ou clique para selecionar arquivo <strong className="text-slate-700">.vcf</strong> (vCard de localização), <strong className="text-slate-700">.txt</strong>, GPX ou foto.
              </p>
            </div>

          </div>

          {/* Quick Preset Location Samples for São José */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
            <span className="text-[11px] text-emerald-900 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Exemplos rápidos de São José:
            </span>
            {[
              { label: 'Kobrasol (Rua Koesa)', link: 'https://maps.google.com/?q=-27.596200,-48.619000 Rua Koesa, Kobrasol' },
              { label: 'Campinas (Pres. Kennedy)', link: 'https://maps.google.com/?q=-27.593800,-48.611500 Av. Presidente Kennedy, Campinas' },
              { label: 'Barreiros (Leoberto Leal)', link: 'https://maps.google.com/?q=-27.574500,-48.604000 Av. Leoberto Leal, Barreiros' },
              { label: 'Forquilhinhas (Arthur Mariano)', link: 'https://maps.google.com/?q=-27.608000,-48.641000 Rua Vereador Arthur Mariano, Forquilhinhas' }
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(preset.link);
                  handleProcessText(preset.link);
                }}
                className="text-[11px] px-2 py-0.5 rounded-md bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition font-medium"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Status Feedback */}
          {feedback && (
            <div className={`p-3 rounded-lg text-xs font-semibold flex items-start gap-2 ${
              feedback.isError
                ? 'bg-rose-50 border border-rose-200 text-rose-900'
                : 'bg-emerald-100 border border-emerald-300 text-emerald-950'
            }`}>
              {feedback.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span>{feedback.message}</span>
              </div>
            </div>
          )}

          {/* Last Parsed Location Card Details */}
          {lastParsed && lastParsed.success && (
            <div className="p-3 bg-white rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {lastParsed.suggestedNeighborhoodName || 'São José (SC)'}
                    </span>
                    {lastParsed.extractedStreet && (
                      <span className="text-slate-600 font-medium">
                        • {lastParsed.extractedStreet} {lastParsed.extractedNumber ? `(nº ${lastParsed.extractedNumber})` : ''}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Lat: {lastParsed.lat?.toFixed(6)}, Lng: {lastParsed.lng?.toFixed(6)} • Precisão: ±{lastParsed.accuracy}m
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`https://www.google.com/maps?q=${lastParsed.lat},${lastParsed.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                  title="Abrir no Google Maps"
                >
                  <ExternalLink className="w-3 h-3 text-blue-600" />
                  <span>Ver no Google Maps</span>
                </a>
              </div>
            </div>
          )}

        </div>
      )}

      {/* When closed, show small indicator if GPS coordinates are currently set */}
      {!isOpen && (
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 bg-white/70 px-2.5 py-1 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Ponto GPS Atual do Formulário: <strong className="font-mono text-slate-800">{currentGps.lat.toFixed(5)}, {currentGps.lng.toFixed(5)}</strong></span>
          </div>
          <span className="text-emerald-700 font-medium">Pronto para envio</span>
        </div>
      )}

    </div>
  );
};
