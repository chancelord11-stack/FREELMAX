import React, { useEffect, useState } from 'react';
import { Profile } from '../types';
import { formatCurrency, formatLevel } from '../utils/format';
import { 
  TrendingUp, DollarSign, Briefcase, Star, MessageSquare, 
  ArrowUpRight, ArrowDownRight, Loader2, Clock, CheckCircle,
  AlertCircle, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { statsService } from '../services/statsService';

interface DashboardProps {
  profile: Profile | null;
}

interface FreelancerStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeProjects: number;
  completedProjects: number;
  ratingAvg: number;
  ratingCount: number;
  unreadMessages: number;
}

interface ClientStats {
  totalSpent: number;
  activeProjects: number;
  completedProjects: number;
  freelancersHired: number;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [loading, setLoading] = useState(true);
  const [freelancerStats, setFreelancerStats] = useState<FreelancerStats | null>(null);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      loadStats();
    }
  }, [profile]);

  const loadStats = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      if (profile.role === 'freelancer') {
        const stats = await statsService.getFreelancerStats(profile.id);
        setFreelancerStats(stats);

        const chartData = await statsService.getRevenueChartData(profile.id, 'freelancer', 6);
        setRevenueData(chartData);

        const catData = await statsService.getProjectsByCategory(profile.id, 'freelancer');
        setCategoryData(catData);
      } else {
        const stats = await statsService.getClientStats(profile.id);
        setClientStats(stats);

        const chartData = await statsService.getRevenueChartData(profile.id, 'client', 6);
        setRevenueData(chartData);

        const catData = await statsService.getProjectsByCategory(profile.id, 'client');
        setCategoryData(catData);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold mb-4">Bienvenue sur Freenance</h2>
        <p className="text-neutral-600 mb-8">La plateforme N°1 du freelancing au Bénin</p>
      </div>
    );
  }

  // Statistiques pour freelancer
  const freelancerStatsCards = freelancerStats ? [
    { 
      label: 'Revenus du mois', 
      value: formatCurrency(freelancerStats.monthlyRevenue), 
      icon: DollarSign, 
      color: 'emerald',
      change: '+23%',
      positive: true
    },
    { 
      label: 'Projets actifs', 
      value: freelancerStats.activeProjects.toString(), 
      icon: Briefcase, 
      color: 'blue',
      change: `+${freelancerStats.activeProjects}`,
      positive: true
    },
    { 
      label: 'Note moyenne', 
      value: freelancerStats.ratingAvg.toFixed(1), 
      icon: Star, 
      color: 'yellow',
      change: `${freelancerStats.ratingCount} avis`,
      positive: true
    },
    { 
      label: 'Messages non lus', 
      value: freelancerStats.unreadMessages.toString(), 
      icon: MessageSquare, 
      color: 'purple',
      change: 'Nouveau',
      positive: freelancerStats.unreadMessages > 0
    },
  ] : [];

  // Statistiques pour client
  const clientStatsCards = clientStats ? [
    { 
      label: 'Total dépensé', 
      value: formatCurrency(clientStats.totalSpent), 
      icon: DollarSign, 
      color: 'emerald',
      change: 'Tous projets',
      positive: true
    },
    { 
      label: 'Projets actifs', 
      value: clientStats.activeProjects.toString(), 
      icon: Briefcase, 
      color: 'blue',
      change: 'En cours',
      positive: true
    },
    { 
      label: 'Projets terminés', 
      value: clientStats.completedProjects.toString(), 
      icon: CheckCircle, 
      color: 'green',
      change: 'Complétés',
      positive: true
    },
    { 
      label: 'Freelancers engagés', 
      value: clientStats.freelancersHired.toString(), 
      icon: TrendingUp, 
      color: 'purple',
      change: 'Collaborations',
      positive: true
    },
  ] : [];

  const statsCards = profile.role === 'freelancer' ? freelancerStatsCards : clientStatsCards;

  // Données de démonstration si pas de données réelles
  const demoRevenueData = [
    { month: 'Jan', revenus: 450000 },
    { month: 'Fév', revenus: 520000 },
    { month: 'Mar', revenus: 680000 },
    { month: 'Avr', revenus: 750000 },
    { month: 'Mai', revenus: 890000 },
    { month: 'Jun', revenus: 1200000 },
  ];

  const demoCategoryData = [
    { name: 'Web Dev', value: 35, color: '#10B981' },
    { name: 'Design', value: 25, color: '#3B82F6' },
    { name: 'Mobile', value: 20, color: '#8B5CF6' },
    { name: 'Marketing', value: 12, color: '#F59E0B' },
    { name: 'Autres', value: 8, color: '#EC4899' },
  ];

  const chartRevenueData = revenueData.length > 0 ? revenueData : demoRevenueData;
  const chartCategoryData = categoryData.length > 0 ? categoryData : demoCategoryData;

  // Activités récentes (à remplacer par des données réelles)
  const recentActivities = [
    { type: 'order', title: 'Nouvelle commande reçue', desc: 'Création site e-commerce', time: 'Il y a 2h', icon: Briefcase, color: 'blue' },
    { type: 'payment', title: 'Paiement reçu', desc: '150 000 FCFA', time: 'Il y a 5h', icon: DollarSign, color: 'green' },
    { type: 'message', title: 'Nouveau message', desc: 'De Kokou M.', time: 'Il y a 8h', icon: MessageSquare, color: 'purple' },
    { type: 'review', title: 'Nouvel avis', desc: '5 étoiles', time: 'Hier', icon: Star, color: 'yellow' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Bonjour, {profile.first_name} 👋
            </h1>
            <p className="text-neutral-600 mt-1">
              {profile.role === 'freelancer' 
                ? `Niveau ${formatLevel(profile.level)} • ${profile.completed_projects} projets complétés`
                : 'Voici un aperçu de vos projets'
              }
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="w-12 h-12 bg-neutral-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-neutral-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-neutral-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-emerald-600' : 'text-neutral-500'}`}>
                    {stat.positive && <ArrowUpRight className="w-4 h-4" />}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="text-sm text-neutral-600 mb-1">{stat.label}</div>
                <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card p-6"
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            {profile.role === 'freelancer' ? 'Évolution des revenus' : 'Évolution des dépenses'}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartRevenueData}>
                <defs>
                  <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Revenus']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenus" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenu)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Répartition des projets</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Part']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {chartCategoryData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-neutral-600">{cat.name}</span>
                </div>
                <span className="font-semibold text-neutral-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Activité récente</h2>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Voir tout
          </button>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity, i) => {
            const Icon = activity.icon;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-4 p-4 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl bg-${activity.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${activity.color}-600`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-neutral-900">{activity.title}</div>
                  <div className="text-sm text-neutral-500">{activity.desc}</div>
                </div>
                <div className="text-sm text-neutral-400">{activity.time}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {profile.role === 'freelancer' ? (
          <>
            <div className="card p-6 bg-gradient-to-br from-primary-500 to-emerald-500 text-white">
              <h3 className="font-bold text-lg mb-2">Créer un service</h3>
              <p className="text-white/80 text-sm mb-4">Proposez vos compétences aux clients</p>
              <button className="px-4 py-2 bg-white text-primary-600 rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors">
                Nouveau service
              </button>
            </div>
            <div className="card p-6 bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              <h3 className="font-bold text-lg mb-2">Trouver des projets</h3>
              <p className="text-white/80 text-sm mb-4">Parcourez les projets disponibles</p>
              <button className="px-4 py-2 bg-white text-blue-600 rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors">
                Explorer
              </button>
            </div>
            <div className="card p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <h3 className="font-bold text-lg mb-2">Compléter le profil</h3>
              <p className="text-white/80 text-sm mb-4">Augmentez votre visibilité</p>
              <button className="px-4 py-2 bg-white text-purple-600 rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors">
                Modifier
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="card p-6 bg-gradient-to-br from-primary-500 to-emerald-500 text-white">
              <h3 className="font-bold text-lg mb-2">Publier un projet</h3>
              <p className="text-white/80 text-sm mb-4">Trouvez le freelance idéal</p>
              <button className="px-4 py-2 bg-white text-primary-600 rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors">
                Nouveau projet
              </button>
            </div>
            <div className="card p-6 bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              <h3 className="font-bold text-lg mb-2">Explorer les services</h3>
              <p className="text-white/80 text-sm mb-4">Découvrez les talents disponibles</p>
              <button className="px-4 py-2 bg-white text-blue-600 rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors">
                Parcourir
              </button>
            </div>
            <div className="card p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <h3 className="font-bold text-lg mb-2">Mes commandes</h3>
              <p className="text-white/80 text-sm mb-4">Suivez vos projets en cours</p>
              <button className="px-4 py-2 bg-white text-purple-600 rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors">
                Voir
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
