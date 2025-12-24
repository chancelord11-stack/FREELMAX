import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Briefcase, FolderOpen, ShoppingBag, MessageSquare,
  User, Settings, Wallet, ChevronLeft, ChevronRight,
  Star, Shield, TrendingUp
} from 'lucide-react';
import { Profile } from '../types';
import { getInitials } from '../utils/format';
import { APP_NAME } from '../utils/constants';

interface SidebarProps {
  isOpen: boolean;
  currentView: string;
  profile: Profile | null;
  onNavigate: (view: string) => void;
  onToggle: () => void;
}

const formatLevel = (level: string): string => {
  const levels: Record<string, string> = {
    'new': 'Nouveau', 'level1': 'Niveau 1', 'level2': 'Niveau 2', 'top_rated': 'Top Rated',
  };
  return levels[level] || level;
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen, currentView, profile, onNavigate, onToggle,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'projects', label: 'Projets', icon: FolderOpen },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'wallet', label: 'Portefeuille', icon: Wallet },
  ];

  const bottomItems = [
    { id: 'profile', label: 'Mon Profil', icon: User },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  // Largeur de la sidebar selon l'état et l'écran
  const width = isOpen ? 'w-64' : 'w-20 hidden lg:flex'; 

  return (
    <aside className={`${width} h-full bg-gradient-to-b from-primary-900 to-primary-950 text-white flex flex-col shadow-xl transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-xl font-bold text-primary-900">F</span>
            </div>
            {isOpen && <span className="text-xl font-bold">{APP_NAME}</span>}
          </div>
          {/* Bouton fermeture sur mobile uniquement si besoin, mais géré par l'overlay dans App.tsx */}
        </div>

        {/* Profile Summary */}
        {profile && isOpen && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-emerald-400 rounded-xl flex items-center justify-center text-primary-900 font-bold flex-shrink-0 overflow-hidden">
                {profile.avatar_url ? (
                   <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : getInitials(profile.first_name, profile.last_name)}
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold truncate">{profile.first_name}</div>
                <div className="text-xs text-primary-300">{profile.role}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-white/20 text-white shadow-lg' : 'text-primary-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-3 border-t border-white/10 space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-white/20 text-white' : 'text-primary-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>
    </aside>
  );
};

export default Sidebar;