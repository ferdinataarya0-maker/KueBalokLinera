import DashboardKPIGrid from './DashboardKPIGrid';
import DashboardCharts from './DashboardCharts';
import DashboardQuickActions from './DashboardQuickActions';
import DashboardRecentActivity from './DashboardRecentActivity';
import DashboardWarnings from './DashboardWarnings';

export default function DashboardContent() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Warnings */}
      <DashboardWarnings />

      {/* KPI Cards */}
      <DashboardKPIGrid />

      {/* Charts + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DashboardCharts />
        </div>
        <div className="xl:col-span-1">
          <DashboardQuickActions />
        </div>
      </div>

      {/* Recent Activity */}
      <DashboardRecentActivity />
    </div>
  );
}