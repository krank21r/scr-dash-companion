import { Link, useLocation } from "react-router-dom";
import { Home, FileText, AlertCircle, TrendingUp, LayoutDashboard, Link as LinkIcon, Info, ChevronLeft, ChevronRight, X, Menu } from "lucide-react";
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
    { path: "/weblinks", label: "Weblinks", icon: LinkIcon },
    { path: "/info", label: "Info", icon: Info },
  ];

  const sidebarContent = (
    <div className={`h-full flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-20 flex items-center px-6 shrink-0 mt-2">
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110 shrink-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-[#3a7bd5] flex items-center justify-center">
              <Home size={14} className="text-white" />
            </div>
          </div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-extrabold text-white tracking-tight text-lg leading-none">
                Budget <span className="text-white/70 italic">Portal</span>
              </span>
            </motion.div>
          )}
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-none">
        {!collapsed && (
          <p className="px-4 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Main Menu</p>
        )}
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`sidebar-nav-item group h-12 flex items-center ${isActive(item.path) ? "active" : ""} ${collapsed ? "justify-center px-0" : "px-4"}`}
            title={collapsed ? item.label : ""}
          >
            <item.icon
              size={20}
              className={`shrink-0 transition-colors duration-200 ${
                isActive(item.path) ? "text-white" : "text-white/60 group-hover:text-white"
              }`}
            />
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold"
              >
                {item.label}
              </motion.span>
            )}
            {isActive(item.path) && !collapsed && (
              <motion.div 
                layoutId="active-pill"
                className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/40"
              />
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-4 bg-black/10">
        <button 
          onClick={onToggleCollapse}
          className="hidden md:flex w-full h-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/10"
        >
          {collapsed ? <ChevronRight size={18} /> : <div className="flex items-center gap-2"><ChevronLeft size={18} /><span className="text-xs font-bold uppercase tracking-widest">Collapse</span></div>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={`hidden md:block glass-sidebar h-screen sticky top-0 z-50 shadow-2xl transition-all duration-300 border-none ${collapsed ? 'w-20' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 glass-sidebar z-[110] md:hidden shadow-2xl"
            >
              <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white">
                  <X size={24} />
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
