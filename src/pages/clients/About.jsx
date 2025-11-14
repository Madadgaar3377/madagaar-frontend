import React from "react";

/**
 * AboutPage.jsx
 * - Responsive layout
 * - Two images (replace paths with your own)
 * - Clear, accessible markup
 */

export default function AboutPage() {
  return (
   <>
   <section className="w-full min-h-screen flex flex-col md:flex-row items-center justify-between bg-gray-50 px-6 md:px-16 py-12">
       <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img
            src="/Media/Aboutscreen/about-h4-1.png"
            alt="Madadgaar Services"
            className="rounded-2xl shadow-lg w-full max-w-md object-cover"
          />
        </div>
        {/* Left Content */}

        <div className="md:w-1/2 space-y-6">
          <button
            className=" bg-white rounded-pill shadow-lg pt-2 pb-2 pr-3 pl-3  small rounded-xl  "
             style={{ color: "rgb(183, 36, 42)" }}
          >
            About us
          </button>
          <h1 className="text-xl md:text-xl font-bold text-gray-900 leading-tight">
           Who are we?
            
          </h1>
          <p className="text-gray-700 text-sm leading-relaxed">
           We're here to make your life easier with our awesome services. Whether you need property services, insurance services, loan services or want to participate in any govt Scheme, we're here to support you. Our team is all about making things simple and hassle-free for you. Let's make things happen together!
          </p>
         
          <button  style={{ backgroundColor: "rgb(183, 36, 42)" }} className="mt-6 px-3 py-3  text-white rounded-full font-medium hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>

        {/* Right Image */}
        
      </section>

      {/* {second box} */}
      <section className="w-full min-h-screen flex flex-col md:flex-row items-center justify-between bg-gray-50 px-6 md:px-16 py-12">
      
        {/* Left Content */}

        <div className="md:w-1/2 space-y-6">
          <button
            className=" bg-white rounded-pill shadow-lg pt-2 pb-2 pr-3 pl-3  small rounded-xl  "
             style={{ color: "rgb(183, 36, 42)" }}
          >
            Why choose us?
          </button>
          <h1 className="text-xl md:text-xl font-bold text-gray-900 leading-tight">
          We've Got You Covered Car Insurance Solutions
            
          </h1>
          <p className="text-gray-700 text-sm leading-relaxed">
          We're here to make your life easier with our awesome services. Whether you need property services, insurance services, loan services or want to participate in any govt Scheme, we're here to support you. Our team is all about making things simple and hassle-free for you. Let's make things happen together!
          </p>
         
          
        </div>

        {/* Right Image */}
         <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img
            src="/Media/Aboutscreen/about-h4-sm1.png"
            alt="Madadgaar Services"
            className="rounded-2xl shadow-lg w-full max-w-md object-cover"
          />
        </div>
      </section>
   </>
  );
}
