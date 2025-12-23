import { supabase } from './supabase';
import { Service, ServiceWithFreelancer } from '../types';

export const serviceService = {
  // Récupérer tous les services actifs
  async getActiveServices(limit?: number): Promise<ServiceWithFreelancer[]> {
    let query = supabase
      .from('services')
      .select(`
        *,
        freelancer:profiles(*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur lors de la récupération des services:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer un service par ID
  async getServiceById(serviceId: string): Promise<ServiceWithFreelancer | null> {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        freelancer:profiles(*)
      `)
      .eq('id', serviceId)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération du service:', error);
      return null;
    }
    
    return data;
  },
  
  // Récupérer un service par slug
  async getServiceBySlug(slug: string): Promise<ServiceWithFreelancer | null> {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        freelancer:profiles(*)
      `)
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération du service:', error);
      return null;
    }
    
    return data;
  },
  
  // Récupérer les services d'un freelancer
  async getServicesByFreelancer(freelancerId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des services du freelancer:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Rechercher des services
  async searchServices(filters: {
    query?: string;
    categoryId?: string;
    subcategoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    minRating?: number;
    deliveryDays?: number;
  }): Promise<ServiceWithFreelancer[]> {
    let query = supabase
      .from('services')
      .select(`
        *,
        freelancer:profiles(*)
      `)
      .eq('status', 'active');
    
    if (filters.query) {
      // Recherche par texte (utilise le search_vector)
      query = query.textSearch('search_vector', filters.query);
    }
    
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    
    if (filters.subcategoryId) {
      query = query.eq('subcategory_id', filters.subcategoryId);
    }
    
    if (filters.minPrice !== undefined) {
      query = query.gte('price_basic', filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      query = query.lte('price_basic', filters.maxPrice);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }
    
    if (filters.minRating !== undefined) {
      query = query.gte('rating_avg', filters.minRating);
    }
    
    if (filters.deliveryDays !== undefined) {
      query = query.lte('delivery_days', filters.deliveryDays);
    }
    
    const { data, error } = await query.order('rating_avg', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la recherche de services:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer les services populaires
  async getPopularServices(limit: number = 10): Promise<ServiceWithFreelancer[]> {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        freelancer:profiles(*)
      `)
      .eq('status', 'active')
      .order('orders_count', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Erreur lors de la récupération des services populaires:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer les services en vedette
  async getFeaturedServices(limit: number = 8): Promise<ServiceWithFreelancer[]> {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        freelancer:profiles(*)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('rating_avg', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Erreur lors de la récupération des services en vedette:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Incrémenter les vues d'un service
  async incrementViews(serviceId: string): Promise<void> {
    await supabase.rpc('increment_service_views', { service_id: serviceId });
  },
  
  // Incrémenter les clics d'un service
  async incrementClicks(serviceId: string): Promise<void> {
    await supabase.rpc('increment_service_clicks', { service_id: serviceId });
  },
  
  // Créer un nouveau service
  async createService(service: Partial<Service>): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création du service:', error);
      return null;
    }
    
    return data;
  },
  
  // Mettre à jour un service
  async updateService(serviceId: string, updates: Partial<Service>): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour du service:', error);
      return null;
    }
    
    return data;
  },
  
  // Supprimer un service (soft delete)
  async deleteService(serviceId: string): Promise<boolean> {
    const { error } = await supabase
      .from('services')
      .update({ status: 'deleted' })
      .eq('id', serviceId);
    
    if (error) {
      console.error('Erreur lors de la suppression du service:', error);
      return false;
    }
    
    return true;
  },
};
