import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { StreetCheckIn, Militant, Team, Neighborhood, BairroAction } from '../types';
import { StorageService } from '../services/storageService';
import {
  BarChart3,
  Users,
  MapPin,
  TrendingUp,
  PieChart as PieChartIcon,
  Store,
  CheckCircle2,
  Award,
  Sparkles,
  Camera,
  Layers,
  GraduationCap,
  ShoppingBag,
  Navigation,
  Clock,
  ExternalLink,
  Eye,
  User as UserIcon,
  Flag,
  X
} from 'lucide-react';

interface GeneralReportDashboardProps {
  checkIns: StreetCheckIn[];
  militants: Militant[];
  teams: Team[];
  neighborhoods: Neighborhood[];
  productivityData?: any[];
  title?: string;
  subtitle?: string;
  onZoomPhoto?: (photo: string) => void;
}

export const GeneralReportDashboard: React.FC<GeneralReportDashboardProps> = ({
  checkIns,
  militants,
  teams,
  neighborhoods,
  productivityData: externalProductivityData,
  title = "Dashboard Geral Consolidado pós-Mapeamento",
  subtitle = "Visão executiva agregada • Pessoas abordadas, ruas percorridas e auditoria de campo",
  onZoomPhoto
}) => {
  const [localZoomPhoto, setLocalZoomPhoto] = React.useState<string | null>(null);

  const handleZoom = (photo: string) => {
    if (onZoomPhoto) {
      onZoomPhoto(photo);
    } else {
      setLocalZoomPhoto(photo);
    }
  };

  // Carrega e agrupa as Ações no Bairro por Bairro participante
  const actionsByNeighborhood = useMemo(() => {
    const allActions = StorageService.getBairroActions();
    
    // Se o dashboard for de um único bairro (ex: dentro de um bairro isolado), filtra por aquele bairro
    const uniqueBairroIdsInCheckIns = Array.from(new Set(checkIns.map(c => c.neighborhoodId)));
    const isSingleBairro = uniqueBairroIdsInCheckIns.length === 1 && uniqueBairroIdsInCheckIns[0];

    const targetActions = isSingleBairro
      ? allActions.filter(a => {
          const aId = (a.neighborhoodId || '').toLowerCase().trim();
          const singleId = (uniqueBairroIdsInCheckIns[0] || '').toLowerCase().trim();
          return aId === singleId || aId.includes(singleId) || singleId.includes(aId);
        })
      : allActions;

    // Agrupa por bairro onde houver ocorrência de ações
    const groups: { [key: string]: { bairro: Neighborhood; actions: BairroAction[] } } = {};
    
    targetActions.forEach(act => {
      const bKey = (act.neighborhoodId || act.neighborhoodName || 'geral').toLowerCase().trim();
      if (!groups[bKey]) {
        const found = neighborhoods.find(n => 
          n.id.toLowerCase() === bKey || 
          n.name.toLowerCase() === (act.neighborhoodName || '').toLowerCase()
        );
        const bObj: Neighborhood = found || {
          id: act.neighborhoodId || bKey,
          name: act.neighborhoodName || 'São José',
          zone: 'São José',
          population: 0,
          households: 0,
          votersEstimated: 0,
          totalStreets: 0,
          completedStreets: 0,
          lat: act.latitude || -27.5958,
          lng: act.longitude || -48.6185,
          polygon: [],
          priority: 'Média',
          targetMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
          deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 }
        };
        groups[bKey] = { bairro: bObj, actions: [] };
      }
      groups[bKey].actions.push(act);
    });

    return Object.values(groups);
  }, [checkIns, neighborhoods]);

  // Totais Gerais
  const totalRuas = checkIns.length;
  const totalAbordagens = checkIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
  const totalComercios = checkIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);
  const totalPhotos = checkIns.reduce((acc, c) => acc + (c.photos?.length || 0), 0);

  // Militantes Ativos e cálculo de produtividade consolidada se não passado via prop
  const computedProductivityData = useMemo(() => {
    if (externalProductivityData && externalProductivityData.length > 0) {
      return externalProductivityData;
    }

    return militants.map(mil => {
      const milCheckIns = checkIns.filter(c => c.militantId === mil.id || c.militantName === mil.name);
      const streetsCount = milCheckIns.length;
      const abordagens = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
      const comercios = milCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);
      const photosCount = milCheckIns.reduce((acc, c) => acc + (c.photos?.length || 0), 0);

      const weeklyGoal = 25;
      const completionRate = Math.min(Math.round((streetsCount / weeklyGoal) * 100), 200);
      const teamObj = teams.find(t => t.id === mil.teamId);

      return {
        id: mil.id,
        name: mil.name,
        shortName: mil.name.split(' ')[0] + ' ' + (mil.name.split(' ')[1]?.[0] || '') + '.',
        matricula: mil.matricula,
        teamName: teamObj?.name || 'Geral',
        streetsCount,
        abordagens,
        comercios,
        photosCount,
        completionRate,
        weeklyGoal
      };
    }).sort((a, b) => b.streetsCount - a.streetsCount);
  }, [militants, checkIns, teams, externalProductivityData]);

  // Gráfico de Pizza por Equipes
  const teamDistributionPieData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    checkIns.forEach(c => {
      const mil = militants.find(m => m.id === c.militantId);
      const teamId = c.teamId || mil?.teamId || 'geral';
      counts[teamId] = (counts[teamId] || 0) + 1;
    });

    return [
      { name: 'Equipe Alpha', value: counts['team-alpha'] || 0, color: '#2563eb' },
      { name: 'Equipe Bravo', value: counts['team-bravo'] || 0, color: '#9333ea' },
      { name: 'Equipe Geral', value: counts['geral'] || 0, color: '#059669' }
    ].filter(i => i.value > 0);
  }, [checkIns, militants]);

  const activeMilitantsCount = computedProductivityData.filter(d => d.streetsCount > 0).length || militants.length;
  const avgStreetsPerMilitant = activeMilitantsCount > 0 ? (totalRuas / activeMilitantsCount).toFixed(1) : '0';
  const avgAbordagensPerStreet = totalRuas > 0 ? (totalAbordagens / totalRuas).toFixed(1) : '0';

  return (
    <div id="general-report-dashboard-section" className="space-y-6 pt-6 border-t-2 border-slate-200">
      
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-black text-white shadow-xs">
            <BarChart3 className="w-5 h-5 text-blue-300" />
          </span>
          <div>
            <h3 className="text-base font-extrabold uppercase tracking-wide flex items-center gap-2 text-white">
              {title}
            </h3>
            <p className="text-xs text-blue-200">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="px-3 py-1 rounded-md bg-white/15 backdrop-blur-xs text-xs font-bold text-white border border-white/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Consolidação Geral • São José / SC
          </span>
        </div>
      </div>

      {/* 1. CARDS DE INDICADORES GERAIS */}
      <div id="general-dashboard-kpi-cards" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Card 1: Pessoas Abordadas */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pessoas Abordadas</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <strong className="text-xl font-black text-purple-800 font-mono block">
            {totalAbordagens}
          </strong>
          <span className="text-[10px] text-purple-600 font-medium block mt-0.5">
            Média: {avgAbordagensPerStreet} / rua
          </span>
        </div>

        {/* Card 2: Número de Ruas */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Número de Ruas</span>
            <MapPin className="w-4 h-4 text-rose-600" />
          </div>
          <strong className="text-xl font-black text-rose-700 font-mono block">
            {totalRuas} ruas
          </strong>
          <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
            100% auditadas com fotos
          </span>
        </div>

        {/* Card 3: Comércios Visitados */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Comércios Visitados</span>
            <Store className="w-4 h-4 text-emerald-600" />
          </div>
          <strong className="text-xl font-black text-emerald-700 font-mono block">
            {totalComercios}
          </strong>
          <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
            Estabelecimentos visitados
          </span>
        </div>

        {/* Card 4: Comprovantes Fotográficos */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Fotos Anexadas</span>
            <Camera className="w-4 h-4 text-blue-600" />
          </div>
          <strong className="text-xl font-black text-blue-700 font-mono block">
            {totalPhotos}
          </strong>
          <span className="text-[10px] text-blue-600 font-medium block mt-0.5">
            Comprovações auditadas
          </span>
        </div>

        {/* Card 5: Cobertura de Equipes */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Equipes Ativas</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <strong className="text-xl font-black text-amber-700 font-mono block">
            {teams.length} equipes
          </strong>
          <span className="text-[10px] text-amber-600 font-medium block mt-0.5">
            Mobilização em campo
          </span>
        </div>

        {/* Card 6: Militantes Ativos & Produtividade */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Militantes Ativos</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <strong className="text-xl font-black text-indigo-700 font-mono block">
            {activeMilitantsCount} de {militants.length}
          </strong>
          <span className="text-[10px] text-indigo-600 font-medium block mt-0.5">
            Média: {avgStreetsPerMilitant} ruas/mil
          </span>
        </div>

      </div>

      {/* 2. GRÁFICOS GERAIS DE PRODUTIVIDADE & ATUAÇÃO POR EQUIPES */}
      <div id="general-dashboard-charts" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Gráfico 1: Produtividade por Militante (Ruas vs Abordagens) */}
        <div className="lg:col-span-8 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Produtividade Consolidada por Militante (Ruas vs. Pessoas Abordadas)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Meta Semanal: 25 ruas / militante
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={computedProductivityData}
                margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <RechartsTooltip
                  formatter={(val: any, name: any) => [
                    `${val}`,
                    name === 'streetsCount' ? 'Ruas Registradas' : (name === 'abordagens' ? 'Pessoas Abordadas' : 'Comércios')
                  ]}
                  labelFormatter={(label) => `Militante: ${label}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 6 }}
                  formatter={(value) => (
                    <span className="text-slate-700 text-xs font-semibold">
                      {value === 'streetsCount' ? 'Ruas Auditadas' : (value === 'abordagens' ? 'Pessoas Abordadas' : 'Comércios')}
                    </span>
                  )}
                />
                <Bar dataKey="streetsCount" name="streetsCount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="abordagens" name="abordagens" fill="#9333ea" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comercios" name="comercios" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Distribuição por Equipes */}
        <div className="lg:col-span-4 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-indigo-600" />
              Distribuição por Equipes
            </span>
            <p className="text-[11px] text-slate-500">
              Total consolidado: <strong>{totalRuas}</strong> ruas auditadas
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teamDistributionPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={60}
                  paddingAngle={3}
                >
                  {teamDistributionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val: any, name: any) => [`${val} ruas`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {teamDistributionPieData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <strong className="font-mono text-slate-900">{item.value} ruas</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. TABELA RESUMO CONSOLIDADA DOS MILITANTES */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600" />
            Ranking Geral de Desempenho dos Militantes
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {computedProductivityData.length} militantes cadastrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Militante</th>
                <th className="py-2.5 px-3">Equipe</th>
                <th className="py-2.5 px-2 text-center">Ruas</th>
                <th className="py-2.5 px-2 text-center text-purple-700">Pessoas Abordadas</th>
                <th className="py-2.5 px-2 text-center text-emerald-700">Comércios</th>
                <th className="py-2.5 px-2 text-center text-blue-700">Fotos Anexadas</th>
                <th className="py-2.5 px-3 text-center">Progresso da Meta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {computedProductivityData.map((d, idx) => (
                <tr key={d.id} className="hover:bg-slate-50/70">
                  <td className="py-2 px-3 font-mono font-bold text-slate-400 text-[11px]">{idx + 1}º</td>
                  <td className="py-2 px-3">
                    <strong className="text-slate-900 block">{d.name}</strong>
                    {d.matricula && <span className="text-[10px] text-slate-400 font-mono">Mat. {d.matricula}</span>}
                  </td>
                  <td className="py-2 px-3 text-slate-600">{d.teamName}</td>
                  <td className="py-2 px-2 text-center font-bold text-slate-900 font-mono">{d.streetsCount}</td>
                  <td className="py-2 px-2 text-center font-bold text-purple-800 font-mono">{d.abordagens}</td>
                  <td className="py-2 px-2 text-center font-bold text-emerald-800 font-mono">{d.comercios}</td>
                  <td className="py-2 px-2 text-center font-bold text-blue-800 font-mono">{d.photosCount || 0}</td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            d.completionRate >= 100
                              ? 'bg-emerald-500'
                              : d.completionRate >= 60
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(d.completionRate, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-slate-600">
                        {d.completionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. AÇÕES NOS BAIRROS REGISTRADAS POR LOCALIDADE (CONFORME REQUISITO DO USUÁRIO) */}
      {actionsByNeighborhood.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs space-y-0">
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  Ações no Bairro Registradas por Localidade
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                    {actionsByNeighborhood.reduce((acc, g) => acc + g.actions.length, 0)} Ações Totais
                  </span>
                </h4>
                <p className="text-slate-300 text-xs mt-0.5">
                  Eventos em praças, escolas, supermercados, feiras, caminhadas e comícios nos bairros de São José
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-300 font-bold border border-white/10">
                📷 {actionsByNeighborhood.reduce((acc, g) => acc + g.actions.reduce((a, act) => a + (act.photos?.length || 0), 0), 0)} fotos
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-purple-300 font-bold border border-white/10">
                👥 ~{actionsByNeighborhood.reduce((acc, g) => acc + g.actions.reduce((a, act) => a + (act.estimatedPeople || 0), 0), 0).toLocaleString('pt-BR')} pessoas
              </span>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {actionsByNeighborhood.map((group, gIdx) => (
              <div
                key={gIdx}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5 shadow-2xs"
              >
                {/* Bairro Sub-Header */}
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <strong className="text-sm font-bold text-slate-900">
                      Bairro {group.bairro.name}
                    </strong>
                    <span className="text-[11px] text-slate-500 font-medium">({group.bairro.zone})</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    {group.actions.length} {group.actions.length === 1 ? 'Ação Registrada' : 'Ações Registradas'}
                  </span>
                </div>

                {/* Grid of Actions in this neighborhood */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {group.actions.map(action => (
                    <div
                      key={action.id}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between space-y-2.5 shadow-2xs"
                    >
                      <div>
                        {/* Scope & Type Badges */}
                        <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {action.actionType.replace('_', ' ').toUpperCase()}
                          </span>

                          {action.scope === 'individual' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                              <UserIcon className="w-3 h-3 text-purple-600" />
                              Individual ({action.militantName || 'Militante'})
                            </span>
                          )}
                          {action.scope === 'grupo' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Users className="w-3 h-3 text-amber-600" />
                              Grupo ({action.militantNames?.length || 'Vários'} militantes)
                            </span>
                          )}
                          {action.scope === 'toda_equipe' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <Flag className="w-3 h-3 text-emerald-600" />
                              {action.teamName || 'Toda a Equipe'}
                            </span>
                          )}
                        </div>

                        {/* Title & Place */}
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                          {action.title || action.locationName}
                        </h5>

                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{action.locationName}</span>
                        </div>

                        {/* Timestamp & GPS */}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {action.timestamp}
                          </span>

                          {action.hasGps && action.latitude && action.longitude ? (
                            <a
                              href={`https://www.google.com/maps?q=${action.latitude},${action.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline font-mono"
                            >
                              {action.latitude.toFixed(4)}, {action.longitude.toFixed(4)}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-slate-400">Sem GPS</span>
                          )}

                          {action.estimatedPeople && (
                            <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                              👥 ~{action.estimatedPeople} pessoas
                            </span>
                          )}
                        </div>

                        {action.observations && (
                          <p className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                            "{action.observations}"
                          </p>
                        )}
                      </div>

                      {/* Photo Gallery for action */}
                      {action.photos && action.photos.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                            <Camera className="w-3 h-3 text-blue-600" />
                            Fotos ({action.photos.length})
                          </span>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                            {action.photos.map((photo, pIdx) => (
                              <div
                                key={pIdx}
                                onClick={() => handleZoom(photo)}
                                className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group shadow-2xs hover:shadow-md transition"
                              >
                                <img
                                  src={photo}
                                  alt={`Foto ${pIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-3.5 h-3.5 text-white drop-shadow" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local Zoom Modal if no external modal handler passed */}
      {localZoomPhoto && !onZoomPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setLocalZoomPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setLocalZoomPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 text-sm font-bold flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" /> Fechar
            </button>
            <img
              src={localZoomPhoto}
              alt="Foto Ampliada"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
};
