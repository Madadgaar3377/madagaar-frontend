import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import ContactPage from "../../views/clients/Contact/ContactForm";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Madadgaar",
  description:
    "Get in touch with Madadgaar for property, loan, installment, and insurance support across Pakistan.",
  path: "/contact",
});

export default function Page() {
  return <ContactPage />;
}
