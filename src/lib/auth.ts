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
const ROLE_OVERRIDES_KEY = "scr_user_role_overrides";
const PASSWORD_OVERRIDES_KEY = "scr_user_password_overrides";

/** Read stored role overrides from localStorage. */
export const getStoredRoleOverrides = (): Record<string, Role> => {
  try {
    const raw = window.localStorage.getItem(ROLE_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Role>;
  } catch {
    return {};
  }
};

/** Read stored password overrides from localStorage. */
export const getStoredPasswordOverrides = (): Record<string, string> => {
  try {
    const raw = window.localStorage.getItem(PASSWORD_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
};

/** Get the list of all users with their current effective roles and passwords applied. */
export const getUsersWithEffectiveRoles = (): AppUser[] => {
  const roleOverrides = getStoredRoleOverrides();
  const passwordOverrides = getStoredPasswordOverrides();
  return USERS.map((u) => {
    const key = u.username.toLowerCase();
    const effectiveRole = roleOverrides[key] || u.role;
    const effectivePassword = passwordOverrides[key] || u.password;
    return {
      ...u,
      role: effectiveRole,
      password: effectivePassword,
    };
  });
};

/** Update a user's role and persist it to localStorage. */
export const updateUserRole = (username: string, newRole: Role): boolean => {
  try {
    const key = username.toLowerCase();
    const overrides = getStoredRoleOverrides();
    overrides[key] = newRole;
    window.localStorage.setItem(ROLE_OVERRIDES_KEY, JSON.stringify(overrides));

    // If the affected user is currently logged in, update their session too
    const currentSession = loadSession();
    if (currentSession && currentSession.username.toLowerCase() === key) {
      currentSession.role = newRole;
      saveSession(currentSession);
    }

    // Trigger an event so active contexts update immediately
    window.dispatchEvent(
      new CustomEvent("scr_auth_roles_updated", { detail: { username, newRole } })
    );
    return true;
  } catch (err) {
    console.error("Failed to update user role:", err);
    return false;
  }
};

/** Update a user's password and persist it to localStorage. */
export const updateUserPassword = (username: string, newPassword: string): boolean => {
  try {
    const trimmed = newPassword.trim();
    if (!trimmed) return false;
    const key = username.toLowerCase();
    const overrides = getStoredPasswordOverrides();
    overrides[key] = trimmed;
    window.localStorage.setItem(PASSWORD_OVERRIDES_KEY, JSON.stringify(overrides));

    window.dispatchEvent(
      new CustomEvent("scr_auth_roles_updated", { detail: { username, type: "password" } })
    );
    return true;
  } catch (err) {
    console.error("Failed to update user password:", err);
    return false;
  }
};

/** Reset role and password overrides back to code defaults. */
export const resetUserRoles = (): void => {
  try {
    window.localStorage.removeItem(ROLE_OVERRIDES_KEY);
    window.localStorage.removeItem(PASSWORD_OVERRIDES_KEY);
    window.dispatchEvent(new CustomEvent("scr_auth_roles_updated"));
  } catch {
    // ignore
  }
};

/** Validate credentials. Returns the matched user (without password) or null. */
export const verifyCredentials = (username: string, password: string): SessionUser | null => {
  const trimmed = username.trim().toLowerCase();
  const allUsers = getUsersWithEffectiveRoles();
  const match = allUsers.find(
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

/** Read the persisted session from localStorage, if any. Ensures effective role is up-to-date. */
export const loadSession = (): SessionUser | null => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as SessionUser;
    if (!session || !session.username || !session.role) return null;

    // Apply any configured role override to the restored session
    const overrides = getStoredRoleOverrides();
    const userKey = session.username.toLowerCase();
    if (overrides[userKey]) {
      session.role = overrides[userKey];
    }

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
