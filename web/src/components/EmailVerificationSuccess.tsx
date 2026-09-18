import React, { useEffect, useState } from 'react';
import { useNavigate } from '../lib/navigation-compat';
import { CheckCircle, Home, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EmailVerificationSuccess() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    handleEmailVerification();
  }, []);

  const handleEmailVerification = async () => {
    try {
      console.log('ðŸ” Processing email verification...');
      
      // Wait for Supabase to process the auth tokens
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (session?.user) {
        console.log('âœ… Email verified successfully for:', session.user.email);
        
        // Check if they have a contractor profile
        const { data: contractorData, error: contractorError } = await supabase
          .from('hire_contractor_profiles')
          .select('id, display_name, email, is_active')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (contractorError && contractorError.code !== 'PGRST116') {
          console.error('Error checking contractor profile:', contractorError);
        }
        
        if (contractorData) {
          // Has profile, go to dashboard
          navigate('/dashboard');
        } else {
          // No profile, continue with signup
          navigate('/signup');
        }
      } else {
        throw new Error('No session found after email verification');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/signup')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {isProcessing ? (
          <>
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we complete your email verification...</p>
          </>
        ) : (
          <>
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-6">Redirecting you to complete your profile...</p>
          </>
        )}
      </div>
    </div>
  );
}