'use client';

import AdminLayout from '@/components/AdminLayout';
import MatriksKeputusan from '@/components/dss/MatriksKeputusan';

export default function Page() {
  return (
    <AdminLayout title="Matriks Keputusan" breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Penilaian' }, { label: 'Matriks Keputusan' }]}>
      <MatriksKeputusan />
    </AdminLayout>
  );
}
