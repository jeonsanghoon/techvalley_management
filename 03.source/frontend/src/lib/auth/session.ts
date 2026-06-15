import type { AuthUser } from "./types";

const SESSION_KEY = "tv-auth-session";
const TOKEN_KEY = "tv-auth-tokens";
const SESSION_INVALIDATED_EVENT = "tv:session-invalidated";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "Bearer";
  idToken?: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

export function loadSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession | AuthUser;
    if ("tokens" in parsed && parsed.tokens?.accessToken) {
      return parsed as AuthSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function loadAccessToken(): string | null {
  return loadSession()?.tokens.accessToken ?? null;
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function saveTokens(tokens: AuthTokens): void {
  const current = loadSession();
  if (current) {
    saveSession({ ...current, tokens });
  } else {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  const hadSession = Boolean(localStorage.getItem(SESSION_KEY) || localStorage.getItem(TOKEN_KEY));
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  if (hadSession) {
    window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
  }
}

/** 401·토큰 만료 등으로 세션이 제거되면 AuthContext 등에서 구독 */
export function onSessionInvalidated(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SESSION_INVALIDATED_EVENT, listener);
  return () => window.removeEventListener(SESSION_INVALIDATED_EVENT, listener);
}

/** 레거시 AuthUser-only 세션 호환 */
export function loadLegacyUser(): AuthUser | null {
  const session = loadSession();
  return session?.user ?? null;
}
