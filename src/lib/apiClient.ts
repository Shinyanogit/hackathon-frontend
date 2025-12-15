import { auth } from "@/lib/firebase";

export class ApiError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(body || `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

async function request<T>(path: string, options: ApiRequestOptions = {}, retried = false): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Failed to get ID token", error);
    }
  }

  const res = await fetch(`${apiBaseURL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    // 401で一度だけIDトークンを強制リフレッシュしてリトライ
    if (res.status === 401 && !retried && user) {
      try {
        const fresh = await user.getIdToken(true);
        headers.Authorization = `Bearer ${fresh}`;
        return request<T>(path, { ...options, headers }, true);
      } catch (e) {
        console.error("Failed to refresh ID token", e);
      }
    }
    const text = await res.text();
    throw new ApiError(res.status, text || res.statusText);
  }

  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: "GET", headers }),
  post: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: "POST", body, headers }),
  put: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: "PUT", body, headers }),
  patch: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: "PATCH", body, headers }),
  delete: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: "DELETE", headers }),
};
