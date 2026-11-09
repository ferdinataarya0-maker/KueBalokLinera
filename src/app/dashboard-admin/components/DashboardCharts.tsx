'use client';

import { useDSSData } from '@/lib/dss-store';
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import {
  calculateSAW,
  calculateWASPAS,
  formatNumber,
} from '@/lib/dss-data';

const COLORS_SAW = [
  'var(--primary)',
  'var(--secondary)',
  'var(--accent)',
  'var(--brown-400)',
  'var(--brown-300)',
  'var(--brown-200)',
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="card-warm px-3 py-2 text-sm"
      style={{ minWidth: '150px' }}
    >
      <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={`tp-${i}`} className="flex items-center justify-between gap-4">
          <span style={{ color: 'var(--muted-foreground)' }}>{p.name}</span>
          <span className="font-bold font-tabular" style={{ color: 'var(--primary)' }}>
            {formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardCharts() {
  const { alternatives: mockAlternatives, criteria: mockCriteria, assessments: mockAssessments, lambda: storeLambda } = useDSSData();
  const [activeTab, setActiveTab] = useState<'saw' | 'waspas' | 'comparison'>('comparison');

  // Backend integration point: Replace with Supabase calculation_results query
  const sawResults = calculateSAW(mockAlternatives, mockCriteria, mockAssessments);
  const waspasResults = calculateWASPAS(mockAlternatives, mockCriteria, mockAssessments, storeLambda);

  const sawChartData = [...sawResults]
    .sort((a, b) => b.nilaiSAW - a.nilaiSAW)
    .map((r) => ({
      name: r.nama,
      kode: r.kode,
      nilai: r.nilaiSAW,
      ranking: r.ranking,
    }));

  const waspasChartData = [...waspasResults]
    .sort((a, b) => b.nilaiQ - a.nilaiQ)
    .map((r) => ({
      name: r.nama,
      kode: r.kode,
      nilai: r.nilaiQ,
      ranking: r.ranking,
    }));

  const comparisonData = mockAlternatives.map((alt) => {
    const saw = sawResults.find((r) => r.alternativeId === alt.id);
    const wasp = waspasResults.find((r) => r.alternativeId === alt.id);
    return {
      name: alt.kode,
      fullName: alt.nama,
      SAW: saw ? saw.nilaiSAW : 0,
      WASPAS: wasp ? wasp.nilaiQ : 0,
    };
  });

  const tabs = [
    { id: 'comparison' as const, label: 'Perbandingan' },
    { id: 'saw' as const, label: 'Ranking SAW' },
    { id: 'waspas' as const, label: 'Ranking WASPAS' },
  ];

  return (
    <div className="card-warm p-5 h-full">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            Grafik Hasil Perhitungan
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Nilai SAW dan WASPAS per varian kue balok
          </p>
        </div>
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          {tabs.map((tab) => (
            <button
              key={`tab-chart-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--card)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(181,101,29,0.12)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'comparison' ? (
            <BarChart data={comparisonData} barCategoryGap="30%" barGap={4}>
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
                tickFormatter={(v: number) => v.toFixed(2)}
                domain={[0, 1]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: 'var(--muted-foreground)' }}
              />
              <Bar dataKey="SAW" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Nilai SAW" />
              <Bar dataKey="WASPAS" fill="var(--secondary)" radius={[4, 4, 0, 0]} name="Nilai WASPAS" />
            </BarChart>
          ) : (
            <BarChart
              data={activeTab === 'saw' ? sawChartData : waspasChartData}
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
              <Bar dataKey="nilai" radius={[4, 4, 0, 0]} name={activeTab === 'saw' ? 'Nilai SAW' : 'Nilai Q'}>
                {(activeTab === 'saw' ? sawChartData : waspasChartData).map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? 'var(--primary)' : COLORS_SAW[index] || 'var(--brown-300)'}
                    opacity={1 - index * 0.08}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <p className="text-xs mt-3 text-right" style={{ color: 'var(--muted-foreground)' }}>
        Dihitung otomatis dari data terbaru · λ = {storeLambda.toFixed(2)}
      </p>
    </div>
  );
}