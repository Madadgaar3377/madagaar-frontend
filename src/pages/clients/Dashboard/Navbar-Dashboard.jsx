import React, { useEffect, useState } from "react";
import { logout, getUser } from "../../../utils/auth";
import { NavLink } from "react-router-dom";

export default function NavbarDashboard({ onToggleSidebar }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [loansOpen, setLoansOpen] = useState(false);
  const [mobPropertiesOpen, setMobPropertiesOpen] = useState(false);
  const [mobLoansOpen, setMobLoansOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { if (onToggleSidebar) onToggleSidebar(); else setMobileOpen((s) => !s); }}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <a href="/dashboard" className="flex items-center gap-3">
              <img src="/Media/Group%2033.png" alt="logo" className="h-8 w-auto" />
             
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              {/* Inline links with dropdowns on Properties and Loans */}
              <NavLink to="/dashboard" className="px-3 py-2 rounded-md hover:bg-gray-100 text-sm">Home</NavLink>
              <NavLink to="/dashboard" className="px-3 py-2 rounded-md hover:bg-gray-100 text-sm">Analytics</NavLink>

              <div className="relative">
                <button
                  onClick={() => { setPropertiesOpen((s) => !s); setLoansOpen(false); setMoreOpen(false); }}
                  className="px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium"
                  aria-expanded={propertiesOpen}
                >
                  Properties
                </button>
                {propertiesOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-40">
                    <NavLink to="/properties" className="block px-3 py-2 hover:bg-gray-50">View All</NavLink>
                    <NavLink to="/properties/add" className="block px-3 py-2 hover:bg-gray-50">Add Property</NavLink>
                    <NavLink to="/properties/manage" className="block px-3 py-2 hover:bg-gray-50">Update / Delete</NavLink>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => { setLoansOpen((s) => !s); setPropertiesOpen(false); setMoreOpen(false); }}
                  className="px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium"
                  aria-expanded={loansOpen}
                >
                  Loans
                </button>
                {loansOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-40">
                    <NavLink to="/dashboard/loan" className="block px-3 py-2 hover:bg-gray-50">View All</NavLink>
                    <NavLink to="/dashboard/loan" className="block px-3 py-2 hover:bg-gray-50">Add Loan Plan</NavLink>
                    <NavLink to="/dashboard/loan" className="block px-3 py-2 hover:bg-gray-50">Update / Delete</NavLink>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => { setMoreOpen((s) => !s); }}
                  className="px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium"
                  aria-expanded={moreOpen}
                >
                  Installments
                </button>
                {moreOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-40">
                    <NavLink to="/dashboard/Installments" className="block px-3 py-2 hover:bg-gray-50">All-Request</NavLink>
                    <NavLink to="/dashboard/Installments/" className="block px-3 py-2 hover:bg-gray-50">Create-Installments</NavLink>
                    <NavLink to="/dashboard/Installments/update" className="block px-3 py-2 hover:bg-gray-50">Update/Delete</NavLink>
                  </div>
                )}
              </div>

              <a href="/" className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-600">{(user?.name || "U")[0]}</div>
                  )}
                </div>
                <div className="hidden sm:block text-sm">
                  <div className="font-medium text-gray-700">{user?.name || "User"}</div>
                  <div className="text-xs text-gray-500">{user?.email || ""}</div>
                </div>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => logout('/')}
                className="px-3 py-1.5 bg-red-700 text-white rounded-md text-sm hover:bg-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown content */}
      {mobileOpen && (
        <div className="sm:hidden border-t bg-white">
          <div className="px-4 py-3 flex flex-col gap-2">
            <a href="/dashboard" className="px-3 py-2 rounded-md hover:bg-gray-50">Home</a>
            <a href="/dashboard/analytics" className="px-3 py-2 rounded-md hover:bg-gray-50">Analytics</a>

            <div>
              <button
                onClick={() => { setMobPropertiesOpen((s) => !s); setMobLoansOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Properties</span>
                <span className="text-xs">{mobPropertiesOpen ? "−" : "+"}</span>
              </button>
              {mobPropertiesOpen && (
                <div className="pl-4 mt-1 flex flex-col gap-1">
                  <a href="/properties" className="px-3 py-2 rounded-md hover:bg-gray-50">View All</a>
                  <a href="/properties/add" className="px-3 py-2 rounded-md hover:bg-gray-50">Add Property</a>
                  <a href="/properties/manage" className="px-3 py-2 rounded-md hover:bg-gray-50">Update / Delete</a>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => { setMobLoansOpen((s) => !s); setMobPropertiesOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Loans</span>
                <span className="text-xs">{mobLoansOpen ? "−" : "+"}</span>
              </button>
              {mobLoansOpen && (
                <div className="pl-4 mt-1 flex flex-col gap-1">
                  <a href="/dashboard/loan" className="px-3 py-2 rounded-md hover:bg-gray-50">View All</a>
                  <a href="/dashboard/loan" className="px-3 py-2 rounded-md hover:bg-gray-50">Add Loan Plan</a>
                  <a href="/loans/manage" className="px-3 py-2 rounded-md hover:bg-gray-50">Update / Delete</a>
                </div>
              )}
            </div>

            <a href="/profile" className="flex items-center gap-3 mt-2">
              <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-600">{(user?.name || "U")[0]}</div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-800">{user?.name || "User"}</div>
                <div className="text-xs text-gray-500">{user?.email || ""}</div>
              </div>
            </a>

            <a href="/dashboard/notifications" className="px-3 py-2 rounded-md hover:bg-gray-50">Notifications</a>
            <a href="/dashboard/settings" className="px-3 py-2 rounded-md hover:bg-gray-50">Settings</a>
            <button onClick={() => logout('/')} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50">Logout</button>
          </div>
        </div>
      )}
    </header>
  );
}
