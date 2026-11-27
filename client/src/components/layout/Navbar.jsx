import { useState } from "react";

import {
  Link,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  Menu,
  X,
  ChevronDown,
  UserRound,
  Bookmark,
  BriefcaseBusiness,
  Sparkles,
  LogOut,
  LogIn,
} from "lucide-react";

import toast from "react-hot-toast";

import Logo from "../common/Logo";
import useAuth from "../../hooks/useAuth";

const navigation = [
  { label: "Home", to: "/" },
  { label: "Find Jobs", to: "/jobs" },
  { label: "Companies", to: "/companies" },
  { label: "Career Advice", to: "/blog" },
  { label: "AI Insights", to: "/ai-dashboard" },
];

const accountLinks = [
  {
    label: "My Profile",
    to: "/profile",
    icon: UserRound,
  },
  {
    label: "Saved Jobs",
    to: "/saved-jobs",
    icon: Bookmark,
  },
  {
    label: "My Applications",
    to: "/applications",
    icon: BriefcaseBusiness,
  },
  {
    label: "AI Dashboard",
    to: "/ai-dashboard",
    icon: Sparkles,
  },
];

function NavbarContent() {
  const {
    user,
    isAuthenticated,
    loading,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const closeMenus = () => {
    setMobileOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();

    toast.success(
      "You have been logged out"
    );

    navigate("/", { replace: true });
  };

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CL";

  const firstName =
    user?.name?.trim().split(/\s+/)[0] ||
    "Candidate";

  return (
    <header
      className="site-navbar"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          closeMenus();
        }
      }}
    >
      <div className="container navbar-inner">
        <Logo />

        <nav
          className="desktop-navigation"
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `nav-link ${
                  isActive ? "nav-link-active" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-account">
          {!loading && !isAuthenticated && (
            <>
              <Link
                to="/login"
                className="nav-sign-in"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="btn btn-primary btn-sm"
              >
                Get Started
              </Link>
            </>
          )}

          {!loading && isAuthenticated && (
            <div className="account-container">
              <button
                type="button"
                className="account-trigger"
                onClick={() =>
                  setAccountOpen((open) => !open)
                }
                aria-expanded={accountOpen}
                aria-controls="account-dropdown"
              >
                <span className="account-avatar">
                  {initials}
                </span>

                <span className="account-first-name">
                  {firstName}
                </span>

                <ChevronDown
                  size={16}
                  className={
                    accountOpen
                      ? "chevron-rotated"
                      : ""
                  }
                />
              </button>

              {accountOpen && (
                <>
                  <button
                    type="button"
                    className="dropdown-backdrop"
                    aria-label="Close account menu"
                    tabIndex={-1}
                    onClick={() =>
                      setAccountOpen(false)
                    }
                  />

                  <div
                    id="account-dropdown"
                    className="account-dropdown"
                  >
                    <div className="dropdown-profile">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>

                    {accountLinks.map(
                      ({ label, to, icon: Icon }) => (
                        <Link
                          key={to}
                          to={to}
                          className="dropdown-link"
                          onClick={closeMenus}
                        >
                          <Icon size={17} />
                          {label}
                        </Link>
                      )
                    )}

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      className="dropdown-link dropdown-logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={17} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="mobile-toggle icon-button"
          aria-label={
            mobileOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() =>
            setMobileOpen((open) => !open)
          }
        >
          {mobileOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-navigation"
          aria-label="Mobile navigation"
        >
          <div className="container mobile-nav-inner">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `mobile-nav-link ${
                    isActive
                      ? "mobile-nav-active"
                      : ""
                  }`
                }
                onClick={closeMenus}
              >
                {item.label}
              </NavLink>
            ))}

            {!loading && (
              <div className="mobile-account">
                {isAuthenticated ? (
                  <>
                    <div className="mobile-user">
                      <span className="account-avatar">
                        {initials}
                      </span>

                      <div>
                        <strong>{user.name}</strong>
                        <p>{user.email}</p>
                      </div>
                    </div>

                    {accountLinks.map(
                      ({ label, to, icon: Icon }) => (
                        <Link
                          key={to}
                          to={to}
                          className="mobile-nav-link"
                          onClick={closeMenus}
                        >
                          <Icon size={17} />
                          {label}
                        </Link>
                      )
                    )}

                    <button
                      type="button"
                      className="mobile-nav-link mobile-logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={17} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn btn-outline btn-full"
                      onClick={closeMenus}
                    >
                      <LogIn size={17} />
                      Sign In
                    </Link>

                    <Link
                      to="/register"
                      className="btn btn-primary btn-full"
                      onClick={closeMenus}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export default function Navbar() {
  const location = useLocation();

  return (
    <NavbarContent
      key={location.pathname}
    />
  );
}