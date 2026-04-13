import { useState, useEffect, ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Search, Bell, Plus, User, LogOut, Settings, FileText } from "lucide-react";
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
    if (path === "/weblinks") return "Enlaces";
    if (path.startsWith("/add-")) return "Create New Record";
    if (path.startsWith("/edit-")) return "Edit Record";
    return "Budget Portal";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-auto">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500">
        <header 
          className={`h-16 flex items-center justify-between px-4 lg:px-8 sticky top-[72px] z-40 md:z-30 transition-all duration-300 ${
            scrolled ? "glass-navbar shadow-card" : "bg-background/80 backdrop-blur-md"
          }`}
        >
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.25em] font-sans">
                {getPageTitle()}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6a6a6a]" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-48 lg:w-72 h-10 pl-11 pr-4 rounded-[2rem] bg-[#f2f2f2] border border-[#e0e0e0] text-sm text-[#222222] placeholder-[#6a6a6a] focus:outline-none focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="relative h-10 w-10 text-[#6a6a6a] hover:text-[#222222] hover:bg-[#f2f2f2] rounded-full">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#ff385c] rounded-full ring-2 ring-white" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 px-2 rounded-full hover:bg-[#f2f2f2] flex items-center gap-2 group transition-all">
                    <div className="w-8 h-8 rounded-full bg-[#ff385c]/10 text-[#ff385c] flex items-center justify-center font-bold text-xs ring-4 ring-[#ff385c]/5 group-hover:ring-[#ff385c]/10 transition-all">
                      AD
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-[1.25rem] p-2 shadow-card border border-[rgba(0,0,0,0.04)] bg-white">
                  <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-[#6a6a6a] uppercase tracking-widest">Administrator</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#f2f2f2]" />
                  <DropdownMenuItem asChild>
                    <Link to="/add-works" className="rounded-[0.5rem] p-3 cursor-pointer hover:bg-[#f2f2f2] text-[#222222] font-semibold text-sm flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#f2f2f2] text-[#222222] flex items-center justify-center"><Plus size={16} /></div>
                      Add Work Element
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/add-note" className="rounded-[0.5rem] p-3 cursor-pointer hover:bg-[#f2f2f2] text-[#222222] font-semibold text-sm flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#f2f2f2] text-[#222222] flex items-center justify-center"><FileText size={16} /></div>
                      New To-Do Note
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#f2f2f2]" />
                  <DropdownMenuItem className="rounded-[0.5rem] p-3 cursor-pointer hover:bg-red-50 text-red-600 font-bold focus:text-red-700 focus:bg-red-50">
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
