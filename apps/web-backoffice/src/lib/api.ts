import { getAccessTokenFromDocument } from '@/lib/auth/cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthToken(): Promise<string | null> {
  return getAccessTokenFromDocument();
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { body, params, headers: customHeaders, ...restOptions } = options;

  const token = await getAuthToken();

  const headers: HeadersInit = {
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...customHeaders,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const url = buildUrl(path, params);

  const response = await fetch(url, {
    ...restOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorData = errorBody?.error ?? errorBody;
    throw new ApiError(
      response.status,
      errorData?.code ?? 'UNKNOWN_ERROR',
      errorData?.message ?? `Request failed with status ${response.status}`,
      errorData?.errors as Record<string, string[]> | undefined,
    );
  }

  if (response.status === 204) {
    return { data: null as T };
  }

  return response.json();
}

async function requestFormData<T>(
  path: string,
  formData: FormData,
  method: 'POST' = 'POST',
): Promise<ApiResponse<T>> {
  const token = await getAuthToken();
  const url = buildUrl(path);

  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    method,
    headers,
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorData = errorBody?.error ?? errorBody;
    throw new ApiError(
      response.status,
      errorData?.code ?? 'UNKNOWN_ERROR',
      errorData?.message ?? `Request failed with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return { data: null as T };
  }

  return response.json();
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),

  postFormData: <T>(path: string, formData: FormData) =>
    requestFormData<T>(path, formData),
};

export { ApiError };
export type { ApiResponse };
