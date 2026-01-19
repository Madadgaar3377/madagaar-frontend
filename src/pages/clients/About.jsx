import React from "react";
import SEO from "../../components/SEO";
import TeamMemberCard from "../../components/TeamMemberCard";
import teamMembers from "../../constants/teamMembers";

/**
 * AboutPage.jsx
 * - Comprehensive company information
 * - Mission, Vision, Team Members, Goals, Strategy, and more
 * - Fully responsive layout
 */

export default function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Madadgaar Expert Partner",
    "description": "Learn about Madadgaar Expert Partner's mission, vision, team, and strategy for providing trusted property, insurance, loan, and installment solutions in Pakistan",
    "url": "https://madadgaar.com.pk/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "Madadgaar Expert Partner",
      "employee": [
        {
          "@type": "Person",
          "name": "Raja Afzal",
          "jobTitle": "Founder & CEO"
        },
        {
          "@type": "Person",
          "name": "Saud Ch",
          "jobTitle": "Director & CEO"
        },
        {
          "@type": "Person",
          "name": "Ayesha",
          "jobTitle": "Marketing & Operations"
        },
        {
          "@type": "Person",
          "name": "Abubaker",
          "jobTitle": "IT & Innovation"
        }
      ]
    }
  };

  return (
   <>
     <SEO
       title="About Us - Madadgaar Expert Partner | Our Mission, Vision & Team"
       description="Discover Madadgaar Expert Partner's journey to become Pakistan's most trusted marketplace. Learn about our mission, vision, management team, strategy, and commitment to simplifying property, insurance, loan, and installment solutions."
       keywords="about madadgaar, madadgaar team, mission vision, pakistan marketplace, trusted property solutions, Raja Afzal CEO, company profile pakistan"
       canonicalUrl="https://madadgaar.com.pk/about"
       structuredData={structuredData}
     />
   {/* About Company Section */}
   <section className="w-full min-h-screen flex flex-col md:flex-row items-center justify-between bg-gray-50 container-safe section-padding">
       <div className="md:w-1/2 mt-6 sm:mt-8 md:mt-0 flex justify-center w-full md:order-first">
          <img
            src="/Media/Aboutscreen/about-h4-1.png"
            alt="Madadgaar Services"
            loading="lazy"
            className="rounded-xl sm:rounded-2xl shadow-lg w-full max-w-sm sm:max-w-md object-cover"
          />
        </div>

        <div className="md:w-1/2 space-y-3 sm:space-y-4 lg:space-y-6 w-full">
          <button
            className="bg-white rounded-pill shadow-lg pt-2 pb-2 pr-3 pl-3 text-xs sm:text-sm rounded-xl"
             style={{ color: "rgb(183, 36, 42)" }}
          >
            About us
          </button>
          <h1 className="text-responsive-lg font-bold text-gray-900 leading-tight">
           Madadgaar Expert Partner
          </h1>
          <p className="text-gray-700 text-responsive-sm leading-relaxed">
           Madadgaar Expert Partner is a trusted marketplace where finding the right solution becomes simple. Whether it's property solutions, insurance support, loans, or installment plans, we make your journey simple, reliable, and stress-free. Our platform lets you compare multiple options across Pakistan to find the perfect fit. Together, let's make things easier and make them happen!
          </p>
         
          <button  style={{ backgroundColor: "rgb(183, 36, 42)" }} className="mt-4 sm:mt-6 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white rounded-full font-medium hover:bg-red-700 transition">
            Get Started
          </button>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="w-full bg-white section-padding">
        <div className="container-content">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-4">
              Our Mission & Vision
            </h2>
            <p className="text-gray-600 text-responsive-sm max-w-4xl mx-auto">
              We want to discuss how Madadgaar Expert Partner, as a trusted marketplace, simplifies access to property solutions, insurance support, loans, and installment plans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                  🎯
                </div>
                <h3 className="text-xl sm:text-2xl font-bold ml-4 text-gray-900">Mission</h3>
              </div>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                To simplify life by offering trusted property solutions, insurance support, loans, and flexible installment plans through a single, reliable platform — while partnering with service-providing companies and connecting them with verified local agents across Pakistan. Our goal is to ensure transparency, convenience, and peace of mind for individuals, businesses, and partners alike.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                  👁️
                </div>
                <h3 className="text-xl sm:text-2xl font-bold ml-4 text-gray-900">Vision</h3>
              </div>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                To become Pakistan's largest and most trusted marketplace for service and financial solutions, where partner companies, local agents, and users can seamlessly connect. By empowering partners to grow, agents to access verified opportunities, and users to find the best solutions, Madadgaar aims to drive sustainable growth for partner companies, boost agent networks, and contribute to Pakistan's economic development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Goals Section */}
      <section className="w-full bg-gray-50 px-3 sm:px-6 md:px-12 lg:px-16 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Goals
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto">
              To simplify and improve people's lives by offering a trusted marketplace where they can easily access the best options in property, insurance, loans, and installment plans—all with transparency, convenience, and expert guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-3xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                ⚡
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Simplify</h3>
              <p className="text-gray-600 text-sm">
                Easy access to property, insurance, loans, and installment solutions.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-3xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                🤝
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trust</h3>
              <p className="text-gray-600 text-sm">
                Transparent, reliable, and expert-guided options.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-3xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                📈
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Grow</h3>
              <p className="text-gray-600 text-sm">
                Empowering clients to achieve personal and business goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Market Size Section */}
      <section className="w-full bg-white px-3 sm:px-6 md:px-12 lg:px-16 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Market Size
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              We aim to reach a wide audience and capture a significant market share by providing convenient, transparent, and trusted services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
              <h3 className="text-lg font-semibold mb-2">PROPERTY</h3>
              <p className="text-3xl font-bold mb-2">$2.08T</p>
              <p className="text-sm opacity-90">in Pakistan</p>
              <p className="text-xs mt-2 opacity-80">Annual Growth Rate: 3.82%</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
              <h3 className="text-lg font-semibold mb-2">INSURANCE</h3>
              <p className="text-3xl font-bold mb-2">$2.27B</p>
              <p className="text-sm opacity-90">in Pakistan</p>
              <p className="text-xs mt-2 opacity-80">Annual Growth Rate: 14%</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
              <h3 className="text-lg font-semibold mb-2">INSTALLMENT</h3>
              <p className="text-3xl font-bold mb-2">$8.2B</p>
              <p className="text-sm opacity-90">in Pakistan</p>
              <p className="text-xs mt-2 opacity-80">Annual Growth Rate: 21%</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white">
              <h3 className="text-lg font-semibold mb-2">LOAN</h3>
              <p className="text-3xl font-bold mb-2">$51.85B</p>
              <p className="text-sm opacity-90">Outstanding</p>
              <p className="text-xs mt-2 opacity-80">As of January 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section id="team" className="w-full bg-gray-50 px-3 sm:px-6 md:px-12 lg:px-16 py-12 md:py-20">
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

      {/* Strategy Section */}
      <section className="w-full bg-white px-3 sm:px-6 md:px-12 lg:px-16 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Strategy to Achieve Our Goals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-3">📊 Marketplace Optimization</h3>
              <p className="text-gray-700 text-sm">
                Continuously improve the platform for seamless comparison of property, insurance, loans, and installment options.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-3">🤝 Partner Network Expansion</h3>
              <p className="text-gray-700 text-sm">
                Onboard and maintain strong relationships with top service providers to ensure quality and variety.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-3">👥 Customer-Centric Approach</h3>
              <p className="text-gray-700 text-sm">
                Offer expert guidance, transparent information, and responsive support to build trust and loyalty.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-3">📱 Digital Marketing & Outreach</h3>
              <p className="text-gray-700 text-sm">
                Leverage online channels, social media, and targeted campaigns to reach a wide audience.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-3">📈 Data-Driven Decisions</h3>
              <p className="text-gray-700 text-sm">
                Use analytics to understand user behavior, identify trends, and enhance service offerings.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Innovation & Technology</h3>
              <p className="text-gray-700 text-sm">
                Integrate advanced tools like mobile apps, AI recommendations, and smart comparison features.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-md md:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-3">🌱 Sustainable Growth</h3>
              <p className="text-gray-700 text-sm">
                Expand strategically across cities and services while maintaining high-quality standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Services Section */}
      <section className="w-full bg-gray-50 px-3 sm:px-6 md:px-12 lg:px-16 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Support Services
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                ℹ️
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Information</h3>
              <p className="text-gray-600 text-sm">
                Providing accurate and timely data to support informed decisions.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                🆘
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Help</h3>
              <p className="text-gray-600 text-sm">
                Offering immediate support to resolve technical issues and concerns.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                🤲
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Assistance</h3>
              <p className="text-gray-600 text-sm">
                Extending hands-on support to ensure smooth operations and user satisfaction.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                🧭
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Guidance</h3>
              <p className="text-gray-600 text-sm">
                Leading users with expert advice to navigate tools and systems effectively.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                💪
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Competence</h3>
              <p className="text-gray-600 text-sm">
                Demonstrating the skills and knowledge needed to deliver reliable IT solutions.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                ✅
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Solution</h3>
              <p className="text-gray-600 text-sm">
                Delivering effective fixes that address root causes, not just symptoms.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                🎯
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Direction</h3>
              <p className="text-gray-600 text-sm">
                Setting clear paths and priorities for users to follow in complex systems.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl mb-4" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                💡
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Advice</h3>
              <p className="text-gray-600 text-sm">
                Sharing insights and recommendations to improve performance and productivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full bg-white px-3 sm:px-6 md:px-12 lg:px-16 py-12 md:py-20">
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
                <a href="mailto:support@madadgaar.com.pk" className="text-sm hover:underline" style={{ color: "rgb(183, 36, 42)" }}>
                  support@madadgaar.com.pk
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
