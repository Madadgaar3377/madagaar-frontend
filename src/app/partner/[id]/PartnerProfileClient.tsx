"use client";

import dynamic from "next/dynamic";

/** Keep in sync with PartnerPublicProfile SkeletonPage */
function PartnerLoadingShell() {
  return (
    <div className="min-h-screen bg-[#f3f1ef]" aria-busy="true" aria-label="Loading partner">
      <div
        className="h-[42vh] min-h-[280px] animate-pulse"
        style={{ backgroundColor: "rgb(183, 36, 42)" }}
      />
      <div className="container-content -mt-8 space-y-4 pb-10">
        <div className="h-16 rounded-2xl bg-white/80 border border-gray-100 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-2xl bg-white border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const PartnerPublicProfile = dynamic(
  () => import("../../../views/clients/Partner/PartnerPublicProfile"),
  { ssr: false, loading: () => <PartnerLoadingShell /> }
);

export default function PartnerProfileClient() {
  return <PartnerPublicProfile />;
}
