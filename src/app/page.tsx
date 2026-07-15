import type { Metadata } from "next";
import { buildPageMetadata } from "../lib/metadata";
import HomePage from "../views/clients/HomePages";

export const metadata: Metadata = buildPageMetadata({
  title: "Madadgaar Expert Partner - Property, Insurance, Loans & Installment Plans in Pakistan",
  description:
    "Pakistan's most trusted marketplace for property solutions, insurance support, loans, and flexible installment plans. Compare options across Pakistan.",
  path: "/",
});

const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://www.madadgaar.com.pk/#localbusiness",
        "name": "Madadgaar Expert Partner",
        "description": "Pakistan's trusted marketplace for property solutions, insurance support, loans, and flexible installment plans. Compare multiple options across Pakistan to find what truly fits your needs.",
        "url": "https://www.madadgaar.com.pk",
        "logo": "https://www.madadgaar.com.pk/Media/Group%2033.png",
        "image": "https://www.madadgaar.com.pk/Media/Group%2033.png",
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
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.madadgaar.com.pk/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What services does Madadgaar provide?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Madadgaar Expert Partner provides property solutions, loan financing, flexible installment plans for products, and comprehensive insurance support across Pakistan."
            }
          },
          {
            "@type": "Question",
            "name": "How can I apply for an installment plan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can browse our installment plans in the 'Installments' section, select your desired product and vendor, review the payment plan details, and apply directly through the Madadgaar platform."
            }
          },
          {
            "@type": "Question",
            "name": "Is Madadgaar available all over Pakistan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Madadgaar connects users with verified partners offering services across major cities in Pakistan."
            }
          }
        ]
      }
    ]
  };


export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomePage />
    </>
  );
}
