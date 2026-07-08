import type { Metadata } from "next";
import { buildPageMetadata } from "../../../lib/metadata";
import { sanitizePublicDescription, stripHtml } from "../../../lib/description";
import PropertyDetails from "../../../views/clients/Properties/PropertyDetails";
import { SITE_URL } from "../../../lib/site";
import { notFound } from "next/navigation";
import { backendBaseUrl } from "../../../constants/apiUrl";

type Props = { params: Promise<{ id: string }> };

function extractPropertyData(property: any) {
    if (property.type === "Individual") {
        const individual = property.individualProperty || {};
        return {
            _id: property._id,
            type: "Individual",
            title: individual.title,
            description: sanitizePublicDescription(individual.description),
            propertyType: individual.propertyType,
            propertyId: individual.propertyId,
            city: individual.city,
            location: individual.location,
            price: individual.transaction?.price || individual.transaction?.monthlyRent,
            transactionType: individual.transaction?.type,
            transaction: individual.transaction,
            areaSize: individual.areaSize,
            areaUnit: individual.areaUnit,
            bedrooms: individual.bedrooms,
            bathrooms: individual.bathrooms,
            kitchenType: individual.kitchenType,
            furnishingStatus: individual.furnishingStatus,
            floor: individual.floor,
            totalFloors: individual.totalFloors,
            possessionStatus: individual.possessionStatus,
            zoningType: individual.zoningType,
            images: individual.images || [],
            video: individual.video,
            documents: individual.documents || [],
            amenities: individual.amenities,
            utilities: individual.utilities,
            contact: individual.contact,
            nearbyLandmarks: individual.nearbyLandmarks,
        };
    }
    if (property.type === "Project") {
        const project = property.project || {};
        return {
            _id: property._id,
            type: "Project",
            title: project.projectName,
            description: sanitizePublicDescription(project.description),
            propertyType: project.projectType,
            propertyId: project.propertyId,
            city: project.city,
            location: project.area || project.address,
            address: project.address,
            price: project.transaction?.priceRange || project.transaction?.price,
            transactionType: project.transaction?.type,
            transaction: project.transaction,
            areaSize: project.totalLandArea,
            areaUnit: project.landAreaUnit,
            totalUnits: project.totalUnits,
            units: project.units || [],
            images: project.images || [],
            video: project.video,
            documents: project.documents || [],
            amenities: project.amenities,
            utilities: project.utilities,
            contact: project.contact,
            nearbyLandmarks: project.nearbyLandmarks,
            projectStage: project.projectStage,
            infrastructureStatus: project.infrastructureStatus,
            developerBuilder: project.developerBuilder,
            highlights: project.highlights || [],
            expectedCompletionDate: project.expectedCompletionDate,
            possessionDate: project.possessionDate,
        };
    }
    return null;
}

export async function generateStaticParams() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  try {
    const res = await fetch(`${apiUrl}/getAllProperties`, { 
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" }
    });
    const payload = await res.json();
    const properties = payload?.properties || [];
    return (properties as { _id?: string }[])
      .filter((p) => p._id)
      .map((p) => ({ id: p._id! }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  let properties = [];
  
  try {
    const res = await fetch(`${apiUrl}/getAllProperties`, { 
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" }
    });
    const payload = await res.json();
    if (res.ok && payload?.properties) {
      properties = payload.properties;
    }
  } catch {}

  const property = (properties as { _id?: string }[]).find((p) => p._id === id) as any;

  if (!property) {
    return buildPageMetadata({
      title: "Property Not Found",
      description: "This property listing could not be found on Madadgaar.",
      path: `/property/${id}`,
      noIndex: true,
    });
  }

  const extracted = extractPropertyData(property);
  if (!extracted) {
    return buildPageMetadata({
      title: "Property Not Found",
      description: "This property listing could not be found on Madadgaar.",
      path: `/property/${id}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `${extracted.title} | Madadgaar Properties`,
    description: stripHtml(extracted.description, 155),
    path: `/property/${id}`,
    ogImage: extracted.images?.[0],
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  let properties = [];
  let fetchError = false;

  try {
    const res = await fetch(`${apiUrl}/getAllProperties`, { 
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" }
    });
    const payload = await res.json();
    if (res.ok && payload?.success !== false) {
      properties = payload?.properties || [];
    } else {
      fetchError = true;
    }
  } catch (err) {
    console.error("Fetch property details error (server):", err);
    fetchError = true;
  }

  const propertyRaw = (properties as any[]).find((p) => p._id === id);

  if (!propertyRaw) {
    if (fetchError) {
      // transient API failure, don't 404, let the client render the error UI
      return <PropertyDetails initialProperty={null} initialRelated={[]} fetchError={true} />
    } else {
      // fetch succeeded but record doesn't exist
      notFound();
    }
  }

  const extracted = extractPropertyData(propertyRaw);
  if (!extracted) {
    notFound();
  }

  const related = (properties as any[])
    .filter((p) => p._id !== id)
    .map(extractPropertyData)
    .filter(Boolean)
    .filter(
      (p) =>
        p.city === extracted.city ||
        p.propertyType === extracted.propertyType
    )
    .slice(0, 6);

  const metaDesc = stripHtml(extracted.description, 160) || (() => {
    const parts = [extracted.title, extracted.type, extracted.transactionType, extracted.city, extracted.location];
    const price = extracted.transaction?.price || extracted.transaction?.monthlyRent;
    if (price) parts.push(`PKR ${Number(price).toLocaleString()}`);
    parts.push("View details on Madadgaar.");
    return parts.filter(Boolean).join(" · ");
  })();

  const price = extracted.transaction?.price || extracted.transaction?.monthlyRent || 0;
  const propertyUrl = `${SITE_URL}/property/${extracted._id}`;
  
  const baseSchema = {
    "@type": "RealEstateListing",
    "name": extracted.title,
    "description": metaDesc,
    "url": propertyUrl,
    "datePosted": new Date().toISOString().slice(0, 10),
    "image": extracted.images?.[0] || `${SITE_URL}/Media/Group%2033.png`,
    "about": {
      "@type": extracted.propertyType === "Commercial" ? "Place" : "House",
      "numberOfRooms": extracted.bedrooms,
      "numberOfBathroomsTotal": extracted.bathrooms,
      "floorSize": extracted.areaSize
        ? { "@type": "QuantitativeValue", "value": extracted.areaSize, "unitText": extracted.areaUnit || "sqft" }
        : undefined,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": extracted.location || "",
        "addressLocality": extracted.city || "",
        "addressCountry": "PK",
      },
    }
  };
  
  const listingSchema = price > 0 ? {
    ...baseSchema,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PKR",
      "price": price,
      "availability": "https://schema.org/InStock",
      "url": propertyUrl,
    }
  } : baseSchema;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      listingSchema,
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Properties", "item": `${SITE_URL}/properties` },
          { "@type": "ListItem", "position": 3, "name": extracted.title }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PropertyDetails initialProperty={extracted} initialRelated={related} fetchError={fetchError} />
    </>
  );
}
