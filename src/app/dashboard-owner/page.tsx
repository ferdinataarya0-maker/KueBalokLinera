'use client';

import OwnerLayout from '@/components/OwnerLayout';
import { OwnerDashboard } from '@/components/dss/OwnerViews';

export default function Page() {
  return (
    <OwnerLayout title="Dashboard Owner" breadcrumbs={[{ label: 'Owner', href: '/dashboard-owner' }, { label: 'Dashboard' }]}>
      <OwnerDashboard />
    </OwnerLayout>
  );
}
