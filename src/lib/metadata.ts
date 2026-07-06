import type { Metadata } from "next";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  DEFAULT_DESCRIPTION,
  absoluteUrl,
} from "./site";

type PageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
    openGraph: {
      type: ogType,
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      locale: "en_PK",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

export function rootMetadataBase(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} - Property, Insurance, Loans & Installment Plans in Pakistan`,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
  };
}
