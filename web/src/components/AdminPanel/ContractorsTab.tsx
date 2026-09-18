import React from 'react';
import { RefreshCw, Users, Pause, Play, Edit, Save, X, Star } from 'lucide-react';
import GoogleReviewsManager from '../GoogleReviewsManager'; // Assuming this is already a separate component

interface ContractorsTabProps {
  contractors: any[];
  isLoading: boolean;
  onAdminPauseToggle: (id: string, paused: boolean) => void;
  pausingContractors: Set<string>;
  onReviewsUpdate: () => void;
}

const ContractorsTab = React.memo(({ contractors, isLoading, onAdminPauseToggle, pausingContractors, onReviewsUpdate }: ContractorsTabProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading contractors...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contractor Management</h2>
        <p className="text-gray-600">{contractors.length} total contractors</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Google Reviews</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contractors.map((contractor) => (
                <tr key={contractor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={contractor.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={contractor.name}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{contractor.name}</div>
                        <div className="text-sm text-gray-500">{contractor.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contractor.email}</div>
                    <div className="text-sm text-gray-500">{contractor.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contractor.admin_paused ? 'bg-red-100 text-red-800' :
                        contractor.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {contractor.admin_paused ? 'Admin Paused' : 
                         contractor.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {contractor.admin_paused && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Admin Override
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-64">
                      <GoogleReviewsManager 
                        contractor={contractor} 
                        onUpdate={onReviewsUpdate}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(contractor.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onAdminPauseToggle(contractor.id, contractor.admin_paused)}
                        disabled={pausingContractors.has(contractor.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          contractor.admin_paused
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {pausingContractors.has(contractor.id) && (
                          <span className="inline-block animate-spin mr-1">⏳</span>
                        )}
                        {contractor.admin_paused ? 'Admin Unpause' : 'Admin Pause'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contractors.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No contractors found. This could indicate a database connection issue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default ContractorsTab;