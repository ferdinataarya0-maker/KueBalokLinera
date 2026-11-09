'use client';

import React from 'react';
import type { ComparisonResult } from '@/lib/dss-data';
import { formatNumber } from '@/lib/dss-data';
import { ArrowRight } from 'lucide-react';

interface Props {
  comparison: ComparisonResult[];
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="badge-rank-1 px-2.5 py-1 rounded-full text-xs">🥇 #{rank}</span>;
  if (rank === 2) return <span className="badge-rank-2 px-2.5 py-1 rounded-full text-xs">🥈 #{rank}</span>;
  if (rank === 3) return <span className="badge-rank-3 px-2.5 py-1 rounded-full text-xs">🥉 #{rank}</span>;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
    >
      #{rank}
    </span>
  );
}

export default function RankingComparison({ comparison }: Props) {
  const sortedByRankSAW = [...comparison].sort((a, b) => a.rankingSAW - b.rankingSAW);

  return (
    <div className="card-warm overflow-hidden">
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
            Tabel Perbandingan SAW vs WASPAS
          </h3>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            {comparison.length} varian dibandingkan
          </span>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
          Perbandingan ranking dan nilai akhir kedua metode per varian kue balok
        </p>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ backgroundColor: 'var(--muted)' }}>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                style={{ color: 'var(--muted-foreground)', fontSize: '12px', letterSpacing: '0.04em' }}>
                KODE
              </th>
              <th className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                style={{ color: 'var(--muted-foreground)', fontSize: '12px', letterSpacing: '0.04em' }}>
                NAMA VARIAN
              </th>
              <th className="px-4 py-3 text-center font-semibold whitespace-nowrap"
                style={{ color: 'var(--muted-foreground)', fontSize: '12px', letterSpacing: '0.04em', backgroundColor: 'rgba(181,101,29,0.08)' }}>
                RANKING SAW
              </th>
              <th className="px-4 py-3 text-center font-semibold whitespace-nowrap"
                style={{ color: 'var(--muted-foreground)', fontSize: '12px', letterSpacing: '0.04em', backgroundColor: 'rgba(181,101,29,0.08)' }}>
                NILAI SAW (Vi)
              </th>
              <th className="px-4 py-3 text-center font-semibold whitespace-nowrap"
                style={{ color: 'var(--muted-foreground)', fontSize: '12px', letterSpacing: '0.04em', backgroundColor: 'rgba(244,162,97,0.15)' }}>
                RANKING WASPAS
              </th>
              <th className="px-4 py-3 text-center font-semibold whitespace-nowrap"
                style={{ color: 'var(--muted-foreground)', fontSize: '12px', letterSpacing: '0.04em', backgroundColor: 'rgba(244,162,97,0.15)' }}>
                NILAI WASPAS (Q)
              </th>
              <th className="px-4 py-3 text-center font-semibold whitespace-nowrap"
                style={{ color: 'var(--muted-foreground)', fontSize: '12px', letterSpacing: '0.04em' }}>
                SELISIH RANKING
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedByRankSAW.map((row, idx) => {
              const rankDiff = row.rankingSAW - row.rankingWASPAS;
              const isSameRank = rankDiff === 0;
              return (
                <tr
                  key={`cmp-row-${row.alternativeId}`}
                  className="table-row-hover"
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'var(--card)' : 'var(--brown-50)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
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
                  <td className="px-4 py-3 text-center" style={{ backgroundColor: 'rgba(181,101,29,0.04)' }}>
                    <RankBadge rank={row.rankingSAW} />
                  </td>
                  <td
                    className="px-4 py-3 text-center font-tabular font-bold"
                    style={{ color: 'var(--primary)', backgroundColor: 'rgba(181,101,29,0.04)' }}
                  >
                    {formatNumber(row.nilaiSAW)}
                  </td>
                  <td className="px-4 py-3 text-center" style={{ backgroundColor: 'rgba(244,162,97,0.08)' }}>
                    <RankBadge rank={row.rankingWASPAS} />
                  </td>
                  <td
                    className="px-4 py-3 text-center font-tabular font-bold"
                    style={{ color: 'var(--secondary)', backgroundColor: 'rgba(244,162,97,0.08)' }}
                  >
                    {formatNumber(row.nilaiWASPAS)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isSameRank ? (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}
                      >
                        ✓ Sama
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}
                      >
                        <ArrowRight size={10} />
                        {Math.abs(rankDiff)} posisi
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-5 pt-4 flex flex-wrap gap-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--success)' }}
          />
          <span>Ranking SAW = Ranking WASPAS (konsisten)</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--warning)' }}
          />
          <span>Ranking berbeda antara SAW dan WASPAS</span>
        </div>
      </div>
    </div>
  );
}