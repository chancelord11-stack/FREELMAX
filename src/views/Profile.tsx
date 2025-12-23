import React, { useEffect, useState } from 'react';
import { profileService } from '../services/profileService';
import { serviceService } from '../services/serviceService';
import { reviewService } from '../services/reviewService';
import { Profile as ProfileType, Service, Review } from '../types';
import { formatCurrency, getInitials } from '../utils/format';
import { MapPin, Briefcase, Star, Award, Clock, Shield, Edit } from 'lucide-react';

interface ProfileProps {
  userId: string;
  // ✅ CORRECTION: Ajout de la prop onEdit manquante
  onEdit?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ userId, onEdit }) => {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'reviews'>('services');

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      const [profileData, servicesData, reviewsData] = await Promise.all([
        profileService.getProfile(userId),
        serviceService.getServicesByFreelancer(userId),
        reviewService.getUserReviews(userId),
      ]);
      setProfile(profileData);
      setServices(servicesData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return <div className="flex justify-center py-20"><div className="spinner w-12 h-12"></div></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Profile */}
      <div className="card p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-6">
            <div className="avatar w-24 h-24 text-3xl">
              {getInitials(profile.first_name, profile.last_name)}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {profile.first_name} {profile.last_name}
              </h1>
              {profile.headline && (
                <p className="text-xl text-neutral-600 mb-3">{profile.headline}</p>
              )}
              <div className="flex flex-wrap gap-3">
                {profile.is_verified && (
                  <span className="badge badge-success">
                    <Shield className="w-3 h-3" />
                    Vérifié
                  </span>
                )}
                <span className="badge badge-neutral capitalize">{profile.level.replace('_', ' ')}</span>
                <span className="badge badge-neutral">
                  <MapPin className="w-3 h-3" />
                  {profile.city}, {profile.country}
                </span>
              </div>
            </div>
          </div>
          {/* ✅ Utilisation de onEdit */}
          {onEdit && (
            <button onClick={onEdit} className="btn btn-secondary">
              <Edit className="w-4 h-4" />
              Modifier
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{profile.rating_avg.toFixed(1)}</div>
            <div className="text-sm text-neutral-600 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              Note moyenne
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{profile.completed_projects}</div>
            <div className="text-sm text-neutral-600 flex items-center justify-center gap-1">
              <Briefcase className="w-4 h-4" />
              Projets
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(profile.total_earnings)}
            </div>
            <div className="text-sm text-neutral-600 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" />
              Revenus
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{profile.response_time_avg}min</div>
            <div className="text-sm text-neutral-600 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              Temps de réponse
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-3">À propos</h2>
          <p className="text-neutral-700 whitespace-pre-line">{profile.bio}</p>
        </div>
      )}

      {/* Compétences */}
      {profile.skills.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Compétences</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, i) => (
              <span key={i} className="badge badge-primary text-sm px-4 py-2">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card p-2">
        <div className="flex gap-2">
          {['services', 'portfolio', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {tab === 'services' && `Services (${services.length})`}
              {tab === 'portfolio' && 'Portfolio'}
              {tab === 'reviews' && `Avis (${reviews.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service.id} className="card p-6">
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-purple-100 rounded-xl mb-4" />
              <h3 className="font-semibold mb-2">{service.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">À partir de</span>
                <span className="font-bold">{formatCurrency(service.price_basic)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating_overall
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.title && <h4 className="font-semibold mb-2">{review.title}</h4>}
              {review.comment && <p className="text-neutral-700">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;