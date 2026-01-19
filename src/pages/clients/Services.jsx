import React from "react";

const Services = () => {
  return (
    <div>
      <>
        <section className="w-full min-h-screen flex flex-col md:flex-row items-center justify-between container-safe section-padding">
          {/* Left Content */}

          <div className="md:w-1/2 space-y-3 sm:space-y-4 lg:space-y-6 w-full">
            <h2 className="text-responsive-lg font-semibold"  style={{color: "rgb(183, 36, 42)" }}>
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

            <button  style={{ backgroundColor: "rgb(183, 36, 42)" }} className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white font-medium hover:bg-blue-700 transition rounded-full">
              Let's Get Started
            </button>
          </div>

          {/* Right Image */}
          <div className="md:w-1/2 mt-6 sm:mt-8 md:mt-0 flex justify-center w-full">
            <img
              src="/Media/Support%20service.png"
              alt="Madadgaar Services"
              className="rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md"
            />
          </div>
        </section>
      </>
    </div>
  );
};

export default Services;
