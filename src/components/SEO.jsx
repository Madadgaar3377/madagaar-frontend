import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for dynamic meta tags and structured data
 * @param {Object} props - SEO configuration
 */
const SEO = ({
  title = 'Madadgaar Expert Partner - Property, Insurance, Loans & Installment Plans in Pakistan',
  description = 'Madadgaar Expert Partner is Pakistan\'s trusted marketplace for property solutions, insurance support, loans, and flexible installment plans. Compare multiple options and find the best fit for your needs.',
  keywords = 'madadgaar, property solutions pakistan, insurance pakistan, loans pakistan, installment plans, real estate pakistan, car insurance, life insurance, home loans, business loans, verified agents',
  author = 'Madadgaar Expert Partner',
  canonicalUrl = 'https://madadgaar.com.pk',
  ogImage = 'https://madadgaar.com.pk/Media/Group%2033.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData = null,
  noIndex = false,
}) => {
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Madadgaar Expert Partner',
    description: 'Trusted marketplace for property, insurance, loans, and installment solutions in Pakistan',
    url: 'https://madadgaar.com.pk',
    logo: 'https://madadgaar.com.pk/Media/Group%2033.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-307-111-333-0',
      contactType: 'Customer Service',
      email: 'help.madadgaar@gmail.com',
      areaServed: 'PK',
      availableLanguage: ['English', 'Urdu']
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lahore',
      addressRegion: 'Punjab',
      addressCountry: 'Pakistan',
      streetAddress: 'Gulberg III'
    },
    sameAs: [
      'https://madadgaar.com.pk',
    ],
    founder: [
      {
        '@type': 'Person',
        name: 'Raja Afzal',
        jobTitle: 'Founder & CEO'
      }
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Language and Location */}
      <meta httpEquiv="content-language" content="en-PK" />
      <meta name="geo.region" content="PK" />
      <meta name="geo.placename" content="Pakistan" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Madadgaar Expert Partner" />
      <meta property="og:locale" content="en_PK" />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Additional SEO Tags */}
      <meta name="format-detection" content="telephone=yes" />
      <meta name="HandheldFriendly" content="true" />
      <meta name="MobileOptimized" content="width" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
