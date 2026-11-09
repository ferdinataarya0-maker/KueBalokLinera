'use client';

import AdminLayout from '@/components/AdminLayout';
import VarianManager from '@/components/dss/VarianManager';

export default function Page() {
  return (
    <AdminLayout title="Varian Kue" breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Manajemen Data' }, { label: 'Varian Kue' }]}>
      <VarianManager />
    </AdminLayout>
  );
}
