'use client';

import React, { useState } from 'react';
import { apiClient } from '../../../lib/api-client';

interface FirstTaskStepProps {
  onTaskCreated?: () => void;
}

export function FirstTaskStep({ onTaskCreated }: FirstTaskStepProps) {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');

  const handleCreateTask = async () => {
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const result = await apiClient.createTask(title.trim());
      if (result.data) {
        setCreated(true);
        onTaskCreated?.();
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to create task. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (created) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold">Task Created!</h2>

        <p className="text-muted-foreground">
          Great job! You&apos;ve created your first task. You can view and manage it in
          your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Create Your First Task</h2>
        <p className="text-muted-foreground mt-2">
          Let&apos;s get you started with your first task
        </p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="taskTitle" className="block text-sm font-medium mb-2">
            What do you need to do?
          </label>
          <input
            type="text"
            id="taskTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g., Review project proposal"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateTask();
              }
            }}
          />
        </div>

        <button
          onClick={handleCreateTask}
          disabled={isCreating || !title.trim()}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'Create Task'}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          You can skip this step and create tasks later
        </p>
      </div>
    </div>
  );
}

export default FirstTaskStep;
