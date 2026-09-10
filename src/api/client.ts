const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // The backend already stores the token pre-prefixed as "Bearer <token>"
  // (see AuthController::register/login), so we send it as-is.
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: token } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // no/invalid JSON body
  }

  // ResponseTrait always returns HTTP 200 with the intended status inside
  // body.status, EXCEPT for the exception-handler cases in app.php
  // (ValidationException, AuthenticationException, etc.) which use real
  // HTTP status codes. So we must check both.
  if (!res.ok || !body || body.success === false) {
    const message = body?.message ?? 'Something went wrong';
    const rawErrors = body?.data?.error;
    const errors = rawErrors && typeof rawErrors === 'object' ? rawErrors : undefined;
    throw new ApiError(message, body?.status ?? res.status, errors);
  }

  return body.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
