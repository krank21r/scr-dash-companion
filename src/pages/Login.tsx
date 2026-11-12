import { useState, FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Lock, LogIn, Eye, EyeOff, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import loginBg from "@/assets/login-bg.png";

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const stateFrom = (location.state as { from?: string } | null)?.from;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Already signed in — go straight to the dashboard.
  if (user) {
    return <Navigate to={stateFrom || "/"} replace />;
  }

  const locked = failedAttempts >= 5;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (submitting || locked) return;

    setError(null);
    setSubmitting(true);

    // Small delay so the button state reads clearly, mimicking a real handshake.
    window.setTimeout(() => {
      const result = login(username, password);
      setSubmitting(false);
      if (result) {
        setError(result);
        setFailedAttempts((n) => n + 1);
        return;
      }
      navigate(stateFrom || "/", { replace: true });
    }, 400);
  };

  const inputClass =
    "w-full h-10 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Abstract teal background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-teal-900 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      {/* Soft overlay for depth and card legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-teal-950/30 via-transparent to-teal-900/20"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-teal-950/40 ring-1 ring-white/50 px-6 py-7">
          {/* Compact brand header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30 mb-3">
              <Home size={18} className="text-white" />
            </div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">
              Budget <span className="text-primary">Portal</span>
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mt-0.5">
              Carriage Workshop LGD
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
            {/* Username */}
            <div className="relative">
              <User
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              />
              <input
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                required
                aria-label="User ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="User ID"
                className={`${inputClass} pl-9 pr-3`}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={`${inputClass} pl-9 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-300 hover:text-slate-500 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-[11px] font-semibold text-red-600 leading-snug">{error}</p>
              </motion.div>
            )}

            {locked && (
              <p className="text-[11px] text-slate-400 text-center">
                Too many failed attempts. Refresh the page to try again.
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting || locked}
              className="btn-primary w-full h-10 rounded-lg text-[13px] font-bold gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center mt-5">
          <span className="inline-block rounded-full bg-teal-950/40 backdrop-blur-sm px-4 py-1.5 text-[10px] font-medium text-white/90">
            Restricted access &middot; Authorized users only
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
