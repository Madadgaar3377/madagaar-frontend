import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import CareersPage from "../../views/clients/Careers/CareersPage";

export const metadata: Metadata = buildPageMetadata({
  title: "Careers & Job Opportunities at Madadgaar",
  description:
    "Explore career openings at Madadgaar across Pakistan. Join our growing team in engineering, sales, customer support, operations, and marketing.",
  path: "/careers",
});

export default function Page() {
  return <CareersPage />;
}
