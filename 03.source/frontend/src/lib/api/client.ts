import { getApiBaseUrl } from "./config";
import { attachEndpoint } from "./scope-meta";
import type { DataSourceMeta } from "@/lib/data/scope";
import { clearSession, loadAccessToken, loadSession, saveSession, type AuthTokens } from "@/lib/auth/session";

export type ApiEnvelope<T> = {
  data: T;
  meta: DataSourceMeta;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function refreshAccessToken(): Promise<AuthTokens | null> {
  const session = loadSession();
  if (!session?.tokens.refreshToken) return null;

  const base = getApiBaseUrl();
  if (!base) return null;

  const res = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken: session.tokens.refreshToken }),
  });

  if (!res.ok) return null;
  const json = await res.json();
  const tokens = (json.data?.tokens ?? json.tokens ?? json.data ?? json) as AuthTokens;
  if (!tokens?.accessToken) return null;

  saveSession({ ...session, tokens });
  return tokens;
}

async function fetchApiResponse(path: string, init?: RequestInit): Promise<Response> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("API base URL is not configured (see 03.source/frontend/.env.local.example)");
  }

  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const token = loadAccessToken();
  const isPublicAuth =
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/users") ||
    path.startsWith("/auth/config") ||
    path.startsWith("/auth/refresh");

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token && !isPublicAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401 && token && !path.includes("/auth/login")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${refreshed.accessToken}`;
      res = await fetch(url, { ...init, headers });
    }
  }

  if (res.status === 401) {
    clearSession();
  }

  if (!res.ok) throw new ApiError(`${path} → ${res.status}`, res.status);
  return res;
}

/** `{ data, meta }` envelope — 조회 API·DB 소스 메타 보존 */
export async function fetchApiEnvelope<T>(path: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  const res = await fetchApiResponse(path, init);
  const json = await res.json();
  if (json && typeof json === "object" && "data" in json && json.data !== undefined) {
    return {
      data: json.data as T,
      meta: attachEndpoint((json.meta ?? {}) as DataSourceMeta, path),
    };
  }
  return {
    data: json as T,
    meta: attachEndpoint((json?.meta ?? {}) as DataSourceMeta, path),
  };
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const envelope = await fetchApiEnvelope<T>(path, init);
  return envelope.data;
}
