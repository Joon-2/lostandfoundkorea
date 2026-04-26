// Shared client-side fetch helper for admin endpoints. Centralizes the
// x-admin-password header, the 401 → onUnauthorized() short-circuit, and
// JSON parsing. Components keep their own error UI; this helper is
// intentionally minimal.

type AdminFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  password: string;
  onUnauthorized?: () => void;
  signal?: AbortSignal;
};

export async function adminFetch<T = unknown>(
  url: string,
  options: AdminFetchOptions
): Promise<T> {
  const { method = "GET", body, password, onUnauthorized, signal } = options;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": password,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 401) {
    onUnauthorized?.();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Request failed (${res.status}): ${errorText}`);
  }

  // Handle empty responses (e.g. 204)
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
