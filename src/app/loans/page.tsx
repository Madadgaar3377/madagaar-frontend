import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import LoansPage from "../../views/clients/Loans/clientPageLoan";
import { backendBaseUrl } from "../../constants/apiUrl";
import { SITE_URL } from "../../lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Loans & Financing in Pakistan",
  description:
    "Compare personal, home, business, and Islamic loans from verified providers across Pakistan. Find the right financing on Madadgaar.",
  path: "/loans",
});

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Financial Services",
  "name": "Madadgaar Financing",
  "description": "Get the funds you need, faster and smarter. Compare top bank loans, personal loans, home loans, car loans, business loans, and online loan offers from verified financial providers across Pakistan.",
  "url": `${SITE_URL}/loans`,
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
    "description": "Free loan comparison and application services"
  }
};

export default async function Page() {
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "") || "";
  let loans = [];
  let fetchError = false;

  try {
    const res = await fetch(`${apiUrl}/getAllLoans`, { next: { revalidate: 300 } });
    const payload = await res.json();
    if (res.ok && payload?.success !== false) {
      loans = Array.isArray(payload?.data) ? payload.data : [];
    } else if (!res.ok) {
      fetchError = true;
    }
  } catch (err) {
    console.error("Fetch loans error (server):", err);
    fetchError = true;
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <LoansPage loans={loans} fetchError={fetchError} />
    </>
  );
}
