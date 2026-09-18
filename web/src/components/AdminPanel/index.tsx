import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from '../../lib/navigation-compat';
import {
  Home, Lock, Mail, Shield, RefreshCw, AlertCircle, CheckCircle, Key, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from '../../lib/supabaseEnv';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';
import DashboardTab from './DashboardTab';
import AdminConfirmationDialog from './AdminConfirmationDialog';

interface AdminStats {
  totalContractors: number;
  activeContractors: number;
  totalLeads: number;
  totalPaidLeads: number;
  totalRevenue: number;
  recentActivity: any[];
}

interface ImportStats {
  // DEPRECATED: This interface is no longer used
  // Data import functionality has been removed from admin panel
  // Use separate project for managing cities, counties, and ZIP codes
}

interface AdminSession {
  isAuthenticated: boolean;
  loginTime: number;
  lastActivity: number;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  
  // Authentication state
  const [authStep, setAuthStep] = useState<'password' | 'verification' | 'authenticated'>('password');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [canResendCode, setCanResendCode] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  
  // Session management
  const sessionTimeoutRef = useRef<number | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const adminSurfaceQuarantined = true;
  
  // App state
  const [activeTab, setActiveTab] = useState<'dashboard'>('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    totalContractors: 0,
    activeContractors: 0,
    totalLeads: 0,
    totalPaidLeads: 0,
    totalRevenue: 0,
    recentActivity: []
  });
  const [contractors, setContractors] = useState<any[]>([]);
  const [pausingContractors, setPausingContractors] = useState<Set<string>>(new Set());
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [error, setError] = useState('');
  const [lastDataLoad, setLastDataLoad] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    type: 'pause' | 'unpause';
    data: any;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Constants
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // On mount: check existing session + setup listeners
  useEffect(() => {
    checkExistingSession();
    
    const handleActivity = () => {
      setLastActivity(Date.now());
      resetSessionTimeout();
    };
    
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    
    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    };
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && authStep === 'verification') {
      setCanResendCode(true);
    }
  }, [resendCountdown, authStep]);

  // Lockout countdown
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => setLockoutTime(lockoutTime - 1), 1000);
      return () => clearTimeout(timer);
    } else if (lockoutTime === 0 && isLocked) {
      setIsLocked(false);
      setLoginAttempts(0);
    }
  }, [lockoutTime, isLocked]);

  const checkExistingSession = () => {
    try {
      const sessionData = localStorage.getItem('admin_session');
      if (sessionData) {
        const session: AdminSession = JSON.parse(sessionData);
        const now = Date.now();
        if (session.isAuthenticated && (now - session.lastActivity) < SESSION_TIMEOUT) {
          setAuthStep('authenticated');
          setLastActivity(session.lastActivity);
          resetSessionTimeout();
          return;
        } else {
          localStorage.removeItem('admin_session');
        }
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
      localStorage.removeItem('admin_session');
    }
  };

  const resetSessionTimeout = () => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    sessionTimeoutRef.current = window.setTimeout(() => {
      handleLogout();
      alert('Session expired due to inactivity. Please log in again.');
    }, SESSION_TIMEOUT);
  };

  const updateSession = () => {
    const session: AdminSession = {
      isAuthenticated: true,
      loginTime: Date.now(),
      lastActivity: Date.now()
    };
    localStorage.setItem('admin_session', JSON.stringify(session));
  };

  // 2FA: send code
  const sendVerificationCode = async () => {
    setIsSendingCode(true);
    setAuthError('');
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeData = { code, timestamp: Date.now(), expires: Date.now() + (10 * 60 * 1000) };
      localStorage.setItem('admin_verification_code', JSON.stringify(codeData));

      const supabaseUrl = SUPABASE_URL;
      const supabaseAnonKey = SUPABASE_PUBLIC_KEY;
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-admin-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email: adminEmail, code }),
      });
      
      const responseData = await response.json();
      console.log('[ADMIN] Verification email response:', { status: response.status, data: responseData });
      
      if (!response.ok) throw new Error(responseData.error || 'Failed to send verification email');

      setAuthStep('verification');
      setResendCountdown(60);
      setCanResendCode(false);
    } catch (error: any) {
      setAuthError(`Failed to send verification code: ${error.message}`);
    } finally {
      setIsSendingCode(false);
    }
  };

  // Password submit - verify with server
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSendingCode(true);
    
    // Check if account is locked
    if (isLocked) {
      setAuthError(`Too many failed attempts. Try again in ${Math.ceil(lockoutTime / 60)} minutes.`);
      setIsSendingCode(false);
      return;
    }
    
    try {
      // Verify password on server-side API
      const response = await fetch('/api/verify-admin-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (response.ok && result.verified) {
        // Password correct, send verification code
        setLoginAttempts(0);
        await sendVerificationCode();
      } else {
        // Password incorrect
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setIsLocked(true);
          setLockoutTime(LOCKOUT_DURATION / 1000);
          setAuthError(`Too many failed attempts. Account locked for 15 minutes.`);
        } else {
          setAuthError(`Invalid password. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    } catch (error: any) {
      console.error('Password verification error:', error);
      setAuthError('Error verifying password. Please try again.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Verification code submit
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError('');
    try {
      const storedCodeData = localStorage.getItem('admin_verification_code');
      if (!storedCodeData) throw new Error('Verification code expired. Please request a new one.');
      const { code: storedCode, expires } = JSON.parse(storedCodeData);
      if (Date.now() > expires) {
        localStorage.removeItem('admin_verification_code');
        throw new Error('Verification code expired. Please request a new one.');
      }
      if (verificationCode === storedCode) {
        setAuthStep('authenticated');
        updateSession();
        resetSessionTimeout();
      } else {
        throw new Error('Invalid verification code. Please try again.');
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResendCode) return;
    await sendVerificationCode();
  };

  const handleLogout = () => {
    setAuthStep('password');
    setPassword('');
    setVerificationCode('');
    setActiveTab('dashboard');
    setLoginAttempts(0);
    setIsLocked(false);
    setLockoutTime(0);
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_verification_code');
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
  };

  // ===== Data loaders =====
  const loadDashboardData = useCallback(async () => {
    console.log('[ADMIN] Starting dashboard data load');
    console.log('[ADMIN] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30));
    console.log('[ADMIN] Timestamp:', new Date().toISOString());
    
    setIsLoadingDashboard(true);
    setError('');
    
    try {
      console.log('[ADMIN] Admin surface is quarantined; skipping browser-side data queries');

      const totalContractors = 0;
      const activeContractors = 0;
      const totalLeads = 0;
      const totalPaidLeads = 0;
      const totalRevenue = 0;
      const recentActivity: any[] = [];

      console.log('[ADMIN] Dashboard stats calculated:', {
        totalContractors,
        activeContractors,
        totalLeads,
        totalPaidLeads,
        totalRevenue,
        recentActivityCount: recentActivity.length
      });

      setStats({
        totalContractors,
        activeContractors,
        totalLeads,
        totalPaidLeads,
        totalRevenue,
        recentActivity,
      });

      setLastDataLoad(new Date().toLocaleTimeString());
      console.log('[ADMIN] Dashboard data load complete');
      
    } catch (e: any) {
      console.error('[ADMIN] Dashboard load failed');
      console.error('[ADMIN] Error type:', e.constructor?.name || 'Unknown');
      console.error('[ADMIN] Error message:', e.message);
      console.error('[ADMIN] Error stack:', e.stack?.substring(0, 500));
      console.error('[ADMIN] Full error object:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
      setError(`Failed to load dashboard data: ${e.message || e}`);
    } finally {
      setIsLoadingDashboard(false);
    }
  }, []);

  // ===== Handlers used by tabs =====
  
  // DEPRECATED: importZipCodesFromExcel and handleFileUpload functions removed
  // Data import functionality has been moved to separate project
  // Cities, counties, and ZIP codes should be managed independently

  // Load dashboard when authenticated
  useEffect(() => {
    if (authStep === 'authenticated') {
      resetSessionTimeout();
      loadDashboardData();
    }
  }, [authStep, loadDashboardData]);

  // Memoized tab click handler to prevent unnecessary data loading
  const handleTabClick = useCallback((tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setLastActivity(Date.now());
  }, []);
    
  // Add a single useEffect to handle all data fetching based on the active tab
  useEffect(() => {
    if (authStep !== 'authenticated') return;

    console.log('[ADMIN] Tab changed to:', activeTab);

    if (activeTab === 'dashboard') {
      loadDashboardData();
    }
  }, [authStep, activeTab, loadDashboardData]);

  // Toggle contractor active status
  const toggleContractorStatus = useCallback(async (contractorId: string, currentStatus: boolean) => {
    if (isProcessing) return;
    setShowConfirmDialog({
      type: currentStatus ? 'pause' : 'unpause',
      data: { contractorId, currentStatus }
    });
  }, [isProcessing]);

  const confirmToggleContractorStatus = async () => {
    if (!showConfirmDialog) return;
    
    const { contractorId, currentStatus } = showConfirmDialog.data;
    setIsProcessing(contractorId);
    setError('');
    
    try {
      const shouldPause = currentStatus;
      const { error } = await supabase
        .from('hire_contractor_profiles')
        .update({
          is_active: !shouldPause,  // pausing -> false
          admin_paused: shouldPause, // pausing -> true
          updated_at: new Date().toISOString()
        })
        .eq('id', contractorId);

      if (error) throw error;

      setSuccessMessage(`Contractor ${shouldPause ? 'paused' : 'unpaused'} successfully. Profile ${shouldPause ? 'hidden from' : 'visible in'} searches.`);
      await loadDashboardData();
      setShowConfirmDialog(null);
    } catch (error: any) {
      setError(`Failed to update contractor status: ${error.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  // Memoized refresh callback to pass to ContractorsTab
  const handleReviewsUpdate = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ===== Authentication screens =====
  if (authStep === 'password') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none p-0 mb-6 mx-auto"
            >
              <Home className="h-12 w-12 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">FreeSurf</h1>
            </button>
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
            <p className="text-gray-600">Enter admin password to continue</p>
            {isLocked && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm font-medium">
                  Account locked for {Math.ceil(lockoutTime / 60)} minutes
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="h-4 w-4 inline mr-1" />
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLocked}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginAttempts > 0 && !isLocked && (
                <p className="text-orange-600 text-xs mt-1">
                  {MAX_LOGIN_ATTEMPTS - loginAttempts} attempts remaining.
                </p>
              )}
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{authError}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLocked || isSendingCode}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSendingCode ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
                  Sending verification code...
                </>
              ) : (
                'Continue to 2FA'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Security Features</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>- Two-factor authentication via email</li>
                <li>- Session timeout after 30 minutes</li>
                <li>- Account lockout after 5 failed attempts</li>
                <li>- Activity monitoring and logging</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authStep === 'verification') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verification</h2>
            <p className="text-gray-600">
              We've sent a 6-digit code to your admin email address
            </p>
          </div>

          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Key className="h-4 w-4 inline mr-1" />
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000000"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{authError}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || verificationCode.length !== 6}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
                  Verifying...
                </>
              ) : (
                'Verify & Access Admin'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResendCode}
              disabled={!canResendCode}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canResendCode ? 'Resend verification code' : `Resend in ${resendCountdown}s`}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setAuthStep('password');
                setVerificationCode('');
                setAuthError('');
              }}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {'< Back to password'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-green-800 text-sm font-medium">Code expires in 10 minutes</p>
                  <p className="text-green-700 text-xs">Check your spam folder if you don't see the email</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== Main Admin UI (authenticated) =====
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        onNavigateHome={() => navigate('/')}
        onLogout={handleLogout}
        sessionActive={Date.now() - lastActivity < SESSION_TIMEOUT}
        isAdminPanel={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <AdminTabs activeTab={activeTab} onTabClick={handleTabClick} />

          {/* Tab Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Data Loading Error</p>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                    <button
                      onClick={() => {
                        setError('');
                        if (activeTab === 'dashboard') loadDashboardData();
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-green-800">{successMessage}</p>
                </div>
              </div>
            )}
            
            {activeTab === 'dashboard' && <DashboardTab stats={stats} isLoading={isLoadingDashboard} adminSurfaceQuarantined={adminSurfaceQuarantined} />}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <AdminConfirmationDialog
          showConfirmDialog={showConfirmDialog}
          setShowConfirmDialog={setShowConfirmDialog}
          confirmAction={confirmToggleContractorStatus}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
