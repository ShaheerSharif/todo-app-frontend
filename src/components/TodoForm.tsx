import { useState } from 'react';
import type { Priority, Todo } from '../types';
import { toUTCISOString, utcToLocalInputValue } from '../utils/date';

interface TodoFormData {
  title: string;
  description: string;
  priority: Priority;
  due_at: string | null;
}

interface TodoFormProps {
  initial?: Partial<Todo>;
  submitLabel: string;
  onSubmit: (data: TodoFormData) => Promise<void>;
  onCancel?: () => void;
}

export function TodoForm({ initial, submitLabel, onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [dueAt, setDueAt] = useState(utcToLocalInputValue(initial?.due_at ?? null));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ title, description, priority, due_at: toUTCISOString(dueAt) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <input
        placeholder="Title"
        value={title}
        maxLength={40}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />

      <div className="todo-form-row">
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
      </div>

      <div className="todo-form-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
