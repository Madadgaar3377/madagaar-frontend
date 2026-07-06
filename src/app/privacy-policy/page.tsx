import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import Page from "../../views/clients/PrivacyPolicy";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "Privacy policy and data protection practices for Madadgaar Expert Partner.",
  path: "/privacy-policy",
});

export default Page;
