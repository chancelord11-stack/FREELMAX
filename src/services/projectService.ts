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

  // ✅ AJOUTÉ - Fonction searchProjects
  async searchProjects(searchTerm: string): Promise<ProjectWithClient[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:profiles!client_id(*),
        category:categories!category_id(*)
      `)
      .eq('status', ProjectStatus.Published)
      .eq('visibility', 'public')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la recherche des projets:', error);
      return [];
    }
    
    return data || [];
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
      status: ProjectStatus.Published,
      published_at: new Date().toISOString(),
    });
  },
  
  // Assigner un freelancer à un projet
  async assignFreelancer(projectId: string, freelancerId: string): Promise<Project | null> {
    return this.updateProject(projectId, {
      status: ProjectStatus.Assigned,
      assigned_freelancer_id: freelancerId,
      assigned_at: new Date().toISOString(),
    });
  },
  
  // Démarrer un projet
  async startProject(projectId: string): Promise<Project | null> {
    return this.updateProject(projectId, {
      status: ProjectStatus.InProgress,
      started_at: new Date().toISOString(),
    });
  },
  
  // Compléter un projet
  async completeProject(projectId: string): Promise<Project | null> {
    return this.updateProject(projectId, {
      status: ProjectStatus.Completed,
      completed_at: new Date().toISOString(),
    });
  },
  
  // Annuler un projet
  async cancelProject(projectId: string): Promise<Project | null> {
    return this.updateProject(projectId, {
      status: ProjectStatus.Cancelled,
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

// ✅ AJOUTÉ - Export du proposalService
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
  async getFreelancerProposals(freelancerId: string): Promise<ProposalWithFreelancer[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        project:projects!project_id(*),
        freelancer:profiles!freelancer_id(*)
      `)
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
        project:projects!project_id(*),
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
      .insert({
        ...proposal,
        status: ProposalStatus.Pending,
        submitted_at: new Date().toISOString(),
      })
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
      status: ProposalStatus.Accepted,
      reviewed_at: new Date().toISOString(),
    });
  },
  
  // Rejeter une proposition
  async rejectProposal(proposalId: string, notes?: string): Promise<Proposal | null> {
    return this.updateProposal(proposalId, {
      status: ProposalStatus.Rejected,
      client_notes: notes || null,
      reviewed_at: new Date().toISOString(),
    });
  },
  
  // Retirer une proposition
  async withdrawProposal(proposalId: string): Promise<Proposal | null> {
    return this.updateProposal(proposalId, {
      status: ProposalStatus.Withdrawn,
    });
  },
  
  // Mettre en shortlist une proposition
  async shortlistProposal(proposalId: string): Promise<Proposal | null> {
    return this.updateProposal(proposalId, {
      status: ProposalStatus.Shortlisted,
    });
  },
};
