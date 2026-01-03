import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useProject } from '@/contexts/ProjectContext';
import { Status, STATUS_ORDER, STATUS_LABELS } from '@/types';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  projectId: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { getProjectTasks, updateTaskStatus, setCurrentTaskId } = useProject();
  const tasks = getProjectTasks(projectId);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as Status;
    
    updateTaskStatus(taskId, newStatus);
  };

  const getTasksByStatus = (status: Status) => 
    tasks.filter(t => t.status === status);

  const getColumnColor = (status: Status) => {
    switch (status) {
      case 'backlog': return 'bg-status-backlog';
      case 'todo': return 'bg-status-todo';
      case 'in-progress': return 'bg-status-progress';
      case 'review': return 'bg-status-review';
      case 'blocked': return 'bg-status-blocked';
      case 'done': return 'bg-status-done';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full overflow-x-auto scrollbar-thin">
        <div className="flex gap-4 p-6 min-w-max h-full">
          {STATUS_ORDER.map(status => {
            const columnTasks = getTasksByStatus(status);
            return (
              <div 
                key={status}
                className="flex flex-col w-72 flex-shrink-0"
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={cn('w-3 h-3 rounded-full', getColumnColor(status))} />
                  <h3 className="font-semibold text-foreground">{STATUS_LABELS[status]}</h3>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column content */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex-1 rounded-xl p-2 transition-colors overflow-y-auto scrollbar-thin',
                        snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/30'
                      )}
                    >
                      <div className="space-y-2">
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setCurrentTaskId(task.id)}
                                className={cn(
                                  'transition-transform',
                                  snapshot.isDragging && 'rotate-2 scale-105'
                                )}
                              >
                                <TaskCard task={task} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                      
                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No tasks
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
}
