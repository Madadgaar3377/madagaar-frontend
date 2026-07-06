import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import Page from "../../views/clients/TermsAndConditions";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms and Conditions",
  description: "Terms and conditions for using Madadgaar Expert Partner services in Pakistan.",
  path: "/terms-and-conditions",
});

export default Page;
