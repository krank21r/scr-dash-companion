import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="text-lg font-semibold">
          SCR Organisation
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-4">
          <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>
          <Link to="/rsp-works" className={`nav-item ${isActive("/rsp-works") ? "active" : ""}`}>
            RSP Works
          </Link>
          <Link to="/irsp-works" className={`nav-item ${isActive("/irsp-works") ? "active" : ""}`}>
            IRSP Works
          </Link>
          <Link to="/unit-cost" className={`nav-item ${isActive("/unit-cost") ? "active" : ""}`}>
            Unit Cost
          </Link>
          <Link to="/reviews" className={`nav-item ${isActive("/reviews") ? "active" : ""}`}>
            Reviews
          </Link>
          <Link to="/add-works" className={`nav-item ${isActive("/add-works") ? "active" : ""}`}>
            Add Works
          </Link>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'flex' : 'hidden'} absolute top-16 left-0 right-0 flex-col bg-white border-b shadow-lg md:hidden`}>
          <Link 
            to="/" 
            className={`p-4 hover:bg-gray-50 ${isActive("/") ? "text-primary" : ""}`}
            onClick={toggleMenu}
          >
            Home
          </Link>
          <Link 
            to="/rsp-works" 
            className={`p-4 hover:bg-gray-50 ${isActive("/rsp-works") ? "text-primary" : ""}`}
            onClick={toggleMenu}
          >
            RSP Works
          </Link>
          <Link 
            to="/irsp-works" 
            className={`p-4 hover:bg-gray-50 ${isActive("/irsp-works") ? "text-primary" : ""}`}
            onClick={toggleMenu}
          >
            IRSP Works
          </Link>
          <Link 
            to="/unit-cost" 
            className={`p-4 hover:bg-gray-50 ${isActive("/unit-cost") ? "text-primary" : ""}`}
            onClick={toggleMenu}
          >
            Unit Cost
          </Link>
          <Link 
            to="/reviews" 
            className={`p-4 hover:bg-gray-50 ${isActive("/reviews") ? "text-primary" : ""}`}
            onClick={toggleMenu}
          >
            Reviews
          </Link>
          <Link 
            to="/add-works" 
            className={`p-4 hover:bg-gray-50 ${isActive("/add-works") ? "text-primary" : ""}`}
            onClick={toggleMenu}
          >
            Add Works
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;