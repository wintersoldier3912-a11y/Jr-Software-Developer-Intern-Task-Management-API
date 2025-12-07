import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { CalendarIcon, EditIcon, TrashIcon, CheckCircleIcon, CircleIcon } from './Icons';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
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

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const isDone = task.status === TaskStatus.DONE;

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDone) {
      onStatusChange(task.id, TaskStatus.TODO);
    } else {
      // Trigger animation
      setIsCompleting(true);
      setTimeout(() => {
        onStatusChange(task.id, TaskStatus.DONE);
        setIsCompleting(false);
      }, 800);
    }
  };

  return (
    <div 
      className={`
        bg-white p-5 rounded-xl shadow-sm border border-gray-200 
        transition-all duration-500 ease-in-out group relative
        ${isCompleting ? 'scale-105 shadow-xl ring-2 ring-emerald-400 bg-emerald-50 z-10' : ''}
        ${isDone ? 'bg-gray-50 opacity-60 hover:opacity-100' : 'hover:shadow-md hover:-translate-y-1'}
      `}
    >
      {/* Overlay for celebration animation */}
      {isCompleting && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-white p-4 rounded-full shadow-lg text-emerald-500 transform scale-125 animate-bounce">
            <CheckCircleIcon className="w-10 h-10" />
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${statusColors[task.status]} transition-colors`}>
          {task.status.replace('_', ' ')}
        </div>
        
        <div className="flex gap-1">
           {/* Status Toggle Button - Always visible or enhanced on hover */}
           <button 
            onClick={handleToggleStatus}
            className={`
              p-1 rounded-full transition-all duration-200
              ${isDone ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100' : 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50'}
            `}
            title={isDone ? "Mark as TODO" : "Mark as DONE"}
          >
            {isDone ? <CheckCircleIcon className="w-5 h-5" /> : <CircleIcon className="w-5 h-5" />}
          </button>

          <div className={`flex gap-1 transition-all duration-200 ml-1 border-l border-gray-100 pl-2 ${isDone ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
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
      </div>
      
      <h3 className={`text-lg font-bold text-gray-800 mb-1 transition-all duration-300 ${isDone ? 'line-through text-gray-400' : ''}`}>
        {task.title}
      </h3>
      <p className={`text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5em] transition-all duration-300 ${isDone ? 'text-gray-400' : ''}`}>
        {task.description}
      </p>
      
      <div className={`flex items-center justify-between mt-auto transition-opacity duration-300 ${isDone ? 'opacity-50' : ''}`}>
        <div className="flex gap-2">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{tag}</span>
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