import { ApiResponse } from "../../shared/types";
import { useAuthStore } from "@/store/authStore";
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const { user } = useAuthStore.getState();
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (user) {
    headers.set('X-User-Info', JSON.stringify({ id: user.id, role: user.role }));
  }
  const res = await fetch(path, { ...init, headers });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}