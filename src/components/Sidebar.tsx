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
    <header 
      className="w-full h-[72px] sticky top-0 z-[60] shadow-xl flex items-center shrink-0 border-b border-transparent"
      style={{ background: "linear-gradient(90deg, #1FA6B8 0%, #1CA0B1 50%, #1895A5 100%)" }}
    >
      <div className="w-full mx-auto flex items-center h-full">
        <div className="flex items-center px-4 md:px-8 shrink-0 md:border-r border-white/10 h-full">
          <Link to="/" className="flex items-center group">
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <div className="absolute left-0 top-1 w-[20px] h-[20px] rounded-full bg-white opacity-95 shadow-sm z-10 transition-transform group-hover:-translate-x-0.5"></div>
              <div className="absolute right-0 bottom-1 w-3 h-3 rounded-full bg-[#E33E43] shadow-sm z-0 transition-transform group-hover:translate-x-0.5"></div>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col ml-3"
            >
              <span className="font-extrabold text-white tracking-wide text-xl leading-none">
                Budget<span className="text-white/90 font-medium whitespace-nowrap">Portal</span>
              </span>
            </motion.div>
          </Link>
        </div>

        <nav className="flex-1 flex items-center gap-1.5 px-4 md:px-6 overflow-x-auto scrollbar-none h-full">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group shrink-0 relative z-10 flex items-center gap-2.5 h-11 transition-all duration-300 ease-out px-4 rounded-full ${
                  active 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-white/90 hover:text-white hover:bg-white/15"
                }`}
              >
                <item.icon
                  size={18}
                  strokeWidth={active ? 2.5 : 2}
                  className={`shrink-0 transition-transform duration-300 ${
                    active ? "text-foreground" : "text-white group-hover:scale-110"
                  }`}
                />
                <span className={`text-[14.5px] whitespace-nowrap transition-transform duration-300 ${active ? "font-bold" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};


