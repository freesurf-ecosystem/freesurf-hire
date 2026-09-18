import React from 'react';
import { Search } from 'lucide-react';

const GoogleIndexingTab = React.memo(() => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Google Indexing</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Google Indexing Management</h3>
          <p className="text-gray-600">This feature is coming soon. It will help manage Google indexing for contractor profiles and property listings.</p>
        </div>
      </div>
    </div>
  );
});

export default GoogleIndexingTab;