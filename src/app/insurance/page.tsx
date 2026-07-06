import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import { fetchInsurancePlans } from "../../lib/api-server";
import InsuranceInfo from "../../views/clients/Insurance/insurance";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "Insurance Plans in Pakistan",
  description:
    "Compare car, life, health, and travel insurance plans from trusted providers across Pakistan on Madadgaar.",
  path: "/insurance",
});

export default async function Page() {
  const initialPlans = await fetchInsurancePlans();
  return <InsuranceInfo initialPlans={initialPlans} />;
}
