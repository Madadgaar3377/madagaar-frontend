import type { Metadata } from "next";
import { buildPageMetadata } from "../../../lib/metadata";
import {
  fetchProperties,
  fetchPropertyById,
} from "../../../lib/api-server";
import { sanitizePublicDescription, stripHtml } from "../../../lib/description";
import PropertyDetails from "../../../views/clients/Properties/PropertyDetails";

type Props = { params: Promise<{ id: string }> };

function extractTitle(property: Record<string, unknown>): string {
  if (property.type === "Individual") {
    const ind = property.individualProperty as Record<string, unknown> | undefined;
    return String(ind?.title || "Property");
  }
  if (property.type === "Project") {
    const proj = property.project as Record<string, unknown> | undefined;
    return String(proj?.projectName || "Property");
  }
  return "Property";
}

function extractDescription(property: Record<string, unknown>): string {
  let raw = "";
  if (property.type === "Individual") {
    const ind = property.individualProperty as Record<string, unknown> | undefined;
    raw = String(ind?.description || "");
  } else if (property.type === "Project") {
    const proj = property.project as Record<string, unknown> | undefined;
    raw = String(proj?.description || "");
  }
  return stripHtml(sanitizePublicDescription(raw), 155);
}

export async function generateStaticParams() {
  const properties = await fetchProperties();
  return (properties as { _id?: string }[])
    .filter((p) => p._id)
    .map((p) => ({ id: p._id! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = (await fetchPropertyById(id)) as Record<string, unknown> | null;
  if (!property) {
    return buildPageMetadata({
      title: "Property Not Found",
      description: "This property listing could not be found on Madadgaar.",
      path: `/property/${id}`,
      noIndex: true,
    });
  }
  const title = extractTitle(property);
  const description = extractDescription(property);
  const images =
    property.type === "Individual"
      ? ((property.individualProperty as Record<string, unknown>)?.images as string[] | undefined)
      : ((property.project as Record<string, unknown>)?.images as string[] | undefined);

  return buildPageMetadata({
    title: `${title} | Madadgaar Properties`,
    description,
    path: `/property/${id}`,
    ogImage: images?.[0],
  });
}

export default function Page() {
  return <PropertyDetails />;
}
