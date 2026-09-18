import { useState, useEffect } from 'react';
import { useNavigate } from '../../lib/navigation-compat';
import { Plus, User, ChevronDown, LogOut, X, Home, LayoutGrid } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Contractor } from '../../types';
import { ECOSYSTEM_TOOLS, ECOSYSTEM_GITHUB } from '../../config/ecosystem';

interface HeaderProps {
  currentView: 'landing' | 'browse' | 'investor-signup' | 'investor-dashboard' | 'investor-login';
  isOverlay?: boolean;
}

export default function Header({ currentView, isOverlay = false }: HeaderProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setIsAuthenticated(true);
          await loadContractorProfile(session.user.id);
        } else {
          setIsAuthenticated(false);
          setContractor(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        checkAuthStatus();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setContractor(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadContractorProfile = async (userId: string) => {
    try {
      // NOTE: match on user_id (the auth user), not id (the profile's own uuid).
      const { data, error } = await supabase
        .from('hire_contractor_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading contractor profile:', error);
        return;
      }

      if (!data) {
        setContractor(null);
        return;
      }

      setContractor({
        id: data.id,
        user_id: data.user_id,
        name: data.display_name || data.contact_name || data.company || 'Contractor',
        company: data.company,
        website: data.website,
        bio: data.bio,
        base_zip_code: data.base_zip_code,
        specialties: [],
        investment_types: data.engagement_types || [],
        location_preferences: { states: data.service_states || [], regions: [] },
        preferred_contact_method: data.preferred_contact_method || 'form',
        is_active: data.is_active,
        admin_paused: data.admin_paused,
        created_at: data.created_at,
        updated_at: data.updated_at,
        googleBusinessUrl: data.google_business_url,
        yearsExperience: data.years_experience ?? undefined,
        avatar: data.avatar_url,
        rating: parseFloat(data.rating) || 0,
        reviewCount: data.review_count || 0,
        isActive: data.is_active,
      });
    } catch (error) {
      console.error('Error loading contractor profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setContractor(null);
      setShowDropdown(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className={isOverlay ? "bg-transparent" : "bg-white shadow-sm border-b border-gray-200"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <a
            href="/"
            className="flex items-center space-x-2"
          >
            {isOverlay ? (
              <>
                <img
                  src="/logo-white.svg"
                  alt="FreeSurf logo"
                  className="h-12 w-auto object-contain"
                />
                <span className="text-xl font-bold text-white">FreeSurf</span>
              </>
            ) : (
              <>
                <img
                  src="/logo-black.svg"
                  alt="FreeSurf logo"
                  className="h-12 w-auto object-contain"
                />
                <span className="text-xl font-bold text-gray-900">FreeSurf</span>
              </>
            )}
          </a>
          
          {/* Mobile Menu Dropdown */}
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)}
              ></div>
              
              {/* Menu */}
              <div className="absolute right-0 top-20 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden md:hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="py-2">
              {isAuthenticated && contractor ? (
                <>
                    <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
                    <div className="flex items-center space-x-3">
                      <img
                        src={contractor.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={contractor.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{contractor.name}</p>
                        <p className="text-xs text-blue-600">{contractor.company}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/investor-dashboard');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                  >
                    <Home className="h-4 w-4 mr-3" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/join-as-contractor');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-3" />
                    Join as a Contractor
                  </button>
                  <button
                    onClick={() => {
                      navigate('/investor-login');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Login
                  </button>
                </>
              )}
                  <div className="border-t border-gray-200 py-2">
                    <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      FreeSurf tools
                    </p>
                    {ECOSYSTEM_TOOLS.map((tool) =>
                      tool.href ? (
                        <a
                          key={tool.name}
                          href={tool.href}
                          title={tool.description}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          {tool.name}
                        </a>
                      ) : (
                        <span
                          key={tool.name}
                          title={tool.description}
                          className="block px-4 py-3 text-sm text-gray-400"
                        >
                          {tool.name}
                        </span>
                      )
                    )}
                    <a
                      href={ECOSYSTEM_GITHUB}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <button
                onClick={() => setShowAppMenu(!showAppMenu)}
                aria-label="FreeSurf tools"
                title="FreeSurf tools"
                className={`p-2 rounded-md transition-colors ${
                  isOverlay
                    ? 'text-white hover:bg-white hover:bg-opacity-10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>

              {showAppMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAppMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      FreeSurf tools
                    </p>
                    {ECOSYSTEM_TOOLS.map((tool) =>
                      tool.href ? (
                        <a
                          key={tool.name}
                          href={tool.href}
                          title={tool.description}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                          {tool.name}
                        </a>
                      ) : (
                        <span
                          key={tool.name}
                          title={tool.description}
                          className="block px-4 py-2 text-sm text-gray-400"
                        >
                          {tool.name}
                        </span>
                      )
                    )}
                    <a
                      href={ECOSYSTEM_GITHUB}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      GitHub
                    </a>
                  </div>
                </>
              )}
            </div>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated && contractor ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={contractor.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={contractor.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                  <span className="text-sm font-medium text-gray-700">{contractor.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 hidden md:block">
                    <button
                      onClick={() => {
                        navigate('/investor-dashboard');
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/investor-login')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isOverlay ? 'text-white hover:text-gray-200' :
                    currentView === 'investor-login'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </button>
                
                <button
                 onClick={() => navigate('/join-as-contractor')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isOverlay ? 'text-white hover:text-gray-200' :
                    currentView === 'investor-signup'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Join as a Contractor</span>
                </button>
              </>
            )}
          </nav>

          <div className="md:hidden">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className={`p-2 rounded-md transition-colors ${
                isOverlay 
                  ? 'text-white hover:text-gray-200 hover:bg-white hover:bg-opacity-10' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
