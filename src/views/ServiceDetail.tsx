import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceService } from '../services/serviceService';
import { ServiceWithFreelancer } from '../types';
import { formatCurrency, getInitials } from '../utils/format';
import { ArrowLeft, Star, Clock, Check, Heart, Share2 } from 'lucide-react';

const ServiceDetail: React.FC = () => {
  const { id: serviceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceWithFreelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('basic');

  useEffect(() => {
    if (serviceId) {
      loadService(serviceId);
    }
  }, [serviceId]);

  const loadService = async (id: string) => {
    try {
      const data = await serviceService.getServiceById(id);
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
      <button onClick={() => navigate('/services')} className="btn btn-secondary">
        <ArrowLeft className="w-4 h-4" />
        Retour aux services
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
                  {/* ✅ CORRECTION: Ajout de ?. et fallback */}
                  {getInitials(service.freelancer?.first_name || '', service.freelancer?.last_name || '')}
                </div>
                <div>
                  {/* ✅ CORRECTION: Ajout de ?. */}
                  <div className="font-semibold">{service.freelancer?.first_name} {service.freelancer?.last_name}</div>
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