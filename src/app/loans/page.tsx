import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import { fetchLoans } from "../../lib/api-server";
import LoansPage from "../../views/clients/Loans/clientPageLoan";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "Loans & Financing in Pakistan",
  description:
    "Compare personal, home, business, and Islamic loans from verified providers across Pakistan. Find the right financing on Madadgaar.",
  path: "/loans",
});

export default async function Page() {
  const initialLoans = await fetchLoans();
  return <LoansPage initialLoans={initialLoans} />;
}
