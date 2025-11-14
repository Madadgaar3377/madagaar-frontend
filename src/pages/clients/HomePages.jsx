import React from "react";
import FeatureCards from "./Cards";
import Services from "./Services";
import SecondCards from "./SecondCards";
import MobileAppPage from "./MadadghaarAppPage";
import VideoPage from "./youtube/YoutubeVide";
import InfoBoxes from "./ChosewhyPAge";

export default function HomePage() {
  return (
    <>
      <section className="w-full min-h-screen flex flex-col md:flex-row items-center justify-between bg-gray-50 px-6 md:px-16 py-12">
        {/* Left Content */}
        <div className="md:w-1/2 space-y-6">
          <h2
            className=" bg-white rounded-pill shadow pt-2 pb-2 pr-3 pl-3 d-inline-block small rounded-xl  "
             style={{ color: "rgb(183, 36, 42)" }}
          >
            Now you'll have no more worries!
          </h2>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            Welcome to{" "}
            <span  style={{ color: "rgb(183, 36, 42)" }}>Madadgaar Platform!</span>
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            We're here to make your life easier with our awesome services.
            Whether you need property solutions, insurance support, loans, or
            installment plans, we’re dedicated to assisting you with care and
            commitment.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            On our platform, you can compare multiple options across Pakistan to
            find the best fit for your needs. Let's make things easier & happen
            together!
          </p>
          <button  style={{ backgroundColor: "rgb(183, 36, 42)" }} className="mt-6 px-6 py-3  text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Explore Services
          </button>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img
            src="/Media/inshero.png"
            alt="Madadgaar Services"
            className="rounded-2xl shadow-lg w-full max-w-md object-cover"
          />
        </div>
      </section>
      <FeatureCards />
      <Services />
      <SecondCards />
      <MobileAppPage />
      <VideoPage />
      <InfoBoxes />
    </>
  );
}
