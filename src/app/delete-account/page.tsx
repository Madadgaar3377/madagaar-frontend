import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import Page from "../../views/clients/DeleteAccountRequest";

export const metadata: Metadata = buildPageMetadata({
  title: "Delete Account",
  description: "Request deletion of your Madadgaar account and associated data.",
  path: "/delete-account",
  noIndex: true,
});

export default Page;
