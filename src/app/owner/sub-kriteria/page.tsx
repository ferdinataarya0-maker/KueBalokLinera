'use client';

import OwnerLayout from '@/components/OwnerLayout';
import SubKriteriaManager from '@/components/dss/SubKriteriaManager';

export default function Page() {
  return (
    <OwnerLayout title="Sub Kriteria (Skala Penilaian)" breadcrumbs={[{ label: 'Owner', href: '/dashboard-owner' }, { label: 'Kriteria' }, { label: 'Sub Kriteria' }]}>
      <SubKriteriaManager readOnly />
    </OwnerLayout>
  );
}
