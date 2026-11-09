'use client';

import AdminLayout from '@/components/AdminLayout';
import DashboardContent from './components/DashboardContent';

export default function DashboardAdminPage() {
  return (
    <AdminLayout
      title="Dashboard"
      breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
    >
      <DashboardContent />
    </AdminLayout>
  );
}