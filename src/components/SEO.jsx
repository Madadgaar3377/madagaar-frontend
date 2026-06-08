"use client";

import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * SEO Component for dynamic meta tags and structured data
 * @param {Object} props - SEO configuration
 */
const SITE_ORIGIN = "https://madadgaar.com.pk";
const DEFAULT_OG_IMAGE = "https://madadgaar.com.pk/Media/Group%2033.png";

/** Ensure og:image is an absolute URL for social share previews; show default when no product image */
function toAbsoluteOgImage(url) {
  if (!url || typeof url !== "string") return DEFAULT_OG_IMAGE;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return SITE_ORIGIN + (url.startsWith("/") ? url : "/" + url);
}

/** Truncate description for meta/og (155–160 chars for best display in share cards) */
function truncateDescription(text, maxLen = 160) {
  if (!text || typeof text !== "string") return "";
  const stripped = text.replace(/\s+/g, " ").trim();
  return stripped.length <= maxLen ? stripped : stripped.slice(0, maxLen - 3) + "...";
}

const SEO = ({
  title = "Madadgaar Expert Partner | Property, Financing, Installments & Insurance Services",
  description = "Let's make things easier — and make them happen together. Whether you are looking for property, loans, installment plans, or insurance support, Madadgaar helps you compare multiple options across Pakistan to find what truly fits your needs.",
  keywords = "madadgaar, property solutions pakistan, insurance pakistan, loans pakistan, installment plans, real estate pakistan, car insurance, life insurance, home loans, business loans, verified agents, property pakistan, financing pakistan, EMI plans pakistan",
  author = "Madadgaar Expert Partner",
  canonicalUrl = "https://madadgaar.com.pk",
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  twitterCard = "summary_large_image",
  structuredData = null,
  faqSchema = null,
  noIndex = false,
}) => {
  const resolvedOgImage = toAbsoluteOgImage(ogImage);
  const resolvedDescription = truncateDescription(description, 160);
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Madadgaar Expert Partner",
    description:
      "Trusted marketplace for property, insurance, loans, and installment solutions in Pakistan",
    url: "https://madadgaar.com.pk",
    logo: "https://madadgaar.com.pk/Media/Group%2033.png",
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
      "https://madadgaar.com.pk",
      "https://play.google.com/store/apps/details?id=com.madadgaarexpert.app",
    ],
    founder: [
      {
        "@type": "Person",
        name: "Raja Afzal",
        jobTitle: "Founder & CEO",
      },
    ],
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={resolvedDescription || description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}
      <link rel="canonical" href={canonicalUrl} />

      <meta httpEquiv="content-language" content="en-PK" />
      <meta name="geo.region" content="PK" />
      <meta name="geo.placename" content="Pakistan" />

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={resolvedDescription || description} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Madadgaar Expert Partner" />
      <meta property="og:locale" content="en_PK" />

      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={resolvedDescription || description} />
      <meta property="twitter:image" content={resolvedOgImage} />

      <meta name="format-detection" content="telephone=yes" />
      <meta name="HandheldFriendly" content="true" />
      <meta name="MobileOptimized" content="width" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
      {!structuredData && (
        <script type="application/ld+json">{JSON.stringify(defaultStructuredData)}</script>
      )}

      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
