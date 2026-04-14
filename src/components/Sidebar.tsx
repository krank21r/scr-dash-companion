import { Link, useLocation } from "react-router-dom";
import { FileText, AlertCircle, TrendingUp, LayoutDashboard, Link as LinkIcon, Info } from "lucide-react";
import { motion } from "framer-motion";

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
    { path: "/info", label: "Info", icon: Info },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] px-6 py-6 pointer-events-none">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between pointer-events-auto h-16 px-8 bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-full shadow-xl shadow-slate-200/20">
        <div className="flex items-center">
          <Link to="/" className="flex items-center group">
            <div className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg shadow-md transition-transform group-hover:rotate-3">
              <LayoutDashboard size={18} />
            </div>
            <span className="ml-3 font-extrabold text-slate-800 tracking-tight text-xl leading-none truncate">
              Budget<span className="text-[#0ea5e9]">Portal</span>
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-2 px-4 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-2 h-10 px-5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 ${
                  active 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-sky-500/20" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <item.icon
                  size={14}
                  strokeWidth={active ? 3 : 2}
                  className="shrink-0"
                />
                <span className={`text-[11px] uppercase tracking-wider ${active ? "font-black" : "font-bold"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="h-6 w-[1px] bg-slate-200" />
          <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:shadow-md active:scale-95">
            <AlertCircle size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};


