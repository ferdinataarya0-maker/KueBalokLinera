'use client';

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useDSSData, nextId } from '@/lib/dss-store';
import { totalBobot, normalizedWeight, type Criteria } from '@/lib/dss-data';
import { Card, CardHeader, Btn, IconBtn, Modal, Field, DataTable, Td, Badge, Loading } from '@/components/ui/Parts';

const empty = { nama: '', jenis: 'BENEFIT' as 'BENEFIT' | 'COST', bobot: '', trunc: '' };

export default function KriteriaManager({ readOnly = false }: { readOnly?: boolean }) {
  const { criteria, ready, update } = useDSSData();
  const [editing, setEditing] = useState<Criteria | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  if (!ready) return <Loading />;

  const total = totalBobot(criteria);
  const valid = criteria.length > 0 && total > 0 && criteria.every((c) => c.bobot > 0);
  const fmtW = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 4 });

  const openAdd = () => { setEditing(null); setForm(empty); setError(''); setOpen(true); };
  const openEdit = (c: Criteria) => { setEditing(c); setForm({ nama: c.nama, jenis: c.jenis, bobot: String(c.bobot), trunc: c.truncateDecimals === undefined ? '' : String(c.truncateDecimals) }); setError(''); setOpen(true); };

  const save = () => {
    const bobot = Number(form.bobot);
    if (!form.nama.trim()) return setError('Nama kriteria wajib diisi.');
    if (!Number.isFinite(bobot) || bobot <= 0) return setError('Bobot harus berupa angka lebih dari 0 (mis. skala kepentingan 1 – 5).');
    const truncRaw = form.trunc.trim();
    const truncateDecimals = truncRaw === '' ? undefined : Number(truncRaw);
    if (truncateDecimals !== undefined && (!Number.isInteger(truncateDecimals) || truncateDecimals < 0 || truncateDecimals > 10)) return setError('Pemotongan desimal harus bilangan bulat 0 – 10, atau dikosongkan.');
    update((s) => {
      if (editing) {
        return { ...s, criteria: s.criteria.map((c) => (c.id === editing.id ? { ...c, nama: form.nama.trim(), jenis: form.jenis, bobot, truncateDecimals } : c)) };
      }
      const nums = s.criteria.map((c) => Number(c.kode.replace(/\D/g, '')) || 0);
      return { ...s, criteria: [...s.criteria, { id: nextId('crit'), kode: `C${Math.max(0, ...nums) + 1}`, nama: form.nama.trim(), jenis: form.jenis, bobot, truncateDecimals }] };
    }, editing ? `Mengubah kriteria ${form.nama.trim()}` : `Menambah kriteria ${form.nama.trim()}`);
    setOpen(false);
  };

  const remove = (c: Criteria) => {
    if (!window.confirm(`Hapus kriteria "${c.nama}"? Sub kriteria dan penilaiannya ikut terhapus.`)) return;
    update((s) => ({
      ...s,
      criteria: s.criteria.filter((x) => x.id !== c.id),
      subCriteria: s.subCriteria.filter((x) => x.criteriaId !== c.id),
      assessments: s.assessments.filter((x) => x.criteriaId !== c.id),
    }), `Menghapus kriteria ${c.nama}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{ backgroundColor: valid ? 'var(--success-bg)' : 'var(--warning-bg)', color: valid ? 'var(--success)' : 'var(--warning)' }}
      >
        {valid ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
        <p className="text-sm font-medium">
          Total bobot saat ini <strong>{fmtW(total)}</strong>. {valid ? 'Bobot ternormalisasi dihitung otomatis: Wj = bobot ÷ total bobot (total Wj = 1).' : 'Setiap kriteria harus memiliki bobot lebih dari 0 agar perhitungan dapat dilakukan.'}
        </p>
      </div>

      <Card>
        <CardHeader
          title="Data Kriteria & Bobot"
          desc="Benefit: semakin besar semakin baik · Cost: semakin kecil semakin baik · Wj = bobot ÷ total bobot"
          action={!readOnly && <Btn onClick={openAdd}><Plus size={16} /> Tambah Kriteria</Btn>}
        />
        <DataTable head={readOnly ? ['Kode', 'Kriteria', 'Jenis', 'Bobot', 'Bobot Normalisasi (Wj)', 'Normalisasi'] : ['Kode', 'Kriteria', 'Jenis', 'Bobot', 'Bobot Normalisasi (Wj)', 'Normalisasi', 'Aksi']}>
          {criteria.map((c) => (
            <tr key={c.id} className="table-row-hover">
              <Td className="font-semibold" style={{ color: 'var(--primary)' }}>{c.kode}</Td>
              <Td className="font-medium">{c.nama}</Td>
              <Td><Badge tone={c.jenis === 'BENEFIT' ? 'success' : 'warning'}>{c.jenis === 'BENEFIT' ? 'Benefit' : 'Cost'}</Badge></Td>
              <Td className="font-semibold">{fmtW(c.bobot)}</Td>
              <Td>
                <div className="flex items-center gap-2 min-w-[160px]">
                  <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: 'var(--muted)' }}>
                    <div className="h-2 rounded-full" style={{ width: `${Math.min(normalizedWeight(c, criteria) * 100, 100)}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                  <span className="text-xs font-semibold w-16 text-right">{fmtW(normalizedWeight(c, criteria))}</span>
                </div>
              </Td>
              <Td className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.truncateDecimals === undefined ? 'Penuh (x ÷ max / min ÷ x)' : `Dipotong ${c.truncateDecimals} desimal`}</Td>
              {!readOnly && (
                <Td>
                  <div className="flex gap-1.5">
                    <IconBtn title="Ubah" onClick={() => openEdit(c)}><Pencil size={14} /></IconBtn>
                    <IconBtn title="Hapus" danger onClick={() => remove(c)}><Trash2 size={14} /></IconBtn>
                  </div>
                </Td>
              )}
            </tr>
          ))}
        </DataTable>
      </Card>

      <Modal open={open} title={editing ? 'Ubah Kriteria' : 'Tambah Kriteria'} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Field label="Nama kriteria"><input className="input-warm w-full px-3 py-2 rounded-lg" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></Field>
          <Field label="Jenis">
            <select className="input-warm w-full px-3 py-2 rounded-lg" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as 'BENEFIT' | 'COST' })}>
              <option value="BENEFIT">Benefit</option>
              <option value="COST">Cost</option>
            </select>
          </Field>
          <Field label="Bobot" hint="Bobot mentah (mis. 5, 4, 3). Sistem menormalisasi otomatis: Wj = bobot ÷ total bobot."><input type="number" className="input-warm w-full px-3 py-2 rounded-lg" value={form.bobot} onChange={(e) => setForm({ ...form, bobot: e.target.value })} /></Field>
          <Field label="Pemotongan desimal normalisasi (opsional)" hint="Memotong (TRUNC) hasil normalisasi ke N desimal, seperti Excel penelitian pada Jumlah Penjualan (2). Kosongkan untuk hasil penuh."><input type="number" min={0} max={10} className="input-warm w-full px-3 py-2 rounded-lg" value={form.trunc} onChange={(e) => setForm({ ...form, trunc: e.target.value })} placeholder="kosong = tanpa pemotongan" /></Field>
          {error && <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Btn variant="secondary" onClick={() => setOpen(false)}>Batal</Btn>
            <Btn onClick={save}>Simpan</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
