'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Upload, FileDown } from 'lucide-react';
import { useDSSData, nextId } from '@/lib/dss-store';
import { calculateSAW, calculateWASPAS, generateComparison } from '@/lib/dss-data';
import { Card, CardHeader, Btn, Loading } from '@/components/ui/Parts';

export default function ExcelTools() {
  const d = useDSSData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  if (!d.ready) return <Loading />;

  const sheets = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.alternatives.map((a) => ({ Kode: a.kode, Nama: a.nama, Harga: a.harga, Deskripsi: a.deskripsi }))), 'Varian');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.criteria.map((c) => ({ Kode: c.kode, Nama: c.nama, Jenis: c.jenis, Bobot: c.bobot, DesimalNormalisasi: c.truncateDecimals ?? '' }))), 'Kriteria');
    const subRows = d.subCriteria.map((s) => ({ 'Kode Kriteria': d.criteria.find((c) => c.id === s.criteriaId)?.kode ?? '', Label: s.label, Nilai: s.nilai, Keterangan: s.keterangan }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(subRows), 'SubKriteria');
    const asRows = d.assessments.map((x) => ({
      'Kode Varian': d.alternatives.find((a) => a.id === x.alternativeId)?.kode ?? '',
      'Kode Kriteria': d.criteria.find((c) => c.id === x.criteriaId)?.kode ?? '',
      Nilai: x.nilai,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(asRows), 'Penilaian');
    return wb;
  };

  const exportData = () => { XLSX.writeFile(sheets(), 'KueSPK-data.xlsx'); setMsg({ tone: 'ok', text: 'Data berhasil diekspor ke KueSPK-data.xlsx' }); };

  const exportHasil = () => {
    const saw = calculateSAW(d.alternatives, d.criteria, d.assessments);
    const wp = calculateWASPAS(d.alternatives, d.criteria, d.assessments, d.lambda);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(saw.map((r) => ({ Ranking: r.ranking, Kode: r.kode, Varian: r.nama, 'Nilai SAW': Number(r.nilaiSAW.toFixed(6)) }))), 'Hasil SAW');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(wp.map((r) => ({ Ranking: r.ranking, Kode: r.kode, Varian: r.nama, WSM: Number(r.wsm.toFixed(6)), WPM: Number(r.wpm.toFixed(6)), 'Nilai Q': Number(r.nilaiQ.toFixed(6)) }))), `Hasil WASPAS`);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(generateComparison(saw, wp).sort((a, b) => a.rankingWASPAS - b.rankingWASPAS).map((r) => ({ Kode: r.kode, Varian: r.nama, 'Nilai SAW': Number(r.nilaiSAW.toFixed(6)), 'Rank SAW': r.rankingSAW, 'Nilai WASPAS': Number(r.nilaiWASPAS.toFixed(6)), 'Rank WASPAS': r.rankingWASPAS, Lambda: d.lambda }))), 'Perbandingan');
    XLSX.writeFile(wb, 'KueSPK-hasil.xlsx');
    setMsg({ tone: 'ok', text: 'Hasil perhitungan berhasil diekspor ke KueSPK-hasil.xlsx' });
  };

  const template = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Kode: 'A1', Nama: 'Original', Harga: 15000, Deskripsi: '' }, { Kode: 'A2', Nama: 'Oreo', Harga: 20000, Deskripsi: '' }]), 'Varian');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { Kode: 'C1', Nama: 'Jumlah Penjualan', Jenis: 'BENEFIT', Bobot: 5, DesimalNormalisasi: 2 },
      { Kode: 'C2', Nama: 'Minat Pembeli', Jenis: 'BENEFIT', Bobot: 4, DesimalNormalisasi: '' },
      { Kode: 'C3', Nama: 'Kualitas Rasa', Jenis: 'BENEFIT', Bobot: 4, DesimalNormalisasi: '' },
      { Kode: 'C4', Nama: 'Harga Jual', Jenis: 'COST', Bobot: 3, DesimalNormalisasi: '' },
    ]), 'Kriteria');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ 'Kode Kriteria': 'C2', Label: 'Skala 5', Nilai: 5, Keterangan: '' }]), 'SubKriteria');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { 'Kode Varian': 'A1', 'Kode Kriteria': 'C1', Nilai: 280 }, { 'Kode Varian': 'A1', 'Kode Kriteria': 'C2', Nilai: 4 },
      { 'Kode Varian': 'A1', 'Kode Kriteria': 'C3', Nilai: 4 }, { 'Kode Varian': 'A1', 'Kode Kriteria': 'C4', Nilai: 15000 },
    ]), 'Penilaian');
    XLSX.writeFile(wb, 'KueSPK-template.xlsx');
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const wb = XLSX.read(await file.arrayBuffer());
      const rows = (name: string) => (wb.Sheets[name] ? XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[name]) : null);
      const vr = rows('Varian'), kr = rows('Kriteria'), sr = rows('SubKriteria') ?? [], pr = rows('Penilaian');
      if (!vr || !kr || !pr) throw new Error('Sheet "Varian", "Kriteria", dan "Penilaian" wajib ada. Unduh template untuk contoh format.');

      const alternatives = vr.map((r) => ({ id: nextId('alt'), kode: String(r.Kode ?? '').trim(), nama: String(r.Nama ?? '').trim(), harga: Number(r.Harga) || 0, deskripsi: String(r.Deskripsi ?? '') })).filter((a) => a.kode && a.nama);
      const criteria = kr.map((r) => ({ id: nextId('crit'), kode: String(r.Kode ?? '').trim(), nama: String(r.Nama ?? '').trim(), jenis: (String(r.Jenis ?? '').toUpperCase() === 'COST' ? 'COST' : 'BENEFIT') as 'BENEFIT' | 'COST', bobot: Number(r.Bobot) || 0, truncateDecimals: r.DesimalNormalisasi === undefined || r.DesimalNormalisasi === null || String(r.DesimalNormalisasi).trim() === '' || !Number.isInteger(Number(r.DesimalNormalisasi)) ? undefined : Number(r.DesimalNormalisasi) })).filter((c) => c.kode && c.nama && c.bobot > 0);
      if (!alternatives.length || !criteria.length) throw new Error('Data varian atau kriteria kosong / format kolom tidak sesuai.');
      const altBy = new Map(alternatives.map((a) => [a.kode, a.id]));
      const critBy = new Map(criteria.map((c) => [c.kode, c.id]));
      const subCriteria = sr.flatMap((r) => { const cid = critBy.get(String(r['Kode Kriteria'] ?? '').trim()); return cid ? [{ id: nextId('sub'), criteriaId: cid, label: String(r.Label ?? ''), nilai: Number(r.Nilai) || 0, keterangan: String(r.Keterangan ?? '') }] : []; });
      const assessments = pr.flatMap((r) => { const aid = altBy.get(String(r['Kode Varian'] ?? '').trim()); const cid = critBy.get(String(r['Kode Kriteria'] ?? '').trim()); return aid && cid ? [{ id: nextId('ass'), alternativeId: aid, criteriaId: cid, nilai: Number(r.Nilai) || 0 }] : []; });

      d.update((s) => ({ ...s, alternatives, criteria, subCriteria, assessments }), `Mengimpor data dari Excel (${alternatives.length} varian, ${criteria.length} kriteria)`);
      setMsg({ tone: 'ok', text: `Impor berhasil: ${alternatives.length} varian, ${criteria.length} kriteria, ${subCriteria.length} sub kriteria, ${assessments.length} penilaian.` });
    } catch (err) {
      setMsg({ tone: 'err', text: err instanceof Error ? err.message : 'Gagal membaca file Excel.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {msg && (
        <div className="p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: msg.tone === 'ok' ? 'var(--success-bg)' : 'var(--error-bg)', color: msg.tone === 'ok' ? 'var(--success)' : 'var(--error)' }}>{msg.text}</div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Export" desc="Unduh data atau hasil perhitungan ke file Excel (.xlsx)" />
          <div className="flex flex-col gap-3">
            <Btn onClick={exportData}><Download size={16} /> Export Data (Varian, Kriteria, Penilaian)</Btn>
            <Btn variant="secondary" onClick={exportHasil}><Download size={16} /> Export Hasil SAW & WASPAS</Btn>
          </div>
        </Card>
        <Card>
          <CardHeader title="Import" desc="Mengganti seluruh data varian, kriteria, sub kriteria, dan penilaian" />
          <div className="flex flex-col gap-3">
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onFile} />
            <Btn onClick={() => fileRef.current?.click()}><Upload size={16} /> Pilih File Excel</Btn>
            <Btn variant="secondary" onClick={template}><FileDown size={16} /> Unduh Template</Btn>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>Peringatan: impor menimpa data yang ada. Lakukan export dulu bila perlu cadangan.</p>
        </Card>
      </div>
    </div>
  );
}
