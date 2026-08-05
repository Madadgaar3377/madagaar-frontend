"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/** Legacy /account/verify-otp → link-only /account/verify-email */
function RedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.toString();
    router.replace(q ? `/account/verify-email?${q}` : "/account/verify-email");
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
      <p className="text-slate-500 text-sm">Redirecting…</p>
    </div>
  );
}

export default function LegacyVerifyOtpRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
          <p className="text-slate-500 text-sm">Redirecting…</p>
        </div>
      }
    >
      <RedirectInner />
    </Suspense>
  );
}
