import { Link, useLocation } from "react-router-dom";
import { Home, FileText, AlertCircle, TrendingUp, Plus, ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/rsp-works", label: "RSP Works", icon: FileText },
    { path: "/irsp-works", label: "IRSP Works", icon: FileText },
    { path: "/contingencies", label: "Contingencies", icon: AlertCircle },
    { path: "/unit-cost", label: "Unit Cost", icon: TrendingUp },
    { path: "/add-works", label: "Add Works", icon: Plus },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link to="/" className="text-xl font-bold mr-8 flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg gradient-primary group-hover:scale-110 transition-transform duration-300">
            <Home size={20} className="text-white" />
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent font-semibold">
            Budget Portal
          </span>
        </Link>
        
        <button 
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center md:gap-1 flex-1">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 group ${isActive(item.path) ? "text-violet-700 bg-violet-50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <item.icon size={16} className={`transition-transform duration-300 group-hover:scale-110 ${isActive(item.path) ? "text-violet-600" : ""}`} />
              <span>{item.label}</span>
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-300">
                <FileText size={16} />
                <span>To-do</span>
                <ChevronDown size={14} className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white shadow-lg border-slate-100">
              <DropdownMenuItem asChild>
                <Link to="/add-note" className="text-sm py-2">Add Note</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/edit-note" className="text-sm py-2">Edit Note</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} fixed top-16 left-0 right-0 bottom-0 flex-col bg-white/98 backdrop-blur-xl z-40 overflow-y-auto md:hidden overscroll-contain`}>
          <div className="p-4 space-y-1 pb-8">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.path) ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
                onClick={toggleMenu}
              >
                <item.icon size={18} className={isActive(item.path) ? "text-violet-600" : ""} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <p className="px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">To-do</p>
              <Link to="/add-note" onClick={toggleMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200">
                <Plus size={18} />
                <span className="font-medium">Add Note</span>
              </Link>
              <Link to="/edit-note" onClick={toggleMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200">
                <FileText size={18} />
                <span className="font-medium">Edit Note</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;