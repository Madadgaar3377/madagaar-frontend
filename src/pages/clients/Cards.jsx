import React, { useEffect, useRef, useState } from "react";

/**
 * FeatureCards
 * - Expects an array of items with { id, number, title, desc, Icon }.
 * - Uses Tailwind for layout and styling.
 */

const features = [
  {
    id: 1,
    number: "01",
    title: "Property",
    desc: "Your Gateway to Seamless Property Solutions.",
    Icon: () => (
      <img src="/Media/H%20icon-2.png" alt="Property Solutions Icon - Buy, Sell and Rent Properties in Pakistan" />
    ),
  },
  {
    id: 2,
    number: "02",
    title: "Loan",
    desc: "Empower your ambitions with our seamless loan solutions.",
    Icon: () => (
      <img src="/Media/H%20icon-3.png" alt="Loan and Financing Icon - Personal, Home, Car and Business Loans in Pakistan" />
    ),
  },
  {
    id: 3,
    number: "03",
    title: "Installment",
    desc: "Big dreams, small payments - flexible installments for everything you need!",
    Icon: () => (
      <img src="/Media/H%20icon3.jpeg" alt="Installment Plans Icon - Buy Products on EMI in Pakistan" />
    ),
  },
  {
    id: 4,
    number: "04",
    title: "Insurance",
    desc: "Pakistan's most trusted platform for resolving insurance complaints.",
    Icon: () => (
      <img src="/Media/H%20icon-1.png" alt="Insurance Services Icon - Car, Life, Health and Property Insurance in Pakistan" />
    ),
  },
];

export default function FeatureCards({ items = features }) {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const itemRefs = useRef([]);

  useEffect(() => {
    const observers = itemRefs.current.map((el, index) => {
      if (!el) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleItems((prev) => new Set([...prev, index]));
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      observer.observe(el);
      return observer;
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.disconnect();
      });
    };
  }, []);

  return (
    <section className="section-padding-sm bg-white">
      <div className="container-content">
        <div className="responsive-grid-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`relative bg-white border border-gray-100 rounded-lg p-6 shadow-sm hover:shadow-2xl transform hover:-translate-y-2 transition ${
                visibleItems.has(index) ? 'animate-fade-in-up' : 'animate-on-scroll'
              }`}
              style={visibleItems.has(index) ? { animationDelay: `${index * 100}ms` } : {}}
            >
              {/* Top-right pink semicircle number badge */}
              <div
                className="absolute right-0 top-0 cursor-pointer overflow-hidden rounded-tr-lg"
                style={{ width: 96, height: 64 }}
              >
                <div
                  className="bg-pink-300 text-pink-900 font-bold text-lg flex items-center justify-center"
                  style={{
                    width: 96,
                    height: 96,
                    borderBottomLeftRadius: 96,
                    transform: "translate(18px, -32px)",
                  }}
                >
                  {item.number}
                </div>
              </div>

              {/* Content row */}
              <div className="flex items-start gap-4">
                {/* Icon circle */}
                <div className="flex-shrink-0">
                  <div className="size-16 rounded-full bg-gray-50 border flex items-center justify-center shadow-sm">
                    <item.Icon />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.desc} {item.id === 1 && <a href="/properties" className="text-red-600 hover:text-red-700 font-semibold">Explore properties →</a>}
                    {item.id === 2 && <a href="/loans" className="text-red-600 hover:text-red-700 font-semibold">Compare loans →</a>}
                    {item.id === 3 && <a href="/installments" className="text-red-600 hover:text-red-700 font-semibold">View installments →</a>}
                    {item.id === 4 && <a href="/insurance" className="text-red-600 hover:text-red-700 font-semibold">Insurance support →</a>}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
