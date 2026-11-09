'use client';

import React, { useState } from 'react';
import type { SAWResult, Criteria } from '@/lib/dss-data';
import { formatNumber, normalizedWeight } from '@/lib/dss-data';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  results: SAWResult[];
  criteria: Criteria[];
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold badge-rank-1">
        🥇 1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold badge-rank-2">
        🥈 2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold badge-rank-3">
        🥉 3
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
      style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
    >
      {rank}
    </span>
  );
}

type SortKey = 'ranking' | 'nilaiSAW' | string;

export default function RankingTableSAW({ results, criteria }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('ranking');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'ranking' ? 'asc' : 'desc');
    }
  };

  const sorted = [...results].sort((a, b) => {
    let aVal: number, bVal: number;
    if (sortKey === 'ranking') {
      aVal = a.ranking; bVal = b.ranking;
    } else if (sortKey === 'nilaiSAW') {
      aVal = a.nilaiSAW; bVal = b.nilaiSAW;
    } else {
      aVal = a.normalizedValues[sortKey] || 0;
      bVal = b.normalizedValues[sortKey] || 0;
    }
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  return (
    <div className="card-warm overflow-hidden">
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            Ranking Metode SAW
          </h3>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}
          >
            Simple Additive Weighting
          </span>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
          Vi = Σ(Wj × Rij) — Semakin besar nilai Vi, semakin baik peringkat
        </p>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ backgroundColor: 'var(--muted)' }}>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer select-none whitespace-nowrap"
                style={{ color: 'var(--muted-foreground)', fontSize: '12px', letterSpacing: '0.04em' }}
                onClick={() => handleSort('ranking')}
              >
                <div className="flex items-center gap-1.5">
                  PERINGKAT <SortIcon col="ranking" />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                style={{ color: 'var(--muted-foreground)', fontSize: '12px', letterSpacing: '0.04em' }}>
                KODE
              </th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                style={{ color: 'var(--muted-foreground)', fontSize: '12px', letterSpacing: '0.04em' }}>
                NAMA VARIAN
              </th>
              {criteria.map((c) => (
                <th
                  key={`th-saw-${c.id}`}
                  className="px-4 py-3 text-center font-semibold cursor-pointer select-none whitespace-nowrap"
                  style={{ color: 'var(--muted-foreground)', fontSize: '12px', letterSpacing: '0.04em' }}
                  onClick={() => handleSort(c.id)}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{c.kode}</span>
                    <span
                      className="text-xs px-1 rounded"
                      style={{
                        backgroundColor: c.jenis === 'BENEFIT' ? 'var(--success-bg)' : 'var(--error-bg)',
                        color: c.jenis === 'BENEFIT' ? 'var(--success)' : 'var(--error)',
                        fontSize: '9px',
                      }}
                    >
                      {c.jenis}
                    </span>
                    <SortIcon col={c.id} />
                  </div>
                  <div className="text-xs font-normal" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
                    r(norm)
                  </div>
                </th>
              ))}
              <th
                className="px-4 py-3 text-center font-semibold cursor-pointer select-none whitespace-nowrap"
                style={{ color: 'var(--muted-foreground)', fontSize: '12px', letterSpacing: '0.04em', backgroundColor: 'var(--brown-100)' }}
                onClick={() => handleSort('nilaiSAW')}
              >
                <div className="flex items-center justify-center gap-1">
                  NILAI SAW (Vi) <SortIcon col="nilaiSAW" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr
                key={`saw-row-${row.alternativeId}`}
                className="table-row-hover"
                style={{
                  backgroundColor: idx % 2 === 0 ? 'var(--card)' : 'var(--brown-50)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <td className="px-4 py-3">
                  <RankBadge rank={row.ranking} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className="font-mono text-xs font-bold px-2 py-1 rounded"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}
                  >
                    {row.kode}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                  {row.nama}
                </td>
                {criteria.map((c) => (
                  <td
                    key={`td-saw-${row.alternativeId}-${c.id}`}
                    className="px-4 py-3 text-center font-tabular"
                    style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}
                  >
                    {formatNumber(row.normalizedValues[c.id] || 0)}
                  </td>
                ))}
                <td
                  className="px-4 py-3 text-center font-tabular font-bold"
                  style={{ color: 'var(--primary)', fontSize: '14px', backgroundColor: row.ranking === 1 ? 'rgba(181,101,29,0.06)' : undefined }}
                >
                  {formatNumber(row.nilaiSAW)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: 'var(--brown-100)', borderTop: '2px solid var(--border)' }}>
              <td colSpan={3} className="px-4 py-3 font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                Bobot (Wj)
              </td>
              {criteria.map((c) => (
                <td
                  key={`tf-saw-${c.id}`}
                  className="px-4 py-3 text-center font-tabular font-semibold text-sm"
                  style={{ color: 'var(--primary)' }}
                >
                  {normalizedWeight(c, criteria).toFixed(4)}
                </td>
              ))}
              <td className="px-4 py-3 text-center font-semibold text-sm" style={{ color: 'var(--primary)' }}>
                —
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Formula note */}
      <div className="p-4 mx-5 mb-5 mt-3 rounded-xl text-xs" style={{ backgroundColor: 'var(--muted)' }}>
        <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Formula Normalisasi SAW:</p>
        <p style={{ color: 'var(--muted-foreground)' }}>
          • <strong>BENEFIT:</strong> r<sub>ij</sub> = x<sub>ij</sub> / max(x<sub>ij</sub>) &nbsp;|&nbsp;
          • <strong>COST:</strong> r<sub>ij</sub> = min(x<sub>ij</sub>) / x<sub>ij</sub> &nbsp;|&nbsp;
          • <strong>Nilai Akhir:</strong> V<sub>i</sub> = Σ(W<sub>j</sub> × r<sub>ij</sub>)
        </p>
      </div>
    </div>
  );
}