import { useState } from 'react';
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Plus, Trash2, Edit2, Search, ChevronDown, ChevronRight, RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhyEntry {
  why: string;
  answer: string;
}

interface RootCauseAnalysis {
  id: string;
  problemStatement: string;
  whys: WhyEntry[];
  rootCause: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdBy: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'text-danger', bg: 'bg-danger/10', icon: AlertTriangle },
  in_progress: { label: 'In Progress', color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
  resolved: { label: 'Resolved', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-muted-foreground', bg: 'bg-muted' },
  medium: { label: 'Medium', color: 'text-primary', bg: 'bg-primary/10' },
  high: { label: 'High', color: 'text-warning', bg: 'bg-warning/10' },
  critical: { label: 'Critical', color: 'text-danger', bg: 'bg-danger/10' },
};

const initialAnalyses: RootCauseAnalysis[] = [
  {
    id: '1',
    problemStatement: 'Assembly line defect rate increased by 15% in Q3',
    whys: [
      { why: 'Why is the defect rate increasing?', answer: 'Misaligned components during assembly' },
      { why: 'Why are components misaligned?', answer: 'Fixture calibration has drifted beyond tolerance' },
      { why: 'Why has calibration drifted?', answer: 'Preventive maintenance was skipped last month' },
      { why: 'Why was maintenance skipped?', answer: 'Maintenance team was reassigned to urgent repairs' },
      { why: 'Why were they reassigned?', answer: 'No backup maintenance crew for emergency situations' },
    ],
    rootCause: 'Lack of backup maintenance personnel causes PM schedule disruptions',
    status: 'in_progress',
    priority: 'high',
    createdBy: 'Ahmad R.',
    createdAt: '2024-03-15',
  },
  {
    id: '2',
    problemStatement: 'Machine downtime exceeded 8 hours on Line B',
    whys: [
      { why: 'Why did the machine stop?', answer: 'Motor overheated and tripped the breaker' },
      { why: 'Why did the motor overheat?', answer: 'Cooling fan belt was worn and slipping' },
      { why: 'Why was the belt worn?', answer: 'Belt was past its replacement interval' },
      { why: 'Why wasn\'t it replaced on time?', answer: 'Spare parts inventory was depleted' },
      { why: 'Why was inventory depleted?', answer: 'Reorder point not set in the MRP system' },
    ],
    rootCause: 'Missing reorder points in MRP system for critical spare parts',
    status: 'resolved',
    priority: 'critical',
    createdBy: 'Sarah M.',
    createdAt: '2024-03-10',
  },
  {
    id: '3',
    problemStatement: 'Customer complaints about packaging damage increased',
    whys: [
      { why: 'Why are packages arriving damaged?', answer: 'Boxes are crushed during transport' },
      { why: 'Why are boxes being crushed?', answer: 'Stacking exceeds recommended weight limits' },
      { why: 'Why is stacking excessive?', answer: 'Loading crew unaware of stacking guidelines' },
    ],
    rootCause: '',
    status: 'open',
    priority: 'medium',
    createdBy: 'Budi K.',
    createdAt: '2024-03-18',
  },
];

export default function RootCausePage() {
  const { activeProject } = useAppStore();
  const [analyses, setAnalyses] = useState<RootCauseAnalysis[]>(initialAnalyses);
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [addDialog, setAddDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // New analysis form
  const [newProblem, setNewProblem] = useState('');
  const [newWhys, setNewWhys] = useState<WhyEntry[]>([
    { why: '', answer: '' },
  ]);
  const [newRootCause, setNewRootCause] = useState('');
  const [newPriority, setNewPriority] = useState<RootCauseAnalysis['priority']>('medium');

  const resetForm = () => {
    setNewProblem('');
    setNewWhys([{ why: '', answer: '' }]);
    setNewRootCause('');
    setNewPriority('medium');
  };

  const addWhy = () => {
    if (newWhys.length >= 7) return;
    setNewWhys(prev => [...prev, { why: '', answer: '' }]);
  };

  const updateWhy = (index: number, field: 'why' | 'answer', value: string) => {
    setNewWhys(prev => prev.map((w, i) => i === index ? { ...w, [field]: value } : w));
  };

  const removeWhy = (index: number) => {
    if (newWhys.length <= 1) return;
    setNewWhys(prev => prev.filter((_, i) => i !== index));
  };

  const saveAnalysis = () => {
    if (!newProblem.trim()) return;
    const validWhys = newWhys.filter(w => w.why.trim() || w.answer.trim());
    if (validWhys.length === 0) return;

    if (editId) {
      setAnalyses(prev => prev.map(a => a.id === editId ? {
        ...a,
        problemStatement: newProblem.trim(),
        whys: validWhys,
        rootCause: newRootCause.trim(),
        priority: newPriority,
      } : a));
      setEditId(null);
    } else {
      const analysis: RootCauseAnalysis = {
        id: Date.now().toString(),
        problemStatement: newProblem.trim(),
        whys: validWhys,
        rootCause: newRootCause.trim(),
        status: 'open',
        priority: newPriority,
        createdBy: 'Current User',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAnalyses(prev => [analysis, ...prev]);
    }
    resetForm();
    setAddDialog(false);
  };

  const openEdit = (a: RootCauseAnalysis) => {
    setEditId(a.id);
    setNewProblem(a.problemStatement);
    setNewWhys(a.whys.length > 0 ? [...a.whys] : [{ why: '', answer: '' }]);
    setNewRootCause(a.rootCause);
    setNewPriority(a.priority);
    setAddDialog(true);
  };

  const deleteAnalysis = (id: string) => {
    setAnalyses(prev => prev.filter(a => a.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateStatus = (id: string, status: RootCauseAnalysis['status']) => {
    setAnalyses(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const filtered = filterStatus === 'all' ? analyses : analyses.filter(a => a.status === filterStatus);

  const stats = {
    total: analyses.length,
    open: analyses.filter(a => a.status === 'open').length,
    inProgress: analyses.filter(a => a.status === 'in_progress').length,
    resolved: analyses.filter(a => a.status === 'resolved').length,
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Root Cause Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeProject?.name} — 5 Whys Method & Cause Tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setAnalyses(initialAnalyses); setExpandedId('1'); }}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setEditId(null); setAddDialog(true); }}>
            <Plus className="h-4 w-4 mr-1" /> New Analysis
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-muted' },
          { label: 'Open', value: stats.open, color: 'text-danger', bg: 'bg-danger/10' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Resolved', value: stats.resolved, color: 'text-success', bg: 'bg-success/10' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-lg border p-3 text-center', s.bg)}>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'open', 'in_progress', 'resolved'].map(s => (
          <Button
            key={s}
            variant={filterStatus === s ? 'default' : 'outline'}
            size="sm"
            className="text-xs capitalize"
            onClick={() => setFilterStatus(s)}
          >
            {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {/* Analysis List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No analyses found.</CardContent></Card>
        )}
        {filtered.map((analysis) => {
          const isExpanded = expandedId === analysis.id;
          const statusCfg = STATUS_CONFIG[analysis.status];
          const priorityCfg = PRIORITY_CONFIG[analysis.priority];
          const StatusIcon = statusCfg.icon;

          return (
            <Card key={analysis.id} className={cn('transition-shadow', isExpanded && 'shadow-md')}>
              {/* Collapsed header */}
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                onClick={() => setExpandedId(isExpanded ? null : analysis.id)}
              >
                {isExpanded
                  ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                }
                <StatusIcon className={cn('h-4 w-4 shrink-0', statusCfg.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{analysis.problemStatement}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {analysis.whys.length} Why{analysis.whys.length !== 1 ? 's' : ''} · by {analysis.createdBy} · {analysis.createdAt}
                  </p>
                </div>
                <Badge className={cn('text-[10px] shrink-0', priorityCfg.bg, priorityCfg.color)} variant="secondary">
                  {priorityCfg.label}
                </Badge>
                <Badge className={cn('text-[10px] shrink-0', statusCfg.bg, statusCfg.color)} variant="secondary">
                  {statusCfg.label}
                </Badge>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4 space-y-4">
                  {/* 5 Whys visual chain */}
                  <div className="space-y-0">
                    {analysis.whys.map((entry, i) => (
                      <div key={i} className="flex gap-3">
                        {/* Vertical connector */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                            i === analysis.whys.length - 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          )}>
                            {i + 1}
                          </div>
                          {i < analysis.whys.length - 1 && (
                            <div className="w-px flex-1 bg-border min-h-[20px]" />
                          )}
                        </div>
                        <div className="pb-4 flex-1 min-w-0">
                          <p className="text-xs font-semibold text-primary">{entry.why || `Why #${i + 1}?`}</p>
                          <p className="text-sm text-foreground mt-0.5">{entry.answer || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Root Cause conclusion */}
                  {analysis.rootCause && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-primary font-semibold mb-1">Root Cause Identified</p>
                      <p className="text-sm font-medium text-foreground">{analysis.rootCause}</p>
                    </div>
                  )}
                  {!analysis.rootCause && (
                    <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
                      <p className="text-xs text-warning font-medium">⚠ Root cause not yet identified — continue analysis</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Select value={analysis.status} onValueChange={(v) => updateStatus(analysis.id, v as RootCauseAnalysis['status'])}>
                      <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => openEdit(analysis)}>
                      <Edit2 className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-8 text-destructive hover:text-destructive" onClick={() => deleteAnalysis(analysis.id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Cause Tracking Summary Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Cause Tracking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Problem</TableHead>
                  <TableHead className="text-xs">Root Cause</TableHead>
                  <TableHead className="text-xs">Depth</TableHead>
                  <TableHead className="text-xs">Priority</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map(a => {
                  const sc = STATUS_CONFIG[a.status];
                  const pc = PRIORITY_CONFIG[a.priority];
                  return (
                    <TableRow key={a.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}>
                      <TableCell className="text-xs font-medium max-w-[200px] truncate">{a.problemStatement}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate text-muted-foreground">{a.rootCause || '—'}</TableCell>
                      <TableCell className="text-xs">{a.whys.length} Why{a.whys.length !== 1 ? 's' : ''}</TableCell>
                      <TableCell><Badge variant="secondary" className={cn('text-[10px]', pc.bg, pc.color)}>{pc.label}</Badge></TableCell>
                      <TableCell><Badge variant="secondary" className={cn('text-[10px]', sc.bg, sc.color)}>{sc.label}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.createdBy}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={addDialog} onOpenChange={(open) => { if (!open) { setAddDialog(false); setEditId(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit' : 'New'} Root Cause Analysis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Problem Statement</Label>
              <Input
                value={newProblem}
                onChange={(e) => setNewProblem(e.target.value)}
                placeholder="Describe the problem clearly..."
              />
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={newPriority} onValueChange={(v) => setNewPriority(v as RootCauseAnalysis['priority'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 5 Whys Form */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">5 Whys</Label>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={addWhy} disabled={newWhys.length >= 7}>
                  <Plus className="h-3 w-3 mr-1" /> Add Why
                </Button>
              </div>
              {newWhys.map((entry, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-1">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Input
                      placeholder={`Why #${i + 1}? (question)`}
                      value={entry.why}
                      onChange={(e) => updateWhy(i, 'why', e.target.value)}
                      className="text-xs h-8"
                    />
                    <Input
                      placeholder="Because... (answer)"
                      value={entry.answer}
                      onChange={(e) => updateWhy(i, 'answer', e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                  {newWhys.length > 1 && (
                    <button onClick={() => removeWhy(i)} className="p-1 mt-1 rounded hover:bg-muted transition-colors">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <Label>Root Cause (conclusion)</Label>
              <Input
                value={newRootCause}
                onChange={(e) => setNewRootCause(e.target.value)}
                placeholder="What is the fundamental root cause?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddDialog(false); setEditId(null); resetForm(); }}>Cancel</Button>
            <Button onClick={saveAnalysis} disabled={!newProblem.trim()}>
              {editId ? 'Save Changes' : 'Create Analysis'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
