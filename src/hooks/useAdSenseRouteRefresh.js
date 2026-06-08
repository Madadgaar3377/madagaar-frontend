"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function useAdSenseRouteRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    // We intentionally do not call adsbygoogle.push({}) here on every route change.
    // In a Single Page Application (SPA), calling push({}) without a corresponding
    // <ins> element in the DOM causes TagError: "All 'ins' elements in the DOM
    // with class=adsbygoogle already have ads in them."
    //
    // AdSense ads are managed individually by the AdSenseSlot component, which
    // ensures push({}) is only called once per slot when it becomes visible.
  }, [pathname]);
}
