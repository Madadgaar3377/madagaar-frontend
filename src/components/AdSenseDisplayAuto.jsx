import React, { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-6076284388585235";
const AD_SLOT = "1030572956";

/**
 * Responsive display ad (auto). Loader script is in public/index.html.
 */
export default function AdSenseDisplayAuto({ className = "" }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense:", err);
    }
  }, []);

  return (
    <div className={className ? className : undefined}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
