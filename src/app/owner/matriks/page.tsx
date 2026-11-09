'use client';

import OwnerLayout from '@/components/OwnerLayout';
import MatriksKeputusan from '@/components/dss/MatriksKeputusan';

export default function Page() {
  return (
    <OwnerLayout title="Matriks Keputusan" breadcrumbs={[{ label: 'Owner', href: '/dashboard-owner' }, { label: 'Data Referensi' }, { label: 'Matriks Keputusan' }]}>
      <MatriksKeputusan />
    </OwnerLayout>
  );
}
