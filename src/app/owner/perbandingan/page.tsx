'use client';

import OwnerLayout from '@/components/OwnerLayout';
import { OwnerPerbandingan } from '@/components/dss/OwnerViews';

export default function Page() {
  return (
    <OwnerLayout title="Perbandingan SAW vs WASPAS" breadcrumbs={[{ label: 'Owner', href: '/dashboard-owner' }, { label: 'Hasil Analisis' }, { label: 'Perbandingan SAW vs WASPAS' }]}>
      <OwnerPerbandingan />
    </OwnerLayout>
  );
}
