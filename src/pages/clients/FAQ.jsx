import React, { useState } from "react";
import SEO from "../../components/SEO";
import { Link } from "react-router-dom";
import AnimatedSection from "../../components/AnimatedSection";

const FAQPage = () => {
  // State to track which FAQ items are expanded
  const [expandedItems, setExpandedItems] = useState({});
  
  // Toggle function for FAQ items
  const toggleFAQ = (category, index) => {
    const key = `${category}-${index}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  const generalFAQs = [
    {
      question: "What is Madadgaar?",
      answer: "Madadgaar is a digital platform that allows users across Pakistan to compare and explore multiple options for property, loans, installment plans, and insurance services. Our mission is to simplify complex decisions, making processes transparent, clear, and easy."
    },
    {
      question: "How does Madadgaar help me make better decisions?",
      answer: "By consolidating multiple options in one platform, Madadgaar allows you to compare features, prices, and benefits side by side, helping you understand choices clearly and act with confidence."
    },
    {
      question: "Is Madadgaar free to use?",
      answer: "Yes, browsing, comparing, and submitting requests on Madadgaar is free. Any service-specific costs are clearly communicated during the process."
    },
    {
      question: "Which services are available on Madadgaar?",
      answer: "Currently, we offer: Property (buying, selling, renting), Loans and financing solutions, Installment-based purchase options, Insurance support and claim assistance."
    },
    {
      question: "Can I compare multiple options at the same time?",
      answer: "Absolutely! You can view and evaluate multiple options side by side to find what fits your needs and budget best."
    },
    {
      question: "Is Madadgaar available across Pakistan?",
      answer: "Yes, we support users nationwide, covering major cities and regions."
    },
    {
      question: "Do I need to register to use Madadgaar?",
      answer: "You can explore information without registering. Registration is required to submit requests, save preferences, or track progress."
    },
    {
      question: "How secure is my personal information?",
      answer: "Security is a top priority. All data is handled according to our Privacy and Data Protection Policies, using secure systems and controlled access."
    },
    {
      question: "Does Madadgaar provide financial advice?",
      answer: "We provide structured information and comparison tools to guide informed decisions. Users should review all details carefully before proceeding."
    },
    {
      question: "How long does it take to get a response after submitting a request?",
      answer: "Response times vary by service type. Madadgaar ensures timely processing and provides clear updates throughout the process."
    },
    {
      question: "Can businesses also use Madadgaar?",
      answer: "Yes, our platform is suitable for individuals, families, and businesses seeking property, financial, installment, or insurance-related solutions."
    },
    {
      question: "Why should I choose Madadgaar over other platforms?",
      answer: "Madadgaar offers: Ease of use, Clear comparisons, Transparent processes, Multiple services in one platform, Nationwide reach."
    },
    {
      question: "How do I get started?",
      answer: "Select your desired service, explore available options, and submit your request. Madadgaar guides you step by step from start to finish."
    },
    {
      question: "Is Madadgaar constantly improving its services?",
      answer: "Yes, we regularly enhance our platform based on user feedback, market trends, and technological advancements."
    },
    {
      question: "Where can I find more information about policies and terms?",
      answer: "Review our Terms & Conditions and Privacy Policy directly on the website for complete details about usage, data protection, and platform guidelines."
    },
    {
      question: "Can I contact Madadgaar for support?",
      answer: "Yes, our support team is available via email, phone, or live chat to assist with any queries or issues."
    }
  ];

  const propertyFAQs = [
    {
      question: "How can I find properties for sale or rent in Pakistan?",
      answer: "Use Madadgaar to compare properties across Pakistan. Filter by city, location, price, and type to find the best option for buying, renting, or investment."
    },
    {
      question: "Can I compare multiple properties at once?",
      answer: "Yes, you can compare features, prices, areas, and amenities side by side."
    },
    {
      question: "Does Madadgaar provide verified property listings?",
      answer: "Yes, all listings are verified to ensure accurate information."
    },
    {
      question: "Can I search for commercial properties or plots?",
      answer: "Absolutely! We provide residential, commercial, and plot options with clear pricing, area, and possession details."
    },
    {
      question: "Can I schedule property visits through Madadgaar?",
      answer: "Yes, once you select a property, you can request a visit directly through the platform."
    }
  ];

  const loanFAQs = [
    {
      question: "What types of loans can I compare on Madadgaar?",
      answer: "Home loans, personal loans, business loans, auto loans, and other financing solutions from verified providers across Pakistan."
    },
    {
      question: "How do I know which loan is suitable for me?",
      answer: "Our comparison tools allow you to evaluate interest rates, fees, repayment plans, and eligibility criteria to choose the best option."
    },
    {
      question: "Can I apply for a loan directly through Madadgaar?",
      answer: "Yes, submit your request via the platform to connect with verified lenders."
    },
    {
      question: "Are loan offers updated in real-time?",
      answer: "Yes, our platform provides up-to-date rates, fees, and availability."
    },
    {
      question: "Is there any hidden fee when applying through Madadgaar?",
      answer: "No, all applicable fees are clearly disclosed before you submit any application."
    }
  ];

  const installmentFAQs = [
    {
      question: "What products can I buy on installment through Madadgaar?",
      answer: "Electronics, furniture, home appliances, machinery, and other consumer goods."
    },
    {
      question: "How are EMI options displayed?",
      answer: "Monthly installments, tenure, interest rates, and total cost are clearly shown for easy comparison."
    },
    {
      question: "Can I apply for multiple installment products at the same time?",
      answer: "Yes, compare and apply for multiple products side by side."
    },
    {
      question: "Are installment plans available nationwide?",
      answer: "Yes, across all major cities in Pakistan."
    },
    {
      question: "Can I modify my EMI plan after approval?",
      answer: "Yes, subject to provider terms, you may adjust tenure or installments with provider approval."
    }
  ];

  const insuranceFAQs = [
    {
      question: "What types of insurance can I compare on Madadgaar?",
      answer: "Life, health, motor, travel, property, and Takaful plans from verified providers."
    },
    {
      question: "Can Madadgaar help with insurance claims?",
      answer: "Yes, we provide guidance on claims, including documentation, timelines, and status tracking."
    },
    {
      question: "How do I know which insurance plan is suitable?",
      answer: "Use our comparison tools to evaluate premiums, coverage, claim settlement times, and benefits."
    },
    {
      question: "Are insurance services available across Pakistan?",
      answer: "Yes, including major cities like Lahore, Karachi, Islamabad, and Rawalpindi."
    },
    {
      question: "Can I track my insurance claim online?",
      answer: "Yes, real-time claim tracking is available for all supported insurance plans."
    },
    {
      question: "Can I renew or upgrade my insurance policy via Madadgaar?",
      answer: "Yes, you can manage renewals and upgrades directly through the platform."
    }
  ];

  // Create FAQ Schema
  const allFAQs = [
    ...generalFAQs,
    ...propertyFAQs,
    ...loanFAQs,
    ...installmentFAQs,
    ...insuranceFAQs
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFAQs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <SEO
        title="FAQs"
        description="Have questions about property, loans, installments, or insurance in Pakistan? Find clear answers in Madadgaar's comprehensive FAQ section."
        keywords="madadgaar faq, frequently asked questions, property faq pakistan, loan faq pakistan, installment faq pakistan, insurance faq pakistan, madadgaar help"
        canonicalUrl="https://madadgaar.com.pk/faq"
        faqSchema={faqSchema}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white section-padding">
        <div className="container-content max-w-4xl">
          {/* Header */}
          <AnimatedSection animation="fadeInUp" delay={0} className="w-full">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-responsive-2xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 text-responsive-base max-w-2xl mx-auto">
              Find answers to common questions about our services. Can't find what you're looking for? <Link to="/contact" className="text-red-600 hover:text-red-700 font-semibold">Contact us</Link>.
            </p>
          </div>
          </AnimatedSection>

          {/* Quick Navigation */}
          <AnimatedSection animation="fadeInUp" delay={80} className="w-full">
          <div className="mb-8 sm:mb-10 bg-white rounded-xl shadow-soft border border-gray-100 p-4 sm:p-6">
            <h2 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4">Quick Navigation</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <a href="#general" className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 rounded-lg font-medium transition">
                General
              </a>
              <a href="#property" className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 rounded-lg font-medium transition">
                Property
              </a>
              <a href="#loan" className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 rounded-lg font-medium transition">
                Loans
              </a>
              <a href="#installment" className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 rounded-lg font-medium transition">
                Installments
              </a>
              <a href="#insurance" className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 rounded-lg font-medium transition">
                Insurance
              </a>
            </div>
          </div>
          </AnimatedSection>

          {/* General FAQs */}
          <section id="general" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">General Questions</h2>
            <div className="space-y-3 sm:space-y-4">
              {generalFAQs.map((faq, index) => {
                const key = `general-${index}`;
                const isExpanded = expandedItems[key];
                return (
                  <div key={index} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <button type="button"
                      onClick={() => toggleFAQ('general', index)}
                      className="w-full flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-expanded={isExpanded}
                    >
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 flex-1 pr-2">
                        {faq.question}
                      </h3>
                      <svg
                        className={`size-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform duration-300 text-gray-500 ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Property FAQs */}
          <section id="property" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Property Questions</h2>
            <div className="space-y-3 sm:space-y-4">
              {propertyFAQs.map((faq, index) => {
                const key = `property-${index}`;
                const isExpanded = expandedItems[key];
                return (
                  <div key={index} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <button type="button"
                      onClick={() => toggleFAQ('property', index)}
                      className="w-full flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-expanded={isExpanded}
                    >
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 flex-1 pr-2">
                        {faq.question}
                      </h3>
                      <svg
                        className={`size-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform duration-300 text-gray-500 ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Loan FAQs */}
          <section id="loan" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Loan / Financing Questions</h2>
            <div className="space-y-3 sm:space-y-4">
              {loanFAQs.map((faq, index) => {
                const key = `loan-${index}`;
                const isExpanded = expandedItems[key];
                return (
                  <div key={index} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <button type="button"
                      onClick={() => toggleFAQ('loan', index)}
                      className="w-full flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-expanded={isExpanded}
                    >
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 flex-1 pr-2">
                        {faq.question}
                      </h3>
                      <svg
                        className={`size-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform duration-300 text-gray-500 ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Installment FAQs */}
          <section id="installment" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Installment / EMI Products Questions</h2>
            <div className="space-y-3 sm:space-y-4">
              {installmentFAQs.map((faq, index) => {
                const key = `installment-${index}`;
                const isExpanded = expandedItems[key];
                return (
                  <div key={index} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <button type="button"
                      onClick={() => toggleFAQ('installment', index)}
                      className="w-full flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-expanded={isExpanded}
                    >
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 flex-1 pr-2">
                        {faq.question}
                      </h3>
                      <svg
                        className={`size-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform duration-300 text-gray-500 ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Insurance FAQs */}
          <section id="insurance" className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Insurance & Claiming Services Questions</h2>
            <div className="space-y-3 sm:space-y-4">
              {insuranceFAQs.map((faq, index) => {
                const key = `insurance-${index}`;
                const isExpanded = expandedItems[key];
                return (
                  <div key={index} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <button type="button"
                      onClick={() => toggleFAQ('insurance', index)}
                      className="w-full flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-expanded={isExpanded}
                    >
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 flex-1 pr-2">
                        {faq.question}
                      </h3>
                      <svg
                        className={`size-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform duration-300 text-gray-500 ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center text-white shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Still have questions?</h2>
            <p className="mb-4 sm:mb-6 text-red-50 text-sm sm:text-base">Our support team is here to help you.</p>
            <Link
              to="/contact"
              className="inline-block bg-white text-red-600 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-sm sm:text-base shadow-md"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
