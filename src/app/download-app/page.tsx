import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Download Madadgaar App",
  description:
    "Download the Madadgaar mobile app for property, loans, installments, and insurance on Android.",
  path: "/download-app",
});

import { PLAY_STORE_URL } from "../../constants/mobileApp";
import DownloadAppPage from "../../views/clients/DownloadAppPage";

const FAQ_ITEMS = [
  {
    q: "How do I download the Madadgaar app?",
    a: "Tap Download on Google Play on this page to install Madadgaar from the official Google Play Store on your Android device.",
  },
  {
    q: "Is the Madadgaar app free to download?",
    a: "Yes. The Madadgaar app is free to download and use for browsing listings, comparing plans, and submitting applications.",
  },
  {
    q: "What services are available in the Madadgaar mobile app?",
    a: "The app includes property listings, installment plans, loans, insurance, application tracking, and secure account management for users in Pakistan.",
  },
  {
    q: "Can I apply for property, loans, or installments from the app?",
    a: "Yes. You can view details and submit applications directly through the Madadgaar mobile app after signing in or creating an account.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MobileApplication",
      name: "Madadgaar",
      operatingSystem: "Android",
      applicationCategory: "BusinessApplication",
      offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
      description:
        "Madadgaar helps users explore property listings, installment plans, insurance support, and financing services in Pakistan.",
      downloadUrl: PLAY_STORE_URL,
      installUrl: PLAY_STORE_URL,
      url: "https://www.madadgaar.com.pk/download-app",
      publisher: {
        "@type": "Organization",
        name: "Madadgaar Expert Partner (SMC-Private) Limited",
        url: "https://www.madadgaar.com.pk",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        ratingCount: "1",
      },
    },
    {
      "@type": "WebPage",
      name: "Download Madadgaar App",
      description: "Download the official Madadgaar Android app from Google Play.",
      url: "https://www.madadgaar.com.pk/download-app",
      isPartOf: { "@type": "WebSite", name: "Madadgaar", url: "https://www.madadgaar.com.pk" },
    },
    faqSchema
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <DownloadAppPage />
    </>
  );
}
