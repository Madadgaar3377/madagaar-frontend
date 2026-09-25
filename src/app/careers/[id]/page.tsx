import type { Metadata } from "next";
import { buildPageMetadata } from "../../../lib/metadata";
import JobDetailsPage from "../../../views/clients/Careers/JobDetailsPage";

export const metadata: Metadata = buildPageMetadata({
  title: "Job Vacancy & Application | Madadgaar Careers",
  description:
    "View job requirements, perks, and apply directly for openings at Madadgaar Expert Partner.",
  path: "/careers",
});

export default function Page() {
  return <JobDetailsPage />;
}
