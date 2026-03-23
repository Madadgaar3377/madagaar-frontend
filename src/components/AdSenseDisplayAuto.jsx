import React from "react";
import AdSenseSlot from "./AdSenseSlot";

/**
 * Responsive display ad (auto). Loader script is in public/index.html.
 */
export default function AdSenseDisplayAuto({ className = "" }) {
  return <AdSenseSlot slot="1030572956" className={className} lazy />;
}
