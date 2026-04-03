import { useState, useEffect, ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Search, Bell, Menu, Plus, User, LogOut, Settings, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/rsp-works") return "RSP Works";
    if (path === "/irsp-works") return "IRSP Works";
    if (path === "/contingencies") return "Contingencies";
    if (path === "/unit-cost") return "Unit Cost";
    if (path === "/weblinks") return "Weblinks";
    if (path.startsWith("/add-")) return "Create New Record";
    if (path.startsWith("/edit-")) return "Edit Record";
    return "Budget Portal";
  };

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500">
        {/* Unified Top Header */}
        <header 
          className={`h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 transition-all duration-300 ${
            scrolled ? "glass-navbar shadow-sm" : "bg-transparent"
          }`}
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu size={20} />
            </Button>
            
            <div className="hidden sm:block">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] font-['Plus_Jakarta_Sans']">
                {getPageTitle()}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-48 lg:w-72 h-10 pl-11 pr-4 rounded-full bg-slate-100/50 border border-slate-200/60 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="relative h-10 w-10 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 px-2 rounded-full hover:bg-slate-100 flex items-center gap-2 group transition-all">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-4 ring-primary/5 group-hover:ring-primary/10 transition-all">
                      AD
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 bg-white">
                  <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem asChild>
                    <Link to="/add-works" className="rounded-xl p-3 cursor-pointer hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><Plus size={16} /></div>
                      Add Work Element
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/add-note" className="rounded-xl p-3 cursor-pointer hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center"><FileText size={16} /></div>
                      New To-Do Note
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem className="rounded-xl p-3 cursor-pointer hover:bg-red-50 text-red-600 font-bold focus:text-red-700 focus:bg-red-50">
                    <LogOut size={16} className="mr-3" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 w-full transition-all duration-300">
          <div className="max-w-[1600px] mx-auto py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
