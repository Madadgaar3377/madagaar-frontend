// src/components/LoadingPage.jsx
import React from "react";

/**
 * LoadingPage
 * Props:
 *  - percent?: number (0..100)  shows progress bar and percent
 *  - message?: string  optional message under spinner
 *  - logoSrc?: string  optional logo image URL (if you want)
 *
 * Example usage:
 * <LoadingPage percent={45} message="Preparing your dashboard..." />
 */
export default function LoadingPage({
  percent = null,
  message = "Hang tight  preparing things for you...",
  logoSrc = null, // if you have a small logo URL set it here
}) {
  const accent = "var(--color-primary, rgb(183,36,42))";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6 safe-area-top safe-area-bottom">
      <div className="w-full max-w-2xl text-center space-y-6">
        {/* Floating brand / hero */}
        <div className="mx-auto size-36 sm:w-40 sm:h-40 rounded-3xl bg-white shadow-soft flex items-center justify-center relative overflow-hidden">
          {/* Animated concentric rings (SVG) */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
                <stop offset="100%" stopColor="#ff8a8a" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            <g transform="translate(60,60)">
              <circle r="44" stroke="rgba(0,0,0,0.04)" strokeWidth="6" fill="none" />
              <circle r="32" stroke="url(#g1)" strokeWidth="5" fill="none"
                strokeDasharray="100"
                strokeDashoffset="0"
                className="animate-spin-slow"
                style={{ transformOrigin: "60px 60px" }}
              />
              <circle r="20" stroke="rgba(0,0,0,0.06)" strokeWidth="3" fill="none" />
            </g>
          </svg>

          {/* central dot + logo or letter */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="size-20 rounded-lg bg-[rgba(183,36,42,0.12)] flex items-center justify-center">
              {logoSrc ? (
                <img src={logoSrc} alt="logo" className="size-14 object-contain" />
              ) : (
                <div className="text-[28px] font-extrabold" style={{ color: accent }}>
                  M
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500">Madadgaar</div>
          </div>
        </div>

        {/* Animated text + dots */}
        <div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800">Loading</h2>
            <div className="flex items-center gap-1">
              <span className="dot animate-pulse-dot" />
              <span className="dot animate-pulse-dot delay-200" />
              <span className="dot animate-pulse-dot delay-400" />
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-500 px-6">{message}</p>
        </div>

        {/* Progress bar (if percent provided) */}
        {typeof percent === "number" && percent >= 0 && percent <= 100 ? (
          <div className="px-6">
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  background: `linear-gradient(90deg, ${accent}, #ff8a8a)`,
                }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">{percent}%</div>
          </div>
        ) : (
          // subtle shimmer bar when no percent
          <div className="px-10">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(183,36,42,0.12)] to-transparent animate-shimmer" />
            </div>
          </div>
        )}

        {/* small actions / brochure link */}
        <div className="flex items-center justify-center gap-3">
          <button type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-full bg-white border shadow-sm text-sm font-medium hover:bg-gray-50"
          >
            Retry
          </button>

          {/* developer note: local uploaded pdf path used as button href */}
         
        </div>

        {/* small hint */}
        <div className="text-xs text-gray-400 text-center">Tip: This screen will automatically disappear once content is ready.</div>
      </div>

      {/* local <style> for animations (Tailwind can't express custom keyframes inline) */}
      <style>{`
        /* Dots */
        .dot {
          width: 8px;
          height: 8px;
          background: ${accent};
          border-radius: 9999px;
          display: inline-block;
          opacity: 0.85;
        }
        .animate-pulse-dot {
          animation: pulse-dot 1.2s infinite ease-in-out;
        }
        .animate-pulse-dot.delay-200 { animation-delay: 0.2s; }
        .animate-pulse-dot.delay-400 { animation-delay: 0.4s; }

        @keyframes pulse-dot {
          0% { transform: translateY(0); opacity: 0.9; }
          50% { transform: translateY(-6px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.9; }
        }

        /* slow spin on inner ring */
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* shimmer */
        .animate-shimmer {
          animation: shimmer 1.6s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-30%); opacity: 0.7; }
          50% { transform: translateX(30%); opacity: 1; }
          100% { transform: translateX(-30%); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
