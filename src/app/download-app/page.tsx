import type { Metadata } from "next";
import { buildPageMetadata } from "../../lib/metadata";
import DownloadAppPage from "../../views/clients/DownloadAppPage";

export const metadata: Metadata = buildPageMetadata({
  title: "Download Madadgaar App",
  description:
    "Download the Madadgaar mobile app for property, loans, installments, and insurance on Android.",
  path: "/download-app",
});

export default function Page() {
  return <DownloadAppPage />;
}
