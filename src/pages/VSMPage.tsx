import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, GripVertical, ArrowRight, Clock, Settings2, Save, RotateCcw
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type NodeType = 'supplier' | 'process' | 'inventory' | 'customer';

interface VSMNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  data: {
    cycleTime?: number;
    leadTime?: number;
    uptime?: number;
    defectRate?: number;
    operators?: number;
    shift?: string;
    valueAddedTime?: number;
    inventoryCount?: number;
    inventoryUnit?: string;
  };
}

// ── Standard VSM SVG Icons ──

function VSMSupplierIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Factory building */}
      <rect x="4" y="20" width="40" height="24" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2"/>
      <polygon points="4,20 14,8 14,20" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/>
      <polygon points="14,20 24,8 24,20" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/>
      <polygon points="24,20 34,8 34,20" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="2"/>
      {/* Chimney */}
      <rect x="36" y="4" width="4" height="16" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5"/>
      {/* Windows */}
      <rect x="10" y="28" width="6" height="6" rx="0.5" fill="currentColor" opacity="0.4"/>
      <rect x="21" y="28" width="6" height="6" rx="0.5" fill="currentColor" opacity="0.4"/>
      <rect x="32" y="28" width="6" height="6" rx="0.5" fill="currentColor" opacity="0.4"/>
      {/* Door */}
      <rect x="19" y="36" width="10" height="8" rx="0.5" fill="currentColor" opacity="0.3"/>
    </svg>
  );
}

function VSMProcessIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Process box */}
      <rect x="4" y="8" width="40" height="32" rx="2" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="2"/>
      {/* Gear symbol inside */}
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
      <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.4"/>
      {/* Gear teeth */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 24 + Math.cos(rad) * 8;
        const y1 = 24 + Math.sin(rad) * 8;
        const x2 = 24 + Math.cos(rad) * 11;
        const y2 = 24 + Math.sin(rad) * 11;
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" opacity="0.5"/>;
      })}
    </svg>
  );
}

function VSMInventoryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Triangle - standard VSM inventory symbol */}
      <polygon points="24,4 44,40 4,40" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      {/* "I" letter inside */}
      <text x="24" y="34" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="bold" opacity="0.6">I</text>
    </svg>
  );
}

function VSMCustomerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* House shape - standard VSM customer/factory */}
      <polygon points="24,4 44,20 44,44 4,44 4,20" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      {/* Person silhouette */}
      <circle cx="24" cy="22" r="4" fill="currentColor" opacity="0.4"/>
      <path d="M16 38 C16 30 32 30 32 38" fill="currentColor" opacity="0.3"/>
    </svg>
  );
}

function VSMPushArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="2.5"/>
      <polygon points="22,3 32,8 22,13" fill="currentColor"/>
    </svg>
  );
}

const VSM_ICONS: Record<NodeType, React.FC<{ className?: string }>> = {
  supplier: VSMSupplierIcon,
  process: VSMProcessIcon,
  inventory: VSMInventoryIcon,
  customer: VSMCustomerIcon,
};

const nodeConfig: Record<NodeType, { color: string; bgColor: string; borderColor: string }> = {
  supplier: { color: 'text-chart-5', bgColor: 'bg-chart-5/10', borderColor: 'border-chart-5/30' },
  process: { color: 'text-primary', bgColor: 'bg-primary/10', borderColor: 'border-primary/30' },
  inventory: { color: 'text-warning', bgColor: 'bg-warning/10', borderColor: 'border-warning/30' },
  customer: { color: 'text-success', bgColor: 'bg-success/10', borderColor: 'border-success/30' },
};

const initialNodes: VSMNode[] = [
  {
    id: 'supplier-1', type: 'supplier', label: 'Raw Material Supplier', x: 50, y: 180,
    data: { leadTime: 5 },
  },
  {
    id: 'process-1', type: 'process', label: 'Stamping', x: 280, y: 180,
    data: { cycleTime: 45, leadTime: 2, uptime: 92, defectRate: 1.2, operators: 2, shift: 'A', valueAddedTime: 40 },
  },
  {
    id: 'inv-1', type: 'inventory', label: 'WIP Buffer', x: 480, y: 180,
    data: { inventoryCount: 500, inventoryUnit: 'pcs' },
  },
  {
    id: 'process-2', type: 'process', label: 'Welding', x: 630, y: 180,
    data: { cycleTime: 60, leadTime: 1.5, uptime: 88, defectRate: 2.1, operators: 3, shift: 'A', valueAddedTime: 52 },
  },
  {
    id: 'process-3', type: 'process', label: 'Assembly', x: 860, y: 180,
    data: { cycleTime: 90, leadTime: 3, uptime: 95, defectRate: 0.8, operators: 4, shift: 'B', valueAddedTime: 80 },
  },
  {
    id: 'customer-1', type: 'customer', label: 'Customer', x: 1090, y: 180,
    data: {},
  },
];

function VSMNodeCard({
  node, isSelected, onSelect, onDragStart,
}: {
  node: VSMNode;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}) {
  const config = nodeConfig[node.type];
  const IconComponent = VSM_ICONS[node.type];

  return (
    <div
      className={cn(
        'absolute cursor-grab select-none transition-shadow duration-150',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
      style={{ left: node.x, top: node.y, zIndex: isSelected ? 20 : 10 }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
        onDragStart(e);
      }}
    >
      <div className={cn(
        'rounded-lg border bg-card shadow-sm',
        node.type === 'inventory' ? 'min-w-[130px]' : 'min-w-[170px]',
        config.borderColor
      )}>
        {/* VSM Icon Header */}
        <div className={cn('flex items-center gap-2.5 px-3 py-2.5 rounded-t-lg border-b', config.bgColor, config.borderColor)}>
          <GripVertical className="h-3 w-3 text-muted-foreground/50" />
          <IconComponent className={cn('h-7 w-7', config.color)} />
          <span className="text-xs font-bold text-foreground truncate">{node.label}</span>
        </div>

        {/* Body */}
        <div className="px-3 py-2 space-y-1">
          {node.type === 'process' && (
            <>
              <DataRow label="C/T" value={`${node.data.cycleTime ?? 0}s`} />
              <DataRow label="L/T" value={`${node.data.leadTime ?? 0}d`} />
              <DataRow label="Uptime" value={`${node.data.uptime ?? 0}%`} />
              <DataRow label="Defect" value={`${node.data.defectRate ?? 0}%`} />
              <DataRow label="Operators" value={`${node.data.operators ?? 0}`} />
            </>
          )}
          {node.type === 'inventory' && (
            <>
              <div className="flex justify-center py-1">
                <VSMInventoryIcon className={cn('h-8 w-8', config.color)} />
              </div>
              <DataRow label="Stock" value={`${node.data.inventoryCount ?? 0} ${node.data.inventoryUnit ?? 'pcs'}`} />
            </>
          )}
          {node.type === 'supplier' && (
            <DataRow label="Lead Time" value={`${node.data.leadTime ?? 0}d`} />
          )}
          {node.type === 'customer' && (
            <p className="text-[10px] text-muted-foreground italic">End point</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[10px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ConnectionArrow({ fromX, fromY, toX, toY }: { fromX: number; fromY: number; toX: number; toY: number }) {
  return (
    <g>
      {/* Striped push arrow */}
      <line x1={fromX} y1={fromY} x2={toX - 10} y2={toY} stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="8 4" />
      <polygon
        points={`${toX},${toY} ${toX - 10},${toY - 5} ${toX - 10},${toY + 5}`}
        fill="hsl(var(--muted-foreground))"
      />
    </g>
  );
}
export default function VSMPage() {
  const { activeProject } = useAppStore();
  const [nodes, setNodes] = useState<VSMNode[]>(initialNodes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editNode, setEditNode] = useState<VSMNode | null>(null);
  const [addType, setAddType] = useState<NodeType | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  // Drag handling
  const handleDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    const node = document.querySelector(`[style*="left: "]`) as HTMLElement;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    dragRef.current = { id: nodeId, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - canvasRect.left - dragRef.current.offsetX;
      const y = e.clientY - canvasRect.top - dragRef.current.offsetY;
      setNodes((prev) =>
        prev.map((n) => (n.id === dragRef.current!.id ? { ...n, x: Math.max(0, x), y: Math.max(0, y) } : n))
      );
    };
    const handleMouseUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const addNode = () => {
    if (!addType || !newLabel.trim()) return;
    const maxX = nodes.reduce((m, n) => Math.max(m, n.x), 0);
    const newNode: VSMNode = {
      id: `${addType}-${Date.now()}`,
      type: addType,
      label: newLabel.trim(),
      x: maxX + 220,
      y: 180,
      data: addType === 'process'
        ? { cycleTime: 0, leadTime: 0, uptime: 0, defectRate: 0, operators: 1, shift: 'A', valueAddedTime: 0 }
        : addType === 'inventory'
        ? { inventoryCount: 0, inventoryUnit: 'pcs' }
        : { leadTime: 0 },
    };
    setNodes((prev) => [...prev, newNode]);
    setAddType(null);
    setNewLabel('');
  };

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateNodeData = (id: string, data: Partial<VSMNode['data']>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)));
  };

  // Timeline calculations
  const processNodes = nodes.filter((n) => n.type === 'process').sort((a, b) => a.x - b.x);
  const totalVA = processNodes.reduce((s, n) => s + (n.data.valueAddedTime ?? 0), 0);
  const totalLT = nodes.reduce((s, n) => s + (n.data.leadTime ?? 0), 0);
  const totalCT = processNodes.reduce((s, n) => s + (n.data.cycleTime ?? 0), 0);

  // Connection lines between sorted nodes
  const sortedNodes = [...nodes].sort((a, b) => a.x - b.x);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Value Stream Map</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeProject?.name} — Visualize material & information flow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setNodes(initialNodes)}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={() => setAddType('process')}>
            <Plus className="h-4 w-4 mr-1" /> Add Node
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        {(['supplier', 'process', 'inventory', 'customer'] as NodeType[]).map((type) => {
          const config = nodeConfig[type];
          const VsmIcon = VSM_ICONS[type];
          return (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => { setAddType(type); setNewLabel(''); }}
            >
              <VsmIcon className={cn('h-5 w-5', config.color)} />
              <span className="capitalize text-xs">{type}</span>
            </Button>
          );
        })}
        {selectedNode && (
          <>
            <div className="w-px h-6 bg-border self-center mx-1" />
            <Button variant="outline" size="sm" onClick={() => setEditNode(selectedNode)}>
              <Settings2 className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteNode(selectedNode.id)}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative bg-muted/30 border border-border rounded-lg overflow-auto"
        style={{ height: 450, minWidth: '100%' }}
        onClick={() => setSelectedId(null)}
      >
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Connection arrows */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width: 2000, height: 450 }}>
          {sortedNodes.map((node, i) => {
            if (i === sortedNodes.length - 1) return null;
            const next = sortedNodes[i + 1];
            const fromX = node.x + (node.type === 'inventory' ? 120 : 160);
            const fromY = node.y + 50;
            const toX = next.x;
            const toY = next.y + 50;
            return <ConnectionArrow key={`${node.id}-${next.id}`} fromX={fromX} fromY={fromY} toX={toX} toY={toY} />;
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <VSMNodeCard
            key={node.id}
            node={node}
            isSelected={selectedId === node.id}
            onSelect={() => setSelectedId(node.id)}
            onDragStart={(e) => handleDragStart(node.id, e)}
          />
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Timeline Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-md bg-primary/5 border border-primary/10 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Lead Time</p>
                <p className="text-lg font-bold text-foreground">{totalLT.toFixed(1)}d</p>
              </div>
              <div className="rounded-md bg-success/5 border border-success/10 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Value Added</p>
                <p className="text-lg font-bold text-foreground">{totalVA}s</p>
              </div>
              <div className="rounded-md bg-warning/5 border border-warning/10 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Cycle Time</p>
                <p className="text-lg font-bold text-foreground">{totalCT}s</p>
              </div>
              <div className="rounded-md bg-danger/5 border border-danger/10 p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">VA Ratio</p>
                <p className="text-lg font-bold text-foreground">
                  {totalCT > 0 ? ((totalVA / totalCT) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            {/* Visual timeline bar */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Process Timeline</p>
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {sortedNodes.map((node, i) => {
                  const width = node.type === 'process'
                    ? Math.max(60, (node.data.cycleTime ?? 0) * 1.2)
                    : node.type === 'inventory'
                    ? 40
                    : 50;
                  const config = nodeConfig[node.type];
                  return (
                    <div key={node.id} className="flex items-center gap-1 shrink-0">
                      <div
                        className={cn('rounded px-2 py-1.5 text-center border', config.bgColor)}
                        style={{ width }}
                      >
                        <p className="text-[9px] font-medium text-foreground truncate">{node.label}</p>
                        {node.type === 'process' && (
                          <p className="text-[8px] text-muted-foreground">{node.data.cycleTime}s</p>
                        )}
                      </div>
                      {i < sortedNodes.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* VA vs NVA bar */}
              {totalCT > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-3 text-[10px]">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-sm bg-success" /> Value Added ({totalVA}s)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-sm bg-danger" /> Non-Value Added ({totalCT - totalVA}s)
                    </span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                    <div
                      className="bg-success transition-all"
                      style={{ width: `${(totalVA / totalCT) * 100}%` }}
                    />
                    <div
                      className="bg-danger transition-all"
                      style={{ width: `${((totalCT - totalVA) / totalCT) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Node Dialog */}
      <Dialog open={addType !== null} onOpenChange={(open) => !open && setAddType(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">Add {addType} Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="nodeType">Type</Label>
              <Select value={addType ?? 'process'} onValueChange={(v) => setAddType(v as NodeType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="process">Process</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nodeLabel">Label</Label>
              <Input id="nodeLabel" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Painting" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddType(null)}>Cancel</Button>
            <Button onClick={addNode} disabled={!newLabel.trim()}>Add Node</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Node Dialog */}
      <Dialog open={editNode !== null} onOpenChange={(open) => !open && setEditNode(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit: {editNode?.label}</DialogTitle>
          </DialogHeader>
          {editNode && (
            <div className="space-y-3 py-2">
              <div>
                <Label>Label</Label>
                <Input
                  value={editNode.label}
                  onChange={(e) => setEditNode({ ...editNode, label: e.target.value })}
                />
              </div>
              {editNode.type === 'process' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Cycle Time (s)</Label>
                    <Input type="number" value={editNode.data.cycleTime ?? 0} onChange={(e) => setEditNode({ ...editNode, data: { ...editNode.data, cycleTime: +e.target.value } })} />
                  </div>
                  <div>
                    <Label>Lead Time (days)</Label>
                    <Input type="number" value={editNode.data.leadTime ?? 0} onChange={(e) => setEditNode({ ...editNode, data: { ...editNode.data, leadTime: +e.target.value } })} />
                  </div>
                  <div>
                    <Label>Uptime (%)</Label>
                    <Input type="number" value={editNode.data.uptime ?? 0} onChange={(e) => setEditNode({ ...editNode, data: { ...editNode.data, uptime: +e.target.value } })} />
                  </div>
                  <div>
                    <Label>Defect Rate (%)</Label>
                    <Input type="number" value={editNode.data.defectRate ?? 0} onChange={(e) => setEditNode({ ...editNode, data: { ...editNode.data, defectRate: +e.target.value } })} />
                  </div>
                  <div>
                    <Label>Operators</Label>
                    <Input type="number" value={editNode.data.operators ?? 0} onChange={(e) => setEditNode({ ...editNode, data: { ...editNode.data, operators: +e.target.value } })} />
                  </div>
                  <div>
                    <Label>Value Added Time (s)</Label>
                    <Input type="number" value={editNode.data.valueAddedTime ?? 0} onChange={(e) => setEditNode({ ...editNode, data: { ...editNode.data, valueAddedTime: +e.target.value } })} />
                  </div>
                  <div>
                    <Label>Shift</Label>
                    <Select value={editNode.data.shift ?? 'A'} onValueChange={(v) => setEditNode({ ...editNode, data: { ...editNode.data, shift: v } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Shift A</SelectItem>
                        <SelectItem value="B">Shift B</SelectItem>
                        <SelectItem value="C">Shift C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {editNode.type === 'inventory' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Count</Label>
                    <Input type="number" value={editNode.data.inventoryCount ?? 0} onChange={(e) => setEditNode({ ...editNode, data: { ...editNode.data, inventoryCount: +e.target.value } })} />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input value={editNode.data.inventoryUnit ?? 'pcs'} onChange={(e) => setEditNode({ ...editNode, data: { ...editNode.data, inventoryUnit: e.target.value } })} />
                  </div>
                </div>
              )}
              {(editNode.type === 'supplier' || editNode.type === 'customer') && (
                <div>
                  <Label>Lead Time (days)</Label>
                  <Input type="number" value={editNode.data.leadTime ?? 0} onChange={(e) => setEditNode({ ...editNode, data: { ...editNode.data, leadTime: +e.target.value } })} />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNode(null)}>Cancel</Button>
            <Button onClick={() => {
              if (!editNode) return;
              setNodes((prev) => prev.map((n) => n.id === editNode.id ? { ...editNode } : n));
              setEditNode(null);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
