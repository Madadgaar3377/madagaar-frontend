import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { logout, getUser } from "../../../utils/auth";

export default function NavbarDashboard({ onToggleSidebar }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Desktop dropdown states
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [loansOpen, setLoansOpen] = useState(false);
  const [insuranceOpen, setInsuranceOpen] = useState(false);
  const [installmentsOpen, setInstallmentsOpen] = useState(false);

  // Mobile accordion states
  const [mobPropertiesOpen, setMobPropertiesOpen] = useState(false);
  const [mobLoansOpen, setMobLoansOpen] = useState(false);
  const [mobInsuranceOpen, setMobInsuranceOpen] = useState(false);
  const [mobInstallmentsOpen, setMobInstallmentsOpen] = useState(false);

  const location = useLocation();
  const navRef = useRef(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close all dropdowns on route change
  useEffect(() => {
    setPropertiesOpen(false);
    setLoansOpen(false);
    setInsuranceOpen(false);
    setInstallmentsOpen(false);
    setMobileOpen(false);
    setMobPropertiesOpen(false);
    setMobLoansOpen(false);
    setMobInsuranceOpen(false);
    setMobInstallmentsOpen(false);
  }, [location.pathname]);

  // Click outside and Escape to close
  useEffect(() => {
    function onDown(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        // Close desktop dropdowns and mobile menu when clicking outside the nav area
        setPropertiesOpen(false);
        setLoansOpen(false);
        setInsuranceOpen(false);
        setInstallmentsOpen(false);
        setMobileOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") {
        setPropertiesOpen(false);
        setLoansOpen(false);
        setInsuranceOpen(false);
        setInstallmentsOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const avatarLetter = (user?.name || "U")[0].toUpperCase();

  const navItems = [
    {
      label: "Properties",
      state: propertiesOpen,
      setState: setPropertiesOpen,
      mobState: mobPropertiesOpen,
      setMobState: setMobPropertiesOpen,
      items: [
        { to: "/dashboard/properties", label: "View All Properties" },
        { to: "/dashboard/properties/add", label: "Add New Property" },
        { to: "/dashboard/properties/manage", label: "Manage Properties" },
      ],
    },
    {
      label: "Insurance",
      state: insuranceOpen,
      setState: setInsuranceOpen,
      mobState: mobInsuranceOpen,
      setMobState: setMobInsuranceOpen,
      items: [
        { to: "/insurance", label: "View Plans" },
        { to: "/dashboard/insurance/get-quote", label: "Quote Requests" },
        { to: "/insurance/claims", label: "Claims" },
      ],
    },
    {
      label: "Loans",
      state: loansOpen,
      setState: setLoansOpen,
      mobState: mobLoansOpen,
      setMobState: setMobLoansOpen,
      items: [
        { to: "/dashboard/loan", label: "View All Loans" },
        { to: "/dashboard/loan/create", label: "Add Loan Plan" },
        { to: "/dashboard/loan/update/delete", label: "Manage Loans" },
      ],
    },
    {
      label: "Installments",
      state: installmentsOpen,
      setState: setInstallmentsOpen,
      mobState: mobInstallmentsOpen,
      setMobState: setMobInstallmentsOpen,
      items: [
        { to: "/dashboard/Installments/all", label: "All Plans" },
        { to: "/dashboard/Installments", label: "All Requests" },
        { to: "/dashboard/Installments/create", label: "Create Plan" },
        { to: "/dashboard/Installments/status", label: "Request Status" },
      ],
    },
  ];

  // Helper to toggle desktop dropdowns so only one opens at a time
  function toggleDesktopDropdown(targetLabel) {
    navItems.forEach((it) => {
      if (it.label === targetLabel) {
        it.setState((s) => !s);
      } else {
        it.setState(false);
      }
    });
  }

  // Theme colors
  const primary = "rgb(183, 36, 42)";
  const primaryDark = "rgb(140, 28, 33)";
  const primaryGradient = `linear-gradient(90deg, ${primary}, ${primaryDark})`;

  return (
    <header
      style={{ background: "#ffffff" }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg border-b" : "shadow-sm border-b"
      }`}
    >
      <style>{`
        @keyframes blinkScale {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          50% { opacity: 0.5; transform: translateY(-2px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .blink-on-hover:hover { animation: blinkScale 0.9s linear infinite; }
        .primary-glow { box-shadow: 0 6px 18px rgba(183,36,42,0.18); }
      `}</style>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                if (onToggleSidebar) onToggleSidebar();
                else setMobileOpen((s) => !s);
              }}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-white/40 focus:outline-none focus:ring-2 transition-all duration-200 blink-on-hover"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg
                className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 ${
                  mobileOpen ? "rotate-90" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <a href="/dashboard" className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative">
                <img src="/Media/Group%2033.png" alt="logo" className="h-7 sm:h-8 w-auto transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300" style={{ background: primary }}></div>
              </div>
            </a>

            <NavLink
              to="/dashboard"
              style={({ isActive }) => (isActive ? { background: primaryGradient, color: "#fff" } : undefined)}
              className={({ isActive }) =>
                `hidden lg:flex items-center px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? "primary-glow" : "text-gray-700 hover:bg-white/40"
                }`
              }
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </NavLink>
          </div>

          {/* Center - Desktop Navigation */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {/* Removed hover handlers — now click-only on desktop */}
                <button
                  onClick={() => toggleDesktopDropdown(item.label)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleDesktopDropdown(item.label);
                    }
                  }}
                  aria-expanded={item.state}
                  aria-controls={`dropdown-${item.label}`}
                  className="px-3 xl:px-4 py-2 rounded-lg hover:bg-white/40 text-sm font-medium focus:outline-none focus:ring-2 flex items-center gap-2 transition-all duration-200 blink-on-hover"
                  style={item.state ? { color: "#fff", background: primaryGradient } : undefined}
                >
                  {item.label}
                  <svg className={`h-4 w-4 transition-transform duration-200 ${item.state ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                <div
                  id={`dropdown-${item.label}`}
                  className={`absolute left-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transform transition-all duration-200 ${
                    item.state ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                  role="menu"
                  aria-hidden={!item.state}
                >
                  {item.items.map((subItem, idx) => (
                    <NavLink
                      key={idx}
                      to={subItem.to}
                      style={({ isActive }) => (isActive ? { background: primaryGradient, color: "#fff" } : undefined)}
                      className={({ isActive }) => `block px-4 py-2.5 text-sm transition-all duration-150 ${isActive ? "font-medium" : "text-gray-700 hover:bg-white/40"}`}
                      role="menuitem"
                      onClick={() => {
                        // close dropdown after click for better UX
                        setPropertiesOpen(false);
                        setLoansOpen(false);
                        setInsuranceOpen(false);
                        setInstallmentsOpen(false);
                        // mobile should remain unaffected
                      }}
                    >
                      {subItem.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/dashboard" className="hidden sm:flex items-center gap-2 sm:gap-3 px-2 py-1.5 rounded-lg hover:bg-white/40 transition-all duration-200 group">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-md group-hover:ring-opacity-80 transition-all duration-200" style={{ background: primary }}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white font-semibold text-sm">{avatarLetter}</div>
                )}
              </div>
              <div className="hidden md:block text-sm">
                <div className="font-semibold text-gray-800 group-hover:text-opacity-80 transition-colors duration-200">{user?.fullName || "User"}</div>
                <div className="text-xs text-gray-500">{user?.email || ""}</div>
              </div>
            </a>

            <button
              onClick={() => logout("/")}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-white rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 shadow-md hover:shadow-lg transition-all duration-200 blink-on-hover"
              style={{ background: primaryGradient, boxShadow: "0 6px 18px rgba(183,36,42,0.18)" }}
            >
              <span className="hidden sm:inline">Logout</span>
              <svg className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden border-t bg-white overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-3 sm:px-4 py-4 space-y-2">
          <NavLink to="/profile" className="flex items-center gap-3 p-3 rounded-xl mb-3" style={{ background: "linear-gradient(90deg, rgba(183,36,42,0.06), rgba(140,28,33,0.03))" }}>
            <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-md" style={{ background: primary }}>
              {user?.avatar ? <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-white font-semibold">{avatarLetter}</div>}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{user?.name || "User"}</div>
              <div className="text-xs text-gray-600">{user?.email || ""}</div>
            </div>
          </NavLink>

          <NavLink
            to="/dashboard"
            style={({ isActive }) => (isActive ? { background: primaryGradient, color: "#fff" } : undefined)}
            className={({ isActive }) => `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? "primary-glow" : "text-gray-700 hover:bg-white/40"}`}
          >
            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </NavLink>

          {navItems.map((item) => (
            <div key={item.label}>
              <button
                onClick={() => {
                  item.setMobState((s) => !s);
                  // Close other accordions
                  navItems.forEach((other) => {
                    if (other.label !== item.label) other.setMobState(false);
                  });
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-700 hover:bg-white/40 text-sm font-medium transition-all duration-200"
              >
                <span>{item.label}</span>
                <svg className={`h-5 w-5 transition-transform duration-200 ${item.mobState ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`ml-4 space-y-1 overflow-hidden transition-all duration-300 ${item.mobState ? "max-h-60 mt-1" : "max-h-0"}`}>
                {item.items.map((subItem, idx) => (
                  <NavLink
                    key={idx}
                    to={subItem.to}
                    style={({ isActive }) => (isActive ? { background: primaryGradient, color: "#fff" } : undefined)}
                    className={({ isActive }) => `block px-4 py-2 rounded-lg text-sm transition-all duration-150 ${isActive ? "font-medium" : "text-gray-600 hover:bg-white/40"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {subItem.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t pt-2 mt-2 space-y-1" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
            <NavLink
              to="/dashboard/notifications"
              style={({ isActive }) => (isActive ? { background: primaryGradient, color: "#fff" } : undefined)}
              className={({ isActive }) => `flex items-center px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive ? "primary-glow" : "text-gray-700 hover:bg-white/40"}`}
              onClick={() => setMobileOpen(false)}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
            </NavLink>
            <NavLink
              to="/dashboard/settings"
              style={({ isActive }) => (isActive ? { background: primaryGradient, color: "#fff" } : undefined)}
              className={({ isActive }) => `flex items-center px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive ? "primary-glow" : "text-gray-700 hover:bg-white/40"}`}
              onClick={() => setMobileOpen(false)}
            >
              <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}
