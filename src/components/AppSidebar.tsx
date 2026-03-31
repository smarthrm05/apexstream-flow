import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import {
  LayoutDashboard, FolderKanban, ClipboardList, Footprints,
  GitBranch, Search, Target, ListChecks, Columns3, RotateCcw,
  BarChart3, MessageSquare, FileText, Settings, ChevronLeft,
  ChevronRight, Factory
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: FolderKanban, label: 'Projects', path: '/projects' },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { icon: Footprints, label: 'Gemba Walk', path: '/gemba-walk' },
      { icon: GitBranch, label: 'Value Stream Map', path: '/vsm' },
      { icon: Search, label: 'Root Cause', path: '/root-cause' },
      { icon: Target, label: 'Fishbone', path: '/fishbone' },
      { icon: ListChecks, label: 'Improvement Plan', path: '/improvement' },
      { icon: Columns3, label: 'Kanban Board', path: '/kanban' },
      { icon: RotateCcw, label: 'PDCA Cycle', path: '/pdca' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
      { icon: FileText, label: 'Reports', path: '/reports' },
    ],
  },
  {
    label: 'Collaborate',
    items: [
      { icon: MessageSquare, label: 'Team Chat', path: '/chat' },
      { icon: ClipboardList, label: 'Documents', path: '/documents' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
  },
];

export function AppSidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
          <Factory className="h-5 w-5 text-sidebar-accent-foreground" />
        </div>
        {sidebarOpen && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-sidebar-primary">ProFlow</h1>
            <p className="text-[10px] text-sidebar-muted">Manufacturing Suite</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {sidebarOpen && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span className="animate-fade-in">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex h-10 items-center justify-center border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
      >
        {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </aside>
  );
}
