import React from "react";
import Link from 'next/link';
import SEO from "../../components/SEO";
import AnimatedSection from "../../components/AnimatedSection";
import { PLAY_STORE_URL } from "../../constants/mobileApp";

const ACCENT = "rgb(183, 36, 42)";

const FEATURES = [
  {
    title: "Property Listings & Rentals",
    text: "Browse homes, plots, and rental listings across Pakistan. View details, compare locations, and apply from your phone.",
  },
  {
    title: "Installment Plans",
    text: "Explore mobile, electronics, and product installment options. Compare monthly payments and apply for the plan that fits your budget.",
  },
  {
    title: "Loans & Financing",
    text: "Find loan and financing products from trusted partners. Review amounts, tenure, and categories before you apply.",
  },
  {
    title: "Insurance Services",
    text: "Discover insurance plans, view policy details, submit applications, and track claim or maturity requests.",
  },
  {
    title: "Application Tracking",
    text: "Sign in to track your property, loan, installment, and insurance applications with status updates in one dashboard.",
  },
  {
    title: "Secure Account",
    text: "Manage your profile, security settings, and personal information with a secure Madadgaar account.",
  },
];

const FAQ_ITEMS = [
  {
    q: "How do I download the Madadgaar app?",
    a: "Tap Download on Google Play on this page to install Madadgaar from the official Google Play Store on your Android device.",
  },
  {
    q: "Is the Madadgaar app free to download?",
    a: "Yes. The Madadgaar app is free to download and use for browsing listings, comparing plans, and submitting applications.",
  },
  {
    q: "What services are available in the Madadgaar mobile app?",
    a: "The app includes property listings, installment plans, loans, insurance, application tracking, and secure account management for users in Pakistan.",
  },
  {
    q: "Can I apply for property, loans, or installments from the app?",
    a: "Yes. You can view details and submit applications directly through the Madadgaar mobile app after signing in or creating an account.",
  },
];

export default function DownloadAppPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MobileApplication",
        name: "Madadgaar",
        operatingSystem: "Android",
        applicationCategory: "BusinessApplication",
        offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
        description:
          "Madadgaar helps users explore property listings, installment plans, insurance support, and financing services in Pakistan.",
        downloadUrl: PLAY_STORE_URL,
        installUrl: PLAY_STORE_URL,
        url: "https://madadgaar.com.pk/download-app",
        publisher: {
          "@type": "Organization",
          name: "Madadgaar Expert Partner (SMC-Private) Limited",
          url: "https://madadgaar.com.pk",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5",
          ratingCount: "1",
        },
      },
      {
        "@type": "WebPage",
        name: "Download Madadgaar App",
        description: "Download the official Madadgaar Android app from Google Play.",
        url: "https://madadgaar.com.pk/download-app",
        isPartOf: { "@type": "WebSite", name: "Madadgaar", url: "https://madadgaar.com.pk" },
      },
    ],
  };

  return (
    <>
      <SEO
        title="Download Madadgaar App | Android App for Property, Loans, Installments & Insurance"
        description="Download the official Madadgaar mobile app on Google Play. Browse property listings, installment plans, loans, and insurance in Pakistan. Free Android app  compare options and apply from your phone."
        keywords="download madadgaar app, madadgaar app download, madadgaar android app, download app pakistan, property app pakistan, installment app pakistan, loan app pakistan, insurance app pakistan, madadgaar google play, madadgaar mobile app, get madadgaar app"
        canonicalUrl="https://madadgaar.com.pk/download-app"
        structuredData={structuredData}
        faqSchema={faqSchema}
      />

      {/* Hero */}
      <AnimatedSection animation="fadeInUp" className="w-full">
        <section className="w-full bg-gradient-to-br from-red-50 via-white to-gray-50 section-padding">
        <div className="container-content page-hero">
          <div className="page-hero-col space-y-5 sm:space-y-6">
              <span
                className="inline-block rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold bg-white shadow-sm border border-red-100"
                style={{ color: ACCENT }}
              >
                Official Android App
              </span>
              <h1 className="text-responsive-lg font-bold text-gray-900 leading-tight">
                Download Madadgaar App  Property, Installments, Loans &amp; Insurance in One Place
              </h1>
              <p className="text-gray-700 text-responsive-sm leading-relaxed">
                Get the Madadgaar mobile app on Google Play and access Pakistan&apos;s trusted marketplace from
                anywhere. Browse listings, compare plans, submit applications, and track updates  all from your
                Android phone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-base rounded-full"
                >
                  <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12 3.84 21.85C3.34 21.6 3 21.09 3 20.5Z" />
                  </svg>
                  Download on Google Play
                </a>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full border-2 font-semibold text-sm sm:text-base transition-colors hover:bg-gray-50"
                  style={{ borderColor: ACCENT, color: ACCENT }}
                >
                  Learn How It Works
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                Package: <code className="text-gray-700">com.madadgaarexpert.app</code> · Free download · Android
              </p>
            </div>

            <div className="page-hero-col flex justify-center">
              <img
                src="/Media/mobileAppMockup.png"
                alt="Madadgaar mobile app  property, installments, loans and insurance on Android"
                className="rounded-2xl shadow-xl page-media"
                loading="eager"
              />
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Features */}
      <AnimatedSection animation="fadeInUp" delay={80} className="w-full">
        <section className="w-full bg-white section-padding">
          <div className="container-content">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-responsive-2xl font-bold text-gray-900 mb-3">Why Download the Madadgaar App?</h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-responsive-sm">
                Everything you need for property, financing, and insurance  optimized for mobile browsing and
                applications in Pakistan.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="size-10 rounded-xl flex items-center justify-center text-white text-lg mb-4"
                    style={{ backgroundColor: ACCENT }}
                    aria-hidden
                  >
                    ✓
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* How to install */}
      <AnimatedSection animation="fadeInUp" delay={120} className="w-full">
        <section className="w-full bg-gradient-to-br from-gray-50 to-white section-padding">
          <div className="container-content">
            <h2 className="text-responsive-2xl font-bold text-gray-900 text-center mb-8">
              How to Install Madadgaar on Android
            </h2>
            <ol className="space-y-4">
              {[
                "Tap the Download on Google Play button on this page.",
                "Open the Madadgaar listing on Google Play Store.",
                "Tap Install and wait for the download to complete.",
                "Open the app, sign in or create an account, and start browsing.",
              ].map((step, i) => (
                <li
                  key={step}
                  className="flex items-start gap-4 bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100"
                >
                  <span
                    className="shrink-0 size-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-gray-700 text-sm sm:text-base pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </AnimatedSection>

      {/* FAQ */}
      <AnimatedSection animation="fadeInUp" delay={160} className="w-full">
        <section className="w-full bg-white section-padding">
          <div className="container-content max-w-3xl">
            <h2 className="text-responsive-2xl font-bold text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-gray-200 bg-gray-50 open:bg-white open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-gray-900 flex justify-between items-center gap-3">
                    {item.q}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA */}
      <section className="w-full section-padding" style={{ backgroundColor: ACCENT }}>
        <div className="container-content max-w-4xl text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Download Madadgaar?</h2>
          <p className="text-white/90 mb-6 text-sm sm:text-base max-w-2xl mx-auto">
            Join users across Pakistan who browse property, installments, loans, and insurance through the official
            Madadgaar Android app.
          </p>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-bold shadow-lg hover:bg-gray-100 transition-colors"
            style={{ color: ACCENT }}
          >
            Download Now  Google Play
          </a>
        </div>
      </section>
    </>
  );
}
