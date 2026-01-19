// src/pages/InsuranceInfo.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../../components/SEO";

const ACCENT = "rgb(183,36,42)";

export default function InsuranceInfo() {
  const navigate = useNavigate();

  const handleApplyClick = () => {
    // change route to wherever your insurance apply form is
    navigate("/apply-insurance");
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    "name": "Madadgaar Insurance Services",
    "description": "Pakistan's trusted platform for resolving insurance complaints and finding the right insurance coverage",
    "url": "https://madadgaar.com.pk/insurance",
    "areaServed": "Pakistan"
  };

  return (
    <div className="bg-gray-50">
      <SEO
        title="Insurance Solutions Pakistan - Car, Life, Health & Property Insurance | Madadgaar"
        description="Pakistan's most trusted platform for resolving insurance complaints. Get car insurance, life insurance, health insurance, and property insurance from leading providers. Expert support for claims and coverage."
        keywords="insurance pakistan, car insurance pakistan, life insurance, health insurance, property insurance, insurance claims, insurance companies pakistan, motor insurance, family insurance"
        canonicalUrl="https://madadgaar.com.pk/insurance"
        structuredData={structuredData}
      />
      {/* top banner */}
      <div className="bg-white border-b">
        <div className="container-content max-w-6xl py-4 sm:py-6 flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
              Insurance Solutions
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1">
              Protect your life, health, and assets with tailored insurance plans.
            </p>
          </div>
          <button
            onClick={handleApplyClick}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium text-white shadow-sm"
            style={{ backgroundColor: ACCENT }}
          >
            Apply for Insurance
          </button>
        </div>
      </div>

      {/* main content */}
      <div className="container-content max-w-6xl py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* hero card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
              Secure your future with the right coverage
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 sm:mt-3">
              We are offers reliable support for addressing insurance-related issues. We partner with leading insurance companies to ensure your concerns are handled effectively and fairly. Our platform is dedicated to providing swift resolutions, helping you navigate the complexities of insurance claims with ease. With a focus on transparency and customer satisfaction, we are your go-to resource for resolving insurance complaints in Pakistan.
            </p>

            <div className="mt-3 sm:mt-4 lg:mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500">
                  Quick Approvals
                </div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-800">
                  Simple documentation and fast processing for eligible customers.
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500">
                  Flexible Plans
                </div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-800">
                  Choose coverage and tenure according to your need & budget.
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-[10px] sm:text-xs font-semibold text-gray-500">
                  Trusted Partners
                </div>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-800">
                  Insurance plans from reputed banks & insurance providers.
                </div>
              </div>
            </div>

            <button
              onClick={handleApplyClick}
              className="mt-6 inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-white shadow-sm"
              style={{ backgroundColor: ACCENT }}
            >
              Get Started – Apply Now
            </button>
          </div>

          {/* simple illustrative block (you can replace with real image) */}
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="h-52 md:h-60 rounded-2xl bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="h-52 md:h-60 rounded-2xl bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 flex items-center justify-center">
  <img
    src="Media/ins%20Frame.png"
    alt="Insurance illustration"
    className="
      max-h-full
      max-w-full
      object-contain
    "
  />
</div>

              </div>
            </div>
          </div>
        </div>

        {/* types of insurance */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Types of Insurance We Facilitate
            </h3>
            <span className="text-xs text-gray-500">
              (Example categories – connect with your live data later)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Life Insurance */}
            <div className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col">
              <div className="text-xs font-semibold text-gray-500">Life</div>
              <h4 className="mt-1 text-sm font-semibold text-gray-800">
                Life Insurance / Family Protection
              </h4>
              <p className="mt-2 text-xs text-gray-600">
                Provides financial support to your family in case of any
                unfortunate event. Ideal for salaried individuals and business
                owners who want long-term protection.
              </p>
              <ul className="mt-3 text-xs text-gray-600 list-disc list-inside space-y-1">
                <li>Fixed or flexible premium options</li>
                <li>Lump-sum benefit to nominees</li>
                <li>Optional riders for extra coverage</li>
              </ul>
              <button
                onClick={handleApplyClick}
                className="mt-4 inline-flex items-center justify-center px-4 py-2 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: ACCENT }}
              >
                Apply for Life Insurance
              </button>
            </div>

            {/* Health Insurance */}
            <div className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col">
              <div className="text-xs font-semibold text-gray-500">Health</div>
              <h4 className="mt-1 text-sm font-semibold text-gray-800">
                Health & Medical Coverage
              </h4>
              <p className="mt-2 text-xs text-gray-600">
                Helps you manage hospital and medical expenses without putting
                pressure on your savings. Coverage for individuals and families.
              </p>
              <ul className="mt-3 text-xs text-gray-600 list-disc list-inside space-y-1">
                <li>Cashless hospitalization (partner hospitals)</li>
                <li>Emergency & planned treatment coverage</li>
                <li>Critical illness add-on options</li>
              </ul>
              <button
                onClick={handleApplyClick}
                className="mt-4 inline-flex items-center justify-center px-4 py-2 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: ACCENT }}
              >
                Apply for Health Insurance
              </button>
            </div>

            {/* Asset / General Insurance */}
            <div className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col">
              <div className="text-xs font-semibold text-gray-500">Assets</div>
              <h4 className="mt-1 text-sm font-semibold text-gray-800">
                Car / Home / Business Insurance
              </h4>
              <p className="mt-2 text-xs text-gray-600">
                Protect valuable assets like your vehicle, home and business
                property from accidental damage, theft and natural calamities.
              </p>
              <ul className="mt-3 text-xs text-gray-600 list-disc list-inside space-y-1">
                <li>Third-party & comprehensive car coverage</li>
                <li>Fire, theft & natural disaster protection</li>
                <li>Business interruption add-ons</li>
              </ul>
              <button
                onClick={handleApplyClick}
                className="mt-4 inline-flex items-center justify-center px-4 py-2 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: ACCENT }}
              >
                Apply for Asset Insurance
              </button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white rounded-2xl shadow-sm border p-6 md:p-7">
          <h3 className="text-lg font-semibold text-gray-800">
            How the Insurance Process Works
          </h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                   style={{ backgroundColor: ACCENT }}>
                1
              </div>
              <div className="mt-2 font-medium text-gray-800">Submit Details</div>
              <div className="mt-1 text-xs text-gray-600">
                Fill a short form with your personal and financial information.
              </div>
            </div>
            <div className="flex flex-col">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                   style={{ backgroundColor: ACCENT }}>
                2
              </div>
              <div className="mt-2 font-medium text-gray-800">Get Plan Options</div>
              <div className="mt-1 text-xs text-gray-600">
                Our team or partner will review your profile and share suitable plans.
              </div>
            </div>
            <div className="flex flex-col">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                   style={{ backgroundColor: ACCENT }}>
                3
              </div>
              <div className="mt-2 font-medium text-gray-800">Finalize Coverage</div>
              <div className="mt-1 text-xs text-gray-600">
                Choose the coverage, tenure and premium that suits you best.
              </div>
            </div>
            <div className="flex flex-col">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                   style={{ backgroundColor: ACCENT }}>
                4
              </div>
              <div className="mt-2 font-medium text-gray-800">Policy Issued</div>
              <div className="mt-1 text-xs text-gray-600">
                After verification and payment, your insurance policy gets issued.
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-xs md:text-sm text-gray-600">
              Need help choosing the right insurance? Our team can guide you based on your
              profile and risk appetite.
            </p>
            <button
              onClick={handleApplyClick}
              className="inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: ACCENT }}
            >
              Talk to an Advisor / Apply
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
