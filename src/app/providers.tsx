"use client";

import { HelmetProvider } from "react-helmet-async";
import ScrollToTop from "../components/ScrollToTop";
import LayoutWrapper from "../components/LayoutWrapper";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      <ScrollToTop />
      <LayoutWrapper>{children}</LayoutWrapper>
    </HelmetProvider>
  );
}
