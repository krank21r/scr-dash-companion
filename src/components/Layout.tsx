import { useState, useEffect, ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Menu, Plus, LogOut, FileText, LayoutDashboard } from "lucide-react";
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
    if (path === "/weblinks") return "Web Links";
    if (path.startsWith("/add-")) return "Create Record";
    if (path.startsWith("/edit-")) return "Edit Record";
    return "Budget Portal";
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header
          className={`h-16 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40 transition-all duration-200 ${
            scrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100/60" : "bg-transparent"
          }`}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg"
            >
              <Menu size={20} />
            </Button>

            <div className="hidden sm:flex items-center gap-2">
              <LayoutDashboard size={16} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-600">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Add Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="btn-primary h-10 px-4 rounded-lg text-sm font-semibold gap-2">
                  <Plus size={16} />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 bg-white border border-slate-100 shadow-lg shadow-slate-200/40">
                <DropdownMenuItem asChild>
                  <Link to="/add-works" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">New Work</p>
                      <p className="text-xs text-slate-400">Add RSP/IRSP work</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/add-contingency" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">New Contingency</p>
                      <p className="text-xs text-slate-400">Add contingency item</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2 bg-slate-100" />
                <DropdownMenuItem asChild>
                  <Link to="/add-note" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">New Note</p>
                      <p className="text-xs text-slate-400">Add reminder</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-slate-100 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                    AD
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 bg-white border border-slate-100 shadow-lg shadow-slate-200/40">
                <DropdownMenuLabel className="px-3 py-2">
                  <p className="font-semibold text-slate-900">Administrator</p>
                  <p className="text-xs text-slate-400 font-normal">admin@workshop.com</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2 bg-slate-100" />
                <DropdownMenuItem className="px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut size={16} className="mr-3" />
                  <span className="font-medium text-sm">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-6 lg:px-8 w-full">
          <div className="max-w-[1600px] mx-auto py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
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