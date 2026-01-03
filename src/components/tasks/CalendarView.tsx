import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
  parseISO,
} from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ChevronLeft, ChevronRight, LayoutGrid, List, GripVertical } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task, PRIORITY_LABELS, TYPE_LABELS } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface CalendarViewProps {
  projectId: string;
}

type CalendarMode = 'month' | 'week';

export function CalendarView({ projectId }: CalendarViewProps) {
  const { tasks, setCurrentTaskId, teamMembers, updateTask } = useProject();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');

  const projectTasks = useMemo(
    () => tasks.filter(t => t.projectId === projectId),
    [tasks, projectId]
  );

  const days = useMemo(() => {
    if (mode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  }, [currentDate, mode]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    projectTasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = format(parseISO(task.dueDate), 'yyyy-MM-dd');
        const existing = map.get(dateKey) || [];
        map.set(dateKey, [...existing, task]);
      }
    });
    return map;
  }, [projectTasks]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newDateKey = result.destination.droppableId;
    
    // Parse the new date and create ISO string
    const newDueDate = new Date(newDateKey + 'T12:00:00').toISOString();
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { dueDate: newDueDate });
      toast({
        title: 'Task rescheduled',
        description: `"${task.title}" moved to ${format(parseISO(newDueDate), 'MMM d, yyyy')}`,
      });
    }
  };

  const navigate = (direction: 'prev' | 'next') => {
    if (mode === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const getTaskColor = (task: Task) => {
    const colors: Record<string, string> = {
      development: 'bg-type-development/20 border-type-development text-type-development',
      research: 'bg-type-research/20 border-type-research text-type-research',
      gis: 'bg-type-gis/20 border-type-gis text-type-gis',
      marketing: 'bg-type-marketing/20 border-type-marketing text-type-marketing',
      general: 'bg-muted border-border text-muted-foreground',
    };
    return colors[task.type] || colors.general;
  };

  const getPriorityDot = (task: Task) => {
    const colors: Record<string, string> = {
      urgent: 'bg-priority-urgent',
      high: 'bg-priority-high',
      medium: 'bg-priority-medium',
      low: 'bg-priority-low',
    };
    return colors[task.priority] || colors.low;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col p-4 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">
              {mode === 'month'
                ? format(currentDate, 'MMMM yyyy')
                : `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setMode('month')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                mode === 'month'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Month
            </button>
            <button
              onClick={() => setMode('week')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                mode === 'week'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-4 w-4" />
              Week
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col min-h-0 border border-border rounded-lg overflow-hidden bg-card">
          {/* Week day headers */}
          <div className="grid grid-cols-7 bg-muted border-b border-border flex-shrink-0">
            {weekDays.map(day => (
              <div
                key={day}
                className="py-2 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div
            className={cn(
              'flex-1 grid grid-cols-7',
              mode === 'month' ? 'grid-rows-5' : 'grid-rows-1'
            )}
          >
            {days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDate.get(dateKey) || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <Droppable key={dateKey} droppableId={dateKey}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'border-r border-b border-border last:border-r-0 p-1.5 flex flex-col min-h-0 transition-colors',
                        mode === 'week' ? 'min-h-[400px]' : '',
                        !isCurrentMonth && 'bg-muted/30',
                        snapshot.isDraggingOver && 'bg-primary/10 ring-2 ring-inset ring-primary/30'
                      )}
                    >
                      {/* Day number */}
                      <div className="flex items-center justify-between mb-1 flex-shrink-0">
                        <span
                          className={cn(
                            'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                            isCurrentDay && 'bg-primary text-primary-foreground',
                            !isCurrentMonth && !isCurrentDay && 'text-muted-foreground'
                          )}
                        >
                          {format(day, 'd')}
                        </span>
                        {dayTasks.length > 3 && mode === 'month' && (
                          <span className="text-xs text-muted-foreground">
                            +{dayTasks.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Tasks */}
                      <div className="flex-1 space-y-1 overflow-y-auto min-h-0">
                        {(mode === 'week' ? dayTasks : dayTasks.slice(0, 3)).map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={cn(
                                      'group w-full text-left px-1.5 py-1 rounded text-xs border transition-all cursor-pointer',
                                      getTaskColor(task),
                                      snapshot.isDragging && 'shadow-lg ring-2 ring-primary rotate-2 scale-105'
                                    )}
                                    onClick={() => setCurrentTaskId(task.id)}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span
                                        {...provided.dragHandleProps}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <GripVertical className="h-3 w-3" />
                                      </span>
                                      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', getPriorityDot(task))} />
                                      <span className="truncate font-medium">{task.title}</span>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                  <div className="space-y-1">
                                    <p className="font-medium">{task.title}</p>
                                    <div className="flex gap-2 text-xs">
                                      <Badge variant="outline" className="text-xs">
                                        {TYPE_LABELS[task.type]}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {PRIORITY_LABELS[task.priority]}
                                      </Badge>
                                    </div>
                                    {task.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {task.description}
                                      </p>
                                    )}
                                    {task.assigneeIds.length > 0 && (
                                      <p className="text-xs text-muted-foreground">
                                        Assigned to:{' '}
                                        {task.assigneeIds
                                          .map(id => teamMembers.find(m => m.id === id)?.name)
                                          .filter(Boolean)
                                          .join(', ')}
                                      </p>
                                    )}
                                    <p className="text-xs text-muted-foreground italic">
                                      Drag to reschedule
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 flex-shrink-0">
          <span className="text-xs text-muted-foreground">Task types:</span>
          <div className="flex items-center gap-3">
            {(['development', 'research', 'gis', 'marketing', 'general'] as const).map(type => (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'w-3 h-3 rounded border',
                    type === 'development' && 'bg-type-development/20 border-type-development',
                    type === 'research' && 'bg-type-research/20 border-type-research',
                    type === 'gis' && 'bg-type-gis/20 border-type-gis',
                    type === 'marketing' && 'bg-type-marketing/20 border-type-marketing',
                    type === 'general' && 'bg-muted border-border'
                  )}
                />
                <span className="text-xs text-muted-foreground capitalize">{type}</span>
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            <GripVertical className="h-3 w-3 inline mr-1" />
            Drag tasks to reschedule
          </span>
        </div>
      </div>
    </DragDropContext>
  );
}
