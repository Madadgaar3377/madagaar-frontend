import Script from "next/script";
import "./globals.css";
import AppProviders from "./providers";

const siteUrl = "https://madadgaar.com.pk";
const defaultTitle =
  "Madadgaar Expert Partner - Property, Insurance, Loans & Installment Plans in Pakistan";
const defaultDescription =
  "Pakistan's most trusted marketplace for property solutions, insurance support, loans, and flexible installment plans. Compare multiple options across Pakistan and find the perfect fit for your needs.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Madadgaar Expert Partner",
  },
  description: defaultDescription,
  keywords: [
    "madadgaar",
    "madadgaar pakistan",
    "property solutions pakistan",
    "real estate pakistan",
    "insurance pakistan",
    "car insurance",
    "life insurance",
    "home insurance",
    "loans pakistan",
    "home loans",
    "business loans",
    "installment plans pakistan",
    "verified agents pakistan",
    "property dealers",
    "insurance claims",
    "loan services",
  ],
  authors: [{ name: "Madadgaar Expert Partner" }],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Madadgaar Expert Partner - Property, Insurance, Loans & Installment Plans",
    description:
      "Pakistan's trusted marketplace for property, insurance, loans, and installment solutions. Compare options and find the perfect fit.",
    siteName: "Madadgaar Expert Partner",
    locale: "en_PK",
    images: [
      {
        url: `${siteUrl}/Media/Group%2033.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Madadgaar Expert Partner - Property, Insurance, Loans & Installment Plans",
    description:
      "Pakistan's trusted marketplace for property, insurance, loans, and installment solutions",
    images: [`${siteUrl}/Media/Group%2033.png`],
  },
  other: {
    "google-adsense-account": "ca-pub-6076284388585235",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/Media/Group%2033.png" },
      { url: "/favcions/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favcions/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favcions/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Madadgaar",
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport = {
  themeColor: "#B7242A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PK">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <AppProviders>{children}</AppProviders>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-D1B1F0YFCD"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-D1B1F0YFCD');
          `}
        </Script>
        <Script
          id="adsense"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6076284388585235"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Script id="apitestlab-config" strategy="lazyOnload">
          {`
            window.aptest = {
              trackingId: 'aptest-cf6ff4e65632df8ab92d',
              endpoint: 'https://api.apitestlab.org/api/analytics',
              debug: false
            };
          `}
        </Script>
        <Script
          src="https://www.apitestlab.org/tracking-script.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
