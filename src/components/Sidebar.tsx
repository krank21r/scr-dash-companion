import { Link, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  AlertCircle,
  TrendingUp,
  LayoutDashboard,
  Link as LinkIcon,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { APP_VERSION } from "@/config/version";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenUserAccess?: () => void;
}

export const Sidebar = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  onOpenUserAccess,
}: SidebarProps) => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isCollapsed !== undefined) {
      setCollapsed(isCollapsed);
    }
  }, [isCollapsed]);

  const mainNavItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/rsp-works", label: "RSP Works", icon: FileText },
    { path: "/irsp-works", label: "IRSP Works", icon: Layers },
    { path: "/contingencies", label: "Contingencies", icon: AlertCircle },
    { path: "/unit-cost", label: "Unit Cost", icon: TrendingUp },
  ];

  const resourceNavItems = [
    { path: "/weblinks", label: "Web Links", icon: LinkIcon },
    { path: "/info", label: "Info & About", icon: Info },
  ];

  const sidebarContent = (
    <div
      className={`h-full flex flex-col transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-18 flex items-center px-4 shrink-0 border-b border-slate-200/50">
        <Link to="/" className="flex items-center gap-3 group w-full">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 flex items-center justify-center shrink-0 shadow-md shadow-teal-900/20 group-hover:scale-105 transition-all duration-200">
            <Home size={19} className="text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col min-w-0 flex-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm leading-tight">
                  Budget <span className="text-teal-600 font-black">Portal</span>
                </span>
                <span className="text-[9px] font-mono font-bold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200/60">
                  v{APP_VERSION}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase truncate mt-0.5">
                Carriage Workshop LGD
              </span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* Main Section */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Financials &amp; Works
            </p>
          )}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`sidebar-nav-item group h-10 flex items-center relative ${
                    active ? "active" : ""
                  } ${collapsed ? "justify-center px-0" : "px-3"}`}
                  title={collapsed ? item.label : ""}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-teal-600 shadow-sm" />
                  )}
                  <item.icon
                    size={17}
                    className={`shrink-0 transition-colors duration-150 ${
                      active
                        ? "text-teal-700"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-xs ml-3 truncate ${
                        active
                          ? "font-semibold text-teal-900"
                          : "font-medium text-slate-600 group-hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Directory & Info Section */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Resources
            </p>
          )}
          <div className="space-y-1">
            {resourceNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`sidebar-nav-item group h-10 flex items-center relative ${
                    active ? "active" : ""
                  } ${collapsed ? "justify-center px-0" : "px-3"}`}
                  title={collapsed ? item.label : ""}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-teal-600 shadow-sm" />
                  )}
                  <item.icon
                    size={17}
                    className={`shrink-0 transition-colors duration-150 ${
                      active
                        ? "text-teal-700"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-xs ml-3 truncate ${
                        active
                          ? "font-semibold text-teal-900"
                          : "font-medium text-slate-600 group-hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Administration Section */}
        {isAdmin && (
          <div>
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Administration
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onOpenUserAccess?.();
              }}
              className={`w-full sidebar-nav-item group h-10 flex items-center text-left relative ${
                collapsed ? "justify-center px-0" : "px-3"
              }`}
              title={collapsed ? "User Access" : ""}
            >
              <Users
                size={17}
                className="shrink-0 text-slate-400 group-hover:text-teal-600 transition-colors duration-150"
              />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-medium ml-3 text-slate-600 group-hover:text-slate-900 truncate"
                >
                  User Access Control
                </motion.span>
              )}
            </button>
          </div>
        )}
      </nav>

      {/* Footer Area: User summary & Collapse toggle */}
      <div className="p-3 border-t border-slate-200/60 bg-white/40 flex flex-col gap-2 shrink-0">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {(user.name || user.username || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {isAdmin ? "Administrator" : "View Only"}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex flex-1 h-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <ChevronLeft size={16} />
                <span>Collapse</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block h-screen sticky top-0 z-50 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <div className="h-full bg-slate-50/90 backdrop-blur-md border-r border-slate-200/70 flex flex-col">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[110] md:hidden shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </Button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
