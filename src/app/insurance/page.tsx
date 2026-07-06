import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import InsuranceInfo from "../../views/clients/Insurance/insurance";

export const metadata: Metadata = buildPageMetadata({
  title: "Insurance Plans in Pakistan",
  description:
    "Compare car, life, health, and travel insurance plans from trusted providers across Pakistan on Madadgaar.",
  path: "/insurance",
});

export default function Page() {
  return <InsuranceInfo />;
}
