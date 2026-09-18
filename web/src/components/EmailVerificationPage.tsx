import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailVerificationPageProps {
  email: string;
  onBack: () => void;
}

export default function EmailVerificationPage({ email, onBack }: EmailVerificationPageProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError('');
    setResendMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        throw error;
      }

      setResendMessage('Verification email sent successfully! Please check your inbox.');
      setTimeLeft(60);
      setCanResend(false);
    } catch (error: any) {
      setResendError(error.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent a verification link to <strong>{email}</strong>
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">What's next?</h3>
          <div className="space-y-3 text-sm text-gray-600 text-left">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">1</span>
              </div>
              <p>Check your email inbox (and spam folder) for our verification email</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">2</span>
              </div>
              <p>Click the verification link in the email</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">3</span>
              </div>
              <p>You'll be redirected to complete your contractor profile</p>
            </div>
          </div>
        </div>

        {resendMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800 text-sm">{resendMessage}</p>
            </div>
          </div>
        )}

        {resendError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{resendError}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={!canResend || isResending}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {canResend ? 'Resend verification email' : `Resend in ${timeLeft}s`}
              </>
            )}
          </button>

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to signup
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder or contact support if you continue to have issues.
          </p>
        </div>
      </div>
    </div>
  );
}