import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { APP_BANNER_SESSION_KEY } from "../constants/mobileApp";

const ACCENT = "#b7242a";

/** Pages with their own download-app content — skip the floating promo banner */
const BANNER_HIDDEN_PATHS = ["/about", "/download-app"];

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

  const handleClose = () => {
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
          role="region"
          aria-label="Download Madadgaar mobile app"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed left-0 right-0 z-[48] px-3 sm:px-4 lg:px-8 xl:px-12 pointer-events-none"
          style={{
            bottom: "max(4.75rem, calc(3.5rem + env(safe-area-inset-bottom, 0px)))",
          }}
        >
          <div className="pointer-events-auto mx-auto w-full max-w-3xl xl:max-w-4xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div
              className="relative flex items-center gap-3 sm:gap-4 p-3 sm:px-5 sm:py-4"
              style={{
                background: `linear-gradient(135deg, ${ACCENT} 0%, #8b1a1f 55%, #6d1418 100%)`,
              }}
            >
              <div
                className="hidden sm:flex shrink-0 items-center justify-center size-11 rounded-xl bg-white/15 text-white"
                aria-hidden
              >
                <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1 text-white">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-white/80">
                  Mobile App
                </p>
                <p className="text-sm sm:text-base font-bold leading-tight truncate sm:whitespace-normal">
                  Get Madadgaar on your phone
                </p>
                <p className="hidden sm:block text-xs text-white/85 mt-0.5">
                  Properties, installments, loans &amp; insurance in one app
                </p>
              </div>

              <Link
                href="/download-app"
                className="shrink-0 inline-flex items-center justify-center rounded-full bg-white px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold shadow-md hover:bg-gray-100 active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#b7242a]"
                style={{ color: ACCENT }}
              >
                Download Now
              </Link>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close app download banner"
                className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 inline-flex items-center justify-center size-7 rounded-full bg-black/20 text-white hover:bg-black/35 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
