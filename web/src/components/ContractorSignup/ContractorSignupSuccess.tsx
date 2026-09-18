import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ContractorSignupSuccessProps {
  onGoToDashboard: () => void;
  onGoToHomepage: () => void;
}

export default function ContractorSignupSuccess({
  onGoToDashboard,
  onGoToHomepage
}: ContractorSignupSuccessProps) {
  return (
    <div>
      <div className="text-center">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to FreeSurf!</h2>
        <p className="text-gray-600 mb-6">
          Your contractor profile has been created. Clients can now find you in search and send you requests.
        </p>
        <div className="space-y-4">
          <button
            onClick={onGoToDashboard}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={onGoToHomepage}
            className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
