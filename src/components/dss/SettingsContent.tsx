'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useDSSData } from '@/lib/dss-store';
import { getSession, type Session } from '@/lib/auth';
import { Card, CardHeader, Btn, Field, Loading } from '@/components/ui/Parts';

export default function SettingsContent() {
  const d = useDSSData();
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => setSession(getSession()), []);
  if (!d.ready) return <Loading />;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card>
        <CardHeader title="Profil Akun" desc="Akun yang sedang masuk" />
        <div className="space-y-3">
          <Field label="Nama"><input className="input-warm w-full px-3 py-2 rounded-lg" value={session?.name ?? ''} readOnly /></Field>
          <Field label="Email"><input className="input-warm w-full px-3 py-2 rounded-lg" value={session?.email ?? ''} readOnly /></Field>
          <Field label="Peran"><input className="input-warm w-full px-3 py-2 rounded-lg capitalize" value={session?.role ?? ''} readOnly /></Field>
        </div>
      </Card>
      <Card>
        <CardHeader title="Parameter Metode" desc="Nilai λ bawaan untuk perhitungan WASPAS" />
        <div className="flex items-center gap-4">
          <input type="range" min={0} max={1} step={0.05} value={d.lambda} onChange={(e) => d.update((s) => ({ ...s, lambda: Number(e.target.value) }))} className="flex-1" style={{ accentColor: 'var(--primary)' }} />
          <span className="text-lg font-bold w-14 text-right" style={{ color: 'var(--primary)' }}>{d.lambda.toFixed(2)}</span>
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader title="Data" desc="Kembalikan seluruh data ke data penelitian awal dari spk.xlsx (10 varian, 4 kriteria, 40 penilaian)" />
        <Btn variant="danger" onClick={() => { if (window.confirm('Kembalikan semua data ke data penelitian awal? Perubahan Anda akan hilang.')) d.reset(); }}>
          <RotateCcw size={15} /> Reset Data
        </Btn>
      </Card>
    </div>
  );
}
