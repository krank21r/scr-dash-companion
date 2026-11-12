import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  SessionUser,
  verifyCredentials,
  loadSession,
  saveSession,
  clearSession,
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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Session is restored synchronously from localStorage — no loading flash.
  const [user, setUser] = useState<SessionUser | null>(() => loadSession());

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

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: user?.role === "admin",
      login,
      logout,
    }),
    [user, login, logout]
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
