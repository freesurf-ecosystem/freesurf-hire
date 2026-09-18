import React from 'react';
import { RefreshCw, Users, CheckCircle, FileText, Zap, DollarSign } from 'lucide-react';

interface AdminStats {
  totalContractors: number;
  activeContractors: number;
  totalLeads: number;
  totalPaidLeads: number;
  totalRevenue: number;
  recentActivity: any[];
}

interface DashboardTabProps {
  stats: AdminStats;
  isLoading: boolean;
  adminSurfaceQuarantined?: boolean;
}

const DashboardTab = React.memo(({ stats, isLoading, adminSurfaceQuarantined = false }: DashboardTabProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

        {adminSurfaceQuarantined && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">Admin tools are temporarily quarantined.</p>
            <p className="mt-1 text-sm text-amber-800">
              The existing admin area depends on browser-side access patterns that need to be replaced with a trusted server-backed admin session and role-aware endpoints before support staff can use it safely.
            </p>
          </div>
        )}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-600">Total Contractors</p>
                <p className="text-2xl font-bold text-blue-900">{adminSurfaceQuarantined ? 'Off' : stats.totalContractors}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-600">Active Contractors</p>
                <p className="text-2xl font-bold text-green-900">{adminSurfaceQuarantined ? 'Off' : stats.activeContractors}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-600">Requests</p>
                <p className="text-2xl font-bold text-purple-900">{adminSurfaceQuarantined ? 'Off' : stats.totalLeads}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Lead Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {!adminSurfaceQuarantined && stats.recentActivity.slice(0, 10).map((request: any) => (
              <div key={request.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {request.service_slug || 'Service'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.client_name || 'Client'} → {request.contractors?.name || 'Contractor'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {adminSurfaceQuarantined && (
              <div className="px-6 py-6 text-sm text-gray-500">
                Contractor and request activity is hidden until the admin console is rebuilt with server-side authorization and support-safe permissions.
              </div>
            )}
            {!adminSurfaceQuarantined && stats.recentActivity.length === 0 && (
              <div className="px-6 py-6 text-sm text-gray-500">No recent activity.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default DashboardTab;