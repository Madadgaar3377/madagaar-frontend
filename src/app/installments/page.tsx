import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import InstallmentPlans from "../../views/clients/Installment/InstallementPage";

export const metadata: Metadata = buildPageMetadata({
  title: "Installment Plans in Pakistan",
  description:
    "Compare EMI and installment plans for electronics, appliances, and more across Pakistan. Flexible payment options on Madadgaar.",
  path: "/installments",
});

export default function Page() {
  return <InstallmentPlans />;
}
