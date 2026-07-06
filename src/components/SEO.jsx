"use client";

import JsonLd from "./JsonLd";
import { SITE_URL, DEFAULT_OG_IMAGE } from "../lib/site";

const defaultStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#localbusiness`,
      name: "Madadgaar Expert Partner",
      description:
        "Trusted marketplace for property, insurance, loans, and installment solutions in Pakistan",
      url: SITE_URL,
      logo: DEFAULT_OG_IMAGE,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+92-307-111-333-0",
        contactType: "Customer Service",
        email: "help.madadgaar@gmail.com",
        areaServed: "PK",
        availableLanguage: ["English", "Urdu"],
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lahore",
        addressRegion: "Punjab",
        addressCountry: "Pakistan",
        streetAddress: "Gulberg III",
      },
      sameAs: [
        "https://play.google.com/store/apps/details?id=com.madadgaarexpert.app",
      ],
      founder: [
        {
          "@type": "Person",
          name: "Raja Afzal",
          jobTitle: "Founder & CEO",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Madadgaar Expert Partner",
      publisher: { "@id": `${SITE_URL}/#localbusiness` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/properties?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

/**
 * JSON-LD structured data only — page title/description/canonical are set
 * server-side via Next.js generateMetadata() in each route segment.
 */
const SEO = ({ structuredData = null, faqSchema = null }) => (
  <>
    <JsonLd data={structuredData || defaultStructuredData} />
    {faqSchema ? <JsonLd data={faqSchema} /> : null}
  </>
);

export default SEO;
