'use client';

import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useDSSData, nextId } from '@/lib/dss-store';
import { formatRupiah, isPriceCriteria, type Alternative } from '@/lib/dss-data';
import { Card, CardHeader, Btn, IconBtn, Modal, Field, DataTable, Td, Loading } from '@/components/ui/Parts';

const empty = { nama: '', harga: '', deskripsi: '' };

export default function VarianManager({ readOnly = false }: { readOnly?: boolean }) {
  const { alternatives, criteria, ready, update } = useDSSData();
  const [editing, setEditing] = useState<Alternative | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  if (!ready) return <Loading />;

  const openAdd = () => { setEditing(null); setForm(empty); setError(''); setOpen(true); };
  const openEdit = (a: Alternative) => { setEditing(a); setForm({ nama: a.nama, harga: String(a.harga), deskripsi: a.deskripsi }); setError(''); setOpen(true); };

  const save = () => {
    const harga = Number(form.harga);
    if (!form.nama.trim()) return setError('Nama varian wajib diisi.');
    if (!Number.isFinite(harga) || harga <= 0) return setError('Harga harus berupa angka lebih dari 0.');
    const hargaCrit = criteria.find((c) => isPriceCriteria(c)); // Harga Jual (C4) disinkronkan dengan harga varian
    update((s) => {
      let alts: Alternative[];
      let id: string;
      if (editing) {
        id = editing.id;
        alts = s.alternatives.map((a) => (a.id === id ? { ...a, nama: form.nama.trim(), harga, deskripsi: form.deskripsi.trim() } : a));
      } else {
        id = nextId('alt');
        const nums = s.alternatives.map((a) => Number(a.kode.replace(/\D/g, '')) || 0);
        const kode = `A${Math.max(0, ...nums) + 1}`;
        alts = [...s.alternatives, { id, kode, nama: form.nama.trim(), harga, deskripsi: form.deskripsi.trim() }];
      }
      // Sinkronkan nilai kriteria Harga dengan harga varian
      let assessments = s.assessments;
      if (hargaCrit) {
        const exists = assessments.some((x) => x.alternativeId === id && x.criteriaId === hargaCrit.id);
        assessments = exists
          ? assessments.map((x) => (x.alternativeId === id && x.criteriaId === hargaCrit.id ? { ...x, nilai: harga } : x))
          : [...assessments, { id: nextId('ass'), alternativeId: id, criteriaId: hargaCrit.id, nilai: harga }];
      }
      return { ...s, alternatives: alts, assessments };
    }, editing ? `Mengubah varian ${form.nama.trim()}` : `Menambah varian ${form.nama.trim()}`);
    setOpen(false);
  };

  const remove = (a: Alternative) => {
    if (!window.confirm(`Hapus varian "${a.nama}"? Semua penilaiannya ikut terhapus.`)) return;
    update((s) => ({
      ...s,
      alternatives: s.alternatives.filter((x) => x.id !== a.id),
      assessments: s.assessments.filter((x) => x.alternativeId !== a.id),
    }), `Menghapus varian ${a.nama}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader
          title="Daftar Varian Kue Balok"
          desc={`${alternatives.length} alternatif yang dinilai pada perhitungan SAW & WASPAS`}
          action={!readOnly && <Btn onClick={openAdd}><Plus size={16} /> Tambah Varian</Btn>}
        />
        <DataTable head={readOnly ? ['Kode', 'Varian', 'Harga Jual', 'Deskripsi'] : ['Kode', 'Varian', 'Harga Jual', 'Deskripsi', 'Aksi']} empty="Belum ada varian.">
          {alternatives.map((a) => (
            <tr key={a.id} className="table-row-hover">
              <Td className="font-semibold" style={{ color: 'var(--primary)' }}>{a.kode}</Td>
              <Td className="font-medium">{a.nama}</Td>
              <Td className="whitespace-nowrap">{formatRupiah(a.harga)}</Td>
              <Td style={{ color: 'var(--muted-foreground)' }}>{a.deskripsi || '—'}</Td>
              {!readOnly && (
                <Td>
                  <div className="flex gap-1.5">
                    <IconBtn title="Ubah" onClick={() => openEdit(a)}><Pencil size={14} /></IconBtn>
                    <IconBtn title="Hapus" danger onClick={() => remove(a)}><Trash2 size={14} /></IconBtn>
                  </div>
                </Td>
              )}
            </tr>
          ))}
        </DataTable>
      </Card>

      <Modal open={open} title={editing ? 'Ubah Varian' : 'Tambah Varian'} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Field label="Nama varian"><input className="input-warm w-full px-3 py-2 rounded-lg" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="mis. Oreo" /></Field>
          <Field label="Harga Jual (Rp)" hint="Nilai ini otomatis menjadi penilaian kriteria Harga Jual."><input type="number" className="input-warm w-full px-3 py-2 rounded-lg" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} placeholder="20000" /></Field>
          <Field label="Deskripsi"><textarea rows={3} className="input-warm w-full px-3 py-2 rounded-lg" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} /></Field>
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
