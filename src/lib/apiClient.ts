import { auth } from "@/lib/firebase";

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

async function getIdToken() {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Failed to get ID token", error);
    return null;
  }
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const token = await getIdToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseURL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
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

