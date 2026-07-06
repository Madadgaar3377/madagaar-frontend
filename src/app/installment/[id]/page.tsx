import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "../../../lib/metadata";
import {
  fetchAllInstallments,
  fetchInstallmentById,
} from "../../../lib/api-server";
import { stripHtml } from "../../../lib/description";
import InstallmentOverview from "../../../views/clients/Installment/installmentoverview";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const installments = await fetchAllInstallments();
  return (installments as { _id?: string; installmentPlanId?: string }[])
    .map((i) => i._id || i.installmentPlanId)
    .filter(Boolean)
    .map((id) => ({ id: id! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const plan = (await fetchInstallmentById(id)) as Record<string, unknown> | null;
  if (!plan) {
    return buildPageMetadata({
      title: "Installment Plan Not Found",
      description: "This installment plan could not be found on Madadgaar.",
      path: `/installment/${id}`,
      noIndex: true,
    });
  }
  const name = String(plan.productName || "Installment Plan");
  const description = stripHtml(
    String(plan.description || `${name} — compare installment options on Madadgaar.`),
    155
  );
  const images = plan.productImages as string[] | undefined;
  return buildPageMetadata({
    title: `${name} | Madadgaar Installments`,
    description,
    path: `/installment/${id}`,
    ogImage: images?.[0],
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const plan = await fetchInstallmentById(id);
  if (!plan) notFound();
  return <InstallmentOverview initialPlan={plan} planId={id} />;
}
