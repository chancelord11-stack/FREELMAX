import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Camera, Upload, X, Plus, Save, MapPin, Phone, Mail, Globe,
  Briefcase, Star, Award, Clock, Shield, Edit, Trash2, Link as LinkIcon,
  Image, FileText, ExternalLink, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { Profile } from '../types';
import { profileService } from '../services/profileService';
import { supabase } from '../services/supabase';
import { formatCurrency, getInitials } from '../utils/format';
import toast from 'react-hot-toast';

interface ProfileEditProps {
  profile: Profile;
  onUpdate: (profile: Profile) => void;
  onClose?: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ profile, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'professional' | 'portfolio' | 'verification'>('general');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    headline: profile.headline || '',
    bio: profile.bio || '',
    country: profile.country || 'Bénin',
    city: profile.city || '',
    address: profile.address || '',
    language: profile.language || 'fr',
    timezone: profile.timezone || 'Africa/Porto-Novo',
    // Freelancer specific
    hourly_rate: profile.hourly_rate?.toString() || '',
    skills: profile.skills || [],
    available: profile.available ?? true,
    // Client specific
    company_name: profile.company_name || '',
    company_size: profile.company_size || '',
    industry: profile.industry || '',
    tax_id: profile.tax_id || '',
  });

  const [portfolio, setPortfolio] = useState<any[]>(profile.portfolio || []);
  const [skillInput, setSkillInput] = useState('');
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    url: '',
    image: '',
  });
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      await profileService.updateProfile(profile.id, { avatar_url: publicUrl });
      
      onUpdate({ ...profile, avatar_url: publicUrl });
      toast.success('Photo de profil mise à jour !');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addPortfolioItem = () => {
    if (newPortfolioItem.title) {
      setPortfolio(prev => [...prev, { ...newPortfolioItem, id: Date.now() }]);
      setNewPortfolioItem({ title: '', description: '', url: '', image: '' });
      setShowPortfolioModal(false);
    }
  };

  const removePortfolioItem = (id: number) => {
    setPortfolio(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const updates: Partial<Profile> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        headline: formData.headline,
        bio: formData.bio,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        language: formData.language,
        timezone: formData.timezone,
        skills: formData.skills,
        portfolio: portfolio,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        available: formData.available,
        company_name: formData.company_name,
        company_size: formData.company_size,
        industry: formData.industry,
        tax_id: formData.tax_id,
      };

      const updatedProfile = await profileService.updateProfile(profile.id, updates);
      
      if (updatedProfile) {
        onUpdate(updatedProfile);
        toast.success('Profil mis à jour avec succès !');
      }
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Informations générales', icon: User },
    { id: 'professional', label: 'Professionnel', icon: Briefcase },
    ...(profile.role === 'freelancer' ? [{ id: 'portfolio', label: 'Portfolio', icon: Image }] : []),
    { id: 'verification', label: 'Vérification', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-emerald-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden border-4 border-white/30">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold">
                    {getInitials(profile.first_name, profile.last_name)}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Camera className="w-8 h-8" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {formData.first_name} {formData.last_name}
              </h1>
              {formData.headline && (
                <p className="text-xl text-white/80 mb-3">{formData.headline}</p>
              )}
              <div className="flex flex-wrap gap-3">
                {profile.is_verified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                    <Shield className="w-4 h-4" />
                    Vérifié
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm capitalize">
                  {profile.role}
                </span>
                {formData.city && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                    <MapPin className="w-4 h-4" />
                    {formData.city}, {formData.country}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              <div className="text-center bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold">{profile.rating_avg.toFixed(1)}</div>
                <div className="text-sm text-white/70 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  Note
                </div>
              </div>
              <div className="text-center bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold">{profile.completed_projects}</div>
                <div className="text-sm text-white/70">Projets</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="card-premium p-6">
                  <h2 className="text-xl font-bold mb-6">Informations personnelles</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="input-modern"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Nom</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="input-modern"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          disabled
                          className="input-modern pl-12 bg-neutral-100 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">L'email ne peut pas être modifié</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Téléphone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="input-modern pl-12"
                          placeholder="+229 97 00 00 00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-premium p-6">
                  <h2 className="text-xl font-bold mb-6">Localisation</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Pays</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="input-modern"
                      >
                        <option value="Bénin">Bénin</option>
                        <option value="Togo">Togo</option>
                        <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                        <option value="Sénégal">Sénégal</option>
                        <option value="Burkina Faso">Burkina Faso</option>
                        <option value="Niger">Niger</option>
                        <option value="Mali">Mali</option>
                        <option value="Cameroun">Cameroun</option>
                        <option value="France">France</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Ville</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="input-modern"
                        placeholder="Cotonou"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Adresse complète</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="input-modern"
                        placeholder="Quartier, rue..."
                      />
                    </div>
                  </div>
                </div>

                <div className="card-premium p-6">
                  <h2 className="text-xl font-bold mb-6">Préférences</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Langue</label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="input-modern"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Fuseau horaire</label>
                      <select
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                        className="input-modern"
                      >
                        <option value="Africa/Porto-Novo">Africa/Porto-Novo (GMT+1)</option>
                        <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                        <option value="Africa/Dakar">Africa/Dakar (GMT)</option>
                        <option value="Europe/Paris">Europe/Paris (GMT+1/+2)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Tab */}
            {activeTab === 'professional' && (
              <div className="space-y-6">
                <div className="card-premium p-6">
                  <h2 className="text-xl font-bold mb-6">Profil professionnel</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Titre professionnel</label>
                      <input
                        type="text"
                        name="headline"
                        value={formData.headline}
                        onChange={handleInputChange}
                        className="input-modern"
                        placeholder="Ex: Développeur Web Full Stack"
                      />
                      <p className="text-xs text-neutral-500 mt-1">Ce titre apparaît sur votre profil public</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="input-modern h-40 resize-none"
                        placeholder="Parlez de vous, de votre expérience et de ce qui vous rend unique..."
                      />
                      <p className="text-xs text-neutral-500 mt-1">{formData.bio.length}/500 caractères</p>
                    </div>

                    {profile.role === 'freelancer' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">Compétences</label>
                          <div className="flex gap-2 mb-3">
                            <input
                              type="text"
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                              className="input-modern flex-1"
                              placeholder="Ajouter une compétence"
                            />
                            <button
                              type="button"
                              onClick={addSkill}
                              className="px-6 py-3 bg-primary-100 text-primary-700 rounded-xl font-semibold hover:bg-primary-200 transition-colors"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-xl font-medium"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="hover:text-primary-900"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">Tarif horaire (FCFA)</label>
                            <input
                              type="number"
                              name="hourly_rate"
                              value={formData.hourly_rate}
                              onChange={handleInputChange}
                              className="input-modern"
                              placeholder="15000"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">Disponibilité</label>
                            <label className="flex items-center gap-3 p-4 border-2 border-neutral-200 rounded-xl cursor-pointer hover:border-primary-300 transition-colors">
                              <input
                                type="checkbox"
                                name="available"
                                checked={formData.available}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-primary-600 rounded"
                              />
                              <span className="font-medium">Je suis disponible pour de nouveaux projets</span>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {profile.role === 'client' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">Nom de l'entreprise</label>
                          <input
                            type="text"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleInputChange}
                            className="input-modern"
                            placeholder="Votre entreprise"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">Taille de l'entreprise</label>
                            <select
                              name="company_size"
                              value={formData.company_size}
                              onChange={handleInputChange}
                              className="input-modern"
                            >
                              <option value="">Sélectionner</option>
                              <option value="1">Indépendant</option>
                              <option value="2-10">2-10 employés</option>
                              <option value="11-50">11-50 employés</option>
                              <option value="51-200">51-200 employés</option>
                              <option value="201-500">201-500 employés</option>
                              <option value="500+">Plus de 500 employés</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">Secteur d'activité</label>
                            <select
                              name="industry"
                              value={formData.industry}
                              onChange={handleInputChange}
                              className="input-modern"
                            >
                              <option value="">Sélectionner</option>
                              <option value="tech">Technologie</option>
                              <option value="finance">Finance</option>
                              <option value="commerce">Commerce</option>
                              <option value="education">Éducation</option>
                              <option value="sante">Santé</option>
                              <option value="immobilier">Immobilier</option>
                              <option value="agriculture">Agriculture</option>
                              <option value="autre">Autre</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">Numéro fiscal (IFU)</label>
                          <input
                            type="text"
                            name="tax_id"
                            value={formData.tax_id}
                            onChange={handleInputChange}
                            className="input-modern"
                            placeholder="Votre numéro IFU"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && profile.role === 'freelancer' && (
              <div className="space-y-6">
                <div className="card-premium p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Portfolio</h2>
                    <button
                      onClick={() => setShowPortfolioModal(true)}
                      className="btn-gradient"
                    >
                      <Plus className="w-5 h-5" />
                      Ajouter un projet
                    </button>
                  </div>

                  {portfolio.length === 0 ? (
                    <div className="text-center py-12 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                      <Image className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                      <h3 className="text-lg font-semibold text-neutral-700 mb-2">Aucun projet dans votre portfolio</h3>
                      <p className="text-neutral-500 mb-4">Ajoutez vos meilleurs travaux pour impressionner les clients</p>
                      <button
                        onClick={() => setShowPortfolioModal(true)}
                        className="btn-gradient"
                      >
                        <Plus className="w-5 h-5" />
                        Ajouter un projet
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {portfolio.map((item, i) => (
                        <div key={item.id || i} className="group relative bg-neutral-50 rounded-2xl overflow-hidden">
                          <div className="aspect-video bg-gradient-to-br from-primary-100 to-emerald-100 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="w-12 h-12 text-neutral-300" />
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-neutral-900 mb-1">{item.title}</h3>
                            {item.description && (
                              <p className="text-sm text-neutral-600 line-clamp-2">{item.description}</p>
                            )}
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Voir le projet
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => removePortfolioItem(item.id)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verification Tab */}
            {activeTab === 'verification' && (
              <div className="space-y-6">
                <div className="card-premium p-6">
                  <h2 className="text-xl font-bold mb-6">Statut de vérification</h2>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border-2 ${profile.is_verified ? 'border-green-200 bg-green-50' : 'border-neutral-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${profile.is_verified ? 'bg-green-500' : 'bg-neutral-200'}`}>
                          {profile.is_verified ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <Shield className="w-6 h-6 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900">Vérification du profil</h3>
                          <p className="text-sm text-neutral-600">
                            {profile.is_verified 
                              ? 'Votre profil est vérifié' 
                              : 'Votre profil n\'est pas encore vérifié'}
                          </p>
                        </div>
                        {profile.is_verified ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Vérifié
                          </span>
                        ) : (
                          <button className="btn-gradient">
                            Demander la vérification
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border-2 ${profile.is_identity_verified ? 'border-green-200 bg-green-50' : 'border-neutral-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${profile.is_identity_verified ? 'bg-green-500' : 'bg-neutral-200'}`}>
                          {profile.is_identity_verified ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <User className="w-6 h-6 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900">Vérification d'identité</h3>
                          <p className="text-sm text-neutral-600">
                            {profile.is_identity_verified 
                              ? 'Votre identité est vérifiée' 
                              : 'Vérifiez votre identité pour plus de confiance'}
                          </p>
                        </div>
                        {profile.is_identity_verified ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Vérifié
                          </span>
                        ) : (
                          <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors">
                            Vérifier
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Pourquoi se faire vérifier ?</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Les profils vérifiés obtiennent 3x plus de commandes et inspirent plus confiance aux clients.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Les modifications seront enregistrées sur votre profil public
          </p>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-gradient"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </div>

      {/* Portfolio Modal */}
      <AnimatePresence>
        {showPortfolioModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPortfolioModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl"
            >
              <button
                onClick={() => setShowPortfolioModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold mb-6">Ajouter un projet</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Titre du projet</label>
                  <input
                    type="text"
                    value={newPortfolioItem.title}
                    onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, title: e.target.value }))}
                    className="input-modern"
                    placeholder="Ex: Site e-commerce pour boutique de mode"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Description</label>
                  <textarea
                    value={newPortfolioItem.description}
                    onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, description: e.target.value }))}
                    className="input-modern h-24 resize-none"
                    placeholder="Décrivez brièvement le projet..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Lien du projet (optionnel)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="url"
                      value={newPortfolioItem.url}
                      onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, url: e.target.value }))}
                      className="input-modern pl-12"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Image du projet (optionnel)</label>
                  <div className="relative">
                    <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="url"
                      value={newPortfolioItem.image}
                      onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, image: e.target.value }))}
                      className="input-modern pl-12"
                      placeholder="URL de l'image..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPortfolioModal(false)}
                    className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={addPortfolioItem}
                    disabled={!newPortfolioItem.title}
                    className="flex-1 btn-gradient disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileEdit;
