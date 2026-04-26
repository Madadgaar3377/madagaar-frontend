import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useAdSenseRouteRefresh() {
  const location = useLocation();

  useEffect(() => {
    // We intentionally do not call adsbygoogle.push({}) here on every route change.
    // In a Single Page Application (SPA), calling push({}) without a corresponding
    // <ins> element in the DOM causes TagError: "All 'ins' elements in the DOM 
    // with class=adsbygoogle already have ads in them."
    // 
    // AdSense ads are managed individually by the AdSenseSlot component, which
    // ensures push({}) is only called once per slot when it becomes visible.
  }, [location.pathname, location.search]);
}
