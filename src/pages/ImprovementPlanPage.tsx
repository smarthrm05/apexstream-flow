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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Trash2, Edit2, User, Calendar, CheckCircle2, Clock, AlertTriangle, ListTodo, Filter,
} from 'lucide-react';

type Priority = 'high' | 'medium' | 'low';
type Status = 'not-started' | 'in-progress' | 'completed' | 'overdue';

interface ImprovementTask {
  id: string;
  title: string;
  description: string;
  pic: string;
  department: string;
  priority: Priority;
  status: Status;
  startDate: string;
  dueDate: string;
  category: string;
  completedDate?: string;
}

const STATUS_CONFIG: Record<Status, { label: string; icon: typeof CheckCircle2; className: string }> = {
  'not-started': { label: 'Not Started', icon: ListTodo, className: 'bg-muted text-muted-foreground' },
  'in-progress': { label: 'In Progress', icon: Clock, className: 'bg-blue-500/15 text-blue-500 border-blue-500/30' },
  'completed': { label: 'Completed', icon: CheckCircle2, className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  'overdue': { label: 'Overdue', icon: AlertTriangle, className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

const PRIORITY_CONFIG: Record<Priority, string> = {
  high: 'bg-destructive/15 text-destructive border-destructive/30',
  medium: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  low: 'bg-muted text-muted-foreground',
};

const CATEGORIES = ['Quality', 'Safety', 'Productivity', 'Cost Reduction', '5S', 'Kaizen'];
const DEPARTMENTS = ['Production', 'Quality', 'Maintenance', 'Warehouse', 'Engineering', 'HR'];

const initialTasks: ImprovementTask[] = [
  { id: '1', title: 'Install poka-yoke on Station 3', description: 'Add mistake-proofing jig to prevent misalignment', pic: 'Ahmad Rashid', department: 'Production', priority: 'high', status: 'in-progress', startDate: '2026-03-10', dueDate: '2026-04-20', category: 'Quality' },
  { id: '2', title: 'Implement 5S in Warehouse Zone B', description: 'Sort, set in order, shine, standardize, sustain', pic: 'Budi Santoso', department: 'Warehouse', priority: 'medium', status: 'in-progress', startDate: '2026-03-15', dueDate: '2026-04-30', category: '5S' },
  { id: '3', title: 'Replace worn conveyor belts Line A', description: 'Preventive replacement to avoid unplanned downtime', pic: 'Rini Wati', department: 'Maintenance', priority: 'high', status: 'completed', startDate: '2026-02-20', dueDate: '2026-03-15', category: 'Productivity', completedDate: '2026-03-12' },
  { id: '4', title: 'Update safety signage in paint shop', description: 'Replace faded signs and add new hazard warnings', pic: 'Sarah Chen', department: 'Quality', priority: 'low', status: 'not-started', startDate: '2026-04-15', dueDate: '2026-05-01', category: 'Safety' },
  { id: '5', title: 'Reduce material waste on stamping press', description: 'Optimize nesting layout to reduce scrap by 15%', pic: 'Ahmad Rashid', department: 'Engineering', priority: 'high', status: 'overdue', startDate: '2026-02-01', dueDate: '2026-03-31', category: 'Cost Reduction' },
  { id: '6', title: 'Standardize changeover procedure Line B', description: 'Create visual SOP and train operators', pic: 'Budi Santoso', department: 'Production', priority: 'medium', status: 'not-started', startDate: '2026-04-20', dueDate: '2026-05-20', category: 'Kaizen' },
];

const emptyTask = { title: '', description: '', pic: '', department: 'Production', priority: 'medium' as Priority, status: 'not-started' as Status, startDate: '', dueDate: '', category: 'Kaizen' };

export default function ImprovementPlanPage() {
  const { activeProject } = useAppStore();
  const [tasks, setTasks] = useState<ImprovementTask[]>(initialTasks);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTask);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = tasks.filter(t => (filterStatus === 'all' || t.status === filterStatus) && (filterCategory === 'all' || t.category === filterCategory));

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
  };

  const openAdd = () => { setEditId(null); setForm(emptyTask); setShowDialog(true); };
  const openEdit = (t: ImprovementTask) => {
    setEditId(t.id);
    setForm({ title: t.title, description: t.description, pic: t.pic, department: t.department, priority: t.priority, status: t.status, startDate: t.startDate, dueDate: t.dueDate, category: t.category });
    setShowDialog(true);
  };

  const save = () => {
    if (!form.title || !form.pic) return;
    if (editId) {
      setTasks(prev => prev.map(t => t.id === editId ? { ...t, ...form, completedDate: form.status === 'completed' && t.status !== 'completed' ? new Date().toISOString().slice(0, 10) : t.completedDate } : t));
    } else {
      setTasks(prev => [...prev, { id: Date.now().toString(), ...form }]);
    }
    setShowDialog(false);
  };

  const remove = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const completionRate = tasks.length ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Improvement Plan</h1>
          <p className="text-sm text-muted-foreground">{activeProject?.name} — Task Management & PIC Tracking</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Task</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-foreground' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-blue-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-destructive' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-muted`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Completion</span>
            <span className="font-medium text-foreground">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </CardContent>
      </Card>

      {/* Filters + Table */}
      <Tabs defaultValue="table">
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="board">Board View</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>PIC</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(task => {
                    const stCfg = STATUS_CONFIG[task.status];
                    const StIcon = stCfg.icon;
                    return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <p className="font-medium text-foreground text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</p>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm"><User className="w-3 h-3 text-muted-foreground" />{task.pic}</span>
                          <span className="text-xs text-muted-foreground">{task.department}</span>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{task.category}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={`text-xs ${PRIORITY_CONFIG[task.priority]}`}>{task.priority}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={`text-xs ${stCfg.className}`}><StIcon className="w-3 h-3 mr-1" />{stCfg.label}</Badge></TableCell>
                        <TableCell className="text-sm"><span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-muted-foreground" />{task.dueDate}</span></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(task)}><Edit2 className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(task.id)}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No tasks match filters</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="board">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(Object.keys(STATUS_CONFIG) as Status[]).map(status => {
              const cfg = STATUS_CONFIG[status];
              const Icon = cfg.icon;
              const columnTasks = filtered.filter(t => t.status === status);
              return (
                <Card key={status}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <CardTitle className="text-sm">{cfg.label}</CardTitle>
                      <Badge variant="secondary" className="text-xs ml-auto">{columnTasks.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                    {columnTasks.map(task => (
                      <div key={task.id} className="p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors cursor-pointer" onClick={() => openEdit(task)}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          <Badge variant="outline" className={`text-[10px] ${PRIORITY_CONFIG[task.priority]}`}>{task.priority}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">{task.description}</p>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.pic}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.dueDate}</span>
                        </div>
                      </div>
                    ))}
                    {columnTasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No tasks</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Edit Task' : 'Add Improvement Task'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Task title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="PIC (Person in Charge)" value={form.pic} onChange={e => setForm(p => ({ ...p, pic: e.target.value }))} />
              <Select value={form.department} onValueChange={v => setForm(p => ({ ...p, department: v }))}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v as Priority }))}>
                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as Status }))}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                <Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
                <Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>{editId ? 'Update' : 'Add'} Task</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
