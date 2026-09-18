import React from 'react';
import { 
  User, Star, AlertCircle, CheckCircle, RefreshCw, 
  FileText, Phone, Settings, Pause, Play, Mail
} from 'lucide-react';
import { Contractor } from '../../types';

interface DashboardSidebarProps {
  contractor: Contractor;
  leadsCount: number;
  activeTab: 'profile' | 'preferences' | 'leads' | 'contacts';
  setActiveTab: (tab: 'profile' | 'preferences' | 'leads' | 'contacts') => void;
  handlePauseToggle: () => void;
  isPausing: boolean;
  error: string;
  successMessage: string;
}

export default function DashboardSidebar({ 
  contractor, 
  leadsCount, 
  activeTab, 
  setActiveTab, 
  handlePauseToggle, 
  isPausing,
  error,
  successMessage 
}: DashboardSidebarProps) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white text-center">
          <img
            src={contractor.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'}
            alt={contractor.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white mx-auto mb-4"
          />
          <h2 className="text-xl font-bold">{contractor.name}</h2>
          <p className="text-blue-100">{contractor.company}</p>
          <div className="flex items-center justify-center mt-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm">{contractor.rating} ({contractor.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Profile Status */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Status</h3>
          
          {/* Admin Paused Warning */}
          {contractor?.admin_paused && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-orange-800 font-medium">Account Paused by Support</p>
                  <p className="text-orange-700 text-sm mt-2 leading-relaxed">
                    Your profile is hidden from search while it is paused. This can only be lifted by
                    support — contact support@freesurf.tools for assistance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <p className="text-green-800">{successMessage}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${contractor.is_active ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm text-gray-600">
              {contractor.is_active ? 'Active - Listed in search' : 'Paused - Hidden from search'}
            </span>
          </div>
          <div className="mt-4">
            <button
              onClick={handlePauseToggle}
              disabled={isPausing || contractor.admin_paused}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                contractor.is_active
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isPausing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : contractor.is_active ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>
                {isPausing 
                  ? (contractor.is_active ? 'Pausing...' : 'Activating...')
                  : (contractor.is_active ? 'Pause Profile' : 'Activate Profile')
                }
              </span>
            </button>
            <p className="text-xs text-gray-500 mt-2">
              {contractor.admin_paused
                ? 'Paused by support — contact support to reactivate'
                : contractor.is_active
                  ? 'Pause to hide your profile from search'
                  : 'Activate to list your profile in search again'
              }
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mt-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>
            
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'preferences' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Services &amp; Service Area</span>
            </button>
            
            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'leads' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Requests ({leadsCount})</span>
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'notifications' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Mail className="h-5 w-5" />
              <span>Email Preferences</span>
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'contacts' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Phone className="h-5 w-5" />
              <span>Contact History</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}