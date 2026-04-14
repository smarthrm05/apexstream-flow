import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ClipboardList, Play, CheckCircle2, RotateCcw, Plus, Trash2, Edit2, Target, Calendar, User, ChevronRight,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
}

interface PDCACycle {
  id: string;
  title: string;
  objective: string;
  currentStage: 'plan' | 'do' | 'check' | 'act';
  createdAt: string;
  tasks: Record<string, Task[]>;
}

const STAGES = [
  { key: 'plan', label: 'Plan', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', accent: 'bg-blue-500' },
  { key: 'do', label: 'Do', icon: Play, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', accent: 'bg-amber-500' },
  { key: 'check', label: 'Check', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', accent: 'bg-emerald-500' },
  { key: 'act', label: 'Act', icon: RotateCcw, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', accent: 'bg-purple-500' },
] as const;

const stageIndex = (s: string) => STAGES.findIndex(st => st.key === s);

const initialCycles: PDCACycle[] = [
  {
    id: '1', title: 'Reduce Defect Rate on Line A', objective: 'Achieve <1% defect rate by optimizing inspection process',
    currentStage: 'do', createdAt: '2026-03-01',
    tasks: {
      plan: [
        { id: 'p1', title: 'Analyze current defect data', description: 'Collect 3-month defect logs', assignee: 'Ahmad', dueDate: '2026-03-05', completed: true },
        { id: 'p2', title: 'Identify top 3 defect types', description: 'Pareto analysis', assignee: 'Sarah', dueDate: '2026-03-08', completed: true },
      ],
      do: [
        { id: 'd1', title: 'Implement new inspection checklist', description: 'Deploy on Line A stations 1-5', assignee: 'Budi', dueDate: '2026-03-20', completed: true },
        { id: 'd2', title: 'Train operators on new SOP', description: '2-hour training session', assignee: 'Ahmad', dueDate: '2026-03-25', completed: false },
      ],
      check: [
        { id: 'c1', title: 'Measure defect rate after 2 weeks', description: 'Compare with baseline', assignee: 'Sarah', dueDate: '2026-04-10', completed: false },
      ],
      act: [],
    },
  },
  {
    id: '2', title: 'Improve Changeover Time', objective: 'Reduce changeover from 45min to 20min using SMED',
    currentStage: 'plan', createdAt: '2026-04-01',
    tasks: {
      plan: [
        { id: 'p3', title: 'Video record current changeover', description: 'Record 3 changeovers', assignee: 'Rini', dueDate: '2026-04-05', completed: false },
      ],
      do: [], check: [], act: [],
    },
  },
];

export default function PDCAPage() {
  const { activeProject } = useAppStore();
  const [cycles, setCycles] = useState<PDCACycle[]>(initialCycles);
  const [selectedCycle, setSelectedCycle] = useState<string>(cycles[0].id);
  const [showCycleDialog, setShowCycleDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskStage, setTaskStage] = useState<string>('plan');
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [newCycle, setNewCycle] = useState({ title: '', objective: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '', dueDate: '' });

  const cycle = cycles.find(c => c.id === selectedCycle)!;

  const getStageProgress = (stageKey: string) => {
    const tasks = cycle.tasks[stageKey] || [];
    if (!tasks.length) return 0;
    return Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
  };

  const overallProgress = () => {
    const all = Object.values(cycle.tasks).flat();
    if (!all.length) return 0;
    return Math.round((all.filter(t => t.completed).length / all.length) * 100);
  };

  const addCycle = () => {
    if (!newCycle.title) return;
    setCycles(prev => [...prev, {
      id: Date.now().toString(), ...newCycle, currentStage: 'plan', createdAt: new Date().toISOString().slice(0, 10),
      tasks: { plan: [], do: [], check: [], act: [] },
    }]);
    setNewCycle({ title: '', objective: '' });
    setShowCycleDialog(false);
  };

  const advanceStage = () => {
    const idx = stageIndex(cycle.currentStage);
    if (idx < 3) {
      setCycles(prev => prev.map(c => c.id === cycle.id ? { ...c, currentStage: STAGES[idx + 1].key } : c));
    }
  };

  const openAddTask = (stage: string) => {
    setTaskStage(stage);
    setEditTask(null);
    setNewTask({ title: '', description: '', assignee: '', dueDate: '' });
    setShowTaskDialog(true);
  };

  const openEditTask = (stage: string, task: Task) => {
    setTaskStage(stage);
    setEditTask(task);
    setNewTask({ title: task.title, description: task.description, assignee: task.assignee, dueDate: task.dueDate });
    setShowTaskDialog(true);
  };

  const saveTask = () => {
    if (!newTask.title) return;
    setCycles(prev => prev.map(c => {
      if (c.id !== cycle.id) return c;
      const tasks = { ...c.tasks };
      if (editTask) {
        tasks[taskStage] = tasks[taskStage].map(t => t.id === editTask.id ? { ...t, ...newTask } : t);
      } else {
        tasks[taskStage] = [...tasks[taskStage], { id: Date.now().toString(), ...newTask, completed: false }];
      }
      return { ...c, tasks };
    }));
    setShowTaskDialog(false);
  };

  const toggleTask = (stage: string, taskId: string) => {
    setCycles(prev => prev.map(c => {
      if (c.id !== cycle.id) return c;
      const tasks = { ...c.tasks };
      tasks[stage] = tasks[stage].map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      return { ...c, tasks };
    }));
  };

  const deleteTask = (stage: string, taskId: string) => {
    setCycles(prev => prev.map(c => {
      if (c.id !== cycle.id) return c;
      const tasks = { ...c.tasks };
      tasks[stage] = tasks[stage].filter(t => t.id !== taskId);
      return { ...c, tasks };
    }));
  };

  const currentStageConfig = STAGES.find(s => s.key === cycle.currentStage)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">PDCA Cycle</h1>
          <p className="text-sm text-muted-foreground">{activeProject?.name} — Plan-Do-Check-Act Workflow</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCycle} onValueChange={setSelectedCycle}>
            <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {cycles.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCycleDialog(true)}><Plus className="w-4 h-4 mr-1" />New Cycle</Button>
        </div>
      </div>

      {/* Stage Progress Ring */}
      <div className="grid grid-cols-4 gap-4">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const progress = getStageProgress(stage.key);
          const isCurrent = cycle.currentStage === stage.key;
          const isPast = stageIndex(cycle.currentStage) > i;
          return (
            <Card key={stage.key} className={`relative overflow-hidden transition-all ${isCurrent ? `ring-2 ring-offset-2 ring-offset-background ${stage.border} ${stage.bg}` : isPast ? 'opacity-70' : 'opacity-40'}`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${isPast || isCurrent ? stage.accent : 'bg-muted'}`} />
              <CardContent className="pt-5 pb-4 flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stage.bg}`}>
                  <Icon className={`w-6 h-6 ${stage.color}`} />
                </div>
                <span className={`font-semibold text-sm ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>{stage.label}</span>
                <Progress value={progress} className="h-1.5 w-full" />
                <span className="text-xs text-muted-foreground">{progress}% complete</span>
                {isCurrent && <Badge variant="secondary" className="text-xs">Current</Badge>}
                {isPast && <Badge variant="outline" className="text-xs">Done</Badge>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall + Advance */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium text-foreground">{overallProgress()}%</span>
          </div>
          <Progress value={overallProgress()} className="h-2" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="w-4 h-4" /><span className="max-w-xs truncate">{cycle.objective}</span>
        </div>
        {stageIndex(cycle.currentStage) < 3 && (
          <Button variant="outline" size="sm" onClick={advanceStage}>
            Advance to {STAGES[stageIndex(cycle.currentStage) + 1].label} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Task columns per stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STAGES.map(stage => {
          const tasks = cycle.tasks[stage.key] || [];
          const Icon = stage.icon;
          return (
            <Card key={stage.key}>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${stage.color}`} />
                  <CardTitle className="text-base">{stage.label}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{tasks.length}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openAddTask(stage.key)}><Plus className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {tasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No tasks yet</p>}
                {tasks.map(task => (
                  <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${task.completed ? 'bg-muted/50 border-border' : 'bg-card border-border hover:border-primary/30'}`}>
                    <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(stage.key, task.id)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</p>
                      {task.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>}
                      <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                        {task.assignee && <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.assignee}</span>}
                        {task.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.dueDate}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditTask(stage.key, task)}><Edit2 className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTask(stage.key, task.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* New Cycle Dialog */}
      <Dialog open={showCycleDialog} onOpenChange={setShowCycleDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New PDCA Cycle</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Cycle title" value={newCycle.title} onChange={e => setNewCycle(p => ({ ...p, title: e.target.value }))} />
            <Textarea placeholder="Objective" value={newCycle.objective} onChange={e => setNewCycle(p => ({ ...p, objective: e.target.value }))} />
          </div>
          <DialogFooter><Button onClick={addCycle}>Create Cycle</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTask ? 'Edit Task' : 'Add Task'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Task title" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} />
            <Textarea placeholder="Description" value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Assignee" value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))} />
              <Input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter><Button onClick={saveTask}>{editTask ? 'Update' : 'Add'} Task</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
