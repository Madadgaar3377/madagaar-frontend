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
    <section className="w-full flex flex-col md:flex-row items-center justify-between container-safe section-padding">
      {/* Left Content */}
      <div
        ref={contentRef}
        className={`md:w-1/2 space-y-3 sm:space-y-4 lg:space-y-6 w-full ${
          isVisible ? 'animate-fade-in-left' : 'animate-on-scroll'
        }`}
      >
        <h2 className="text-responsive-lg font-semibold" style={{ color: "rgb(183, 36, 42)" }}>
          Our Free <br /> Support Services
        </h2>

        <p className="text-gray-700 text-responsive-sm leading-relaxed">
          Comprehensive assistance across various needs, Whether you're
          looking for property solution, resolving insurance issues, Looking
          for loan, or purchasing items on installments, our support is
          designed to make the process smooth and hassle-free. We provide
          tailored solutions to fit your specific requirements, ensuring you
          get the help you need at no cost. Our team is all about making
          things simple and hassle-free for you.
        </p>

        <button
          style={{ backgroundColor: "rgb(183, 36, 42)" }}
          className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white font-medium hover:bg-blue-700 transition rounded-full"
        >
          Let's Get Started
        </button>
      </div>

      {/* Right Image */}
      <div
        ref={imageRef}
        className={`md:w-1/2 mt-6 sm:mt-8 md:mt-0 flex justify-center w-full ${
          imageVisible ? 'animate-fade-in-right' : 'animate-on-scroll'
        }`}
        style={imageVisible ? { animationDelay: '200ms' } : {}}
      >
        <img
          src="/Media/Support%20service.png"
          alt="Madadgaar Services"
          className="rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md"
          loading="lazy"
        />
      </div>
    </section>
  );
};

export default Services;
