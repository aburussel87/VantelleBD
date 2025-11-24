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
const UserProfile = ({ userName, profileImage, onLogout }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (onLogout) onLogout();
    window.location.reload();
    navigate("/");
  };
  const goToProfile = () => {
    navigate('/profile');
  }

  return (
    <div className="user-profile-container">
      <div className="user-info" onClick={goToProfile} style={{ cursor: "pointer" }}>
        <img
          src={profileImage || "./user-profile.jpg"}
          alt={userName}
          className="user-avatar"
          onError={(e) => {
            e.target.onerror = null;
            const firstLetter = userName ? userName.charAt(0).toUpperCase() : "U";
            e.target.src = `https://placehold.co/45x45/d4af37/FFFFFF?text=${firstLetter}`;
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
  const [currentUser, setCurrentUser] = useState({ name: "Guest", isLoggedIn: false, profileImage: null });

  // Track screen width
  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load user from localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      const profileImage = parsedUser.profile_image?.data
        ? `data:image/jpeg;base64,${btoa(
          new Uint8Array(parsedUser.profile_image.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        )}`
        : null;
      setCurrentUser({ name: parsedUser.full_name, isLoggedIn: true, profileImage });
    } else {
      setCurrentUser({ name: "Guest", isLoggedIn: false, profileImage: null });
    }
  }, []);

  const handleMobileLinkClick = useCallback(() => setMenuOpen(false), []);

  // const handleMobileLogout = useCallback(() => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("user");
  //   navigate("/");
  //   setMenuOpen(false);
  // }, [navigate]);

  const handleLoginRedirect = () => navigate("/login");

  return (
    <>
      <style>{`
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; margin:0; padding:0; }
        body { background-color: #f4f4f4; padding-top: 120px; }

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

        .logo-section { display: flex; align-items: center; gap: 0.5rem; }
        .logo-image { border-radius: 50%; object-fit: cover; border: 2px solid #d4af37; width: 60px; height: 60px; transition: transform 0.3s; }
        .logo-image:hover { transform: scale(1.05); }
        .logo-text { color: #f0f0f0; font-weight: bold; letter-spacing: 0.15em; white-space: nowrap; font-size: 1.4rem; }

        .right-section { display: flex; flex-direction: row; align-items: center; gap: 1.5rem; }

        .search-input { padding: 0.4rem 0.8rem; border-radius: 20px; border: 1px solid #d4af37; outline: none; background-color: #2b2b2b; color: #f0f0f0; transition: all 0.3s ease; width: 200px; }

        .nav-links-desktop {
          display: flex;
          flex-direction: row;
          gap: 1rem;
          align-items: center;
        }
        .nav-link { color: #cccccc; text-decoration: none; padding: 0.5rem 0.8rem; font-weight: 500; letter-spacing: 0.05em; transition: color 0.3s, border-bottom 0.3s; }
        .nav-link:hover { color: #d4af37; border-bottom: 2px solid #d4af37; }

        .menu-button { background: none; border: none; color: #cccccc; cursor: pointer; padding: 0.5rem; transition: color 0.3s; }
        .menu-button:hover { color: #d4af37; }
        .menu-icon { width: 26px; height: 26px; }

        /* USER PROFILE */
        .user-info { display: flex; flex-direction: row; align-items: center; gap: 0.5rem; }
        .user-avatar { width: 45px; height: 45px; border-radius: 50%; }
        .user-name { color: #f0f0f0; }
        .user-info:hover .user-avatar {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}
  .user-info:hover .user-name {
  color: #d4af37; /* gold-ish hover color */
  text-decoration: underline;
}
        .logout-button { background: none; border: 1px solid #d4af37; border-radius: 50%; padding: 0.3rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.3s; }
        .logout-button:hover { background: #bc3345ff; color: #1a1a1a; }
        .logout-icon { width: 20px; height: 20px; color: #d4af37; }

        /* MOBILE MENU */
        .mobile-menu { position: fixed; top: 0; left: 0; height: 100vh; width: 85%; max-width: 320px; background-color: rgba(26,26,26,1); box-shadow: 4px 0 10px rgba(0,0,0,0.7); z-index: 999; transform: translateX(-100%); transition: transform 0.4s ease-in-out; overflow-y: auto; }
        .mobile-menu.open { transform: translateX(0); }
        .mobile-navbar-header { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; position: fixed; top: 0; left: 0; width: 100%; z-index: 1001; }
        .mobile-logo-section { display: flex; align-items: center; gap: 0.5rem; }
        .mobile-logo-section .logo-image { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #d4af37; }
        .mobile-logo-section .company-name { color: #f0f0f0; font-weight: bold; font-size: 1.2rem; letter-spacing: 0.1em; white-space: nowrap; }
        .mobile-links { display: flex; flex-direction: column; padding: 1rem; margin-top: 80px; }
        .mobile-search-input { width: 100%; padding: 0.6rem 1rem; border-radius: 25px; border: 1px solid #d4af37; background-color: #3a3a3a; color: #f0f0f0; }
        .mobile-profile-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-top: 1px solid rgba(212,175,55,0.2); margin-top: 1rem; }

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
        @media (min-width: 1200px) { .menu-toggle { display: none; } }
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
              <RouterNavLink to="/orders" className="nav-link">Orders</RouterNavLink>
            </div>

            {currentUser.isLoggedIn ? (
              <UserProfile userName={currentUser.name} profileImage={currentUser.profileImage} />
            ) : (
              <button
                onClick={handleLoginRedirect}
                className="nav-link"
                style={{
                  background: "black",
                  color: "#eefdefff",
                  cursor: "pointer",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "5px",
                  border: "1px solid #cbb87aff",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#d4af37"; // gold
                  e.currentTarget.style.color = "#1a1a1a"; // dark text
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "#eefdefff";
                }}
              >
                Login
              </button>

            )}

            <div className="menu-toggle">
              <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <XIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <div className="mobile-navbar-header">
            <div className="mobile-logo-section">
              <img src="./logo.png" alt="VANTELLE BD" className="logo-image" />
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
            <RouterNavLink to="/orders" onClick={handleMobileLinkClick} className="nav-link">Orders</RouterNavLink>

            {currentUser.isLoggedIn ? (
              <>
                <div
                  className="mobile-profile-item"
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <img
                      src={currentUser.profileImage || "./user-profile.jpg"}
                      alt={currentUser.name}
                      className="user-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        const firstLetter = currentUser.name
                          ? currentUser.name.charAt(0).toUpperCase()
                          : "U";
                        e.target.src = `https://placehold.co/45x45/d4af37/FFFFFF?text=${firstLetter}`;
                      }}
                    />
                    <span className="user-name">{currentUser.name}</span>
                  </div>
                </div>

                {/* ✅ Logout Button (same behavior as desktop) */}
                <button
                  className="nav-link"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setMenuOpen(false);
                    window.location.reload();
                    navigate("/home");
                  }}
                  style={{
                    color: "#ff6666",
                    fontWeight: "600",
                    marginTop: "0.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  handleMobileLinkClick();
                  handleLoginRedirect();
                }}
                className="nav-link"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#cccccc",
                  marginTop: "1rem",
                }}
              >
                Login
              </button>
            )}


          </div>
        </div>

        {menuOpen && (
          <div
            className="menu-overlay"
            onClick={handleMobileLinkClick}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 998 }}
          />
        )}
      </nav>
    </>
  );
}
