import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, User, LogOut, ChevronDown, Search, Settings, 
  Menu, X, HelpCircle, Shield, CreditCard
} from 'lucide-react';
import { Profile } from '../types';
import { getInitials } from '../utils/format';

interface HeaderProps {
  profile: Profile | null;
  onMenuClick: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  profile, 
  onMenuClick, 
  onProfileClick, 
  onSettingsClick, 
  onLogout 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'Nouvelle commande reçue', message: 'Kokou Mensah a commandé votre service', time: 'Il y a 5 min', unread: true },
    { id: 2, title: 'Paiement reçu', message: 'Vous avez reçu 150 000 FCFA', time: 'Il y a 1h', unread: true },
    { id: 3, title: 'Message de Aïcha', message: 'Bonjour, j\'ai une question...', time: 'Il y a 2h', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-neutral-100 sticky top-0 z-20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-xl"
          >
            <Menu className="w-6 h-6 text-neutral-600" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des services, freelances, projets..."
                className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Help */}
            <button className="p-2.5 text-neutral-500 hover:bg-neutral-100 rounded-xl transition-colors hidden sm:flex">
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifMenuRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-neutral-500 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden"
                  >
                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                      <h3 className="font-bold text-neutral-900">Notifications</h3>
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Tout marquer lu
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className={`p-4 hover:bg-neutral-50 cursor-pointer border-b border-neutral-50 last:border-0 ${notif.unread ? 'bg-primary-50/50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-primary-500' : 'bg-transparent'}`} />
                            <div className="flex-1">
                              <p className="font-medium text-neutral-900 text-sm">{notif.title}</p>
                              <p className="text-sm text-neutral-500 mt-0.5">{notif.message}</p>
                              <p className="text-xs text-neutral-400 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-neutral-100">
                      <button className="w-full py-2 text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Voir toutes les notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(profile?.first_name, profile?.last_name)
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-neutral-900 text-sm">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs text-neutral-500 capitalize">{profile?.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="p-4 bg-gradient-to-br from-primary-50 to-emerald-50 border-b border-neutral-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(profile?.first_name, profile?.last_name)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">
                            {profile?.first_name} {profile?.last_name}
                          </p>
                          <p className="text-sm text-neutral-500">{profile?.email}</p>
                        </div>
                      </div>
                      {profile?.is_verified && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-primary-700 bg-primary-100 px-2 py-1 rounded-full w-fit">
                          <Shield className="w-3 h-3" />
                          Compte vérifié
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={() => { onProfileClick(); setShowUserMenu(false); }}
                        className="w-full px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 rounded-xl flex items-center gap-3 transition-colors"
                      >
                        <User className="w-5 h-5 text-neutral-400" />
                        <span className="font-medium">Mon Profil</span>
                      </button>
                      <button
                        onClick={() => { onSettingsClick(); setShowUserMenu(false); }}
                        className="w-full px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 rounded-xl flex items-center gap-3 transition-colors"
                      >
                        <Settings className="w-5 h-5 text-neutral-400" />
                        <span className="font-medium">Paramètres</span>
                      </button>
                      <button
                        className="w-full px-4 py-3 text-left text-neutral-700 hover:bg-neutral-50 rounded-xl flex items-center gap-3 transition-colors"
                      >
                        <CreditCard className="w-5 h-5 text-neutral-400" />
                        <span className="font-medium">Facturation</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-neutral-100">
                      <button
                        onClick={() => { onLogout(); setShowUserMenu(false); }}
                        className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Déconnexion</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
