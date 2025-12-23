import { supabase } from './supabase';
import { Profile } from '../types';

export const profileService = {
  // Récupérer un profil par ID
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
    
    return data;
  },
  
  // Récupérer plusieurs profils
  async getProfiles(userIds: string[]): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    
    if (error) {
      console.error('Erreur lors de la récupération des profils:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Mettre à jour un profil
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return null;
    }
    
    return data;
  },
  
  // Rechercher des freelancers
  async searchFreelancers(filters: {
    skills?: string[];
    level?: string;
    minRating?: number;
    available?: boolean;
    country?: string;
    city?: string;
  }): Promise<Profile[]> {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'freelancer');
    
    if (filters.skills && filters.skills.length > 0) {
      query = query.contains('skills', filters.skills);
    }
    
    if (filters.level) {
      query = query.eq('level', filters.level);
    }
    
    if (filters.minRating) {
      query = query.gte('rating_avg', filters.minRating);
    }
    
    if (filters.available !== undefined) {
      query = query.eq('available', filters.available);
    }
    
    if (filters.country) {
      query = query.eq('country', filters.country);
    }
    
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    
    const { data, error } = await query.order('rating_avg', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la recherche de freelancers:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer les top freelancers
  async getTopFreelancers(limit: number = 10): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'freelancer')
      .eq('is_verified', true)
      .order('rating_avg', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Erreur lors de la récupération des top freelancers:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Mettre à jour le dernier login
  async updateLastLogin(userId: string): Promise<void> {
    await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  },
  
  // Mettre à jour la dernière activité
  async updateLastActivity(userId: string): Promise<void> {
    await supabase
      .from('profiles')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', userId);
  },
};
