import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { Project, Task } from '@/types';
import { useProject } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const { getProjectTasks, teamMembers } = useProject();
  
  const tasks = getProjectTasks(project.id);
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const projectMembers = teamMembers.filter(m => project.teamMemberIds.includes(m.id));

  return (
    <div 
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-primary-foreground"
            style={{ backgroundColor: project.color }}
          >
            {project.title.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full capitalize',
              project.status === 'active' && 'bg-success/10 text-success',
              project.status === 'completed' && 'bg-muted text-muted-foreground',
              project.status === 'on-hold' && 'bg-warning/10 text-warning',
              project.status === 'archived' && 'bg-muted text-muted-foreground'
            )}>
              {project.status}
            </span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {project.description}
      </p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progress}%`,
              backgroundColor: project.color 
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {/* Team members */}
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {projectMembers.slice(0, 3).map(member => (
              <div 
                key={member.id}
                className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center border-2 border-card"
                title={member.name}
              >
                {member.initials}
              </div>
            ))}
            {projectMembers.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground text-xs font-medium flex items-center justify-center border-2 border-card">
                +{projectMembers.length - 3}
              </div>
            )}
          </div>
        </div>

        {/* Due date */}
        {project.endDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(new Date(project.endDate), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
