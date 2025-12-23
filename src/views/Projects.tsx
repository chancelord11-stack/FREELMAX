import React, { useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import { ProjectWithClient } from '../types';
import { formatCurrency, formatRelativeDate, getInitials } from '../utils/format';
import { Search, Filter, MapPin, Clock, DollarSign, Briefcase, Users, TrendingUp } from 'lucide-react';

interface ProjectsProps {
  onViewProject: (projectId: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ onViewProject }) => {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    budgetMin: '',
    budgetMax: '',
    locationType: '',
  });

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.searchProjects({
        query: filters.search || undefined,
        budgetMin: filters.budgetMin ? Number(filters.budgetMin) : undefined,
        budgetMax: filters.budgetMax ? Number(filters.budgetMax) : undefined,
        locationType: filters.locationType || undefined,
      });
      setProjects(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">Projets</h1>
        <p className="text-neutral-600">Trouvez des projets qui correspondent à vos compétences</p>
      </div>

      {/* Filtres */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher des projets..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="input"
            value={filters.locationType}
            onChange={(e) => setFilters({ ...filters, locationType: e.target.value })}
          >
            <option value="">Tous les types</option>
            <option value="remote">À distance</option>
            <option value="onsite">Sur site</option>
            <option value="hybrid">Hybride</option>
          </select>
          <button className="btn btn-secondary">
            <Filter className="w-4 h-4" />
            Plus de filtres
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Briefcase, label: 'Projets actifs', value: projects.length, color: 'blue' },
          { icon: DollarSign, label: 'Budget moyen', value: '50K FCFA', color: 'green' },
          { icon: Users, label: 'Propositions moy.', value: '8', color: 'purple' },
          { icon: TrendingUp, label: 'Nouveaux aujourd\'hui', value: '12', color: 'orange' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-neutral-600">{stat.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Liste des projets */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="bg-neutral-200 h-6 rounded mb-3 w-3/4"></div>
              <div className="bg-neutral-200 h-4 rounded mb-2 w-full"></div>
              <div className="bg-neutral-200 h-4 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} onClick={() => onViewProject(project.id)} />
          ))}
          {projects.length === 0 && (
            <div className="card p-12 text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
              <h3 className="text-xl font-semibold mb-2">Aucun projet trouvé</h3>
              <p className="text-neutral-600">Modifiez vos filtres ou revenez plus tard</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProjectCard: React.FC<{ project: ProjectWithClient; onClick: () => void }> = ({ project, onClick }) => {
  const getLocationBadge = () => {
    const colors = {
      remote: 'bg-blue-100 text-blue-700',
      onsite: 'bg-green-100 text-green-700',
      hybrid: 'bg-purple-100 text-purple-700',
    };
    const labels = {
      remote: 'À distance',
      onsite: 'Sur site',
      hybrid: 'Hybride',
    };
    return { color: colors[project.location_type], label: labels[project.location_type] };
  };

  const location = getLocationBadge();

  return (
    <div onClick={onClick} className="card p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2 hover:text-primary-600 transition-colors">
            {project.title}
          </h3>
          <p className="text-neutral-600 line-clamp-2 mb-3">{project.description}</p>
        </div>
        <span className={`badge ${location.color} ml-4`}>
          <MapPin className="w-3 h-3" />
          {location.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {project.skills_required.slice(0, 5).map((skill, i) => (
          <span key={i} className="badge badge-neutral">
            {skill}
          </span>
        ))}
        {project.skills_required.length > 5 && (
          <span className="badge badge-neutral">+{project.skills_required.length - 5}</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-6 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium">
              {project.budget_type === 'fixed' && formatCurrency(project.budget_min || 0)}
              {project.budget_type === 'range' && `${formatCurrency(project.budget_min || 0)} - ${formatCurrency(project.budget_max || 0)}`}
              {project.budget_type === 'hourly' && `${formatCurrency(project.hourly_rate || 0)}/h`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatRelativeDate(project.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{project.proposals_count} propositions</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="avatar avatar-sm">
            {getInitials(project.client.first_name, project.client.last_name)}
          </div>
          <span className="text-sm font-medium">{project.client.first_name}</span>
        </div>
      </div>
    </div>
  );
};

export default Projects;
