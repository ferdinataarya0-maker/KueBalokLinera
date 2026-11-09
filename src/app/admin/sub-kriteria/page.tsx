'use client';

import AdminLayout from '@/components/AdminLayout';
import SubKriteriaManager from '@/components/dss/SubKriteriaManager';

export default function Page() {
  return (
    <AdminLayout title="Sub Kriteria (Skala Penilaian)" breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Kriteria' }, { label: 'Sub Kriteria (Skala Penilaian)' }]}>
      <SubKriteriaManager />
    </AdminLayout>
  );
}
