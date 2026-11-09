'use client';

import OwnerLayout from '@/components/OwnerLayout';
import KriteriaManager from '@/components/dss/KriteriaManager';

export default function Page() {
  return (
    <OwnerLayout title="Data Kriteria & Bobot" breadcrumbs={[{ label: 'Owner', href: '/dashboard-owner' }, { label: 'Kriteria' }, { label: 'Data Kriteria & Bobot' }]}>
      <KriteriaManager readOnly />
    </OwnerLayout>
  );
}
