import React from 'react';
import { Home, LogOut, Clock, Eye, EyeOff, Shield } from 'lucide-react';

interface AdminHeaderProps {
  onNavigateHome: () => void;
  onLogout: () => void;
  sessionActive: boolean;
  isAdminPanel: boolean;
}

export default function AdminHeader({ onNavigateHome, onLogout, sessionActive, isAdminPanel }: AdminHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onNavigateHome}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Home className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">FreeSurf</h1>
            </button>
            {isAdminPanel && (
              <div className="bg-red-100 px-3 py-1 rounded-full">
                <span className="text-red-800 text-sm font-medium">Admin Panel</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <Clock className="h-4 w-4 inline mr-1" />
              Session {sessionActive ? 'active' : 'inactive'}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
