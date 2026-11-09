'use client';

import OwnerLayout from '@/components/OwnerLayout';
import { OwnerAktivitas } from '@/components/dss/OwnerViews';

export default function Page() {
  return (
    <OwnerLayout title="Riwayat Aktivitas" breadcrumbs={[{ label: 'Owner', href: '/dashboard-owner' }, { label: 'Laporan' }, { label: 'Riwayat Aktivitas' }]}>
      <OwnerAktivitas />
    </OwnerLayout>
  );
}
