import React, { useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import { ProjectWithClient } from '../types';
import { formatCurrency, formatRelativeDate, getInitials } from '../utils/format';
import { Search, MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

interface ProjectsProps {
  onViewProject: (projectId: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ onViewProject }) => {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  
  // Debounce pour ne pas appeler l'API à chaque frappe
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadProjects();
  }, [debouncedSearch, budgetMin, budgetMax]); // Recharge quand ces valeurs changent

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getPublicProjects({
        search: debouncedSearch,
        budget_min: budgetMin ? Number(budgetMin) : undefined,
        budget_max: budgetMax ? Number(budgetMax) : undefined,
      });
      setProjects(data);
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Projets disponibles</h1>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
                type="text" 
                placeholder="Rechercher un projet (ex: site web, logo...)" 
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="md:col-span-3">
            <input 
                type="number" 
                placeholder="Budget Min" 
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
            />
        </div>
        <div className="md:col-span-3">
             <input 
                type="number" 
                placeholder="Budget Max" 
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
            />
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-neutral-300">
            <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500">Aucun projet ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(project => (
            <div key={project.id} onClick={() => onViewProject(project.id)} className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-lg text-neutral-900 group-hover:text-primary-600 transition-colors">{project.title}</h3>
                 <span className="font-bold text-primary-600 whitespace-nowrap">{formatCurrency(project.budget_min || 0)}</span>
              </div>
              <p className="text-neutral-600 text-sm line-clamp-2 mb-4">{project.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {formatRelativeDate(project.created_at)}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3"/> {project.proposals_count || 0} offres</span>
                <div className="flex items-center gap-1 ml-auto">
                    <div className="w-5 h-5 rounded-full bg-neutral-200 text-[10px] flex items-center justify-center font-bold">
                        {getInitials(project.client?.first_name, project.client?.last_name)}
                    </div>
                    <span>{project.client?.first_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;