import React, { useEffect, useRef, useState } from "react";

const boxData = [
  {
    img: "/Media/Agent-1.png",
    title: "Team of Industry Experts",
    description:
      "Our experienced professionals bring deep knowledge and dedication to every interaction. From property solutions to insurance, loans, and installments, our experts work closely with you to understand your unique needs and provide tailored solutions that fit perfectly.",
    icon: "👥",
  },
  {
    img: "/Media/Agent-2.png",
    title: "No Upfront Charges",
    description:
      "We believe in building trust through transparency. That's why we don't require any upfront payments for our services. You only pay when real value is delivered, ensuring complete peace of mind and a risk-free experience from day one.",
    icon: "💰",
  },
  {
    img: "/Media/Agent-3.png",
    title: "Customer-First Approach",
    description:
      "Your satisfaction is our top priority. We take time to understand your individual needs, ensuring every solutionwhether it's finding the right property, securing insurance, getting a loan, or choosing an installment planis tailored to your goals and delivered with care.",
    icon: "❤️",
  },
];

export default function InfoBoxes() {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const benefitsRef = useRef(null);

  useEffect(() => {
    // Header animation
    const headerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-down');
            entry.target.classList.remove('animate-on-scroll');
          }
        });
      },
      { threshold: 0.2 }
    );
    if (headerRef.current) headerObserver.observe(headerRef.current);

    // Cards animation
    const cardObservers = cardsRef.current.map((el, index) => {
      if (!el) return null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleItems((prev) => new Set([...prev, index]));
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
      return observer;
    });

    // Benefits animation
    const benefitsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('animate-on-scroll');
          }
        });
      },
      { threshold: 0.1 }
    );
    if (benefitsRef.current) benefitsObserver.observe(benefitsRef.current);

    return () => {
      headerObserver.disconnect();
      cardObservers.forEach((obs) => obs && obs.disconnect());
      benefitsObserver.disconnect();
    };
  }, []);

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 section-padding">
      <div className="container-content">
        {/* Header Section */}
        <div
          ref={headerRef}
          className="text-center mb-10 sm:mb-12 lg:mb-16 animate-on-scroll"
        >
          <div className="inline-block mb-4">
            <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wide">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-responsive-2xl font-bold text-gray-900 mb-4">
            Why <span style={{ color: "rgb(183, 36, 42)" }}>Madadgaar</span>?
          </h2>
          <p className="text-gray-600 text-responsive-base max-w-3xl mx-auto leading-relaxed">
            We're Pakistan's most trusted marketplace for property solutions, insurance support, loans, and flexible installment plans. Here's what makes us different and why thousands of customers trust us with their needs.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {boxData.map((box, index) => (
            <div
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              className={`bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 flex flex-col interactive-card card-hover-lift group ${
                visibleItems.has(index) ? 'animate-scale-in' : 'animate-on-scroll'
              }`}
              style={visibleItems.has(index) ? { animationDelay: `${index * 150}ms` } : {}}
            >
              {/* Image Container */}
              <div className="relative mb-6 flex justify-center">
                <div className="relative w-full max-w-[200px] h-40 sm:h-48">
                  <img
                    src={box.img}
                    alt={`${box.title} - ${box.description.substring(0, 50)}...`}
                    className="w-full h-full rounded-xl object-contain interactive-image"
                    loading="lazy"
                  />
                  {/* Icon Badge */}
                  <div className="absolute -top-3 -right-3 bg-red-600 text-white size-12 rounded-full flex items-center justify-center text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110">
                    {box.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">
                  {box.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-center flex-1">
                  {box.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Benefits Section */}
        <div
          ref={benefitsRef}
          className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-on-scroll"
        >
          <div className="text-center p-4 bg-white rounded-lg border border-gray-100 interactive-card group">
            <div className="text-3xl mb-2 hover-icon-pop">🏆</div>
            <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Verified Partners</h4>
            <p className="text-xs sm:text-sm text-gray-600">Trusted service providers across Pakistan</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-100 interactive-card group">
            <div className="text-3xl mb-2 hover-icon-pop">⚡</div>
            <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Quick Response</h4>
            <p className="text-xs sm:text-sm text-gray-600">Fast and efficient service delivery</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-100 interactive-card group">
            <div className="text-3xl mb-2 hover-icon-pop">🔒</div>
            <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Secure & Safe</h4>
            <p className="text-xs sm:text-sm text-gray-600">Your data and privacy protected</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-100 interactive-card group">
            <div className="text-3xl mb-2 hover-icon-pop">📱</div>
            <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Easy Access</h4>
            <p className="text-xs sm:text-sm text-gray-600">Compare options anytime, anywhere</p>
          </div>
        </div>
      </div>
    </section>
  );
}
