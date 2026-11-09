'use client';

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Info } from 'lucide-react';
import { useDSSData, nextId } from '@/lib/dss-store';
import type { SubCriteria } from '@/lib/dss-data';
import { Card, CardHeader, Btn, IconBtn, Modal, Field, DataTable, Td, Loading } from '@/components/ui/Parts';

const empty = { label: '', nilai: '', keterangan: '' };

export default function SubKriteriaManager({ readOnly = false }: { readOnly?: boolean }) {
  const { criteria, subCriteria, ready, update } = useDSSData();
  const [selected, setSelected] = useState<string>('');
  const [editing, setEditing] = useState<SubCriteria | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  if (!ready) return <Loading />;

  const activeId = selected && criteria.some((c) => c.id === selected) ? selected : criteria[0]?.id ?? '';
  const crit = criteria.find((c) => c.id === activeId);
  const subs = subCriteria.filter((s) => s.criteriaId === activeId).sort((a, b) => b.nilai - a.nilai);

  const openAdd = () => { setEditing(null); setForm(empty); setError(''); setOpen(true); };
  const openEdit = (s: SubCriteria) => { setEditing(s); setForm({ label: s.label, nilai: String(s.nilai), keterangan: s.keterangan }); setError(''); setOpen(true); };

  const save = () => {
    const nilai = Number(form.nilai);
    if (!form.label.trim()) return setError('Label sub kriteria wajib diisi.');
    if (!Number.isFinite(nilai)) return setError('Nilai skala harus berupa angka.');
    if (subs.some((s) => s.nilai === nilai && s.id !== editing?.id)) return setError('Nilai skala ini sudah dipakai sub kriteria lain.');
    update((s) => ({
      ...s,
      subCriteria: editing
        ? s.subCriteria.map((x) => (x.id === editing.id ? { ...x, label: form.label.trim(), nilai, keterangan: form.keterangan.trim() } : x))
        : [...s.subCriteria, { id: nextId('sub'), criteriaId: activeId, label: form.label.trim(), nilai, keterangan: form.keterangan.trim() }],
    }), `${editing ? 'Mengubah' : 'Menambah'} sub kriteria ${form.label.trim()} (${crit?.nama})`);
    setOpen(false);
  };

  const remove = (s: SubCriteria) => {
    if (!window.confirm(`Hapus sub kriteria "${s.label}"?`)) return;
    update((st) => ({ ...st, subCriteria: st.subCriteria.filter((x) => x.id !== s.id) }), `Menghapus sub kriteria ${s.label} (${crit?.nama})`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
        <Info size={18} className="mt-0.5 flex-shrink-0" />
        <p className="text-sm">
          Sub kriteria adalah skala penilaian per kriteria (mis. Kualitas Rasa dan Minat Pembeli memakai skala 1 – 5). Kriteria yang punya sub kriteria dinilai lewat pilihan skala; yang tidak punya (Jumlah Penjualan, Harga Jual) diisi angka asli langsung. Label skala dapat disesuaikan admin.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {criteria.map((c) => {
          const active = c.id === activeId;
          const count = subCriteria.filter((s) => s.criteriaId === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: active ? 'var(--primary)' : 'var(--card)', color: active ? 'var(--primary-foreground)' : 'var(--foreground)', border: '1px solid var(--border)' }}
            >
              {c.kode} · {c.nama} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader
          title={crit ? `Sub Kriteria — ${crit.nama}` : 'Sub Kriteria'}
          desc={crit ? `${crit.kode} · ${crit.jenis === 'BENEFIT' ? 'Benefit' : 'Cost'} · bobot ${crit.bobot}` : undefined}
          action={!readOnly && crit && <Btn onClick={openAdd}><Plus size={16} /> Tambah Skala</Btn>}
        />
        <DataTable head={readOnly ? ['Nilai', 'Label', 'Keterangan'] : ['Nilai', 'Label', 'Keterangan', 'Aksi']} empty="Belum ada skala. Kriteria ini dinilai dengan angka langsung.">
          {subs.map((s) => (
            <tr key={s.id} className="table-row-hover">
              <Td className="font-bold w-20" style={{ color: 'var(--primary)' }}>{s.nilai}</Td>
              <Td className="font-medium">{s.label}</Td>
              <Td style={{ color: 'var(--muted-foreground)' }}>{s.keterangan}</Td>
              {!readOnly && (
                <Td>
                  <div className="flex gap-1.5">
                    <IconBtn title="Ubah" onClick={() => openEdit(s)}><Pencil size={14} /></IconBtn>
                    <IconBtn title="Hapus" danger onClick={() => remove(s)}><Trash2 size={14} /></IconBtn>
                  </div>
                </Td>
              )}
            </tr>
          ))}
        </DataTable>
      </Card>

      <Modal open={open} title={editing ? 'Ubah Sub Kriteria' : 'Tambah Sub Kriteria'} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Field label="Label"><input className="input-warm w-full px-3 py-2 rounded-lg" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="mis. Skala 5" /></Field>
          <Field label="Nilai skala"><input type="number" className="input-warm w-full px-3 py-2 rounded-lg" value={form.nilai} onChange={(e) => setForm({ ...form, nilai: e.target.value })} placeholder="5" /></Field>
          <Field label="Keterangan"><textarea rows={2} className="input-warm w-full px-3 py-2 rounded-lg" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} /></Field>
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
