import { useState, useEffect, ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Search, Bell, Plus, User, LogOut, Settings, FileText, ChevronRight } from "lucide-react";
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
    if (path === "/") return "Dashboard Overview";
    if (path === "/rsp-works") return "RSP Works Management";
    if (path === "/irsp-works") return "IRSP Works Management";
    if (path === "/contingencies") return "Contingency Planner";
    if (path === "/unit-cost") return "Financial Unit Costs";
    if (path === "/weblinks") return "Resource Links";
    if (path.startsWith("/add-")) return "Creation Wizard";
    if (path.startsWith("/edit-")) return "Record Editor";
    return "Budget Portal";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 pt-24 transition-all duration-500">

        <main className="flex-1 px-4 lg:px-8 w-full pb-12">
          <div className="max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
