export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  priority: Priority;
  is_completed: boolean;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTodos {
  current_page: number;
  data: Todo[];
  last_page: number;
  per_page: number;
  total: number;
}
