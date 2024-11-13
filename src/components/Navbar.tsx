import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Link to="/" className="mr-8 text-lg font-semibold">
          SCR Organisation
        </Link>
        <div className="flex space-x-4">
          <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>
          <Link to="/rsp-works" className={`nav-item ${isActive("/rsp-works") ? "active" : ""}`}>
            RSP Works
          </Link>
          <Link to="/irsp-works" className={`nav-item ${isActive("/irsp-works") ? "active" : ""}`}>
            IRSP Works
          </Link>
          <Link to="/add-works" className={`nav-item ${isActive("/add-works") ? "active" : ""}`}>
            Add Works
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;