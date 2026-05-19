/**
 * Centralized API client for communicating with the backend.
 * All frontend services should use this client instead of importing local data.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
  meta?: { processingTimeMs: number };
}

/**
 * Make a GET request to the backend API.
 */
export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.error?.message || `API error: ${response.status} ${response.statusText}`
    );
  }

  const json: ApiResponse<T> = await response.json();
  if (!json.success) {
    throw new Error(json.error?.message || "Unknown API error");
  }
  return json.data;
}

/**
 * Make a POST request to the backend API.
 */
export async function apiPost<T>(path: string, body: unknown, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.error?.message || `API error: ${response.status} ${response.statusText}`
    );
  }

  const json: ApiResponse<T> = await response.json();
  if (!json.success) {
    throw new Error(json.error?.message || "Unknown API error");
  }
  return json.data;
}

/**
 * Make a streaming POST request to the backend API (for SSE chat).
 * Returns the raw Response so the caller can consume the stream.
 */
export async function apiPostStream(path: string, body: unknown): Promise<Response> {
  const url = new URL(path, API_BASE_URL);
  url.searchParams.set("stream", "true");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API stream error: ${response.status} ${response.statusText}`);
  }

  return response;
}

export { API_BASE_URL };
