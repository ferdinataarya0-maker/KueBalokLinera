'use client';

import OwnerLayout from '@/components/OwnerLayout';
import { OwnerSensitivitas } from '@/components/dss/OwnerViews';

export default function Page() {
  return (
    <OwnerLayout title="Analisis Sensitivitas (λ)" breadcrumbs={[{ label: 'Owner', href: '/dashboard-owner' }, { label: 'Hasil Analisis' }, { label: 'Analisis Sensitivitas (λ)' }]}>
      <OwnerSensitivitas />
    </OwnerLayout>
  );
}
