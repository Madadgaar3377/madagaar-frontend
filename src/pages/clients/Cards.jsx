import React from "react";

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
      <img src="/Media/H%20icon-2.png" alt="" />
    ),
  },
  {
    id: 2,
    number: "02",
    title: "Loan",
    desc: "Empower your ambitions with our seamless loan solutions.",
    Icon: () => (
      <img src="/Media/H%20icon-3.png" alt="" />
    ),
  },
  {
    id: 3,
    number: "03",
    title: "Installment",
    desc: "Big dreams, small payments - flexible installments for everything you need!",
    Icon: () => (
      <img src="/Media/H%20icon3.jpeg" alt="" />
    ),
  },
  {
    id: 4,
    number: "04",
    title: "Insurance",
    desc: "Pakistan's most trusted platform for resolving insurance complaints.",
    Icon: () => (
      <img src="/Media/H%20icon-1.png" alt="" />
    ),
  },
];

export default function FeatureCards({ items = features }) {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative bg-white border border-gray-100 rounded-lg p-6 shadow-sm hover:shadow-2xl transform hover:-translate-y-2 transition "
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
                  <div className="w-16 h-16 rounded-full bg-gray-50 border flex items-center justify-center shadow-sm">
                    <item.Icon />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.desc}
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
