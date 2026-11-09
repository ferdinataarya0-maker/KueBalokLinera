'use client';

import OwnerLayout from '@/components/OwnerLayout';
import VarianManager from '@/components/dss/VarianManager';

export default function Page() {
  return (
    <OwnerLayout title="Varian Kue" breadcrumbs={[{ label: 'Owner', href: '/dashboard-owner' }, { label: 'Data Referensi' }, { label: 'Varian Kue' }]}>
      <VarianManager readOnly />
    </OwnerLayout>
  );
}
