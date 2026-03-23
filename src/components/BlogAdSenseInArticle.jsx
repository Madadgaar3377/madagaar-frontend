import React from "react";
import AdSenseSlot from "./AdSenseSlot";

/**
 * In-article fluid unit. Loader script is in public/index.html.
 */
export default function BlogAdSenseInArticle({ className = "" }) {
  return (
    <AdSenseSlot
      slot="1710764651"
      format="fluid"
      layout="in-article"
      textAlign="center"
      className={className}
      minHeightClass="min-h-[120px]"
      lazy
    />
  );
}
