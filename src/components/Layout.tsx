import { useState, useEffect, ReactNode } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import {
  Menu,
  Plus,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Eye,
  Users,
  ChevronRight,
  Sparkles,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { UserAccessModal } from "./UserAccessModal";
import { APP_VERSION } from "@/config/version";
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
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isUserAccessModalOpen, setIsUserAccessModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
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
    if (path === "/info") return "Application Info";
    if (path === "/holidays") return "Railway Holidays";
    if (path.startsWith("/add-")) return "Create Record";
    if (path.startsWith("/edit-")) return "Edit Record";
    return "Budget Portal";
  };

  const initials = (user?.name || user?.username || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onOpenUserAccess={() => setIsUserAccessModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header
          className={`h-16 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40 transition-all duration-200 ${
            scrolled
              ? "bg-white/85 backdrop-blur-md shadow-sm border-b border-slate-200/70"
              : "bg-white/50 backdrop-blur-xs border-b border-transparent"
          }`}
        >
          {/* Breadcrumb & Page title */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg h-9 w-9"
            >
              <Menu size={19} />
            </Button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">
                LGD Workshop
              </span>
              <ChevronRight size={14} className="hidden sm:inline-block text-slate-300" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick Add Dropdown (Admin only) */}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="btn-primary h-9 px-3.5 rounded-xl text-xs font-semibold gap-1.5 shadow-sm">
                    <Plus size={15} />
                    <span className="hidden sm:inline">New Record</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-2xl p-2 bg-white border border-slate-200 shadow-xl shadow-slate-900/5"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/add-works"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">New Work</p>
                        <p className="text-[11px] text-slate-400">RSP / IRSP item</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/add-contingency"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">New Contingency</p>
                        <p className="text-[11px] text-slate-400">Allocation item</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5 bg-slate-100" />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/add-note"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">New Task Note</p>
                        <p className="text-[11px] text-slate-400">Dashboard reminder</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 transition-colors relative"
                  aria-label="Account menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white">
                    {initials}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 rounded-2xl p-2 bg-white border border-slate-200 shadow-xl shadow-slate-900/5"
              >
                <DropdownMenuLabel className="px-3 py-2.5">
                  <p className="font-bold text-slate-900 text-xs">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                    {isAdmin ? (
                      <>
                        <ShieldCheck size={12} className="text-teal-600" />
                        Administrator &middot; Full access
                      </>
                    ) : (
                      <>
                        <Eye size={12} className="text-slate-400" />
                        Viewer &middot; Read only
                      </>
                    )}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                {isAdmin && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setIsUserAccessModalOpen(true)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors focus:bg-slate-50 focus:text-slate-900"
                    >
                      <Users size={14} className="text-teal-600" />
                      <span className="text-xs font-semibold">User Access Control</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-slate-100" />
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 cursor-pointer transition-colors focus:bg-red-50 focus:text-red-600"
                >
                  <LogOut size={14} />
                  <span className="text-xs font-semibold">Sign out</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <div className="px-3 py-1 text-[10px] text-slate-400 text-center font-mono">
                  v{APP_VERSION} &middot; Budget Portal
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 px-6 lg:px-8 w-full">
          <div className="max-w-[1600px] mx-auto py-6">
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

      {/* Admin User Access Modal */}
      {isAdmin && (
        <UserAccessModal
          open={isUserAccessModalOpen}
          onOpenChange={setIsUserAccessModalOpen}
        />
      )}
    </div>
  );
};
