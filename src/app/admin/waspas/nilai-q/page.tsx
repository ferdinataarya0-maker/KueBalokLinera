'use client';

import AdminLayout from '@/components/AdminLayout';
import { WaspasNilaiQ } from '@/components/dss/CalcPages';

export default function Page() {
  return (
    <AdminLayout title="Nilai Q & Ranking WASPAS" breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Hitung WASPAS' }, { label: 'Nilai Q & Ranking WASPAS' }]}>
      <WaspasNilaiQ />
    </AdminLayout>
  );
}
