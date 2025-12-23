import { supabase } from './supabase';

export interface PlatformStats {
  activeFreelancers: number;
  completedProjects: number;
  satisfactionRate: number;
  totalPaidAmount: number;
  totalClients: number;
  totalServices: number;
  averageRating: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  serviceCount: number;
  color: string;
}

// Catégories par défaut avec icônes et couleurs
export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Développement Web', slug: 'dev-web', icon: '💻', description: 'Sites web, applications web, e-commerce', serviceCount: 0, color: 'emerald' },
  { id: '2', name: 'Développement Mobile', slug: 'dev-mobile', icon: '📱', description: 'Applications iOS, Android, React Native', serviceCount: 0, color: 'blue' },
  { id: '3', name: 'Design Graphique', slug: 'design', icon: '🎨', description: 'Logos, flyers, branding, UI/UX', serviceCount: 0, color: 'purple' },
  { id: '4', name: 'Marketing Digital', slug: 'marketing', icon: '📈', description: 'SEO, réseaux sociaux, publicité', serviceCount: 0, color: 'orange' },
  { id: '5', name: 'Rédaction & Contenu', slug: 'redaction', icon: '✍️', description: 'Articles, copywriting, blogs', serviceCount: 0, color: 'pink' },
  { id: '6', name: 'Vidéo & Animation', slug: 'video', icon: '🎬', description: 'Montage, motion design, 3D', serviceCount: 0, color: 'red' },
  { id: '7', name: 'Traduction', slug: 'traduction', icon: '🌍', description: 'Traduction, localisation, sous-titrage', serviceCount: 0, color: 'cyan' },
  { id: '8', name: 'Musique & Audio', slug: 'audio', icon: '🎵', description: 'Production, mixage, voix off', serviceCount: 0, color: 'indigo' },
  { id: '9', name: 'Photographie', slug: 'photo', icon: '📸', description: 'Shooting, retouche, packshot', serviceCount: 0, color: 'amber' },
  { id: '10', name: 'Consulting & Conseil', slug: 'consulting', icon: '💼', description: 'Business, stratégie, coaching', serviceCount: 0, color: 'slate' },
  { id: '11', name: 'Formation & Cours', slug: 'formation', icon: '🎓', description: 'E-learning, tutorat, mentorat', serviceCount: 0, color: 'teal' },
  { id: '12', name: 'Comptabilité & Finance', slug: 'finance', icon: '📊', description: 'Comptabilité, fiscalité, gestion', serviceCount: 0, color: 'green' },
  { id: '13', name: 'Juridique', slug: 'juridique', icon: '⚖️', description: 'Contrats, conseils juridiques', serviceCount: 0, color: 'gray' },
  { id: '14', name: 'Ressources Humaines', slug: 'rh', icon: '👥', description: 'Recrutement, paie, formation', serviceCount: 0, color: 'rose' },
  { id: '15', name: 'Data & IA', slug: 'data-ia', icon: '🤖', description: 'Machine learning, analyse de données', serviceCount: 0, color: 'violet' },
  { id: '16', name: 'Cybersécurité', slug: 'securite', icon: '🔒', description: 'Audit, protection, pentesting', serviceCount: 0, color: 'red' },
  { id: '17', name: 'Architecture & BTP', slug: 'architecture', icon: '🏗️', description: 'Plans, design intérieur, 3D', serviceCount: 0, color: 'stone' },
  { id: '18', name: 'E-commerce', slug: 'ecommerce', icon: '🛒', description: 'Boutiques en ligne, dropshipping', serviceCount: 0, color: 'lime' },
  { id: '19', name: 'Assistanat Virtuel', slug: 'assistanat', icon: '📋', description: 'Administration, saisie, organisation', serviceCount: 0, color: 'sky' },
  { id: '20', name: 'Jeux Vidéo', slug: 'gaming', icon: '🎮', description: 'Game design, développement, assets', serviceCount: 0, color: 'fuchsia' },
];

export const statsService = {
  /**
   * Récupère les statistiques globales de la plateforme
   */
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      // Compter les freelancers actifs (vérifiés ou avec au moins un service)
      const { count: freelancerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'freelancer')
        .eq('is_active', true);

      // Compter les clients actifs
      const { count: clientCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client')
        .eq('is_active', true);

      // Compter les projets/commandes terminés
      const { count: completedOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Compter les projets terminés
      const { count: completedProjectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Calculer le total des montants payés
      const { data: paidOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');

      const totalPaid = paidOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Calculer le taux de satisfaction (commandes complétées / total commandes)
      const { count: totalOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .not('status', 'eq', 'cancelled');

      const satisfactionRate = totalOrdersCount && completedOrdersCount
        ? Math.round((completedOrdersCount / totalOrdersCount) * 100)
        : 98; // Valeur par défaut

      // Compter les services actifs
      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Calculer la note moyenne des freelancers
      const { data: ratings } = await supabase
        .from('profiles')
        .select('rating_avg')
        .eq('role', 'freelancer')
        .gt('rating_count', 0);

      const averageRating = ratings && ratings.length > 0
        ? ratings.reduce((sum, p) => sum + (p.rating_avg || 0), 0) / ratings.length
        : 4.8; // Valeur par défaut

      // Total projets = commandes + projets
      const totalCompletedProjects = (completedOrdersCount || 0) + (completedProjectsCount || 0);

      return {
        activeFreelancers: freelancerCount || 0,
        completedProjects: totalCompletedProjects,
        satisfactionRate: satisfactionRate,
        totalPaidAmount: totalPaid,
        totalClients: clientCount || 0,
        totalServices: servicesCount || 0,
        averageRating: Math.round(averageRating * 10) / 10,
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        activeFreelancers: 0,
        completedProjects: 0,
        satisfactionRate: 98,
        totalPaidAmount: 0,
        totalClients: 0,
        totalServices: 0,
        averageRating: 4.8,
      };
    }
  },

  /**
   * Récupère toutes les catégories avec le nombre de services
   */
  async getCategories(): Promise<Category[]> {
    try {
      // Récupérer les catégories depuis la base de données
      const { data: dbCategories, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          icon,
          description,
          services:services(count)
        `)
        .eq('is_active', true)
        .order('name');

      if (error || !dbCategories || dbCategories.length === 0) {
        // Si pas de catégories en base, utiliser les catégories par défaut
        // et compter les services par catégorie_id
        return DEFAULT_CATEGORIES;
      }

      // Mapper les catégories avec le nombre de services
      const colors = ['emerald', 'blue', 'purple', 'orange', 'pink', 'red', 'cyan', 'indigo', 'amber', 'slate', 'teal', 'green', 'gray', 'rose', 'violet', 'lime', 'sky', 'fuchsia', 'stone', 'zinc'];
      
      return dbCategories.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
        icon: cat.icon || DEFAULT_CATEGORIES[index % DEFAULT_CATEGORIES.length]?.icon || '📁',
        description: cat.description || '',
        serviceCount: (cat.services as any)?.[0]?.count || 0,
        color: colors[index % colors.length],
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return DEFAULT_CATEGORIES;
    }
  },

  /**
   * Récupère les catégories populaires (avec le plus de services)
   */
  async getPopularCategories(limit: number = 6): Promise<Category[]> {
    try {
      const allCategories = await this.getCategories();
      
      // Trier par nombre de services et prendre les N premiers
      return allCategories
        .sort((a, b) => b.serviceCount - a.serviceCount)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching popular categories:', error);
      return DEFAULT_CATEGORIES.slice(0, limit);
    }
  },

  /**
   * Récupère les statistiques pour le dashboard d'un freelancer
   */
  async getFreelancerStats(userId: string) {
    try {
      // Revenus totaux
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .eq('freelancer_id', userId)
        .eq('status', 'completed');

      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      // Revenus du mois
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyRevenue = orders
        ?.filter(o => new Date(o.created_at) >= startOfMonth)
        .reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      // Projets actifs
      const { count: activeProjects } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('freelancer_id', userId)
        .in('status', ['pending', 'in_progress', 'revision_requested']);

      // Projets terminés
      const { count: completedProjects } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('freelancer_id', userId)
        .eq('status', 'completed');

      // Note moyenne
      const { data: profile } = await supabase
        .from('profiles')
        .select('rating_avg, rating_count')
        .eq('id', userId)
        .single();

      // Messages non lus
      const { count: unreadMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false);

      return {
        totalRevenue,
        monthlyRevenue,
        activeProjects: activeProjects || 0,
        completedProjects: completedProjects || 0,
        ratingAvg: profile?.rating_avg || 0,
        ratingCount: profile?.rating_count || 0,
        unreadMessages: unreadMessages || 0,
      };
    } catch (error) {
      console.error('Error fetching freelancer stats:', error);
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeProjects: 0,
        completedProjects: 0,
        ratingAvg: 0,
        ratingCount: 0,
        unreadMessages: 0,
      };
    }
  },

  /**
   * Récupère les statistiques pour le dashboard d'un client
   */
  async getClientStats(userId: string) {
    try {
      // Total dépensé
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('client_id', userId)
        .eq('status', 'completed');

      const totalSpent = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      // Projets actifs
      const { count: activeProjects } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', userId)
        .in('status', ['pending', 'in_progress', 'revision_requested']);

      // Projets terminés
      const { count: completedProjects } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', userId)
        .eq('status', 'completed');

      // Freelancers engagés (uniques)
      const { data: uniqueFreelancers } = await supabase
        .from('orders')
        .select('freelancer_id')
        .eq('client_id', userId);

      const freelancersHired = new Set(uniqueFreelancers?.map(o => o.freelancer_id)).size;

      return {
        totalSpent,
        activeProjects: activeProjects || 0,
        completedProjects: completedProjects || 0,
        freelancersHired,
      };
    } catch (error) {
      console.error('Error fetching client stats:', error);
      return {
        totalSpent: 0,
        activeProjects: 0,
        completedProjects: 0,
        freelancersHired: 0,
      };
    }
  },

  /**
   * Récupère les données pour les graphiques du dashboard
   */
  async getRevenueChartData(userId: string, role: 'freelancer' | 'client', months: number = 6) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const columnName = role === 'freelancer' ? 'freelancer_id' : 'client_id';

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq(columnName, userId)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Grouper par mois
      const monthlyData: Record<string, number> = {};
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

      // Initialiser tous les mois à 0
      for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (months - 1 - i));
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyData[key] = 0;
      }

      // Remplir avec les données réelles
      orders?.forEach(order => {
        const date = new Date(order.created_at);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (monthlyData.hasOwnProperty(key)) {
          monthlyData[key] += order.total_amount || 0;
        }
      });

      // Convertir en tableau pour le graphique
      return Object.entries(monthlyData).map(([key, value]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          month: monthNames[month],
          revenus: value,
        };
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return [];
    }
  },

  /**
   * Récupère la répartition des projets par catégorie
   */
  async getProjectsByCategory(userId: string, role: 'freelancer' | 'client') {
    try {
      const columnName = role === 'freelancer' ? 'freelancer_id' : 'client_id';

      const { data: orders } = await supabase
        .from('orders')
        .select(`
          service:services(category:categories(name))
        `)
        .eq(columnName, userId)
        .eq('status', 'completed');

      // Compter par catégorie
      const categoryCount: Record<string, number> = {};
      orders?.forEach(order => {
        const categoryName = (order as any).service?.category?.name || 'Autres';
        categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
      });

      // Convertir en pourcentages
      const total = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);
      const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

      return Object.entries(categoryCount).map(([name, count], index) => ({
        name,
        value: total > 0 ? Math.round((count / total) * 100) : 0,
        color: colors[index % colors.length],
      }));
    } catch (error) {
      console.error('Error fetching projects by category:', error);
      return [];
    }
  },

  /**
   * Récupère les services populaires (les mieux notés)
   */
  async getFeaturedServices(limit: number = 4) {
    try {
      const { data: services, error } = await supabase
        .from('services')
        .select(`
          id,
          title,
          description,
          price,
          delivery_time,
          images,
          rating_avg,
          rating_count,
          freelancer:profiles!freelancer_id(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          category:categories(
            id,
            name,
            slug
          )
        `)
        .eq('status', 'active')
        .order('rating_avg', { ascending: false })
        .order('rating_count', { ascending: false })
        .limit(limit);

      if (error || !services) {
        return [];
      }

      return services.map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        deliveryTime: service.delivery_time,
        image: service.images?.[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        rating: service.rating_avg || 0,
        reviews: service.rating_count || 0,
        freelancer: {
          id: (service.freelancer as any)?.id,
          name: `${(service.freelancer as any)?.first_name || ''} ${((service.freelancer as any)?.last_name || '').charAt(0)}.`,
          avatar: (service.freelancer as any)?.avatar_url,
        },
        category: {
          id: (service.category as any)?.id,
          name: (service.category as any)?.name,
          slug: (service.category as any)?.slug,
        },
      }));
    } catch (error) {
      console.error('Error fetching featured services:', error);
      return [];
    }
  },
};
