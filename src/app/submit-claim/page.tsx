import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import Page from "../../views/clients/Insurance/SubmitClaim";

export const metadata: Metadata = buildPageMetadata({
  title: "Submit Insurance Claim",
  description: "Submit an insurance claim request through Madadgaar's support platform.",
  path: "/submit-claim",
});

export default Page;
