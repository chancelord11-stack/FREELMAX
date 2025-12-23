import React, { useEffect, useState } from 'react';
import { projectService, proposalService } from '../services/projectService';
import { ProjectWithClient, ProposalWithFreelancer } from '../types';
import { formatCurrency, formatRelativeDate, getInitials, getStatusColor, getStatusLabel } from '../utils/format';
import { ArrowLeft, MapPin, DollarSign, Clock, Calendar, Users, Send, FileText } from 'lucide-react';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<ProjectWithClient | null>(null);
  const [proposals, setProposals] = useState<ProposalWithFreelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    coverLetter: '',
    budget: '',
    timeline: '',
  });

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      const [projectData, proposalsData] = await Promise.all([
        projectService.getProjectById(projectId),
        proposalService.getProjectProposals(projectId),
      ]);
      setProject(projectData);
      setProposals(proposalsData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await proposalService.createProposal({
        project_id: projectId,
        freelancer_id: 'current-user-id', // À remplacer par l'ID réel
        cover_letter: proposalData.coverLetter,
        proposed_budget: Number(proposalData.budget),
        proposed_timeline: Number(proposalData.timeline),
      });
      setShowProposalForm(false);
      loadProjectData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading || !project) {
    return <div className="flex justify-center py-20"><div className="spinner w-12 h-12"></div></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onBack} className="btn btn-secondary">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête du projet */}
          <div className="card p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{project.title}</h1>
                <div className="flex flex-wrap gap-3">
                  <span className={`badge ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                  <span className="badge badge-neutral">
                    <MapPin className="w-3 h-3" />
                    {project.location_type === 'remote' && 'À distance'}
                    {project.location_type === 'onsite' && 'Sur site'}
                    {project.location_type === 'hybrid' && 'Hybride'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {project.budget_type === 'fixed' && formatCurrency(project.budget_min || 0)}
                  {project.budget_type === 'range' && `${formatCurrency(project.budget_min || 0)}`}
                  {project.budget_type === 'hourly' && `${formatCurrency(project.hourly_rate || 0)}/h`}
                </div>
                <div className="text-sm text-neutral-600">Budget</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{project.proposals_count}</div>
                <div className="text-sm text-neutral-600">Propositions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{project.estimated_duration || 'Flexible'}</div>
                <div className="text-sm text-neutral-600">Durée</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{formatRelativeDate(project.created_at)}</div>
                <div className="text-sm text-neutral-600">Publié</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Description du projet
            </h2>
            <div className="prose max-w-none text-neutral-700 whitespace-pre-line">
              {project.description}
            </div>
          </div>

          {/* Compétences requises */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Compétences requises</h2>
            <div className="flex flex-wrap gap-2">
              {project.skills_required.map((skill, i) => (
                <span key={i} className="badge badge-primary text-sm px-4 py-2">
                  {skill}
                </span>
              ))}
            </div>
            {project.experience_level && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <span className="font-medium">Niveau requis: </span>
                <span className="text-blue-700">
                  {project.experience_level === 'entry' && 'Débutant'}
                  {project.experience_level === 'intermediate' && 'Intermédiaire'}
                  {project.experience_level === 'expert' && 'Expert'}
                </span>
              </div>
            )}
          </div>

          {/* Propositions (si client) */}
          {proposals.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Propositions reçues ({proposals.length})
              </h2>
              <div className="space-y-4">
                {proposals.map(proposal => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6 space-y-6">
            {/* Client info */}
            <div>
              <h3 className="font-semibold mb-4">À propos du client</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="avatar avatar-lg">
                  {getInitials(project.client.first_name, project.client.last_name)}
                </div>
                <div>
                  <div className="font-semibold">{project.client.first_name} {project.client.last_name}</div>
                  <div className="text-sm text-neutral-600">
                    {project.client.completed_projects} projets complétés
                  </div>
                </div>
              </div>
              {project.client.company_name && (
                <p className="text-sm text-neutral-600">
                  <span className="font-medium">Entreprise:</span> {project.client.company_name}
                </p>
              )}
            </div>

            {/* CTA */}
            {!showProposalForm ? (
              <button onClick={() => setShowProposalForm(true)} className="btn btn-primary w-full">
                <Send className="w-4 h-4" />
                Soumettre une proposition
              </button>
            ) : (
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <h3 className="font-semibold">Votre proposition</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Lettre de motivation</label>
                  <textarea
                    className="input h-32"
                    value={proposalData.coverLetter}
                    onChange={(e) => setProposalData({ ...proposalData, coverLetter: e.target.value })}
                    required
                    placeholder="Expliquez pourquoi vous êtes le meilleur choix..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Budget proposé (FCFA)</label>
                  <input
                    type="number"
                    className="input"
                    value={proposalData.budget}
                    onChange={(e) => setProposalData({ ...proposalData, budget: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Délai (jours)</label>
                  <input
                    type="number"
                    className="input"
                    value={proposalData.timeline}
                    onChange={(e) => setProposalData({ ...proposalData, timeline: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary flex-1">Envoyer</button>
                  <button type="button" onClick={() => setShowProposalForm(false)} className="btn btn-secondary flex-1">
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProposalCard: React.FC<{ proposal: ProposalWithFreelancer }> = ({ proposal }) => (
  <div className="p-4 border-2 border-neutral-100 rounded-xl hover:border-primary-200 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="avatar avatar-md">
          {getInitials(proposal.freelancer.first_name, proposal.freelancer.last_name)}
        </div>
        <div>
          <div className="font-semibold">{proposal.freelancer.first_name} {proposal.freelancer.last_name}</div>
          <div className="text-sm text-neutral-600">{proposal.freelancer.headline}</div>
        </div>
      </div>
      <span className={`badge ${getStatusColor(proposal.status)}`}>
        {getStatusLabel(proposal.status)}
      </span>
    </div>
    <p className="text-sm text-neutral-700 mb-3 line-clamp-3">{proposal.cover_letter}</p>
    <div className="flex items-center gap-4 text-sm">
      <span className="flex items-center gap-1">
        <DollarSign className="w-4 h-4" />
        <strong>{formatCurrency(proposal.proposed_budget)}</strong>
      </span>
      <span className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        <strong>{proposal.proposed_timeline} jours</strong>
      </span>
    </div>
  </div>
);

export default ProjectDetail;
