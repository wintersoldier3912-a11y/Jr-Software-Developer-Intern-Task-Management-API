import { Task, CreateTaskDTO, TaskStatus, TaskPriority } from '../types';

const STORAGE_KEY = 'taskflow_db_v1';
const DELAY_MS = 400; // Simulate network latency

const generateId = (): string => Math.random().toString(36).substr(2, 9);

const seedData: Task[] = [
  {
    id: '1',
    title: 'Review Internship Assignment',
    description: 'Go through the requirements for the Junior Dev task management API.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    due_date: new Date(Date.now() + 86400000).toISOString(),
    tags: ['internship', 'planning'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Setup Project Structure',
    description: 'Initialize React project with TypeScript and Tailwind CSS.',
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    tags: ['dev', 'setup'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const getStoredTasks = (): Task[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData;
  }
  return JSON.parse(stored);
};

const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getStoredTasks()), DELAY_MS);
    });
  },

  create: async (dto: CreateTaskDTO): Promise<Task> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tasks = getStoredTasks();
        const newTask: Task = {
          ...dto,
          id: generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        saveTasks([newTask, ...tasks]);
        resolve(newTask);
      }, DELAY_MS);
    });
  },

  update: async (id: string, updates: Partial<CreateTaskDTO>): Promise<Task> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const tasks = getStoredTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) {
          reject(new Error('Task not found'));
          return;
        }
        const updatedTask = {
          ...tasks[index],
          ...updates,
          updated_at: new Date().toISOString()
        };
        tasks[index] = updatedTask;
        saveTasks(tasks);
        resolve(updatedTask);
      }, DELAY_MS);
    });
  },

  delete: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tasks = getStoredTasks();
        const filtered = tasks.filter(t => t.id !== id);
        saveTasks(filtered);
        resolve();
      }, DELAY_MS);
    });
  }
};