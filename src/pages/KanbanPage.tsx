import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface KanbanCard {
  id: string;
  title: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

const initialColumns: Column[] = [
  {
    id: 'todo', title: 'To Do', color: 'bg-muted-foreground',
    cards: [
      { id: 'k1', title: 'Review Gemba findings', assignee: 'Sarah C.', priority: 'high', dueDate: 'Apr 5' },
      { id: 'k2', title: 'Schedule VSM workshop', assignee: 'James L.', priority: 'medium', dueDate: 'Apr 8' },
    ],
  },
  {
    id: 'in_progress', title: 'In Progress', color: 'bg-primary',
    cards: [
      { id: 'k3', title: 'Install poka-yoke on Station 4', assignee: 'Mike R.', priority: 'high', dueDate: 'Apr 3' },
      { id: 'k4', title: 'Update SOP for assembly', assignee: 'Ahmad R.', priority: 'medium', dueDate: 'Apr 6' },
    ],
  },
  {
    id: 'review', title: 'Review', color: 'bg-warning',
    cards: [
      { id: 'k5', title: 'Validate cycle time reduction', assignee: 'Sarah C.', priority: 'high', dueDate: 'Apr 2' },
    ],
  },
  {
    id: 'done', title: 'Done', color: 'bg-success',
    cards: [
      { id: 'k6', title: '5S audit — Packing area', assignee: 'James L.', priority: 'low', dueDate: 'Mar 28' },
    ],
  },
];

const priorityStyles: Record<string, string> = {
  high: 'status-red',
  medium: 'status-yellow',
  low: 'status-green',
};

export default function KanbanPage() {
  const { activeProject } = useAppStore();
  const [columns, setColumns] = useState(initialColumns);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newColumns = [...columns];
    const srcCol = newColumns.find((c) => c.id === source.droppableId)!;
    const destCol = newColumns.find((c) => c.id === destination.droppableId)!;
    const [moved] = srcCol.cards.splice(source.index, 1);
    destCol.cards.splice(destination.index, 0, moved);
    setColumns(newColumns);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kanban Board</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeProject?.name}</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors">
          <Plus className="h-4 w-4" /> Add Card
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => (
            <div key={col.id} className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', col.color)} />
                  <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{col.cards.length}</span>
                </div>
                <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn('space-y-2 min-h-[100px] rounded-md transition-colors', snapshot.isDraggingOver && 'bg-primary-light/50')}
                  >
                    {col.cards.map((card, idx) => (
                      <Draggable key={card.id} draggableId={card.id} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              'kpi-card !p-3 cursor-grab active:cursor-grabbing',
                              snapshot.isDragging && 'shadow-lg ring-2 ring-primary/20'
                            )}
                          >
                            <p className="text-sm font-medium text-foreground mb-2">{card.title}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="h-3 w-3" /> {card.assignee}
                              </div>
                              <span className={cn('text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full', priorityStyles[card.priority])}>
                                {card.priority}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                              <Calendar className="h-3 w-3" /> {card.dueDate}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
