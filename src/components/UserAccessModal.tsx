import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Role } from "@/lib/auth";
import {
  ShieldCheck,
  Shield,
  Eye,
  EyeOff,
  Check,
  Lock,
  KeyRound,
  Users,
  Info,
  RotateCcw,
} from "lucide-react";

interface UserAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserAccessModal = ({ open, onOpenChange }: UserAccessModalProps) => {
  const { getUsers, updateRole, updatePassword, resetRoles } = useAuth();
  const { toast } = useToast();

  const [usersList, setUsersList] = useState(() => getUsers());
  const [selectedRoles, setSelectedRoles] = useState<Record<string, Role>>({});
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Sync state whenever dialog opens
  useEffect(() => {
    if (open) {
      const current = getUsers();
      setUsersList(current);
      const initialRoles: Record<string, Role> = {};
      const initialPasswords: Record<string, string> = {};
      current.forEach((u) => {
        const key = u.username.toLowerCase();
        initialRoles[key] = u.role;
        initialPasswords[key] = u.password;
      });
      setSelectedRoles(initialRoles);
      setPasswords(initialPasswords);
      setPasswordErrors({});
    }
  }, [open, getUsers]);

  const handleRoleChange = (username: string, newRole: Role) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [username.toLowerCase()]: newRole,
    }));
  };

  const handlePasswordChange = (username: string, val: string) => {
    const key = username.toLowerCase();
    setPasswords((prev) => ({
      ...prev,
      [key]: val,
    }));

    if (val.trim().length > 0 && val.trim().length < 4) {
      setPasswordErrors((prev) => ({
        ...prev,
        [key]: "Password must be at least 4 characters long",
      }));
    } else {
      setPasswordErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleShowPassword = (username: string) => {
    const key = username.toLowerCase();
    setShowPassword((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    // Validate passwords
    let hasError = false;
    usersList.forEach((u) => {
      const key = u.username.toLowerCase();
      const pwd = (passwords[key] ?? "").trim();
      if (!pwd) {
        setPasswordErrors((prev) => ({ ...prev, [key]: "Password cannot be empty" }));
        hasError = true;
      } else if (pwd.length < 4) {
        setPasswordErrors((prev) => ({ ...prev, [key]: "Password must be at least 4 characters" }));
        hasError = true;
      }
    });

    if (hasError) return;

    setSaving(true);
    let roleUpdated = false;
    let passwordUpdated = false;

    usersList.forEach((u) => {
      const key = u.username.toLowerCase();
      const newRole = selectedRoles[key];
      const newPwd = (passwords[key] ?? "").trim();

      if (newRole && newRole !== u.role) {
        updateRole(u.username, newRole);
        roleUpdated = true;
      }

      if (newPwd && newPwd !== u.password) {
        updatePassword(u.username, newPwd);
        passwordUpdated = true;
      }
    });

    setSaving(false);
    onOpenChange(false);

    const sseRole = selectedRoles["ssebudget"] || "viewer";
    const roleLabel = sseRole === "admin" ? "Full Access (Admin)" : "Read-only (Viewer)";

    if (roleUpdated && passwordUpdated) {
      toast({
        title: "Account Settings Saved",
        description: `Permissions and password for SSE Budget updated successfully (${roleLabel}).`,
      });
    } else if (passwordUpdated) {
      toast({
        title: "Password Updated",
        description: "Password for SSE Budget was updated successfully.",
      });
    } else if (roleUpdated) {
      toast({
        title: "Permissions Updated",
        description: `SSE Budget access level is now ${roleLabel}.`,
      });
    } else {
      toast({
        title: "No Changes",
        description: "User settings are already up to date.",
      });
    }
  };

  const handleReset = () => {
    resetRoles();
    const refreshed = getUsers();
    setUsersList(refreshed);
    const initialRoles: Record<string, Role> = {};
    const initialPasswords: Record<string, string> = {};
    refreshed.forEach((u) => {
      const key = u.username.toLowerCase();
      initialRoles[key] = u.role;
      initialPasswords[key] = u.password;
    });
    setSelectedRoles(initialRoles);
    setPasswords(initialPasswords);
    setPasswordErrors({});

    toast({
      title: "Settings Restored",
      description: "Permissions and passwords have been restored to system defaults.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                User Access &amp; Permissions
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Manage roles, access levels, and login credentials for accounts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Cards */}
          {usersList.map((appUser) => {
            const key = appUser.username.toLowerCase();
            const isSystemAdmin = key === "admin";
            const currentRole = selectedRoles[key] || appUser.role;
            const currentPassword = passwords[key] ?? appUser.password;
            const isPasswordVisible = !!showPassword[key];
            const pwdError = passwordErrors[key];

            return (
              <div
                key={appUser.username}
                className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                        isSystemAdmin
                          ? "bg-slate-900 text-white"
                          : currentRole === "admin"
                          ? "bg-emerald-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {appUser.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {appUser.name}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          @{appUser.username}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isSystemAdmin
                          ? "Primary System Administrator"
                          : currentRole === "admin"
                          ? "Currently has Full Access"
                          : "Currently has Read-Only Access"}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {currentRole === "admin" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck size={13} className="text-emerald-600" />
                        Full Access
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <Eye size={13} className="text-blue-600" />
                        Read Only
                      </span>
                    )}
                  </div>
                </div>

                {/* Role Switcher */}
                {isSystemAdmin ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/80 p-2.5 rounded-lg border border-slate-100">
                    <Lock size={13} className="shrink-0 text-slate-400" />
                    <span>System administrator access is locked to prevent accidental lockout.</span>
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {/* Access Level Selector */}
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Access Level
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Read-Only Option */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange(appUser.username, "viewer")}
                          className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                            currentRole === "viewer"
                              ? "border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-500/20"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span
                              className={`text-xs font-semibold flex items-center gap-1.5 ${
                                currentRole === "viewer" ? "text-blue-900" : "text-slate-700"
                              }`}
                            >
                              <Eye size={14} className={currentRole === "viewer" ? "text-blue-600" : "text-slate-400"} />
                              Read Only
                            </span>
                            {currentRole === "viewer" && (
                              <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                <Check size={11} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Browse dashboard, view RSP/IRSP works, contingencies &amp; unit cost.
                          </p>
                        </button>

                        {/* Full Access Option */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange(appUser.username, "admin")}
                          className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                            currentRole === "admin"
                              ? "border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/20"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span
                              className={`text-xs font-semibold flex items-center gap-1.5 ${
                                currentRole === "admin" ? "text-emerald-900" : "text-slate-700"
                              }`}
                            >
                              <ShieldCheck size={14} className={currentRole === "admin" ? "text-emerald-600" : "text-slate-400"} />
                              Full Access
                            </span>
                            {currentRole === "admin" && (
                              <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                <Check size={11} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Full rights to add, edit &amp; delete works, contingencies, notes &amp; spreadsheets.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Password Management Option for ssebudget */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <label
                          htmlFor={`password-${key}`}
                          className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                        >
                          <KeyRound size={14} className="text-primary" />
                          Account Password
                        </label>
                        {currentPassword !== "Lgdbudet@sse" && (
                          <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                            Custom password
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <Input
                          id={`password-${key}`}
                          type={isPasswordVisible ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => handlePasswordChange(appUser.username, e.target.value)}
                          placeholder="Enter new password"
                          className={`h-9 pr-10 text-xs font-mono ${
                            pwdError ? "border-red-400 focus-visible:ring-red-400" : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(appUser.username)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                          title={isPasswordVisible ? "Hide password" : "Show password"}
                        >
                          {isPasswordVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {pwdError ? (
                        <p className="text-[11px] text-red-500 mt-1.5">{pwdError}</p>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                          <span>Default password: <code className="text-slate-600">Lgdbudet@sse</code></span>
                          {currentPassword !== "Lgdbudet@sse" && (
                            <button
                              type="button"
                              onClick={() => handlePasswordChange(appUser.username, "Lgdbudet@sse")}
                              className="text-primary hover:underline text-[11px] font-medium ml-2"
                            >
                              Reset to default
                            </button>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick Info Box */}
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5 flex items-start gap-3">
            <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold">Instant Application:</span> Password and permission updates
              take effect immediately. The user can sign in with the new password on their next login attempt.
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-3 border-t border-slate-100 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Reset All to Defaults
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-xs rounded-lg font-semibold px-4"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
