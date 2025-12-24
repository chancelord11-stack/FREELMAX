import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { User, Lock, Bell, CreditCard, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { profileService } from '../services/profileService';

interface SettingsProps {
  profile: Profile;
  onUpdate: (profile: Profile) => void; 
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(false);

  // Initialiser le formulaire avec les données du profil
  useEffect(() => {
    if(profile) {
        setFormData({
            first_name: profile.first_name,
            last_name: profile.last_name,
            headline: profile.headline,
            bio: profile.bio,
            phone: profile.phone,
            city: profile.city
        });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const updated = await profileService.updateProfile(profile.id, formData);
        if (updated) {
            toast.success("Profil mis à jour !");
            onUpdate(updated);
        } else {
            toast.error("Erreur lors de la mise à jour");
        }
    } catch (err) {
        toast.error("Erreur technique");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Paramètres du compte</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Menu Tab */}
        <div className="card p-2 md:col-span-1 h-fit">
            <button onClick={()=>setActiveTab('general')} className={`w-full text-left p-3 rounded-lg flex items-center gap-2 ${activeTab==='general' ? 'bg-primary-50 text-primary-600' : 'hover:bg-neutral-50'}`}>
                <User className="w-4 h-4"/> Général
            </button>
            <button onClick={()=>setActiveTab('security')} className={`w-full text-left p-3 rounded-lg flex items-center gap-2 ${activeTab==='security' ? 'bg-primary-50 text-primary-600' : 'hover:bg-neutral-50'}`}>
                <Lock className="w-4 h-4"/> Sécurité
            </button>
        </div>

        {/* Contenu */}
        <div className="md:col-span-3 card p-6">
            {activeTab === 'general' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Prénom</label>
                            <input name="first_name" value={formData.first_name || ''} onChange={handleChange} className="input w-full" />
                        </div>
                        <div>
                            <label className="label">Nom</label>
                            <input name="last_name" value={formData.last_name || ''} onChange={handleChange} className="input w-full" />
                        </div>
                    </div>
                    <div>
                        <label className="label">Titre / Headline</label>
                        <input name="headline" value={formData.headline || ''} onChange={handleChange} className="input w-full" placeholder="Ex: Développeur Fullstack..." />
                    </div>
                    <div>
                        <label className="label">Bio</label>
                        <textarea name="bio" value={formData.bio || ''} onChange={handleChange} className="input w-full h-24" />
                    </div>
                    
                    <div className="pt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary w-full md:w-auto flex items-center justify-center gap-2">
                            {loading ? 'Enregistrement...' : <><Save className="w-4 h-4" /> Enregistrer</>}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === 'security' && (
                <div className="text-center py-10 text-neutral-500">
                    La modification de mot de passe est gérée par votre fournisseur de connexion.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Settings;