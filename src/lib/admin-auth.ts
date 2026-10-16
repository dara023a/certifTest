/**
 * SIMULATION ONLY.
 *
 * This is a client-side demo session stored in `sessionStorage`. It provides no
 * real security: credentials ship in the bundle and the guard can be bypassed.
 * Replace with Supabase Auth (server-side session + RLS) before production.
 */

const SESSION_KEY = "lexa-admin-session";

export const DEMO_ADMIN_USER =
  process.env.NEXT_PUBLIC_ADMIN_DEMO_USER || "admin";
export const DEMO_ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_DEMO_PASSWORD || "admin123";

export interface AdminSession {
  username: string;
  loginAt: string;
}

export function login(username: string, password: string): AdminSession | null {
  if (username === DEMO_ADMIN_USER && password === DEMO_ADMIN_PASSWORD) {
    const session: AdminSession = {
      username,
      loginAt: new Date().toISOString(),
    };
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage failures (private mode, etc.).
    }
    return session;
  }
  return null;
}

export function getSession(): AdminSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as AdminSession;
    return parsed && typeof parsed.username === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function logout(): void {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore.
  }
}
