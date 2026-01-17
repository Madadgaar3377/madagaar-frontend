import React from "react";
import FeatureCards from "./Cards";
import Services from "./Services";
import SecondCards from "./SecondCards";
import MobileAppPage from "./MadadghaarAppPage";
import VideoPage from "./youtube/YoutubeVide";
import InfoBoxes from "./ChosewhyPAge";
import OurPartners from "./OverPartener";

export default function HomePage() {
  return (
    <>
      <section className="w-full min-h-screen flex flex-col md:flex-row items-center justify-between bg-gray-50 px-3 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 md:py-12">
        {/* Left Content */}
        <div className="md:w-1/2 space-y-3 sm:space-y-4 lg:space-y-6 w-full">
          <h2
            className="bg-white rounded-pill shadow pt-2 pb-2 pr-3 pl-3 d-inline-block text-xs sm:text-sm rounded-xl"
             style={{ color: "rgb(183, 36, 42)" }}
          >
            Now you'll have no more worries!
          </h2>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            Welcome to{" "}
            <span  style={{ color: "rgb(183, 36, 42)" }}>Madadgaar Platform!</span>
          </h1>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed">
            We're here to make your life easier with our awesome services.
            Whether you need property solutions, insurance support, loans, or
            installment plans, we're dedicated to assisting you with care and
            commitment.
          </p>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed">
            On our platform, you can compare multiple options across Pakistan to
            find the best fit for your needs. Let's make things easier & happen
            together!
          </p>
          <button  style={{ backgroundColor: "rgb(183, 36, 42)" }} className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Explore Services
          </button>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 mt-6 sm:mt-8 md:mt-0 flex justify-center w-full">
          <img
            src="/Media/inshero.png"
            alt="Madadgaar Services"
            className="rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md object-cover"
            loading="lazy"
          />
        </div>
      </section>
      <FeatureCards />
      <Services />
      <SecondCards />
      <MobileAppPage />
      <VideoPage />
      <OurPartners />
      <InfoBoxes />

    </>
  );
}
