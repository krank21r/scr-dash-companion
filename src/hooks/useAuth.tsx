import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  Role,
  AppUser,
  SessionUser,
  verifyCredentials,
  loadSession,
  saveSession,
  clearSession,
  getUsersWithEffectiveRoles,
  updateUserRole,
  updateUserPassword,
  resetUserRoles,
} from "@/lib/auth";

interface AuthContextValue {
  /** Currently signed-in user, or null when signed out. */
  user: SessionUser | null;
  /** True when the signed-in user has admin (write) privileges. */
  isAdmin: boolean;
  /** Attempt to sign in. Returns null on success or an error message on failure. */
  login: (username: string, password: string) => string | null;
  /** Sign out and clear the persisted session. */
  logout: () => void;
  /** Get all configured users with their current effective roles and passwords. */
  getUsers: () => AppUser[];
  /** Change a user's role (admin only). */
  updateRole: (username: string, newRole: Role) => boolean;
  /** Change a user's password (admin only). */
  updatePassword: (username: string, newPassword: string) => boolean;
  /** Reset user roles and credentials to code defaults. */
  resetRoles: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Session is restored synchronously from localStorage — no loading flash.
  const [user, setUser] = useState<SessionUser | null>(() => loadSession());
  const [roleVersion, setRoleVersion] = useState(0);

  // Synchronize when roles are changed from another component, window, or modal
  useEffect(() => {
    const handleUpdate = () => {
      setUser(loadSession());
      setRoleVersion((v) => v + 1);
    };

    window.addEventListener("scr_auth_roles_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("scr_auth_roles_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const login = useCallback((username: string, password: string): string | null => {
    const session = verifyCredentials(username, password);
    if (!session) {
      return "Invalid username or password. Please try again.";
    }
    saveSession(session);
    setUser(session);
    return null;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const getUsers = useCallback((): AppUser[] => {
    return getUsersWithEffectiveRoles();
  }, [roleVersion]);

  const updateRole = useCallback((username: string, newRole: Role): boolean => {
    const success = updateUserRole(username, newRole);
    if (success) {
      setUser(loadSession());
      setRoleVersion((v) => v + 1);
    }
    return success;
  }, []);

  const updatePassword = useCallback((username: string, newPassword: string): boolean => {
    const success = updateUserPassword(username, newPassword);
    if (success) {
      setRoleVersion((v) => v + 1);
    }
    return success;
  }, []);

  const resetRoles = useCallback(() => {
    resetUserRoles();
    setUser(loadSession());
    setRoleVersion((v) => v + 1);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: user?.role === "admin",
      login,
      logout,
      getUsers,
      updateRole,
      updatePassword,
      resetRoles,
    }),
    [user, login, logout, getUsers, updateRole, updatePassword, resetRoles]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
