import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import FeatureCards from "./Cards";
import Services from "./Services";
import SecondCards from "./SecondCards";
// import MobileAppPage from "./MadadghaarAppPage"; // Commented out as per user preference
import VideoPage from "./youtube/YoutubeVide";
import InfoBoxes from "./ChosewhyPAge";
import OurPartners from "./OverPartener";
import SEO from "../../components/SEO";
import TeamMemberCard from "../../components/TeamMemberCard";
import teamMembers from "../../constants/teamMembers";
import { Toast, useToast } from "../../components/Toast";
import { backendBaseUrl } from "../../constants/apiUrl";
import AnimatedSection from "../../components/AnimatedSection";
import StaggerReveal from "../../components/StaggerReveal";
import DownloadAppSection from "../../components/DownloadAppSection";

const heroEase = [0.16, 1, 0.3, 1];

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: heroEase },
  },
};

const heroImage = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: heroEase, delay: 0.2 },
  },
};

const strategyCards = [
  {
    icon: "📊",
    title: "Marketplace Optimization",
    desc: "Continuously improve the platform for seamless comparison of property, insurance, loans, and installment options.",
  },
  {
    icon: "🤝",
    title: "Partner Network Expansion",
    desc: "Onboard and maintain strong relationships with top service providers to ensure quality and variety.",
  },
  {
    icon: "👥",
    title: "Customer-Centric Approach",
    desc: "Offer expert guidance, transparent information, and responsive support to build trust and loyalty.",
  },
  {
    icon: "📱",
    title: "Digital Marketing & Outreach",
    desc: "Leverage online channels, social media, and targeted campaigns to reach a wide audience.",
  },
  {
    icon: "📈",
    title: "Data-Driven Decisions",
    desc: "Use analytics to understand user behavior, identify trends, and enhance service offerings.",
  },
  {
    icon: "💡",
    title: "Innovation & Technology",
    desc: "Integrate advanced tools like mobile apps, AI recommendations, and smart comparison features.",
  },
];

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  const motionInitial = reduceMotion ? false : "hidden";
  const motionAnimate = reduceMotion ? false : "visible";
  const [loading, setLoading] = useState(false);
  const { toasts, success: showSuccess, error: showError, removeToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    body: '',
  });

  const updateFormField = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.body) {
      showError('Please fill in all required fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendBaseUrl}/submitContactForm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          subject: formData.subject.trim(),
          body: formData.body.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit contact form');
      }

      showSuccess(data.message || 'Contact form submitted successfully. We will get back to you soon!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        body: '',
      });

    } catch (err) {
      console.error('Contact form submit error:', err);
      showError(err.message || 'Failed to submit contact form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://madadgaar.com.pk",
    "name": "Madadgaar Expert Partner",
    "description": "Pakistan's trusted marketplace for property solutions, insurance support, loans, and flexible installment plans. Compare multiple options across Pakistan to find what truly fits your needs.",
    "url": "https://madadgaar.com.pk",
    "logo": "https://madadgaar.com.pk/Media/Group%2033.png",
    "image": "https://madadgaar.com.pk/Media/Group%2033.png",
    "telephone": "+92-307-111-333-0",
    "email": "help.madadgaar@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gulberg III",
      "addressLocality": "Lahore",
      "addressRegion": "Punjab",
      "postalCode": "",
      "addressCountry": "PK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "31.5204",
      "longitude": "74.3587"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    "priceRange": "Free",
    "areaServed": {
      "@type": "Country",
      "name": "Pakistan"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Madadgaar Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Property Solutions",
            "description": "Buy, sell, and rent properties across Pakistan"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Loan & Financing",
            "description": "Compare and apply for loans from verified providers"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Installment Plans",
            "description": "Buy products on flexible installment plans"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Insurance Support",
            "description": "Compare insurance plans and get claim support"
          }
        }
      ]
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-307-111-333-0",
      "contactType": "Customer Service",
      "email": "help.madadgaar@gmail.com",
      "areaServed": "PK",
      "availableLanguage": ["English", "Urdu"]
    },
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
      <Toast toasts={toasts} onClose={removeToast} />
      <SEO
        title="Madadgaar Expert Partner | Property, Financing, Installments & Insurance Services"
        description="Let's make things easier — and make them happen together. Whether you are looking for property, loans, installment plans, or insurance support, Madadgaar helps you compare multiple options across Pakistan to find what truly fits your needs."
        keywords="madadgaar, property solutions pakistan, real estate pakistan, insurance pakistan, loans pakistan, installment plans, verified agents, property dealers, car insurance, life insurance, home loans, financing pakistan, EMI plans, property buy rent pakistan, download madadgaar app, madadgaar mobile app"
        canonicalUrl="https://madadgaar.com.pk"
        structuredData={structuredData}
      />
      <section className="w-full bg-gray-50 section-padding overflow-hidden">
        <div className="container-content page-hero">
          <motion.div
            className="page-hero-col space-y-3 sm:space-y-4 lg:space-y-6"
            variants={heroContainer}
            initial={motionInitial}
            animate={motionAnimate}
          >
            <motion.h2
              variants={heroItem}
              className="bg-white rounded-pill shadow pt-2 pb-2 pr-3 pl-3 d-inline-block text-xs sm:text-sm rounded-xl"
              style={{ color: "rgb(183, 36, 42)" }}
            >
              Now you'll have no more worries!
            </motion.h2>
            <motion.h1
              variants={heroItem}
              className="text-responsive-xl font-bold text-gray-900 leading-tight"
            >
              Madadgaar Expert Partner  Property, Financing, Installments & Insurance Services
            </motion.h1>
            <motion.p variants={heroItem} className="text-gray-700 text-responsive-sm leading-relaxed">
              We're here to make your life easier with our awesome services.
              Whether you need property solutions, insurance support, loans, or
              installment plans, we're dedicated to assisting you with care and
              commitment.
            </motion.p>
            <motion.p variants={heroItem} className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed">
              On our platform, you can compare multiple options across Pakistan to
              find the best fit for your needs. Explore <a href="/properties" className="text-red-600 hover:text-red-700 font-semibold text-link-hover">property solutions</a>, <a href="/loans" className="text-red-600 hover:text-red-700 font-semibold text-link-hover">loan options</a>, <a href="/installments" className="text-red-600 hover:text-red-700 font-semibold text-link-hover">installment plans</a>, and <a href="/insurance" className="text-red-600 hover:text-red-700 font-semibold text-link-hover">insurance support</a> all in one place. Let's make things easier & happen together!
            </motion.p>
            <motion.div variants={heroItem} className="flex flex-wrap gap-3 mt-4 sm:mt-6">
              <a href="/properties" style={{ backgroundColor: "rgb(183, 36, 42)" }} className="btn-smooth px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white rounded-lg font-medium hover:bg-red-700">
                Explore Properties
              </a>
              <a href="/loans" style={{ backgroundColor: "rgb(183, 36, 42)" }} className="btn-smooth px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white rounded-lg font-medium hover:bg-red-700">
                Compare Loans
              </a>
              <a href="/installments" style={{ backgroundColor: "rgb(183, 36, 42)" }} className="btn-smooth px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white rounded-lg font-medium hover:bg-red-700">
                View Installments
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            className="page-hero-col flex justify-center"
            variants={heroImage}
            initial={motionInitial}
            animate={motionAnimate}
          >
            <img
              src="/Media/inshero.png"
              alt="Madadgaar Expert Partner - Property, Financing, Installments & Insurance Services in Pakistan"
              className="rounded-xl sm:rounded-2xl page-media interactive-image float-gentle"
              loading="eager"
              fetchPriority="high"
            />
          </motion.div>
        </div>
      </section>
      {/* <OfferBanner /> */}
      <AnimatedSection animation="fadeInUp" delay={0}>
        <FeatureCards />
      </AnimatedSection>
      <AnimatedSection animation="fadeInUp" delay={60}>
        <Services />
      </AnimatedSection>
      <AnimatedSection animation="fadeInUp" delay={80}>
        <SecondCards />
      </AnimatedSection>

      {/* Team Members Section */}
      <AnimatedSection animation="fadeInUp" delay={0} className="w-full">
      <section className="w-full bg-gray-50 section-padding">
        <div className="container-content">
          <StaggerReveal animation="fadeInUp" className="text-center mb-8 sm:mb-12">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-4">
              Our Management Team
            </h2>
            <p className="text-gray-600 text-responsive-sm italic">
              Together as a team, we rise higher, push harder, and achieve the impossible.
            </p>
          </StaggerReveal>

          <div className="responsive-grid-3 grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, index) => (
              <StaggerReveal key={member.id} index={index} staggerMs={90} animation="fadeInUp">
                <TeamMemberCard member={member} />
              </StaggerReveal>
            ))}
          </div>
        </div>
      </section>
      </AnimatedSection>

      {/* <MobileAppPage /> */}
      <AnimatedSection animation="scaleIn" delay={0}>
        <VideoPage />
      </AnimatedSection>
      <AnimatedSection animation="fadeIn" delay={60}>
        <OurPartners />
      </AnimatedSection>

      {/* Strategy Section */}
      <AnimatedSection animation="fadeInUp" delay={0} className="w-full">
      <section className="w-full bg-white section-padding">
        <div className="container-content">
          <StaggerReveal animation="fadeInUp" className="text-center mb-8 sm:mb-12">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-4">
              Our Strategy to Achieve Our Goals
            </h2>
            <p className="text-gray-600 text-responsive-sm">
              Strategic approaches that drive our success and ensure quality service delivery
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a href="/properties" className="text-red-600 hover:text-red-700 font-semibold text-responsive-sm transition-colors duration-200">Compare Properties →</a>
              <a href="/loans" className="text-red-600 hover:text-red-700 font-semibold text-responsive-sm transition-colors duration-200">Explore Loans →</a>
              <a href="/installments" className="text-red-600 hover:text-red-700 font-semibold text-responsive-sm transition-colors duration-200">View Installments →</a>
              <a href="/insurance" className="text-red-600 hover:text-red-700 font-semibold text-responsive-sm transition-colors duration-200">Insurance Support →</a>
            </div>
          </StaggerReveal>

          <div className="responsive-grid-3">
            {strategyCards.map((card, index) => (
              <StaggerReveal key={card.title} index={index} staggerMs={70} animation="fadeInUp">
                <div className="bg-gray-50 rounded-xl p-6 shadow-md interactive-card card-hover-lift h-full group">
                  <div className="text-4xl mb-4 hover-icon-pop">{card.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{card.title}</h3>
                  <p className="text-gray-700 text-sm">{card.desc}</p>
                </div>
              </StaggerReveal>
            ))}
          </div>
        </div>
      </section>
      </AnimatedSection>

      <DownloadAppSection delay={100} />

      {/* Contact Section */}
      <AnimatedSection animation="fadeInUp" delay={80} className="w-full">
      <section className="w-full bg-gradient-to-br from-gray-50 via-red-50 to-gray-50 section-padding">
        <div className="container-content">
          <StaggerReveal animation="fadeInUp" className="text-center mb-8 sm:mb-12">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-4">
              Connect With Us
            </h2>
            <p className="text-gray-600 text-responsive-sm max-w-2xl mx-auto">
              Have a question or need assistance? Get in touch with our team for any inquiries or support. We're here to help!
            </p>
          </StaggerReveal>

          <div className="responsive-grid-2 gap-6 lg:gap-8">
            <StaggerReveal index={0} staggerMs={100} animation="fadeInLeft">
            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg h-full interactive-card">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4 group rounded-lg p-2 -m-2 transition-colors duration-300 hover:bg-red-50/50">
                  <div className="flex-shrink-0 size-12 rounded-lg flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600 text-sm">
                      Gulberg III, Lahore,<br />
                      Pakistan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group rounded-lg p-2 -m-2 transition-colors duration-300 hover:bg-red-50/50">
                  <div className="flex-shrink-0 size-12 rounded-lg flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <a href="tel:+923071113330" className="text-sm hover:underline" style={{ color: "rgb(183, 36, 42)" }}>
                      +92 307 111 333 0
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group rounded-lg p-2 -m-2 transition-colors duration-300 hover:bg-red-50/50">
                  <div className="flex-shrink-0 size-12 rounded-lg flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105" style={{ backgroundColor: "rgb(183, 36, 42)" }}>
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <a href="mailto:support@madadgaar.com.pk" className="text-sm hover:underline break-all" style={{ color: "rgb(183, 36, 42)" }}>
                      support@madadgaar.com.pk
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 group rounded-lg p-2 -m-2 transition-colors duration-300 hover:bg-green-50/50">
                  <div className="flex-shrink-0 size-12 rounded-lg flex items-center justify-center bg-green-500 transition-transform duration-300 group-hover:scale-105">
                    <svg className="size-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">WhatsApp</h4>
                    <a href="https://wa.me/923071113330" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline text-green-600">
                      +92 307 111 333 0
                    </a>
                  </div>
                </div>
              </div>
            </div>
            </StaggerReveal>

            <StaggerReveal index={1} staggerMs={100} animation="fadeInRight">
            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg h-full interactive-card">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={updateFormField}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent input-smooth"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={updateFormField}
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent input-smooth"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={updateFormField}
                    required
                    placeholder="What is your inquiry about?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent input-smooth"
                  />
                </div>

                <div>
                  <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    value={formData.body}
                    onChange={updateFormField}
                    required
                    rows="4"
                    placeholder="Please provide details about your inquiry..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent input-smooth resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 btn-smooth font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full size-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Message
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  We typically respond within 24-48 hours
                </p>
              </form>
            </div>
            </StaggerReveal>
          </div>
        </div>
      </section>
      </AnimatedSection>
      <AnimatedSection animation="fadeInUp" delay={0}>
        <InfoBoxes />
      </AnimatedSection>

    </>
  );
}
