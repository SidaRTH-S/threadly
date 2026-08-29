import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

import { useTheme } from "../context/ThemeContext";

import {
  getUnreadNotificationCount,
} from "../services/notificationService";

const Navbar = () => {
  const {
    user,
    logout,
    isAuthenticated,
    token,
  } = useAuth();

  const {
    theme,
    toggleTheme,
    useSystemTheme,
    isDark,
  } = useTheme();

  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [menuOpen, setMenuOpen] =
    useState(false);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  // =========================
  // SEARCH
  // =========================

  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    navigate(
      `/search?q=${encodeURIComponent(query)}`
    );

    setSearchQuery("");
  };

  // =========================
  // CLOSE MENU
  // =========================

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // =========================
  // NOTIFICATIONS
  // =========================

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!token) {
        setUnreadCount(0);
        return;
      }

      try {
        const count =
          await getUnreadNotificationCount(
            token
          );

        setUnreadCount(count);
      } catch (error) {
        console.error(error);
      }
    };

    loadUnreadCount();
  }, [token]);

  // =========================
  // THEME ICON
  // =========================

  const themeIcon = isDark ? "☀️" : "🌙";

  const themeLabel = isDark
    ? "Switch to Light"
    : "Switch to Dark";

  // =========================
  // NAVBAR
  // =========================

  return (
    <nav className="navbar">

      {/* LOGO */}

      <Link
        to="/"
        className="navbar-logo"
        onClick={closeMenu}
      >
        Threadly
      </Link>

      {/* SEARCH */}

      <form
        className="navbar-search"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          placeholder="Search Threadly..."
          aria-label="Search Threadly"
        />

        <button type="submit">
          🔍
        </button>
      </form>

      {/* HAMBURGER */}

      <button
        type="button"
        className="hamburger"
        onClick={() =>
          setMenuOpen((prev) => !prev)
        }
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* MENU */}

      <div
        className={`navbar-menu ${
          menuOpen ? "open" : ""
        }`}
      >

        <Link
          to="/"
          onClick={closeMenu}
        >
          🏠 Home
        </Link>

        <Link
          to="/notifications"
          onClick={closeMenu}
        >
          🔔 Notifications

          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/communities"
          onClick={closeMenu}
        >
          🏘 Communities
        </Link>

        <Link
          to="/create-post"
          onClick={closeMenu}
        >
          ✏️ Create Post
        </Link>

        <Link
          to="/saved"
          onClick={closeMenu}
        >
          🔖 Saved
        </Link>

        {isAuthenticated && user ? (
          <>
            <Link
              to={`/profile/${user.username}`}
              onClick={closeMenu}
            >
              👤 Profile
            </Link>

            {/* THEME BUTTON */}

            <button
              type="button"
              className="theme-toggle-button"
              onClick={toggleTheme}
              title={`${themeLabel} — current: ${theme}`}
              aria-label={themeLabel}
            >
              <span className="theme-icon">
                {themeIcon}
              </span>

              <span>
                {themeLabel}
              </span>
            </button>

            {/* AUTO THEME */}

            {theme !== "system" && (
              <button
                type="button"
                className="theme-auto-button"
                onClick={useSystemTheme}
              >
                ⚙️ Auto
              </button>
            )}

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </>
        ) : (
          <>
            {/* THEME BUTTON FOR LOGGED OUT USERS */}

            <button
              type="button"
              className="theme-toggle-button"
              onClick={toggleTheme}
              title={`${themeLabel} — current: ${theme}`}
              aria-label={themeLabel}
            >
              <span className="theme-icon">
                {themeIcon}
              </span>

              <span>
                {themeLabel}
              </span>
            </button>

            {theme !== "system" && (
              <button
                type="button"
                className="theme-auto-button"
                onClick={useSystemTheme}
              >
                ⚙️ Auto
              </button>
            )}

            <Link
              to="/login"
              onClick={closeMenu}
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={closeMenu}
            >
              Register
            </Link>
          </>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
