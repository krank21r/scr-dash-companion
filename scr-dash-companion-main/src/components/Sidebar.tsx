import { Link, useLocation } from "react-router-dom";
import { Home, FileText, AlertCircle, TrendingUp, LayoutDashboard, Link as LinkIcon, Info, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isCollapsed !== undefined) {
      setCollapsed(isCollapsed);
    }
  }, [isCollapsed]);

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/rsp-works", label: "RSP Works", icon: FileText },
    { path: "/irsp-works", label: "IRSP Works", icon: FileText },
    { path: "/contingencies", label: "Contingencies", icon: AlertCircle },
    { path: "/unit-cost", label: "Unit Cost", icon: TrendingUp },
    { path: "/weblinks", label: "Web Links", icon: LinkIcon },
    { path: "/info", label: "Info", icon: Info },
  ];

  const sidebarContent = (
    <div className={`h-full flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-60'}`}>
      {/* Logo Section */}
      <div className="h-16 flex items-center px-5 shrink-0">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Home size={18} className="text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-bold text-slate-900 tracking-tight text-base leading-none">
                Budget <span className="text-primary">Portal</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">Carriage Workshop LGD</span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Main Menu</p>
        )}
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`sidebar-nav-item group h-11 flex items-center ${isActive(item.path) ? "active" : ""} ${collapsed ? "justify-center px-0" : "px-3"}`}
            title={collapsed ? item.label : ""}
          >
            <item.icon
              size={18}
              className={`shrink-0 transition-colors duration-150 ${
                isActive(item.path) ? "text-primary" : "text-slate-500 group-hover:text-slate-700"
              }`}
            />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium ml-3"
              >
                {item.label}
              </motion.span>
            )}
          </Link>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex w-full h-10 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft size={18} />
              <span className="text-xs font-semibold">Collapse</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block h-screen sticky top-0 z-50 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-60'}`}>
        <div className="h-full bg-slate-50/80 border-r border-slate-200/60 flex flex-col">
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
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-50/95 backdrop-blur-lg z-[110] md:hidden shadow-xl"
            >
              <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
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