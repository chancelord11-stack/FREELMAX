import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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



function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        navigate('/');
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
        navigate('/dashboard');
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
    navigate('/auth');
  };

  const handleRegister = () => {
    setAuthMode('register');
    navigate('/auth');
  };

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
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

  // L'application utilise désormais react-router-dom pour le routage
  // Nous devons définir les routes.

  // Layout pour les pages connectées
  const AuthenticatedLayout = () => (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        currentPath={location.pathname}
        profile={profile}
        onNavigate={handleNavigate}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <Header 
          profile={profile}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onProfileClick={() => handleNavigate('/profile')}
          onSettingsClick={() => handleNavigate('/settings')}
          onLogout={handleLogout}
        />

        {/* Content */}
        <main className="p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard profile={profile} />} />
            <Route path="/services" element={<Services onViewService={(id) => handleNavigate(`/services/${id}`)} />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/projects" element={<Projects onViewProject={(id) => handleNavigate(`/projects/${id}`)} />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/orders" element={<Orders userId={profile?.id} onViewOrder={(id) => handleNavigate(`/orders/${id}`)} />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/messages" element={<Messages userId={profile?.id} />} />
            <Route path="/profile" element={<ProfileView userId={profile?.id} onEdit={() => handleNavigate('/profile/edit')} />} />
            <Route path="/profile/edit" element={<ProfileEdit profile={profile} onUpdate={handleProfileUpdate} onClose={() => handleNavigate('/profile')} />} />
            <Route path="/settings" element={<Settings profile={profile} onUpdate={handleProfileUpdate} />} />
            <Route path="/wallet" element={<Wallet userId={profile?.id} />} />
            {/* Redirection par défaut si connecté mais sur une route non définie */}
            <Route path="*" element={<Dashboard profile={profile} />} />
          </Routes>
        </main>
      </div>
    </div>
  );

  // Rendu principal de l'application
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={!user ? <Landing onLogin={handleLogin} onRegister={handleRegister} onExplore={() => handleNavigate('/services')} /> : <AuthenticatedLayout />} />
        <Route path="/auth" element={<Auth initialMode={authMode} onSuccess={handleAuthSuccess} onClose={() => handleNavigate('/')} />} />
        
        {/* Route Services publique (si l'utilisateur n'est pas connecté) */}
        <Route path="/services" element={!user ? (
          <div className="min-h-screen bg-neutral-50">
            {/* Header public */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                  <button 
                    onClick={() => handleNavigate('/')}
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
                onViewService={() => {
                  handleLogin(); // Demander connexion pour voir les détails
                }}
              />
            </div>
          </div>
        ) : <AuthenticatedLayout />} />

        {/* Toutes les autres routes nécessitent une connexion et utilisent le layout authentifié */}
        {user && <Route path="/*" element={<AuthenticatedLayout />} />}
        
        {/* Redirection par défaut si non connecté et sur une route protégée */}
        {!user && <Route path="/*" element={<Landing onLogin={handleLogin} onRegister={handleRegister} onExplore={() => handleNavigate('/services')} />} />}
      </Routes>
    </>
  );
}

export default App;