import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { serviceService } from '../services/serviceService';
import { ServiceWithFreelancer } from '../types';
import { formatCurrency, getInitials } from '../utils/format';
import { Search, Filter, Star, Clock, Grid, List, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

interface ServicesProps {
  onViewService: (serviceId: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onViewService }) => {
  const [services, setServices] = useState<ServiceWithFreelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Gestion de la recherche avec Debounce (Anti-lag)
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    minRating: 0,
  });

  // Synchronisation Search -> Filters
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  // Chargement des données
  useEffect(() => {
    loadServices();
  }, [filters]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.searchServices({
        query: filters.search || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        minRating: filters.minRating || undefined,
      });
      setServices(data);
    } catch (error) {
      console.error('Erreur chargement services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="relative py-12 px-4 mb-10 overflow-hidden rounded-3xl bg-neutral-900 text-white shadow-2xl mx-auto max-w-[1600px]">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-bold tracking-wider mb-4 uppercase">
              Marketplace Premium
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
              Trouvez l'expert idéal pour <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-emerald-200">
                votre prochain succès
              </span>
            </h1>
            <p className="text-lg text-neutral-400 mb-8 leading-relaxed">
              Accédez à l'élite des freelances béninois. Des talents vérifiés, des paiements sécurisés et une qualité garantie pour propulser vos projets.
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- SEARCH BAR FLOTTANTE (Glassmorphism) --- */}
      <div className="sticky top-24 z-30 max-w-6xl mx-auto px-4 mb-12">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-glass rounded-2xl p-3 flex flex-col md:flex-row gap-3 items-center"
        >
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
            <input
              type="text"
              placeholder="Que recherchez-vous ? (ex: Logo, Site Web, Rédaction...)"
              className="w-full bg-neutral-50/50 hover:bg-white focus:bg-white border-none rounded-xl py-3.5 pl-12 pr-4 text-neutral-800 placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button className="flex items-center gap-2 px-5 py-3.5 bg-white border border-neutral-200 rounded-xl font-semibold text-neutral-600 hover:border-primary-200 hover:text-primary-700 hover:bg-primary-50/50 transition-all whitespace-nowrap shadow-sm">
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
            
            <div className="bg-neutral-100 p-1 rounded-xl flex shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- CONTENU --- */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        {/* Loading State (Skeletons) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 h-[420px] animate-pulse border border-neutral-100 shadow-sm">
                <div className="bg-neutral-100 h-56 rounded-2xl mb-5 w-full"></div>
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-100"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-neutral-100 rounded-full w-3/4"></div>
                    <div className="h-3 bg-neutral-100 rounded-full w-1/2"></div>
                  </div>
                </div>
                <div className="h-4 bg-neutral-100 rounded-full w-full mb-2"></div>
                <div className="h-4 bg-neutral-100 rounded-full w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Results Grid */
          <AnimatePresence>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' : 'flex flex-col gap-6 max-w-4xl mx-auto'}>
              {services.map((service, index) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  index={index}
                  onClick={() => onViewService(service.id)} 
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Empty State */}
            {services.length === 0 && !loading && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-white/50 rounded-3xl border border-dashed border-neutral-200"
              >
                <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Search className="w-10 h-10 text-neutral-300" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Aucun résultat trouvé</h3>
                <p className="text-neutral-500 max-w-md">Nous n'avons trouvé aucun service correspondant à "{filters.search}". Essayez des termes plus généraux.</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* COMPOSANT SERVICE CARD                           */
/* -------------------------------------------------------------------------- */
const ServiceCard: React.FC<{ 
  service: ServiceWithFreelancer; 
  onClick: () => void;
  index: number;
  viewMode: 'grid' | 'list';
}> = ({ service, onClick, index, viewMode }) => {
  
  const isList = viewMode === 'list';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={onClick}
      className={`group relative bg-white border border-neutral-100 shadow-sm hover:shadow-premium cursor-pointer transition-all duration-300 
        ${isList ? 'rounded-2xl p-4 flex gap-6 items-center' : 'rounded-3xl p-3 h-full flex flex-col'}
      `}
    >
      {/* --- Image Cover --- */}
      <div className={`relative overflow-hidden bg-neutral-100 ${isList ? 'w-64 aspect-video rounded-xl shrink-0' : 'aspect-[4/3] rounded-2xl mb-4 w-full'}`}>
        {service.cover_image_url ? (
          <img 
            src={service.cover_image_url} 
            alt={service.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200">
             <TrendingUp className="w-10 h-10 text-neutral-300" />
          </div>
        )}

        {/* Badge Prix (Flottant) */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/20 z-10">
          <span className="text-xs font-bold text-neutral-900">
            {formatCurrency(service.price_basic)}
          </span>
        </div>

        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      {/* --- Informations --- */}
      <div className={`flex flex-col ${isList ? 'flex-1 py-2' : 'flex-1 px-1 pb-1'}`}>
        
        {/* Info Freelancer */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-emerald-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm ring-2 ring-white">
              {/* ✅ CORRECTION: Ajout de ?. et fallback */}
              {getInitials(service.freelancer?.first_name || '', service.freelancer?.last_name || '')}
            </div>
            {/* Badge Online (simulé) */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-neutral-700 group-hover:text-primary-600 transition-colors">
              {/* ✅ CORRECTION: Ajout de ?. */}
              {service.freelancer?.first_name} {service.freelancer?.last_name}
            </span>
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide">
              Niveau Expert
            </span>
          </div>
        </div>

        {/* Titre */}
        <h3 className={`font-bold text-neutral-800 leading-snug mb-auto group-hover:text-primary-700 transition-colors ${isList ? 'text-xl mb-4' : 'text-lg line-clamp-2 mb-4'}`}>
          {service.title}
        </h3>

        {/* Footer Card (Stats) */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-50 mt-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100/50">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold text-neutral-800">{service.rating_avg.toFixed(1)}</span>
              <span className="text-xs text-neutral-400">({Math.floor(Math.random() * 50) + 5})</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{service.delivery_days}j</span>
            </div>
          </div>

          {/* Bouton d'action subtil (visible au hover sur Desktop) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0 hidden lg:block">
            <div className="bg-neutral-900 text-white p-1.5 rounded-full">
               <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Services;