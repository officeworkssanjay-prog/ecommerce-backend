import type { AuthUser } from "./types";

/**
 * All API calls go through this app's own origin (`/api/*` is proxied to the Express API in
 * next.config.ts), so the HttpOnly login cookie is first-party and no CORS is involved.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface ApiResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
  /** Auth endpoints */
  user?: AuthUser;
  token?: string;
  /** Upload endpoint */
  url?: string;
  filename?: string;
  /** Newsletter (non-production only) */
  verificationToken?: string;
  /** Admin contact inbox */
  unread?: number;
}

/** Thrown for every failed call: HTTP errors, validation errors (with per-field messages) and network failures. */
export class ApiError extends Error {
  constructor(
    public readonly status: number, // 0 = could not reach the server
    message: string,
    public readonly errors: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isNetwork() {
    return this.status === 0;
  }
  get isUnauthorized() {
    return this.status === 401;
  }
  get isNotFound() {
    return this.status === 404;
  }
  /** First message for a field, e.g. fieldError("email"). */
  fieldError(field: string): string | undefined {
    return this.errors[field]?.[0];
  }
}

/** Human-readable message for any thrown value. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

const TIMEOUT_MS = 20_000;

export async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // HttpOnly auth cookie
      signal: options.signal ?? controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(0, "The server took too long to respond. Please try again.");
    }
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }

  const json = (await response.json().catch(() => null)) as
    | (Record<string, unknown> & { success?: boolean; message?: string; errors?: Record<string, string[]> })
    | null;

  if (!response.ok || !json || json.success === false) {
    if (response.status === 401 && typeof window !== "undefined" && !endpoint.startsWith("/auth/")) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    const message =
      json?.message ||
      (response.status >= 500 ? "The server ran into a problem. Please try again shortly." : response.statusText) ||
      "Request failed";
    throw new ApiError(response.status, message, json?.errors ?? {});
  }

  return json as unknown as ApiResponse<T>;
}

const body = (value: unknown) => (value instanceof FormData ? value : value === undefined ? undefined : JSON.stringify(value));

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: "GET" }),
  post: <T = unknown>(endpoint: string, payload?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "POST", body: body(payload) }),
  put: <T = unknown>(endpoint: string, payload?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: "PUT", body: body(payload) }),
  delete: <T = unknown>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};

/** Builds `?a=1&b=2`, skipping empty values. */
export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}
