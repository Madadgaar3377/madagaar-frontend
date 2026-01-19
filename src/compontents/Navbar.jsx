import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function Navbar({
  logoSrc = "/Media/Group%2033.png",
  services = ["Insurance", "Properties", "Loans", "Installments"],
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false); // Desktop dropdown
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false); // Mobile collapsible
  const servicesRef = useRef(null);
  const closeTimeout = useRef(null);

  // Close desktop dropdown when clicking outside (still useful for clicks)
  useEffect(() => {
    function handleClick(e) {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Close menus on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setServicesOpen(false);
        setMobileServicesOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Handlers that debounce the closing to prevent flicker when moving between button and dropdown
  const handleServicesEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setServicesOpen(true);
  };
  const handleServicesLeave = () => {
    // small delay so moving cursor from button -> dropdown doesn't close it
    closeTimeout.current = setTimeout(() => {
      setServicesOpen(false);
      closeTimeout.current = null;
    }, 150); // 150ms works well; tweak if you want it slower/faster
  };

  return (
    <header className="w-full bg-white shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center gap-3">
              <img src={logoSrc} alt="logo" className="h-10 rounded-md object-cover" />
            </NavLink>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className="text-gray-700 hover:text-gray-900">
              Home
            </NavLink>
            <NavLink to="/about" className="text-gray-700 hover:text-gray-900">
              About Us
            </NavLink>

            {/* Desktop dropdown */}
            <div
              className="relative"
              ref={servicesRef}
              onMouseEnter={handleServicesEnter}
              onMouseLeave={handleServicesLeave}
            >
              <button
                type="button"
                aria-expanded={servicesOpen}
                aria-controls="services-dropdown"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                Services
                <svg
                  className={`w-4 h-4 transform transition-transform duration-300 ${
                    servicesOpen ? "rotate-180" : "rotate-0"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              <div
                id="services-dropdown"
                className={`absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-2 z-20 transition-all duration-200 transform ${
                  servicesOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                }`}
                // also keep mouse enter/leave on dropdown itself to avoid accidental close
                onMouseEnter={handleServicesEnter}
                onMouseLeave={handleServicesLeave}
              >
                {services.map((s) => (
                  <NavLink
                    key={s}
                    to={`/${s.replace(/\s+/g, "-").toLowerCase()}`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    onClick={() => setServicesOpen(false)}
                  >
                    {s}
                  </NavLink>
                ))}
              </div>
            </div>

            
            <NavLink to="/blog" className="text-gray-700 hover:text-gray-900">
              Blog
            </NavLink>
          </div>

          {/* Account/Dashboard & mobile button */}
          <div className="flex items-center gap-4">
            {isAuthenticated() ? (
              <NavLink
                to="/dashboard"
                className="hidden md:inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white"
                style={{ background: "rgb(183, 36, 42)" }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </NavLink>
            ) : (
              <NavLink
                to="/account"
                className="hidden md:inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white"
                style={{ background: "rgb(183, 36, 42)" }}
              >
                Account
              </NavLink>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"} bg-black/30`}
      />

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <NavLink to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <img src={logoSrc} alt="logo" className="h-10 rounded-md object-cover" />
          </NavLink>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="px-4 py-4 overflow-auto h-[calc(100%-80px)]">
          <NavLink to="/" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
            Home
          </NavLink>

          {/* Mobile Services collapsible */}
          <div className="mt-2 border-t pt-3">
            <button
              type="button"
              onClick={() => setMobileServicesOpen((s) => !s)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
              aria-expanded={mobileServicesOpen}
            >
              <span className="font-medium">Services</span>
              <svg className={`w-4 h-4 transform transition-transform duration-300 ${mobileServicesOpen ? "rotate-180" : "rotate-0"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`mt-1 px-1 overflow-hidden transition-all duration-300 ${mobileServicesOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
              {services.map((s) => (
                <NavLink
                  key={s}
                  to={`/${s.replace(/\s+/g, "-").toLowerCase()}`}
                  className="block px-4 py-2 text-gray-700 rounded-md hover:bg-gray-50"
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileServicesOpen(false);
                  }}
                >
                  {s}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink to="/about" className="block mt-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
            About Us
          </NavLink>
          <NavLink to="/blog" className="block mt-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
            Blog
          </NavLink>

          <div className="mt-6 px-3">
            {isAuthenticated() ? (
              <NavLink to="/dashboard" className="block text-center px-4 py-2 border rounded-md bg-[rgb(183,36,42)] text-white font-medium" onClick={() => setMobileOpen(false)}>
                Dashboard
              </NavLink>
            ) : (
              <NavLink to="/account" className="block text-center px-4 py-2 border rounded-md bg-[rgb(183,36,42)] text-white font-medium" onClick={() => setMobileOpen(false)}>
                Account
              </NavLink>
            )}
          </div>
        </nav>
      </aside>
    </header>
  );
}
