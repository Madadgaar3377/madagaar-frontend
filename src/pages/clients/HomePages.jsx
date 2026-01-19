import React from "react";
import FeatureCards from "./Cards";
import Services from "./Services";
import SecondCards from "./SecondCards";
import MobileAppPage from "./MadadghaarAppPage";
import VideoPage from "./youtube/YoutubeVide";
import InfoBoxes from "./ChosewhyPAge";
import OurPartners from "./OverPartener";
import SEO from "../../components/SEO";
import TeamMemberCard from "../../components/TeamMemberCard";
import teamMembers from "../../constants/teamMembers";

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Madadgaar Expert Partner",
    "description": "Pakistan's trusted marketplace for property solutions, insurance support, loans, and flexible installment plans",
    "url": "https://madadgaar.com.pk",
    "logo": "https://madadgaar.com.pk/Media/Group%2033.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-307-111-333-0",
      "contactType": "Customer Service",
      "email": "help.madadgaar@gmail.com",
      "areaServed": "PK",
      "availableLanguage": ["English", "Urdu"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lahore",
      "addressRegion": "Punjab",
      "addressCountry": "Pakistan",
      "streetAddress": "Gulberg III"
    },
    "sameAs": [
      "https://madadgaar.com.pk"
    ],
    "founder": [
      {
        "@type": "Person",
        "name": "Raja Afzal",
        "jobTitle": "Founder & CEO"
      },
      {
        "@type": "Person",
        "name": "Saud Ch",
        "jobTitle": "Director & CEO"
      }
    ]
  };

  return (
    <>
      <SEO
        title="Madadgaar Expert Partner - Property, Insurance, Loans & Installment Plans in Pakistan"
        description="Pakistan's most trusted marketplace for property solutions, insurance support, loans, and flexible installment plans. Compare multiple options across Pakistan and find the perfect fit for your needs."
        keywords="madadgaar, property solutions pakistan, real estate pakistan, insurance pakistan, loans pakistan, installment plans, verified agents, property dealers, car insurance, life insurance, home loans"
        canonicalUrl="https://madadgaar.com.pk"
        structuredData={structuredData}
      />
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
      
      {/* Team Members Section */}
      <section className="w-full bg-gray-50 px-3 sm:px-6 md:px-12 lg:px-16 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Management Team
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg italic">
              Together as a team, we rise higher, push harder, and achieve the impossible.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>

      <MobileAppPage />
      <VideoPage />
      <OurPartners />
      
      {/* Strategy Section */}
      <section className="w-full bg-white px-3 sm:px-6 md:px-12 lg:px-16 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Strategy to Achieve Our Goals
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Strategic approaches that drive our success and ensure quality service delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Marketplace Optimization</h3>
              <p className="text-gray-700 text-sm">
                Continuously improve the platform for seamless comparison of property, insurance, loans, and installment options.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Partner Network Expansion</h3>
              <p className="text-gray-700 text-sm">
                Onboard and maintain strong relationships with top service providers to ensure quality and variety.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Customer-Centric Approach</h3>
              <p className="text-gray-700 text-sm">
                Offer expert guidance, transparent information, and responsive support to build trust and loyalty.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Digital Marketing & Outreach</h3>
              <p className="text-gray-700 text-sm">
                Leverage online channels, social media, and targeted campaigns to reach a wide audience.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Data-Driven Decisions</h3>
              <p className="text-gray-700 text-sm">
                Use analytics to understand user behavior, identify trends, and enhance service offerings.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Innovation & Technology</h3>
              <p className="text-gray-700 text-sm">
                Integrate advanced tools like mobile apps, AI recommendations, and smart comparison features.
              </p>
            </div>
          </div>
        </div>
      </section>

      <InfoBoxes />

      {/* Contact Section */}
      <section className="w-full bg-gray-50 px-3 sm:px-6 md:px-12 lg:px-16 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Connect With Us
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Get in touch with our team for any inquiries or support
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 sm:p-12 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                  🌐
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Website</h3>
                <a href="https://madadgaar.com.pk" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: "rgb(183, 36, 42)" }}>
                  madadgaar.com.pk
                </a>
              </div>

              <div>
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                  ✉️
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                <a href="mailto:help.madadgaar@gmail.com" className="text-sm hover:underline" style={{ color: "rgb(183, 36, 42)" }}>
                  help.madadgaar@gmail.com
                </a>
              </div>

              <div>
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                  📞
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
                <a href="tel:+923071113330" className="text-sm hover:underline" style={{ color: "rgb(183, 36, 42)" }}>
                  +92 307 111 333 0
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
