import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import AboutPage from "../../views/clients/About";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "About Madadgaar",
  description:
    "Learn about Madadgaar Expert Partner  Pakistan's trusted marketplace for property, loans, installments, and insurance.",
  path: "/about",
});

const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Madadgaar Expert Partner",
    "description": "Learn about Madadgaar Expert Partner's mission, vision, team, and strategy for providing trusted property, insurance, loan, and installment solutions in Pakistan",
    "url": "https://www.madadgaar.com.pk/about",
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


export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AboutPage />
    </>
  );
}
