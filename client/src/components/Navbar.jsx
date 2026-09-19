import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { FiMenu, FiX, FiDollarSign, FiSun, FiMoon } from "react-icons/fi";

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FiDollarSign />
        FinTrack
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <Link
          to="/dashboard"
          className={location.pathname === "/dashboard" ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Dashboard
        </Link>
        <Link
          to="/chat"
          className={location.pathname === "/chat" ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Ask AI
        </Link>
        <button onClick={toggleTheme} title="Toggle Theme">
          {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
