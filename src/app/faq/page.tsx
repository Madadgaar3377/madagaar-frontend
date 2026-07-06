import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import FAQPage from "../../views/clients/FAQ";

export const metadata: Metadata = buildPageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about Madadgaar property, loans, installments, and insurance services in Pakistan.",
  path: "/faq",
});

export default function Page() {
  return <FAQPage />;
}
