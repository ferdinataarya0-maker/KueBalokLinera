'use client';

import React, { useState } from 'react';
import type { Alternative, Criteria, Assessment, SAWResult, WASPASResult } from '@/lib/dss-data';
import {
  getAssessmentMatrix,
  normalizeSAW,
  formatNumber,
  formatRupiah,
  normalizedWeight,
  totalBobot,
  isPriceCriteria,
} from '@/lib/dss-data';
import { ChevronDown, ChevronRight, BookOpen, Table2, Calculator } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface Props {
  alternatives: Alternative[];
  criteria: Criteria[];
  assessments: Assessment[];
  sawResults: SAWResult[];
  waspasResults: WASPASResult[];
  lambda: number;
}

type SectionId = 'matrix' | 'normalization' | 'weights' | 'saw-steps' | 'waspas-steps';

export default function RankingDetailAccordion({
  alternatives,
  criteria,
  assessments,
  sawResults,
  waspasResults,
  lambda,
}: Props) {
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set(['matrix']));

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const matrix = getAssessmentMatrix(alternatives, criteria, assessments);
  const normalized = normalizeSAW(alternatives, criteria, matrix);

  const sections: { id: SectionId; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'matrix', label: 'Langkah 1 — Matriks Keputusan (X)', icon: Table2, desc: 'Nilai asli setiap varian pada setiap kriteria' },
    { id: 'normalization', label: 'Langkah 2 — Matriks Normalisasi (R)', icon: Calculator, desc: 'Normalisasi BENEFIT = Xij/max(Xij), COST = min(Xij)/Xij' },
    { id: 'weights', label: 'Langkah 3 — Bobot Kriteria (W)', icon: BookOpen, desc: 'Wj = bobot ÷ total bobot (total Wj = 1)' },
    { id: 'saw-steps', label: 'Langkah 4 — Perhitungan SAW (Vi)', icon: Calculator, desc: 'Vi = Σ(Wj × Rij) untuk setiap alternatif' },
    { id: 'waspas-steps', label: 'Langkah 5 — Perhitungan WASPAS (Q)', icon: Calculator, desc: `WSM, WPM, dan Q = λ×WSM + (1−λ)×WPM dengan λ=${lambda.toFixed(2)}` },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen size={18} style={{ color: 'var(--primary)' }} />
        <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
          Detail Langkah Perhitungan
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          Untuk keperluan akademik
        </span>
      </div>

      {sections.map((section) => {
        const isOpen = openSections.has(section.id);
        const Icon = section.icon;

        return (
          <div
            key={`accordion-${section.id}`}
            className="card-warm overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-3 p-4 text-left transition-colors"
              style={{
                backgroundColor: isOpen ? 'var(--muted)' : 'var(--card)',
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: isOpen ? 'var(--primary)' : 'var(--muted)' }}
              >
                <Icon size={16} style={{ color: isOpen ? 'var(--primary-foreground)' : 'var(--primary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                  {section.label}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {section.desc}
                </p>
              </div>
              {isOpen ? (
                <ChevronDown size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              ) : (
                <ChevronRight size={18} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
              )}
            </button>

            {isOpen && (
              <div className="animate-slide-up">
                {/* MATRIX */}
                {section.id === 'matrix' && (
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--muted)' }}>
                          <th className="px-4 py-2.5 text-left font-semibold text-xs" style={{ color: 'var(--muted-foreground)' }}>Alternatif</th>
                          {criteria.map((c) => (
                            <th
                              key={`mh-${c.id}`}
                              className="px-4 py-2.5 text-center font-semibold text-xs whitespace-nowrap"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              <div>{c.kode}</div>
                              <div style={{ fontSize: '10px', fontWeight: 400 }}>{c.nama}</div>
                              <div>
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
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {alternatives.map((alt, idx) => (
                          <tr
                            key={`mat-${alt.id}`}
                            style={{
                              backgroundColor: idx % 2 === 0 ? 'var(--card)' : 'var(--brown-50)',
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            <td className="px-4 py-2.5 font-medium text-sm">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded mr-2"
                                style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}>
                                {alt.kode}
                              </span>
                              {alt.nama}
                            </td>
                            {criteria.map((c) => (
                              <td
                                key={`mat-${alt.id}-${c.id}`}
                                className="px-4 py-2.5 text-center font-tabular text-sm"
                                style={{ color: 'var(--foreground)' }}
                              >
                                {isPriceCriteria(c)
                                  ? formatRupiah(matrix[alt.id][c.id])
                                  : matrix[alt.id][c.id].toLocaleString('id-ID')}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {/* Max/Min row */}
                        <tr style={{ backgroundColor: 'var(--brown-100)', borderTop: '2px solid var(--border)' }}>
                          <td className="px-4 py-2.5 font-semibold text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            Max / Min
                          </td>
                          {criteria.map((c) => {
                            const vals = alternatives.map((a) => matrix[a.id][c.id]);
                            const val = c.jenis === 'BENEFIT' ? Math.max(...vals) : Math.min(...vals);
                            return (
                              <td
                                key={`minmax-${c.id}`}
                                className="px-4 py-2.5 text-center font-tabular font-bold text-xs"
                                style={{ color: c.jenis === 'BENEFIT' ? 'var(--success)' : 'var(--error)' }}
                              >
                                {c.jenis === 'BENEFIT' ? '↑' : '↓'}{' '}
                                {isPriceCriteria(c) ? formatRupiah(val) : val.toLocaleString('id-ID')}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* NORMALIZATION */}
                {section.id === 'normalization' && (
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--muted)' }}>
                          <th className="px-4 py-2.5 text-left font-semibold text-xs" style={{ color: 'var(--muted-foreground)' }}>Alternatif</th>
                          {criteria.map((c) => (
                            <th
                              key={`nh-${c.id}`}
                              className="px-4 py-2.5 text-center font-semibold text-xs whitespace-nowrap"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              r({c.kode})
                              <div style={{ fontSize: '10px', fontWeight: 400 }}>
                                {c.jenis === 'BENEFIT' ? 'xij/max' : 'min/xij'}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {alternatives.map((alt, idx) => (
                          <tr
                            key={`norm-${alt.id}`}
                            style={{
                              backgroundColor: idx % 2 === 0 ? 'var(--card)' : 'var(--brown-50)',
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            <td className="px-4 py-2.5 font-medium text-sm">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded mr-2"
                                style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}>
                                {alt.kode}
                              </span>
                              {alt.nama}
                            </td>
                            {criteria.map((c) => (
                              <td
                                key={`norm-${alt.id}-${c.id}`}
                                className="px-4 py-2.5 text-center font-tabular text-sm"
                                style={{ color: 'var(--foreground)' }}
                              >
                                {formatNumber(normalized[alt.id][c.id] || 0)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* WEIGHTS */}
                {section.id === 'weights' && (
                  <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                      {criteria.map((c) => (
                        <div
                          key={`wt-${c.id}`}
                          className="p-4 rounded-xl text-center"
                          style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
                        >
                          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>
                            {c.kode}
                          </p>
                          <p className="text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                            {c.nama}
                          </p>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                backgroundColor: c.jenis === 'BENEFIT' ? 'var(--success-bg)' : 'var(--error-bg)',
                                color: c.jenis === 'BENEFIT' ? 'var(--success)' : 'var(--error)',
                              }}
                            >
                              {c.jenis}
                            </span>
                          </div>
                          <p className="text-2xl font-extrabold font-tabular" style={{ color: 'var(--primary)' }}>
                            {(normalizedWeight(c, criteria) * 100).toLocaleString('id-ID', { maximumFractionDigits: 2 })}%
                          </p>
                          <p className="text-sm font-semibold font-tabular mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                            Bobot {c.bobot} · W = {normalizedWeight(c, criteria).toFixed(4)}
                          </p>
                          {/* Mini bar */}
                          <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${normalizedWeight(c, criteria) * 100}%`,
                                backgroundColor: 'var(--primary)',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      className="mt-4 p-3 rounded-xl text-sm text-center font-semibold"
                      style={{
                        backgroundColor: totalBobot(criteria) > 0 ? 'var(--success-bg)' : 'var(--error-bg)',
                        color: totalBobot(criteria) > 0 ? 'var(--success)' : 'var(--error)',
                      }}
                    >
                      Total bobot: {totalBobot(criteria)} → Σ Wj = {criteria.reduce((sum, c) => sum + normalizedWeight(c, criteria), 0).toFixed(4)}
                      {totalBobot(criteria) > 0 ? ' ✓ Valid' : ' ✗ Bobot harus lebih dari 0'}
                    </div>
                  </div>
                )}

                {/* SAW STEPS */}
                {section.id === 'saw-steps' && (
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--muted)' }}>
                          <th className="px-4 py-2.5 text-left font-semibold text-xs" style={{ color: 'var(--muted-foreground)' }}>Alternatif</th>
                          {criteria.map((c) => (
                            <th
                              key={`sawsh-${c.id}`}
                              className="px-4 py-2.5 text-center font-semibold text-xs whitespace-nowrap"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              W{c.kode}×r{c.kode}
                              <div style={{ fontSize: '10px', fontWeight: 400 }}>
                                ({normalizedWeight(c, criteria).toFixed(4)} × r)
                              </div>
                            </th>
                          ))}
                          <th
                            className="px-4 py-2.5 text-center font-semibold text-xs whitespace-nowrap"
                            style={{ color: 'var(--primary)', backgroundColor: 'var(--brown-100)' }}
                          >
                            Vi (SAW)
                          </th>
                          <th
                            className="px-4 py-2.5 text-center font-semibold text-xs whitespace-nowrap"
                            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--brown-100)' }}
                          >
                            Ranking
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sawResults.map((row, idx) => (
                          <tr
                            key={`saws-${row.alternativeId}`}
                            style={{
                              backgroundColor: idx % 2 === 0 ? 'var(--card)' : 'var(--brown-50)',
                              borderBottom: '1px solid var(--border)',
                            }}
                          >
                            <td className="px-4 py-2.5 font-medium text-sm">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded mr-2"
                                style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}>
                                {row.kode}
                              </span>
                              {row.nama}
                            </td>
                            {criteria.map((c) => (
                              <td
                                key={`saws-${row.alternativeId}-${c.id}`}
                                className="px-4 py-2.5 text-center font-tabular text-xs"
                                style={{ color: 'var(--muted-foreground)' }}
                              >
                                {formatNumber(row.weightedValues[c.id] || 0)}
                              </td>
                            ))}
                            <td
                              className="px-4 py-2.5 text-center font-tabular font-bold text-sm"
                              style={{ color: 'var(--primary)', backgroundColor: row.ranking === 1 ? 'rgba(181,101,29,0.06)' : 'rgba(181,101,29,0.02)' }}
                            >
                              {formatNumber(row.nilaiSAW)}
                            </td>
                            <td
                              className="px-4 py-2.5 text-center"
                              style={{ backgroundColor: row.ranking === 1 ? 'rgba(181,101,29,0.06)' : 'rgba(181,101,29,0.02)' }}
                            >
                              {row.ranking === 1 ? '🥇' : row.ranking === 2 ? '🥈' : row.ranking === 3 ? '🥉' : `#${row.ranking}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* WASPAS STEPS */}
                {section.id === 'waspas-steps' && (
                  <div className="p-5 space-y-4">
                    {/* Lambda info */}
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl text-sm"
                      style={{ backgroundColor: 'var(--peach-100)', border: '1px solid rgba(231,111,81,0.2)' }}
                    >
                      <span className="font-bold text-base font-tabular" style={{ color: 'var(--accent)' }}>λ = {lambda.toFixed(2)}</span>
                      <span style={{ color: 'var(--muted-foreground)' }}>|</span>
                      <span style={{ color: 'var(--muted-foreground)' }}>1−λ = {(1 - lambda).toFixed(2)}</span>
                      <span style={{ color: 'var(--muted-foreground)' }}>|</span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Q = {lambda.toFixed(2)} × WSM + {(1 - lambda).toFixed(2)} × WPM
                      </span>
                    </div>

                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr style={{ backgroundColor: 'var(--muted)' }}>
                            <th className="px-4 py-2.5 text-left font-semibold text-xs" style={{ color: 'var(--muted-foreground)' }}>Alternatif</th>
                            <th className="px-4 py-2.5 text-center font-semibold text-xs whitespace-nowrap"
                              style={{ color: 'var(--info)', backgroundColor: 'var(--info-bg)' }}>
                              WSM<br />
                              <span style={{ fontSize: '10px', fontWeight: 400 }}>Σ(Wj×rij)</span>
                            </th>
                            <th className="px-4 py-2.5 text-center font-semibold text-xs whitespace-nowrap"
                              style={{ color: 'var(--accent)', backgroundColor: 'var(--peach-100)' }}>
                              WPM<br />
                              <span style={{ fontSize: '10px', fontWeight: 400 }}>Π(rij^Wj)</span>
                            </th>
                            <th className="px-4 py-2.5 text-center font-semibold text-xs whitespace-nowrap"
                              style={{ color: 'var(--muted-foreground)' }}>
                              λ×WSM<br />
                              <span style={{ fontSize: '10px', fontWeight: 400 }}>({lambda.toFixed(2)}×WSM)</span>
                            </th>
                            <th className="px-4 py-2.5 text-center font-semibold text-xs whitespace-nowrap"
                              style={{ color: 'var(--muted-foreground)' }}>
                              (1−λ)×WPM<br />
                              <span style={{ fontSize: '10px', fontWeight: 400 }}>({(1 - lambda).toFixed(2)}×WPM)</span>
                            </th>
                            <th
                              className="px-4 py-2.5 text-center font-semibold text-xs whitespace-nowrap"
                              style={{ color: 'var(--primary)', backgroundColor: 'var(--brown-100)' }}
                            >
                              Q (WASPAS)<br />
                              <span style={{ fontSize: '10px', fontWeight: 400 }}>λWSM+(1−λ)WPM</span>
                            </th>
                            <th
                              className="px-4 py-2.5 text-center font-semibold text-xs"
                              style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--brown-100)' }}
                            >
                              Ranking
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {waspasResults.map((row, idx) => (
                            <tr
                              key={`wasps-${row.alternativeId}`}
                              style={{
                                backgroundColor: idx % 2 === 0 ? 'var(--card)' : 'var(--brown-50)',
                                borderBottom: '1px solid var(--border)',
                              }}
                            >
                              <td className="px-4 py-2.5 font-medium text-sm">
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded mr-2"
                                  style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}>
                                  {row.kode}
                                </span>
                                {row.nama}
                              </td>
                              <td
                                className="px-4 py-2.5 text-center font-tabular text-sm font-semibold"
                                style={{ color: 'var(--info)', backgroundColor: 'rgba(43,108,176,0.04)' }}
                              >
                                {formatNumber(row.wsm)}
                              </td>
                              <td
                                className="px-4 py-2.5 text-center font-tabular text-sm font-semibold"
                                style={{ color: 'var(--accent)', backgroundColor: 'rgba(231,111,81,0.04)' }}
                              >
                                {formatNumber(row.wpm)}
                              </td>
                              <td
                                className="px-4 py-2.5 text-center font-tabular text-sm"
                                style={{ color: 'var(--muted-foreground)' }}
                              >
                                {formatNumber(lambda * row.wsm)}
                              </td>
                              <td
                                className="px-4 py-2.5 text-center font-tabular text-sm"
                                style={{ color: 'var(--muted-foreground)' }}
                              >
                                {formatNumber((1 - lambda) * row.wpm)}
                              </td>
                              <td
                                className="px-4 py-2.5 text-center font-tabular font-bold text-sm"
                                style={{
                                  color: 'var(--primary)',
                                  backgroundColor: row.ranking === 1 ? 'rgba(181,101,29,0.06)' : 'rgba(181,101,29,0.02)',
                                }}
                              >
                                {formatNumber(row.nilaiQ)}
                              </td>
                              <td
                                className="px-4 py-2.5 text-center"
                                style={{ backgroundColor: row.ranking === 1 ? 'rgba(181,101,29,0.06)' : 'rgba(181,101,29,0.02)' }}
                              >
                                {row.ranking === 1 ? '🥇' : row.ranking === 2 ? '🥈' : row.ranking === 3 ? '🥉' : `#${row.ranking}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}