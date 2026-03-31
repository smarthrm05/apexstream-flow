import { useAppStore, Project } from '@/store/useAppStore';
import { Plus, Search, Filter, Users, Calendar, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  planning: 'bg-warning/10 text-warning',
  completed: 'bg-primary-light text-primary',
  'on-hold': 'bg-muted text-muted-foreground',
};

const impactColors: Record<string, string> = {
  high: 'bg-danger/10 text-danger',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-success/10 text-success',
};

export default function ProjectsPage() {
  const { projects, setActiveProject } = useAppStore();
  const navigate = useNavigate();

  const selectProject = (p: Project) => {
    setActiveProject(p);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your improvement projects</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors">
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search projects..." className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground" />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => selectProject(project)}
            className="kpi-card cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{project.description}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>

            <div className="flex gap-2 mb-4">
              <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full', statusColors[project.status])}>
                {project.status}
              </span>
              <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full', impactColors[project.impactLevel])}>
                {project.impactLevel} impact
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{project.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${project.progress}%` }} />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {project.membersCount} members</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {project.endDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
