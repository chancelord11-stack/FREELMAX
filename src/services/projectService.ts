import { supabase } from './supabase';
import { Project, ProjectWithClient, Proposal, ProposalWithFreelancer } from '../types';

export const projectService = {
  // Récupérer tous les projets publics
  async getPublicProjects(limit?: number): Promise<ProjectWithClient[]> {
    let query = supabase
      .from('projects')
      .select(`
        *,
        client:profiles!client_id(*)
      `)
      .eq('visibility', 'public')
      .in('status', ['published', 'bidding'])
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer un projet par ID
  async getProjectById(projectId: string): Promise<ProjectWithClient | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:profiles!client_id(*)
      `)
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération du projet:', error);
      return null;
    }
    
    return data;
  },
  
  // Récupérer les projets d'un client
  async getClientProjects(clientId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des projets du client:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Rechercher des projets
  async searchProjects(filters: {
    query?: string;
    categoryId?: string;
    budgetMin?: number;
    budgetMax?: number;
    skills?: string[];
    locationType?: string;
    experienceLevel?: string;
  }): Promise<ProjectWithClient[]> {
    let query = supabase
      .from('projects')
      .select(`
        *,
        client:profiles!client_id(*)
      `)
      .eq('visibility', 'public')
      .in('status', ['published', 'bidding']);
    
    if (filters.query) {
      query = query.textSearch('search_vector', filters.query);
    }
    
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    
    if (filters.budgetMin !== undefined) {
      query = query.gte('budget_min', filters.budgetMin);
    }
    
    if (filters.budgetMax !== undefined) {
      query = query.lte('budget_max', filters.budgetMax);
    }
    
    if (filters.skills && filters.skills.length > 0) {
      query = query.overlaps('skills_required', filters.skills);
    }
    
    if (filters.locationType) {
      query = query.eq('location_type', filters.locationType);
    }
    
    if (filters.experienceLevel) {
      query = query.eq('experience_level', filters.experienceLevel);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la recherche de projets:', error);
      return [];
    }
    
    return data || [];
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
      status: 'published',
      published_at: new Date().toISOString(),
    });
  },
  
  // Incrémenter les vues d'un projet
  async incrementViews(projectId: string): Promise<void> {
    await supabase.rpc('increment_project_views', { project_id: projectId });
  },
};

export const proposalService = {
  // Récupérer les propositions d'un projet
  async getProjectProposals(projectId: string): Promise<ProposalWithFreelancer[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        freelancer:profiles!freelancer_id(*)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des propositions:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer les propositions d'un freelancer
  async getFreelancerProposals(freelancerId: string): Promise<Proposal[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des propositions:', error);
      return [];
    }
    
    return data || [];
  },
  
  // Récupérer une proposition par ID
  async getProposalById(proposalId: string): Promise<ProposalWithFreelancer | null> {
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        freelancer:profiles!freelancer_id(*)
      `)
      .eq('id', proposalId)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération de la proposition:', error);
      return null;
    }
    
    return data;
  },
  
  // Créer une nouvelle proposition
  async createProposal(proposal: Partial<Proposal>): Promise<Proposal | null> {
    const { data, error } = await supabase
      .from('proposals')
      .insert(proposal)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création de la proposition:', error);
      return null;
    }
    
    return data;
  },
  
  // Mettre à jour une proposition
  async updateProposal(proposalId: string, updates: Partial<Proposal>): Promise<Proposal | null> {
    const { data, error } = await supabase
      .from('proposals')
      .update(updates)
      .eq('id', proposalId)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour de la proposition:', error);
      return null;
    }
    
    return data;
  },
  
  // Accepter une proposition
  async acceptProposal(proposalId: string): Promise<Proposal | null> {
    return this.updateProposal(proposalId, {
      status: 'accepted',
      responded_at: new Date().toISOString(),
    });
  },
  
  // Rejeter une proposition
  async rejectProposal(proposalId: string): Promise<Proposal | null> {
    return this.updateProposal(proposalId, {
      status: 'rejected',
      responded_at: new Date().toISOString(),
    });
  },
  
  // Retirer une proposition
  async withdrawProposal(proposalId: string): Promise<Proposal | null> {
    return this.updateProposal(proposalId, {
      status: 'withdrawn',
    });
  },
};
