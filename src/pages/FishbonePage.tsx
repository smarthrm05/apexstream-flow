import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Plus, Trash2, Edit2, Target, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { key: 'man', label: 'Man', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', fill: 'hsl(var(--primary))' },
  { key: 'machine', label: 'Machine', color: 'text-chart-5', bg: 'bg-chart-5/10', border: 'border-chart-5/30', fill: 'hsl(var(--chart-5))' },
  { key: 'method', label: 'Method', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', fill: 'hsl(var(--success))' },
  { key: 'material', label: 'Material', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', fill: 'hsl(var(--warning))' },
  { key: 'environment', label: 'Environment', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', fill: 'hsl(var(--danger))' },
  { key: 'measurement', label: 'Measurement', color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', fill: 'hsl(var(--muted-foreground))' },
] as const;

type CategoryKey = typeof CATEGORIES[number]['key'];

interface Cause {
  id: string;
  category: CategoryKey;
  text: string;
  subCauses: string[];
}

const initialCauses: Cause[] = [
  { id: '1', category: 'man', text: 'Insufficient training', subCauses: ['New operators', 'No SOP awareness'] },
  { id: '2', category: 'man', text: 'Fatigue', subCauses: ['Overtime shifts'] },
  { id: '3', category: 'machine', text: 'Equipment breakdown', subCauses: ['Aging machinery', 'Poor maintenance'] },
  { id: '4', category: 'machine', text: 'Calibration drift', subCauses: [] },
  { id: '5', category: 'method', text: 'Inconsistent SOP', subCauses: ['Outdated procedures'] },
  { id: '6', category: 'method', text: 'Manual data entry', subCauses: [] },
  { id: '7', category: 'material', text: 'Raw material variation', subCauses: ['Supplier inconsistency'] },
  { id: '8', category: 'material', text: 'Contamination', subCauses: [] },
  { id: '9', category: 'environment', text: 'Temperature fluctuation', subCauses: ['No HVAC control'] },
  { id: '10', category: 'measurement', text: 'Gauge repeatability', subCauses: ['Worn instruments'] },
];

export default function FishbonePage() {
  const { activeProject } = useAppStore();
  const [problemStatement, setProblemStatement] = useState('High Defect Rate in Assembly Line');
  const [causes, setCauses] = useState<Cause[]>(initialCauses);
  const [addDialog, setAddDialog] = useState(false);
  const [editCause, setEditCause] = useState<Cause | null>(null);
  const [editProblem, setEditProblem] = useState(false);
  const [newCause, setNewCause] = useState({ category: 'man' as CategoryKey, text: '', subCause: '' });

  const addCause = () => {
    if (!newCause.text.trim()) return;
    const cause: Cause = {
      id: Date.now().toString(),
      category: newCause.category,
      text: newCause.text.trim(),
      subCauses: newCause.subCause.trim() ? [newCause.subCause.trim()] : [],
    };
    setCauses(prev => [...prev, cause]);
    setNewCause({ category: 'man', text: '', subCause: '' });
    setAddDialog(false);
  };

  const deleteCause = (id: string) => setCauses(prev => prev.filter(c => c.id !== id));

  const updateCause = () => {
    if (!editCause) return;
    setCauses(prev => prev.map(c => c.id === editCause.id ? editCause : c));
    setEditCause(null);
  };

  const getCategoryConfig = (key: CategoryKey) => CATEGORIES.find(c => c.key === key)!;

  // SVG Layout constants
  const W = 1100, H = 520;
  const headX = W - 80, spineY = H / 2;
  const spineStartX = 60;

  // Split categories: top 3, bottom 3
  const topCats = CATEGORIES.slice(0, 3);
  const botCats = CATEGORIES.slice(3);

  const branchSpacing = (headX - spineStartX - 80) / 3;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fishbone Diagram</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeProject?.name} — Ishikawa Cause & Effect Analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setCauses(initialCauses); setProblemStatement('High Defect Rate in Assembly Line'); }}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditProblem(true)}>
            <Edit2 className="h-4 w-4 mr-1" /> Edit Problem
          </Button>
          <Button size="sm" onClick={() => setAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Cause
          </Button>
        </div>
      </div>

      {/* Fishbone SVG Diagram */}
      <Card>
        <CardContent className="p-4 overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[700px]" style={{ height: 'auto', maxHeight: 480 }}>
            {/* Background */}
            <rect width={W} height={H} fill="none" />

            {/* Main spine */}
            <line x1={spineStartX} y1={spineY} x2={headX - 30} y2={spineY} stroke="hsl(var(--foreground))" strokeWidth="3" />

            {/* Fish head (effect) */}
            <polygon
              points={`${headX - 30},${spineY - 35} ${headX + 20},${spineY} ${headX - 30},${spineY + 35}`}
              fill="hsl(var(--primary))"
              opacity="0.15"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
            <text x={headX - 15} y={spineY - 6} textAnchor="middle" fill="hsl(var(--primary))" fontSize="9" fontWeight="700">EFFECT</text>
            <text x={headX - 15} y={spineY + 10} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontWeight="500">
              {problemStatement.length > 22 ? problemStatement.slice(0, 22) + '…' : problemStatement}
            </text>

            {/* Fish tail */}
            <polygon
              points={`${spineStartX},${spineY} ${spineStartX - 25},${spineY - 25} ${spineStartX - 25},${spineY + 25}`}
              fill="hsl(var(--muted-foreground))"
              opacity="0.15"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1.5"
            />

            {/* Branches */}
            {topCats.map((cat, i) => {
              const bx = spineStartX + 80 + i * branchSpacing;
              const catCauses = causes.filter(c => c.category === cat.key);
              const branchEndY = 40;

              return (
                <g key={cat.key}>
                  {/* Main branch line */}
                  <line x1={bx} y1={spineY} x2={bx + 60} y2={branchEndY + 30} stroke={cat.fill} strokeWidth="2.5" opacity="0.7" />
                  {/* Category label */}
                  <rect x={bx + 30} y={branchEndY - 2} width={cat.label.length * 8 + 16} height={22} rx="4" fill={cat.fill} opacity="0.15" stroke={cat.fill} strokeWidth="1" />
                  <text x={bx + 38 + cat.label.length * 4} y={branchEndY + 14} textAnchor="middle" fill={cat.fill} fontSize="10" fontWeight="700">
                    {cat.label}
                  </text>
                  {/* Causes as sub-branches */}
                  {catCauses.map((cause, ci) => {
                    const t = (ci + 1) / (catCauses.length + 1);
                    const cx = bx + t * 60;
                    const cy = spineY - t * (spineY - branchEndY - 30);
                    const lineLen = 80 + ci * 15;
                    return (
                      <g key={cause.id}>
                        <line x1={cx} y1={cy} x2={cx - lineLen + 20} y2={cy - 18} stroke={cat.fill} strokeWidth="1.2" opacity="0.5" />
                        <circle cx={cx} cy={cy} r="3" fill={cat.fill} opacity="0.6" />
                        <text x={cx - lineLen + 18} y={cy - 22} textAnchor="start" fill="hsl(var(--foreground))" fontSize="8" opacity="0.85">
                          {cause.text.length > 24 ? cause.text.slice(0, 24) + '…' : cause.text}
                        </text>
                        {cause.subCauses.map((sc, si) => (
                          <text key={si} x={cx - lineLen + 26} y={cy - 10 + si * 10} textAnchor="start" fill="hsl(var(--muted-foreground))" fontSize="6.5" fontStyle="italic">
                            ↳ {sc.length > 20 ? sc.slice(0, 20) + '…' : sc}
                          </text>
                        ))}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {botCats.map((cat, i) => {
              const bx = spineStartX + 80 + i * branchSpacing;
              const catCauses = causes.filter(c => c.category === cat.key);
              const branchEndY = H - 40;

              return (
                <g key={cat.key}>
                  <line x1={bx} y1={spineY} x2={bx + 60} y2={branchEndY - 30} stroke={cat.fill} strokeWidth="2.5" opacity="0.7" />
                  <rect x={bx + 30} y={branchEndY - 5} width={cat.label.length * 8 + 16} height={22} rx="4" fill={cat.fill} opacity="0.15" stroke={cat.fill} strokeWidth="1" />
                  <text x={bx + 38 + cat.label.length * 4} y={branchEndY + 11} textAnchor="middle" fill={cat.fill} fontSize="10" fontWeight="700">
                    {cat.label}
                  </text>
                  {catCauses.map((cause, ci) => {
                    const t = (ci + 1) / (catCauses.length + 1);
                    const cx = bx + t * 60;
                    const cy = spineY + t * (branchEndY - 30 - spineY);
                    const lineLen = 80 + ci * 15;
                    return (
                      <g key={cause.id}>
                        <line x1={cx} y1={cy} x2={cx - lineLen + 20} y2={cy + 18} stroke={cat.fill} strokeWidth="1.2" opacity="0.5" />
                        <circle cx={cx} cy={cy} r="3" fill={cat.fill} opacity="0.6" />
                        <text x={cx - lineLen + 18} y={cy + 30} textAnchor="start" fill="hsl(var(--foreground))" fontSize="8" opacity="0.85">
                          {cause.text.length > 24 ? cause.text.slice(0, 24) + '…' : cause.text}
                        </text>
                        {cause.subCauses.map((sc, si) => (
                          <text key={si} x={cx - lineLen + 26} y={cy + 40 + si * 10} textAnchor="start" fill="hsl(var(--muted-foreground))" fontSize="6.5" fontStyle="italic">
                            ↳ {sc.length > 20 ? sc.slice(0, 20) + '…' : sc}
                          </text>
                        ))}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Cause List by Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const catCauses = causes.filter(c => c.category === cat.key);
          return (
            <Card key={cat.key} className={cn('border', cat.border)}>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className={cn('flex items-center gap-2', cat.color)}>
                    <span className={cn('h-2.5 w-2.5 rounded-full', cat.bg, 'ring-2', cat.border)} style={{ backgroundColor: cat.fill }} />
                    {cat.label}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{catCauses.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {catCauses.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No causes added</p>
                )}
                {catCauses.map((cause) => (
                  <div key={cause.id} className={cn('rounded-md border px-3 py-2 text-xs', cat.bg, cat.border)}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{cause.text}</p>
                        {cause.subCauses.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {cause.subCauses.map((sc, i) => (
                              <p key={i} className="text-muted-foreground text-[10px]">↳ {sc}</p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setEditCause({ ...cause })} className="p-1 rounded hover:bg-background transition-colors">
                          <Edit2 className="h-3 w-3 text-muted-foreground" />
                        </button>
                        <button onClick={() => deleteCause(cause.id)} className="p-1 rounded hover:bg-background transition-colors">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-7"
                  onClick={() => { setNewCause({ category: cat.key, text: '', subCause: '' }); setAddDialog(true); }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Cause Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Cause</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Category</Label>
              <Select value={newCause.category} onValueChange={(v) => setNewCause({ ...newCause, category: v as CategoryKey })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cause</Label>
              <Input value={newCause.text} onChange={(e) => setNewCause({ ...newCause, text: e.target.value })} placeholder="e.g. Insufficient training" />
            </div>
            <div>
              <Label>Sub-Cause (optional)</Label>
              <Input value={newCause.subCause} onChange={(e) => setNewCause({ ...newCause, subCause: e.target.value })} placeholder="e.g. New operators" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={addCause} disabled={!newCause.text.trim()}>Add Cause</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Cause Dialog */}
      <Dialog open={editCause !== null} onOpenChange={(open) => !open && setEditCause(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Cause</DialogTitle></DialogHeader>
          {editCause && (
            <div className="space-y-3 py-2">
              <div>
                <Label>Category</Label>
                <Select value={editCause.category} onValueChange={(v) => setEditCause({ ...editCause, category: v as CategoryKey })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cause</Label>
                <Input value={editCause.text} onChange={(e) => setEditCause({ ...editCause, text: e.target.value })} />
              </div>
              <div>
                <Label>Sub-Causes (one per line)</Label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                  value={editCause.subCauses.join('\n')}
                  onChange={(e) => setEditCause({ ...editCause, subCauses: e.target.value.split('\n').filter(Boolean) })}
                  placeholder="One sub-cause per line"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCause(null)}>Cancel</Button>
            <Button onClick={updateCause}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Problem Dialog */}
      <Dialog open={editProblem} onOpenChange={setEditProblem}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Problem Statement</DialogTitle></DialogHeader>
          <div className="py-2">
            <Label>Problem Statement (Effect)</Label>
            <Input value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={() => setEditProblem(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
