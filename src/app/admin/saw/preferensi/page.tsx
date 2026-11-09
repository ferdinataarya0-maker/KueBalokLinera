'use client';

import AdminLayout from '@/components/AdminLayout';
import { SawPreferensi } from '@/components/dss/CalcPages';

export default function Page() {
  return (
    <AdminLayout title="Nilai Preferensi SAW" breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Hitung SAW' }, { label: 'Nilai Preferensi SAW' }]}>
      <SawPreferensi />
    </AdminLayout>
  );
}
