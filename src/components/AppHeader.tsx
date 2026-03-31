import { Bell, Search, ChevronDown, User, Menu } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

export function AppHeader() {
  const { activeProject, projects, setActiveProject, sidebarOpen, toggleSidebar } = useAppStore();
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 transition-all duration-300',
        sidebarOpen ? 'left-64' : 'left-16'
      )}
    >
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="md:hidden p-2 rounded-md hover:bg-muted">
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Project Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <div className={cn(
              'h-2 w-2 rounded-full',
              activeProject?.status === 'active' ? 'bg-success' : activeProject?.status === 'planning' ? 'bg-warning' : 'bg-muted-foreground'
            )} />
            <span className="max-w-[200px] truncate">{activeProject?.name || 'Select Project'}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {projectDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 rounded-lg border border-border bg-card shadow-lg animate-fade-in z-50">
              <div className="p-2">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">Projects</p>
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => { setActiveProject(project); setProjectDropdownOpen(false); }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                      project.id === activeProject?.id ? 'bg-primary-light text-primary font-medium' : 'hover:bg-muted'
                    )}
                  >
                    <div className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      project.status === 'active' ? 'bg-success' : project.status === 'planning' ? 'bg-warning' : 'bg-muted-foreground'
                    )} />
                    <div className="text-left">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.membersCount} members · {project.progress}%</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search..."
            className="bg-transparent text-sm outline-none w-40 placeholder:text-muted-foreground"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden md:block text-sm font-medium">Ahmad R.</span>
        </button>
      </div>
    </header>
  );
}
