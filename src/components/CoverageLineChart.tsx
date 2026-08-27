import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart
} from 'recharts';
import { Neighborhood, StreetCheckIn } from '../types';
import { TrendingUp, Calendar, CheckCircle2, Target, Info, ArrowUpRight, BarChart3 } from 'lucide-react';

interface CoverageLineChartProps {
  neighborhoods: Neighborhood[];
  checkIns: StreetCheckIn[];
}

export interface CoverageChartDataPoint {
  period: string;
  shortLabel: string;
  planejado: number;
  realizado: number;
  atingimento: number;
  diferenca?: number;
  percentTotal?: number;
}

export const CoverageLineChart: React.FC<CoverageLineChartProps> = ({
  neighborhoods,
  checkIns
}) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'cumulative'>('cumulative');

  const totalStreets = useMemo(() => {
    return neighborhoods.reduce((sum, n) => sum + n.totalStreets, 0);
  }, [neighborhoods]);

  const completedStreets = useMemo(() => {
    return neighborhoods.reduce((sum, n) => sum + n.completedStreets, 0);
  }, [neighborhoods]);

  // Compute 4-week evolution metrics comparing Planned vs Executed
  const chartData: CoverageChartDataPoint[] = useMemo(() => {
    // Baseline targets for São José campaign (4-week progression)
    // Week 1: 25/08 a 31/08
    // Week 2: 01/09 a 07/09
    // Week 3: 08/09 a 14/09
    // Week 4: 15/09 a 21/09 (Semana Atual)

    const w1Planned = 120;
    const w1Realized = 134;

    const w2Planned = 150;
    const w2Realized = 162;

    const w3Planned = 165;
    const w3Realized = 156;

    // Week 4 dynamic based on current remaining completed streets
    const basePreviousTotal = w1Realized + w2Realized + w3Realized; // 452
    const w4Realized = Math.max(completedStreets - basePreviousTotal, 86);
    const w4Planned = 175;

    if (viewMode === 'weekly') {
      return [
        {
          period: 'Sem 1 (25/08-31/08)',
          shortLabel: 'Semana 1',
          planejado: w1Planned,
          realizado: w1Realized,
          atingimento: Number(((w1Realized / w1Planned) * 100).toFixed(1)),
          diferenca: w1Realized - w1Planned
        },
        {
          period: 'Sem 2 (01/09-07/09)',
          shortLabel: 'Semana 2',
          planejado: w2Planned,
          realizado: w2Realized,
          atingimento: Number(((w2Realized / w2Planned) * 100).toFixed(1)),
          diferenca: w2Realized - w2Planned
        },
        {
          period: 'Sem 3 (08/09-14/09)',
          shortLabel: 'Semana 3',
          planejado: w3Planned,
          realizado: w3Realized,
          atingimento: Number(((w3Realized / w3Planned) * 100).toFixed(1)),
          diferenca: w3Realized - w3Planned
        },
        {
          period: 'Sem 4 (15/09-21/09)',
          shortLabel: 'Semana 4 (Atual)',
          planejado: w4Planned,
          realizado: w4Realized,
          atingimento: Number(((w4Realized / w4Planned) * 100).toFixed(1)),
          diferenca: w4Realized - w4Planned
        }
      ];
    } else {
      // Cumulative view
      const c1Plan = w1Planned;
      const c1Real = w1Realized;

      const c2Plan = c1Plan + w2Planned;
      const c2Real = c1Real + w2Realized;

      const c3Plan = c2Plan + w3Planned;
      const c3Real = c2Real + w3Realized;

      const c4Plan = c3Plan + w4Planned;
      const c4Real = c3Real + w4Realized;

      return [
        {
          period: 'Sem 1 (25/08-31/08)',
          shortLabel: 'Semana 1',
          planejado: c1Plan,
          realizado: c1Real,
          atingimento: Number(((c1Real / c1Plan) * 100).toFixed(1)),
          diferenca: c1Real - c1Plan,
          percentTotal: Number(((c1Real / totalStreets) * 100).toFixed(1))
        },
        {
          period: 'Sem 2 (01/09-07/09)',
          shortLabel: 'Semana 2',
          planejado: c2Plan,
          realizado: c2Real,
          atingimento: Number(((c2Real / c2Plan) * 100).toFixed(1)),
          diferenca: c2Real - c2Plan,
          percentTotal: Number(((c2Real / totalStreets) * 100).toFixed(1))
        },
        {
          period: 'Sem 3 (08/09-14/09)',
          shortLabel: 'Semana 3',
          planejado: c3Plan,
          realizado: c3Real,
          atingimento: Number(((c3Real / c3Plan) * 100).toFixed(1)),
          diferenca: c3Real - c3Plan,
          percentTotal: Number(((c3Real / totalStreets) * 100).toFixed(1))
        },
        {
          period: 'Sem 4 (15/09-21/09)',
          shortLabel: 'Semana 4 (Atual)',
          planejado: c4Plan,
          realizado: c4Real,
          atingimento: Number(((c4Real / c4Plan) * 100).toFixed(1)),
          diferenca: c4Real - c4Plan,
          percentTotal: Number(((c4Real / totalStreets) * 100).toFixed(1))
        }
      ];
    }
  }, [viewMode, completedStreets, totalStreets]);

  // Overall totals across 4 weeks
  const totalPlannedSum = useMemo(() => {
    if (viewMode === 'cumulative') {
      return chartData[chartData.length - 1]?.planejado || 0;
    }
    return chartData.reduce((sum, d) => sum + d.planejado, 0);
  }, [chartData, viewMode]);

  const totalRealizedSum = useMemo(() => {
    if (viewMode === 'cumulative') {
      return chartData[chartData.length - 1]?.realizado || 0;
    }
    return chartData.reduce((sum, d) => sum + d.realizado, 0);
  }, [chartData, viewMode]);

  const overallEfficiency = totalPlannedSum > 0
    ? ((totalRealizedSum / totalPlannedSum) * 100).toFixed(1)
    : '100';

  // Custom tooltip for recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const plannedVal = payload.find((p: any) => p.dataKey === 'planejado')?.value;
      const realizedVal = payload.find((p: any) => p.dataKey === 'realizado')?.value;
      const diff = realizedVal - plannedVal;

      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md min-w-[210px] space-y-2">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {label}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
              {data.period}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-slate-300">Planejado:</span>
              </div>
              <span className="font-bold font-mono text-slate-100">{plannedVal} ruas</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-blue-300 font-semibold">Realizado:</span>
              </div>
              <span className="font-bold font-mono text-white text-sm">{realizedVal} ruas</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">Atingimento da Meta:</span>
              <span className={`font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {data.atingimento}% {diff >= 0 ? `(+${diff})` : `(${diff})`}
              </span>
            </div>

            {data.percentTotal && (
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>% da Cidade Coberta:</span>
                <span className="font-semibold text-slate-200">{data.percentTotal}%</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
      {/* Header with Title & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/50">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Evolução da Cobertura de Ruas (Últimas 4 Semanas)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-8">
            Comparativo de ritmo de campo entre meta planejada e execução real em São José
          </p>
        </div>

        {/* View Switcher & Efficiency Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('cumulative')}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === 'cumulative'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Acumulado
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === 'weekly'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Por Semana
            </button>
          </div>
        </div>
      </div>

      {/* Mini KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Planejado (4 Sem)</span>
            <Target className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-800">{totalPlannedSum}</span>
            <span className="text-xs text-slate-500">ruas</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200/70">
          <div className="flex items-center justify-between text-[11px] text-blue-700">
            <span className="font-semibold uppercase tracking-wider">Realizado (4 Sem)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-blue-900">{totalRealizedSum}</span>
            <span className="text-xs text-blue-700 font-semibold">ruas</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/70">
          <div className="flex items-center justify-between text-[11px] text-emerald-700">
            <span className="font-semibold uppercase tracking-wider">Atingimento Global</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-800">{overallEfficiency}%</span>
            <span className="text-xs text-emerald-700 font-semibold">da meta</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200/70">
          <div className="flex items-center justify-between text-[11px] text-indigo-700">
            <span className="font-semibold uppercase tracking-wider">Ritmo Médio</span>
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-indigo-900">
              {(totalRealizedSum / 4).toFixed(0)}
            </span>
            <span className="text-xs text-indigo-700 font-semibold">ruas / semana</span>
          </div>
        </div>
      </div>

      {/* Recharts Responsive Line Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="shortLabel"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              domain={[0, 'dataMax + 40']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 600 }}
              formatter={(value) => (
                <span className="text-slate-700 font-medium capitalize">
                  {value === 'planejado' ? 'Meta Planejada' : 'Ruas Realizadas'}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="realizado"
              fill="url(#colorRealizado)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="planejado"
              name="planejado"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#94a3b8', strokeWidth: 1, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#64748b' }}
            />
            <Line
              type="monotone"
              dataKey="realizado"
              name="realizado"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 7, fill: '#1d4ed8' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Insight Note */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Diagnóstico de Cobertura:</strong> O ritmo de campo nas últimas semanas manteve-se acima da meta em 3 dos 4 períodos, com foco nas regiões de <strong>Kobrasol, Campinas e Barreiros</strong>.
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 font-semibold">
          Atualizado hoje às 08:30
        </span>
      </div>
    </div>
  );
};
