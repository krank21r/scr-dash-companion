/**
 * Application authentication configuration.
 *
 * Two access levels:
 *  - admin   : full access — can add, edit and delete records
 *  - viewer  : read-only access — can browse the dashboard and data
 *
 * NOTE: To change a password, edit the values below and redeploy.
 */
export type Role = "admin" | "viewer";

export interface AppUser {
  username: string;
  password: string;
  name: string;
  role: Role;
}

export interface SessionUser {
  username: string;
  name: string;
  role: Role;
  loginAt: number;
}

export const USERS: AppUser[] = [
  {
    username: "admin",
    password: "Admin@sse",
    name: "Administrator",
    role: "admin",
  },
  {
    username: "ssebudget",
    password: "Lgdbudet@sse",
    name: "SSE Budget",
    role: "viewer",
  },
];

const SESSION_KEY = "scr_auth_session";

/** Validate credentials. Returns the matched user (without password) or null. */
export const verifyCredentials = (username: string, password: string): SessionUser | null => {
  const trimmed = username.trim().toLowerCase();
  const match = USERS.find(
    (u) => u.username.toLowerCase() === trimmed && u.password === password
  );
  if (!match) return null;
  return {
    username: match.username,
    name: match.name,
    role: match.role,
    loginAt: Date.now(),
  };
};

/** Read the persisted session from localStorage, if any. */
export const loadSession = (): SessionUser | null => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as SessionUser;
    if (!session || !session.username || !session.role) return null;
    return session;
  } catch {
    return null;
  }
};

/** Persist the session to localStorage. */
export const saveSession = (session: SessionUser): void => {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // storage unavailable (private mode) — session stays in memory only
  }
};

/** Remove the persisted session. */
export const clearSession = (): void => {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
};

export const isAdminRole = (role: Role | undefined | null): boolean => role === "admin";
