import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const PROJECT_COLORS = [
  '#4F46E5', // Indigo
  '#7C3AED', // Purple
  '#059669', // Green
  '#DC2626', // Red
  '#D97706', // Amber
  '#0891B2', // Cyan
  '#DB2777', // Pink
  '#4338CA', // Blue
];

export function CreateProject() {
  const navigate = useNavigate();
  const { addProject, teamMembers } = useProject();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [status, setStatus] = useState<'active' | 'on-hold'>('active');
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const project = addProject({
      title: title.trim(),
      description: description.trim(),
      color,
      status,
      teamMemberIds,
      startDate,
      endDate: endDate || undefined,
    });

    navigate(`/projects/${project.id}`);
  };

  const toggleTeamMember = (id: string) => {
    setTeamMemberIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Create New Project</h1>
          <p className="text-muted-foreground">Set up a new project for your team</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-lg transition-all',
                    color === c && 'ring-2 ring-offset-2 ring-foreground scale-110'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'on-hold')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">End Date (Optional)</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Team Members</label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map(member => {
                const isSelected = teamMemberIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleTeamMember(member.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors',
                      isSelected 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                      {member.initials}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs opacity-70 capitalize">{member.role.replace('-', ' ')}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
