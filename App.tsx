import React, { useState, useEffect, useMemo } from 'react';
import { taskService } from './services/taskService';
import { geminiService } from './services/geminiService';
import { Task, CreateTaskDTO, TaskFilter, TaskStatus, TaskPriority } from './types';
import { TaskCard } from './components/TaskCard';
import { Modal } from './components/Modal';
import { TaskForm } from './components/TaskForm';
import { PlusIcon, FilterIcon, SparklesIcon } from './components/Icons';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');

  const [filter, setFilter] = useState<TaskFilter>({
    status: 'all',
    priority: 'all',
    search: '',
    sortBy: 'created_at',
    sortDir: 'desc'
  });

  // Load Tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await taskService.getAll();
      setTasks(data);
      // Fetch AI Insight after tasks load
      if (geminiService.isEnabled) {
        geminiService.getDailyInsight(data.map(t => t.title)).then(setAiInsight);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handlers
  const handleCreate = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await taskService.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await taskService.update(id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update status", error);
      // Revert if failed
      fetchTasks();
    }
  };

  const handleFormSubmit = async (data: CreateTaskDTO) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        const updated = await taskService.update(editingTask.id, data);
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      } else {
        const created = await taskService.create(data);
        setTasks(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (filter.status !== 'all' && t.status !== filter.status) return false;
        if (filter.priority !== 'all' && t.priority !== filter.priority) return false;
        if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        let valA: any = a[filter.sortBy];
        let valB: any = b[filter.sortBy];
        
        // Handle priority sorting logic manually
        if (filter.sortBy === 'priority') {
          const pMap = { [TaskPriority.HIGH]: 3, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 1 };
          valA = pMap[a.priority];
          valB = pMap[b.priority];
        } else if (filter.sortBy === 'due_date') {
            valA = a.due_date ? new Date(a.due_date).getTime() : 0;
            valB = b.due_date ? new Date(b.due_date).getTime() : 0;
        } else {
            // string/date string compare
             valA = new Date(valA).getTime();
             valB = new Date(valB).getTime();
        }

        if (valA < valB) return filter.sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return filter.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [tasks, filter]);

  // Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    done: tasks.filter(t => t.status === TaskStatus.DONE).length,
  }), [tasks]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">TaskFlow<span className="text-indigo-600">.ai</span></h1>
          </div>
          <button 
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow active:scale-95"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Tasks', value: stats.total, color: 'text-gray-900' },
              { label: 'To Do', value: stats.todo, color: 'text-gray-600' },
              { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600' },
              { label: 'Completed', value: stats.done, color: 'text-emerald-600' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
        </div>

        {/* AI Insight Banner */}
        {aiInsight && (
            <div className="mb-8 bg-gradient-to-r from-purple-100 to-indigo-100 border border-indigo-200 p-4 rounded-xl flex items-start gap-3">
                <SparklesIcon className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="text-sm font-semibold text-indigo-900">AI Assistant says:</h3>
                    <p className="text-indigo-800 text-sm">{aiInsight}</p>
                </div>
            </div>
        )}

        {/* Filters & Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
          <div className="relative w-full md:w-96">
            <input 
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <select 
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-500"
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as any }))}
             >
               <option value="all">All Status</option>
               <option value={TaskStatus.TODO}>To Do</option>
               <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
               <option value={TaskStatus.DONE}>Done</option>
             </select>

             <select 
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-500"
                value={filter.priority}
                onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value as any }))}
             >
               <option value="all">All Priorities</option>
               <option value={TaskPriority.HIGH}>High</option>
               <option value={TaskPriority.MEDIUM}>Medium</option>
               <option value={TaskPriority.LOW}>Low</option>
             </select>

             <button 
                onClick={() => setFilter(prev => ({ ...prev, sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc' }))}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1"
             >
                <FilterIcon className="w-4 h-4" />
                {filter.sortDir === 'asc' ? 'Asc' : 'Desc'}
             </button>
          </div>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
             {[1,2,3].map(i => (
               <div key={i} className="bg-gray-200 h-48 rounded-xl"></div>
             ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
            <p className="text-gray-500 mb-6">Get started by creating a new task.</p>
            <button onClick={handleCreate} className="text-indigo-600 font-medium hover:underline">Create Task</button>
          </div>
        )}
      </main>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        <TaskForm
          initialData={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}

export default App;
