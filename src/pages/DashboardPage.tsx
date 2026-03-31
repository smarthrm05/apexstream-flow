import { useAppStore } from '@/store/useAppStore';
import {
  TrendingUp, TrendingDown, Activity, AlertTriangle,
  Package, Timer, DollarSign, Zap, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';

const kpiData = [
  { label: 'Productivity Rate', value: '87.3%', change: '+2.4%', trend: 'up', icon: Activity, color: 'text-success' },
  { label: 'Defect Rate', value: '1.8%', change: '-0.6%', trend: 'down', icon: AlertTriangle, color: 'text-success' },
  { label: 'Avg Lead Time', value: '4.2 days', change: '-0.3d', trend: 'down', icon: Timer, color: 'text-success' },
  { label: 'Cost of Waste', value: '$12,400', change: '-8.2%', trend: 'down', icon: DollarSign, color: 'text-success' },
];

const oeeData = [
  { name: 'Availability', value: 92, fill: 'hsl(224, 76%, 33%)' },
  { name: 'Performance', value: 88, fill: 'hsl(142, 71%, 45%)' },
  { name: 'Quality', value: 96, fill: 'hsl(38, 92%, 50%)' },
];

const trendData = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  productivity: 78 + Math.random() * 12,
  defects: 3.5 - Math.random() * 2,
  oee: 75 + Math.random() * 15,
}));

const wasteData = [
  { name: 'Overproduction', value: 25, color: '#1e3a8a' },
  { name: 'Waiting', value: 20, color: '#3b82f6' },
  { name: 'Transport', value: 15, color: '#22c55e' },
  { name: 'Defects', value: 15, color: '#ef4444' },
  { name: 'Inventory', value: 12, color: '#f59e0b' },
  { name: 'Motion', value: 8, color: '#8b5cf6' },
  { name: 'Over-processing', value: 5, color: '#06b6d4' },
];

const tasks = [
  { title: 'Update SOP for Line A', status: 'in_progress', assignee: 'Sarah C.', priority: 'high' },
  { title: 'Install poka-yoke sensor', status: 'todo', assignee: 'James L.', priority: 'medium' },
  { title: 'Calibrate torque wrench B3', status: 'review', assignee: 'Mike R.', priority: 'high' },
  { title: '5S audit — Assembly area', status: 'done', assignee: 'Ahmad R.', priority: 'low' },
];

export default function DashboardPage() {
  const { activeProject } = useAppStore();
  const oeeScore = Math.round(oeeData.reduce((a, b) => a * b.value, 1) / 10000 * 100) / 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeProject?.name} — Real-time performance overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.trend === 'up' ? (
                <TrendingUp className={`h-3.5 w-3.5 ${kpi.color}`} />
              ) : (
                <TrendingDown className={`h-3.5 w-3.5 ${kpi.color}`} />
              )}
              <span className={`text-xs font-medium ${kpi.color}`}>{kpi.change}</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* OEE + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* OEE Gauges */}
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">OEE Summary</h3>
            <span className="text-xs font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
              {(oeeScore * 100).toFixed(1)}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {oeeData.map((item) => (
              <div key={item.name} className="text-center">
                <div className="relative w-20 h-20 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={[item]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        dataKey="value"
                        cornerRadius={8}
                        fill={item.fill}
                        background={{ fill: 'hsl(var(--muted))' }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground">{item.value}%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity Trend */}
        <div className="kpi-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Productivity Trend</h3>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Productivity</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> OEE</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(224, 76%, 33%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(224, 76%, 33%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOEE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[70, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Area type="monotone" dataKey="productivity" stroke="hsl(224, 76%, 33%)" fill="url(#gradProd)" strokeWidth={2} />
              <Area type="monotone" dataKey="oee" stroke="hsl(142, 71%, 45%)" fill="url(#gradOEE)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tasks + Waste */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Tasks */}
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Active Improvements</h3>
            <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md p-2.5 bg-muted/50">
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${task.status === 'done' ? 'text-success' : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.assignee}</p>
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  task.priority === 'high' ? 'status-red' : task.priority === 'medium' ? 'status-yellow' : 'status-green'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Waste Distribution */}
        <div className="kpi-card">
          <h3 className="font-semibold text-foreground mb-4">Waste Distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={wasteData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {wasteData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {wasteData.map((w) => (
                <div key={w.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: w.color }} />
                    <span className="text-muted-foreground">{w.name}</span>
                  </span>
                  <span className="font-medium text-foreground">{w.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
