import { supabase } from './supabase';
import { Project, ProjectWithDetails, ProjectStatus } from '../types';

export const projectService = {
  // Récupérer tous les projets publics
  async getPublicProjects(filters?: {
    category_id?: string;
    budget_min?: number;
    budget_max?: number;
    skills?: string[];
    search?: string;
  }): Promise<ProjectWithDetails[]> {
    let query = supabase
      .from('projects')
      .select(`
        *,
        client:profiles!client_id(*),
        category:categories!category_id(*),
        proposals(count)
      `)
      .eq('status', ProjectStatus.Published)  // ✅ Utilise l'enum
      .eq('visibility', 'public');
    
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    
    if (filters?.budget_min) {
      query = query.gte('budget_min', filters.budget_min);
    }
    
    if (filters?.budget_max) {
      query = query.lte('budget_max', filters.budget_max);
    }
    
    if (filters?.skills?.length) {
      query = query.overlaps('required_skills', filters.skills);
    }
    
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer les projets d'un client
  async getClientProjects(clientId: string): Promise<ProjectWithDetails[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:profiles!client_id(*),
        category:categories!category_id(*),
        proposals(count),
        assigned_freelancer:profiles!assigned_freelancer_id(*)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des projets du client:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer un projet par ID
  async getProjectById(projectId: string): Promise<ProjectWithDetails | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:profiles!client_id(*),
        category:categories!category_id(*),
        subcategory:categories!subcategory_id(*),
        proposals(*),
        assigned_freelancer:profiles!assigned_freelancer_id(*)
      `)
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération du projet:', error);
      return null;
    }
    
    return data;
  },
  
  // Créer un nouveau projet
  async createProject(project: Partial<Project>): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création du projet:', error);
      return null;
    }
    
    return data;
  },
  
  // Mettre à jour un projet
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      return null;
    }
    
    return data;
  },
  
  // Publier un projet
  async publishProject(projectId: string): Promise<Project | null> {
    return this.updateProject(projectId, {
      status: ProjectStatus.Published,  // ✅ Utilise l'enum au lieu de la string
      published_at: new Date().toISOString(),
    });
  },
  
  // Assigner un freelancer à un projet
  async assignFreelancer(projectId: string, freelancerId: string): Promise<Project | null> {
    return this.updateProject(projectId, {
      status: ProjectStatus.Assigned,  // ✅ Utilise l'enum
      assigned_freelancer_id: freelancerId,
      assigned_at: new Date().toISOString(),
    });
  },
  
  // Démarrer un projet
  async startProject(projectId: string): Promise<Project | null> {
    return this.updateProject(projectId, {
      status: ProjectStatus.InProgress,  // ✅ Utilise l'enum
      started_at: new Date().toISOString(),
    });
  },
  
  // Compléter un projet
  async completeProject(projectId: string): Promise<Project | null> {
    return this.updateProject(projectId, {
      status: ProjectStatus.Completed,  // ✅ Utilise l'enum
      completed_at: new Date().toISOString(),
    });
  },
  
  // Annuler un projet
  async cancelProject(projectId: string): Promise<Project | null> {
    return this.updateProject(projectId, {
      status: ProjectStatus.Cancelled,  // ✅ Utilise l'enum
    });
  },
  
  // Supprimer un projet (soft delete)
  async deleteProject(projectId: string): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      return false;
    }
    
    return true;
  },
  
  // Incrémenter les vues d'un projet
  async incrementViews(projectId: string): Promise<void> {
    await supabase.rpc('increment_project_views', { p_project_id: projectId });
  },
};
