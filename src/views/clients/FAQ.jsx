"use client";

import React, { useState } from "react";
import SEO from "../../components/SEO";
import Link from 'next/link';
import AnimatedSection from "../../components/AnimatedSection";

const FAQPage = ({ generalFAQs, propertyFAQs, loanFAQs, installmentFAQs, insuranceFAQs }) => {
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
  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white section-padding">
        <div className="container-content max-w-4xl">
          {/* Header */}
          <AnimatedSection animation="fadeInUp" delay={0} className="w-full">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-responsive-2xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 text-responsive-base max-w-2xl mx-auto">
              Find answers to common questions about our services. Can't find what you're looking for? <Link href="/contact" className="text-red-600 hover:text-red-700 font-semibold">Contact us</Link>.
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
              href="/contact"
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
