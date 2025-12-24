import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, LogOut, ChevronDown, Search, Settings, Menu } from 'lucide-react';
import { Profile } from '../types';
import { getInitials } from '../utils/format';

interface HeaderProps {
  profile: Profile | null;
  onMenuClick: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
  // 👇 C'est cette ligne qui manquait et qui cause l'erreur
  onLogoClick?: () => void; 
}

const Header: React.FC<HeaderProps> = ({ 
  profile, 
  onMenuClick, 
  onProfileClick, 
  onSettingsClick, 
  onLogout, 
  onLogoClick // 👇 N'oubliez pas de le déstructurer ici aussi
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-neutral-100 sticky top-0 z-20 h-16 md:h-20">
      <div className="px-4 md:px-6 h-full flex items-center justify-between gap-4">
        
        {/* Menu Hamburger et Logo */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-neutral-100 rounded-xl">
            <Menu className="w-6 h-6 text-neutral-600" />
          </button>
          
          {/* Logo Mobile qui utilise la nouvelle prop */}
          <div onClick={onLogoClick} className="lg:hidden font-bold text-xl text-primary-600 cursor-pointer">
            Freenance
          </div>
        </div>

        {/* Barre de recherche (cachée sur petit mobile) */}
        <div className="hidden md:flex flex-1 max-w-xl">
           <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input type="search" placeholder="Rechercher..." className="w-full pl-12 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl" />
           </div>
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
           <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 rounded-xl">
             <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  getInitials(profile?.first_name, profile?.last_name)
                )}
             </div>
             <ChevronDown className="w-4 h-4 text-neutral-500 hidden md:block" />
           </button>

           <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}}
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden"
              >
                <div className="p-3 border-b border-neutral-100">
                  <p className="font-semibold text-sm">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-xs text-neutral-500 truncate">{profile?.email}</p>
                </div>
                <button onClick={() => { onProfileClick(); setShowUserMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 flex items-center gap-2">
                  <User className="w-4 h-4" /> Mon Profil
                </button>
                <button onClick={() => { onSettingsClick(); setShowUserMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Paramètres
                </button>
                <div className="border-t border-neutral-100 mt-1">
                  <button onClick={() => { onLogout(); setShowUserMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </div>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;