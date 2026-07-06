import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import PropertiesPage from "../../views/clients/Properties/properties";

export const metadata: Metadata = buildPageMetadata({
  title: "Property Listings in Pakistan",
  description:
    "Browse verified property listings for sale and rent across Pakistan. Compare prices, locations, and amenities on Madadgaar.",
  path: "/properties",
});

export default function Page() {
  return <PropertiesPage />;
}
