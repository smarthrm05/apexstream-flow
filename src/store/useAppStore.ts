import { create } from 'zustand';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate: string;
  progress: number;
  impactLevel: 'high' | 'medium' | 'low';
  createdBy: string;
  membersCount: number;
}

interface AppState {
  activeProjectId: string | null;
  activeProject: Project | null;
  projects: Project[];
  sidebarOpen: boolean;
  setActiveProject: (project: Project) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Assembly Line Optimization',
    description: 'Reduce cycle time and improve throughput on Line A',
    status: 'active',
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    progress: 65,
    impactLevel: 'high',
    createdBy: 'Ahmad Rashid',
    membersCount: 8,
  },
  {
    id: '2',
    name: 'Warehouse Layout Redesign',
    description: 'Optimize material flow and reduce waste in storage',
    status: 'active',
    startDate: '2026-02-01',
    endDate: '2026-08-15',
    progress: 30,
    impactLevel: 'medium',
    createdBy: 'Sarah Chen',
    membersCount: 5,
  },
  {
    id: '3',
    name: 'Quality Control Enhancement',
    description: 'Implement SPC and reduce defect rate by 40%',
    status: 'planning',
    startDate: '2026-04-01',
    endDate: '2026-09-30',
    progress: 10,
    impactLevel: 'high',
    createdBy: 'Ahmad Rashid',
    membersCount: 6,
  },
];

export const useAppStore = create<AppState>((set) => ({
  activeProjectId: '1',
  activeProject: mockProjects[0],
  projects: mockProjects,
  sidebarOpen: true,
  setActiveProject: (project) => set({ activeProjectId: project.id, activeProject: project }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
