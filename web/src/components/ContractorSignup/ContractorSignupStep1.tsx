import React from 'react';
import { useNavigate } from '../../lib/navigation-compat';
import { 
  Mail, Eye, EyeOff, AlertCircle, CheckCircle, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContractorSignupStep1Props {
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  setFormData: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string;
  setError: (error: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  onNextStep: () => void;
  onShowEmailVerification: () => void;
}

export default function ContractorSignupStep1({
  formData,
  setFormData,
  isLoading,
  setIsLoading,
  error,
  setError,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onNextStep,
  onShowEmailVerification,
}: ContractorSignupStep1Props) {
  const navigate = useNavigate();
  const authFieldClassName = 'w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500';
  const socialButtonClassName = 'w-full flex items-center justify-center space-x-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50';

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/signup` : '/signup',
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(`Google signup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/signup` : '/signup',
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(`Apple signup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    // Check if email already exists
    try {
      const { data: existingContractor } = await supabase
        .from('hire_contractor_profiles')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle();

      if (existingContractor) {
        setError('This email is already in use. Please sign in instead.');
        setIsLoading(false);
        return;
      }
    } catch (emailCheckError) {
      // If we can't check (e.g., table doesn't exist yet), continue with signup
      console.log('Could not check for existing email, continuing with signup');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/signup` : '/signup',
          }
        });

      if (error) {
        throw error;
      }

      // Marketing opt-ins are collected on the profile step (step 2), which every
      // signup path reaches - social sign-in skips this step entirely.

      // Push contractor signup event to GTM Data Layer (account created)
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'contractor_signup_complete',
          email: formData.email,
          signup_method: 'email',
          value: 1.0,
          currency: 'USD'
        });
      }

      if (data.user && !data.session) {
        // Email confirmation required
        onShowEmailVerification();
      } else if (data.session) {
        // Email confirmation disabled, proceed to step 2
        onNextStep();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Contractor Account</h2>
          <p className="text-gray-600">Join our network of qualified contractors</p>
      </div>

      <form onSubmit={handleEmailSignup} className="space-y-6">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="h-4 w-4 inline mr-1" />
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className={authFieldClassName}
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className={`${authFieldClassName} pr-10`}
              placeholder="Enter password (min 6 characters)"
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
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className={`${authFieldClassName} pr-10`}
              placeholder="Confirm your password"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading && (
            <RefreshCw className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
          )}
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
