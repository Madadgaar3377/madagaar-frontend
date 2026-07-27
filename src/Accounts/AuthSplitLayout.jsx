"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles, Handshake } from "lucide-react";

/**
 * Split-screen auth shell: brand panel (left) + form panel (right).
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
      className="min-h-screen lg:h-[100dvh] lg:overflow-hidden flex flex-col lg:flex-row bg-[#f4f2ef]"
      style={{ fontFamily: "var(--font-auth-body), Outfit, system-ui, sans-serif" }}
    >
      {/* Left — brand */}
      <aside className="relative lg:w-[40%] xl:w-[38%] shrink-0 overflow-hidden text-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #b7242a 0%, #8f1a20 52%, #5c1014 100%)",
          }}
        />
        {/* Soft light orbs — no busy pattern */}
        <div
          className="absolute -top-24 -left-16 size-72 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: "rgba(255,255,255,0.35)" }}
        />
        <div
          className="absolute bottom-0 right-0 size-80 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: "rgba(0,0,0,0.45)" }}
        />
        <div
          className="absolute top-1/3 right-[-20%] w-[70%] h-[40%] rounded-full opacity-20 blur-2xl pointer-events-none"
          style={{ background: "rgba(255,180,180,0.35)" }}
        />

        <div className="relative z-10 flex flex-col justify-between min-h-[180px] lg:h-full px-6 py-6 sm:px-9 sm:py-9 lg:px-11 lg:py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-base sm:text-lg font-semibold tracking-tight text-white/95 hover:text-white transition-colors w-fit"
            style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
          >
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white text-[#b7242a] text-sm font-bold shadow-sm">
              M
            </span>
            Madadgaar
          </Link>

          <div className="mt-6 lg:mt-0 max-w-[22rem]">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55 mb-3">
              {eyebrow}
            </p>
            <h1
              className="text-[1.65rem] sm:text-[2rem] xl:text-[2.15rem] font-semibold leading-[1.2] tracking-tight text-white"
              style={{ fontFamily: "var(--font-auth-display), Syne, sans-serif" }}
            >
              {title}
            </h1>
            <p className="mt-3.5 text-[13px] sm:text-sm text-white/75 leading-relaxed">
              {subtitle}
            </p>

            <ul className="mt-7 space-y-2.5 hidden sm:block">
              {points.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.08] border border-white/[0.1] px-3 py-2.5 backdrop-blur-[2px]"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white/15">
                    <Icon className="size-3.5 text-white" strokeWidth={2} />
                  </span>
                  <span className="text-[13px] text-white/90 leading-snug">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 lg:mt-0 text-[11px] text-white/40">
            © {new Date().getFullYear()} Madadgaar
          </p>
        </div>
      </aside>

      {/* Right — form */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#faf8f6] lg:overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-8 sm:py-10 lg:px-14 xl:px-20">
          <div className="w-full max-w-[400px] mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
