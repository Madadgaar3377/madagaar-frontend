"use client";

import Link from "next/link";

const BRAND = "#b7242a";
const BRAND_DARK = "#9e1f25";

/**
 * Auth split shell (Pinstack-style) with Madadgaar brand red.
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
      <aside className="relative hidden lg:flex flex-col text-white overflow-hidden min-h-full">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 15% 10%, rgba(255,255,255,0.16), transparent 50%),
              radial-gradient(ellipse 80% 60% at 85% 90%, rgba(0,0,0,0.28), transparent 55%),
              linear-gradient(165deg, #c02930 0%, #b7242a 42%, #7a151a 100%)
            `,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full px-10 xl:px-14 py-10 xl:py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 self-start rounded-full bg-white/10 border border-white/15 backdrop-blur-md pl-1.5 pr-4 py-1.5 hover:bg-white/15 transition-colors"
          >
            <span
              className="inline-flex size-7 items-center justify-center rounded-full bg-white text-[13px] font-bold"
              style={{ color: BRAND }}
            >
              M
            </span>
            <span
              className="text-[14px] font-semibold tracking-tight text-white"
              style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
            >
              madadgaar.com.pk
            </span>
          </Link>

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
            <p className="mt-5 text-[15px] leading-relaxed text-white/75 max-w-md">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[13px] text-white/55">
            {footLinks.map((label, i) => (
              <span key={label} className="inline-flex items-center gap-2">
                {i > 0 && <span className="text-white/30" aria-hidden>|</span>}
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>
      </aside>

      <div
        className="lg:hidden px-5 py-4 text-white"
        style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}
      >
        <Link href="/" className="inline-flex items-center gap-2">
          <span
            className="inline-flex size-7 items-center justify-center rounded-full bg-white text-[13px] font-bold"
            style={{ color: BRAND }}
          >
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

      <main className="relative flex flex-col min-h-0 bg-[#f7f8fa] lg:overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-[420px] mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}

export function AuthFormCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

/** Brand primary CTA  uses CSS class so color/visibility never depends on Tailwind purge. */
export function AuthPrimaryButton({
  children,
  type = "submit",
  disabled = false,
  className = "",
  onClick,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`auth-btn-primary ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export const authInputClass = "auth-input";
export const authLabelClass = "auth-label";
export const authPrimaryBtnClass = "auth-btn-primary";
export const authLinkClass = "auth-link";
