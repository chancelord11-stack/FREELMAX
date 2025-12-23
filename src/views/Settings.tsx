import React, { useState } from 'react';
import { Profile } from '../types';
import { User, Lock, Bell, CreditCard, Shield, Mail } from 'lucide-react';

interface SettingsProps {
  profile: Profile | null;
  onUpdate: (userId: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'payment'>('general');

  if (!profile) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">Paramètres</h1>
        <p className="text-neutral-600">Gérez vos préférences et votre compte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="card p-4">
          <nav className="space-y-1">
            {[
              { key: 'general', label: 'Général', icon: User },
              { key: 'security', label: 'Sécurité', icon: Lock },
              { key: 'notifications', label: 'Notifications', icon: Bell },
              { key: 'payment', label: 'Paiement', icon: CreditCard },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.key
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'general' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Informations générales</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prénom</label>
                    <input type="text" className="input" defaultValue={profile.first_name || ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom</label>
                    <input type="text" className="input" defaultValue={profile.last_name || ''} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Titre professionnel</label>
                  <input type="text" className="input" defaultValue={profile.headline || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea className="input h-32" defaultValue={profile.bio || ''} />
                </div>
                <button type="submit" className="btn btn-primary">
                  Enregistrer les modifications
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Sécurité</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
                  <input type="password" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                  <input type="password" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                  <input type="password" className="input" />
                </div>
                <button type="submit" className="btn btn-primary">
                  Changer le mot de passe
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Préférences de notification</h2>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Notifications par email' },
                  { key: 'push', label: 'Notifications push' },
                  { key: 'new_messages', label: 'Nouveaux messages' },
                  { key: 'new_projects', label: 'Nouveaux projets' },
                  { key: 'order_updates', label: 'Mises à jour de commandes' },
                ].map(notif => (
                  <label key={notif.key} className="flex items-center justify-between p-4 border-2 border-neutral-100 rounded-xl hover:border-primary-200 cursor-pointer">
                    <span className="font-medium">{notif.label}</span>
                    <input
                      type="checkbox"
                      defaultChecked={profile.notification_preferences[notif.key as keyof typeof profile.notification_preferences]}
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Méthodes de paiement</h2>
              <div className="space-y-4">
                <button className="w-full p-4 border-2 border-dashed border-neutral-300 rounded-xl hover:border-primary-500 transition-colors">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-600">Ajouter une méthode de paiement</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
