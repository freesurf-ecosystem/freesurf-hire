import React, { useState } from 'react';
import { useNavigate } from '../lib/navigation-compat';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ContractorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const authFieldClassName = 'w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500';
  const socialButtonClassName = 'w-full flex items-center justify-center space-x-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50';

  const handleFacebookLogin = async () => {
    if (typeof window === 'undefined') return;
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(`Facebook login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (typeof window === 'undefined') return;
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(`Apple login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (typeof window === 'undefined') return;
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(`Google login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;
    setIsResetting(true);
    setResetError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setResetEmailSent(true);
    } catch (error: any) {
      setResetError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setForgotPasswordEmail('');
    setResetError('');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setNeedsVerification(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setNeedsVerification(true);
          setError('Please verify your email address before logging in. Check your inbox for the verification link.');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        if (!data.user.email_confirmed_at) {
          setNeedsVerification(true);
          setError('Please verify your email address before logging in. Check your inbox for the verification link.');
          await supabase.auth.signOut();
          return;
        }

        // Check if user has a contractor profile
        const { data: contractorData, error: contractorError } = await supabase
          .from('hire_contractor_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (contractorError || !contractorData) {
          // No contractor profile, redirect to complete signup
          navigate('/signup');
          return;
        }

        // Has profile, go to dashboard
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    if (typeof window === 'undefined') return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/signup`,
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setError('');
        setNeedsVerification(false);
        setError('Verification email sent! Please check your inbox.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error: any) {
      setError('Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if this is a password reset redirect
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'success') {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Show success message
      setError('Password updated successfully! You can now log in with your new password.');
      setTimeout(() => setError(''), 5000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none p-0 mb-6 mx-auto"
          >
            <img
              src="/logo-black.svg"
              alt="FreeSurf"
              className="h-12 w-auto"
            />
            <h1 className="text-2xl font-bold text-gray-900">FreeSurf</h1>
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Contractor Login</h2>
          <p className="text-gray-600">Access your contractor dashboard</p>
        </div>

        {showForgotPassword ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <button
                onClick={handleBackToLogin}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </button>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reset Your Password</h3>
              <p className="text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {resetEmailSent ? (
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h4>
                <p className="text-gray-600 mb-4">
                  We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
                <button
                  onClick={handleBackToLogin}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    className={authFieldClassName}
                    placeholder="your@email.com"
                  />
                </div>

                {resetError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-red-800 text-sm">{resetError}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isResetting && (
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isResetting ? 'Sending Reset Email...' : 'Send Reset Email'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-4 mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={socialButtonClassName}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={isLoading}
              className={socialButtonClassName}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook</span>
            </button>

            <button
              type="button"
              onClick={handleAppleLogin}
              disabled={isLoading}
              className={socialButtonClassName}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
              <span>Continue with Apple</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or sign in with email</span>
              </div>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={authFieldClassName}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="h-4 w-4 inline mr-1" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${authFieldClassName} pr-10`}
                  placeholder="Enter your password"
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

            {error && (
              <div className={`border rounded-lg p-4 ${
                error.includes('sent') 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start">
                  {error.includes('sent') ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${
                      error.includes('sent') ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {error}
                    </p>
                    {needsVerification && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isLoading}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
                      >
                        Resend verification email
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

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
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Forgot your password?
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
