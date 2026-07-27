"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles, Handshake } from "lucide-react";

/**
 * Split-screen auth shell: brand panel (left) + form panel (right).
 * Stacks on mobile with a compact brand strip on top.
 */
export default function AuthSplitLayout({
  children,
  eyebrow = "Madadgaar",
  title = "One account. Every financial path.",
  subtitle = "Loans, insurance, installments and property — built for Pakistan.",
  points = [
    { icon: ShieldCheck, text: "Secure OTP verification for every account" },
    { icon: Sparkles, text: "Browse plans from trusted partners" },
    { icon: Handshake, text: "Join as user, agent, or business partner" },
  ],
}) {
  return (
    <div
      className="min-h-screen lg:h-[100dvh] lg:overflow-hidden flex flex-col lg:flex-row bg-[#f7f4f1]"
      style={{ fontFamily: "var(--font-auth-body), Outfit, system-ui, sans-serif" }}
    >
      {/* Left — brand / content */}
      <aside className="relative lg:w-[44%] xl:w-[42%] shrink-0 overflow-hidden text-white">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 20%, rgba(255,255,255,0.18), transparent 55%),
              radial-gradient(ellipse 70% 50% at 90% 80%, rgba(0,0,0,0.25), transparent 50%),
              linear-gradient(155deg, #c42a30 0%, #9e1f24 45%, #6b1418 100%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between min-h-[200px] lg:min-h-full px-6 py-7 sm:px-10 sm:py-10 lg:px-12 lg:py-14">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-lg sm:text-xl font-extrabold tracking-tight text-white hover:opacity-90 transition-opacity"
              style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
            >
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-bold">
                M
              </span>
              Madadgaar
            </Link>
          </div>

          <div className="mt-7 lg:mt-0 max-w-md">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-white/70 mb-3">
              {eyebrow}
            </p>
            <h1
              className="text-3xl sm:text-4xl xl:text-[2.65rem] font-extrabold leading-[1.12] tracking-tight text-white"
              style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
            >
              {title}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed max-w-sm">
              {subtitle}
            </p>

            <ul className="mt-8 space-y-3.5 hidden sm:block">
              {points.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/12 border border-white/15">
                    <Icon className="size-4 text-white" strokeWidth={2} />
                  </span>
                  <span className="text-sm text-white/85 leading-snug pt-1.5">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 lg:mt-0 text-xs text-white/50">
            © {new Date().getFullYear()} Madadgaar
          </p>
        </div>
      </aside>

      {/* Right — form */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#faf8f6] lg:overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
