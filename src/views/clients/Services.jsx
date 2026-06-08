import React, { useEffect, useRef, useState } from "react";

const Services = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const contentRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const contentObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (contentRef.current) contentObserver.observe(contentRef.current);
    if (imageRef.current) imageObserver.observe(imageRef.current);

    return () => {
      contentObserver.disconnect();
      imageObserver.disconnect();
    };
  }, []);

  return (
    <section className="w-full bg-white section-padding">
      <div className="container-content page-hero">
      {/* Left Content */}
      <div
        ref={contentRef}
        className={`page-hero-col space-y-3 sm:space-y-4 lg:space-y-6 ${
          isVisible ? 'animate-fade-in-left' : 'animate-on-scroll'
        }`}
      >
        <h2 className="text-responsive-lg font-semibold" style={{ color: "rgb(183, 36, 42)" }}>
          Our Free <br /> Support Services
        </h2>

        <p className="text-gray-700 text-responsive-sm leading-relaxed">
          Comprehensive assistance across various needs, Whether you're
          looking for <a href="/properties" className="text-red-600 hover:text-red-700 font-semibold text-link-hover">property solution</a>, resolving <a href="/insurance" className="text-red-600 hover:text-red-700 font-semibold text-link-hover">insurance issues</a>, Looking
          for <a href="/loans" className="text-red-600 hover:text-red-700 font-semibold text-link-hover">loan</a>, or purchasing items on <a href="/installments" className="text-red-600 hover:text-red-700 font-semibold text-link-hover">installments</a>, our support is
          designed to make the process smooth and hassle-free. We provide
          tailored solutions to fit your specific requirements, ensuring you
          get the help you need at no cost. Our team is all about making
          things simple and hassle-free for you.
        </p>

        <button type="button"
          style={{ backgroundColor: "rgb(183, 36, 42)" }}
          className="btn-smooth mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white font-medium hover:bg-blue-700 rounded-full"
        >
          Let's Get Started
        </button>
      </div>

      {/* Right Image */}
      <div
        ref={imageRef}
        className={`page-hero-col flex justify-center ${
          imageVisible ? 'animate-fade-in-right' : 'animate-on-scroll'
        }`}
        style={imageVisible ? { animationDelay: '200ms' } : {}}
      >
        <img
            src="/Media/Support%20service.png"
            alt="Madadgaar Free Support Services - Property, Insurance, Loans and Installment Solutions in Pakistan"
          className="rounded-xl sm:rounded-2xl page-media interactive-image"
          loading="lazy"
        />
      </div>
      </div>
    </section>
  );
};

export default Services;
