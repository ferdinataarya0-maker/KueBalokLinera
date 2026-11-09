'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Trophy, Cookie, Sliders, Scale, ArrowRight, Printer, Download, CheckCircle2, AlertTriangle, ShieldCheck, LogOut,
} from 'lucide-react';
import { useDSSData } from '@/lib/dss-store';
import { clearSession, getSession, type Session } from '@/lib/auth';
import {
  calculateSAW, calculateWASPAS, generateComparison, formatNumber, formatRupiah,
  getAssessmentMatrix, normalizedWeight, isPriceCriteria,
} from '@/lib/dss-data';
import { Card, CardHeader, StatCard, Badge, Btn, DataTable, Td, Loading } from '@/components/ui/Parts';
import DashboardCharts from '@/app/dashboard-admin/components/DashboardCharts';
import RankingComparison from '@/app/halaman-ranking-perbandingan/components/RankingComparison';
import RankingComparisonChart from '@/app/halaman-ranking-perbandingan/components/RankingComparisonChart';
import RankingConclusion from '@/app/halaman-ranking-perbandingan/components/RankingConclusion';
import { useRouter } from 'next/navigation';

function useResults() {
  const d = useDSSData();
  const ok = d.ready && d.alternatives.length > 0 && d.criteria.length > 0;
  const saw = ok ? calculateSAW(d.alternatives, d.criteria, d.assessments) : [];
  const waspas = ok ? calculateWASPAS(d.alternatives, d.criteria, d.assessments, d.lambda) : [];
  const bestSAW = saw.find((r) => r.ranking === 1);
  const bestWASPAS = waspas.find((r) => r.ranking === 1);
  const totalBobot = d.criteria.reduce((s, c) => s + c.bobot, 0);
  const bobotValid = d.criteria.length > 0 && totalBobot > 0 && d.criteria.every((c) => c.bobot > 0);
  const total = d.alternatives.length * d.criteria.length;
  const filled = d.assessments.filter((x) => d.alternatives.some((a) => a.id === x.alternativeId) && d.criteria.some((c) => c.id === x.criteriaId)).length;
  return { ...d, ok, saw, waspas, bestSAW, bestWASPAS, totalBobot, bobotValid, completeness: total ? filled / total : 0 };
}

const fmtTime = (iso: string) => new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const NoData = () => (
  <Card><p className="text-sm text-center py-6" style={{ color: 'var(--muted-foreground)' }}>Data varian/kriteria belum lengkap. Hubungi admin untuk melengkapi data.</p></Card>
);

export function OwnerDashboard() {
  const r = useResults();
  if (!r.ready) return <Loading />;
  if (!r.ok) return <NoData />;
  const same = r.bestSAW?.alternativeId === r.bestWASPAS?.alternativeId;
  const top3 = r.waspas.slice(0, 3);
  const best = r.alternatives.find((a) => a.id === r.bestWASPAS?.alternativeId);
  const gap = r.waspas.length > 1 ? ((r.waspas[0].nilaiQ - r.waspas[1].nilaiQ) / r.waspas[1].nilaiQ) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #B5651D 0%, #9B5418 55%, #7D4010 100%)' }}>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-15" style={{ backgroundColor: 'var(--peach-300)' }} />
        <p className="text-xs font-semibold tracking-wider opacity-80">REKOMENDASI VARIAN UNGGULAN</p>
        <div className="flex flex-wrap items-end justify-between gap-4 mt-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><Trophy size={28} /> {r.bestWASPAS?.nama}</h2>
            <p className="text-sm mt-1 opacity-90">
              {best ? `${formatRupiah(best.harga)} · ` : ''}Nilai Q {formatNumber(r.bestWASPAS?.nilaiQ ?? 0)} (λ {r.lambda.toFixed(2)}) · unggul {gap.toFixed(1)}% dari peringkat 2
            </p>
          </div>
          <Link href="/owner/rekomendasi" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
            Lihat alasan <ArrowRight size={16} />
          </Link>
        </div>
        <p className="text-sm mt-3 opacity-90">{same ? 'SAW dan WASPAS sepakat pada varian yang sama — keputusan konsisten.' : `SAW memilih ${r.bestSAW?.nama}, WASPAS memilih ${r.bestWASPAS?.nama}. Tinjau perbandingannya sebelum memutuskan.`}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Varian" value={String(r.alternatives.length)} sub="Alternatif kue balok" icon={Cookie} />
        <StatCard label="Total Kriteria" value={String(r.criteria.length)} sub={`Total bobot ${r.totalBobot} (dinormalisasi)`} icon={Sliders} color="var(--info)" bg="var(--info-bg)" />
        <StatCard label="Terbaik SAW" value={r.bestSAW?.nama ?? '—'} sub={`Nilai ${formatNumber(r.bestSAW?.nilaiSAW ?? 0)}`} icon={Trophy} color="#B7791F" bg="var(--warning-bg)" />
        <StatCard label="Konsistensi Metode" value={same ? 'Sepakat' : 'Berbeda'} sub="SAW vs WASPAS" icon={Scale} color={same ? 'var(--success)' : 'var(--error)'} bg={same ? 'var(--success-bg)' : 'var(--error-bg)'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2"><DashboardCharts /></div>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Top 3 Varian" desc="Berdasarkan nilai Q WASPAS" />
            <ol className="space-y-3">
              {top3.map((t) => (
                <li key={t.alternativeId} className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold badge-rank-${t.ranking}`}>{t.ranking}</span>
                  <span className="flex-1 font-medium text-sm">{t.nama}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{formatNumber(t.nilaiQ)}</span>
                </li>
              ))}
            </ol>
          </Card>
          <Card>
            <CardHeader title="Status Data" />
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2" style={{ color: r.bobotValid ? 'var(--success)' : 'var(--warning)' }}>
                {r.bobotValid ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} Total bobot {r.totalBobot} (Σ Wj = 1)
              </li>
              <li className="flex items-center gap-2" style={{ color: r.completeness >= 1 ? 'var(--success)' : 'var(--warning)' }}>
                {r.completeness >= 1 ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} Kelengkapan penilaian {Math.round(r.completeness * 100)}%
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Aktivitas Terbaru" action={<Link href="/owner/aktivitas" className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Lihat semua</Link>} />
        <ul className="space-y-3">
          {r.activities.slice(0, 5).map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>{a.text}</span>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.by} · {fmtTime(a.time)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function OwnerRekomendasi() {
  const r = useResults();
  if (!r.ready) return <Loading />;
  if (!r.ok || !r.bestWASPAS) return <NoData />;
  const win = r.bestWASPAS;
  const runner = r.waspas[1];
  const alt = r.alternatives.find((a) => a.id === win.alternativeId);
  const strengths = r.criteria
    .map((c) => ({ c, norm: win.normalizedValues[c.id], W: normalizedWeight(c, r.criteria), contrib: (win.normalizedValues[c.id] ?? 0) * normalizedWeight(c, r.criteria) }))
    .sort((a, b) => b.contrib - a.contrib);
  const best = strengths.filter((s) => s.norm >= 0.9999);
  const weak = strengths.filter((s) => s.norm < 0.85);
  const same = r.bestSAW?.alternativeId === win.alternativeId;
  const matrix = getAssessmentMatrix(r.alternatives, r.criteria, r.assessments);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone="success">Rekomendasi Utama</Badge>
            <h2 className="text-2xl font-bold mt-2" style={{ color: 'var(--foreground)' }}>{win.nama}</h2>
            {alt?.deskripsi && <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>{alt.deskripsi}</p>}
            <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
              {r.criteria.map((c) => `${c.nama}: ${isPriceCriteria(c) ? formatRupiah(matrix[win.alternativeId]?.[c.id] ?? 0) : (matrix[win.alternativeId]?.[c.id] ?? 0).toLocaleString('id-ID')}`).join(' · ')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Nilai Q (λ {r.lambda.toFixed(2)})</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{formatNumber(win.nilaiQ)}</p>
            {alt && <p className="text-sm font-medium">{formatRupiah(alt.harga)}</p>}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Mengapa varian ini unggul?" />
          <ul className="space-y-2 text-sm">
            <li>• {same ? 'Juga menjadi peringkat 1 pada metode SAW, sehingga kedua metode sepakat.' : `Berbeda dengan SAW yang memilih ${r.bestSAW?.nama}; WASPAS menggabungkan sifat aditif dan perkalian sehingga lebih sensitif terhadap nilai yang rendah.`}</li>
            {runner && <li>• Unggul {(((win.nilaiQ - runner.nilaiQ) / runner.nilaiQ) * 100).toFixed(1)}% dari peringkat 2 ({runner.nama}).</li>}
            {best.length > 0 && <li>• Terbaik di antara semua varian pada kriteria: <strong>{best.map((b) => b.c.nama).join(', ')}</strong>.</li>}
            {weak.length > 0 && <li>• Perlu perhatian pada: <strong>{weak.map((b) => `${b.c.nama} (${Math.round(b.norm * 100)}% dari yang terbaik)`).join(', ')}</strong>.</li>}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Kontribusi per Kriteria" desc="Wj × rij (kontribusi) dibanding Wj (kontribusi maksimum)" />
          <div className="space-y-3">
            {strengths.map(({ c, contrib, W }) => (
              <div key={c.id}>
                <div className="flex justify-between text-sm mb-1"><span>{c.nama}</span><span className="font-semibold">{contrib.toFixed(4)} / {W.toFixed(4)}</span></div>
                <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--muted)' }}><div className="h-2 rounded-full" style={{ width: `${W > 0 ? (contrib / W) * 100 : 0}%`, backgroundColor: 'var(--primary)' }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Peringkat Lengkap" desc="WASPAS dengan pembanding SAW" />
        <DataTable head={['Rank WASPAS', 'Varian', 'Nilai Q', 'Rank SAW', 'Nilai SAW']}>
          {r.waspas.map((w) => {
            const s = r.saw.find((x) => x.alternativeId === w.alternativeId);
            return (
              <tr key={w.alternativeId} className="table-row-hover">
                <Td className="font-bold">{w.ranking}</Td><Td className="font-medium">{w.nama}</Td>
                <Td style={{ color: 'var(--primary)' }} className="font-semibold">{formatNumber(w.nilaiQ)}</Td>
                <Td>{s?.ranking}</Td><Td>{formatNumber(s?.nilaiSAW ?? 0)}</Td>
              </tr>
            );
          })}
        </DataTable>
      </Card>
    </div>
  );
}

export function OwnerRanking() {
  const r = useResults();
  if (!r.ready) return <Loading />;
  if (!r.ok) return <NoData />;
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Ranking SAW" />
          <DataTable head={['Rank', 'Varian', 'Nilai SAW']}>
            {r.saw.map((s) => <tr key={s.alternativeId} className="table-row-hover"><Td className="font-bold">{s.ranking}</Td><Td className="font-medium">{s.nama}</Td><Td className="font-semibold" style={{ color: 'var(--primary)' }}>{formatNumber(s.nilaiSAW)}</Td></tr>)}
          </DataTable>
        </Card>
        <Card>
          <CardHeader title="Ranking WASPAS" desc={`λ = ${r.lambda.toFixed(2)}`} />
          <DataTable head={['Rank', 'Varian', 'Nilai Q']}>
            {r.waspas.map((s) => <tr key={s.alternativeId} className="table-row-hover"><Td className="font-bold">{s.ranking}</Td><Td className="font-medium">{s.nama}</Td><Td className="font-semibold" style={{ color: 'var(--primary)' }}>{formatNumber(s.nilaiQ)}</Td></tr>)}
          </DataTable>
        </Card>
      </div>
      <RankingComparisonChart sawResults={r.saw} waspasResults={r.waspas} />
    </div>
  );
}

export function OwnerPerbandingan() {
  const r = useResults();
  if (!r.ready) return <Loading />;
  if (!r.ok) return <NoData />;
  const comparison = generateComparison(r.saw, r.waspas);
  const n = comparison.length;
  const d2 = comparison.reduce((s, c) => s + Math.pow(c.rankingSAW - c.rankingWASPAS, 2), 0);
  const rho = n > 1 ? 1 - (6 * d2) / (n * (n * n - 1)) : 1;
  const same = r.bestSAW?.alternativeId === r.bestWASPAS?.alternativeId;
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Korelasi Peringkat (Spearman)" value={rho.toFixed(3)} sub={rho >= 0.9 ? 'Sangat selaras' : rho >= 0.7 ? 'Cukup selaras' : 'Perbedaan cukup besar'} icon={Scale} />
        <StatCard label="Varian dengan peringkat sama" value={`${comparison.filter((c) => c.rankingSAW === c.rankingWASPAS).length} / ${n}`} icon={CheckCircle2} color="var(--success)" bg="var(--success-bg)" />
        <StatCard label="Pemenang" value={same ? r.bestSAW?.nama ?? '—' : 'Berbeda'} sub={same ? 'SAW = WASPAS' : `${r.bestSAW?.nama} vs ${r.bestWASPAS?.nama}`} icon={Trophy} color="#B7791F" bg="var(--warning-bg)" />
      </div>
      <RankingConclusion bestSAW={r.bestSAW} bestWASPAS={r.bestWASPAS} isSameWinner={same} lambda={r.lambda} />
      <RankingComparisonChart sawResults={r.saw} waspasResults={r.waspas} />
      <RankingComparison comparison={comparison} />
    </div>
  );
}

const LINE_COLORS = ['#B5651D', '#E76F51', '#2B6CB0', '#2D6A4F', '#B7791F', '#805AD5', '#718096', '#D53F8C', '#0F766E', '#7C2D12'];

export function OwnerSensitivitas() {
  const r = useResults();
  const steps = useMemo(() => Array.from({ length: 11 }, (_, i) => i / 10), []);
  if (!r.ready) return <Loading />;
  if (!r.ok) return <NoData />;
  const rows = steps.map((l) => {
    const res = calculateWASPAS(r.alternatives, r.criteria, r.assessments, l);
    return { lambda: l, res };
  });
  const chart = rows.map(({ lambda, res }) => {
    const o: Record<string, number | string> = { lambda: lambda.toFixed(1) };
    res.forEach((x) => { o[x.nama] = Number(x.nilaiQ.toFixed(4)); });
    return o;
  });
  const winners = new Set(rows.map((x) => x.res[0].alternativeId));
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-4 rounded-xl text-sm font-medium flex items-start gap-3" style={{ backgroundColor: winners.size === 1 ? 'var(--success-bg)' : 'var(--warning-bg)', color: winners.size === 1 ? 'var(--success)' : 'var(--warning)' }}>
        {winners.size === 1 ? <ShieldCheck size={18} className="mt-0.5" /> : <AlertTriangle size={18} className="mt-0.5" />}
        {winners.size === 1
          ? `Hasil stabil: ${rows[0].res[0].nama} tetap peringkat 1 pada seluruh nilai λ (0 – 1).`
          : 'Pemenang berubah mengikuti nilai λ — keputusan sensitif terhadap pilihan parameter. Lihat tabel di bawah.'}
      </div>
      <Card>
        <CardHeader title="Nilai Q terhadap λ" desc="Setiap garis adalah satu varian" />
        <div style={{ width: '100%', height: 340 }}>
          <ResponsiveContainer>
            <LineChart data={chart} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8D5BE" />
              <XAxis dataKey="lambda" tick={{ fontSize: 12 }} label={{ value: 'λ', position: 'insideBottomRight', offset: -4 }} />
              <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              {r.alternatives.map((a, i) => <Line key={a.id} type="monotone" dataKey={a.nama} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2} dot={false} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <CardHeader title="Peringkat seluruh varian per λ" desc="Peringkat WASPAS setiap varian pada tiap nilai λ (λ = 1 setara SAW, λ = 0 setara WPM murni)" />
        <DataTable head={['Varian', ...rows.map((x) => x.lambda.toFixed(1))]}>
          {r.alternatives.map((a) => (
            <tr key={a.id} className="table-row-hover">
              <Td className="font-medium whitespace-nowrap">{a.nama}</Td>
              {rows.map(({ lambda, res }) => {
                const rank = res.find((x) => x.alternativeId === a.id)?.ranking;
                return <Td key={lambda} className={rank === 1 ? 'font-bold' : ''} style={rank === 1 ? { color: 'var(--primary)' } : undefined}>{rank}</Td>;
              })}
            </tr>
          ))}
        </DataTable>
      </Card>
      <Card>
        <CardHeader title="Peringkat teratas per λ" />
        <DataTable head={['λ', 'Peringkat 1', 'Peringkat 2', 'Peringkat 3']}>
          {rows.map(({ lambda, res }) => (
            <tr key={lambda} className="table-row-hover">
              <Td className="font-semibold">{lambda.toFixed(1)}</Td>
              <Td className="font-bold" style={{ color: 'var(--primary)' }}>{res[0]?.nama}</Td>
              <Td>{res[1]?.nama ?? '—'}</Td><Td>{res[2]?.nama ?? '—'}</Td>
            </tr>
          ))}
        </DataTable>
      </Card>
    </div>
  );
}

export function OwnerLaporan() {
  const r = useResults();
  const [today, setToday] = useState('');
  useEffect(() => setToday(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })), []);
  if (!r.ready) return <Loading />;
  if (!r.ok) return <NoData />;
  const matrix = getAssessmentMatrix(r.alternatives, r.criteria, r.assessments);
  const sameBest = r.bestSAW?.alternativeId === r.bestWASPAS?.alternativeId;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(r.saw.map((x) => ({ Ranking: x.ranking, Varian: x.nama, 'Nilai SAW': Number(x.nilaiSAW.toFixed(6)) }))), 'SAW');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(r.waspas.map((x) => ({ Ranking: x.ranking, Varian: x.nama, WSM: Number(x.wsm.toFixed(6)), WPM: Number(x.wpm.toFixed(6)), 'Nilai Q': Number(x.nilaiQ.toFixed(6)) }))), 'WASPAS');
    XLSX.writeFile(wb, 'Laporan-KueSPK.xlsx');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="no-print flex flex-wrap gap-2 justify-end">
        <Btn variant="secondary" onClick={exportExcel}><Download size={16} /> Export Excel</Btn>
        <Btn onClick={() => window.print()}><Printer size={16} /> Cetak / Simpan PDF</Btn>
      </div>
      <Card style={{ padding: '2rem' }}>
        <div className="text-center pb-4 mb-6" style={{ borderBottom: '2px solid var(--border)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>Laporan Sistem Pendukung Keputusan</h2>
          <p className="text-sm font-medium">Pemilihan Varian Kue Balok Linera — Metode SAW & WASPAS</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Dicetak {today} · λ = {r.lambda.toFixed(2)}</p>
        </div>
        <h3 className="font-bold mb-2">1. Kesimpulan</h3>
        <p className="text-sm mb-6">
          Berdasarkan {r.alternatives.length} varian dan {r.criteria.length} kriteria, metode SAW menempatkan <strong>{r.bestSAW?.nama}</strong> (V = {formatNumber(r.bestSAW?.nilaiSAW ?? 0, 6)}) di peringkat pertama, dan metode WASPAS menempatkan <strong>{r.bestWASPAS?.nama}</strong> (Q = {formatNumber(r.bestWASPAS?.nilaiQ ?? 0, 6)}) di peringkat pertama.{' '}
          {sameBest
            ? `Kedua metode sepakat, sehingga varian terlaris yang direkomendasikan adalah ${r.bestWASPAS?.nama}.`
            : 'Kedua metode menghasilkan pemenang berbeda; keputusan perlu ditinjau lebih lanjut bersama analisis sensitivitas λ.'}
        </p>
        <h3 className="font-bold mb-2">2. Kriteria & Bobot</h3>
        <div className="mb-6"><DataTable head={['Kode', 'Kriteria', 'Jenis', 'Bobot', 'Bobot Normalisasi (Wj)']}>
          {r.criteria.map((c) => <tr key={c.id}><Td>{c.kode}</Td><Td>{c.nama}</Td><Td>{c.jenis === 'BENEFIT' ? 'Benefit' : 'Cost'}</Td><Td>{c.bobot}</Td><Td>{formatNumber(normalizedWeight(c, r.criteria), 4)}</Td></tr>)}
        </DataTable></div>
        <h3 className="font-bold mb-2">3. Matriks Keputusan</h3>
        <div className="mb-6"><DataTable head={['Varian', ...r.criteria.map((c) => `${c.kode} ${c.nama}`)]}>
          {r.alternatives.map((a) => <tr key={a.id}><Td className="font-medium">{a.nama}</Td>{r.criteria.map((c) => <Td key={c.id}>{isPriceCriteria(c) ? formatRupiah(matrix[a.id][c.id]) : matrix[a.id][c.id].toLocaleString('id-ID')}</Td>)}</tr>)}
        </DataTable></div>
        <h3 className="font-bold mb-2">4. Ranking</h3>
        <DataTable head={['Varian', 'Rank SAW', 'Nilai SAW', 'Rank WASPAS', 'Nilai Q']}>
          {r.waspas.map((w) => { const s = r.saw.find((x) => x.alternativeId === w.alternativeId); return (
            <tr key={w.alternativeId}><Td className="font-medium">{w.nama}</Td><Td>{s?.ranking}</Td><Td>{formatNumber(s?.nilaiSAW ?? 0, 6)}</Td><Td>{w.ranking}</Td><Td className="font-semibold">{formatNumber(w.nilaiQ, 6)}</Td></tr>
          ); })}
        </DataTable>
        <p className="text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
          Metode: normalisasi benefit r = x ÷ max, cost r = min ÷ x; Wj = bobot ÷ total bobot; SAW: V = Σ Wj·rij; WASPAS: Q = λ·WSM + (1 − λ)·WPM dengan WSM = Σ Wj·rij dan WPM = Π rij^Wj.
        </p>
      </Card>
    </div>
  );
}

export function OwnerAktivitas() {
  const { activities, ready } = useDSSData();
  const [q, setQ] = useState('');
  if (!ready) return <Loading />;
  const list = activities.filter((a) => a.text.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader title="Riwayat Aktivitas" desc="Perubahan data yang dilakukan admin" action={<input className="input-warm px-3 py-2 rounded-lg text-sm" placeholder="Cari aktivitas…" value={q} onChange={(e) => setQ(e.target.value)} />} />
        <DataTable head={['Waktu', 'Oleh', 'Aktivitas']} empty="Tidak ada aktivitas.">
          {list.map((a) => <tr key={a.id} className="table-row-hover"><Td className="whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{fmtTime(a.time)}</Td><Td className="whitespace-nowrap">{a.by}</Td><Td>{a.text}</Td></tr>)}
        </DataTable>
      </Card>
    </div>
  );
}

export function OwnerProfil() {
  const router = useRouter();
  const [s, setS] = useState<Session | null>(null);
  useEffect(() => setS(getSession()), []);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card>
        <CardHeader title="Profil Owner" />
        <dl className="space-y-3 text-sm">
          <div><dt className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Nama</dt><dd className="font-semibold">{s?.name}</dd></div>
          <div><dt className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Email</dt><dd className="font-semibold">{s?.email}</dd></div>
          <div><dt className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Peran</dt><dd><Badge tone="info">Owner</Badge></dd></div>
        </dl>
        <div className="mt-5"><Btn variant="danger" onClick={() => { clearSession(); router.push('/login'); }}><LogOut size={15} /> Keluar</Btn></div>
      </Card>
      <Card>
        <CardHeader title="Hak Akses Owner" />
        <ul className="space-y-2 text-sm">
          <li>✓ Melihat rekomendasi, ranking, perbandingan, dan analisis sensitivitas</li>
          <li>✓ Melihat data varian, kriteria, sub kriteria, dan matriks keputusan</li>
          <li>✓ Mencetak & mengekspor laporan</li>
          <li style={{ color: 'var(--muted-foreground)' }}>✗ Mengubah data (khusus admin)</li>
        </ul>
      </Card>
    </div>
  );
}
