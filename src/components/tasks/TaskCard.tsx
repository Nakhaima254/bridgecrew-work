import React from 'react';
import { Calendar, MessageSquare, Paperclip, AlertTriangle } from 'lucide-react';
import { Task, PRIORITY_LABELS, TYPE_LABELS } from '@/types';
import { useProject } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { getTeamMember, getTaskComments } = useProject();
  const comments = getTaskComments(task.id);
  const assignees = task.assigneeIds.map(id => getTeamMember(id)).filter(Boolean);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-priority-urgent text-primary-foreground';
      case 'high': return 'bg-priority-high text-primary-foreground';
      case 'medium': return 'bg-priority-medium text-foreground';
      case 'low': return 'bg-priority-low text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: Task['type']) => {
    switch (type) {
      case 'development': return 'bg-taskType-development/10 text-taskType-development';
      case 'research': return 'bg-taskType-research/10 text-taskType-research';
      case 'gis': return 'bg-taskType-gis/10 text-taskType-gis';
      case 'marketing': return 'bg-taskType-marketing/10 text-taskType-marketing';
      case 'general': return 'bg-taskType-general/10 text-taskType-general';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const isBlocked = task.status === 'blocked';

  return (
    <div className={cn(
      'bg-card rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer',
      isBlocked && 'border-status-blocked/50 bg-status-blocked/5',
      isOverdue && !isBlocked && 'border-warning/50'
    )}>
      {/* Type and Priority badges */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getTypeColor(task.type))}>
          {TYPE_LABELS[task.type]}
        </span>
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getPriorityColor(task.priority))}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {isBlocked && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-status-blocked/10 text-status-blocked flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Blocked
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-medium text-foreground mb-2 line-clamp-2">{task.title}</h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map(tag => (
            <span 
              key={tag}
              className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        {/* Assignees */}
        <div className="flex -space-x-1.5">
          {assignees.slice(0, 3).map(member => (
            <div 
              key={member!.id}
              className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center border-2 border-card"
              title={member!.name}
            >
              {member!.initials}
            </div>
          ))}
          {assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center border-2 border-card">
              +{assignees.length - 3}
            </div>
          )}
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-muted-foreground">
          {comments.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              {comments.length}
            </div>
          )}
          {task.dueDate && (
            <div className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue && 'text-warning'
            )}>
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(task.dueDate), 'MMM d')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
