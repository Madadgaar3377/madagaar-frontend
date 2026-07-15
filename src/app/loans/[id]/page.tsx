import type { Metadata } from "next";
import { buildPageMetadata } from "../../../lib/metadata";
import { fetchLoans } from "../../../lib/api-server";
import { stripHtml } from "../../../lib/description";
import LoanDetails from "../../../views/clients/Loans/LoanDeailtsById";
import { notFound } from "next/navigation";
import { backendBaseUrl } from "../../../constants/apiUrl";
import { SITE_URL } from "../../../lib/site";

type Props = { params: Promise<{ id: string }> };

const extractPlainText = (html: string) => {
  if (!html) return "";
  return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

export async function generateStaticParams() {
  const loans = await fetchLoans();
  return (loans as { _id?: string }[])
    .filter((l) => l._id)
    .map((l) => ({ id: l._id! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const loans = await fetchLoans();
  const loan = (loans as any[]).find(l => 
    l._id === id || l.planId === id || l._id?.toString() === id || l.planId?.toString() === id
  );

  if (!loan) {
    return buildPageMetadata({
      title: "Loan Not Found",
      description: "This loan product could not be found on Madadgaar.",
      path: `/loans/${id}`,
      noIndex: true,
    });
  }
  const name = String(loan.loanName || loan.name || loan.productName || "Loan");
  const description = stripHtml(
    String(loan.description || loan.shortDescription || `${name}  compare loan details on Madadgaar.`),
    155
  );
  return buildPageMetadata({
    title: `${name} | Madadgaar Loans`,
    description,
    path: `/loans/${id}`,
    ogImage: loan.image as string | undefined,
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
  let loans = [];
  let fetchError = false;

  try {
    const res = await fetch(`${apiUrl}/getAllLoans`, { 
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" }
    });
    const payload = await res.json();
    if (res.ok && payload?.success !== false) {
      loans = payload?.data || [];
    } else {
      fetchError = true;
    }
  } catch (err) {
    console.error("Fetch loan details error (server):", err);
    fetchError = true;
  }

  const plan = (loans as any[]).find(loan => 
    loan._id === id || loan.planId === id || loan._id?.toString() === id || loan.planId?.toString() === id
  );

  if (!plan) {
    if (fetchError) {
      return <LoanDetails initialPlan={null} fetchError={true} />;
    } else {
      notFound();
    }
  }

  const loanUrl = `${SITE_URL}/loans/${id}`;
  
  const baseSchema = {
    "@type": "LoanOrCredit",
    "@id": loanUrl,
    "url": loanUrl,
    "name": plan.productName || plan.loanName || "Loan",
    "description": extractPlainText(plan.description) || `${plan.productName || "Loan"} from ${plan.bankName || "verified provider"}.`,
    "provider": plan.bankName
      ? { "@type": "FinancialService", "name": plan.bankName }
      : undefined,
    "areaServed": { "@type": "Country", "name": "Pakistan" },
  };

  const amountSchema = plan.minFinancingAmount || plan.maxFinancingAmount ? {
    "amount": {
      "@type": "MonetaryAmount",
      "currency": "PKR",
      "minValue": plan.minFinancingAmount || undefined,
      "maxValue": plan.maxFinancingAmount || undefined,
    }
  } : {};

  const rateSchema = plan.indicativeRate ? {
    "interestRate": { "@type": "QuantitativeValue", "value": plan.indicativeRate, "unitText": "PERCENT" }
  } : {};

  const termSchema = plan.minTenure || plan.maxTenure ? {
    "loanTerm": {
      "@type": "QuantitativeValue",
      "minValue": plan.minTenure,
      "maxValue": plan.maxTenure,
      "unitText": plan.tenureUnit || "ANN",
    }
  } : {};

  const loanSchema = {
    ...baseSchema,
    ...amountSchema,
    ...rateSchema,
    ...termSchema
  };

  const loanStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      loanSchema,
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Loans", "item": `${SITE_URL}/loans` },
          { "@type": "ListItem", "position": 3, "name": plan.productName || "Loan" },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(loanStructuredData) }} />
      <LoanDetails initialPlan={plan} fetchError={false} />
    </>
  );
}
