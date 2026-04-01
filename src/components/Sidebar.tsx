import { Link, useLocation } from "react-router-dom";
import { Home, FileText, AlertCircle, TrendingUp, LayoutDashboard, Link as LinkIcon } from "lucide-react";

export const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/rsp-works", label: "RSP Works", icon: FileText },
    { path: "/irsp-works", label: "IRSP Works", icon: FileText },
    { path: "/contingencies", label: "Contingencies", icon: AlertCircle },
    { path: "/unit-cost", label: "Unit Cost", icon: TrendingUp },
    { path: "/weblinks", label: "Weblinks", icon: LinkIcon },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex-col hidden md:flex z-50">
      <div className="h-16 flex items-center px-6 border-b border-slate-100 mb-4 shrink-0">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-1.5 rounded-xl bg-primary text-white group-hover:scale-105 group-active:scale-95 transition-transform shadow-sm">
            <Home size={18} />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">Budget Portal</span>
        </Link>
      </div>

      <div className="px-3 flex-1 overflow-y-auto scrollbar-none space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Overview</p>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-nav-item ${isActive(item.path) ? "active" : "inactive"}`}
          >
            <item.icon size={18} className={isActive(item.path) ? "text-primary" : "text-slate-400"} />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
};
