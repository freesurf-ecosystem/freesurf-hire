import React from 'react';
import { RefreshCw } from 'lucide-react';

interface AdminConfirmationDialogProps {
  showConfirmDialog: {
    type: 'pause' | 'unpause';
    data: any;
  } | null;
  setShowConfirmDialog: (dialog: {
    type: 'pause' | 'unpause';
    data: any;
  } | null) => void;
  confirmAction: () => void;
  isProcessing: string | null;
}

const AdminConfirmationDialog = React.memo(({
  showConfirmDialog,
  setShowConfirmDialog,
  confirmAction,
  isProcessing,
}: AdminConfirmationDialogProps) => {
  if (!showConfirmDialog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {showConfirmDialog.type === 'pause' && 'Pause Contractor'}
            {showConfirmDialog.type === 'unpause' && 'Unpause Contractor'}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {showConfirmDialog.type === 'pause' && 
              'Are you sure you want to pause this contractor? They will stop receiving new leads and cannot unpause themselves.'}
            {showConfirmDialog.type === 'unpause' && 
              'Are you sure you want to unpause this contractor? They will start receiving leads again.'}
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowConfirmDialog(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmAction}
              disabled={!!isProcessing}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                showConfirmDialog.type === 'pause'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {!!isProcessing && (
                <RefreshCw className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
              )}
              {showConfirmDialog.type === 'pause' && 'Pause Contractor'}
              {showConfirmDialog.type === 'unpause' && 'Unpause Contractor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AdminConfirmationDialog;