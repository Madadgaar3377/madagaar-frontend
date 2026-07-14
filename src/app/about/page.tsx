import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import AboutPage from "../../views/clients/About";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "About Madadgaar",
  description:
    "Learn about Madadgaar Expert Partner  Pakistan's trusted marketplace for property, loans, installments, and insurance.",
  path: "/about",
});

export default function Page() {
  return <AboutPage />;
}
