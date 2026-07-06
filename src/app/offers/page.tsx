import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import OffersPage from "../../views/clients/Offers";

export const metadata: Metadata = buildPageMetadata({
  title: "Special Offers",
  description: "Browse current offers and promotions on Madadgaar property, loans, installments, and insurance.",
  path: "/offers",
});

export default function Page() {
  return <OffersPage />;
}
