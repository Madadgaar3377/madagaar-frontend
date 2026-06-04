import React, { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { isAuthenticated } from "../utils/auth";

export default function Navbar({
  logoSrc = "/Media/Group%2033.png",
  services = ["Insurance", "Properties", "Loans", "Installments"],
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false); // Desktop dropdown
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false); // Mobile collapsible
  const [isScrolled, setIsScrolled] = useState(false);
  const servicesRef = useRef(null);
  const closeTimeout = useRef(null);

  // Scroll: expanded (original size) at top, compact when scrolled
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const expanded = !isScrolled;

  return (
    <header
      className={`w-full z-50 safe-area-top fixed top-0 left-0 right-0 transition-[padding] duration-300 ease-out ${
        expanded ? "pt-3 px-3 sm:pt-4 sm:px-4 md:pt-4 md:px-6" : "pt-2 px-3 sm:pt-2 sm:px-4 md:pt-2 md:px-6"
      }`}
    >
      {/* Tube-style navbar: rounded bar; original size when expanded, compact when scrolled */}
      <nav
        className={`container-content w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-soft transition-all duration-300 ease-out ${
          expanded ? "px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-2" : "px-3 py-1.5 sm:px-4 sm:py-1.5 md:px-5 md:py-1.5"
        }`}
      >
        <div
          className={`flex justify-between items-center transition-[min-height] duration-300 ease-out ${
            expanded ? "min-h-[3.25rem] sm:min-h-14" : "min-h-[2.75rem] sm:min-h-12"
          }`}
        >
          {/* Logo - original size when expanded, slightly smaller when scrolled */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <img
                src={logoSrc}
                alt="Madadgaar logo"
                className={`rounded-lg object-cover w-auto transition-[height] duration-300 ease-out ${
                  expanded ? "h-8 sm:h-9" : "h-7 sm:h-8"
                }`}
              />
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
            <Link href="/" className="px-3 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 text-sm font-medium">
              Home
            </Link>
            <Link href="/about" className="px-3 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 text-sm font-medium">
              About Us
            </Link>
            {/* <Link href="/offers" className="text-gray-700 hover:text-gray-900">
              Offers
            </Link> */}

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
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 text-sm font-medium"
              >
                Services
                <svg
                  className={`size-4 transform transition-transform duration-300 ${
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
                className={`absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-soft py-2 z-20 transition-all duration-200 transform origin-top-left ${
                  servicesOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                }`}
                // also keep mouse enter/leave on dropdown itself to avoid accidental close
                onMouseEnter={handleServicesEnter}
                onMouseLeave={handleServicesLeave}
              >
                {services.map((s) => (
                  <Link
                    key={s}
                    href={`/${s.replace(/\s+/g, "-").toLowerCase()}`}
                    className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors duration-200 rounded-xl mx-1.5 text-sm font-medium"
                    onClick={() => setServicesOpen(false)}
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>

            
            <Link href="/blog" className="px-3 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 text-sm font-medium">
              Blog
            </Link>
            <Link href="/faq" className="px-3 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 text-sm font-medium">
              FAQs
            </Link>
            <Link href="/contact" className="px-3 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 text-sm font-medium">
              Contact
            </Link>
            <Link
              href="/download-app"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-primary hover:bg-primary-50 transition-colors duration-200 text-sm font-semibold border border-primary/20"
            >
              <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
              </svg>
              Get App
            </Link>
          </div>

          {/* Account/Dashboard & mobile button */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated() ? (
              <Link
                href="/dashboard"
                className="btn-primary hidden md:inline-flex gap-2"
              >
                <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </Link>
            ) : (
              <Link
                href="/account"
                className="btn-primary hidden md:inline-flex"
              >
                Account
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="md:hidden inline-flex items-center justify-center min-h-touch min-w-touch p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Mobile sidebar overlay - animated */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar - slide animation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 left-0 h-full w-[min(18rem,85vw)] max-w-[18rem] bg-white z-50 shadow-2xl safe-area-left"
            aria-hidden={!mobileOpen}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" onClick={() => setMobileOpen(false)}>
                <img src={logoSrc} alt="Madadgaar logo" className="h-10 rounded-md object-cover" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center min-h-touch min-w-touch p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="p-4 overflow-y-auto h-[calc(100%-5rem)]">
              <Link href="/" className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors min-h-touch" onClick={() => setMobileOpen(false)}>
                Home
              </Link>

              {/* Mobile Services collapsible */}
              <div className="mt-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen((s) => !s)}
                  className="w-full flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-touch"
                  aria-expanded={mobileServicesOpen}
                >
                  <span className="font-medium">Services</span>
                  <svg className={`size-5 transform transition-transform duration-300 ${mobileServicesOpen ? "rotate-180" : "rotate-0"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <motion.div
                  initial={false}
                  animate={{ height: mobileServicesOpen ? "auto" : 0, opacity: mobileServicesOpen ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1 px-1 pb-2">
                    {services.map((s) => (
                      <Link
                        key={s}
                        href={`/${s.replace(/\s+/g, "-").toLowerCase()}`}
                        className="flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-primary-50 hover:text-primary transition-colors min-h-touch"
                        onClick={() => {
                          setMobileOpen(false);
                          setMobileServicesOpen(false);
                        }}
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>

              <Link href="/about" className="flex items-center mt-1 p-3 rounded-lg text-gray-700 hover:bg-gray-50 min-h-touch" onClick={() => setMobileOpen(false)}>About Us</Link>
              <Link href="/offers" className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 min-h-touch" onClick={() => setMobileOpen(false)}>Offers</Link>
              <Link href="/blog" className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 min-h-touch" onClick={() => setMobileOpen(false)}>Blog</Link>
              <Link href="/faq" className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 min-h-touch" onClick={() => setMobileOpen(false)}>FAQs</Link>
              <Link href="/contact" className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 min-h-touch" onClick={() => setMobileOpen(false)}>Contact</Link>

              <Link
                href="/download-app"
                className="flex items-center gap-2 mt-2 p-3 rounded-lg text-primary bg-primary-50 font-semibold min-h-touch"
                onClick={() => setMobileOpen(false)}
              >
                <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
                </svg>
                Download App
              </Link>

              <div className="mt-6 px-3">
                {isAuthenticated() ? (
                  <Link href="/dashboard" className="btn-primary w-full justify-center" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/account" className="btn-primary w-full justify-center" onClick={() => setMobileOpen(false)}>
                    Account
                  </Link>
                )}
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}
