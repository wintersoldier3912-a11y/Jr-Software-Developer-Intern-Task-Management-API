export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string; // ISO 8601
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  tags: string[];
}

export interface TaskFilter {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  search: string;
  sortBy: 'created_at' | 'due_date' | 'priority';
  sortDir: 'asc' | 'desc';
}