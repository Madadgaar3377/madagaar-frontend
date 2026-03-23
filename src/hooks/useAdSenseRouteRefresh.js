import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useAdSenseRouteRefresh() {
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        // Ignore route refresh errors (ad blocker / no fill / duplicate push).
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);
}
