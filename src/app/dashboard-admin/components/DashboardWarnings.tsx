'use client';

import { useDSSData } from '@/lib/dss-store';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function DashboardWarnings() {
  const { alternatives: mockAlternatives, criteria: mockCriteria, assessments: mockAssessments } = useDSSData();
  const totalBobot = mockCriteria.reduce((s, c) => s + c.bobot, 0);
  const bobotValid = mockCriteria.length > 0 && totalBobot > 0 && mockCriteria.every((c) => c.bobot > 0);

  const totalExpected = mockAlternatives?.length * mockCriteria?.length;
  const totalAssessments = mockAssessments.filter((x) => mockAlternatives.some((a) => a.id === x.alternativeId) && mockCriteria.some((c) => c.id === x.criteriaId)).length;
  const penilaianLengkap = totalAssessments >= totalExpected;

  if (bobotValid && penilaianLengkap) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
        style={{
          backgroundColor: 'var(--success-bg)',
          border: '1px solid rgba(45,106,79,0.25)',
          color: 'var(--success)',
        }}
      >
        <CheckCircle size={16} className="flex-shrink-0" />
        <span className="font-medium">
          Semua data siap — bobot valid (total {totalBobot}, dinormalisasi otomatis) dan semua penilaian telah diisi. Perhitungan dapat dilakukan.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!bobotValid && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: 'var(--error-bg)',
            border: '1px solid rgba(197,48,48,0.25)',
            color: 'var(--error)',
          }}
        >
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span className="font-medium">
            Bobot kriteria belum valid (total {totalBobot}) — setiap kriteria harus memiliki bobot lebih dari 0.
          </span>
        </div>
      )}
      {!penilaianLengkap && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: 'var(--warning-bg)',
            border: '1px solid rgba(183,121,31,0.25)',
            color: 'var(--warning)',
          }}
        >
          <Info size={16} className="flex-shrink-0" />
          <span className="font-medium">
            Penilaian belum lengkap — {totalAssessments}/{totalExpected} nilai telah diisi. Lengkapi penilaian untuk semua varian dan kriteria.
          </span>
        </div>
      )}
    </div>
  );
}