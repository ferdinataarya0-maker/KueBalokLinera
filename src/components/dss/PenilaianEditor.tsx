'use client';

import React, { useEffect, useState } from 'react';
import { Save, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useDSSData, nextId } from '@/lib/dss-store';
import { isPriceCriteria } from '@/lib/dss-data';
import { Card, CardHeader, Btn, Loading } from '@/components/ui/Parts';

export default function PenilaianEditor() {
  const { alternatives, criteria, subCriteria, assessments, ready, update } = useDSSData();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const key = (a: string, c: string) => `${a}|${c}`;
  const build = () => {
    const d: Record<string, string> = {};
    assessments.forEach((x) => { d[key(x.alternativeId, x.criteriaId)] = String(x.nilai); });
    return d;
  };

  useEffect(() => { if (ready) setDraft(build()); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [ready]);

  if (!ready) return <Loading />;

  const total = alternatives.length * criteria.length;
  const filled = alternatives.reduce((n, a) => n + criteria.filter((c) => (draft[key(a.id, c.id)] ?? '') !== '' && Number.isFinite(Number(draft[key(a.id, c.id)]))).length, 0);

  const setCell = (a: string, c: string, v: string) => { setSaved(false); setDraft((d) => ({ ...d, [key(a, c)]: v })); };

  const save = () => {
    update((s) => {
      const next = [...s.assessments];
      for (const a of s.alternatives) {
        for (const c of s.criteria) {
          const raw = draft[key(a.id, c.id)];
          if (raw === undefined || raw === '' || !Number.isFinite(Number(raw))) continue;
          const nilai = Number(raw);
          const idx = next.findIndex((x) => x.alternativeId === a.id && x.criteriaId === c.id);
          if (idx >= 0) next[idx] = { ...next[idx], nilai };
          else next.push({ id: nextId('ass'), alternativeId: a.id, criteriaId: c.id, nilai });
        }
      }
      // Harga Jual pada penilaian dan harga pada Data Varian harus selalu sama
      const priceCrit = s.criteria.find((c) => isPriceCriteria(c));
      const alternatives = priceCrit
        ? s.alternatives.map((a) => {
            const v = next.find((x) => x.alternativeId === a.id && x.criteriaId === priceCrit.id);
            return v ? { ...a, harga: v.nilai } : a;
          })
        : s.alternatives;
      return { ...s, alternatives, assessments: next };
    }, 'Memperbarui data penilaian varian');
    setSaved(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader
          title="Input Penilaian"
          desc={`Terisi ${filled} dari ${total} sel. Kriteria dengan sub kriteria dinilai lewat skala, lainnya angka langsung.`}
          action={
            <div className="flex gap-2">
              <Btn variant="secondary" onClick={() => { setDraft(build()); setSaved(false); }}><RotateCcw size={15} /> Reset</Btn>
              <Btn onClick={save}><Save size={15} /> Simpan Penilaian</Btn>
            </div>
          }
        />
        {saved && (
          <div className="flex items-center gap-2 mb-4 text-sm font-medium" style={{ color: 'var(--success)' }}>
            <CheckCircle2 size={16} /> Penilaian tersimpan — hasil SAW & WASPAS ikut diperbarui.
          </div>
        )}
        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--muted)' }}>
                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Varian</th>
                {criteria.map((c) => (
                  <th key={c.id} className="text-left px-3 py-2.5 text-xs font-semibold uppercase whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{c.kode} {c.nama}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alternatives.map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-2 font-medium whitespace-nowrap" style={{ borderTop: '1px solid var(--border)' }}>
                    <span className="font-semibold" style={{ color: 'var(--primary)' }}>{a.kode}</span> {a.nama}
                  </td>
                  {criteria.map((c) => {
                    const subs = subCriteria.filter((s) => s.criteriaId === c.id).sort((x, y) => y.nilai - x.nilai);
                    const v = draft[key(a.id, c.id)] ?? '';
                    return (
                      <td key={c.id} className="px-3 py-2" style={{ borderTop: '1px solid var(--border)' }}>
                        {subs.length > 0 ? (
                          <select className="input-warm px-2 py-1.5 rounded-md w-full min-w-[150px]" value={v} onChange={(e) => setCell(a.id, c.id, e.target.value)}>
                            <option value="">— pilih —</option>
                            {subs.map((s) => <option key={s.id} value={s.nilai}>{s.nilai} · {s.label}</option>)}
                            {v !== '' && !subs.some((s) => String(s.nilai) === v) && <option value={v}>{v} (di luar skala)</option>}
                          </select>
                        ) : (
                          <input type="number" className="input-warm px-2 py-1.5 rounded-md w-full min-w-[110px]" value={v} onChange={(e) => setCell(a.id, c.id, e.target.value)} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
