'use client';

import AdminLayout from '@/components/AdminLayout';
import ExcelTools from '@/components/dss/ExcelTools';

export default function Page() {
  return (
    <AdminLayout title="Import / Export Excel" breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Alat Bantu' }, { label: 'Import / Export Excel' }]}>
      <ExcelTools />
    </AdminLayout>
  );
}
