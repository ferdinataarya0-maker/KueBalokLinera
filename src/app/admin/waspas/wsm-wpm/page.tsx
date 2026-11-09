'use client';

import AdminLayout from '@/components/AdminLayout';
import { WaspasWsmWpm } from '@/components/dss/CalcPages';

export default function Page() {
  return (
    <AdminLayout title="WSM & WPM" breadcrumbs={[{ label: 'Admin', href: '/dashboard-admin' }, { label: 'Hitung WASPAS' }, { label: 'WSM & WPM' }]}>
      <WaspasWsmWpm />
    </AdminLayout>
  );
}
