import type { Metadata } from "next";
import { buildPageMetadata } from "../lib/metadata";
import HomePage from "../views/clients/HomePages";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "Madadgaar Expert Partner - Property, Insurance, Loans & Installment Plans in Pakistan",
  description:
    "Pakistan's most trusted marketplace for property solutions, insurance support, loans, and flexible installment plans. Compare options across Pakistan.",
  path: "/",
});

export default function Page() {
  return <HomePage />;
}
