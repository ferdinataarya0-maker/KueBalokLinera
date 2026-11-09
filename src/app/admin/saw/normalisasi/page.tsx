'use client';

import AdminLayout from '@/components/AdminLayout';
import { SawNormalisasi } from '@/components/dss/CalcPages';

export default function Page() {
  return (
    <AdminLayout title="Normalisasi SAW" breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Hitung SAW' }, { label: 'Normalisasi SAW' }]}>
      <SawNormalisasi />
    </AdminLayout>
  );
}
