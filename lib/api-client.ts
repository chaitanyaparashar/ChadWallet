import type { DataResult } from "@/types";

/**
 * Fetches `path` and parses the JSON body as `DataResult<T>`.
 * Throws if the response status is not OK.
 */
export async function apiGet<T>(path: string): Promise<DataResult<T>> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return (await res.json()) as DataResult<T>;
}

/**
 * POSTs `body` as JSON to `path` and parses the JSON response as `DataResult<T>`.
 * Throws if the response status is not OK.
 */
export async function apiPost<T>(path: string, body: unknown): Promise<DataResult<T>> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`POST ${path} failed: ${res.status}`);
  }
  return (await res.json()) as DataResult<T>;
}
