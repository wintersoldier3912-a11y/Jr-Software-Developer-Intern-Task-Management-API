import React from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { CalendarIcon, EditIcon, TrashIcon } from './Icons';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-600',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
  [TaskStatus.DONE]: 'bg-emerald-100 text-emerald-700'
};

const priorityColors = {
  [TaskPriority.LOW]: 'text-gray-500',
  [TaskPriority.MEDIUM]: 'text-orange-500',
  [TaskPriority.HIGH]: 'text-red-500'
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-2">
        <div className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${statusColors[task.status]}`}>
          {task.status.replace('_', ' ')}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
            title="Edit"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-1">{task.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5em]">{task.description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-2">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">#{tag}</span>
          ))}
          {task.tags.length > 2 && <span className="text-xs text-gray-400 px-1 py-1">+{task.tags.length - 2}</span>}
        </div>
        
        <div className="flex items-center gap-3 text-xs">
           <span className={`font-semibold ${priorityColors[task.priority]}`}>
             {task.priority.toUpperCase()}
           </span>
           {task.due_date && (
             <div className="flex items-center gap-1 text-gray-400" title={`Due: ${new Date(task.due_date).toLocaleDateString()}`}>
               <CalendarIcon className="w-3 h-3" />
               <span>{new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};