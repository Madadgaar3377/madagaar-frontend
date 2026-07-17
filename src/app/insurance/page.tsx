import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import InsuranceInfo from "../../views/clients/Insurance/insurance";
import { backendBaseUrl } from "../../constants/apiUrl";
import { SITE_URL } from "../../lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Insurance Plans in Pakistan",
  description:
    "Compare car, life, health, and travel insurance plans from trusted providers across Pakistan on Madadgaar.",
  path: "/insurance",
});

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Insurance Services",
  "name": "Madadgaar Insurance Support",
  "description": "Claim with confidencePakistan's most trusted insurance support. Compare life insurance, health insurance, motor insurance, travel insurance, property insurance, and Takaful plans, along with fast and transparent claim support.",
  "url": `${SITE_URL}/insurance`,
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
    "description": "Free insurance comparison and claim support services"
  }
};

export default async function Page() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "") || "";
  let plans = [];
  let fetchError = false;

  try {
    const res = await fetch(`${apiUrl}/getAllInsurancePlansPublic?limit=1000`, { next: { revalidate: 300 } });
    const payload = await res.json();
    if (res.ok && payload?.success !== false) {
      const data = payload?.data || [];
      plans = Array.isArray(data) ? data : [];
    } else if (!res.ok) {
      fetchError = true;
    }
  } catch (err) {
    console.error("Fetch insurance error (server):", err);
    fetchError = true;
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <InsuranceInfo initialPlans={plans} fetchError={fetchError} />
    </>
  );
}