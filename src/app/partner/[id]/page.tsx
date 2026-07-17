import type { Metadata } from "next";
import { buildPageMetadata } from "../../../lib/metadata";
import { backendBaseUrl } from "../../../constants/apiUrl";
import PartnerProfileClient from "./PartnerProfileClient";

type Props = { params: Promise<{ id: string }> };

const API = (backendBaseUrl || "").replace(/\/$/, "");

async function fetchPartnerMeta(id: string) {
  try {
    const res = await fetch(`${API}/public/partner/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const body = await res.json().catch(() => null);
    return body?.success ? body.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const partner = await fetchPartnerMeta(id);
  if (!partner) {
    return buildPageMetadata({
      title: "Partner Not Found",
      description: "This partner profile could not be found on Madadgaar.",
      path: `/partner/${id}`,
      noIndex: true,
    });
  }
  const company =
    partner.companyDetails?.RegisteredCompanyName || partner.name || "Partner";
  const types = (partner.offeredTypes || []).join(", ");
  return buildPageMetadata({
    title: `${company} | Madadgaar Partner`,
    description: `View products from ${company} on Madadgaar.${types ? ` Offers: ${types}.` : ""} Contact via WhatsApp or phone.`,
    path: `/partner/${id}`,
    ogImage: partner.profilePic || undefined,
  });
}

export default function Page() {
  return <PartnerProfileClient />;
}
