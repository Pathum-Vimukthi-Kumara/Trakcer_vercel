import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import MessageBox from "./MessageBox";
import "./Header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState(""); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setMessage("You have been logged out.");
    setIsLoggedIn(false);
    setMenuOpen(false);
    navigate("/login");
  };

  const handleNavigation = (path) => {
    if (!isLoggedIn) {
      setMessage("You need to log in first.");
      navigate("/login");
    } else {
      navigate(path);
    }
    setMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Header Bar */}
      <header className="header-bar">
        <div className="header-left">
          <button className="hamburger" onClick={toggleMenu}>☰</button>
          <img
            src={`${process.env.PUBLIC_URL}/onboard.png`}
            alt="logo"
            className="logo-image"
          />
          <h1 className="app-title">Budget Tracker</h1>
        </div>
      </header>

      {/* Sidebar for Navigation */}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <nav className="sidebar-nav">
          <ul>
            {/* Replaced buttons with Links for better routing */}
            <li>
              <Link
                to="/profile"
                onClick={() => handleNavigation("/profile")}
                className="nav-link"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/transactions"
                onClick={() => handleNavigation("/transactions")}
                className="nav-link"
              >
                Transactions
              </Link>
            </li>
            <li>
              <Link
                to="/charts"
                onClick={() => handleNavigation("/charts")}
                className="nav-link"
              >
                Charts
              </Link>
            </li>
            <li>
              <Link
                to="/calendar"
                onClick={() => handleNavigation("/calendar")}
                className="nav-link"
              >
                Calendar
              </Link>
            </li>
            {isLoggedIn && (
              <li>
                <Link
                  to="/login"
                  className="logout-button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  Logout
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      {/* Message Box Component */}
      <MessageBox message={message} onClose={() => setMessage("")} />
    </>
  );
};

export default Header;  