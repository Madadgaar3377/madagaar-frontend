import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { logout, getUser } from "../../../utils/auth";

// Responsive, modern navbar with hover dropdowns + accessible keyboard support
// TailwindCSS required. Put this file in your components folder and import where needed.

export default function NavbarDashboard({ onToggleSidebar }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  // dropdown states (desktop + keyboard)
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [loansOpen, setLoansOpen] = useState(false);
  const [insuranceOpen, setInsuranceOpen] = useState(false);
  const [installmentsOpen, setInstallmentsOpen] = useState(false);

  // mobile nested menu states
  const [mobPropertiesOpen, setMobPropertiesOpen] = useState(false);
  const [mobLoansOpen, setMobLoansOpen] = useState(false);

  const location = useLocation();
  const navRef = useRef(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  // close all dropdowns on route change
  useEffect(() => {
    setPropertiesOpen(false);
    setLoansOpen(false);
    setInsuranceOpen(false);
    setInstallmentsOpen(false);
    setMobileOpen(false);
    setMobPropertiesOpen(false);
    setMobLoansOpen(false);
  }, [location.pathname]);

  // click outside and Escape to close
  useEffect(() => {
    function onDown(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setPropertiesOpen(false);
        setLoansOpen(false);
        setInsuranceOpen(false);
        setInstallmentsOpen(false);
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

  const avatarLetter = (user?.name || "U")[0];

  // helper to toggle dropdowns (close others)
  const openOnly = (setter) => {
    setPropertiesOpen(false);
    setLoansOpen(false);
    setInsuranceOpen(false);
    setInstallmentsOpen(false);
    setter(true);
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            {/* hamburger / toggle */}
            <button
              onClick={() => {
                if (onToggleSidebar) onToggleSidebar();
                else setMobileOpen((s) => !s);
              }}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500"
              aria-label="Toggle sidebar"
              aria-expanded={mobileOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <a href="/dashboard" className="flex items-center gap-3">
              <img src="/Media/Group%2033.png" alt="logo" className="h-8 w-auto" />
            </a>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop nav */}
            <nav ref={navRef} className="hidden sm:flex items-center gap-2">
              <NavLink to="/dashboard" className={({ isActive }) => `px-3 py-2 rounded-md hover:bg-gray-100 text-sm ${isActive ? "bg-gray-100 font-medium" : ""}`}>
                Home
              </NavLink>

              {/* Properties - show on hover (mouse) and on focus / click (keyboard) */}
              <div
                className="relative group"
                onMouseEnter={() => setPropertiesOpen(true)}
                onMouseLeave={() => setPropertiesOpen(false)}
              >
                <button
                  onClick={() => setPropertiesOpen((s) => !s)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPropertiesOpen((s) => !s); }}
                  aria-expanded={propertiesOpen}
                  className="px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 flex items-center gap-2"
                >
                  Properties
                  <svg className={`h-4 w-4 transition-transform ${propertiesOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* dropdown - use CSS visibility + small animation */}
                <div
                  className={`absolute left-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-40 transform transition-all duration-150 ${propertiesOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                  role="menu"
                  aria-hidden={!propertiesOpen}
                >
                  <NavLink to="/properties" className="block px-3 py-2 hover:bg-gray-50" role="menuitem">View All</NavLink>
                  <NavLink to="/properties/add" className="block px-3 py-2 hover:bg-gray-50" role="menuitem">Add Property</NavLink>
                  <NavLink to="/properties/manage" className="block px-3 py-2 hover:bg-gray-50" role="menuitem">Update / Delete</NavLink>
                </div>
              </div>

              {/* Insurance */}
              <div className="relative group" onMouseEnter={() => setInsuranceOpen(true)} onMouseLeave={() => setInsuranceOpen(false)}>
                <button
                  onClick={() => setInsuranceOpen((s) => !s)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setInsuranceOpen((s) => !s); }}
                  aria-expanded={insuranceOpen}
                  className="px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 flex items-center gap-2"
                >
                  Insurance
                  <svg className={`h-4 w-4 transition-transform ${insuranceOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className={`absolute left-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-40 transform transition-all duration-150 ${insuranceOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`} role="menu" aria-hidden={!insuranceOpen}>
                  <NavLink to="/insurance" className="block px-3 py-2 hover:bg-gray-50" role="menuitem">View Plans</NavLink>
                  <NavLink to="/dashboard/insurance/get-quote" className="block px-3 py-2 hover:bg-gray-50" role="menuitem">Get All Request</NavLink>
                  <NavLink to="/insurance/claims" className="block px-3 py-2 hover:bg-gray-50" role="menuitem">Claims</NavLink>
                </div>
              </div>

              {/* Loans */}
              <div className="relative group" onMouseEnter={() => setLoansOpen(true)} onMouseLeave={() => setLoansOpen(false)}>
                <button
                  onClick={() => setLoansOpen((s) => !s)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setLoansOpen((s) => !s); }}
                  aria-expanded={loansOpen}
                  className="px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 flex items-center gap-2"
                >
                  Loans
                  <svg className={`h-4 w-4 transition-transform ${loansOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className={`absolute left-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-40 transform transition-all duration-150 ${loansOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`} role="menu" aria-hidden={!loansOpen}>
                  <NavLink to="/dashboard/loan" className="block px-3 py-2 hover:bg-gray-50" role="menuitem">View All</NavLink>
                  <NavLink to="/dashboard/loan/create" className="block px-3 py-2 hover:bg-gray-50" role="menuitem">Add Loan Plan</NavLink>
                  <NavLink to="/dashboard/loan/update/delete" className="block px-3 py-2 hover:bg-gray-50" role="menuitem">Update / Delete</NavLink>
                </div>
              </div>

              {/* Installments */}
              <div className="relative group" onMouseEnter={() => setInstallmentsOpen(true)} onMouseLeave={() => setInstallmentsOpen(false)}>
                <button
                  onClick={() => setInstallmentsOpen((s) => !s)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setInstallmentsOpen((s) => !s); }}
                  aria-expanded={installmentsOpen}
                  className="px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 flex items-center gap-2"
                >
                  Installments
                  <svg className={`h-4 w-4 transition-transform ${installmentsOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className={`absolute left-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-40 transform transition-all duration-150 ${installmentsOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`} role="menu" aria-hidden={!installmentsOpen}>
                  <NavLink to="/dashboard/Installments" className="block px-3 py-2 hover:bg-gray-50" role="menuitem">All-Request</NavLink>
                  <NavLink to="/dashboard/Installments/create" className="block px-3 py-2 hover:bg-gray-50" role="menuitem">Create-Installments</NavLink>
                  <NavLink to="/dashboard/Installments/update" className="block px-3 py-2 hover:bg-gray-50" role="menuitem">Update/Delete</NavLink>
                </div>
              </div>

              {/* user preview */}
              <a href="/profile" className="flex items-center gap-3 ml-2">
                <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-600">{avatarLetter}</div>
                  )}
                </div>
                <div className="hidden sm:block text-sm">
                  <div className="font-medium text-gray-700">{user?.name || "User"}</div>
                  <div className="text-xs text-gray-500">{user?.email || ""}</div>
                </div>
              </a>
            </nav>

            {/* Logout button */}
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => logout('/')}
                className="px-3 py-1.5 bg-red-700 text-white rounded-md text-sm hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown content */}
      <div className={`sm:hidden border-t bg-white ${mobileOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 py-3 flex flex-col gap-2">
          <NavLink to="/dashboard" className="px-3 py-2 rounded-md hover:bg-gray-50">Home</NavLink>
          <NavLink to="/dashboard/analytics" className="px-3 py-2 rounded-md hover:bg-gray-50">Analytics</NavLink>

          {/* Mobile: Properties accordion */}
          <div>
            <button
              onClick={() => { setMobPropertiesOpen((s) => !s); setMobLoansOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Properties</span>
              <span className="text-xs">{mobPropertiesOpen ? '−' : '+'}</span>
            </button>
            <div className={`pl-4 mt-1 flex flex-col gap-1 overflow-hidden transition-all ${mobPropertiesOpen ? 'max-h-40' : 'max-h-0'}`}>
              <NavLink to="/properties" className="px-3 py-2 rounded-md hover:bg-gray-50">View All</NavLink>
              <NavLink to="/properties/add" className="px-3 py-2 rounded-md hover:bg-gray-50">Add Property</NavLink>
              <NavLink to="/properties/manage" className="px-3 py-2 rounded-md hover:bg-gray-50">Update / Delete</NavLink>
            </div>
          </div>

          {/* Mobile: Loans accordion */}
          <div>
            <button
              onClick={() => { setMobLoansOpen((s) => !s); setMobPropertiesOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Loans</span>
              <span className="text-xs">{mobLoansOpen ? '−' : '+'}</span>
            </button>
            <div className={`pl-4 mt-1 flex flex-col gap-1 overflow-hidden transition-all ${mobLoansOpen ? 'max-h-40' : 'max-h-0'}`}>
              <NavLink to="/dashboard/loan" className="px-3 py-2 rounded-md hover:bg-gray-50">View All</NavLink>
              <NavLink to="/dashboard/loan/create" className="px-3 py-2 rounded-md hover:bg-gray-50">Add Loan Plan</NavLink>
              <NavLink to="/loans/manage" className="px-3 py-2 rounded-md hover:bg-gray-50">Update / Delete</NavLink>
            </div>
          </div>

          <NavLink to="/profile" className="flex items-center gap-3 mt-2">
            <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-600">{avatarLetter}</div>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-800">{user?.name || "User"}</div>
              <div className="text-xs text-gray-500">{user?.email || ""}</div>
            </div>
          </NavLink>

          <NavLink to="/dashboard/notifications" className="px-3 py-2 rounded-md hover:bg-gray-50">Notifications</NavLink>
          <NavLink to="/dashboard/settings" className="px-3 py-2 rounded-md hover:bg-gray-50">Settings</NavLink>
          <button onClick={() => logout('/')} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50">Logout</button>
        </div>
      </div>
    </header>
  );
}
