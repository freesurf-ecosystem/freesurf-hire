import React from 'react';
import { BarChart3 } from 'lucide-react';

interface AdminTabsProps {
  activeTab: 'dashboard';
  onTabClick: (tabId: 'dashboard') => void;
}

export default function AdminTabs({ activeTab, onTabClick }: AdminTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon as any;
          return (
            <button
              key={tab.id}
              onClick={() => onTabClick(tab.id as 'dashboard')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === (tab.id as 'dashboard')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}