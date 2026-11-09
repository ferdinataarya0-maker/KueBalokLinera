'use client';

import OwnerLayout from '@/components/OwnerLayout';
import { OwnerProfil } from '@/components/dss/OwnerViews';

export default function Page() {
  return (
    <OwnerLayout title="Profil Owner" breadcrumbs={[{ label: 'Owner', href: '/dashboard-owner' }, { label: 'Akun' }, { label: 'Profil Owner' }]}>
      <OwnerProfil />
    </OwnerLayout>
  );
}
