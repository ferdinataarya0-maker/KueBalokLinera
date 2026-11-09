'use client';

import OwnerLayout from '@/components/OwnerLayout';
import { OwnerRanking } from '@/components/dss/OwnerViews';

export default function Page() {
  return (
    <OwnerLayout title="Ranking Akhir" breadcrumbs={[{ label: 'Owner', href: '/dashboard-owner' }, { label: 'Hasil Analisis' }, { label: 'Ranking Akhir' }]}>
      <OwnerRanking />
    </OwnerLayout>
  );
}
