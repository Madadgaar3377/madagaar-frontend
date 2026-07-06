import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import LoansPage from "../../views/clients/Loans/clientPageLoan";

export const metadata: Metadata = buildPageMetadata({
  title: "Loans & Financing in Pakistan",
  description:
    "Compare personal, home, business, and Islamic loans from verified providers across Pakistan. Find the right financing on Madadgaar.",
  path: "/loans",
});

export default function Page() {
  return <LoansPage />;
}
