import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getUser, logout } from "../../../utils/auth"; // clearAuth is optional logout helper

const ACCENT = "rgb(183,36,42)";

export default function ClientNavbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // get user profile image
  useEffect(() => {
    const u = getUser();
    if (!u) return;
    setUser(u);
  }, []);

  const handleLogout = () => {
    // use the logout helper from auth.js which clears authToken and user and redirects
    logout("/");
  };

  const navItems = [
    { label: "Dashboard", to: "/client/dashboard" },
    { label: "My Loans", to: "/client/loans" },
    { label: "Insurance", to: "/client/insurance" },
    { label: "Support", to: "/client/support" },
  ];

  // helper to render initials if no avatar
  const initials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: ACCENT }}
              >
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-gray-900">Madadgaar</span>
                <span className="text-[11px] text-gray-400">Client Dashboard</span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "text-sm font-medium transition relative",
                    isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: ACCENT }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Notification icon */}
            <button
              type="button"
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
              aria-label="Notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4.5 h-4.5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.7}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.25h-5.714A2.143 2.143 0 017 15.107v-3.34a5.25 5.25 0 1110.5 0v3.34a2.143 2.143 0 01-2.143 2.143z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 18a2.25 2.25 0 004.5 0" />
              </svg>
            </button>

            {/* User avatar + dropdown (simple) */}
            <div className="relative hidden sm:block">
              <details className="group">
                <summary className="list-none flex items-center gap-2 cursor-pointer select-none">
                  {user && user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name || "User avatar"}
                      className="w-9 h-9 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 border border-gray-200">
                      {initials(user?.name || user?.fullName)}
                    </div>
                  )}

                  <div className="hidden sm:flex flex-col leading-tight">
                    <span className="text-xs font-medium text-gray-800">{user?.name || user?.fullName || "User"}</span>
                    <span className="text-[11px] text-gray-400">client</span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 text-gray-400 group-open:rotate-180 transition-transform"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </summary>

                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10">
                  <Link to="/client/dashboard" className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Profile</Link>
                  <Link to="/client/settings" className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">Settings</Link>
                  <button type="button" onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50">Logout</button>
                </div>
              </details>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-50"
              onClick={() => setOpen((o) => !o)}
              aria-label="Open menu"
            >
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {open && (
          <div className="md:hidden pb-3 border-t border-gray-100">
            <div className="pt-2 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={({ isActive }) => ["block px-3 py-2 rounded-lg text-sm font-medium", isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"].join(" ")}>
                  {item.label}
                </NavLink>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <NavLink to="/client/dashboard" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-xs text-gray-700 hover:bg-gray-50">Profile</NavLink>
                <button type="button" onClick={() => { handleLogout(); setOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50">Logout</button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
