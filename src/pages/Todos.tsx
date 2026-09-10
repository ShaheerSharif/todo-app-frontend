import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';
import type { PaginatedTodos, Priority, Todo } from '../types';
import { TodoForm } from '../components/TodoForm';
import { TodoItem } from '../components/TodoItem';
import { useAuth } from '../context/AuthContext';

interface TodoFormData {
  title: string;
  description: string;
  priority: Priority;
  due_at: string;
}

export function Todos() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const loadTodos = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ todos: PaginatedTodos }>(`/todo?page=${pageNum}`);
      setTodos(data.todos.data);
      setPage(data.todos.current_page);
      setLastPage(data.todos.last_page);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos(1);
  }, [loadTodos]);

  async function handleCreate(data: TodoFormData) {
    await api.post<{ todo: Todo }>('/todo/store', {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      due_at: data.due_at || null,
    });
    setShowForm(false);
    loadTodos(page);
  }

  async function handleUpdate(id: number, data: TodoFormData) {
    await api.post<{ todo: Todo }>(`/todo/update/${id}`, {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      due_at: data.due_at || null,
    });
    loadTodos(page);
  }

  async function handleToggle(todo: Todo) {
    await api.post<{ todo: Todo }>(`/todo/update/${todo.id}`, {
      is_completed: !todo.is_completed,
    });
    loadTodos(page);
  }

  async function handleDelete(id: number) {
    await api.delete(`/todo/destroy/${id}`);
    loadTodos(page);
  }

  const visibleTodos = todos.filter((t) => {
    if (filter === 'active') return !t.is_completed;
    if (filter === 'completed') return t.is_completed;
    return true;
  });

  return (
    <div className="todos-page">
      <header className="todos-header">
        <div>
          <h1>My Todos</h1>
          <p className="todos-subtitle">Signed in as {user?.name}</p>
        </div>
        <button className="btn-secondary" onClick={logout}>
          Logout
        </button>
      </header>

      <div className="todos-toolbar">
        <div className="filter-group">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Todo'}
        </button>
      </div>

      {showForm && (
        <div className="todo-form-card">
          <TodoForm submitLabel="Create" onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="page-loading">Loading todos...</div>
      ) : visibleTodos.length === 0 ? (
        <div className="empty-state">No todos here. Add one to get started.</div>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {lastPage > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => loadTodos(page - 1)}>
            Prev
          </button>
          <span>
            Page {page} of {lastPage}
          </span>
          <button disabled={page >= lastPage} onClick={() => loadTodos(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
