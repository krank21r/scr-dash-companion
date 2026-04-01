import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, Plus, X, FileText, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/": return "Dashboard";
      case "/rsp-works": return "RSP Works";
      case "/irsp-works": return "IRSP Works";
      case "/contingencies": return "Contingencies";
      case "/unit-cost": return "Unit Cost";
      case "/add-works": return "Add Works";
      case "/add-note": return "Add Note";
      case "/add-contingency": return "Add Contingency";
      default: 
        if (location.pathname.startsWith("/edit-note")) return "Edit Note";
        return "Budget Portal";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar />
      
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/60 p-4 sticky top-0 z-50">
        <span className="font-bold text-slate-900 tracking-tight text-lg">Budget Portal</span>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm">
            U
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 border border-slate-200 bg-white shadow-sm rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[73px] z-40 bg-white md:hidden">
          <div className="p-4 flex flex-col gap-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="sidebar-nav-item inactive"><span className="font-medium">Dashboard</span></Link>
            <Link to="/rsp-works" onClick={() => setMobileMenuOpen(false)} className="sidebar-nav-item inactive"><span className="font-medium">RSP Works</span></Link>
            <Link to="/irsp-works" onClick={() => setMobileMenuOpen(false)} className="sidebar-nav-item inactive"><span className="font-medium">IRSP Works</span></Link>
            <Link to="/contingencies" onClick={() => setMobileMenuOpen(false)} className="sidebar-nav-item inactive"><span className="font-medium">Contingencies</span></Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto bg-background">
        {/* Desktop Topbar */}
        <header className="hidden md:flex h-16 bg-white/70 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 rounded-full transition-all">
              <Bell size={20} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 border-b-slate-300 active:translate-y-px shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <Plus size={16} className="text-primary" />
                  <span>Create</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 shadow-xl shadow-slate-200/40 rounded-xl p-1">
                <DropdownMenuItem asChild>
                  <Link to="/add-note" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer">
                    <FileText size={16} className="text-slate-400" /> Add To-Do Note
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/add-works" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer">
                    <Plus size={16} className="text-slate-400" /> Add Work Element
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-8 w-8 ml-2 rounded-full bg-gradient-to-br from-violet-600 to-primary flex items-center justify-center text-white font-semibold text-sm shadow-sm cursor-pointer hover:shadow-md transition-shadow ring-2 ring-white select-none">
              U
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 lg:px-12">
          <div className="max-w-[1400px] mx-auto page-transition pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
