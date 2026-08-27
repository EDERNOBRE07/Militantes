import React from 'react';
import {
  Militant,
  Team,
  Neighborhood
} from '../types';
import {
  Award,
  AlertTriangle
} from 'lucide-react';

interface CrmGoalsViewProps {
  militants: Militant[];
  teams: Team[];
  neighborhoods: Neighborhood[];
}

export const CrmGoalsView: React.FC<CrmGoalsViewProps> = ({
  militants,
  teams,
  neighborhoods
}) => {
  // Sort militants by performance score (streets + materials delivered)
  const rankedMilitants = [...militants].sort((a, b) => {
    return b.weeklyGoalPercentage - a.weeklyGoalPercentage;
  });

  const totalStreets = neighborhoods.reduce((sum, n) => sum + n.totalStreets, 0);
  const completedStreets = neighborhoods.reduce((sum, n) => sum + n.completedStreets, 0);
  const remainingStreets = totalStreets - completedStreets;
  
  // 39 campaign days (from 26/08 to 03/10)
  const remainingDays = 39;
  const requiredDailyPace = (remainingStreets / remainingDays).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              CRM de Campanha & Gestão de Metas
            </span>
            <span className="text-xs text-slate-500 font-medium">Meta São José 100%</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Painel de Metas, Produtividade & Ranking</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Acompanhamento diário da meta de entrega por militante, equipe e bairro com cálculo de ritmo necessário até 03 de Outubro de 2026.
          </p>
        </div>

        {/* Daily Pacing Gauge */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs text-center min-w-[200px]">
          <p className="text-[10px] text-purple-800 uppercase font-bold tracking-wider">Ritmo Diário Necessário</p>
          <div className="flex items-baseline justify-center gap-1 my-1">
            <span className="text-3xl font-bold text-slate-900">{requiredDailyPace}</span>
            <span className="text-xs text-purple-700 font-semibold">ruas / dia</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Restam <strong className="text-slate-800">{remainingStreets} ruas</strong> em 39 dias
          </p>
        </div>
      </div>

      {/* Main CRM Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Militant Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Ranking de Produtividade da Militância</h3>
                  <p className="text-xs text-slate-500">Desempenho individual em ruas cobertas e materiais entregues</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                Top Performers
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {rankedMilitants.map((mil, idx) => {
                const isTop1 = idx === 0;
                const isTop2 = idx === 1;
                const isTop3 = idx === 2;

                return (
                  <div
                    key={mil.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      isTop1 ? 'bg-amber-50/60 border-amber-200' :
                      isTop2 ? 'bg-slate-50/80 border-slate-200' :
                      'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                        isTop1 ? 'bg-amber-500 text-white shadow-xs' :
                        isTop2 ? 'bg-slate-300 text-slate-900' :
                        isTop3 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}º
                      </div>

                      <img
                        src={mil.avatar}
                        alt={mil.name}
                        className="w-11 h-11 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{mil.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">({mil.matricula})</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {mil.totalStreetsCovered} ruas percorridas • {mil.totalKmWalked} km caminhados
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <div className="text-right text-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Santinhos Entregues</span>
                        <strong className="text-slate-900 text-sm">{mil.deliveredMaterials.santinhos.toLocaleString('pt-BR')}</strong>
                      </div>

                      <div className="w-28 text-right">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Meta</span>
                          <strong className="text-emerald-700 font-bold">{mil.weeklyGoalPercentage}%</strong>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${Math.min(100, mil.weeklyGoalPercentage)}%` }}
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

        {/* Right Col: Team Comparison & Target Highlights */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Desempenho por Equipe</h3>
              <span className="text-xs text-slate-500">{teams.length} equipes</span>
            </div>

            <div className="space-y-3">
              {teams.map(team => (
                <div key={team.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                      {team.name}
                    </span>
                    <span className="font-bold text-blue-700">{team.dailyProgressPct}%</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Líder: {team.leaderName}</span>
                    <span>{team.totalMaterialsDelivered.toLocaleString('pt-BR')} materiais</span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${team.dailyProgressPct}%`, backgroundColor: team.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Target Bottleneck Box */}
          <div className="p-5 rounded-xl bg-white border border-rose-200 shadow-sm space-y-2 bg-rose-50/30">
            <h4 className="font-bold text-xs text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Bairros com Menor Cobertura (Atenção)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Colônia Santana (35%), Sertão do Maruim (42%) e Picadas do Sul (50%) necessitam de reforço de van para atingir o ritmo antes da reta final.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
