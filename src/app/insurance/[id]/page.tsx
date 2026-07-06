import type { Metadata } from "next";
import { buildPageMetadata } from "../../../lib/metadata";
import {
  fetchInsuranceById,
  fetchInsurancePlans,
} from "../../../lib/api-server";
import { stripHtml } from "../../../lib/description";
import InsurancePlanDetails from "../../../views/clients/Insurance/InsurancePlanDetails";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const plans = await fetchInsurancePlans();
  return (plans as { _id?: string }[])
    .filter((p) => p._id)
    .map((p) => ({ id: p._id! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const plan = (await fetchInsuranceById(id)) as Record<string, unknown> | null;
  if (!plan) {
    return buildPageMetadata({
      title: "Insurance Plan Not Found",
      description: "This insurance plan could not be found on Madadgaar.",
      path: `/insurance/${id}`,
      noIndex: true,
    });
  }
  const name = String(plan.planName || plan.name || "Insurance Plan");
  const description = stripHtml(
    String(plan.description || plan.summary || `${name} — compare insurance on Madadgaar.`),
    155
  );
  return buildPageMetadata({
    title: `${name} | Madadgaar Insurance`,
    description,
    path: `/insurance/${id}`,
  });
}

export default function Page() {
  return <InsurancePlanDetails />;
}
