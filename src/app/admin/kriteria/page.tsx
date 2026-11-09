'use client';

import AdminLayout from '@/components/AdminLayout';
import KriteriaManager from '@/components/dss/KriteriaManager';

export default function Page() {
  return (
    <AdminLayout title="Data Kriteria & Bobot" breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Kriteria' }, { label: 'Data Kriteria & Bobot' }]}>
      <KriteriaManager />
    </AdminLayout>
  );
}
