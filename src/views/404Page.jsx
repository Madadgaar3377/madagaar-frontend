// src/pages/NotFound.jsx
import React from "react";
import { useRouter } from 'next/navigation';
import SEO from "../components/SEO";
import AnimatedSection from "../components/AnimatedSection";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center section-padding">
      <SEO
        title="404 - Page Not Found | Madadgaar Expert Partner"
        description="The page you are looking for doesn't exist. Return to Madadgaar homepage to explore property solutions, insurance, loans, and installment plans."
        canonicalUrl="https://madadgaar.com.pk/404"
        noIndex={true}
      />
      <AnimatedSection animation="fadeInUp" delay={0} className="w-full max-w-xl mx-auto">
      <div className="w-full bg-white rounded-3xl shadow-soft border border-gray-100 p-6 sm:p-8 text-center space-y-6 safe-margin">
        {/* Icon / Badge */}
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-red-50">
          <span className="text-3xl" role="img" aria-label="broken link">
            🔍
          </span>
        </div>

        {/* Main text */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">
            404 – Page not found
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            The page you are looking for doesn’t exist or may have been moved.
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
          <button type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Go Back
          </button>
          <button type="button"
            onClick={() => router.push("/")}
            className="w-full sm:w-auto btn-primary px-5 py-2.5 rounded-full text-sm font-semibold min-h-touch"
          >
            Go to Home
          </button>
        </div>

        {/* Helpful suggestion */}
        <div className="mt-4 text-xs text-gray-400">
          If you typed the URL manually, please check the spelling and try again.
        </div>
      </div>
      </AnimatedSection>
    </div>
  );
}
