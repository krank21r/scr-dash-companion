import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface GuardProps {
  children: ReactNode;
}

/** Blocks access to signed-out visitors; remembers the attempted page. */
export const RequireAuth = ({ children }: GuardProps) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const intended =
      location.pathname === "/" || location.pathname === "" ? undefined : location.pathname;
    return <Navigate to="/login" replace state={{ from: intended }} />;
  }
  return <>{children}</>;
};

/** Blocks write routes for view-only accounts; redirects to the dashboard. */
export const RequireAdmin = ({ children }: GuardProps) => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
