import { supabase } from './supabase';
import { Project, ProjectWithDetails, ProjectWithClient, ProjectStatus, Proposal, ProposalWithFreelancer, ProposalStatus } from '../types';

export const projectService = {
  // Récupérer tous les projets publics
  async getPublicProjects(filters?: {
    category_id?: string;
    budget_min?: number;
    budget_max?: number;
    skills?: string[];
    search?: string;
  }): Promise<ProjectWithClient[]> {
    let query = supabase
      .from('projects')
      .select(`
        *,
        client:profiles!client_id(*),
        category:categories!category_id(*),
        proposals(count)
      `)
      .eq('status', ProjectStatus.Published)
      .eq('visibility', 'public');
    
    if (filters?.category_id) query = query.eq('category_id', filters.category_id);
    if (filters?.budget_min) query = query.gte('budget_min', filters.budget_min);
    if (filters?.budget_max) query = query.lte('budget_max', filters.budget_max);
    if (filters?.skills?.length) query = query.overlaps('required_skills', filters.skills);
    if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      return [];
    }
    return data || [];
  },

  // ✅ AJOUTÉ pour compatibilité
  async searchProjects(params: any): Promise<ProjectWithClient[]> {
    // Redirige vers getPublicProjects avec le bon format
    return this.getPublicProjects({
        search: typeof params === 'string' ? params : params?.query,
        budget_min: params?.budgetMin,
        budget_max: params?.budgetMax
    });
  },

  // Récupérer les projets d'un client
  async getClientProjects(clientId: string): Promise<ProjectWithClient[]> {
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
  
  async createProject(project: Partial<Project>): Promise<Project | null> {
    const { data, error } = await supabase.from('projects').insert(project).select().single();
    if (error) return null;
    return data;
  },
  
  async incrementViews(projectId: string): Promise<void> {
    await supabase.rpc('increment_project_views', { p_project_id: projectId });
  }
};

// ✅ AJOUTÉ: Export manquant
export const proposalService = {
  async getProjectProposals(projectId: string): Promise<ProposalWithFreelancer[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select(`*, freelancer:profiles!freelancer_id(*)`)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },
  
  async createProposal(proposal: Partial<Proposal>): Promise<Proposal | null> {
    const { data, error } = await supabase
      .from('proposals')
      .insert({ ...proposal, status: ProposalStatus.Pending, submitted_at: new Date().toISOString() })
      .select().single();
    if (error) return null;
    return data;
  }
};