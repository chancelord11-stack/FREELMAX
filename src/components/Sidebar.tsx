import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Briefcase, FolderOpen, ShoppingBag, MessageSquare,
  User, Settings, Wallet, LogOut, ChevronLeft, ChevronRight,
  Star, Shield, TrendingUp, Menu, X
} from 'lucide-react';
import { Profile } from '../types';
import { getInitials } from '../utils/format';
import { APP_NAME } from '../utils/constants';

interface SidebarProps {
  isOpen: boolean;
  currentPath: string;
  profile: Profile | null;
  onNavigate: (path: string) => void;
  onToggle: () => void;
}

const formatLevel = (level: string): string => {
  const levels: Record<string, string> = {
    'new': 'Nouveau',
    'level1': 'Niveau 1',
    'level2': 'Niveau 2',
    'top_rated': 'Top Rated',
  };
  return levels[level] || level;
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  currentPath,
  profile,
  onNavigate,
  onToggle,
}) => {
  const menuItems = [
    { id: '/dashboard', label: 'Tableau de bord', icon: Home },
    { id: '/services', label: 'Services', icon: Briefcase },
    { id: '/projects', label: 'Projets', icon: FolderOpen },
    { id: '/orders', label: 'Commandes', icon: ShoppingBag },
    { id: '/messages', label: 'Messages', icon: MessageSquare },
    { id: '/wallet', label: 'Portefeuille', icon: Wallet },
  ];

  const bottomItems = [
    { id: '/profile', label: 'Mon Profil', icon: User },
    { id: '/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 256 : 80 }}
        className={`
          fixed left-0 top-0 h-screen bg-gradient-to-b from-primary-900 to-primary-950 text-white z-40 flex flex-col shadow-xl
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-xl font-bold text-primary-900">F</span>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-bold"
                >
                  {APP_NAME}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Profile Summary */}
        {profile && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-emerald-400 rounded-xl flex items-center justify-center text-primary-900 font-bold flex-shrink-0 overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  getInitials(profile.first_name, profile.last_name)
                )}
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="overflow-hidden"
                  >
                    <div className="font-semibold truncate">
                      {profile.first_name} {profile.last_name}
                    </div>
                    <div className="text-xs text-primary-300 flex items-center gap-1">
                      {profile.is_verified && <Shield className="w-3 h-3" />}
                      <span className="capitalize">{profile.role}</span>
                      {profile.role === 'freelancer' && (
                        <span className="ml-1">• {formatLevel(profile.level)}</span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stats mini */}
            <AnimatePresence>
              {isOpen && profile.role === 'freelancer' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 grid grid-cols-2 gap-2"
                >
                  <div className="bg-white/10 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-bold">{profile.rating_avg?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="text-[10px] text-primary-300">Note</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-400">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-bold">{profile.completed_projects || 0}</span>
                    </div>
                    <div className="text-[10px] text-primary-300">Projets</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.id || currentPath.startsWith(item.id + '/');
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-primary-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-3 border-t border-white/10 space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-primary-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        {/* Toggle Button (desktop only) */}
        <button
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-primary-600 rounded-full items-center justify-center shadow-lg hover:bg-primary-500 transition-colors"
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </motion.aside>
    </>
  );
};

export default Sidebar;
