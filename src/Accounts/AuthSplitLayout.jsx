"use client";

import Link from "next/link";

/**
 * Auth split shell inspired by clean SaaS directories (Pinstack-style),
 * branded for Madadgaar (crimson).
 *
 * props:
 * - tagline: small caps line (e.g. "LOANS · INSURANCE · GROW")
 * - title, subtitle: left panel copy
 * - footLinks: string[] shown along the bottom of left panel
 */
export default function AuthSplitLayout({
  children,
  tagline = "LOANS · INSURANCE · INSTALLMENTS",
  title = "The platform Pakistan trusts for financial help.",
  subtitle = "Compare plans, connect with partners, and move forward with one Madadgaar account.",
  footLinks = ["Trusted partners", "Secure OTP", "Users · Agents · Partners"],
}) {
  return (
    <div
      className="min-h-screen lg:h-[100dvh] lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2"
      style={{ fontFamily: "var(--font-auth-body), Outfit, system-ui, sans-serif" }}
    >
      {/* LEFT — brand atmosphere */}
      <aside className="relative hidden lg:flex flex-col text-white overflow-hidden min-h-full">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 15% 10%, rgba(255,255,255,0.14), transparent 50%),
              radial-gradient(ellipse 80% 60% at 85% 90%, rgba(0,0,0,0.35), transparent 55%),
              linear-gradient(165deg, #9e1f25 0%, #7a151a 48%, #4a0d11 100%)
            `,
          }}
        />
        {/* Soft noise-like wash */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full px-10 xl:px-14 py-10 xl:py-12">
          {/* Pill logo */}
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 self-start rounded-full bg-white/10 border border-white/15 backdrop-blur-md pl-1.5 pr-4 py-1.5 hover:bg-white/15 transition-colors"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-white text-[#9e1f25] text-[13px] font-bold">
              M
            </span>
            <span
              className="text-[14px] font-semibold tracking-tight text-white"
              style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
            >
              madadgaar.com.pk
            </span>
          </Link>

          {/* Center copy */}
          <div className="max-w-lg">
            <p className="text-[11px] font-semibold tracking-[0.28em] text-[#f5b4b7] mb-5">
              {tagline}
            </p>
            <h1
              className="text-[2.15rem] xl:text-[2.55rem] font-semibold leading-[1.15] tracking-tight text-white"
              style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
            >
              {title}
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-white/70 max-w-md">
              {subtitle}
            </p>
          </div>

          {/* Bottom meta links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/45">
            {footLinks.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile brand strip */}
      <div
        className="lg:hidden px-5 py-4 text-white"
        style={{
          background: "linear-gradient(135deg, #9e1f25 0%, #6b1418 100%)",
        }}
      >
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-white text-[#9e1f25] text-[13px] font-bold">
            M
          </span>
          <span
            className="font-semibold"
            style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
          >
            Madadgaar
          </span>
        </Link>
      </div>

      {/* RIGHT — form stage */}
      <main className="relative flex flex-col min-h-0 bg-[#f7f8fa] lg:overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-[420px] mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}

/** Soft elevated card wrapping auth forms (reference style). */
export function AuthFormCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-black/[0.04] shadow-[0_18px_50px_-24px_rgba(15,23,42,0.28)] p-6 sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

export const authInputClass =
  "w-full px-3.5 py-3 rounded-xl bg-[#eef2f6] border border-transparent text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#b7242a]/35 focus:ring-4 focus:ring-[#b7242a]/10 transition-all";

export const authLabelClass =
  "block text-[13px] font-medium text-slate-700 mb-1.5";

export const authPrimaryBtnClass =
  "w-full py-3 rounded-xl bg-[#b7242a] text-white text-[14px] font-semibold hover:bg-[#9e1f25] focus:outline-none focus:ring-4 focus:ring-[#b7242a]/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-[0_10px_24px_-12px_rgba(183,36,42,0.7)]";
