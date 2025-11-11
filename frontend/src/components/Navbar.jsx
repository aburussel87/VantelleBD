import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, NavLink as RouterNavLink } from "react-router-dom";

/* --- Logo Component --- */
const VantelleLogo = ({ showText = true }) => (
  <div className="logo-section">
    <img
      src="./logo.png"
      alt="Vantelle BD Logo"
      className="logo-image"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "https://placehold.co/70x70/0A0A0A/E5E5E5?text=L";
      }}
    />
    {showText && <span className="logo-text">VANTELLE BD</span>}
  </div>
);

/* --- Icons --- */
const MenuIcon = () => (
  <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const XIcon = () => (
  <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
/* --- Logout Icon --- */
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="logout-icon"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
    />
  </svg>
);

/* --- User Profile Component --- */
const UserProfile = ({ userName }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="user-profile-container">
      <div
        className="user-info"
        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        <img
          src="./user-profile.jpg"
          alt={userName}
          className="user-avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/45x45/d4af37/FFFFFF?text=U";
          }}
        />
        <span className="user-name">{userName}</span>
        <button className="logout-button" onClick={handleLogout}>
          <LogoutIcon />
        </button>
      </div>
    </div>
  );
};

/* --- Main Navbar Component --- */
export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isWide, setIsWide] = useState(window.innerWidth >= 768);

  // Track screen width to show/hide logo text dynamically
  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentUser = {
    name: "John Doe",
    isLoggedIn: !!localStorage.getItem("token"),
  };

  const handleMobileLinkClick = useCallback(() => setMenuOpen(false), []);
  const handleMobileLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/");
    setMenuOpen(false);
  }, [navigate]);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; margin:0; padding:0; }
        body { background-color: #f4f4f4; padding-top: 120px; }

        /* ===== NAVBAR STRUCTURE ===== */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background-color: rgba(26, 26, 26, 0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          z-index: 1000;
          display: flex;
          justify-content: center;
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1400px;
          padding: 0 2rem;
          height: 80px;
        }

        /* ===== LOGO ===== */
        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .logo-image {
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #d4af37;
          transition: transform 0.3s ease;
          width: 60px;
          height: 60px;
        }
        .logo-image:hover { transform: scale(1.05); }
        .logo-text {
          color: #f0f0f0;
          font-weight: bold;
          letter-spacing: 0.15em;
          white-space: nowrap;
          font-size: 1.4rem;
        }

        /* ===== RIGHT SECTION ===== */
        .right-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        /* Search + Links + Buttons */
        .search-input {
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          border: 1px solid #d4af37;
          outline: none;
          background-color: #2b2b2b;
          color: #f0f0f0;
          transition: all 0.3s ease;
          width: 200px;
        }

        .nav-link {
          color: #cccccc;
          text-decoration: none;
          padding: 0.5rem 0.8rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          transition: color 0.3s, border-bottom 0.3s;
        }
        .nav-link:hover {
          color: #d4af37;
          border-bottom: 2px solid #d4af37;
        }

        .menu-button {
          background: none;
          border: none;
          color: #cccccc;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.3s;
        }
        .menu-button:hover { color: #d4af37; }
        .menu-icon { width: 26px; height: 26px; }

        /* ===== MOBILE MENU ===== */
        .mobile-menu {
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          width: 85%; max-width: 320px;
          background-color: rgba(26,26,26,1);
          box-shadow: 4px 0 10px rgba(0,0,0,0.7);
          z-index: 999;
          transform: translateX(-100%);
          transition: transform 0.4s ease-in-out;
          overflow-y: auto;
        }
        .mobile-menu.open { transform: translateX(0); }

        /* --- Mobile Navbar Header --- */
        .mobile-navbar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 1rem;
          background-color: rgba(26,26,26,0.95);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1001;
        }
        .mobile-logo-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .mobile-logo-section .logo-image {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #d4af37;
        }
        .mobile-logo-section .company-name {
          color: #f0f0f0;
          font-weight: bold;
          font-size: 1.2rem;
          letter-spacing: 0.1em;
          white-space: nowrap;
        }

        .mobile-links {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          margin-top: 80px; /* to avoid overlap with fixed mobile header */
        }

        .mobile-search-input {
          width: 100%;
          padding: 0.6rem 1rem;
          border-radius: 25px;
          border: 1px solid #d4af37;
          background-color: #3a3a3a;
          color: #f0f0f0;
        }

        .mobile-profile-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-top: 1px solid rgba(212,175,55,0.2);
          margin-top: 1rem;
        }

        .user-avatar { width: 45px; height: 45px; border-radius: 50%; }
        .user-name { color: #f0f0f0; }

        .logout-button {
          background: none;
          border: 1px solid #d4af37;
          border-radius: 50%;
          padding: 0.3rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        }
        .logout-button:hover {
          background: #79e2aaff;
          color: #1a1a1a;
        }
        .logout-icon { width: 20px; height: 20px; color: #d4af37; }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 767px) {
          .logo-text { display: none; }
          .search-bar, .nav-links-desktop, .user-profile-container { display: none; }
          .menu-toggle { display: flex; }
          .navbar-container { height: 70px; }
        }

        @media (min-width: 768px) and (max-width: 1199px) {
          .logo-image { width: 55px; height: 55px; }
          .logo-text { font-size: 1.1rem; display: block; }
          .search-bar, .nav-links-desktop, .user-profile-container { display: flex; }
          .menu-toggle { display: none; }
        }

        @media (min-width: 1200px) {
          .menu-toggle { display: none; }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-container">
          <VantelleLogo showText={isWide} />

          <div className="right-section">
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="nav-links-desktop">
              <RouterNavLink to="/home" className="nav-link">Home</RouterNavLink>
              <RouterNavLink to="/shop" className="nav-link">Shop</RouterNavLink>
              <RouterNavLink to="/cart" className="nav-link">Cart</RouterNavLink>
              <RouterNavLink to="/contact" className="nav-link">Contact</RouterNavLink>
            </div>

            {currentUser.isLoggedIn && <UserProfile userName={currentUser.name} />}

            <div className="menu-toggle">
              <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <XIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* --- MOBILE MENU --- */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          {/* --- Mobile Navbar Header --- */}
          <div className="mobile-navbar-header">
            <div className="mobile-logo-section">
              <img
                src="./logo.png"
                alt="VANTELLE BD"
                className="logo-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/50x50/0A0A0A/E5E5E5?text=L";
                }}
              />
              <span className="company-name">VANTELLE BD</span>
            </div>
            <button className="menu-button" onClick={handleMobileLinkClick}>
              {menuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>

          <div className="mobile-links">
            <input
              type="text"
              className="mobile-search-input"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <RouterNavLink to="/home" onClick={handleMobileLinkClick} className="nav-link">Home</RouterNavLink>
            <RouterNavLink to="/shop" onClick={handleMobileLinkClick} className="nav-link">Shop</RouterNavLink>
            <RouterNavLink to="/cart" onClick={handleMobileLinkClick} className="nav-link">Cart</RouterNavLink>
            <RouterNavLink to="/contact" onClick={handleMobileLinkClick} className="nav-link">Contact</RouterNavLink>

            {currentUser.isLoggedIn && (
              <div className="mobile-profile-item">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <img
                    src="./user-profile.jpg"
                    alt={currentUser.name}
                    className="user-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/50x50/d4af37/FFFFFF?text=U";
                    }}
                  />
                  <span className="user-name">{currentUser.name}</span>
                </div>
                <button className="logout-button" onClick={handleMobileLogout}>
                  <LogoutIcon />
                </button>
              </div>
            )}
          </div>
        </div>

        {menuOpen && (
          <div
            className="menu-overlay"
            onClick={handleMobileLinkClick}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 998,
            }}
          />
        )}
      </nav>
    </>
  );
}
