import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import { fetchInstallmentsPage } from "../../lib/api-server";
import InstallmentPlans from "../../views/clients/Installment/InstallementPage";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "Installment Plans in Pakistan",
  description:
    "Compare EMI and installment plans for electronics, appliances, and more across Pakistan. Flexible payment options on Madadgaar.",
  path: "/installments",
});

export default async function Page() {
  const { items, totalPages, total } = await fetchInstallmentsPage(1, 100);
  return (
    <InstallmentPlans
      initialPlans={items}
      initialPagination={{ page: 1, totalPages, total }}
    />
  );
}
