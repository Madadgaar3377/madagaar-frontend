"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { APP_BANNER_SESSION_KEY } from "../constants/mobileApp";

const ACCENT = "#b7242a";

const BANNER_HIDDEN_PATHS = ["/about", "/download-app"];

function CloseIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function AppDownloadBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const hideOnPage = BANNER_HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    if (hideOnPage) {
      setVisible(false);
      return;
    }
    try {
      const dismissed = sessionStorage.getItem(APP_BANNER_SESSION_KEY) === "1";
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    }
  }, [hideOnPage]);

  useEffect(() => {
    if (!visible || hideOnPage) {
      document.body.style.removeProperty("padding-bottom");
      return;
    }
    document.body.style.paddingBottom =
      "max(6rem, calc(5rem + env(safe-area-inset-bottom, 0px)))";
    return () => document.body.style.removeProperty("padding-bottom");
  }, [visible, hideOnPage]);

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      sessionStorage.setItem(APP_BANNER_SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Download Madadgaar mobile app"
          aria-modal="false"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none"
          style={{
            bottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div
            className="pointer-events-auto relative w-full max-w-lg rounded-2xl border border-white/25 shadow-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, #8b1a1f 55%, #6d1418 100%)`,
            }}
          >
            {/* Close — top-right, always visible */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close and hide app download banner"
              className="absolute top-2.5 right-2.5 z-10 inline-flex items-center justify-center size-8 rounded-full bg-white/20 text-white border border-white/30 hover:bg-white/30 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#b7242a]"
            >
              <CloseIcon />
            </button>

            <div className="flex items-center gap-3 p-3.5 sm:p-4 pr-12 sm:pr-14">
              <div
                className="hidden sm:flex shrink-0 items-center justify-center size-11 rounded-xl bg-white/15 text-white"
                aria-hidden
              >
                <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1 text-white">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/85">
                  Mobile App
                </p>
                <p className="text-sm sm:text-base font-bold leading-snug mt-0.5">
                  Get Madadgaar on your phone
                </p>
              </div>

              <Link
                href="/download-app"
                className="shrink-0 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-[#b7242a] shadow-md hover:bg-gray-50 active:scale-[0.97] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#b7242a]"
              >
                Download
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
