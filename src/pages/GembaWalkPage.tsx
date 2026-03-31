import { useState } from 'react';
import { Plus, Search, Filter, Camera, MapPin, Clock, Eye } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const wasteCategories = [
  'Overproduction', 'Waiting', 'Transport', 'Over-processing',
  'Inventory', 'Motion', 'Defects',
];

const observations = [
  { id: 1, date: '2026-03-30', location: 'Assembly Line A', process: 'Welding', waste: 'Waiting', description: 'Operators waiting 12 min for parts from upstream station', createdBy: 'Ahmad R.', hasPhoto: true },
  { id: 2, date: '2026-03-29', location: 'Warehouse B', process: 'Material Handling', waste: 'Transport', description: 'Forklift making 3 unnecessary trips due to layout', createdBy: 'Sarah C.', hasPhoto: false },
  { id: 3, date: '2026-03-28', location: 'Packing Area', process: 'Packing', waste: 'Motion', description: 'Excessive reaching — tools stored too far from station', createdBy: 'James L.', hasPhoto: true },
  { id: 4, date: '2026-03-27', location: 'Quality Lab', process: 'Inspection', waste: 'Over-processing', description: 'Double inspection on non-critical parts', createdBy: 'Mike R.', hasPhoto: false },
  { id: 5, date: '2026-03-26', location: 'Assembly Line B', process: 'Assembly', waste: 'Defects', description: 'Misaligned bracket causing 5% rework', createdBy: 'Ahmad R.', hasPhoto: true },
];

const wasteCategoryColors: Record<string, string> = {
  Overproduction: 'bg-chart-1/10 text-chart-1',
  Waiting: 'bg-warning/10 text-warning',
  Transport: 'bg-chart-5/10 text-chart-5',
  'Over-processing': 'bg-primary-light text-primary',
  Inventory: 'bg-chart-3/10 text-chart-3',
  Motion: 'bg-success/10 text-success',
  Defects: 'bg-danger/10 text-danger',
};

export default function GembaWalkPage() {
  const { activeProject } = useAppStore();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gemba Walk</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeProject?.name} — Observation Log</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" /> New Observation
        </button>
      </div>

      {/* New observation form */}
      {showForm && (
        <div className="kpi-card space-y-4 animate-fade-in">
          <h3 className="font-semibold text-foreground">Record Observation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
              <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-ring" placeholder="e.g. Assembly Line A" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Process</label>
              <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-ring" placeholder="e.g. Welding" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Waste Category</label>
              <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-ring">
                <option value="">Select category...</option>
                {wasteCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Photo</label>
              <button className="flex items-center gap-2 rounded-lg border border-dashed border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors w-full">
                <Camera className="h-4 w-4" /> Upload photo
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
            <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-ring h-20 resize-none" placeholder="Describe what you observed..." />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">Cancel</button>
            <button className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors">Save Observation</button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search observations..." className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground" />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      {/* Observations table */}
      <div className="kpi-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Process</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Waste Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">By</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Photo</th>
              </tr>
            </thead>
            <tbody>
              {observations.map((obs) => (
                <tr key={obs.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3 w-3" /> {obs.date}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-muted-foreground" /> {obs.location}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{obs.process}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full', wasteCategoryColors[obs.waste])}>
                      {obs.waste}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{obs.description}</td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">{obs.createdBy}</td>
                  <td className="px-4 py-3 text-center">
                    {obs.hasPhoto && <Eye className="h-4 w-4 text-primary mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
