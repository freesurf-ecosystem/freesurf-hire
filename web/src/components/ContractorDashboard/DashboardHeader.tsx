import React from 'react';

interface DashboardHeaderProps {
  contractorName: string;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export default function DashboardHeader({ contractorName, onLogout, onNavigateHome }: DashboardHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <button 
            onClick={onNavigateHome}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img
              src="/logo-black.svg"
              alt="FreeSurf"
              className="h-16 w-24 object-contain"
            />
            <h1 className="text-xl font-bold text-gray-900">FreeSurf</h1>
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {contractorName}</span>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
