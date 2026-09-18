import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation-compat';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    validateResetSession();
  }, []);

  const validateResetSession = async () => {
    try {
      console.log('[RESET] Validating password reset session...');
      console.log('[RESET] Current URL:', window.location.href);
      console.log('[RESET] URL hash:', window.location.hash);
      
      // Check if we have the proper hash parameters for password reset
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      
      console.log('[RESET] Hash parameters:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        type: type,
        tokenPreview: accessToken?.substring(0, 20) + '...'
      });

      // Verify this is actually a password reset (not email verification)
      if (type !== 'recovery') {
        console.log('[RESET] Not a password reset session, type:', type);
        setError('Invalid password reset link. Please request a new password reset.');
        setIsValidating(false);
        return;
      }

      if (!accessToken || !refreshToken) {
        console.log('[RESET] Missing required tokens for password reset');
        setError('Invalid password reset link. Please request a new password reset.');
        setIsValidating(false);
        return;
      }

      // Set the session using the tokens from the URL
      console.log('[RESET] Setting session with tokens from URL...');
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        console.error('[RESET] Failed to set session:', error);
        setError('Password reset link is invalid or has expired. Please request a new password reset.');
        setIsValidating(false);
        return;
      }

      if (data.session) {
        console.log('[RESET] Password reset session validated successfully');
        setIsValidSession(true);
      } else {
        console.log('[RESET] No session created from tokens');
        setError('Password reset link is invalid or has expired. Please request a new password reset.');
      }

    } catch (error: any) {
      console.error('[RESET] Error validating reset session:', error);
      setError('An error occurred validating your reset link. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[RESET] Updating password...');
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      console.log('[RESET] Password updated successfully');
      setResetComplete(true);

      // Clean up the URL hash
      window.history.replaceState({}, document.title, window.location.pathname);

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login?reset=success');
      }, 3000);

    } catch (error: any) {
      console.error('[RESET] Error updating password:', error);
      setError(error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating Reset Link</h2>
          <p className="text-gray-600">Please wait while we verify your password reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Login
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

  if (resetComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Password Reset Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been updated successfully. You can now log in with your new password.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to login page in a few seconds...
          </p>
          <button
            onClick={() => navigate('/login?reset=success')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none p-0 mb-6 mx-auto"
          >
            <Home className="h-12 w-12 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">FreeSurf</h1>
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="h-4 w-4 inline mr-1" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="h-4 w-4 inline mr-1" />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Password Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>- At least 6 characters long</li>
                <li>- Must match confirmation password</li>
                <li>- Use a strong, unique password</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
