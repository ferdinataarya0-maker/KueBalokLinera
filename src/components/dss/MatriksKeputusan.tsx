'use client';

import React from 'react';
import { useDSSData } from '@/lib/dss-store';
import { formatRupiah, isPriceCriteria, normalizedWeight } from '@/lib/dss-data';
import { Card, CardHeader, Badge, DataTable, Td, Loading } from '@/components/ui/Parts';

export default function MatriksKeputusan() {
  const { alternatives, criteria, subCriteria, assessments, ready } = useDSSData();
  if (!ready) return <Loading />;

  const cell = (altId: string, critId: string, isPrice: boolean) => {
    const a = assessments.find((x) => x.alternativeId === altId && x.criteriaId === critId);
    if (!a) return <span style={{ color: 'var(--error)' }}>—</span>;
    const sub = subCriteria.find((s) => s.criteriaId === critId && s.nilai === a.nilai);
    if (sub) return <span>{a.nilai} <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>· {sub.label}</span></span>;
    return isPrice ? formatRupiah(a.nilai) : a.nilai.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader title="Matriks Keputusan (X)" desc="Nilai tiap varian terhadap setiap kriteria sebelum dinormalisasi" />
        <DataTable head={['Varian', ...criteria.map((c) => `${c.kode} ${c.nama}`)]} empty="Belum ada data.">
          {alternatives.map((a) => (
            <tr key={a.id} className="table-row-hover">
              <Td className="font-medium whitespace-nowrap"><span className="font-semibold" style={{ color: 'var(--primary)' }}>{a.kode}</span> {a.nama}</Td>
              {criteria.map((c) => <Td key={c.id} className="whitespace-nowrap">{cell(a.id, c.id, isPriceCriteria(c))}</Td>)}
            </tr>
          ))}
        </DataTable>
        <div className="flex flex-wrap gap-2 mt-4">
          {criteria.map((c) => <Badge key={c.id} tone={c.jenis === 'BENEFIT' ? 'success' : 'warning'}>{c.kode}: {c.jenis === 'BENEFIT' ? 'Benefit' : 'Cost'} · bobot {c.bobot} (W = {normalizedWeight(c, criteria).toLocaleString('id-ID', { maximumFractionDigits: 4 })})</Badge>)}
        </div>
      </Card>
    </div>
  );
}
