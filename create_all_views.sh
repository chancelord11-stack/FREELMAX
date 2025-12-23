#!/bin/bash

# Services.tsx - Vue marketplace complète
cat > src/views/Services.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { serviceService } from '../services/serviceService';
import { ServiceWithFreelancer } from '../types';
import { formatCurrency, getInitials } from '../utils/format';
import { Search, Filter, Star, Clock, TrendingUp, Grid, List } from 'lucide-react';

interface ServicesProps {
  onViewService: (serviceId: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onViewService }) => {
  const [services, setServices] = useState<ServiceWithFreelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    minRating: 0,
  });

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
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Services</h1>
          <p className="text-neutral-600">Découvrez des milliers de services professionnels</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher des services..."
                className="input pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
          <button className="btn btn-secondary">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="bg-neutral-200 h-48 rounded-xl mb-4"></div>
              <div className="bg-neutral-200 h-6 rounded mb-2"></div>
              <div className="bg-neutral-200 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {services.map(service => (
            <ServiceCard key={service.id} service={service} onClick={() => onViewService(service.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

const ServiceCard: React.FC<{ service: ServiceWithFreelancer; onClick: () => void }> = ({ service, onClick }) => (
  <div onClick={onClick} className="card p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1">
    <div className="aspect-video bg-gradient-to-br from-primary-100 to-purple-100 rounded-xl mb-4 overflow-hidden">
      {service.cover_image_url && (
        <img src={service.cover_image_url} alt={service.title} className="w-full h-full object-cover" />
      )}
    </div>
    <div className="flex items-center gap-2 mb-3">
      <div className="avatar avatar-sm">
        {getInitials(service.freelancer.first_name, service.freelancer.last_name)}
      </div>
      <span className="text-sm font-medium">{service.freelancer.first_name}</span>
    </div>
    <h3 className="font-semibold mb-2 line-clamp-2">{service.title}</h3>
    <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span>{service.rating_avg.toFixed(1)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        <span>{service.delivery_days}j</span>
      </div>
    </div>
    <div className="flex items-center justify-between pt-3 border-t">
      <span className="text-sm text-neutral-600">À partir de</span>
      <span className="text-lg font-bold">{formatCurrency(service.price_basic)}</span>
    </div>
  </div>
);

export default Services;
EOF

echo "Services.tsx créé ✓"

# ServiceDetail.tsx
cat > src/views/ServiceDetail.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { serviceService } from '../services/serviceService';
import { ServiceWithFreelancer } from '../types';
import { formatCurrency, getInitials } from '../utils/format';
import { ArrowLeft, Star, Clock, Check, Heart, Share2 } from 'lucide-react';

interface ServiceDetailProps {
  serviceId: string;
  onBack: () => void;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ serviceId, onBack }) => {
  const [service, setService] = useState<ServiceWithFreelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('basic');

  useEffect(() => {
    loadService();
  }, [serviceId]);

  const loadService = async () => {
    try {
      const data = await serviceService.getServiceById(serviceId);
      setService(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !service) {
    return <div className="flex justify-center py-20"><div className="spinner"></div></div>;
  }

  const packages = [
    { name: 'basic', label: 'Basique', price: service.price_basic, features: service.features_basic },
    { name: 'standard', label: 'Standard', price: service.price_standard, features: service.features_standard },
    { name: 'premium', label: 'Premium', price: service.price_premium, features: service.features_premium },
  ].filter(p => p.price);

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="btn btn-secondary">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-gradient-to-br from-primary-100 to-purple-100 rounded-2xl overflow-hidden">
            {service.cover_image_url && (
              <img src={service.cover_image_url} alt={service.title} className="w-full h-full object-cover" />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="avatar avatar-lg">
                  {getInitials(service.freelancer.first_name, service.freelancer.last_name)}
                </div>
                <div>
                  <div className="font-semibold">{service.freelancer.first_name} {service.freelancer.last_name}</div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{service.rating_avg.toFixed(1)}</span>
                    <span>({service.orders_count} commandes)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">À propos de ce service</h2>
            <div className="prose max-w-none text-neutral-700">{service.description}</div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <div className="space-y-4 mb-6">
              {packages.map(pkg => (
                <button
                  key={pkg.name}
                  onClick={() => setSelectedPackage(pkg.name as any)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedPackage === pkg.name
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">{pkg.label}</span>
                    <span className="text-2xl font-bold">{formatCurrency(pkg.price!)}</span>
                  </div>
                  <div className="space-y-2 text-sm text-left">
                    {pkg.features?.map((feat: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <button className="btn btn-primary w-full mb-3">Commander maintenant</button>
            <div className="flex gap-2">
              <button className="btn btn-secondary flex-1">
                <Heart className="w-4 h-4" />
              </button>
              <button className="btn btn-secondary flex-1">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
EOF

echo "ServiceDetail.tsx créé ✓"

# Créer les autres vues
for view in Projects ProjectDetail Orders OrderDetail Messages Wallet Profile Settings; do
  cat > src/views/${view}.tsx << 'VIEWEOF'
import React from 'react';

const ComponentName: React.FC<any> = (props) => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-6">Vue en développement</h1>
      <div className="card p-12 text-center">
        <p className="text-xl text-neutral-600">Cette vue sera implémentée prochainement</p>
      </div>
    </div>
  );
};

export default ComponentName;
VIEWEOF
  echo "${view}.tsx créé ✓"
done

