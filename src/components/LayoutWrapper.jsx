"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Navbar from "../compontents/Navbar";
import Footer from "../compontents/Footer";
import WhatsAppButton from "./WhatsAppButton";
import AppDownloadBanner from "./AppDownloadBanner";
import useAdSenseRouteRefresh from "../hooks/useAdSenseRouteRefresh";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname() || "";
  useAdSenseRouteRefresh();

  const isPartnerPublic = pathname.startsWith("/partner/");

  const hideLayout =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/dashboard/Installments/create") ||
    pathname.startsWith("/dashboard/Installments/update") ||
    pathname.startsWith("/dashboard/*") ||
    pathname.startsWith("/client/dashboard") ||
    pathname.startsWith("/client/loans") ||
    pathname.startsWith("/client/insurance") ||
    pathname.startsWith("/partner/");

  // Partner storefront: show main site Navbar only (not footer / app banner / WhatsApp widget)
  const showNavbar = !hideLayout || isPartnerPublic;
  const showExtraChrome = !hideLayout && !isPartnerPublic;
  const useNavbarOffset = showNavbar;

  return (
    <>
      {showNavbar && <Navbar />}

      <main
        className={
          useNavbarOffset
            ? "min-h-screen w-full max-w-[100vw] pt-[5.25rem] sm:pt-[5.5rem] overflow-x-hidden"
            : "w-full max-w-[100vw] overflow-x-hidden"
        }
      >
        <div key={pathname} className="route-transition-enter w-full max-w-full">
          {children}
        </div>
      </main>

      {showExtraChrome && <Footer />}
      {showExtraChrome && <AppDownloadBanner />}
      {showExtraChrome && <WhatsAppButton />}

      <Toaster
        position="top-center"
        gutter={12}
        toastOptions={{
          duration: 4000,
          style: {
            maxWidth: "min(100vw - 2rem, 28rem)",
          },
        }}
        containerStyle={{
          zIndex: 2147483000,
          top: useNavbarOffset
            ? "max(5.75rem, calc(5.25rem + env(safe-area-inset-top, 0px)))"
            : "max(1rem, env(safe-area-inset-top, 0px))",
        }}
        containerClassName="madadgaar-hot-toast"
      />
    </>
  );
}
