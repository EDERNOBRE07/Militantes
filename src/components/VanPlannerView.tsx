import React, { useState } from 'react';
import {
  Van,
  CampaignCalendarDay,
  Neighborhood,
  Team,
  VanRouteLog
} from '../types';
import { StorageService } from '../services/storageService';
import {
  Truck,
  Calendar,
  Phone,
  MessageCircle,
  Navigation,
  Plus,
  MapPin,
  Camera,
  Trash2,
  CheckCircle2,
  Clock,
  Users,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

interface VanPlannerViewProps {
  vans: Van[];
  calendarDays: CampaignCalendarDay[];
  neighborhoods: Neighborhood[];
  teams: Team[];
  onUpdateCalendarDay: (day: CampaignCalendarDay) => void;
}

export const VanPlannerView: React.FC<VanPlannerViewProps> = ({
  vans,
  calendarDays,
  neighborhoods,
  teams
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-26');
  const [routeLogs, setRouteLogs] = useState<VanRouteLog[]>(() => StorageService.getVanRouteLogs());
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<string | null>(null);

  // Form State for new Van Route Check-In
  const [vLogVanId, setVLogVanId] = useState(vans[0]?.id || 'van-01');
  const [vLogPeriod, setVLogPeriod] = useState<'manha' | 'tarde' | 'integral'>('manha');
  const [vLogNeighborhoodId, setVLogNeighborhoodId] = useState(neighborhoods[0]?.id || 'kobrasol');
  const [vLogStreets, setVLogStreets] = useState('');
  const [vLogLatitude, setVLogLatitude] = useState(-27.5962);
  const [vLogLongitude, setVLogLongitude] = useState(-48.6190);
  const [vLogPassengers, setVLogPassengers] = useState(14);
  const [vLogStatus, setVLogStatus] = useState<VanRouteLog['checkInStatus']>('em_andamento');
  const [vLogNotes, setVLogNotes] = useState('');
  const [vLogPhotos, setVLogPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80'
  ]);
  const [isGettingGps, setIsGettingGps] = useState(false);

  const currentDay = calendarDays.find(d => d.date === selectedDate) || calendarDays[0];

  const getBairroNames = (ids: string[]) => {
    return ids.map(id => neighborhoods.find(n => n.id === id)?.name || id).join(', ');
  };

  const getTeamNames = (ids: string[]) => {
    return ids.map(id => teams.find(t => t.id === id)?.name || id).join(' • ');
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada neste navegador.');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setVLogLatitude(pos.coords.latitude);
        setVLogLongitude(pos.coords.longitude);
        setIsGettingGps(false);
      },
      (err) => {
        console.warn('GPS Error:', err);
        // Fallback default coordinates in São José
        setVLogLatitude(-27.5962);
        setVLogLongitude(-48.6190);
        setIsGettingGps(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setVLogPhotos(prev => [reader.result as string, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveRouteLog = (e: React.FormEvent) => {
    e.preventDefault();
    const vanObj = vans.find(v => v.id === vLogVanId) || vans[0];
    const neighObj = neighborhoods.find(n => n.id === vLogNeighborhoodId) || neighborhoods[0];

    const streetsArr = vLogStreets
      .split(/,|\n/)
      .map(s => s.trim())
      .filter(Boolean);

    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const newLog: VanRouteLog = {
      id: `route-log-${Date.now()}`,
      vanId: vanObj.id,
      vanName: vanObj.name,
      vanPlate: vanObj.plate,
      driverName: vanObj.driverName,
      driverPhone: vanObj.driverPhone,
      period: vLogPeriod,
      shift: vLogPeriod,
      date: selectedDate,
      timestamp: timestampStr,
      neighborhoodId: neighObj.id,
      neighborhoodName: neighObj.name,
      streetsCovered: streetsArr.length > 0 ? streetsArr : ['Ruas centrais do bairro'],
      streetRoute: streetsArr.join(', '),
      latitude: vLogLatitude,
      longitude: vLogLongitude,
      photos: vLogPhotos.length > 0 ? vLogPhotos : ['https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80'],
      passengersCount: vLogPassengers,
      checkInStatus: vLogStatus,
      status: vLogStatus === 'concluido' ? 'concluido' : 'em_rota',
      notes: vLogNotes || `Desembarque de equipe no bairro ${neighObj.name}.`
    };

    StorageService.addVanRouteLog(newLog);
    setRouteLogs(StorageService.getVanRouteLogs());
    setShowLogModal(false);
  };

  const handleDeleteRouteLog = (id: string) => {
    if (confirm('Deseja excluir este registro de rota de van?')) {
      StorageService.deleteVanRouteLog(id);
      setRouteLogs(StorageService.getVanRouteLogs());
    }
  };

  const filteredLogs = routeLogs.filter(r => r.date === selectedDate || !r.date);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Logistics Overview */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
              Logística de Transporte & Frota
            </span>
            <span className="text-xs text-slate-500 font-medium">São José - SC</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Planejador de Rotas de Van & Calendário</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Programação diária para transporte e desembarque das equipes de militantes em todos os bairros de São José até 03/10/2026.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex-wrap">
          <div className="text-center px-2">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Frota Ativa</p>
            <p className="text-base font-bold text-cyan-700">{vans.length} Vans</p>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="text-center px-2">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Dias de Campanha</p>
            <p className="text-base font-bold text-slate-900">39 Dias</p>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="text-center px-2">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Capacidade</p>
            <p className="text-base font-bold text-emerald-700">51 Lugares</p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm transition ml-2"
          >
            <Plus className="w-4 h-4" />
            Novo Registro de Rota / Van
          </button>
        </div>
      </div>

      {/* Real-time Fleet Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {vans.map(van => (
          <div key={van.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{van.name}</h3>
                  <span className="text-[11px] text-slate-500">{van.plate} • {van.capacity} lugares</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                van.status === 'em_rota' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                van.status === 'desembarque' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
              }`}>
                {van.status.replace('_', ' ')}
              </span>
            </div>

            <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <p>👤 <strong>Motorista:</strong> {van.driverName}</p>
              <p>🎯 <strong>Próximo Ponto:</strong> {van.nextPickupLocation}</p>
              <p>⏰ <strong>Horário Previsto:</strong> <strong className="text-blue-700 font-semibold">{van.nextPickupTime}</strong></p>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <a
                href={`tel:${van.driverPhone}`}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition"
              >
                <Phone className="w-3.5 h-3.5 text-cyan-600" />
                <span>{van.driverPhone}</span>
              </a>
              <button
                onClick={() => alert(`Enviando mensagem via rádio/WhatsApp para o motorista ${van.driverName}: "Atenção Van ${van.plate}, equipe aguardando no ponto de encontro."`)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[11px] transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                Chamar Van
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive 39-Day Campaign Calendar Ribbon */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Cronograma Completo de Cobertura (26/08/2026 até 03/10/2026)</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">39 Dias de Operação</span>
        </div>

        {/* Scrollable Day Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {calendarDays.map(day => {
            const isSelected = day.date === selectedDate;
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDate(day.date)}
                className={`shrink-0 p-2.5 rounded-lg border text-left transition flex flex-col items-center justify-center min-w-[90px] ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold opacity-80">{day.dayOfWeek.split('-')[0]}</span>
                <span className="text-sm font-bold my-0.5">
                  {day.date.split('-')[2]}/{day.date.split('-')[1]}
                </span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' :
                  day.status === 'concluido' ? 'bg-emerald-100 text-emerald-800' :
                  day.status === 'em_andamento' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  Dia {day.dayNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Logistics Detail Card */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs">
                Dia {currentDay.dayNumber} de 39
              </span>
              <span className="font-bold text-slate-900 text-base">
                {currentDay.date.split('-')[2]}/{currentDay.date.split('-')[1]}/{currentDay.date.split('-')[0]} ({currentDay.dayOfWeek})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Bairros Alvo: <strong className="text-slate-800">{getBairroNames(currentDay.targetNeighborhoodIds)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Meta de Ruas</span>
              <strong className="text-slate-900 text-sm">{currentDay.expectedStreetGoal} ruas</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Meta Materiais</span>
              <strong className="text-blue-700 text-sm">{currentDay.expectedMaterialsGoal.toLocaleString('pt-BR')} un.</strong>
            </div>
          </div>
        </div>

        {/* Assigned Teams */}
        <div className="text-xs space-y-1">
          <span className="text-slate-500 font-semibold uppercase text-[10px]">Equipes Convocadas:</span>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium">
            {getTeamNames(currentDay.teamsAssigned)}
          </div>
        </div>

        {/* Van Schedules for the Day */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            Itinerário e Pontos de Desembarque das Vans
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDay.vanRoutePlan.map((route, idx) => {
              const assignedVan = vans.find(v => v.id === route.vanId) || vans[0];
              return (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-blue-700">{assignedVan.name}</span>
                    <span className="text-slate-500 font-medium">Motorista: {assignedVan.driverName}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        A
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Saída do Comitê Central ({route.departureTime})</p>
                        <p className="text-slate-900 font-medium">{route.pickupPoint}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        B
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Desembarque no Bairro</p>
                        <p className="text-slate-900 font-medium">{route.dropoffPoint}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        C
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Horário de Resgate / Retorno</p>
                        <p className="text-slate-900 font-medium">{route.returnTime} - Ponto a combinar via rádio</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-slate-600 text-[11px]">
                    <strong className="text-slate-800">Instruções Táticas:</strong> {route.coordinatorNotes}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Van Route Check-In History */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-600" />
              Check-ins e Histórico de Rotas Executadas ({filteredLogs.length})
            </h3>
            <button
              onClick={() => setShowLogModal(true)}
              className="text-xs text-blue-700 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Check-in de Van
            </button>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-400 text-xs">
              Nenhuma rota de van registrada para este dia. Clique no botão acima para registrar.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLogs.map(log => (
                <div key={log.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{log.vanName}</h4>
                      <p className="text-xs text-slate-500">
                        Motorista: <strong>{log.driverName}</strong> ({log.driverPhone || 'Sem telefone'})
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.period === 'manha' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        log.period === 'tarde' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {log.period}
                      </span>
                      <button
                        onClick={() => handleDeleteRouteLog(log.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Excluir Registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <strong>Bairro:</strong> {log.neighborhoodName}
                    </p>
                    <p className="flex items-start gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                      <span><strong>Ruas:</strong> {log.streetsCovered?.join(', ') || log.streetRoute || 'Rotas gerais'}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span><strong>Passageiros:</strong> {log.passengersCount || 14} militantes transportados</span>
                    </p>
                    {log.notes && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                        "{log.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      GPS: {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-1">
                      {log.photos && log.photos.map((photo, pIdx) => (
                        <img
                          key={pIdx}
                          src={photo}
                          alt="Foto Rota"
                          onClick={() => setSelectedPhotoZoom(photo)}
                          className="w-7 h-7 rounded object-cover cursor-pointer ring-1 ring-slate-200 hover:opacity-80"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal: New Van Route Check-In */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-600" />
                Registrar Rota & Desembarque de Van
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRouteLog} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Van / Frota *</label>
                  <select
                    value={vLogVanId}
                    onChange={(e) => setVLogVanId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  >
                    {vans.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.driverName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Turno / Período *</label>
                  <select
                    value={vLogPeriod}
                    onChange={(e) => setVLogPeriod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  >
                    <option value="manha">Manhã (08:00 - 12:30)</option>
                    <option value="tarde">Tarde (13:30 - 18:00)</option>
                    <option value="integral">Integral (Dia Todo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bairro de Operação *</label>
                  <select
                    value={vLogNeighborhoodId}
                    onChange={(e) => setVLogNeighborhoodId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  >
                    {neighborhoods.map(n => (
                      <option key={n.id} value={n.id}>{n.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Passageiros Transportados</label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={vLogPassengers}
                    onChange={(e) => setVLogPassengers(parseInt(e.target.value) || 14)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ruas Percorridas / Pontos de Desembarque *</label>
                <textarea
                  required
                  rows={2}
                  value={vLogStreets}
                  onChange={(e) => setVLogStreets(e.target.value)}
                  placeholder="Ex: Av. Lédio João Martins, Rua Koesa, Praça Central"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs outline-none"
                />
              </div>

              {/* GPS Coordinates Button */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="block font-semibold text-slate-800 text-[11px]">Coordenadas GPS de Desembarque:</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Lat: {vLogLatitude.toFixed(5)}, Lng: {vLogLongitude.toFixed(5)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGetGPS}
                  disabled={isGettingGps}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {isGettingGps ? 'Obtendo GPS...' : 'Capturar GPS'}
                </button>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Foto Comprobatória do Desembarque</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition border border-slate-300">
                    <Camera className="w-4 h-4 text-blue-600" />
                    Tirar / Anexar Foto
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {vLogPhotos.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {vLogPhotos.map((p, idx) => (
                        <img key={idx} src={p} alt="Preview" className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-300" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações do Motorista / Coordenação</label>
                <input
                  type="text"
                  value={vLogNotes}
                  onChange={(e) => setVLogNotes(e.target.value)}
                  placeholder="Ex: Equipe desembarcada às 08:30 no ponto da praça."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-sm"
                >
                  Salvar Rota de Van
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Zoom Modal */}
      {selectedPhotoZoom && (
        <div
          onClick={() => setSelectedPhotoZoom(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-2xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl max-h-[85vh] bg-white rounded-xl p-3 border border-slate-200 shadow-xl">
            <img src={selectedPhotoZoom} alt="Foto Ampliada" className="max-h-[75vh] w-auto rounded-lg object-contain" />
            <p className="text-xs text-slate-500 text-center py-2">Clique em qualquer lugar para fechar</p>
          </div>
        </div>
      )}

    </div>
  );
};
