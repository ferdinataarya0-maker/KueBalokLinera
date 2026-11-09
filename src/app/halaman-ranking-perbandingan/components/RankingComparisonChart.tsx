'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { SAWResult, WASPASResult } from '@/lib/dss-data';
import { formatNumber } from '@/lib/dss-data';

interface Props {
  sawResults: SAWResult[];
  waspasResults: WASPASResult[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; dataKey: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="card-warm px-4 py-3 text-sm"
      style={{ minWidth: '180px' }}
    >
      <p className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={`ctp-${i}`} className="flex items-center justify-between gap-6 mb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{
                backgroundColor: p.dataKey === 'SAW' ? 'var(--primary)' : 'var(--secondary)',
              }}
            />
            <span style={{ color: 'var(--muted-foreground)' }}>{p.name}</span>
          </div>
          <span className="font-bold font-tabular" style={{ color: 'var(--foreground)' }}>
            {formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RankingComparisonChart({ sawResults, waspasResults }: Props) {
  const [chartType, setChartType] = useState<'grouped' | 'saw' | 'waspas'>('grouped');

  const sortedSAW = [...sawResults].sort((a, b) => b.nilaiSAW - a.nilaiSAW);
  const sortedWASPAS = [...waspasResults].sort((a, b) => b.nilaiQ - a.nilaiQ);

  const groupedData = sawResults.map((saw) => {
    const wasp = waspasResults.find((w) => w.alternativeId === saw.alternativeId);
    return {
      name: `${saw.kode} - ${saw.nama}`,
      shortName: saw.kode,
      fullName: saw.nama,
      SAW: saw.nilaiSAW,
      WASPAS: wasp ? wasp.nilaiQ : 0,
      rankSAW: saw.ranking,
      rankWASPAS: wasp ? wasp.ranking : 0,
    };
  }).sort((a, b) => a.rankSAW - b.rankSAW);

  const sawData = sortedSAW.map((r, i) => ({
    name: r.kode,
    fullName: r.nama,
    nilai: r.nilaiSAW,
    ranking: r.ranking,
    color: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--brown-400)' : 'var(--brown-300)',
  }));

  const waspasData = sortedWASPAS.map((r, i) => ({
    name: r.kode,
    fullName: r.nama,
    nilai: r.nilaiQ,
    ranking: r.ranking,
    color: i === 0 ? 'var(--secondary)' : i === 1 ? 'var(--peach-300)' : 'var(--peach-200)',
  }));

  const avgSAW = sawResults.reduce((s, r) => s + r.nilaiSAW, 0) / sawResults.length;
  const avgWASPAS = waspasResults.reduce((s, r) => s + r.nilaiQ, 0) / waspasResults.length;

  return (
    <div className="card-warm p-5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            Grafik Perbandingan Nilai SAW & WASPAS
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Visualisasi nilai akhir per varian kue balok
          </p>
        </div>
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          {[
            { id: 'grouped' as const, label: 'Gabungan' },
            { id: 'saw' as const, label: 'SAW' },
            { id: 'waspas' as const, label: 'WASPAS' },
          ].map((opt) => (
            <button
              key={`chart-opt-${opt.id}`}
              onClick={() => setChartType(opt.id)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
              style={{
                backgroundColor: chartType === opt.id ? 'var(--card)' : 'transparent',
                color: chartType === opt.id ? 'var(--primary)' : 'var(--muted-foreground)',
                boxShadow: chartType === opt.id ? '0 1px 3px rgba(181,101,29,0.12)' : 'none',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Nilai SAW Tertinggi', value: formatNumber(Math.max(...sawResults.map(r => r.nilaiSAW))), color: 'var(--primary)' },
          { label: 'Rata-rata SAW', value: formatNumber(avgSAW), color: 'var(--brown-400)' },
          { label: 'Nilai WASPAS Tertinggi', value: formatNumber(Math.max(...waspasResults.map(r => r.nilaiQ))), color: 'var(--secondary)' },
          { label: 'Rata-rata WASPAS', value: formatNumber(avgWASPAS), color: 'var(--peach-400)' },
        ].map((stat, i) => (
          <div
            key={`stat-${i}`}
            className="p-3 rounded-xl text-center"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            <p className="text-lg font-bold font-tabular" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div style={{ height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'grouped' ? (
            <BarChart data={groupedData} barCategoryGap="25%" barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v.toFixed(3)}
                domain={[0, 1]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine
                y={avgSAW}
                stroke="var(--primary)"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
                label={{ value: 'Avg SAW', position: 'insideTopRight', fontSize: 10, fill: 'var(--primary)' }}
              />
              <Bar dataKey="SAW" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Nilai SAW" />
              <Bar dataKey="WASPAS" fill="var(--secondary)" radius={[4, 4, 0, 0]} name="Nilai WASPAS (Q)" />
            </BarChart>
          ) : (
            <BarChart
              data={chartType === 'saw' ? sawData : waspasData}
              barCategoryGap="35%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v.toFixed(3)}
                domain={[0, 1]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="nilai"
                radius={[5, 5, 0, 0]}
                name={chartType === 'saw' ? 'Nilai SAW' : 'Nilai Q (WASPAS)'}
              >
                {(chartType === 'saw' ? sawData : waspasData).map((entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}