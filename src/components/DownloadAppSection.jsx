import React from "react";
import Link from "next/link";
import AnimatedSection from "./AnimatedSection";
import StaggerReveal from "./StaggerReveal";

const ACCENT = "rgb(183, 36, 42)";

export default function DownloadAppSection({ delay = 140, className = "w-full" }) {
  return (
    <AnimatedSection animation="fadeInUp" delay={delay} className={className}>
      <section className="w-full bg-gradient-to-br from-red-50 via-white to-gray-50 section-padding overflow-hidden">
        <div className="container-content page-hero">
          <StaggerReveal animation="fadeInLeft" index={0} staggerMs={0} className="page-hero-col flex justify-center order-2 lg:order-1">
            <img
              src="/Media/mobileAppMockup.png"
              alt="Download Madadgaar mobile app for property, loans, installments and insurance in Pakistan"
              loading="lazy"
              className="rounded-2xl shadow-lg page-media interactive-image float-gentle"
            />
          </StaggerReveal>
          <StaggerReveal animation="fadeInRight" index={1} staggerMs={0} className="page-hero-col space-y-4 sm:space-y-5 order-1 lg:order-2">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold bg-white shadow-sm border border-red-100 transition-shadow duration-300 hover:shadow-md"
              style={{ color: ACCENT }}
            >
              Mobile App
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              Download the Madadgaar App
            </h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Take Madadgaar with you on Android. Browse property listings, compare installment plans, explore
              loans and insurance, submit applications, and track updates  all from one free mobile app built
              for users in Pakistan.
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-600">
              <li className="flex items-start gap-2 transition-transform duration-300 hover:translate-x-1">
                <span style={{ color: ACCENT }} aria-hidden>
                  ✓
                </span>
                Property listings &amp; rentals on your phone
              </li>
              <li className="flex items-start gap-2 transition-transform duration-300 hover:translate-x-1">
                <span style={{ color: ACCENT }} aria-hidden>
                  ✓
                </span>
                Installment plans, loans &amp; insurance in one app
              </li>
              <li className="flex items-start gap-2 transition-transform duration-300 hover:translate-x-1">
                <span style={{ color: ACCENT }} aria-hidden>
                  ✓
                </span>
                Free download from Google Play Store
              </li>
            </ul>
            <Link
              href="/download-app"
              className="btn-primary btn-smooth mt-2 inline-flex items-center gap-2 px-5 py-3 text-sm sm:text-base rounded-full font-semibold"
            >
              <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
              </svg>
              Download App
            </Link>
          </StaggerReveal>
        </div>
      </section>
    </AnimatedSection>
  );
}
