'use client';

import AdminLayout from '@/components/AdminLayout';
import SettingsContent from '@/components/dss/SettingsContent';

export default function Page() {
  return (
    <AdminLayout title="Pengaturan" breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Alat Bantu' }, { label: 'Pengaturan' }]}>
      <SettingsContent />
    </AdminLayout>
  );
}
