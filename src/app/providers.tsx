"use client";

import ScrollToTop from "../components/ScrollToTop";
import LayoutWrapper from "../components/LayoutWrapper";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <LayoutWrapper>{children}</LayoutWrapper>
    </>
  );
}
