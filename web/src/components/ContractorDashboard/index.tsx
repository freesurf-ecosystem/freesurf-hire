import React, { useEffect, useState } from 'react';
import { useNavigate } from '../../lib/navigation-compat';
import { supabase } from '../../lib/supabase';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import ProfileTab from './ProfileTab';
import ServicesTab from './ServicesTab';
import LeadsTab from './LeadsTab';
import NotificationsTab from './NotificationsTab';

type Tab = 'profile' | 'preferences' | 'leads' | 'contacts' | 'notifications';

export default function ContractorDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isPausing, setIsPausing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }

      const { data: profileRow, error: profileError } = await supabase
        .from('hire_contractor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileRow);

      if (profileRow) {
        const { data: requestRows } = await supabase
          .from('hire_contractor_requests')
          .select('*')
          .eq('contractor_id', profileRow.id)
          .order('created_at', { ascending: false });
        setRequests(requestRows || []);
      }
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handlePauseToggle = async () => {
    if (!profile || profile.admin_paused) return;
    setIsPausing(true);
    setError('');
    setSuccessMessage('');
    try {
      const next = !profile.is_active;
      const { data, error: updateError } = await supabase
        .from('hire_contractor_profiles')
        .update({ is_active: next })
        .eq('id', profile.id)
        .select()
        .single();
      if (updateError) throw updateError;
      setProfile(data);
      setSuccessMessage(next ? 'Profile activated' : 'Profile paused');
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setIsPausing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No contractor profile yet</h1>
          <p className="text-gray-600 mb-6">Create your profile to start getting found by clients.</p>
          <button
            onClick={() => navigate('/join-as-contractor')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create your profile
          </button>
        </div>
      </div>
    );
  }

  const sidebarProfile = {
    name: profile.display_name || profile.contact_name || profile.company || 'Contractor',
    company: profile.company || '',
    rating: profile.rating ?? 0,
    reviewCount: profile.review_count ?? 0,
    avatar: profile.avatar_url || '',
    is_active: profile.is_active,
    admin_paused: profile.admin_paused,
  };

  const contacts = Array.from(
    new Map(
      requests
        .filter((r) => r.client_email || r.client_phone)
        .map((r) => [r.client_email || r.client_phone, r])
    ).values()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        contractorName={sidebarProfile.name}
        onLogout={handleLogout}
        onNavigateHome={() => navigate('/')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <DashboardSidebar
            contractor={sidebarProfile as any}
            leadsCount={requests.length}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handlePauseToggle={handlePauseToggle}
            isPausing={isPausing}
            error={error}
            successMessage={successMessage}
          />

          <div className="lg:col-span-3">
            {activeTab === 'profile' && <ProfileTab profile={profile} onSaved={setProfile} />}
            {activeTab === 'preferences' && <ServicesTab profile={profile} />}
            {activeTab === 'leads' && <LeadsTab requests={requests} />}
            {activeTab === 'notifications' && <NotificationsTab profile={profile} />}
            {activeTab === 'contacts' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact History</h2>
                {contacts.length === 0 ? (
                  <p className="text-gray-600">No client contacts yet.</p>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((c) => (
                      <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-medium text-gray-900">{c.client_name || 'Client'}</p>
                        <p className="text-sm text-gray-600">{c.client_email || ''} {c.client_phone ? `Â· ${c.client_phone}` : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
