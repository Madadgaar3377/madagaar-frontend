import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import PropertiesPage from "../../views/clients/Properties/properties";
import { backendBaseUrl } from "../../constants/apiUrl";
import { SITE_URL } from "../../lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Property Listings in Pakistan",
  description:
    "Browse verified property listings for sale and rent across Pakistan. Compare prices, locations, and amenities on Madadgaar.",
  path: "/properties",
});

  const extractPropertyData = (property: any) => {
    if (property.type === "Individual") {
      const individual = property.individualProperty || {};
      return {
        _id: property._id,
        type: "Individual",
        title: individual.title,
        description: individual.description,
        propertyType: individual.propertyType,
        propertyId: individual.propertyId,
        city: individual.city,
        location: individual.location,
        price: individual.transaction?.price || individual.transaction?.monthlyRent,
        transactionType: individual.transaction?.type,
        areaSize: individual.areaSize,
        areaUnit: individual.areaUnit,
        bedrooms: individual.bedrooms,
        bathrooms: individual.bathrooms,
        images: individual.images || [],
        amenities: individual.amenities,
        utilities: individual.utilities,
        contact: individual.contact,
        nearbyLandmarks: individual.nearbyLandmarks,
        furnishingStatus: individual.furnishingStatus,
        possessionStatus: individual.possessionStatus,
      };
    } else if (property.type === "Project") {
      const project = property.project || {};
      return {
        _id: property._id,
        type: "Project",
        title: project.projectName,
        description: project.description,
        propertyType: project.projectType,
        propertyId: project.propertyId,
        city: project.city,
        location: project.area || project.address,
        price: project.transaction?.priceRange || project.transaction?.price,
        transactionType: project.transaction?.type,
        areaSize: project.totalLandArea,
        areaUnit: project.landAreaUnit,
        totalUnits: project.totalUnits,
        images: project.images || [],
        amenities: project.amenities,
        utilities: project.utilities,
        contact: project.contact,
        nearbyLandmarks: project.nearbyLandmarks,
        projectStage: project.projectStage,
        developerBuilder: project.developerBuilder,
        highlights: project.highlights,
      };
    }
    return null;
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Real Estate Services",
    "name": "Madadgaar Property Solutions",
    "description": "Find, compare, and secure your perfect propertystress-free. Compare properties for sale, rent, and investment across Pakistan.",
    "url": `${SITE_URL}/properties`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Madadgaar Expert Partner",
      "url": SITE_URL
    },
    "areaServed": {
      "@type": "Country",
      "name": "Pakistan"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "PKR",
      "description": "Free property comparison and listing services"
    }
  };

export default async function Page() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  let properties = [];
  let fetchError = false;
  
  try {
    const res = await fetch(`${apiUrl}/getAllProperties`, { next: { revalidate: 300 } });
    const payload = await res.json();
    if (res.ok && payload?.success !== false) {
      const rawProperties = payload?.properties || payload?.data || [];
      properties = rawProperties.map(extractPropertyData).filter(Boolean);
    } else if (!res.ok) {
      fetchError = true;
    }
  } catch (err) {
    console.error("Fetch properties error (server):", err);
    fetchError = true;
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PropertiesPage properties={properties} fetchError={fetchError} />
    </>
  );
}
