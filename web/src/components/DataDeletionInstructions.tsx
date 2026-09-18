import React from 'react';
import { useNavigate } from '../lib/navigation-compat';
import { ArrowLeft } from 'lucide-react';
import Footer from './Layout/Footer';

export default function DataDeletionInstructions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Data Request Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Data Access, Correction, and Deletion Requests</h1>
            <p className="text-gray-600">How to ask what personal information FreeSurf has about you, request corrections, or request deletion</p>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Privacy Request Options</h2>
            <p className="text-gray-700 mb-6">
              At FreeSurf, we respect your privacy and your right to understand and control your personal information.
              You may contact us to request access to the personal information we store about you, ask us to correct or update inaccurate information,
              or request deletion of personal information from our systems, subject to applicable legal and operational requirements.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Submit a Request</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Email Our Support Team</h3>
                <p className="text-blue-800 mb-4">
                  To request access to your data, a correction, or deletion, please email our support team at:
                </p>
                <div className="bg-white border border-blue-300 rounded-lg p-4">
                  <a 
                    href="mailto:support@freesurf.tools?subject=Privacy Request"
                    className="text-blue-600 hover:text-blue-800 font-semibold text-lg"
                  >
                    support@freesurf.tools
                  </a>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information to Include in Your Request</h2>
            <p className="text-gray-700 mb-4">
              To help us process your request efficiently, please include the following information in your email:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Subject Line:</strong> "Privacy Request", "Data Access Request", "Data Correction Request", or "Data Deletion Request"</li>
              <li><strong>Your Full Name:</strong> As it appears in our records</li>
              <li><strong>Email Address:</strong> The email address associated with your account</li>
              <li><strong>Account Type:</strong> Whether you are a client or a contractor</li>
              <li><strong>Request Type:</strong> Whether you want access, correction, deletion, or another privacy-related action</li>
              <li><strong>Verification Information:</strong> Any additional information that can help us verify your identity</li>
              <li><strong>Specific Details:</strong> If applicable, identify the information you want corrected or the records you want us to review</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">What You Can Ask For</h2>
            <p className="text-gray-700 mb-4">
              Depending on your request and applicable law, you may ask us to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Confirm whether we store personal information associated with you</li>
              <li>Provide a copy or summary of the personal information we retain about you</li>
              <li>Correct or update inaccurate account, contact, or request-related information</li>
              <li>Delete personal information associated with your account or prior submissions, where deletion is legally available</li>
              <li>Explain whether certain information must be retained for legal, security, fraud-prevention, tax, accounting, or contractual reasons</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Examples of Information We May Review</h2>
            <p className="text-gray-700 mb-4">
              Depending on how you used the site or app, a privacy request may involve categories such as:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Account and profile information</li>
              <li>Contact details such as name, email address, and phone number</li>
              <li>Client request and submission information</li>
              <li>Communication history, inquiry details, and preferences</li>
              <li>Operational records needed to support your account or comply with legal obligations</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Processing Timeline</h2>
            <p className="text-gray-700 mb-6">
              We will acknowledge receipt of your privacy request within 48 hours when practical and will respond within the timeframe required by applicable law.
              In many cases, we aim to complete review and response within 30 days after identity verification. If we need additional time,
              clarification, or verification information, we will let you know.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Notes</h3>
                <ul className="text-yellow-800 space-y-1 text-sm">
                  <li>- We may need to verify your identity before fulfilling a request</li>
                  <li>- Some information may need to be retained for legal, regulatory, security, fraud-prevention, or recordkeeping reasons</li>
                  <li>- If deletion is completed, it may be permanent and cannot be undone</li>
                  <li>- If you ask for deletion of account-related information, you may need to create a new account to use certain services again</li>
                  <li>- We may request clarification if your email does not clearly identify what action you want us to take</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
