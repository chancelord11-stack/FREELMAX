import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, User, Briefcase, Eye, EyeOff, ArrowRight, 
  CheckCircle, Shield, Zap, Star, Globe, Phone, MapPin,
  Camera, Upload, X, ChevronLeft, Building2
} from 'lucide-react';
import { signIn, signUp } from '../services/supabase';
import toast from 'react-hot-toast';

interface AuthProps {
  onSuccess: () => void;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
}

const Auth: React.FC<AuthProps> = ({ onSuccess, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: '' as 'client' | 'freelancer' | '',
    // Freelancer specific
    headline: '',
    skills: [] as string[],
    hourlyRate: '',
    bio: '',
    // Client specific
    companyName: '',
    companySize: '',
    industry: '',
    // Common
    country: 'Bénin',
    city: '',
    acceptTerms: false,
  });

  const [skillInput, setSkillInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) throw error;
      toast.success('Connexion réussie !');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step < getTotalSteps()) {
      setStep(step + 1);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    setLoading(true);

    try {
      const metadata = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        ...(formData.role === 'freelancer' && {
          headline: formData.headline,
          skills: formData.skills,
          hourly_rate: parseFloat(formData.hourlyRate) || null,
          bio: formData.bio,
        }),
        ...(formData.role === 'client' && {
          company_name: formData.companyName,
          company_size: formData.companySize,
          industry: formData.industry,
        }),
      };

      const { error } = await signUp(formData.email, formData.password, metadata);
      if (error) throw error;
      
      toast.success('Compte créé avec succès ! Vérifiez votre email.');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getTotalSteps = () => {
    if (mode !== 'register') return 1;
    return formData.role === 'freelancer' ? 4 : formData.role === 'client' ? 3 : 2;
  };

  const renderStepIndicator = () => {
    const totalSteps = getTotalSteps();
    if (totalSteps <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i + 1 === step ? 'w-8 bg-primary-600' : 
              i + 1 < step ? 'w-2 bg-primary-400' : 'w-2 bg-neutral-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Adresse email</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input-modern pl-12"
            placeholder="votre@email.com"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-neutral-700">Mot de passe</label>
          <button 
            type="button"
            onClick={() => setMode('forgot')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Mot de passe oublié ?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="input-modern pl-12 pr-12"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
        >
          {error}
        </motion.div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-gradient w-full py-4"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Se connecter
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );

  const renderRegisterStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-neutral-900 mb-2">Quel type de compte souhaitez-vous créer ?</h3>
        <p className="text-neutral-600">Choisissez le profil qui vous correspond</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          type="button"
          onClick={() => {
            setFormData(prev => ({ ...prev, role: 'freelancer' }));
            setStep(2);
          }}
          className={`p-6 rounded-2xl border-2 transition-all text-left group hover:border-primary-500 hover:bg-primary-50 ${
            formData.role === 'freelancer' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-neutral-900 mb-1">Je suis Freelancer</h4>
              <p className="text-neutral-600 text-sm">Je propose mes services et compétences aux clients</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">Créer des services</span>
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">Recevoir des commandes</span>
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">Gagner de l'argent</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setFormData(prev => ({ ...prev, role: 'client' }));
            setStep(2);
          }}
          className={`p-6 rounded-2xl border-2 transition-all text-left group hover:border-blue-500 hover:bg-blue-50 ${
            formData.role === 'client' ? 'border-blue-500 bg-blue-50' : 'border-neutral-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-neutral-900 mb-1">Je suis Client</h4>
              <p className="text-neutral-600 text-sm">Je recherche des freelancers pour mes projets</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Publier des projets</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Commander des services</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Gérer mes commandes</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </div>
    </div>
  );

  const renderRegisterStep2 = () => (
    <form onSubmit={handleRegister} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Prénom</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="input-modern pl-12"
              placeholder="Votre prénom"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Nom</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="input-modern"
            placeholder="Votre nom"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Adresse email</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input-modern pl-12"
            placeholder="votre@email.com"
            required
          />
        </div>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Pays</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="input-modern pl-12 appearance-none"
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
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Ville</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="input-modern pl-12"
              placeholder="Cotonou"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Mot de passe</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="input-modern pl-12 pr-12"
            placeholder="Minimum 8 caractères"
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Confirmer le mot de passe</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="input-modern pl-12"
            placeholder="Confirmez votre mot de passe"
            required
          />
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
        >
          {error}
        </motion.div>
      )}

      <button type="submit" className="btn-gradient w-full py-4">
        Continuer
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );

  const renderFreelancerStep3 = () => (
    <form onSubmit={handleRegister} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Titre professionnel</label>
        <input
          type="text"
          name="headline"
          value={formData.headline}
          onChange={handleInputChange}
          className="input-modern"
          placeholder="Ex: Développeur Web Full Stack"
          required
        />
        <p className="text-xs text-neutral-500 mt-1">Ce titre apparaîtra sur votre profil public</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Compétences</label>
        <div className="flex gap-2 mb-2">
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
            className="px-4 py-2 bg-primary-100 text-primary-700 rounded-xl font-semibold hover:bg-primary-200 transition-colors"
          >
            Ajouter
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
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

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Tarif horaire (FCFA)</label>
        <input
          type="number"
          name="hourlyRate"
          value={formData.hourlyRate}
          onChange={handleInputChange}
          className="input-modern"
          placeholder="Ex: 15000"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          className="input-modern h-32 resize-none"
          placeholder="Parlez de vous, de votre expérience et de ce qui vous rend unique..."
        />
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
        >
          {error}
        </motion.div>
      )}

      <button type="submit" className="btn-gradient w-full py-4">
        Continuer
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );

  const renderClientStep3 = () => (
    <form onSubmit={handleRegister} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Nom de l'entreprise (optionnel)</label>
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            className="input-modern pl-12"
            placeholder="Votre entreprise"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Taille de l'entreprise</label>
        <select
          name="companySize"
          value={formData.companySize}
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

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
        >
          {error}
        </motion.div>
      )}

      <button type="submit" className="btn-gradient w-full py-4">
        Continuer
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );

  const renderFinalStep = () => (
    <form onSubmit={handleRegister} className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">Presque terminé !</h3>
        <p className="text-neutral-600">Vérifiez vos informations et acceptez les conditions</p>
      </div>

      <div className="bg-neutral-50 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-neutral-600">Nom complet</span>
          <span className="font-medium">{formData.firstName} {formData.lastName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Email</span>
          <span className="font-medium">{formData.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Type de compte</span>
          <span className="font-medium capitalize">{formData.role}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Localisation</span>
          <span className="font-medium">{formData.city}, {formData.country}</span>
        </div>
      </div>

      <label className="flex items-start gap-3 p-4 border-2 border-neutral-200 rounded-xl cursor-pointer hover:border-primary-300 transition-colors">
        <input
          type="checkbox"
          name="acceptTerms"
          checked={formData.acceptTerms}
          onChange={handleInputChange}
          className="w-5 h-5 mt-0.5 text-primary-600 rounded"
        />
        <span className="text-sm text-neutral-600">
          J'accepte les <a href="#" className="text-primary-600 hover:underline">Conditions d'utilisation</a> et la{' '}
          <a href="#" className="text-primary-600 hover:underline">Politique de confidentialité</a> de Freenance
        </span>
      </label>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
        >
          {error}
        </motion.div>
      )}

      <button
        type="submit"
        disabled={loading || !formData.acceptTerms}
        className="btn-gradient w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Créer mon compte
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );

  const renderCurrentStep = () => {
    if (mode === 'login') return renderLoginForm();
    if (mode === 'forgot') return renderForgotPassword();
    
    switch (step) {
      case 1:
        return renderRegisterStep1();
      case 2:
        return renderRegisterStep2();
      case 3:
        return formData.role === 'freelancer' ? renderFreelancerStep3() : renderClientStep3();
      case 4:
        return renderFinalStep();
      default:
        return renderFinalStep();
    }
  };

  const renderForgotPassword = () => (
    <form onSubmit={(e) => { e.preventDefault(); toast.success('Email de réinitialisation envoyé !'); setMode('login'); }} className="space-y-5">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-neutral-900 mb-2">Mot de passe oublié ?</h3>
        <p className="text-neutral-600">Entrez votre email pour recevoir un lien de réinitialisation</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">Adresse email</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input-modern pl-12"
            placeholder="votre@email.com"
            required
          />
        </div>
      </div>

      <button type="submit" className="btn-gradient w-full py-4">
        Envoyer le lien
        <ArrowRight className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={() => setMode('login')}
        className="w-full text-center text-primary-600 hover:text-primary-700 font-medium"
      >
        Retour à la connexion
      </button>
    </form>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
            <span className="text-2xl font-bold text-neutral-900">Freenance</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            {step > 1 && mode === 'register' && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4 font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                Retour
              </button>
            )}
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {mode === 'login' ? 'Bon retour !' : mode === 'forgot' ? 'Réinitialisation' : 'Créer un compte'}
            </h1>
            <p className="text-neutral-600">
              {mode === 'login' 
                ? 'Connectez-vous pour accéder à votre espace' 
                : mode === 'forgot'
                ? 'Nous vous enverrons un lien de réinitialisation'
                : 'Rejoignez la communauté Freenance'}
            </p>
          </div>

          {renderStepIndicator()}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          {mode !== 'forgot' && (
            <div className="mt-8 text-center">
              <p className="text-neutral-600">
                {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setStep(1);
                    setError('');
                  }}
                  className="ml-2 text-primary-600 hover:text-primary-700 font-semibold"
                >
                  {mode === 'login' ? "S'inscrire" : "Se connecter"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTE4IDBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center max-w-lg"
          >
            <h2 className="text-4xl font-bold mb-6">
              {mode === 'login' 
                ? 'Heureux de vous revoir !' 
                : 'Rejoignez la révolution freelance'}
            </h2>
            <p className="text-xl text-white/80 mb-12">
              {mode === 'login'
                ? 'Accédez à vos projets, messages et portefeuille en un clic.'
                : 'Plus de 2,500 freelancers et 15,000 projets réalisés au Bénin.'}
            </p>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Shield, label: 'Paiements sécurisés' },
                { icon: Zap, label: 'Livraison rapide' },
                { icon: Star, label: 'Talents vérifiés' },
                { icon: Globe, label: '100% local' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-4"
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
