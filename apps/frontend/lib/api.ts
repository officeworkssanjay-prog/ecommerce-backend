const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: any;
  token?: string;
  isFallback?: boolean;
  [key: string]: any;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Include HttpOnly auth cookies
    });

    const json = await response.json().catch(() => ({
      success: false,
      message: response.statusText || "An unexpected error occurred",
    }));

    if (!response.ok && json.success !== false) {
      json.success = false;
    }

    return json;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Server connection failed",
    };
  }
}

export async function withFallback<T = any>(
  apiCall: Promise<ApiResponse<T>>,
  fallback: T
): Promise<{ data: T; isFallback: boolean; message?: string }> {
  try {
    const res = await apiCall;
    if (res.success && (res.data !== undefined || res.user !== undefined)) {
      return {
        data: (res.data !== undefined ? res.data : res.user) as T,
        isFallback: false,
      };
    }
    return {
      data: fallback,
      isFallback: true,
      message: res.message || "Using preview data (database connecting)",
    };
  } catch (err: any) {
    return {
      data: fallback,
      isFallback: true,
      message: "Using preview data (database connecting)",
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
