import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './services/supabase';
import { Profile } from './types';
import { profileService } from './services/profileService';

// Views
import Landing from './views/Landing';
import Auth from './views/Auth';
import Dashboard from './views/Dashboard';
import Services from './views/Services';
import ServiceDetail from './views/ServiceDetail';
import Projects from './views/Projects';
import ProjectDetail from './views/ProjectDetail';
import Orders from './views/Orders';
import OrderDetail from './views/OrderDetail';
import Messages from './views/Messages';
import ProfileView from './views/Profile';
import ProfileEdit from './views/ProfileEdit';
import Settings from './views/Settings';
import Wallet from './views/Wallet';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

type View = 
  | 'landing' 
  | 'auth' 
  | 'dashboard' 
  | 'services' 
  | 'service-detail'
  | 'projects'
  | 'project-detail'
  | 'orders'
  | 'order-detail'
  | 'messages'
  | 'profile'
  | 'profile-edit'
  | 'settings'
  | 'wallet';

function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Pour la navigation avec détails
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setView('landing');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
        setView('dashboard');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const data = await profileService.getProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleLogin = () => {
    setAuthMode('login');
    setView('auth');
  };

  const handleRegister = () => {
    setAuthMode('register');
    setView('auth');
  };

  const handleAuthSuccess = () => {
    setView('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setView('landing');
  };

  const handleNavigate = (newView: View, id?: string) => {
    if (id) {
      switch (newView) {
        case 'service-detail':
          setSelectedServiceId(id);
          break;
        case 'project-detail':
          setSelectedProjectId(id);
          break;
        case 'order-detail':
          setSelectedOrderId(id);
          break;
      }
    }
    setView(newView);
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30 animate-pulse">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          <p className="text-neutral-600 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  // Landing page (non connecté)
  if (view === 'landing' && !user) {
    return (
      <>
        <Toaster position="top-right" />
        <Landing 
          onLogin={handleLogin}
          onRegister={handleRegister}
          onExplore={() => handleNavigate('services')}
        />
      </>
    );
  }

  // Auth page
  if (view === 'auth') {
    return (
      <>
        <Toaster position="top-right" />
        <Auth 
          initialMode={authMode}
          onSuccess={handleAuthSuccess}
          onClose={() => setView('landing')}
        />
      </>
    );
  }

  // Services publics (peut être vu sans connexion)
  if (view === 'services' && !user) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-neutral-50">
          {/* Header public */}
          <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <button 
                  onClick={() => setView('landing')}
                  className="flex items-center gap-3"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <span className="text-xl font-bold text-white">F</span>
                  </div>
                  <span className="text-2xl font-bold text-neutral-900">Freenance</span>
                </button>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleLogin}
                    className="px-5 py-2.5 text-neutral-700 font-semibold hover:text-primary-600 transition-colors"
                  >
                    Connexion
                  </button>
                  <button 
                    onClick={handleRegister}
                    className="btn-gradient"
                  >
                    Commencer
                  </button>
                </div>
              </div>
            </div>
          </nav>
          
          <div className="pt-24">
            <Services 
              onViewService={(id) => {
                handleLogin(); // Demander connexion pour voir les détails
              }}
            />
          </div>
        </div>
      </>
    );
  }

  // App connectée
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-neutral-50 flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          currentView={view}
          profile={profile}
          onNavigate={(newView) => handleNavigate(newView as View)}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          {/* Header */}
          <Header 
            profile={profile}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            onProfileClick={() => handleNavigate('profile')}
            onSettingsClick={() => handleNavigate('settings')}
            onLogout={handleLogout}
          />

          {/* Content */}
          <main className="p-6">
            {view === 'dashboard' && (
              <Dashboard profile={profile} />
            )}

            {/* ✅ CORRECTION: Utilisation de onViewService au lieu de onServiceClick */}
            {view === 'services' && (
              <Services 
                onViewService={(id) => handleNavigate('service-detail', id)}
              />
            )}

            {view === 'service-detail' && selectedServiceId && (
              <ServiceDetail 
                serviceId={selectedServiceId}
                onBack={() => handleNavigate('services')}
              />
            )}

            {/* ✅ CORRECTION: onViewProject et suppression de props inutiles */}
            {view === 'projects' && (
              <Projects 
                onViewProject={(id) => handleNavigate('project-detail', id)}
              />
            )}

            {view === 'project-detail' && selectedProjectId && (
              <ProjectDetail 
                projectId={selectedProjectId}
                onBack={() => handleNavigate('projects')}
              />
            )}

            {/* ✅ CORRECTION: onViewOrder et userId */}
            {view === 'orders' && profile && (
              <Orders 
                userId={profile.id}
                onViewOrder={(id) => handleNavigate('order-detail', id)}
              />
            )}

            {view === 'order-detail' && selectedOrderId && (
              <OrderDetail 
                orderId={selectedOrderId}
                onBack={() => handleNavigate('orders')}
              />
            )}

            {view === 'messages' && profile && (
              <Messages userId={profile.id} />
            )}

            {/* ✅ CORRECTION: userId pour ProfileView et ajout onEdit */}
            {view === 'profile' && profile && (
              <ProfileView 
                userId={profile.id}
                onEdit={() => handleNavigate('profile-edit')}
              />
            )}

            {view === 'profile-edit' && profile && (
              <ProfileEdit 
                profile={profile}
                onUpdate={handleProfileUpdate}
                onClose={() => handleNavigate('profile')}
              />
            )}

            {/* ✅ CORRECTION: onUpdate reçoit un profil complet pour correspondre au handler */}
            {view === 'settings' && profile && (
              <Settings 
                profile={profile}
                onUpdate={handleProfileUpdate}
              />
            )}

            {view === 'wallet' && profile && (
              <Wallet userId={profile.id} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default App;