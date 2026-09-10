import { useState } from 'react';
import type { Priority, Todo } from '../types';
import { TodoForm } from './TodoForm';

interface TodoFormData {
  title: string;
  description: string;
  priority: Priority;
  due_at: string;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => Promise<void>;
  onUpdate: (id: number, data: TodoFormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this todo?')) return;
    setDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <li className="todo-item todo-item-editing">
        <TodoForm
          initial={todo}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            await onUpdate(todo.id, data);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className={`todo-item priority-${todo.priority} ${todo.is_completed ? 'completed' : ''}`}>
      <label className="todo-check">
        <input type="checkbox" checked={todo.is_completed} onChange={() => onToggle(todo)} />
      </label>

      <div className="todo-body">
        <div className="todo-title-row">
          <span className="todo-title">{todo.title}</span>
          <span className={`badge badge-${todo.priority}`}>{todo.priority}</span>
        </div>
        {todo.description && <p className="todo-description">{todo.description}</p>}
        {todo.due_at && (
          <span className="todo-due">Due {new Date(todo.due_at).toLocaleString()}</span>
        )}
      </div>

      <div className="todo-actions">
        <button className="btn-icon" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button className="btn-icon btn-danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? '...' : 'Delete'}
        </button>
      </div>
    </li>
  );
}
