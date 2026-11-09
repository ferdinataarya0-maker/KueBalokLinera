'use client';

import OwnerLayout from '@/components/OwnerLayout';
import { OwnerRekomendasi } from '@/components/dss/OwnerViews';

export default function Page() {
  return (
    <OwnerLayout title="Rekomendasi Varian" breadcrumbs={[{ label: 'Owner', href: '/dashboard-owner' }, { label: 'Ringkasan Keputusan' }, { label: 'Rekomendasi Varian' }]}>
      <OwnerRekomendasi />
    </OwnerLayout>
  );
}
