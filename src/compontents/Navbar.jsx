import React, { useState, useRef, useEffect } from "react";

export default function Navbar({
  logoSrc = "/Media/Group%2033.png",
  services = ["Insurance", "Properties", "Loans", "Installment"],
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false); // Desktop dropdown
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false); // Mobile collapsible
  const servicesRef = useRef(null);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <header className="w-full bg-white shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-3">
              <img src={logoSrc} alt="logo" className="h-10 rounded-md object-cover" />
            </a>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </a>

            {/* Desktop dropdown */}
            <div
              className="relative"
              ref={servicesRef}
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
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
                className={`absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-2 z-20 transition-all duration-300 transform ${
                  servicesOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                {services.map((s) => (
                  <a
                    key={s}
                    href={`/#${s.replace(/\s+/g, "-").toLowerCase()}`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            <a href="/about" className="text-gray-700 hover:text-gray-900">
              About Us
            </a>
            <a href="/blog" className="text-gray-700 hover:text-gray-900">
              Blog
            </a>
          </div>

          {/* Account & mobile button */}
          <div className="flex items-center gap-4">
            <a
              href="/account"
              className="hidden md:inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white"
              style={{ background: "rgb(183, 36, 42)" }}
            >
              Account
            </a>

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-200 ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"} bg-black/30`} />
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <a href="/" className="flex items-center gap-3">
            <img src={logoSrc} alt="logo" className="h-10 rounded-md object-cover" />
          </a>
          <button
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="px-4 py-4 overflow-auto h-[calc(100%-80px)]">
          <a href="/" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">
            Home
          </a>

          {/* Mobile Services collapsible */}
          <div className="mt-2 border-t pt-3">
            <button
              onClick={() => setMobileServicesOpen((s) => !s)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              <span className="font-medium">Services</span>
              <svg className={`w-4 h-4 transform transition-transform duration-300 ${mobileServicesOpen ? "rotate-180" : "rotate-0"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`mt-1 px-1 overflow-hidden transition-all duration-300 ${mobileServicesOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
              {services.map((s) => (
                <a
                  key={s}
                  href={`/#${s.replace(/\s+/g, "-").toLowerCase()}`}
                  className="block px-4 py-2 text-gray-700 rounded-md hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <a href="/about" className="block mt-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">
            About Us
          </a>
          <a href="/blog" className="block mt-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50">
            Blog
          </a>

          <div className="mt-6 px-3">
            <a href="/account" className="block text-center px-4 py-2 border rounded-md bg-[rgb(183,36,42)] text-white font-medium" onClick={() => setMobileOpen(false)}>
              Account
            </a>
          </div>
        </nav>
      </aside>
    </header>
  );
}
