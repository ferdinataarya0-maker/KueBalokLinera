'use client';

import React from 'react';
import { useDSSData } from '@/lib/dss-store';
import { calculateSAW, calculateWASPAS, getAssessmentMatrix, formatNumber, normalizedWeight } from '@/lib/dss-data';
import { Card, CardHeader, DataTable, Td, Badge, Loading } from '@/components/ui/Parts';

function useCalc() {
  const d = useDSSData();
  const ok = d.ready && d.alternatives.length > 0 && d.criteria.length > 0;
  const saw = ok ? calculateSAW(d.alternatives, d.criteria, d.assessments) : [];
  const waspas = ok ? calculateWASPAS(d.alternatives, d.criteria, d.assessments, d.lambda) : [];
  const matrix = ok ? getAssessmentMatrix(d.alternatives, d.criteria, d.assessments) : {};
  return { ...d, ok, saw, waspas, matrix };
}

const Empty = () => (
  <Card><p className="text-sm text-center py-6" style={{ color: 'var(--muted-foreground)' }}>Data varian/kriteria belum lengkap, perhitungan belum bisa dilakukan.</p></Card>
);

export function SawNormalisasi() {
  const c = useCalc();
  if (!c.ready) return <Loading />;
  if (!c.ok) return <Empty />;
  const stat = (critId: string, kind: 'max' | 'min') => {
    const vals = c.alternatives.map((a) => c.matrix[a.id][critId]);
    return kind === 'max' ? Math.max(...vals) : Math.min(...vals);
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader title="Langkah 1 — Nilai Maksimum / Minimum" desc="Benefit memakai nilai maksimum kolom, Cost memakai nilai minimum kolom" />
        <DataTable head={['Keterangan', ...c.criteria.map((x) => `${x.kode} ${x.nama}`)]}>
          <tr><Td className="font-medium">Jenis</Td>{c.criteria.map((x) => <Td key={x.id}><Badge tone={x.jenis === 'BENEFIT' ? 'success' : 'warning'}>{x.jenis === 'BENEFIT' ? 'Benefit' : 'Cost'}</Badge></Td>)}</tr>
          <tr><Td className="font-medium">Max</Td>{c.criteria.map((x) => <Td key={x.id}>{stat(x.id, 'max').toLocaleString('id-ID')}</Td>)}</tr>
          <tr><Td className="font-medium">Min</Td>{c.criteria.map((x) => <Td key={x.id}>{stat(x.id, 'min').toLocaleString('id-ID')}</Td>)}</tr>
          <tr><Td className="font-medium">Bobot (Wj)</Td>{c.criteria.map((x) => <Td key={x.id}>{formatNumber(normalizedWeight(x, c.criteria), 4)}</Td>)}</tr>
        </DataTable>
        <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>Rumus: Benefit r = x / max · Cost r = min / x · Wj = bobot ÷ total bobot</p>
        {c.criteria.some((x) => x.truncateDecimals !== undefined) && (
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Pemotongan desimal (TRUNC) aktif pada: {c.criteria.filter((x) => x.truncateDecimals !== undefined).map((x) => `${x.kode} ${x.nama} (${x.truncateDecimals} desimal)`).join(', ')} — sesuai perhitungan Excel penelitian. Dapat diubah di Data Kriteria.
          </p>
        )}
      </Card>
      <Card>
        <CardHeader title="Langkah 2 — Matriks Ternormalisasi (R)" />
        <DataTable head={['Varian', ...c.criteria.map((x) => `${x.kode} ${x.nama}`)]}>
          {c.saw.slice().sort((a, b) => a.kode.localeCompare(b.kode, undefined, { numeric: true })).map((r) => (
            <tr key={r.alternativeId} className="table-row-hover">
              <Td className="font-medium whitespace-nowrap"><span className="font-semibold" style={{ color: 'var(--primary)' }}>{r.kode}</span> {r.nama}</Td>
              {c.criteria.map((x) => <Td key={x.id}>{formatNumber(r.normalizedValues[x.id])}</Td>)}
            </tr>
          ))}
        </DataTable>
      </Card>
    </div>
  );
}

export function SawPreferensi() {
  const c = useCalc();
  if (!c.ready) return <Loading />;
  if (!c.ok) return <Empty />;
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader title="Nilai Preferensi SAW (V)" desc="V = Σ (Wj × rij), dengan Wj = bobot ÷ total bobot" />
        <DataTable head={['Rank', 'Varian', ...c.criteria.map((x) => `${x.kode} (W ${formatNumber(normalizedWeight(x, c.criteria), 4)})`), 'Nilai V']}>
          {c.saw.map((r) => (
            <tr key={r.alternativeId} className="table-row-hover">
              <Td><span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${r.ranking <= 3 ? `badge-rank-${r.ranking}` : ''}`} style={r.ranking > 3 ? { backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' } : undefined}>{r.ranking}</span></Td>
              <Td className="font-medium whitespace-nowrap">{r.nama}</Td>
              {c.criteria.map((x) => <Td key={x.id}>{formatNumber(r.weightedValues[x.id])}</Td>)}
              <Td className="font-bold" style={{ color: 'var(--primary)' }}>{formatNumber(r.nilaiSAW)}</Td>
            </tr>
          ))}
        </DataTable>
      </Card>
    </div>
  );
}

function LambdaSlider() {
  const { lambda, update } = useDSSData();
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Parameter λ (lambda)</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Q = λ·WSM + (1 − λ)·WPM</p>
        </div>
        <input type="range" min={0} max={1} step={0.05} value={lambda} onChange={(e) => update((s) => ({ ...s, lambda: Number(e.target.value) }))} className="flex-1 min-w-[160px]" style={{ accentColor: 'var(--primary)' }} />
        <span className="text-lg font-bold w-14 text-right" style={{ color: 'var(--primary)' }}>{lambda.toFixed(2)}</span>
      </div>
    </Card>
  );
}

export function WaspasWsmWpm() {
  const c = useCalc();
  if (!c.ready) return <Loading />;
  if (!c.ok) return <Empty />;
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader title="WSM & WPM" desc="WSM = Σ (Wj · rij) · WPM = Π (rij ^ Wj) · dari matriks ternormalisasi yang sama dengan SAW" />
        <DataTable head={['Varian', 'WSM (aditif)', 'WPM (perkalian)']}>
          {c.waspas.slice().sort((a, b) => a.kode.localeCompare(b.kode, undefined, { numeric: true })).map((r) => (
            <tr key={r.alternativeId} className="table-row-hover">
              <Td className="font-medium whitespace-nowrap"><span className="font-semibold" style={{ color: 'var(--primary)' }}>{r.kode}</span> {r.nama}</Td>
              <Td>{formatNumber(r.wsm)}</Td>
              <Td>{formatNumber(r.wpm)}</Td>
            </tr>
          ))}
        </DataTable>
      </Card>
    </div>
  );
}

export function WaspasNilaiQ() {
  const c = useCalc();
  if (!c.ready) return <Loading />;
  if (!c.ok) return <Empty />;
  const top = c.waspas[0]?.nilaiQ || 1;
  return (
    <div className="space-y-6 animate-fade-in">
      <LambdaSlider />
      <Card>
        <CardHeader title="Nilai Q & Ranking WASPAS" desc={`λ = ${c.lambda.toFixed(2)}`} />
        <DataTable head={['Rank', 'Varian', 'WSM', 'WPM', 'Nilai Q', '']}>
          {c.waspas.map((r) => (
            <tr key={r.alternativeId} className="table-row-hover">
              <Td><span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${r.ranking <= 3 ? `badge-rank-${r.ranking}` : ''}`} style={r.ranking > 3 ? { backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' } : undefined}>{r.ranking}</span></Td>
              <Td className="font-medium whitespace-nowrap">{r.nama}</Td>
              <Td>{formatNumber(r.wsm)}</Td>
              <Td>{formatNumber(r.wpm)}</Td>
              <Td className="font-bold" style={{ color: 'var(--primary)' }}>{formatNumber(r.nilaiQ)}</Td>
              <Td className="w-40">
                <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--muted)' }}>
                  <div className="h-2 rounded-full" style={{ width: `${(r.nilaiQ / top) * 100}%`, backgroundColor: 'var(--primary)' }} />
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Card>
    </div>
  );
}
