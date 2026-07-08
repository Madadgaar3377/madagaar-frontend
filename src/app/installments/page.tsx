import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import InstallmentPlans from "../../views/clients/Installment/InstallementPage";
import { backendBaseUrl } from "../../constants/apiUrl";
import { SITE_URL } from "../../lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Installment Plans in Pakistan",
  description:
    "Compare EMI and installment plans for electronics, appliances, and more across Pakistan. Flexible payment options on Madadgaar.",
  path: "/installments",
});

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Installment Plans & EMI Services",
  "name": "Madadgaar Installment Plans",
  "description": "Big dreams? Pay small, with flexible plans that fit your budget. Compare EMI plans, interest rates, and tenure options for electronics, home appliances, furniture, machinery, and consumer goods.",
  "url": `${SITE_URL}/installments`,
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
    "description": "Free installment plan comparison and application services"
  }
};

export default async function Page() {
  const apiUrl = (backendBaseUrl || "").replace(/\/\$/, "") || "";
  let plans = [];
  let apiTotalPages = 1;
  let apiTotalCount = 0;
  let fetchError = false;

  try {
    const res = await fetch(`${apiUrl}/getAllInstallments?page=1&limit=100`, { next: { revalidate: 300 } });
    const payload = await res.json();
    if (res.ok && payload?.success !== false) {
      const data = payload?.data ?? payload ?? [];
      const extractedPlans = Array.isArray(data)
        ? data
        : (data?.plans || data?.installments || payload?.plans || payload?.installments || []);
      const extractedPagination = payload?.pagination || data?.pagination || null;
      plans = Array.isArray(extractedPlans) ? extractedPlans : [];
      apiTotalPages = Number(extractedPagination?.totalPages || 1);
      apiTotalCount = Number(extractedPagination?.total || 0);
    } else {
      fetchError = true;
    }
  } catch (err) {
    console.error("Fetch installments error (server):", err);
    fetchError = true;
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <InstallmentPlans 
        initialPlans={plans} 
        initialApiTotalPages={apiTotalPages} 
        initialApiTotalCount={apiTotalCount} 
        fetchError={fetchError} 
      />
    </>
  );
}