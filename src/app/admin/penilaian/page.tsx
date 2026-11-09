'use client';

import AdminLayout from '@/components/AdminLayout';
import PenilaianEditor from '@/components/dss/PenilaianEditor';

export default function Page() {
  return (
    <AdminLayout title="Input Penilaian" breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Penilaian' }, { label: 'Input Penilaian' }]}>
      <PenilaianEditor />
    </AdminLayout>
  );
}
