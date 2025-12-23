import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Star, Shield, Zap, Globe, Users, TrendingUp, Check,
  Play, Quote, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin,
  ChevronRight, Award, Clock, Heart, Search, Menu, X, Loader2, ChevronDown
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/format';
import { statsService, PlatformStats, Category, DEFAULT_CATEGORIES } from '../services/statsService';

interface LandingProps {
  onLogin: () => void;
  onRegister: () => void;
  onExplore: () => void;
}

interface FeaturedService {
  id: string;
  title: string;
  description: string;
  price: number;
  deliveryTime: number;
  image: string;
  rating: number;
  reviews: number;
  freelancer: {
    id: string;
    name: string;
    avatar: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

const Landing: React.FC<LandingProps> = ({ onLogin, onRegister, onExplore }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredServices, setFeaturedServices] = useState<FeaturedService[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        setStatsLoading(true);
        
        // Charger les statistiques
        const stats = await statsService.getPlatformStats();
        setPlatformStats(stats);
        
        // Charger les catégories
        const cats = await statsService.getCategories();
        setCategories(cats.length > 0 ? cats : DEFAULT_CATEGORIES);
        
        // Charger les services populaires
        const services = await statsService.getFeaturedServices(8);
        setFeaturedServices(services);
      } catch (error) {
        console.error('Error loading data:', error);
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setStatsLoading(false);
      }
    };

    loadData();
  }, []);

  // Formater les statistiques pour l'affichage
  const formatStatValue = (value: number, type: 'number' | 'percent' | 'currency'): string => {
    if (type === 'percent') {
      return `${value}%`;
    }
    if (type === 'currency') {
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}Md`;
      }
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(0)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
      }
      return formatNumber(value);
    }
    if (value >= 1000) {
      return `${formatNumber(value)}+`;
    }
    return value > 0 ? `${value}+` : '0';
  };

  // Statistiques avec valeurs dynamiques
  const stats = platformStats ? [
    { 
      value: formatStatValue(platformStats.activeFreelancers, 'number'), 
      label: 'Freelances actifs' 
    },
    { 
      value: formatStatValue(platformStats.completedProjects, 'number'), 
      label: 'Projets réalisés' 
    },
    { 
      value: formatStatValue(platformStats.satisfactionRate, 'percent'), 
      label: 'Clients satisfaits' 
    },
    { 
      value: formatStatValue(platformStats.totalPaidAmount, 'currency'), 
      label: 'FCFA versés' 
    },
  ] : [
    { value: '—', label: 'Freelances actifs' },
    { value: '—', label: 'Projets réalisés' },
    { value: '—', label: 'Clients satisfaits' },
    { value: '—', label: 'FCFA versés' },
  ];

  // Catégories à afficher (6 ou toutes)
  const displayedCategories = showAllCategories ? categories : categories.slice(0, 12);

  // Services par défaut si pas de données
  const defaultServices: FeaturedService[] = [
    { 
      id: '1', 
      title: 'Création de site web professionnel', 
      description: 'Site vitrine ou e-commerce responsive',
      price: 150000, 
      deliveryTime: 7,
      rating: 4.9, 
      reviews: 127, 
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      freelancer: { id: '1', name: 'Amara K.', avatar: '' },
      category: { id: '1', name: 'Web Dev', slug: 'dev-web' }
    },
    { 
      id: '2', 
      title: 'Design de logo moderne et mémorable', 
      description: 'Logo vectoriel + charte graphique',
      price: 75000, 
      deliveryTime: 3,
      rating: 4.8, 
      reviews: 89, 
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
      freelancer: { id: '2', name: 'Fatou D.', avatar: '' },
      category: { id: '3', name: 'Design', slug: 'design' }
    },
    { 
      id: '3', 
      title: 'Application mobile iOS & Android', 
      description: 'App native ou cross-platform',
      price: 500000, 
      deliveryTime: 21,
      rating: 5.0, 
      reviews: 45, 
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
      freelancer: { id: '3', name: 'Kofi M.', avatar: '' },
      category: { id: '2', name: 'Mobile', slug: 'dev-mobile' }
    },
    { 
      id: '4', 
      title: 'Stratégie marketing digital complète', 
      description: 'SEO, réseaux sociaux, publicité',
      price: 200000, 
      deliveryTime: 14,
      rating: 4.7, 
      reviews: 63, 
      image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400',
      freelancer: { id: '4', name: 'Aïcha B.', avatar: '' },
      category: { id: '4', name: 'Marketing', slug: 'marketing' }
    },
  ];

  const servicesToDisplay = featuredServices.length > 0 ? featuredServices : defaultServices;

  const testimonials = [
    { 
      id: 1, 
      name: 'Marie Adjovi', 
      role: 'CEO, TechBenin', 
      content: 'Freenance a transformé notre façon de trouver des talents. La qualité des freelances est exceptionnelle et le processus de paiement est très sécurisé.',
      avatar: 'MA',
      rating: 5
    },
    { 
      id: 2, 
      name: 'Paul Houngbo', 
      role: 'Fondateur, StartupCotonou', 
      content: 'Une plateforme fiable avec des paiements sécurisés. J\'ai trouvé des développeurs talentueux pour mon projet en moins de 24h. Je recommande à 100% !',
      avatar: 'PH',
      rating: 5
    },
    { 
      id: 3, 
      name: 'Carine Dossou', 
      role: 'Directrice Marketing, AfriShop', 
      content: 'Les freelances sont professionnels et respectent toujours les délais. Le système d\'escrow me donne une tranquillité d\'esprit totale.',
      avatar: 'CD',
      rating: 5
    },
  ];

  const howItWorks = [
    { 
      step: '01', 
      title: 'Trouvez le talent', 
      desc: 'Parcourez notre marketplace et trouvez le freelance idéal pour votre projet parmi des centaines de professionnels vérifiés.',
      icon: Search
    },
    { 
      step: '02', 
      title: 'Commandez en sécurité', 
      desc: 'Passez commande avec notre système de paiement sécurisé par escrow. Votre argent est protégé jusqu\'à la livraison.',
      icon: Shield
    },
    { 
      step: '03', 
      title: 'Recevez votre travail', 
      desc: 'Validez le travail et libérez le paiement. Satisfaction garantie avec notre politique de révision gratuite !',
      icon: Check
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-xl font-bold text-white">F</span>
              </div>
              <span className="text-2xl font-bold text-neutral-900">Freenance</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-neutral-600 hover:text-primary-600 font-medium transition-colors">Services</a>
              <a href="#categories" className="text-neutral-600 hover:text-primary-600 font-medium transition-colors">Catégories</a>
              <a href="#how-it-works" className="text-neutral-600 hover:text-primary-600 font-medium transition-colors">Comment ça marche</a>
              <a href="#testimonials" className="text-neutral-600 hover:text-primary-600 font-medium transition-colors">Témoignages</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={onLogin}
                className="px-5 py-2.5 text-neutral-700 font-semibold hover:text-primary-600 transition-colors"
              >
                Connexion
              </button>
              <button 
                onClick={onRegister}
                className="btn-gradient"
              >
                Commencer
              </button>
            </div>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-neutral-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-neutral-100 p-4"
          >
            <div className="space-y-2">
              <a href="#services" className="block px-4 py-3 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium">Services</a>
              <a href="#categories" className="block px-4 py-3 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium">Catégories</a>
              <a href="#how-it-works" className="block px-4 py-3 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium">Comment ça marche</a>
              <a href="#testimonials" className="block px-4 py-3 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium">Témoignages</a>
              <hr className="my-4" />
              <button onClick={onLogin} className="w-full px-4 py-3 text-neutral-700 font-semibold hover:bg-neutral-50 rounded-lg">Connexion</button>
              <button onClick={onRegister} className="w-full btn-gradient">Commencer</button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-blue-50"></div>
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary-200/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-200/30 rounded-full blur-[100px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full mb-6">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-primary-700">La plateforme N°1 au Bénin</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6">
                Trouvez les meilleurs
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">
                  freelances du Bénin
                </span>
              </h1>
              
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                Connectez-vous avec des talents exceptionnels pour donner vie à vos projets. 
                Paiements sécurisés, qualité garantie.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={onExplore}
                  className="btn-gradient text-lg py-4 px-8"
                >
                  Trouver un freelance
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-white border-2 border-neutral-200 text-neutral-700 rounded-2xl font-bold text-lg hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Voir la démo
                </button>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex -space-x-3">
                  {['AK', 'FD', 'KM', 'AB'].map((initials, i) => (
                    <div key={i} className="w-12 h-12 bg-gradient-to-br from-primary-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-3 border-white shadow-lg">
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-neutral-600">
                    <span className="font-bold text-neutral-900">
                      {statsLoading ? '...' : (platformStats?.activeFreelancers ? `${formatNumber(platformStats.activeFreelancers)}+` : '0')}
                    </span> freelances vérifiés
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-neutral-100">
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600" 
                  alt="Freelance working" 
                  className="w-full h-80 object-cover rounded-2xl mb-6"
                />
                
                {/* Floating Cards */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -left-8 top-20 bg-white rounded-2xl shadow-xl p-4 border border-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900">Paiement sécurisé</div>
                      <div className="text-sm text-neutral-500">100% protégé</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="absolute -right-8 bottom-32 bg-white rounded-2xl shadow-xl p-4 border border-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900">Livraison rapide</div>
                      <div className="text-sm text-neutral-500">Délais respectés</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Dynamique */}
      <section className="py-16 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-primary-400 mb-2">
                  {statsLoading ? (
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary-400" />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-neutral-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Dynamique */}
      <section id="categories" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Explorez nos catégories</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              {categories.length} catégories de services pour répondre à tous vos besoins
            </p>
          </div>

          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="w-12 h-12 bg-neutral-200 rounded-xl mx-auto mb-4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {displayedCategories.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    viewport={{ once: true }}
                    onClick={onExplore}
                    className="bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all cursor-pointer group border border-neutral-100"
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
                    <h3 className="font-bold text-neutral-900 mb-1 text-sm">{cat.name}</h3>
                    <p className="text-xs text-neutral-500">{cat.serviceCount} services</p>
                  </motion.div>
                ))}
              </div>

              {categories.length > 12 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-xl font-semibold text-neutral-700 hover:border-primary-300 hover:text-primary-600 transition-all"
                  >
                    {showAllCategories ? 'Voir moins' : `Voir toutes les catégories (${categories.length})`}
                    <ChevronDown className={`w-5 h-5 transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Featured Services - Dynamique */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-neutral-900 mb-2">Services populaires</h2>
              <p className="text-neutral-600">Les services les mieux notés par nos clients</p>
            </div>
            <button 
              onClick={onExplore}
              className="hidden md:flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
            >
              Voir tous les services <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {statsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                  <div className="h-48 bg-neutral-200"></div>
                  <div className="p-5">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2 mb-4"></div>
                    <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {servicesToDisplay.slice(0, 8).map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  onClick={onExplore}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group border border-neutral-100"
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-neutral-700">
                        {service.category.name}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="w-4 h-4 text-neutral-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-3">par {service.freelancer.name}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-neutral-900">{service.rating.toFixed(1)}</span>
                        <span className="text-neutral-400 text-sm">({service.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <Clock className="w-4 h-4" />
                        {service.deliveryTime} jours
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-500">À partir de</span>
                        <span className="text-lg font-bold text-primary-600">{formatCurrency(service.price)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <button 
              onClick={onExplore}
              className="btn-gradient"
            >
              Voir tous les services
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-primary-900 to-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comment ça marche</h2>
            <p className="text-xl text-primary-200 max-w-2xl mx-auto">
              Trois étapes simples pour concrétiser votre projet
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 h-full border border-white/10 hover:bg-white/20 transition-all">
                    <div className="text-6xl font-bold text-primary-500/30 mb-4">{step.step}</div>
                    <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-primary-200 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ChevronRight className="w-8 h-8 text-primary-500" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Ce que disent nos clients</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Des milliers d'entrepreneurs nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-10 h-10 text-primary-200 mb-4" />
                <p className="text-neutral-600 mb-6 leading-relaxed">{testimonial.content}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">{testimonial.name}</div>
                    <div className="text-sm text-neutral-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-emerald-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Prêt à démarrer votre projet ?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'entrepreneurs qui font confiance à Freenance pour leurs projets
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onRegister}
                className="px-8 py-4 bg-white text-primary-600 rounded-2xl font-bold text-lg hover:bg-neutral-100 transition-all shadow-xl"
              >
                Créer un compte gratuit
              </button>
              <button 
                onClick={onExplore}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold text-lg hover:bg-white/30 transition-all border border-white/30"
              >
                Devenir freelance
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-neutral-900 text-white pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">F</span>
                </div>
                <span className="text-2xl font-bold">Freenance</span>
              </div>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                La plateforme de freelance N°1 au Bénin. Connectez talents et opportunités.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Pour les clients</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Trouver un freelance</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Publier un projet</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Comment ça marche</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Garantie satisfaction</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Pour les freelances</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Devenir freelance</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Trouver des projets</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Guide du freelance</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Communauté</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-neutral-400">
                  <MapPin className="w-5 h-5 text-primary-400" />
                  Cotonou, Bénin
                </li>
                <li className="flex items-center gap-3 text-neutral-400">
                  <Phone className="w-5 h-5 text-primary-400" />
                  +229 XX XX XX XX
                </li>
                <li className="flex items-center gap-3 text-neutral-400">
                  <Mail className="w-5 h-5 text-primary-400" />
                  contact@freenance.bj
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-neutral-400 text-sm">
                © 2024 Freenance. Tous droits réservés. Fait avec ❤️ au Bénin
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">Conditions d'utilisation</a>
                <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">Politique de confidentialité</a>
                <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">Mentions légales</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
