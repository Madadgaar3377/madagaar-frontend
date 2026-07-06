import Script from "next/script";
import "./globals.css";
import AppProviders from "./providers";
import { rootMetadataBase } from "../lib/metadata";
import { SITE_URL, DEFAULT_OG_IMAGE } from "../lib/site";

export const metadata = {
  ...rootMetadataBase(),
  keywords: [
    "madadgaar",
    "madadgaar pakistan",
    "property solutions pakistan",
    "real estate pakistan",
    "insurance pakistan",
    "loans pakistan",
    "installment plans pakistan",
  ],
  authors: [{ name: "Madadgaar Expert Partner" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Madadgaar Expert Partner - Property, Insurance, Loans & Installment Plans",
    description:
      "Pakistan's trusted marketplace for property, insurance, loans, and installment solutions.",
    siteName: "Madadgaar Expert Partner",
    locale: "en_PK",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Madadgaar Expert Partner - Property, Insurance, Loans & Installment Plans",
    description:
      "Pakistan's trusted marketplace for property, insurance, loans, and installment solutions",
    images: [DEFAULT_OG_IMAGE],
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
      </body>
    </html>
  );
}
