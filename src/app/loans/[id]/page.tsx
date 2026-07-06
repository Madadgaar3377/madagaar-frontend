import type { Metadata } from "next";
import { buildPageMetadata } from "../../../lib/metadata";
import { fetchLoans, fetchLoanById } from "../../../lib/api-server";
import { stripHtml } from "../../../lib/description";
import LoanDetails from "../../../views/clients/Loans/LoanDeailtsById";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const loans = await fetchLoans();
  return (loans as { _id?: string }[])
    .filter((l) => l._id)
    .map((l) => ({ id: l._id! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const loan = (await fetchLoanById(id)) as Record<string, unknown> | null;
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
    String(loan.description || loan.shortDescription || `${name} — compare loan details on Madadgaar.`),
    155
  );
  return buildPageMetadata({
    title: `${name} | Madadgaar Loans`,
    description,
    path: `/loans/${id}`,
    ogImage: loan.image as string | undefined,
  });
}

export default function Page() {
  return <LoanDetails />;
}
