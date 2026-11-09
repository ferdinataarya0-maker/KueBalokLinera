'use client';

import OwnerLayout from '@/components/OwnerLayout';
import { OwnerLaporan } from '@/components/dss/OwnerViews';

export default function Page() {
  return (
    <OwnerLayout title="Laporan Hasil" breadcrumbs={[{ label: 'Owner', href: '/dashboard-owner' }, { label: 'Laporan' }, { label: 'Laporan Hasil' }]}>
      <OwnerLaporan />
    </OwnerLayout>
  );
}
