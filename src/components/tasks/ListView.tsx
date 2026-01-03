import React, { useState } from 'react';
import { ArrowUpDown, Filter, Search } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { Task, Status, Priority, TaskType, STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

interface ListViewProps {
  projectId: string;
}

export function ListView({ projectId }: ListViewProps) {
  const { getProjectTasks, setCurrentTaskId, teamMembers, getTeamMember } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');

  const tasks = getProjectTasks(projectId);

  // Apply filters
  let filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (typeFilter !== 'all' && task.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Apply sorting
  filteredTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-priority-urgent text-primary-foreground';
      case 'high': return 'bg-priority-high text-primary-foreground';
      case 'medium': return 'bg-priority-medium text-foreground';
      case 'low': return 'bg-priority-low text-primary-foreground';
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'backlog': return 'bg-status-backlog/10 text-status-backlog';
      case 'todo': return 'bg-status-todo/10 text-status-todo';
      case 'in-progress': return 'bg-status-progress/10 text-status-progress';
      case 'review': return 'bg-status-review/10 text-status-review';
      case 'blocked': return 'bg-status-blocked/10 text-status-blocked';
      case 'done': return 'bg-status-done/10 text-status-done';
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Filters */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TaskType | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'dueDate' | 'priority' | 'title')}>
          <SelectTrigger className="w-36">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm border-b border-border">
            <tr className="text-left text-sm text-muted-foreground">
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium w-28">Type</th>
              <th className="px-4 py-3 font-medium w-28">Status</th>
              <th className="px-4 py-3 font-medium w-24">Priority</th>
              <th className="px-4 py-3 font-medium w-32">Assignee</th>
              <th className="px-4 py-3 font-medium w-28">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredTasks.map(task => {
              const assignee = task.assigneeIds[0] ? getTeamMember(task.assigneeIds[0]) : null;
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
              
              return (
                <tr 
                  key={task.id}
                  onClick={() => setCurrentTaskId(task.id)}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {TYPE_LABELS[task.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-1 rounded-full', getStatusColor(task.status))}>
                      {STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-1 rounded-full', getPriorityColor(task.priority))}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {assignee && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                          {assignee.initials}
                        </div>
                        <span className="text-sm text-foreground truncate">{assignee.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {task.dueDate && (
                      <span className={cn(
                        'text-sm',
                        isOverdue ? 'text-warning font-medium' : 'text-muted-foreground'
                      )}>
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No tasks match your filters
          </div>
        )}
      </div>
    </div>
  );
}
