import React, { useState, useEffect } from 'react';
import { CreateTaskDTO, Task, TaskPriority, TaskStatus } from '../types';
import { SparklesIcon } from './Icons';
import { geminiService } from '../services/geminiService';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: CreateTaskDTO) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState<CreateTaskDTO>({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    tags: [],
    due_date: ''
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        status: initialData.status,
        priority: initialData.priority,
        tags: initialData.tags,
        due_date: initialData.due_date ? initialData.due_date.split('T')[0] : ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleAiEnhance = async () => {
    if (!formData.title) return;
    setIsAiLoading(true);
    try {
      const suggestions = await geminiService.enhanceTask(formData.title);
      setFormData(prev => ({
        ...prev,
        description: suggestions.description || prev.description,
        priority: suggestions.priority || prev.priority,
        tags: suggestions.tags ? [...new Set([...prev.tags, ...suggestions.tags])] : prev.tags
      }));
    } catch (err) {
      alert("Failed to fetch AI suggestions. Check your API key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <div className="flex gap-2">
          <input
            type="text"
            required
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Fix Navigation Bug"
          />
          {geminiService.isEnabled && (
            <button
              type="button"
              onClick={handleAiEnhance}
              disabled={isAiLoading || !formData.title}
              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
              title="Auto-fill description and tags with AI"
            >
              <SparklesIcon className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">AI Fill</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
          >
            {Object.values(TaskStatus).map(s => (
              <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
          >
            {Object.values(TaskPriority).map(p => (
              <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed explanation of the task..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
        <input
          type="date"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          value={formData.due_date}
          onChange={e => setFormData({ ...formData, due_date: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add tag and press Enter"
          />
          <button type="button" onClick={addTag} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full flex items-center gap-1">
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-900">&times;</button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Task' : 'Create Task')}
        </button>
      </div>
    </form>
  );
};