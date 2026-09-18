import React from 'react';
import { Search } from 'lucide-react';
import { Contractor } from '../../../types';
import ContractorCard from '../../ContractorCard';

interface ContractorCardGridProps {
  contractors: Contractor[];
  isLoading: boolean;
  onContactClick: (contractor: Contractor) => void;
  emptyStateMessage?: string;
  emptyStateService?: string;
  onEmptyStateAction?: () => void;
}

export const ContractorCardGrid: React.FC<ContractorCardGridProps> = ({
  contractors,
  isLoading,
  onContactClick,
  emptyStateMessage = 'No contractors found.',
  emptyStateService = 'this service',
  onEmptyStateAction
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Placeholder contractor cards that show immediately */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="text-center text-gray-600">
          <p>Loading contractors...</p>
        </div>
      </div>
    );
  }

  if (contractors.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {contractors.map((contractor) => (
          <ContractorCard
            key={contractor.id}
            contractor={contractor}
            onContactClick={onContactClick}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="bg-white rounded-xl shadow-lg p-12 max-w-2xl mx-auto">
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {emptyStateMessage}
        </h2>
        <p className="text-gray-600 mb-8">
          We don't have contractors for {emptyStateService} yet, but there are other qualified pros who might help.
        </p>
        {onEmptyStateAction && (
          <div className="space-y-4">
            <button
              onClick={onEmptyStateAction}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
