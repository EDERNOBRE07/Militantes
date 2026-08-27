import React from 'react';
import {
  Neighborhood,
  Militant,
  Team,
  Van,
  StockItem,
  StreetCheckIn,
  User
} from '../types';
import {
  TrendingUp,
  MapPin,
  Users,
  FileText,
  Truck,
  Sparkles,
  ArrowRight,
  Disc,
  Clock,
  CheckCircle2,
  Tag,
  Banknote
} from 'lucide-react';
import { CoverageLineChart } from './CoverageLineChart';

interface DashboardViewProps {
  currentUser: User;
  neighborhoods: Neighborhood[];
  militants: Militant[];
  teams: Team[];
  vans: Van[];
  stock: StockItem[];
  checkIns: StreetCheckIn[];
  onNavigateTab: (tab: string) => void;
  onOpenAiAdvisor: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  neighborhoods,
  militants,
  teams,
  vans,
  checkIns,
  onNavigateTab,
  onOpenAiAdvisor
}) => {
  const totalStreets = neighborhoods.reduce((sum, n) => sum + n.totalStreets, 0);
  const completedStreets = neighborhoods.reduce((sum, n) => sum + n.completedStreets, 0);
  const coveragePercent = ((completedStreets / totalStreets) * 100).toFixed(1);

  const totalVoters = neighborhoods.reduce((sum, n) => sum + n.votersEstimated, 0);
  
  const totalSantinhosDelivered = neighborhoods.reduce((sum, n) => sum + n.deliveredMaterials.santinhos, 0);
  const totalAdesivoBolaDelivered = neighborhoods.reduce((sum, n) => sum + n.deliveredMaterials.adesivo_bola, 0);
  const totalColinhasDelivered = neighborhoods.reduce((sum, n) => sum + n.deliveredMaterials.colinhas, 0);

  const activeMilitants = militants.filter(m => m.status === 'em_campo').length;
  const activeTeams = teams.filter(t => t.status === 'em_campo').length;
  const totalKmWalked = militants.reduce((sum, m) => sum + m.totalKmWalked, 0).toFixed(1);

  // Sort neighborhoods by completion rate ascending to highlight priority bottlenecks
  const sortedBairros = [...neighborhoods].sort((a, b) => {
    const rateA = a.completedStreets / a.totalStreets;
    const rateB = b.completedStreets / b.totalStreets;
    return rateA - rateB;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Campaign Status & Countdown (Clean Minimalism) */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                Painel Estratégico de Campanha
              </span>
              <span className="text-xs text-slate-500 font-medium">São José - Santa Catarina</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Controle de Militância & Cobertura Territorial
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Monitoramento da distribuição de materiais rua a rua em todos os 18 bairros com dados oficiais do Censo IBGE, validação com foto por GPS e logística de vans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('campo')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition"
            >
              <MapPin className="w-4 h-4" />
              Novo Check-in de Campo
            </button>
            <button
              onClick={onOpenAiAdvisor}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs shadow-sm transition"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              IA Estrategista
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Cobertura Total */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cobertura de Ruas</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{coveragePercent}%</span>
              <span className="text-xs text-emerald-600 font-semibold">+4.2% nesta semana</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <strong className="text-slate-700">{completedStreets}</strong> de {totalStreets} ruas de São José percorridas
            </p>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Alcance Eleitoral IBGE */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Eleitores Impactados</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {Math.round(totalVoters * (Number(coveragePercent) / 100)).toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-slate-500 font-medium">de {totalVoters.toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Eleitores potenciais estimados (Censo IBGE)
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Santinhos & Materiais Entregues */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Santinhos Entregues</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {totalSantinhosDelivered.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-emerald-700 font-semibold">unidades</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              + {totalColinhasDelivered.toLocaleString('pt-BR')} colinhas | {totalAdesivoBolaDelivered.toLocaleString('pt-BR')} adesivos bola
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-600 font-medium">
              <Disc className="w-3.5 h-3.5 text-emerald-600" />
              <span>Adesivos Perfurite: {totalAdesivoBolaDelivered.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Força de Campo & Logística */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operação de Campo</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{activeMilitants} Militantes</span>
              <span className="text-xs text-amber-700 font-semibold">ativos</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeTeams} Equipes ativas • {vans.length} Vans em apoio
            </p>
            <div className="flex items-center justify-between mt-3 text-[11px] text-slate-600">
              <span>Distância percorrida:</span>
              <strong className="text-slate-900 font-semibold">{totalKmWalked} km</strong>
            </div>
          </div>
        </div>

      </div>

      {/* 4-Week Street Coverage Evolution Chart (Recharts) */}
      <CoverageLineChart
        neighborhoods={neighborhoods}
        checkIns={checkIns}
      />

      {/* Main Grid: Bairros Priority Breakdown & Live Field Check-in Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Bairros Progress and Target Status */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Cobertura Territorial por Bairro (Censo IBGE)</h3>
                <p className="text-xs text-slate-500">Progresso de entrega de materiais em todas as ruas cadastradas</p>
              </div>
              <button
                onClick={() => onNavigateTab('mapa')}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Abrir Mapa de Calor
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2 max-h-[420px] overflow-y-auto pr-1">
              {sortedBairros.map(bairro => {
                const pct = (bairro.completedStreets / bairro.totalStreets) * 100;
                return (
                  <div key={bairro.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 px-2.5 rounded-lg transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        pct >= 75 ? 'bg-emerald-500' : (pct >= 45 ? 'bg-amber-500' : 'bg-rose-500')
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">{bairro.name}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                            {bairro.zone}
                          </span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            bairro.priority === 'Alta' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {bairro.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {bairro.population.toLocaleString('pt-BR')} hab. • {bairro.votersEstimated.toLocaleString('pt-BR')} eleitores
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800">{bairro.completedStreets}</span>
                        <span className="text-slate-400"> / {bairro.totalStreets} ruas</span>
                        <div className="text-[11px] text-slate-500">
                          {bairro.deliveredMaterials.santinhos.toLocaleString('pt-BR')} santinhos
                        </div>
                      </div>

                      <div className="w-24">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-700">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              pct >= 75 ? 'bg-emerald-500' : (pct >= 45 ? 'bg-amber-500' : 'bg-rose-500')
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Live Field Activity Feed */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-base text-slate-900">Atividades de Campo</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Tempo Real</span>
            </div>

            <div className="space-y-3 mt-3 max-h-[420px] overflow-y-auto pr-1">
              {checkIns.map(chk => (
                <div key={chk.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {chk.neighborhoodName}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {chk.timestamp.substring(11, 16)}
                    </span>
                  </div>

                  <p className="text-slate-900 font-medium">{chk.streetName}</p>
                  
                  <div className="text-[11px] text-slate-600">
                    Militante: <strong className="text-slate-800">{chk.militantName}</strong>
                  </div>

                  {/* Photo thumbnail */}
                  {chk.photos && chk.photos.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {chk.photos.map((p, idx) => (
                        <img
                          key={idx}
                          src={p}
                          alt="Comprovação de campo"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-xs"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-[11px] text-slate-500">
                    <span>{chk.materialsDelivered.santinhos} Santinhos</span>
                    <span>{chk.materialsDelivered.adesivo_bola} Adesivos Bola</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Validado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Quick Action Matrix Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => onNavigateTab('relatorios')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm flex flex-col items-start gap-1 transition text-left group"
        >
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-900 mt-1">Relatórios</span>
          <span className="text-xs text-slate-500">Ruas, fotos e PDF</span>
        </button>

        <button
          onClick={() => onNavigateTab('folha')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm flex flex-col items-start gap-1 transition text-left group"
        >
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
            <Banknote className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-900 mt-1">Folha & Diárias</span>
          <span className="text-xs text-slate-500">R$ 150 e R$ 250/dia</span>
        </button>

        <button
          onClick={() => onNavigateTab('vans')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm flex flex-col items-start gap-1 transition text-left group"
        >
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
            <Truck className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-900 mt-1">Rotas & Vans</span>
          <span className="text-xs text-slate-500">Calendário 26/08 a 03/10</span>
        </button>

        <button
          onClick={() => onNavigateTab('crm')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm flex flex-col items-start gap-1 transition text-left group"
        >
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-900 mt-1">CRM & Metas</span>
          <span className="text-xs text-slate-500">Ranking e ritmo</span>
        </button>

        <button
          onClick={() => onNavigateTab('estoque')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm flex flex-col items-start gap-1 transition text-left group"
        >
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
            <Tag className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-slate-900 mt-1">Estoque Central</span>
          <span className="text-xs text-slate-500">Controle de saídas</span>
        </button>
      </div>

    </div>
  );
};
