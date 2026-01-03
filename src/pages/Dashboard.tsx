import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const navigate = useNavigate();
  const { projects, tasks, teamMembers } = useProject();

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    { 
      label: 'Completion Rate', 
      value: `${completionRate}%`, 
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    { 
      label: 'Completed', 
      value: completedTasks, 
      icon: CheckCircle2,
      color: 'text-status-done',
      bgColor: 'bg-status-done/10'
    },
    { 
      label: 'In Progress', 
      value: inProgressTasks, 
      icon: Clock,
      color: 'text-status-progress',
      bgColor: 'bg-status-progress/10'
    },
    { 
      label: 'Blocked', 
      value: blockedTasks, 
      icon: AlertTriangle,
      color: 'text-status-blocked',
      bgColor: 'bg-status-blocked/10'
    },
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's an overview of your projects.
            </p>
          </div>
          <Button onClick={() => navigate('/projects/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Active Projects</h2>
            <span className="text-sm text-muted-foreground">
              {projects.filter(p => p.status === 'active').length} projects
            </span>
          </div>
          
          {projects.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first project to get started
              </p>
              <Button onClick={() => navigate('/projects/new')}>
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.filter(p => p.status === 'active').map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Team Overview */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Team Members</h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-border">
              {teamMembers.map(member => {
                const memberTasks = tasks.filter(t => t.assigneeIds.includes(member.id) && t.status !== 'done');
                return (
                  <div key={member.id} className="p-4 text-center hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center mx-auto mb-2">
                      {member.initials}
                    </div>
                    <p className="font-medium text-foreground text-sm truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role.replace('-', ' ')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {memberTasks.length} active task{memberTasks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
