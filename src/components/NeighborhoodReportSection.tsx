import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip
} from 'recharts';
import { Neighborhood, StreetCheckIn, Militant, Team } from '../types';
import {
  getQualifyingNeighborhoods,
  doesNeighborhoodQualify,
  isCheckInInNeighborhood,
  getCheckInsForNeighborhood,
  getAllPhotosForCheckIn
} from '../utils/neighborhoodHelpers';
import { BairroInteractiveMap } from './BairroInteractiveMap';
import { StreetAuditRowWithGallery } from './StreetAuditRowWithGallery';
import {
  Building2,
  Compass,
  BarChart3,
  CheckCircle2,
  Camera,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';

interface NeighborhoodReportSectionProps {
  neighborhoods: Neighborhood[];
  checkIns: StreetCheckIn[];
  militants: Militant[];
  teams: Team[];
  onZoomPhoto: (photo: string) => void;
  selectedBairroId?: string;
  onSelectBairro?: (id: string) => void;
  onEditStreet?: (chk: StreetCheckIn) => void;
}

export const NeighborhoodReportSection: React.FC<NeighborhoodReportSectionProps> = ({
  neighborhoods,
  checkIns,
  militants,
  teams,
  onZoomPhoto,
  selectedBairroId: externalBairroId,
  onSelectBairro,
  onEditStreet
}) => {
  const [internalBairroId, setInternalBairroId] = useState<string>(neighborhoods[0]?.id || 'kobrasol');
  const selectedBairroId = externalBairroId || internalBairroId;

  const handleSelectBairro = (newId: string) => {
    setInternalBairroId(newId);
    if (onSelectBairro) {
      onSelectBairro(newId);
    }
  };

  const isAllBairros = selectedBairroId === 'todos';

  // Obter apenas bairros que possuem lançamentos de ruas E fotos anexadas
  const qualifyingNeighborhoods = useMemo(() => {
    return getQualifyingNeighborhoods(neighborhoods, checkIns);
  }, [neighborhoods, checkIns]);

  const currentBairro = useMemo(() => {
    if (isAllBairros) {
      const totalPop = qualifyingNeighborhoods.reduce((acc, n) => acc + (n.population || 0), 0);
      const totalVoters = qualifyingNeighborhoods.reduce((acc, n) => acc + (n.votersEstimated || 0), 0);
      const totalStreets = qualifyingNeighborhoods.reduce((acc, n) => acc + (n.totalStreets || 0), 0);
      return {
        id: 'todos',
        name: 'Todos os Bairros (Consolidado)',
        zone: `São José • ${qualifyingNeighborhoods.length} Bairros Auditados`,
        population: totalPop,
        households: 0,
        votersEstimated: totalVoters,
        totalStreets: totalStreets,
        completedStreets: 0,
        lat: -27.5962,
        lng: -48.6190,
        polygon: [],
        priority: 'Alta' as const,
        targetMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
        deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 }
      } as Neighborhood;
    }
    return neighborhoods.find(n => n.id === selectedBairroId) || neighborhoods[0];
  }, [neighborhoods, selectedBairroId, isAllBairros, qualifyingNeighborhoods]);

  // Filter checkins: se for "todos", inclui APENAS os check-ins dos bairros que se qualificam (com ruas E fotos anexadas)
  const bairroCheckIns = useMemo(() => {
    if (isAllBairros) {
      return checkIns.filter(chk => 
        qualifyingNeighborhoods.some(n => isCheckInInNeighborhood(chk, n))
      );
    }
    if (!currentBairro) return [];
    return getCheckInsForNeighborhood(currentBairro, checkIns);
  }, [isAllBairros, qualifyingNeighborhoods, currentBairro, checkIns]);

  // Estatísticas agregadas
  const totalSantinhos = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos || 0), 0);
  const totalAdesivoBola = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.adesivo_bola || 0), 0);
  const totalParachoque = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.adesivo_parachoque || 0), 0);
  const totalColinhas = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.colinhas || 0), 0);
  const totalAbordagens = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
  const totalComercios = bairroCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);
  const totalMateriais = totalSantinhos + totalAdesivoBola + totalParachoque + totalColinhas;

  const coveragePercent = Math.min(
    Math.round((bairroCheckIns.length / Math.max(currentBairro.totalStreets, 1)) * 100),
    100
  );

  // Dados para o gráfico de pizza de materiais
  const materialsPieData = useMemo(() => {
    return [
      { name: 'Santinhos', value: totalSantinhos, color: '#2563eb' },
      { name: 'Adesivos Bola', value: totalAdesivoBola, color: '#f59e0b' },
      { name: 'Adesivo Para-choque', value: totalParachoque, color: '#8b5cf6' },
      { name: 'Colinhas', value: totalColinhas, color: '#10b981' }
    ].filter(item => item.value > 0);
  }, [totalSantinhos, totalAdesivoBola, totalParachoque, totalColinhas]);

  return (
    <div className="space-y-8 pt-2">
      
      {/* Header & Neighborhood Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Compass className="w-3 h-3 text-blue-600" />
              Visão Territorial & Auditoria Geográfica
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Relatório Territorial por Bairros & Mapas de Ruas
          </h3>
          <p className="text-xs text-slate-500">
            {isAllBairros
              ? `Exibindo visão consolidada: Mapa Geral, KPIs e Dashboards detalhados de cada um dos ${qualifyingNeighborhoods.length} bairros qualificados (com ruas e fotos anexadas).`
              : `Auditoria detalhada do bairro ${currentBairro.name}: mapa com ruas pintadas em vermelho, KPIs e sequência completa de ruas com fotos.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Bairro:</label>
          <select
            id="neighborhood-select-dropdown"
            value={selectedBairroId}
            onChange={(e) => handleSelectBairro(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-2xs"
          >
            <option value="todos" className="font-bold text-blue-700 bg-blue-50/50">
              🌟 Todos os Bairros (Apenas com Ruas e Fotos: {qualifyingNeighborhoods.length} Bairros)
            </option>
            {neighborhoods.map(n => {
              const qualifies = doesNeighborhoodQualify(n, checkIns);
              return (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.zone}) {qualifies ? '✓ Ruas & Fotos' : ''} - {n.population.toLocaleString('pt-BR')} hab.
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* =========================================================================
          ESTRUTURA SOLICITADA PARA "TODOS OS BAIRROS":
          1 - Mapa Geral dos Bairros
          2 - KPIs e Dados
          3 - Dashboard do 1º Bairro (Começando pelo Mapa do Bairro com ruas pintadas)
              3a Dados da Rua 1
              3b Galeria de fotos da Rua 1
              3c Dados da Rua 2
              3d Galeria de fotos da Rua 2...
          4 - Dashboard do 2º Bairro (Começando pelo Mapa do Bairro com ruas pintadas)
              4a Dados da Rua 1
              4b Galeria de fotos da Rua 1...
          ... Segue nessa ordem até o último Bairro!
         ========================================================================= */}

      {isAllBairros ? (
        <div className="space-y-10">

          {/* 1. MAPA GERAL DOS BAIRROS */}
          <div className="space-y-3" id="neighborhood-report-visuals">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  1
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  Mapa Geral dos Bairros Auditados de São José
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                {qualifyingNeighborhoods.length} Bairros Qualificados • {bairroCheckIns.length} Ruas Sinalizadas
              </span>
            </div>

            <div id="neighborhood-report-map-wrapper">
              <BairroInteractiveMap
                mapId="map-geral-todos-bairros"
                bairro={currentBairro}
                checkIns={bairroCheckIns}
                isGeneralMap={true}
                qualifyingNeighborhoods={qualifyingNeighborhoods}
                height="440px"
                title="Visão Geral Integrada • Delimitações Oficiais e Ruas Pintadas em Vermelho"
              />
            </div>
          </div>

          {/* 2. KPIS E DADOS CONSOLIDADOS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  KPIs e Dados Consolidados da Campanha
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Consolidação dos {qualifyingNeighborhoods.length} Bairros Auditados
              </span>
            </div>

            {/* Cards de Métricas */}
            <div id="neighborhood-report-cards" className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">População Auditada (IBGE)</span>
                <strong className="text-lg font-bold text-slate-900 font-mono">{currentBairro.population.toLocaleString('pt-BR')} hab.</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">{qualifyingNeighborhoods.length} bairros qualificados</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Eleitores Estimados</span>
                <strong className="text-lg font-bold text-blue-700 font-mono">{currentBairro.votersEstimated.toLocaleString('pt-BR')}</strong>
                <span className="text-[10px] text-blue-600 block mt-0.5">Aptos a Votar</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Ruas Registradas</span>
                <strong className="text-lg font-bold text-rose-700 font-mono">{bairroCheckIns.length} ruas</strong>
                <span className="text-[10px] text-rose-600 font-bold block mt-0.5">Com fotos e GPS comprovados</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Abordagens Diretas</span>
                <strong className="text-lg font-bold text-purple-700 font-mono">{totalAbordagens} eleitores</strong>
                <span className="text-[10px] text-purple-600 block mt-0.5">{totalComercios} comércios visitados</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Materiais Entregues</span>
                <strong className="text-lg font-bold text-emerald-700 font-mono">{totalMateriais.toLocaleString('pt-BR')}</strong>
                <span className="text-[10px] text-emerald-600 block mt-0.5">{totalSantinhos} santinhos</span>
              </div>
            </div>

            {/* Painel de Gráficos e Distribuição */}
            <div id="neighborhood-report-charts-card" className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-4 space-y-2">
                <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Distribuição de Materiais Consolidados
                </h5>
                <p className="text-[11px] text-slate-500">
                  Volume de santinhos, adesivos e colinhas distribuídos nos {qualifyingNeighborhoods.length} bairros.
                </p>
                <div className="space-y-1.5 pt-2">
                  {materialsPieData.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        {item.name}:
                      </span>
                      <strong className="font-mono text-slate-900">{item.value.toLocaleString('pt-BR')}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-4 h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialsPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={62}
                      paddingAngle={3}
                    >
                      {materialsPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [`${val.toLocaleString('pt-BR')} unidades`, name]}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="md:col-span-4 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Bairros Qualificados:</span>
                  <strong className="text-blue-700 font-bold">{qualifyingNeighborhoods.length} de {neighborhoods.length}</strong>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${Math.min(Math.round((qualifyingNeighborhoods.length / Math.max(neighborhoods.length, 1)) * 100), 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic mt-1">
                  Regra estrita: Apenas bairros com lançamentos de ruas e fotos anexadas são apresentados nos dashboards a seguir.
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================================
              3, 4, 5... DASHBOARDS INDIVIDUAIS DE CADA BAIRRO QUALIFICADO
              Começando pelo mapa do bairro com as ruas pintadas em vermelho,
              seguido por cada rua (3a/4a) e sua respectiva galeria de fotos (3b/4b).
             ===================================================================== */}
          {qualifyingNeighborhoods.length === 0 ? (
            <div className="p-8 rounded-xl bg-amber-50 border border-amber-200 text-center text-amber-800 space-y-2">
              <p className="font-bold text-sm">Nenhum bairro com lançamentos de ruas e fotos anexadas foi encontrado.</p>
              <p className="text-xs text-amber-600">
                Para que um bairro apareça nesta visualização consolidada, ele precisa possuir check-ins de ruas cadastrados e com fotos de comprovação válidas anexadas.
              </p>
            </div>
          ) : (
            qualifyingNeighborhoods.map((bairro, bIdx) => {
              const bairroNumber = bIdx + 3; // 3 para o 1º bairro, 4 para o 2º bairro, etc.
              const nCheckIns = getCheckInsForNeighborhood(bairro, bairroCheckIns);

              const bAbordagens = nCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.abordagens || 0), 0);
              const bComercios = nCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.comercio || 0), 0);
              const bSantinhos = nCheckIns.reduce((acc, c) => acc + (c.materialsDelivered.santinhos || 0), 0);
              const bMateriais = nCheckIns.reduce((acc, c) => {
                const m = c.materialsDelivered;
                return acc + (m.santinhos || 0) + (m.adesivo_bola || 0) + (m.adesivo_parachoque || 0) + (m.colinhas || 0);
              }, 0);

              return (
                <div
                  key={bairro.id}
                  id={`dashboard-bairro-${bairro.id}`}
                  className="p-5 rounded-2xl border-2 border-slate-200 bg-white shadow-xs space-y-5"
                >
                  {/* Cabeçalho do Dashboard do Bairro */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                        {bairroNumber}
                      </span>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                          Dashboard do {bIdx + 1}º Bairro: <span className="text-blue-700">{bairro.name}</span>
                          <span className="text-xs font-normal text-slate-500">({bairro.zone})</span>
                        </h4>
                        <p className="text-xs text-slate-500">
                          {nCheckIns.length} ruas auditadas com comprovação fotográfica • {bairro.population.toLocaleString('pt-BR')} habitantes (IBGE)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-700">
                        👥 <strong>{bAbordagens}</strong> abordagens
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-700">
                        🏪 <strong>{bComercios}</strong> comércios
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 font-bold text-emerald-800">
                        📦 <strong>{bMateriais.toLocaleString('pt-BR')}</strong> materiais
                      </span>
                    </div>
                  </div>

                  {/* MAPA DO BAIRRO COM RUAS PINTADAS (MELHOR VISUALIZAÇÃO POSSÍVEL) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        Mapa Territorial de {bairro.name} • Ruas Pintadas em Vermelho
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Área delimitada oficial e {nCheckIns.length} logradouros geolocalizados
                      </span>
                    </div>

                    <BairroInteractiveMap
                      mapId={`map-bairro-individual-${bairro.id}`}
                      bairro={bairro}
                      checkIns={nCheckIns}
                      isGeneralMap={false}
                      height="380px"
                    />
                  </div>

                  {/* SEQUÊNCIA DE RUAS E RESPECTIVAS GALERIAS: 3a, 3b, 3c, 3d... */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Auditoria Detalhada de Cada Rua & Galerias de Fotos ({nCheckIns.length} ruas)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Exibição sequencial com todas as fotos anexadas de cada logradouro
                      </span>
                    </div>

                    {nCheckIns.map((chk, rIdx) => (
                      <StreetAuditRowWithGallery
                        key={chk.id}
                        chk={chk}
                        militants={militants}
                        bairroNumber={bairroNumber}
                        streetIndex={rIdx}
                        onZoomPhoto={onZoomPhoto}
                        onEditStreet={onEditStreet}
                      />
                    ))}
                  </div>

                </div>
              );
            })
          )}

        </div>
      ) : (
        /* =======================================================================
           VISUALIZAÇÃO DE UM ÚNICO BAIRRO SELECIONADO (ex: Kobrasol)
           Mantém o mesmo padrão de excelência estruturado:
           1 - Mapa do Bairro & Gráficos
           2 - KPIs e Dados
           3 - Dashboard das Ruas com Galeria de fotos de cada rua
           ======================================================================= */
        <div className="space-y-8">
          
          {/* 1. MAPA DO BAIRRO COM AS RUAS PINTADAS & GRÁFICOS */}
          <div id="neighborhood-report-visuals" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div id="neighborhood-report-map-wrapper" className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Mapa de {currentBairro.name} • Ruas Pintadas em Vermelho
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                  {bairroCheckIns.length} ruas sinalizadas
                </span>
              </div>

              <BairroInteractiveMap
                mapId={`map-single-${currentBairro.id}`}
                bairro={currentBairro}
                checkIns={bairroCheckIns}
                isGeneralMap={false}
                height="380px"
              />
            </div>

            {/* Painel de Gráficos de Materiais */}
            <div id="neighborhood-report-charts-card" className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Distribuição de Materiais em {currentBairro.name}
                </h4>
                <p className="text-[11px] text-slate-500">Volume de santinhos e adesivos entregues</p>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialsPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={58}
                      paddingAngle={3}
                    >
                      {materialsPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [`${val.toLocaleString('pt-BR')} unidades`, name]}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                {materialsPieData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 truncate">{item.name}:</span>
                    <strong className="text-slate-900 font-mono">{item.value.toLocaleString('pt-BR')}</strong>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600 font-medium">Meta Territorial Coberta:</span>
                  <strong className="text-slate-900 font-bold">{coveragePercent}%</strong>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. KPIS E DADOS DO BAIRRO */}
          <div id="neighborhood-report-cards" className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">População (IBGE)</span>
              <strong className="text-base font-bold text-slate-900 font-mono">{currentBairro.population.toLocaleString('pt-BR')} hab.</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">{currentBairro.zone}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Eleitores Estimados</span>
              <strong className="text-base font-bold text-blue-700 font-mono">{currentBairro.votersEstimated.toLocaleString('pt-BR')}</strong>
              <span className="text-[10px] text-blue-600 block mt-0.5">Aptos a Votar</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Ruas Registradas</span>
              <strong className="text-base font-bold text-rose-700 font-mono">
                {bairroCheckIns.length} / {currentBairro.totalStreets}
              </strong>
              <span className="text-[10px] text-rose-600 font-bold block mt-0.5">{coveragePercent}% Coberto</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Abordagens Diretas</span>
              <strong className="text-base font-bold text-purple-700 font-mono">{totalAbordagens} eleitores</strong>
              <span className="text-[10px] text-purple-600 block mt-0.5">{totalComercios} comércios</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Materiais Entregues</span>
              <strong className="text-base font-bold text-emerald-700 font-mono">{totalMateriais.toLocaleString('pt-BR')}</strong>
              <span className="text-[10px] text-emerald-600 block mt-0.5">{totalSantinhos} santinhos</span>
            </div>
          </div>

          {/* 3. DASHBOARD DAS RUAS DO BAIRRO COM AS GALERIAS DE CADA RUA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Dashboard das Ruas Atendidas em {currentBairro.name} ({bairroCheckIns.length} ruas)
                </h4>
              </div>
              <span className="text-xs text-slate-500">
                Sequência de dados da rua e todas as fotos anexadas
              </span>
            </div>

            {bairroCheckIns.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-400 italic">
                Nenhuma rua cadastrada no bairro {currentBairro.name} no período selecionado.
              </div>
            ) : (
              bairroCheckIns.map((chk, rIdx) => (
                <StreetAuditRowWithGallery
                  key={chk.id}
                  chk={chk}
                  militants={militants}
                  bairroNumber={3}
                  streetIndex={rIdx}
                  onZoomPhoto={onZoomPhoto}
                  onEditStreet={onEditStreet}
                />
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
};
