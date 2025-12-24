import React, { useEffect, useState } from 'react';
import { Profile } from '../types';
import { formatCurrency, formatLevel } from '../utils/format';
import { TrendingUp, DollarSign, Briefcase, Star, MessageSquare, ArrowUpRight, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { statsService } from '../services/statsService';

interface DashboardProps {
  profile: Profile | null;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    if (profile) loadStats();
  }, [profile]);

  const loadStats = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // Chargement des VRAIES données seulement
      if (profile.role === 'freelancer') {
        const s = await statsService.getFreelancerStats(profile.id);
        setStats(s);
        const r = await statsService.getRevenueChartData(profile.id, 'freelancer', 6);
        setRevenueData(r);
      } else {
        const s = await statsService.getClientStats(profile.id);
        setStats(s);
        const r = await statsService.getRevenueChartData(profile.id, 'client', 6);
        setRevenueData(r);
      }
    } catch (error) {
      console.error('Erreur loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Bonjour, {profile.first_name} 👋</h1>
          <p className="text-neutral-600">Bienvenue sur votre tableau de bord.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500 bg-white px-3 py-1.5 rounded-lg border">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin w-8 h-8 text-primary-500" /></div>
      ) : (
        <>
          {/* Stats Cards Réelles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {/* Carte Revenus */}
             <div className="card p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-neutral-500 text-sm mb-1">{profile.role === 'freelancer' ? 'Revenus' : 'Dépenses'}</p>
                        <h3 className="text-2xl font-bold">{formatCurrency(profile.role === 'freelancer' ? stats?.monthlyRevenue || 0 : stats?.totalSpent || 0)}</h3>
                    </div>
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><DollarSign className="w-5 h-5"/></div>
                </div>
             </div>
             {/* Carte Projets */}
             <div className="card p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-neutral-500 text-sm mb-1">Projets Actifs</p>
                        <h3 className="text-2xl font-bold">{stats?.activeProjects || 0}</h3>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Briefcase className="w-5 h-5"/></div>
                </div>
             </div>
             {/* Carte Note ou Projets finis */}
             <div className="card p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-neutral-500 text-sm mb-1">{profile.role === 'freelancer' ? 'Note Moyenne' : 'Projets Terminés'}</p>
                        <h3 className="text-2xl font-bold">{profile.role === 'freelancer' ? stats?.ratingAvg?.toFixed(1) || 'N/A' : stats?.completedProjects || 0}</h3>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><Star className="w-5 h-5"/></div>
                </div>
             </div>
          </div>

          {/* Graphique (Si données présentes) */}
          {revenueData.length > 0 ? (
            <div className="card p-6">
                <h3 className="font-bold text-lg mb-4">Évolution financière</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                        <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenus" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
          ) : (
              <div className="card p-8 text-center text-neutral-500">
                  Pas encore de données financières à afficher.
              </div>
          )}
        </>
      )}
    </div>
  );
};
export default Dashboard;