export type TaskType = 'development' | 'research' | 'gis' | 'marketing' | 'general';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'backlog' | 'todo' | 'in-progress' | 'review' | 'blocked' | 'done';
export type Role = 'developer' | 'researcher' | 'gis-specialist' | 'marketer' | 'manager';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  initials: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: TaskType;
  priority: Priority;
  status: Status;
  assigneeIds: string[];
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  
  // Type-specific fields
  gitBranch?: string;
  prLink?: string;
  storyPoints?: number;
  technicalNotes?: string;
  
  protocolNumber?: string;
  literatureRefs?: string[];
  dataSources?: string[];
  ethicsApproval?: 'pending' | 'approved' | 'not-required';
  
  coordinates?: { lat: number; lng: number };
  mapLayer?: string;
  fieldWorkDate?: string;
  spatialDataLinks?: string[];
  
  campaignName?: string;
  contentType?: string;
  approvalStatus?: 'draft' | 'pending' | 'approved' | 'rejected';
  publicationDate?: string;
  
  dependencies?: string[];
  blockedBy?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  teamMemberIds: string[];
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'archived' | 'on-hold';
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'task-assigned' | 'comment-added' | 'task-updated' | 'mention';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  taskId?: string;
  projectId?: string;
}

export interface UserPreferences {
  defaultView: 'kanban' | 'list' | 'calendar' | 'timeline';
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
}

export const STATUS_ORDER: Status[] = ['backlog', 'todo', 'in-progress', 'review', 'blocked', 'done'];

export const STATUS_LABELS: Record<Status, string> = {
  'backlog': 'Backlog',
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'Review',
  'blocked': 'Blocked',
  'done': 'Done'
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'urgent': 'Urgent'
};

export const TYPE_LABELS: Record<TaskType, string> = {
  'development': 'Development',
  'research': 'Research',
  'gis': 'GIS',
  'marketing': 'Marketing',
  'general': 'General'
};

export const ROLE_LABELS: Record<Role, string> = {
  'developer': 'Developer',
  'researcher': 'Researcher',
  'gis-specialist': 'GIS Specialist',
  'marketer': 'Marketer',
  'manager': 'Manager'
};
