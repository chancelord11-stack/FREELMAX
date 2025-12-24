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
  | 'landing' | 'auth' | 'dashboard' | 'services' | 'service-detail'
  | 'projects' | 'project-detail' | 'orders' | 'order-detail'
  | 'messages' | 'profile' | 'profile-edit' | 'settings' | 'wallet';

function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Gestion de la sidebar : fermée par défaut sur mobile, ouverte sur desktop
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    
    // Gestion du redimensionnement
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setView('landing');
      }
    });
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
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

  const handleLogin = () => { setAuthMode('login'); setView('auth'); };
  const handleRegister = () => { setAuthMode('register'); setView('auth'); };
  const handleAuthSuccess = () => { setView('dashboard'); };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setView('landing');
  };

  const handleNavigate = (newView: View, id?: string) => {
    if (id) {
      if (newView === 'service-detail') setSelectedServiceId(id);
      if (newView === 'project-detail') setSelectedProjectId(id);
      if (newView === 'order-detail') setSelectedOrderId(id);
    }
    setView(newView);
    // Fermer le menu sur mobile après un clic
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    // Recharger pour être sûr
    if(user) loadProfile(user.id);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Chargement...</div>;

  // Mode non connecté (Landing)
  if (view === 'landing' && !user) return <Landing onLogin={handleLogin} onRegister={handleRegister} onExplore={() => handleNavigate('services')} />;
  if (view === 'auth') return <Auth initialMode={authMode} onSuccess={handleAuthSuccess} onClose={() => setView('landing')} />;

  // Application Connectée
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-neutral-50 flex overflow-hidden">
        
        {/* Sidebar avec gestion Mobile */}
        <div className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
        `}>
          <Sidebar 
            isOpen={sidebarOpen}
            currentView={view}
            profile={profile}
            onNavigate={(newView) => handleNavigate(newView as View)}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        {/* Overlay sombre pour mobile quand le menu est ouvert */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenu Principal */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
          <Header 
            profile={profile}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            onProfileClick={() => handleNavigate('profile')}
            onSettingsClick={() => handleNavigate('settings')}
            onLogout={handleLogout}
            onLogoClick={() => handleNavigate('dashboard')}
          />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-50 p-4 md:p-6 pb-20">
            {view === 'dashboard' && <Dashboard profile={profile} />}
            {view === 'services' && <Services onViewService={(id) => handleNavigate('service-detail', id)} />}
            {view === 'service-detail' && selectedServiceId && <ServiceDetail serviceId={selectedServiceId} onBack={() => handleNavigate('services')} />}
            {view === 'projects' && <Projects onViewProject={(id) => handleNavigate('project-detail', id)} />}
            {view === 'project-detail' && selectedProjectId && <ProjectDetail projectId={selectedProjectId} onBack={() => handleNavigate('projects')} />}
            {view === 'orders' && profile && <Orders userId={profile.id} onViewOrder={(id) => handleNavigate('order-detail', id)} />}
            {view === 'order-detail' && selectedOrderId && <OrderDetail orderId={selectedOrderId} onBack={() => handleNavigate('orders')} />}
            {view === 'messages' && profile && <Messages userId={profile.id} />}
            {view === 'profile' && profile && <ProfileView userId={profile.id} onEdit={() => handleNavigate('profile-edit')} />}
            {view === 'profile-edit' && profile && <ProfileEdit profile={profile} onUpdate={handleProfileUpdate} onClose={() => handleNavigate('profile')} />}
            {view === 'settings' && profile && <Settings profile={profile} onUpdate={handleProfileUpdate} />}
            {view === 'wallet' && profile && <Wallet userId={profile.id} />}
          </main>
        </div>
      </div>
    </>
  );
}

export default App;